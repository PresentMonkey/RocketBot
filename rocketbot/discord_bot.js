const Eris = require('eris');
const launch_library = require('./launch_library').LaunchLibrary;
const l = new launch_library('https://ll.thespacedevs.com/2.0.0');


const bot = new Eris.CommandClient(process.env.DISCORD_BOT_TOKEN, {}, {
    description: "Rocket Bot",
    owner: "PresentMonkey",
    prefix: "!"
});

bot.on("ready", ()=>{
    console.log("Ready!");
});


bot.registerCommand("launches", async(msg, args)=>{
    var response = await l.getLaunches();
    return response.raw;


});

bot.registerCommand("nextlaunch", async(msg, args)=>{
    var response = await l.getNextLaunch();
    return response.raw;
})

module.exports = {
    bot
}