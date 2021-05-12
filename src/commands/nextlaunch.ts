import {
    avatarURL,
    DiscordApplicationCommandOptionTypes,
    DiscordInteractionResponseTypes,
    sendInteractionResponse,
    snowflakeToBigint,
  } from "../../deps.ts";
import { cache } from "../../deps.ts";
import { createCommand } from "../utils/helpers.ts";
import { LaunchLibrary } from "../launchLibrary/launch_library.ts"
import { Embed } from '../utils/Embed.ts';
createCommand({
  name: `nextlaunch`,
  aliases: ['nl'],
  description: "Gets Next Launch",
  botChannelPermissions: ["SEND_MESSAGES"],
  slash: {
      enabled: true,
      guild: true,
      execute(data){
          return sendInteractionResponse(
              snowflakeToBigint(data.id),
              data.token,
              {
                  private: false,
                  type: DiscordInteractionResponseTypes.ChannelMessageWithSource,
                  data: {
                      content: "Pong"
                  }
              }
          )
      }
  },
  execute: async function (message) {
    const data = await LaunchLibrary.nextLaunch();
    return message.reply({embed: data });
  },
});
