import { redis } from "../redis/redis.ts";
import { Embed } from '../utils/Embed.ts';
import { configs } from '../../configs.ts';

import {format} from 'https://cdn.skypack.dev/date-fns';


const launchLibraryUrl = "https://ll.thespacedevs.com/2.2.0";
export class LaunchLibrary {
    static async get(path: string){
        const cachedData = await redis.get(path);
        if(cachedData !== undefined){
            console.log('From cache')
            return JSON.parse(cachedData);
        }
        else{
            const response = await fetch(launchLibraryUrl + path);
            const body = await response.json();
            body.retrivalDate = new Date();
            redis.setex(path, configs.launchLibrary.cacheTime, JSON.stringify(body));
            return body;
        }
    }
    static async nextLaunch(): Promise<Embed>{
        const response = await this.get('/launch/upcoming');
        const goLaunches = response.results.filter((launch:any) => launch.status.id == 1);
        if(goLaunches !== undefined){
            const latestLaunch = await this.get(`/launch/${goLaunches[0].id}`);
            const launchDate = new Date(latestLaunch.net);
            const line = [
                `🚀 ${latestLaunch.name}`,
                `📍 [${latestLaunch.pad.name}, ${latestLaunch.pad.location.name}](${latestLaunch.pad.wiki_url})`,
                `🕒 [${format(launchDate, "cccccc', 'LLL' ' d ', ' H':'mm 'UTC'")}](https://www.inyourowntime.zone/${format(launchDate, "yyyy'-'LL'-'dd'_'HH'.'mm'_UTC'")})`
            ]
            return new Embed()
                .setTitle("Next Launch")
                .setDescription('**'+line[0] + '\n' + line[1] + '\n' + line[2]+"**")
            
        }
        else{
            return new Embed()
                .setTitle("Next Launch")
                .setDescription("No Go Launches at this time")
        }
    }


}
