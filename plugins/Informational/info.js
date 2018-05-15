var fs = require('file-system')
var LootTable = require('loot-table')
var testing = false;
var dungeons = fs.readFile('./stats.js', 'utf8', function read(err,data) {
	
	content = JSON.parse(data);
});
var itens = fs.readFile('./items.js', 'utf8', function read(err,data) {
	
	items = JSON.parse(data);
});
var FileSync = require('lowdb/adapters/FileSync')
var Chance = require('chance')
var chance = new Chance();
var levels = {1:0,2:50,3:150,4:250,5:350,6:450,7:550,8:650,9:750,10:850,11:950,12:1050,13:1150,14:1250,15:1350,16:1450,17:1550,18:1650,19:1750,20:1850}
var low = require('lowdb')
var stats = ["hp","mp","att","def","spd","dex","vit","wis"]
exports.commands = ["char", "inv", "help", "dungeons", "nick", "stats"]

exports.nick = {
	usage:"nick <nick>",
	description:"nick",
	process:function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if(!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRPG.", null, msg.author));
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		if (msg.guild.id != 371380194797420547) {
			return;
		}
		if (suffix.includes("zx ")) {
			return msg.channel.send(createEmbed("n", "Impersonating devs isn't cool :^(", null, msg.author))
		}
		db.set(short+'.nickname', suffix).write()
		var level = db.get(short+'.level').value()
		if (suffix == "none") {
			msg.guild.member(msg.author).setNickname(msg.author.username + " [LVL"+level+"]");
			return msg.channel.send(createEmbed("y", "You successfully reverted your nickname.", null, msg.author));
		}
		msg.guild.member(msg.author).setNickname(suffix + " [LVL"+level+"]")
		return msg.channel.send(createEmbed("y", "You successfully changed your nickname to \""+suffix+"\"", null, msg.author))
	}
}

exports.stats = {
	usage:"stats",
	description:"stats",
	process:function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if(!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRpg.", null, msg.author));
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		var toSend = "You need "
		var statsMaxed = 0;
		var caps = [19, 19, 32, 40, 32, 32, 37, 37]
		for (i=0;i<8;i++) {
			var value = db.get(short+'.stats.'+stats[i]).value()
			if (value < caps[i]) {
				toSend = toSend + ((caps[i]-value) + " " + stats[i].toUpperCase())
				if (i < 8) {
					toSend = toSend + ", "
				}
			} else {
				statsMaxed++;
				continue;
			}
		}
		console.log(statsMaxed);
		toSend = toSend.replace(new RegExp(", "+'$'), '')
		toSend = toSend + " to be maxed."
		if (statsMaxed == 8) {
			toSend = "You have maxed all of your stats!"
		}
		return msg.channel.send(createEmbed("i", toSend, null, msg.author))
	}
}
exports.dungeons = {
	usage:"dungeons",
	description:"dungeons",
	process:function(bot,msg,suffix){
		var short = msg.author.id
		var toSend = "";
		if (fs.existsSync('./servers/'+msg.guild.id+'/players/'+short+'/character.json')) {
			var adapter = new FileSync('./servers/'+msg.guild.id+'/players/'+short+'/character.json');
			var db = low(adapter);
			var plrLVL = db.get(short+'.level').value()
			for(i=0;i<Object.keys(content.dungeons).length;i++) {
				if (content.dungeons[i].levelRequirement>parseInt(plrLVL)) {
					toSend+="[LOCKED] ";
				}
				if (content.dungeons[i].requiresKey == 1) {
					toSend+="[KEY] ";
				}
				toSend+="**"+content.dungeons[i].name+"** - Level "+content.dungeons[i].levelRequirement+"\n";
			}
			return msg.channel.send(createEmbed("i", toSend, null, msg.author));
		}
		for(i=0;i<Object.keys(content.dungeons).length;i++) {
			if (content.dungeons[i].requiresKey != 1) {
				toSend+="[LOCKED] **"+content.dungeons[i].name+"** - Level "+content.dungeons[i].levelRequirement+"\n";
			} else {
				toSend+="[KEY] **"+content.dungeons[i].name+"** - Level "+content.dungeons[i].levelRequirement+"\n";
			}
			toSend+="**"+content.dungeons[i].name+"** - Level "+content.dungeons[i].levelRequirement+"\n";
		}
		return msg.channel.send(createEmbed("i", toSend+="\n\nUse `>>setup` to begin playing!", null, msg.author));
	}
}

exports.help = {
	usage:"help",
	description:"help",
	process: function(bot, msg, suffix) {
		return msg.channel.send(createEmbed("i", "List of commands:\n>>dungeon `dungeon`\n>>char\n>>inv\n>>help\n>>dungeons\n>>buy\n>>vault\n>>quest\n>>trade\n\nBot created by zx. Maintained by Tunes#7552.\nOfficial Discord Server: http://discord.gg/WaAQXuZ", null, msg.author))
	}
}

exports.char = {
	usage: "char [user]",
	description: "Display someone's RealmRPG character info.",
	process: function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if(!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRPG.", null, msg.author));
		adapter = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/character.json')
		db = low(adapter)
		adapter2 = new FileSync('./servers/'+serverId+'/players/'+msg.author.id+'/vaults/vaults.json');
		db2 = low(adapter2);
		var guild = msg.guild
		var botMember = guild.member(bot.user)
		var botPermissions = msg.channel.permissionOverwrites
		var tool;
		var howMaxed = 0;
		if (!msg.channel.permissionsFor(botMember).has("SEND_MESSAGES")) {
			return;
		}
		var exp = db.get(short+'.exp').value()
		var toPut = ""
		clss = db.get(short+'.class').value()
		lvl = db.get(short+'.level').value()
		if (lvl >= 20) {
			toPut=Math.floor(exp/500)+" fame, "+exp+" exp";
			tool = "Fame"
		} else {
			toPut=exp+"/"+Object.values(levels)[lvl]+" exp";
			tool = "Experience"
		}
		var caps = [19, 19, 32, 40, 40, 32, 37, 37]
		for (m=0;m<stats.length;m++) {
			if (db.get(short+'.stats.'+stats[m]).value() >= caps[m]) {
				howMaxed = howMaxed + 1
			}
		}
		if (suffix) {
			var id = suffix.replace('<', '').replace('>', '').replace('@', '').replace('!', '')
			if (!fs.existsSync('./servers/'+serverId+'/players/'+id+'/character.json')) {
				return msg.channel.send(createEmbed("n", "That character was not found.", null, msg.author));			
			}
			var guildId = msg.guild.id;
			var member = msg.guild.member(id);
			short = id
			adapter = new FileSync('./servers/'+serverId+'/players/'+id+'/character.json');
			db = low(adapter);
			exp = db.get(short+'.exp').value()
			clss = db.get(short+'.class').value()
			lvl = db.get(short+'.level').value()
			if (lvl >= 20) {
				toPut=Math.floor(exp/500)+" fame, "+exp+" exp";
				tool = "Fame"
			} else {
				toPut=exp+"/"+Object.values(levels)[lvl]+" exp";
				tool = "Experience"
			}
			howMaxed = 0;
			for (m=0;m<stats.length;m++) {
				if (db.get(short+'.stats.'+stats[m]).value() >= caps[m]) {
					howMaxed = howMaxed + 1
				}
			}
			return msg.channel.send(createEmbed("i", "Information for **"+member.user.username+"**", [{name: tool,value: toPut,inline: true},{name: 'Level',value: 'Level '+lvl,inline: true},{name: 'Class',value: clss,inline: true},{name: 'Stats',value: howMaxed+"/8",inline:true}], msg.author));
		}
		return msg.channel.send(createEmbed("i", "Information for **"+msg.author.username+"**", [{name: tool,value: toPut,inline: true},{name: 'Level',value: 'Level '+lvl,inline: true},{name: 'Class',value: clss,inline: true},{name: 'Stats',value: howMaxed+"/8",inline:true}], msg.author));
	}
}

exports.inv = {
	usage: "inv [user]",
	description: "Display someone's inventory",
	process: function(bot,msg,suffix) {
		var serverId = msg.guild.id
		short = msg.author.id
		if(!fs.existsSync('./servers/'+serverId+'/players/'+msg.author.id)) return msg.channel.send(createEmbed("n", "Please use `>>setup [class]` (without the brackets) to play RealmRPG.", null, msg.author));
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
		if (!items) {
			return;
		}
		var cls = db.get(short+'.class').value()
		if (db.get(short+'.exp').value() == undefined) {
			return msg.channel.send(createEmbed("n", "Please use `>>setup <class>` to view your inventory.", null, msg.author));
		}
		if (suffix) {
			if (suffix.split(" ")[0].toLowerCase() == "delete") {
				var toDelete = parseInt(suffix.split(" ")[1])-1;
				if (parseInt(toDelete) > -1 && parseInt(toDelete) < 8) {
					var slot = db.get(short+'.inventory.item'+toDelete+'.name').value()
					if (slot != "Empty") {
						db.set(short+'.inventory.item'+toDelete+'.name', "Empty").write()
						return msg.channel.send(createEmbed("i", "You have deleted the item in slot "+(toDelete+1)+", the "+slot+"!", null, msg.author));
					}
				}
			}
			if (suffix.split(" ")[0].toLowerCase() == "equip") {
				var toEquip = parseInt(suffix.split(" ")[1])-1;
				if (parseInt(toEquip) > -1 && parseInt(toEquip) < 8) {
					var slot = db.get(short+'.inventory.item'+toEquip+'.name').value()
					var type, weapon, ability, armor;
					for (p=0;p<Object.keys(content.classes).length;p++) {
						if (db.get(short+'.class').value() == Object.keys(content.classes)[p]) {
							type = Object.keys(content.classes)[p]
							weapon = Object.values(content.classes)[p].weapon
							ability = Object.values(content.classes)[p].ability
							armor = Object.values(content.classes)[p].armor
						}
					}
					for (o=0;o<Object.keys(items.items).length;o++) {
						if (items.items[o].name == slot) {
							if (items.items[o].type == weapon || items.items[o].type == ability || items.items[o].type == armor || items.items[o].type == 4) {
								if (items.items[o].type == weapon) {
									itemSlot = 1
								} else if (items.items[o].type == ability) {
									itemSlot = 2
								} else if (items.items[o].type == armor) {
									itemSlot = 3
								} else if (items.items[o].type == 4) {
									itemSlot = 4
								}
								if (db.get(short+'.inventory.equip'+(itemSlot-1)).value() != "Empty") {
									var itenn = db.get(short+'.inventory.equip'+(itemSlot-1)).value()
									db.set(short+'.inventory.item'+toEquip+'.name', itenn).write()
									db.set(short+'.inventory.equip'+(itemSlot-1), items.items[o].name).write()
								} else {
									db.set(short+'.inventory.item'+toEquip+'.name', "Empty").write()
									db.set(short+'.inventory.equip'+(itemSlot-1), items.items[o].name).write()
								}
								return msg.channel.send(createEmbed("y", "You have equipped "+items.items[o].name+"!", null, msg.author));
							}
						}
					}
					return msg.channel.send(createEmbed("n", "There is no item in that slot, or you picked an unequippable item!", null, msg.author));
				}
				return msg.channel.send(createEmbed("n", "You didn't specify an item!", null, msg.author));
			}
			if (suffix.split(" ")[0].toLowerCase() == "clear") {
				for (m=0;m<8;m++) {
					var isFav = db.get(short+'.inventory.item'+m+'.isFavorite').value()
					if (isFav == 1) {
						//nothing
					} else {
						db.set(short+'.inventory.item'+m+'.name', "Empty").write();
					}
				}
				return msg.channel.send(createEmbed("y", "Your inventory was cleared!", null, msg.author));
			}
			if (suffix.split(" ")[0].toLowerCase() == "use") {
				var toUse = parseInt(suffix.split(" ")[1])-1;
				if (parseInt(toUse) > -1 && parseInt(toUse) < 8) {
					for (i=0;i<Object.keys(items.items).length;i++){
						if (items.items[i].name == db.get(short+'.inventory.item'+toUse+'.name') && items.items[i].type == "key") {
							for (z=0;z<Object.keys(content.dungeons).length;z++) {
								if (content.dungeons[z].name == items.items[i].opens) {
									var date = new Date();
									var time = date.getTime()
									return dungeon(msg, suffix, db, time, items.items[i].opens, (toUse+1));
								}
							}
						} else if (items.items[i].name == db.get(short+'.inventory.item'+toUse+'.name') && items.items[i].type == "potion") {
							var stat = items.items[i].stat;
							var val = db.get(short+'.stats.'+stat).value()
							if (val < 50) {
								var newVal = parseInt(val)+1
								db.set(short+'.stats.'+stat, newVal).write()
								db.set(short+'.inventory.item'+toUse+'.name', "Empty").write()
								return msg.channel.send(createEmbed("y", "You drank your "+items.items[i].name+" and increased your "+stat.toUpperCase()+" by 1.", null, msg.author))
							}
							return msg.channel.send(createEmbed("n", "Your "+stat.toUpperCase()+" is maxed out!", null, msg.author))
						}
					}
				}
			}
			if (suffix.split(" ")[0].toLowerCase() == "favorite") {
				var toFav = parseInt(suffix.split(" ")[1])-1;
				if (parseInt(toFav) > -1 && parseInt(toFav) < 8) {
					var isFav = db.get(short+'.inventory.item'+toFav+'.isFavorite').value()
					var itemName = db.get(short+'.inventory.item'+toFav+'.name').value()
					if (isFav == 1) {
						db.set(short+'.inventory.item'+toFav+'.isFavorite',0).write()
						return msg.channel.send(createEmbed("y", "You have unfavorited the "+itemName+"!", null, msg.author))
					} else {
						db.set(short+'.inventory.item'+toFav+'.isFavorite',1).write()
						return msg.channel.send(createEmbed("y", "You have favorited the "+itemName+"!", null, msg.author))
					}
				}
				return;
			}
		}
		var str = "__**Inventory**__\n"
		for(i=0;i<8;i++){
			str+="\n"+(i+1)+" - "+db.get(short+'.inventory.item'+i+'.name').value()
			if (db.get(short+'.inventory.item'+i+'.isFavorite').value() == 1 && db.get(short+'.inventory.item'+i+'.name').value() != "Empty") {
				str+=" [⭐]"
			} else if (db.get(short+'.inventory.item'+i+'.name' == "Empty")) {
				db.set(short+'.inventory.item'+i+'.isFavorite', 0).write()
			}
		}
		for (i=0;i<4;i++){
			str+="\nEquip "+(i+1)+" - "+db.get(short+'.inventory.equip'+i).value()
		}
		str+="\n\nUse `>>inv delete #` to remove an item from your inventory."
		str+="\nUse `>>inv equip #` to equip an item."
		str+="\nUse `>>inv use #` to consume an item or use a key."
		msg.channel.send(createEmbed("i", str, null, msg.author))
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
			if (!slot && toOpen == "Lair of Draconis" || !slot && toOpen == "The Shatters" || !slot && toOpen == "Oryx's Castle") {
				return msg.channel.send(createEmbed("n", "You need a key to enter that dungeon!", null, msg.author))
			}
			if (!toOpen) {
				opening = content.dungeons[i];
			}
			var cooldown = time + sToMs(opening.cooldownS);
			var minExp = opening.minExp;
			var maxExp = opening.maxExp;
			var exp = chance.integer({min:minExp,max:maxExp})
			var plrExp = db.get(short+'.exp').value()
			var newExp = db.get(short+'.exp').value()+(exp)
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
							msg.guild.member(msg.author).setNickname(msg.author.username + " [LVL"+newLvl+"]");
							if (newLvl >= 5) {
								msg.guild.member(msg.author).addRole('378990568832761868')
							}
							if (newLvl >= 10) {
								msg.guild.member(msg.author).addRole('378990995251003392')
							}
							if (newLvl >= 20) {
								msg.guild.member(msg.author).addRole('378991024363536406')
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
