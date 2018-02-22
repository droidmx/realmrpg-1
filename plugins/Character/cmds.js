const fs=require('fs'); //import the filesystem
const low=require('lowdb'); //import lowdb which we use for the database
const fsy=require('lowdb/adapters/FileSync');

exports.commands=["create","reset"] //a list of usable commands

exports.create={
  usage:"create",
  description:"Create",
  process:function(bot,msg,suffix){
    //TODO: sync this with code on the server
    adapter=new FileSync('path');
    db=lowdb(adapter);
    //TODO:stats,inventory,vault
  }
}

exports.reset={
  usage:"reset",
  description:"Reset",
  process:function(bot,msg,suffix){
    if(!fs.existsSync(`users/${msg.author.id}`)) return;
    fs.unlink(`users/${msg.author.id}`,function(err){if(err) console.log(err)});
    msg.channel.send('1',`${msg.author.username}, your character was deleted successfully!`,null,msg.author);
    return;
  }
}

exports.c={
  usage:"c",
  description:"Char",
  aliases:["char","character","ch","charinfo"],
  process:function(bot,msg,suffix){
    adapter=new FileSync('path');
    db=lowdb(adapter);
    var clss=db.get('class').value();
    return msg.channel.send('2',`${msg.author.username}, your character is a ${clss}.`,null,msg.author);
  }
}
