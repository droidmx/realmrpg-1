var fs = require('fs');
var FileSync = require('lowdb/adapters/FileSync')
var low = require('lowdb')
process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

try {
	var Discord = require("discord.js");
} catch (e){
	console.log(e.stack);
	console.log(process.version);
	console.log("<!> Run npm install and ensure it passes with no errors!");
	process.exit();
}
console.log("Starting DiscordBot\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);



// Get authentication data
try {
	var AuthDetails = require("./auth.json");
} catch (e){
	console.log("<!> There was an error with auth.json, or it was not found.");
	process.exit();
}

//load config data
var Config = {};
try{
	Config = require("./config.json");
} catch(e){ //no config file, use defaults
	Config.commandPrefix = '!';
	try{
		if(fs.lstatSync("./config.json").isFile()){
			console.log("<!> config.json found but we couldn't read it!\n");
		}
	} catch(e2){
		fs.writeFile("./config.json",JSON.stringify(Config,null,2));
	}
}

var commands = {
};

var bot = new Discord.Client();

bot.on("ready", function () {
	console.log("Booted. Member in " + bot.guilds.array().length + " servers");//, which are:");
	//for (n=0;n<bot.guilds.array().length;n++) {
	//	console.log(" - "+bot.guilds.array()[n].id+" ("+bot.guilds.array()[n].name+")")
	//}
	require("./plugins.js").init();
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
});

function checkMessageForCommand(msg, isEdit) {
	if (msg.content == "!servers" && msg.author.id == "211879573971927040") {
		var mesg = "**Name** - **Server ID** - **Owner**\n";
		for (i=0;i<bot.guilds.array().length;i++) {
			mesg = mesg + bot.guilds.array()[i].name + " - " + bot.guilds.array()[i].id + " - <@" + bot.guilds.array()[i].ownerID+">\n"
			//if (msg.guild.member(bot.user).hasPermission("CREATE_INSTANT_INVITE")) {
				//mesg = mesg + Object.values(bot.guilds.array()[i].fetchInvites());
			//}
		}
		msg.author.send(mesg);
	}
	//check if message is a command
	if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))){
		var cmdTxt = msg.content.split(" ")[0].substring(Config.commandPrefix.length);
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1);//add one for the ! and one for the space
		var cmd = commands[cmdTxt];	
        if(cmd) {
			try{
				cmd.process(bot,msg,suffix,isEdit);
			} catch(e){
				console.log(e.stack + "oof");
			}
		}
    }
}

function init(guild) {
	console.log("Joined guild");
	adapter = new FileSync('servers.json')
	db = low(adapter)
	if (!db.get("servers."+guild.id).value()) {
		db.set("servers."+guild.id, guild.id).write();
		fs.mkdir('servers/'+guild.id, function(err){})
		fs.mkdir('servers/'+guild.id+'/players/', function(err){})
		fs.writeFile('servers/'+guild.id+'/server.json', '{"name":"'+guild.name+'"}')
	}
}

bot.on("message", (msg) => checkMessageForCommand(msg, false));

bot.on("guildCreate", (guild) => init(guild));

exports.addCommand = function(commandName, commandObject){
    try {
        commands[commandName] = commandObject;
    } catch(err){
        console.log(err);
    }
}
	
if(AuthDetails.bot_token){
	console.log("logging in with token");
	bot.login(process.env.BOT_TOKEN);
}
