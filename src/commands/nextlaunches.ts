import {
    DiscordInteractionResponseTypes,
    sendInteractionResponse,
    snowflakeToBigint,
  } from "../../deps.ts";
import { createCommand } from "../utils/helpers.ts";
import { LaunchLibrary } from "../launchLibrary/launch_library.ts"

createCommand({
  name: `nextlaunches`,
  aliases: ['ll'],
  description: "Lists next Launches",
  botChannelPermissions: ["SEND_MESSAGES"],
  slash: {
      enabled: true,
      guild: true,
      async execute(data){
        const returnedEmbed = await LaunchLibrary.nextLaunches();
          return sendInteractionResponse(
              snowflakeToBigint(data.id),
              data.token,
              {
                  private: false,
                  type: DiscordInteractionResponseTypes.ChannelMessageWithSource,
                  data: {
                      embeds: [
                          returnedEmbed
                      ]
                  }
              }
          )
      }
  },
  execute: async function (message) {
    const returnedEmbed = await LaunchLibrary.nextLaunches();
    return message.reply({embed: returnedEmbed });
  },
});
