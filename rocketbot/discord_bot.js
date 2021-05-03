const Eris = require('eris');
const launch_library = require('./launch_library').LaunchLibrary;
const l = new launch_library('https://ll.thespacedevs.com/2.0.0');
const {DateTime, Duration}=require('luxon');

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
    let response = await l.getNextLaunch();
    let launchDate = response.metadata.date;
    let difference = DateTime.fromISO(launchDate).diff(DateTime.now());
    let timeTo = Duration.fromMillis(difference.toMillis());
    response.appendDescription(`\n \n ${timeTo.toFormat("'In 'd' days, ' h ' hours, and ' m ' minutes.' ")}`);
    return response.raw;
})

module.exports = {
    bot
}