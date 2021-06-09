import {
    
  } from "../../deps.ts";
import { 
    createCommand,
    createInteractionDatabaseButtonPagination
} from "../utils/helpers.ts";
import { LaunchLibrary } from "../launchLibrary/launch_library.ts"

createCommand({
  name: `nextevent`,
  aliases: ['ne'],
  description: "Gets Next Event",
  botChannelPermissions: ["SEND_MESSAGES"],
  slash: {
      enabled: true,
      guild: true,
        async execute(data, member){
        if(!member){return;}
        return await createInteractionDatabaseButtonPagination(data, member, LaunchLibrary.nextEventMax, LaunchLibrary.nextEvent)
      }
  },
  execute: async function (message) {
    const returnedEmbed = await LaunchLibrary.nextLaunch();
    return message.reply({embed: returnedEmbed });
  },
});
