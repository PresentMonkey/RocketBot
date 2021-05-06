require('dotenv').config();
discord_bot = require('./modules/discord_bot').bot;
discord_bot.connect();
