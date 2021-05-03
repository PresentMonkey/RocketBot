const axios = require('axios');
const redis_client = require('./redis_client');
const serialize = require('serialize-javascript');
const {Embed} = require('./discord');

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
                let date = response.headers.date;
                response.data.retrivalDate = new Date(date);
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
            var cached_data = await redis_client.getAsync('getLaunches');
            if(cached_data){
                return deserialize(cached_data);
            }
            else{
                var response = await this.get('/launch/upcoming/');
                let returnValue = new Embed({
                    title: "Next 10 Launches",
                    fields: [],
                    footer: {
                        text: "Retrived from thespacedevs.com at " + response.retrivalDate.toLocaleString('en-us', {timeZone: 'UTC', hour12: false ,hour: "numeric", minute: "numeric"}) + " UTC"
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
        }
        catch(e){
            throw new Error(e);
        }
    }
    async getNextLaunch(){
        try{
            var cached_data = await redis_client.getAsync('getNextLaunch');
            if(cached_data){
                return deserialize(cached_data);
            }
            else{
                var returnValue;
                let response = await this.get('/launch/upcoming/');
                let goLaunches = response.results.filter(launch => launch.status.id == 1);
                if(goLaunches){
                    let latestLaunch =  goLaunches[0];
                    let date = new Date(latestLaunch.net)
                    let returnValue = new Embed({
                        title: "Next Launch",
                        description: `🚀 ${latestLaunch.name}\n📍 [${latestLaunch.pad.name}, ${latestLaunch.pad.location.name}](${latestLaunch.pad.wiki_url})\n🕒 ${date.toLocaleString('en-us', {timeZone: 'UTC', month: 'long', day: 'numeric', weekday: "short", hour12: false, hour: "numeric", minute: "numeric"})} UTC`,
                        footer: {
                            text: "Retrived from thespacedevs.com at " + response.retrivalDate.toLocaleString('en-us', {timeZone: 'UTC', hour12: false ,hour: "numeric", minute: "numeric"}) + " UTC"
                        }
                    })
                    if(latestLaunch.probability){
                        returnValue.appendDescription(` | POG: ${latestLaunch.probability}`);
                    }
                    if(latestLaunch.vidURLs){
                        returnValue.appendDescription(`| [Webcast](${latestLaunch.vidURLs[0]}`)
                    }
                    returnValue.setDescriptionBold();
                    return returnValue;
                }
                else{
                    returnValue = new Embed({
                        title: 'Next Launch',
                        description: "No Go Launches at this time",
                        footer: {
                            text: "Retrived from thespacedevs.com at " + response.retrivalDate.toLocaleString('en-us', {timeZone: 'UTC', hour12: false ,hour: "numeric", minute: "numeric"}) + " UTC"
                        }
                    })
                } 
                redis_client.setex('getNextLaunch', 600, serialize(returnValue));
                return returnValue;
            }
        }
        catch(e){
            throw new Error(e);
        }
    }
}


module.exports = {
    LaunchLibrary
}