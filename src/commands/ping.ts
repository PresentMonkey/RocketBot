import {
    DiscordInteractionResponseTypes,
    sendInteractionResponse,
    snowflakeToBigint,
  } from "../../deps.ts";
import { cache } from "../../deps.ts";
import { createCommand } from "../utils/helpers.ts";

createCommand({
  name: `ping`,
  description: "Just a ping, self explanatory",
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
  execute: function (message) {
    message.send(`Ping MS: ${Date.now() - message.timestamp}ms`);
  },
});

createCommand({
  name: `devping`,
  guildOnly: true,
  execute: function (message) {
    let memberCount = 0;
    cache.guilds.forEach((guild) => {
      memberCount += guild.members.size;
    });

    message.send(
      `Ping MS: ${Date.now() -
        message
          .timestamp}ms | Guilds: ${cache.guilds.size} | Users: ${memberCount}`,
    );
  },
});