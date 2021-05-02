const axios = require('axios');
const redis_client = require('./redis_client');
const serialize = require('serialize-javascript');

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
                let returnValue = {
                    embed: {
                        title: "Next 10 Launches",
                        fields: [],
                        footer: {
                            text: "Retrived from thespacedevs.com at " + response.retrivalDate.toLocaleString('en-us', {timeZone: 'UTC', hour12: false ,hour: "numeric", minute: "numeric"}) + " UTC"
                        }
                    }
                };
                response.results.forEach((data)=>{
                    let launchReturn = {
                        name: data.name,
                        value: data.pad.name + ", " +  data.pad.location.name + "\n" + data.status.name + " - "
                    }
                    returnValue.embed.fields.push(launchReturn);
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
                let response = await this.get('/launch/upcoming/');
                let latestLaunch =  response.results[0];
                let date = new Date(latestLaunch.net)
                let returnValue = {
                    embed: {
                        title: "Next Launch:",
                        description: "🚀 " + latestLaunch.name + "\n📍 " + latestLaunch.pad.name + ", " + latestLaunch.pad.location.name + "\n🕒  " + date.toLocaleString('en-us', {timeZone: 'UTC', month: 'long', day: 'numeric', weekday: "long", hour: "numeric", minute: "numeric"}),
                        footer: {
                            text: "Retrived from thespacedevs.com at " + response.retrivalDate.toLocaleString('en-us', {timeZone: 'UTC', hour12: false ,hour: "numeric", minute: "numeric"}) + " UTC";
                        }
                    }
                };
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