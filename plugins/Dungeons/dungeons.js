var fs = require('file-system')
var LootTable = require('loot-table')
var content, items, stats, adapter, db;
var testing = false;
//embed builder
var color;
//stuff
var short;
//stats
var exp, clss, lvl;
var dungeons = fs.readFile('./stats.js', 'utf8', function read(err,data) {
	if (err){
		throw err;
	}
	content = JSON.parse(data);
});
var itens = fs.readFile('./items.js', 'utf8', function read(err,data) {
	if (err){
		throw err;
	}
	items = JSON.parse(data);
});
var FileSync = require('lowdb/adapters/FileSync')
var Chance = require('chance')
var chance = new Chance();

var low = require('lowdb')

exports.commands = ["setup","dungeon","buy","testing","vault","trade","confirm","deny","quest"]

var classes = ["Rogue","Archer","Wizard","Priest","Warrior","Knight","Paladin","Assassin","Necromancer","Huntress","Mystic","Trickster","Sorcerer","Ninja"]
//var quests = ["Ghost King:15:20:195:Memento Mori","Ghost King:15:20:195:Interregnum"]
var quests = ["Scorpion Queen:1:6:20", "Bandit Leader:1:6:45", "Hobbit Mage:3:8:32","Undead Hobbit Mage:3:8:43","Giant Crab:3:8:43","Sandsman King:4:9:43","Gobin Mage:4:9:39","Elf Wizard:4:9:32","Desert Werewolf:3:8:51","Dwarf King:5:10:51","Swarm:6:11:64","Shambling Sludge:6:11:200","Great Lizard:7:12:90","Wasp Queen:7:19:195","Warrior Bee:7:19:207","Horned Drake:8:19:228","Deathmage:6:6:270","Great Coil Snake:8:8:270","Lich:10:20:165","Ent Ancient:10:20:384:Quiver of Thunder","Oasis Giant:13:20:325","Phoenix Lord:14:20:195","Ghost King:15:20:195:Memento Mori","Ghost King:15:20:195:Interregnum","Cyclops God:15:20:195","Red Demon:20:20:234"]
var events = ["Cube God:Dirk of Cronus:195", "Pentaract:Seal of Blasphemous Prayer:100", "Skull Shrine:Orb of Conflict:195", "Avatar of the Forgotten King:Tablet of the King's Avatar:1000", "Ghost Ship:Trap of Vile Spirits:195", "Grand Sphinx:Helm of the Juggernauts:59", "Hermit God:Helm of the Juggernaut:59", "Jade & Garnet Statues:Potion of Vitality:390", "Killer Bee Nest:Beehemoth Quiver:1000", "Killer Bee Nest:Beehemoth Quiver:1000", "Lord of the Lost Lands:Shield of Ogmur:59", "Rock Dragon:Ray Katana:195", "Lost Sentry:Cloak of Bloody Surprises:10000"]
var levels = {1:0,2:50,3:150,4:250,5:350,6:450,7:550,8:650,9:750,10:850,11:950,12:1050,13:1150,14:1250,15:1350,16:1450,17:1550,18:1650,19:1750,20:1850}

var stats = ["hp","mp","att","def","spd","dex","vit","wis"]

exports.quest = {
	usage: "quest",
	description: "Go on a quest",
	process: function(bot,msg,suffix) {
		if (!fs.existsSync('servers/'+msg.guild.id+'/players/'+msg.author.id+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "Please use `>>setup` to create a character.", null, msg.author));
		}
		short = msg.author.id;
		var serverId = msg.guild.id
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json');
		db = low(adapter);
		var date = new Date();
		var time = date.getTime();
		if (db.get(short+'.cooldown').value() > time) {
			var cooldown = db.get(short+'.cooldown').value()
			return msg.channel.send(createEmbed("n", "You are tired and must wait "+Math.round((cooldown-time)/1000)+" seconds before performing another action.", null, msg.author))
		}
		var pLvL = db.get(short+'.level').value()
		var availableQuests = [];
		var loot="";
		for (i=0;i<quests.length;i++) {
			var info = quests[i].split(":");
			if (pLvL >= parseInt(info[1]) && pLvL <= parseInt(info[2])) {
				availableQuests.push(quests[i]);
			}	
		}
		if (pLvL == 20) {
			var num = chance.integer({min: 0, max: 39});
			if (events[num] && events[num].split(":")[0] != undefined) {
				var lootchance = chance.integer({min: 0, max: 100});
				if (lootchance == 1) {
					for (q=0;q<7;q++) {
						if (db.get(short+'.inventory.item'+q+'.name') == "Empty") {
							loot = ", "+events[num].split(":")[1]
							db.set(short+'.inventory.item'+q+'.name', events[num].split(":")[1]).write();
							break;
						}
					}
				}
				date = new Date();
				time = date.getTime();
				var plrXP = db.get(short+'.exp').value()
			//	db.set(short+'.cooldown',time+15000).write();;
				db.set(short+'.exp', parseInt(plrXP)+parseInt(events[num].split(":")[2])).write();
				return msg.channel.send(createEmbed("y", "Event complete: "+events[num].split(":")[0], [{name:"The Spoils",value:events[num].split(":")[2]+' exp'+loot}], msg.author));
			}
		}
		var quest=chance.pickone(availableQuests);
		if (quest.split(":")[4]) {
			var lootchance=chance.integer({min:0,max:50});
			if(lootchance==1) {
				for(q=0;q<7;q++){
					if(db.get(short+'.inventory.item'+q+'.name')=="Empty") {
						loot=", "+quest.split(":")[4];
						db.set(short+'.inventory.item'+q+'.name',quest.split(":")[4]).write();
						break;
					}
				}
			}
		}
		date = new Date();
		time = Math.round(date.getTime());
		db.set(short+'.cooldown', time+15000).write();
		db.set(short+'.exp', parseInt(db.get(short+'.exp').value())+parseInt(info[3])).write()
		return msg.channel.send(createEmbed("y", "Quest complete: "+quest.split(":")[0], [{name:"The Spoils",value:info[3]+' exp'+loot}], msg.author));	
	}
}

exports.trade = {
	usage: "trade [user] [your slot] [their slot]",
	description: "Trade with a user",
	process: function(bot,msg,suffix) {
		if (!fs.existsSync('servers/'+msg.guild.id+'/players/'+msg.author.id+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "Please use >>setup or transfer your data.", null, msg.author));
		}
		if (suffix.split(" ").length != 3) {
			return msg.channel.send(createEmbed("n", "Invalid arguments! Syntax: >>trade [user] [your slot] [their slot]", null, msg.author));
		}
		short = msg.author.id;
		var serverId = msg.guild.id;
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json')
		db = low(adapter) // AUTHOR
		var toTrade = suffix.split(" ")[0].replace("<","").replace("@","").replace(">","").replace("!","");
		if (toTrade == short) {
			return msg.channel.send(createEmbed("n", "You cannot trade with yourself!", null, msg.author));
		}
		var authorSlot = parseInt(suffix.split(" ")[1])-1
		var tradeSlot = parseInt(suffix.split(" ")[2])-1
		if (!fs.existsSync('./servers/'+serverId+'/players/'+toTrade+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "That user was not found in our database!", null, msg.author));
		}
		var adapter2 = new FileSync('./servers/'+serverId+'/players/'+toTrade+'/vaults/vaults.json');
		var db2 = low(adapter2); //NOT AUTHOR
		var tradeeItem = db.get(short+'.item'+authorSlot+'.name').value() //AUTHOR
		var traderItem = db2.get(toTrade+'.item'+tradeSlot+'.name').value() //NOT AUTHOR
		var confada = new FileSync('./trades.json');
		var confdb = low(confada)
		var trades = confdb.get("trades.total").value()
		var newAmt = parseInt(trades)+1
		confdb.set("trades.trade"+newAmt+".trader", msg.author.id).write()
		confdb.set("trades.trade"+newAmt+".tradee", toTrade).write();
		confdb.set("trades.trade"+newAmt+".itemGoing", tradeeItem).write();
		confdb.set("trades.trade"+newAmt+".itemGetting", traderItem).write();
		confdb.set("trades.trade"+newAmt+".traderSlot", authorSlot).write();
		confdb.set("trades.trade"+newAmt+".tradeeSlot", tradeSlot).write();
		confdb.set("trades.trade"+newAmt+".tradeStatus", "none").write();
		confdb.set("trades.total", newAmt).write()
		return msg.channel.send(createEmbed("y", "Your trade was offered to <@!"+toTrade+">! Wait for them to `>>confirm` or `>>deny`!", null, msg.author));
	}
}

exports.confirm = {
	usage: "confirm",
	description: "Confirm your first trade",
	process: function(bot,msg,suffix) {
		if (!fs.existsSync('./servers/'+msg.guild.id+'/players/'+msg.author.id+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "Please use >>setup or transfer your data.", null, msg.author));
		}
		var adapter = new FileSync('./trades.json');
		var db = low(adapter)
		for (i=0;i<=db.get("trades.total").value();i++) {
			if (db.get("trades.trade"+i+".tradee").value() == msg.author.id && db.get("trades.trade"+i+".tradeStatus").value() == "none") {
				db.set("trades.trade"+i+".tradeStatus", "confirmed").write()
				var adapter2 = new FileSync('./servers/'+msg.guild.id+'/players/'+msg.author.id+'/vaults/vaults.json');
				var adapter3 = new FileSync('./servers/'+msg.guild.id+'/players/'+db.get("trades.trade"+i+".trader").value()+"/vaults/vaults.json");
				var db2 = low(adapter2); //person who is receiving the trade
				var db3 = low(adapter3); //person who sent the trade
				var trader = db.get("trades.trade"+i+".trader").value(); //sent
				var tradee = db.get("trades.trade"+i+".tradee").value(); //received
				var itemGoing = db.get("trades.trade"+i+".itemGoing").value(); //sent
				var itemGetting = db.get("trades.trade"+i+".itemGetting").value(); //received
				var tradeSlot = db.get("trades.trade"+i+".traderSlot").value(); //sent
				var tradeeSlot = db.get("trades.trade"+i+".tradeeSlot").value(); //received
				db2.set(msg.author.id+'.item'+tradeeSlot+'.name', itemGoing).write()
				db3.set(trader+'.item'+tradeSlot+'.name', itemGetting).write()
				return msg.channel.send(createEmbed("y", "Trade with <@!"+trader+"> was confirmed!", null, msg.author));
			}
		}
		return msg.channel.send(createEmbed("n", "Looks like you have no trades to accept!", null, msg.author));
	}
}

exports.deny = {
	usage: "deny",
	description: "Denies your first trade",
	process: function(bot,msg,suffix) {
		if (!fs.existsSync('./servers/'+msg.guild.id+'/players/'+msg.author.id+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "Please use >>setup or transfer your data.", null, msg.author));
		}
		var adapter = new FileSync('./trades.json');
		var db = low(adapter)
		for (i=0;i<=db.get("trades.total").value();i++) {
			if (db.get("trades.trade"+i+".tradee").value() == msg.author.id && db.get("trades.trade"+i+".tradeStatus").value() == "none") {
				db.set("trades.trade"+i+".tradeStatus", "denied").write()
				var trader = db.get("trades.trade"+i+".trader").value(); //sent
				return msg.channel.send(createEmbed("y", "Trade with <@!"+trader+"> was denied!", null, msg.author));
			}
		}
		return msg.channel.send(createEmbed("n", "Looks like you have no trades to deny!", null, msg.author));
	}
}

exports.testing = {
	usage: "testing",
	description: "Enables testing/dev mode",
	process: function(bot,msg,suffix) {
		if (msg.author.id == 211879573971927040 && !testing) {
			testing = true;
			return msg.channel.send(createEmbed("y", "Dev mode has been enabled.", null, msg.author))
		} else if (msg.author.id == 211879573971927040 && testing) {
			testing = false;
			return msg.channel.send(createEmbed("y", "Dev mode has been disabled.", null, msg.author))
		}
	}
}

exports.vault = {
	usage: "vault",
	description: "Displays your vault",
	process: function(bot,msg,suffix) {
		short = msg.author.id;
		var serverId = msg.guild.id;
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		if (!fs.existsSync('servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json')) {
			return msg.channel.send(createEmbed("n", "Please use >>setup or transfer your data.", null, msg.author));
		}
		if (suffix && suffix.split(" ")[0] == "deposit" && suffix.split(" ").length == 2) {
			var slot = suffix.split(" ")[1]
			if (parseInt(slot) <= 8 && parseInt(slot) >= 1) {
				if (db.get(short+'.inventory.item'+(slot-1)+'.name').value() != "Empty") {
					for (i=0;i<8;i++) {
						if (db2.get(short+'.item'+i+'.name').value() == "Empty") {
							var name = db.get(short+'.inventory.item'+(slot-1)+'.name').value()
							db2.set(short+'.item'+i+'.name', name).write()
							db.set(short+'.inventory.item'+(slot-1)+'.name', 'Empty').write()
							msg.channel.send(createEmbed("y", "Successfully transferred "+name+" to your vault!", null, msg.author));
							return;
						}
					}
				}
		}
		} else if (suffix && suffix.split(" ")[0] == "withdraw" && suffix.split(" ").length == 2) {
			var slot = suffix.split(" ")[1]
			if (parseInt(slot) <= 8 && parseInt(slot) >= 1) {
				if (db2.get(short+'.item'+(slot-1)+'.name').value() != "Empty") {
					for (i=0;i<8;i++) {
						if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
							var name = db2.get(short+'.item'+(slot-1)+'.name').value()
							db2.set(short+'.item'+(slot-1)+'.name', 'Empty').write()
							db.set(short+'.inventory.item'+i+'.name', name).write()
							msg.channel.send(createEmbed("y", "Successfully transferred "+name+" to your inventory!", null, msg.author));
							return;
						}
					}
				}
			}
		}
		var mesg = "Your Vault:\n"
		for (i=0;i<8;i++) {
			mesg = mesg + ((i+1)+" - "+db2.get(short+'.item'+i+'.name').value()+'\n')
		}
		return msg.channel.send(createEmbed("i", "__**Vault**__\n\n"+mesg+"\nUse `>>vault withdraw #` to withdraw an item.\nUse `>>vault deposit #` to deposit an item.", null, msg.author));
	}
}

exports.setup = {
	usage: "setup <class>",
	description: "Set up your RealmRPG Profile.",
	process: function(bot,msg,suffix) {
		short = msg.author.id
		var serverId = msg.guild.id
		if(fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "It appears that you already have a character.", null, msg.author))
		fs.mkdir('servers/'+serverId+'/players/'+msg.author.id, function(err){})
		fs.mkdir('servers/'+serverId+'/players/'+msg.author.id+'/vaults', function(err){})
		fs.writeFile('servers/'+serverId+'/players/'+msg.author.id+'/character.json', '')
		fs.writeFile('servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json', '')
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		var guild = msg.guild
		var botMember = guild.member(bot.user)
		var botPermissions = msg.channel.permissionOverwrites
		if (!msg.channel.permissionsFor(botMember).has("SEND_MESSAGES")) {
			return;
		}
		if (!suffix) {
			return msg.channel.send(createEmbed("n", "Please specify a class.", null, msg.author));
		}
		for (i=0;i<classes.length;i++) {
			if (suffix.toLowerCase() == classes[i].toLowerCase()) {
				db.set(short+'.class', classes[i]).write()
				db.set(short+'.exp', 1).write()	
				db.set(short+'.level', 1).write()	
				db.set(short+'.cooldown', 0).write()
				db.set(short+'.nickname', "none").write()
				for (y=0;y<8;y++){
					db.set(short+'.inventory.item'+y+'.name', 'Empty').write()
					db.set(short+'.inventory.item'+y+'.isFavorite',0).write()
					db2.set(short+'.item'+y+'.name', 'Empty').write()
				}
				for (z=0;z<4;z++){
					db.set(short+'.inventory.equip'+z, 'Empty').write()
				}
				for (x=0;x<stats.length;x++) {
					db.set(short+'.stats.'+stats[x], 0).write()
				}
				if (msg.guild.id == '371380194797420547') {
					msg.guild.member(msg.author).setNickname(msg.author.username+" [LVL1]")
					msg.guild.member(msg.author).addRole('378990534045466624')
				}
				return msg.channel.send(createEmbed("y", "You have set up your character! To run your first dungeon, use `>>dungeon pcave`!", null, msg.author));	
			}
		}
		return msg.channel.send(createEmbed("n", "That's not a valid class!", null, msg.author));
	}
}

exports.dungeon = {
	usage: "dungeon <dungeon name>",
	description: "This is simply a test command.",
	process: function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if (!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRPG.", null, msg.author));
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2)
		var guild = msg.guild
		var botMember = guild.member(bot.user)
		var botPermissions = msg.channel.permissionOverwrites
		if (!msg.channel.permissionsFor(botMember).has("SEND_MESSAGES")) {
			return;
		}
		var date = new Date();
		var time = date.getTime()
		if (!suffix) {
			return msg.channel.send(createEmbed("n", "Please specify a dungeon!", null, msg.author));
		}
		if (time < db.get(short+'.cooldown').value() && msg.author.id != 211879573971927040 && testing == false) {
			return msg.channel.send(createEmbed("n", "You are tired, and must wait " + Math.round((db.get(short+'.cooldown').value() - time)/1000) + " more seconds before entering another dungeon.", null, msg.author));
		} else {
			for (i=0;i<Object.keys(content.dungeons).length;i++) {
				if (content.dungeons[i].aliases) {
					for (z=0;z<content.dungeons[i].aliases.length;z++) {
						if (suffix == content.dungeons[i].aliases[z]) {
							var opening = content.dungeons[i].name
							return dungeon(msg, suffix, db, time, opening);
						}
					}
				}
			}
			return dungeon(msg, suffix, db, time);
		}
	}
}

exports.buy = {
	usage: "buy <key>",
	description: "temp",
	process: function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if(!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRPG.", null, msg.author));
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		if (!db.get(short+'.class').value()) {
			//return
			return;
		}
		var fame = Math.floor(db.get(short+'.exp').value()/500)
		var exp = db.get(short+'.exp').value()
		if (suffix == "shatters" && fame >= 20 || suffix == "shatters" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=10000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "The Shatters Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Shatters key for 20 fame.", null, msg.author));
				}
			}
		}
		if (suffix == "draconis" && fame >= 10 || suffix == "draconis" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=5000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Lair of Draconis Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Lair of Draconis key for 10 fame.", null, msg.author));
				}
			}
		}
		if (suffix == "castle" && fame >= 5 || suffix == "castle" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=2500;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Oryx's Castle Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought an Oryx's Castle key for 5 fame.", null, msg.author))
				}
			}
		}
		if (suffix == "cdepths" && fame >= 10 || suffix == "cdepths" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=5000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Crawling Depths Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Crawling Depths Key for 10 fame.", null, msg.author))
				}
			}
		}
		if (suffix == "ddocks" && fame >= 10 || suffix == "ddocks" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=5000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Deadwater Docks Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Deadwater Docks Key for 10 fame.", null, msg.author))
				}
			}
		}
		if (suffix == "woodland" && fame >= 10 || suffix == "woodland" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=5000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Woodland Labyrinth Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Woodland Labyrinth Key for 10 fame.", null, msg.author))
				}
			}
		}
		if (suffix == "lost halls" && fame >= 20 || suffix == "lost halls" && testing) {
			for (i=0;i<8;i++) {
				if (db.get(short+'.inventory.item'+i+'.name').value() == "Empty") {
					if (!testing) {
						exp-=10000;
					}
					db.set(short+'.exp', exp).write()
					db.set(short+'.inventory.item'+i+'.name', "Lost Halls Key").write()
					return msg.channel.send(createEmbed("y", "Successfully bought a Lost Halls Key for 20 fame.", null, msg.author))
				}
			}
		}
	}
}

function dungeon(msg, suffix, db, time, toOpen, slot) {
	var serverId = msg.guild.id
	if (content == undefined) {
		return;
	}
	var opening;
	if (toOpen) {
		for (i=0;i<Object.keys(content.dungeons).length;i++) {
			if (content.dungeons[i].name == toOpen) {
				opening = content.dungeons[i]
			}
		}
	}
	for (i=0;i<Object.keys(content.dungeons).length;i++){
		if (suffix.toLowerCase() == content.dungeons[i].name.toLowerCase() || opening && opening.name.toString().toLowerCase() == content.dungeons[i].name.toLowerCase()) {
			if (content.dungeons[i].requiresKey == 1 && !toOpen) {
				return msg.channel.send(createEmbed("n", "You need a key to enter that dungeon!", null, msg.author))
			}
			if (!slot && toOpen == "Lair of Draconis" || !slot && toOpen == "The Shatters" || !slot && toOpen == "Wine Cellar" || !slot && toOpen == "Deadwater Docks" || !slot && toOpen == "The Crawling Depths" || !slot && toOpen == "Woodland Labyrinth" || !slot && toOpen == "The Void" || !slot && toOpen == "Lost Halls" || !slot && toOpen == "Cultist Hideout") {
				return msg.channel.send(createEmbed("n", "You need a key to enter that dungeon!", null, msg.author))
			}
			if (!toOpen) {
				opening = content.dungeons[i];
			}
			//BETA: timing
			var time = opening.timeToComplete;
			var date=new Date();
			var timeNow=date.getTime();
			var timeAfter=timeNow+(date*1000);
			//setTimeout(function(){msg.channel.send("Finished.")}, time*1000);
			//return;
			var vit = db.get(short+'.stats.vit').value()
			var cooldown = time + sToMs(opening.cooldownS-(vit*0.05));
			var minExp = opening.minExp;
			var maxExp = opening.maxExp;
			var exp = chance.integer({min:minExp,max:maxExp})
			var plrExp = db.get(short+'.exp').value()
			var newExp = db.get(short+'.exp').value()+exp
			lvl = db.get(short+'.level').value();
			var rewards;
			if (plrExp == 0 || plrExp == NaN || plrExp == undefined || plrExp == null) {
				return msg.channel.send(createEmbed("n", "Please use `>>setup <class>` to play.", null, msg.author));
			}
			if (opening.levelRequirement > lvl && !testing) {
				return msg.channel.send(createEmbed("n", "Your level is not high enough!", [{name: 'Required Level:',value: opening.levelRequirement,inline: true},{name: 'Your Level:',value: lvl,inline: true}], msg.author))
			}
			if (slot) {
				db.set(short+'.inventory.item'+(slot-1)+'.name', "Empty").write()
			}
			var lootTable = new LootTable();
			for (u=0;u<Object.keys(opening.lootTable).length;u++) {
				lootTable.add(Object.keys(opening.lootTable)[u], Object.values(opening.lootTable)[u])
			}
			let result = lootTable.choose();
			if (result != "") {
				for (q=0;q<Object.keys(items.items).length;q++) {
				}
				rewards = result;
				for (n=0;n<8;n++) {
					if (db.get(short+".inventory.item"+(n)+'.name').value() == "Empty") {
						db.set(short+".inventory.item"+(n)+'.name', rewards).write()
						break;
					}
				}
				rewards = ", "+result;
			} else {
				rewards = ""
			}
			var roll = chance.d30();
			if (roll == 1) {
				db.set(short+'.cooldown', cooldown).write();
				return msg.channel.send(createEmbed("n", "Failure! You entered the "+opening.name+" and were forced to Nexus.", [{name: 'The Spoils:',value: "Nothing"}], msg.author, opening.image))
			}
			msg.channel.send(createEmbed("y", "Success! You entered the "+opening.name+" and killed "+opening.boss+"!", [{name: 'The Spoils:',value: exp+' exp'+rewards}], msg.author, opening.image))
			db.set(short+'.exp', newExp).write()
			db.set(short+'.cooldown', cooldown).write();
			lvl = db.get(short+'.level').value()
			for (k=0;k<Object.keys(levels).length;k++) {
				if ((lvl+1) == Object.keys(levels)[k+1] && lvl < 20) {
					if (newExp >= Object.values(levels)[k+1]) {
						var newLvl = parseInt(lvl)+1
						db.set(short+'.level', newLvl).write()
						db.set(short+'.exp', 1).write()
						msg.channel.send(createEmbed("i", "Congratulations, you leveled up to Level "+newLvl+"!", null, msg.author, "https://static.drips.pw/rotmg/wiki/Environment/Portals/Pirate%20Cave%20Portal.png"))
						if (msg.guild.id == 371380194797420547) {
							var nickname = db.get(short+'.nickname').value()
							if (nickname) {
								msg.guild.member(msg.author).setNickname(nickname + " [LVL"+newLvl+"]");
							} else {
								msg.guild.member(msg.author).setNickname(msg.author.username + " [LVL"+newLvl+"]");
							}
							if (newLvl >= 5 && newLvl < 10) {
								msg.guild.member(msg.author).addRole('378990568832761868')
								msg.guild.member(msg.author).removeRole('378990534045466624')
							}
							if (newLvl >= 10 && newLvl < 20) {
								msg.guild.member(msg.author).addRole('378990995251003392')
								msg.guild.member(msg.author).removeRole('378990568832761868')
							}
							if (newLvl == 20) {
								msg.guild.member(msg.author).addRole('378991024363536406')
								msg.guild.member(msg.author).removeRole('378990995251003392')
							}
						}
						break;
					}
				}
			}
		return;
		}
	}
}

function createEmbed(status, description, fields, user, image) {
	var dte = new Date()
	var time = dte.getTime()
	var iso = new Date(time).toISOString()
	if (status == "n") {
		color = 15158332; 
	} else if (status == "y") {
		color = 3066993;
	} else if (status == "i") {
		color = 3447003
	} else {
		return "There was an error! Please contact Star.";
	}
	if (fields && image) {
		return {embed: {
			author: {
				name: user.username+"#"+user.discriminator,
				icon_url:user.avatarURL
			},
			color: color,
			description: description,
			fields: fields,
			thumbnail: {
				url: image
			},
			timestamp: iso
		}}
	}
	if (fields) {
		return {embed: {
			author: {
				name: user.username+"#"+user.discriminator,
				icon_url:user.avatarURL
			},
			color: color,
			description: description,
			fields: fields,
			timestamp: iso
		}}
	}
	if (image) {
		return {embed: {
			author: {
				name: user.username+"#"+user.discriminator,
				icon_url:user.avatarURL
			},
			color: color,
			description: description,
			thumbnail: {
				url: image
			},
			timestamp: iso
		}}
	}
	return {embed: {
		author: {
			name: user.username+"#"+user.discriminator,
			icon_url:user.avatarURL
		},
		color: color,
		description: description
	}}
}
//example
//var date = new Date()
//var n = date.getTime()
//console.log(n + " " + (n+sToMS(1)))
function sToMs(s) {
	return s*1000
}
