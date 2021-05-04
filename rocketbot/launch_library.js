const axios = require('axios');
const redis_client = require('./redis_client');
const serialize = require('serialize-javascript');
const {Embed} = require('./discord');
const {DateTime, Duration}=require('luxon');
const config = require('../config');


function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
  }

class LaunchLibrary{
    constructor(url){
        this.url = url
    }
    /**
     * Gets an api path with caching
     * @param {string} path API Path to get 
     * @returns 
     */
    async get(path){
        try{
            var cached_data = await redis_client.getAsync(path);
            //if(cached_data.error) throw cached_data.error;
            if(cached_data){
                return deserialize(cached_data);
            }
            else{
                const response = await axios.get(this.url + path);
                response.data.retrivalDate = DateTime.utc();
                redis_client.setex(path, 600 /*10 min cache time*/, serialize(response.data));
                return response.data;
            }
        }
        catch(e){
            throw new Error(e);
        }
    }
    /**
     * Helper Function to cache the embed as well
     */
    async getLaunches(){
        try{
            /*
            var cached_data = await redis_client.getAsync('getLaunches');
            if(cached_data){
                return deserialize(cached_data);
            }
            else{*/ //Caching doesn't work for this because of the way we are using classes. Serilzation doesn't preserve classes, so I need to find a workaround. We are still caching requests to the API, just not the processing of data into a embed
                var response = await this.get('/launch/upcoming/');
                let returnValue = new Embed({
                    title: "Next 10 Launches",
                    fields: [],
                    footer: {
                        text: "Retrived from thespacedevs.com at " + response.retrivalDate.toFormat("H':'mm 'UTC'")
                    }
                })
                response.results.forEach((data)=>{
                    let launchReturn = {
                        name: data.name,
                        value: data.pad.name + ", " +  data.pad.location.name + "\n" + data.status.name + " - "
                    }
                    returnValue.appendFields(launchReturn);
                });
                redis_client.setex('getLaunches', 600, serialize(returnValue));
                return returnValue;
            }
        //}
        catch(e){
            throw new Error(e);
        }
    }
    async getNextLaunch(){
        /*
        var cached_data = await redis_client.getAsync('getNextLaunch');
        if(cached_data){
            return deserialize(cached_data);
        }
        else{*/ //FIX LATER - Caching doesn't work for this because of the way we are using classes. Serilzation doesn't preserve classes, so I need to find a workaround
            var returnValue = new Embed({
                title: "Next Launch"
            });
            let response = await this.get('/launch/upcoming/');
            let goLaunches = response.results.filter(launch => launch.status.id == 1);
            goLaunches = await this.get(`/launch/${goLaunches[0].id}`);
            if(goLaunches){
                let latestLaunch =  goLaunches;
                let launchDate = DateTime.fromISO(latestLaunch.net, {zone: 'utc'});
                let line = [
                    `🚀 ${latestLaunch.name}`,
                    `📍 [${latestLaunch.pad.name}, ${latestLaunch.pad.location.name}](${latestLaunch.pad.wiki_url})`,
                    `🕒 [${launchDate.toFormat("ccc',' MMMM' ' d ', ' H':'mm 'UTC'")}](https://www.inyourowntime.zone/${launchDate.toFormat("yyyy'-'LL'-'dd'_'HH'.'mm'_UTC'")})`
                ]
                //returnValue.setDescription(`🚀 ${latestLaunch.name}\n📍 [${latestLaunch.pad.name}, ${latestLaunch.pad.location.name}](${latestLaunch.pad.wiki_url})\n🕒 ${launchDate.toFormat("ccc',' MMMM' ' d ', ' H':'mm 'UTC'")}`);
                returnValue.setFooter({text: "Retrived from thespacedevs.com at " + DateTime.fromISO(response.retrivalDate).toFormat("H':'mm 'UTC'")});
                returnValue.setMetadata({date: launchDate});
                if(latestLaunch.rocket.launcher_stage[0].launcher.serial_number){
                    line[0] = line[0] + ` | ${latestLaunch.rocket.launcher_stage[0].launcher.serial_number}`
                }
                if(latestLaunch.probability){
                    var weatherEmoji;
                    if(latestLaunch.probability <= 30){
                        weatherEmoji = config.PGO_emojis[30];
                    }
                    if(latestLaunch.probability >= 90){
                        weatherEmoji = config.PGO_emojis[90];
                    }
                    else{
                        weatherEmoji = config.PGO_emojis[latestLaunch.probability];
                    }
                    line[2] = line[2] + ` | PGO: ${latestLaunch.probability}% ${weatherEmoji} `;
                }
                if(latestLaunch.vidURLs){
                    line[2] = line[2] + `| [Webcast](${latestLaunch.vidURLs[0].url})`;
                }
                returnValue.setDescription(line[0] + '\n' + line[1] + '\n' + line[2]);
                returnValue.setDescriptionBold();
            }
            else{
                returnValue.setDescription("No Go Launches at this time");
                returnValue.setFooter({text: "Retrived from thespacedevs.com at " + DateTime.fromISO(response.retrivalDate).toFormat("H':'mm 'UTC'")})
            } 
            redis_client.setex('getNextLaunch', 600, serialize(returnValue));
            return returnValue;
        //}
    }
    
}


module.exports = {
    LaunchLibrary
}