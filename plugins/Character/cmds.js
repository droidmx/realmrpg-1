const fs=require('fs'); //import the filesystem
const low=require('lowdb'); //import lowdb which we use for the database
const fsy=require('lowdb/adapters/FileSync');

exports.commands=["create"] //a list of usable commands

exports.create={
  usage:"create",
  description:"Create",
  process:function(bot,msg,suffix){
    const adapter=new FileSync('test-file.json');
    const db=low(adapter);
    if(db.get(`chars.${msg.author.id}`).value()) return; //don't go on if the user already has a character.
                                                         //TODO: add a cancel message
    var done=false; //done variable for checking later
    msg.channel.send(ce(2,`${msg.author.username}, to create your character, react to this message with the class of your choosing.`,null,msg.author))
      .then(m=>function(){
        bot.on("messageReactionAdd",reaction,user=>{ //check if a reaction is added to a message
          const class=reaction._emoji.name.charAt(0).toUpperCase()+reaction._emoji.name.splice(1); //take emoji name then uppercase 1st letter
          if(!done) {
            db.set(`chars.${msg.author.id}`, class).write(); //write the player's class to the database
            done=true;
            m.edit(ce(1,`${msg.author.username}, you have created your character, which is of the ${class} class.`,null,msg.author));
          }
        })
      })
  }
}
