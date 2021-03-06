import { redis } from "../redis/redis.ts";
import { Embed } from '../utils/Embed.ts';
import { configs } from '../../configs.ts';
import {pgoEmojis} from '../utils/constants/PGO_emojis.ts';
import launchType from './types/launch.ts';
import {DateTime} from '../../deps.ts';
import {status_emojis} from '../utils/constants/status_emojis.ts';

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
            body.retrivalDate = DateTime.utc().toISO();
            redis.setex(path, configs.launchLibrary.cacheTime, JSON.stringify(body));
            return body;
        }
    }
    static async getLaunch(id: string): Promise<launchType>{
        const res = await this.get(`/launch/${id}/`);
        return res;
    }
    static async nextLaunch(): Promise<Embed>{
        const response = await this.get('/launch/upcoming');
        const goLaunches = response.results.filter((launch:any) => launch.status.id == 1);
        if(goLaunches !== undefined){
            const latestLaunch = await this.getLaunch(goLaunches[0].id);
            const launchDate = DateTime.fromISO(latestLaunch.net, {zone: 'utc'});
            const difference = launchDate.diffNow().toFormat("'In 'd' days, ' h ' hours, and ' m ' minutes.' ");
            const line = [
                `🚀 ${latestLaunch.name}`,
                `📍 [${latestLaunch.pad.name}, ${latestLaunch.pad.location.name}](${latestLaunch.pad.wiki_url})`,
                `🕒 [${launchDate.toFormat("ccc',' MMMM' ' d ', ' H':'mm 'UTC'")}](https://dateful.com/eventlink/e/?iso=${launchDate.toISO()}&title=${encodeURI(latestLaunch.name)})`,
                ``,
                `${difference}`
            ]
            if(latestLaunch.rocket.launcher_stage[0]?.launcher?.serial_number !== undefined){ //Check for booster serial number (SpaceX only)
                line[0] += ` | ${latestLaunch.rocket.launcher_stage[0].launcher.serial_number}`
            }
            if(latestLaunch.probability !== undefined && latestLaunch.probability !== null && latestLaunch.probability >= 0){
                var emoji: string;
                if(latestLaunch.probability <= 30){
                    emoji = pgoEmojis[30];
                }
                else if(latestLaunch.probability >= 90){
                    emoji = pgoEmojis[90];
                }
                else{
                    emoji = pgoEmojis[latestLaunch.probability];
                }
                line[2] += ` | PGO: ${latestLaunch.probability}% ${emoji}`;
            }
            if(latestLaunch.vidURLs[0] !== undefined && latestLaunch.vidURLs[0] !== null){
                line[2] += ` | [Webcast](${latestLaunch.vidURLs[0].url})`;
            }

            return new Embed()
                .setTitle("Next Launch")
                .setDescription('**'+line[0] + '\n' + line[1] + '\n' + line[2]+ '\n' + line[3] + '\n' + line[4] +"**")
                .setFooter(`Retrived from thespacedevs.com at ${DateTime.fromISO(response.retrivalDate, {setZone: true}).toFormat("H':'mm 'UTC'")}`)
            
        }
        else{
            return new Embed()
                .setTitle("Next Launch")
                .setDescription("No Go Launches at this time")
                .setFooter(`Retrived from thespacedevs.com at ${DateTime.fromISO(response.retrivalDate, {setZone: true}).toFormat("H':'mm 'UTC'")}`)
        }
    }
    static async nextLaunches(): Promise<Embed>{
        const response = await this.get('/launch/upcoming');
        const returnEmbed = new Embed()
            .setTitle("Next 10 Launches:")
            .setFooter(`Retrived from thespacedevs.com at ${DateTime.fromISO(response.retrivalDate, {setZone: true}).toFormat("H':'mm 'UTC'")}`)
        response.results.forEach((data:any)=>{
            var goEmoji= status_emojis[data.status.id];
            returnEmbed.addField(
                `${goEmoji} ${data.name}`,
                `${data.pad.name}, ${data.pad.location.name} \n${data.status.name}`
            )
        })
        return returnEmbed;
    }

    static async nextEvent(index = 0, totalCount?: number): Promise<Embed>{
        const response = await LaunchLibrary.get('/event/upcoming');
        const event = response.results[index-1];
        const returnEmbed = new Embed()
        if(index == 1){
            returnEmbed.setTitle("Next Event");
        }
        else{
            returnEmbed.setTitle(`Next Event (${index}/${totalCount})`);
        }
        const eventDate = DateTime.fromISO(event.date, {zone: 'utc'});
        const difference = eventDate.diffNow().toFormat("'In 'd' days, ' h ' hours, and ' m ' minutes.' ");
        const line = [
            `${event.name}`,
            `ℹ️ `,
            `🕒 [${eventDate.toFormat("ccc',' MMMM' ' d ', ' H':'mm 'UTC'")}](https://dateful.com/eventlink/e/?iso=${eventDate.toISO()}&title=${encodeURI(event.name)})`,
            ``,
            `${difference}`
        ]
        if(event.news_url !== undefined && event.news_url !== null){
            line[1] += `[News](${event.news_url}) `
        }
        if(event.video_url !== undefined && event.video_url !== null){
            if(line[1].length > 1){
                line[1] += `| [Video](${event.video_url}) `
            }
            else{
                line[1] += `[Video](${event.video_url}) `
            }
        }
        
        if(event.feature_image !== undefined && event.feature_image !== null){
            returnEmbed.setThumbnail(event.feature_image);
        }
        returnEmbed.setDescription('**'+line[0] + '\n' + line[1] + '\n' + line[2]+ '\n' + line[3] + '\n' + line[4] +"**")
        return returnEmbed;
    
    }
    static async nextEventMax(){
        const response = await LaunchLibrary.get('/event/upcoming');
        return response.results.length;

    }

}
