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
    var returnValue = {
        embed: {
            title: "Next 10 Launches",
            fields: []
        }
    };
    var response = await l.get('/launch/upcoming/');
    

    
    response.results.forEach((data)=>{
        launchReturn = {
            name: data.name,
            value: data.pad.name + ", " +  data.pad.location.name + "\n" + data.status.name + " - "
        }
        returnValue.embed.fields.push(launchReturn);
    })

    return returnValue;


});

module.exports = {
    bot
}