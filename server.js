require('dotenv').config();


discord_bot = require('./rocketbot/discord_bot').bot;


discord_bot.connect();