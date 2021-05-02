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
    async get(path){
        try{
            var cached_data = await redis_client.getAsync(path);
            //if(cached_data.error) throw cached_data.error;
            if(cached_data){
                return deserialize(cached_data);
            }
            else{
                const response = await axios.get(this.url + path);
                //let decycled = util.inspect(response.data);
                redis_client.setex(path, 600 /*10 min cache time*/, serialize(response.data));
                return response.data;
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