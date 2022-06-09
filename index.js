const child_process = require('child_process');
const rc = require('rcon-client');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
var striptags = require('striptags');

// create the Discord client
const client = new Discord.Client();
const { prefix } = require ('./config.json');
const { token } = require ('./config.json');

/* START UP MESSAGE*/
client.once('ready', () => {
	console.log('Ready!');
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

/* 
### SET BOT'S ACTIVITY TO SEVRER'S TEMPERATURE ###
> run "./temp.sh &"
> temperature is written to log file and read
*/
Tail = require('tail').Tail;
temptail = new Tail("./logfile");
temptail.on("line", function(data) {
  client.user.setActivity(data);
});

/* ---------------------------------------- BASIC STUFF ----------------------------------------- */

const si = require('systeminformation');
var fs = require('fs');
var helpList = fs.readFileSync('./help.txt', 'utf8')
client.on('message', message => {
  if (message.author.bot) return;
	if (message.content === '>online') {
    // send back "hello" to the channel the message was sent in
    message.channel.send('I am online');
	}
	else if  (message.content === '>website') {
    // send back "my website" to the channel the message was sent in
    message.channel.send('https://www.trioffline.com/');
	}
  else if  (message.content === '>help' || message.content === '>commands') {
    // send back help list of commands
    message.channel.send(helpList);
  }
  else if (message.content === '>temps') {
    // send back temperature of server
    si.cpuTemperature().then(tmp=>{message.reply('CPU Main Temp: ' + tmp.main);});
  }

});

/* ---------------------------------------------------------------------------------------------- */



/* -------------------------------------- MANAGING SERVER --------------------------------------- */

/* ASSIGN NEW MEMEBERS A ROLE WHEN THEY JOIN SERVER */
client.on('guildMemberAdd', (guildMember) => {
  let welcomeRole = guildMember.guild.roles.cache.find(role => role.name === 'role');
  guildMember.roles.add(welcomeRole);
});

/* GIVE USER A ROLE WHEN THEY SEND MESSAGE FOR FIRST TIME */
client.on('message', message => {
	if (message.author.bot) return;
	const { guild } = message;
	const userRole = message.member.roles.cache.find(r => r.name === "role");
	if (userRole == null){
		let user = message.author.id;
		let member = guild.members.cache.get(user);
 		const roleName = guild.roles.cache.find(role => role.name === "role");
		member.roles.add(roleName.id);
	}
});

/* Change user's nickname back to something of your choice / previous name*/
client.on('guildMemberUpdate', (before, after) => {
        if (after.user.id == "USER ID") {after.setNickname("Nickname to change to");}
	else if (after.user.id == "USER ID") {after.setNickname(before.nickname);}
});

client.on('message', message => {
	if (message.content.indexOf(prefix) !== 0) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  /* DELETE AN AMOUNT OF MESSAGES (MAX 50) */
  if (command == 'del'){
		if (!args.length) return mesage.reply("Please add how many")
		if(isNaN(args)) return message.reply("No")
		if(args > 50) return message.reply("Max is 50")
		let delA = parseInt(args);
		message.channel.bulkDelete(delA, true);
	}

  /* LIST ALL USERS WITH SPECIFIC ROLE */
  else if(command == 'lt') {
    let roleCheck = args
    const ListEmbed = new Discord.MessageEmbed()
      .setTitle('Users with the '+ roleCheck + 'role:')
      .setDescription(message.guild.roles.cache.find(role => role.name === roleCheck).members.map(m=>m.user.tag).join('\n'));
    message.channel.send(ListEmbed);
  }

  /* FACTORY RESET A CHANNEL AND KICK EVERYONE WITH SPECIFIC ROLE */
  else if(command == 'nuk3') {
		const guild = message.guild;
		const banRole = message.guild.roles.cache.find(role => role.name === 'role').members.map(m=>m.user.id); 
		banRole.forEach(role => {
			message.guild.members.cache.get(role).kick();
		});
		const fetchedChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() ==="channel-name")
		fetchedChannel.delete();
		guild.channels.create('channel-name').then(newChannel => { client.channels.cache.get(newChannel.id).send("Hi welcome to the server, take a look around and feel free to use commands"); client.channels.cache.get(newChannel.id).send("https://tenor.com/view/heart-mtv-90s-music-television-logo-gif-16360898") } )
	}

});

/* REPLY TO USER IF THEY @ THE BOT  */
client.on("message", message => {
  if (message.author.bot) return false;
  if (message.content.includes("@here") || message.content.includes("@everyone")) return false;
  if (message.mentions.has(client.user.id)) {
    message.reply("I am busy right now coding your experience, please @CR3AT0R if you got an enquiry");
  };
});

/* ---------------------------------------------------------------------------------------------- */



/* -------------------------------------- MINECRAFT SERVER -------------------------------------- */

/* START MINECRAFT SERVER */
async function start(){
  child_process.spawn("java",["-Xms2048M", "-Xmx2048M", "-jar", "PATH TO .jar FILE", "nogui"],{cwd:"PATH TO MINECRAFT FOLDER"})
}

/* STOPPING MINECRAFT SERVER */
async function stop() {
  try {
      const rcon = await rc.Rcon.connect({
        host: "localhost", port: 25575, password: "PASSWORD" //input your rcon host / port / password
      });
      console.log('stopping server');
      await rcon.send('stop');
  }
  catch (error) {}
  child_process.exec("sleep 90 ; killall java -9");
}

/* MINECRAFT SERVER CONTROL */
var mcstate = false;
client.on('message', message => {
	if (message.content.indexOf(prefix) !== 0) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
  const roleName = message.member.roles.cache.find(r => r.name === "role") //If you don't want a specifc role starting the server

  if (command == 'startmc' && roleName == null) {
		if (mcstate == false) {
		    start();
		    message.channel.send('Server is starting up...')
		    message.channel.send('Server Address: ADDRESS OF SERVER')
        mcstate = true
		}
    else { message.channel.send('Server is already up')}
	}
	else if (command == 'stopmc' && roleName == null) {
    if (mcstate == true || true) {
		  stop();
		  message.channel.send('Server is shutting down...')
      mcstate = false
    }
  }

});

/* --------------------------------------------------------------------------------------------- */



/* --------------------------------------- ROCKET LEAGUE --------------------------------------- */

/* FUNCTION TO CHECK IF URL IS VALID */
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('GET', url, false);
    http.send();
    if (http.status === 302) {
        var datetime = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate() - 1)
        var stringdate = formatDate(datetime);
        url = 'https://rocket-league.com/content/media/itemshopPreviewDetailed/'+ stringdate +'.jpg'
    }
    else {
    }
    return url;
}

/* FORMAT DATE TO THE CORRECT FORMAT */
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;
  return [year, month, day].join('-');
}

/* ITEM STORE FOR ROCKET LEAGUE AS IMAGE */
client.on('message', message => {
	if (message.content.indexOf(prefix) !== 0) return;
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (command == 'rlstore' && message.channel.id === 'ID OF CHANNEL TO SEND MESSAGE TO') {
    // IF NO ARGUMENT IS GIVEN SHOW TODAY'S STORE
	  if (!args.length) {	
		  var datetime = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate())
      var stringdate = formatDate(datetime);
      url = 'https://rocket-league.com/content/media/itemshopPreviewDetailed/'+ stringdate +'.jpg'
      url = UrlExists(url)
      return message.channel.send(url);
	  }
	  var date_regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
	  var temp = true
    // ELSE VALIDATE FORMAT AND SEND STORE FROM DATE GIVEN 
	  if (!(date_regex.test(args))) {
    	return message.channel.send('Please enter date format YYYY-MM-DD');
	  }
	  else {
        UrlExists(url)
	    	message.channel.send('https://rocket-league.com/content/media/itemshopPreviewDetailed/'+ args +'.jpg');
	  }
  }

});



/* CHECK URL PROVIDED IS VALID */
function UrlCheck(url){
  var http = new XMLHttpRequest();
  http.open('GET', url, false);
  http.send();
  var check = new Boolean(false);
  if (http.status != 404){
    check = true
  }
  else {check = false}
  return check;
}

/* FORMAT FONT */
const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 50;
	do {
		context.font = `${fontSize -= 10}px sans-serif`;
	} while (context.measureText(text).width > canvas.width - 300);
	return context.font;
};

/* RETURN RL TRACKER RESULTS FOR A USER */
client.on('message', async message => {
  //if (message.author.bot) return;
  if (message.content.indexOf(prefix) !== 0) return;
  if (!message.content.startsWith(prefix)) return;
	const { guild } = message;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
	if (command == 'stat'){
    if (!args.length){ message.channel.send('Add your name')}
    else {
			var platform = "";
			if (args[0] == "x" || args[0] == "xbox"){platform = 'xbl';}
			else if (args[0] == "e" || args[0] == "epic"){platform = 'epic';}
			else if (args[0] == "p" || args[0] == "psn"){platform = 'psn';}
			else if (args[0] == "s" || args[0] == "steam"){platform = 'steam';}
			else if (args[0] == "n" || args[0] == "switch"){platform = 'switch'}
			else {return message.channel.send("Please specify the console using {x,p,e,s,n}");}
			temp = args.slice(1).toString().replace(/,/g, ' ');
      var url = `https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${temp}`;
			url = encodeURI(url);
      check = UrlCheck(url);
			if (check){
        const browser =  await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
        const [page] = await browser.pages();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
        await page.goto(url, { waitUntil: "networkidle0" });
        await page.waitFor(1 * 1000);
        let body = await page.evaluate(() => document.body.innerHTML);
        body.toString();
        body = striptags(body);
        /* PYTHON BASED EMULATION
          var body = '{}';
          const {spawn} = require('child_process');
          const python = spawn('./chrome/runit.py', [`${url}`]);
          python.stdout.on('data', function (data) {
          body = data.toString();
        */
        const https = require('https');
        https.get(url, response => {
          response.setEncoding('utf8');
          response.on('data', data => {/* if cloudflare block remove body+=data */ });
          response.on('end', async () => {
            body = JSON.parse(body);
            tour = 9
            pos = 2
            try {
              if (body.data.segments[9].metadata.name == "Un-Ranked"){
                    tour = 8
              }
              if (body.data.segments[4].metadata.name == "Hoops"){
                    pos = 1
              }
            } catch (error) {}

	          try {
              const canvas = Canvas.createCanvas(900, 595);
              const context = canvas.getContext('2d');

              const background = await Canvas.loadImage('./assets/black.jpg');
              context.drawImage(background, 0, 0, canvas.width, canvas.height);
              
              const box = await Canvas.loadImage('./assets/grey.jpg');
                context.drawImage(box, 10, 10, 880, 140);

              const box2 = await Canvas.loadImage('./assets/grey.jpg');
                context.drawImage(box2, 10, 160, 415, 180);

              const box3 = await Canvas.loadImage('./assets/grey.jpg');
                context.drawImage(box3, 435, 160, 455, 180);

              const box4 = await Canvas.loadImage('./assets/grey.jpg');
                context.drawImage(box4, 10, 350, 415, 235);

              const box5 = await Canvas.loadImage('./assets/grey.jpg');
                context.drawImage(box5, 435, 350, 455, 235);

              context.strokeStyle = '#0099ff';
              context.strokeRect(0, 0, canvas.width, canvas.height);
              
              // NAME
              context.font = '28px sans-serif';
              context.fillStyle = '#00ccff';
              context.fillText('PLAYER NAME', 30, 50);

              context.font = applyText(canvas, body.data.platformInfo.platformUserHandle);
              context.fillStyle = '#ffffff';
              context.fillText(body.data.platformInfo.platformUserHandle, 30 , 100);

              //REWARDS
              context.font = '28px sans-serif';
                context.fillStyle = '#00ccff';
                context.fillText('REWARD LEVEL', 450, 50);
              context.font = applyText(canvas, body.data.segments[0].stats.seasonRewardLevel.metadata.rankName);
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[0].stats.seasonRewardLevel.metadata.rankName, 450 , 100);
              const reward = await Canvas.loadImage(body.data.segments[0].stats.seasonRewardLevel.metadata.iconUrl);
                context.drawImage(reward, 725, 5, 150, 150);

              //1v1
              context.font = '28px sans-serif';
                context.fillStyle = '#00ccff';
                context.fillText(body.data.segments[pos].metadata.name, 30, 200);

              context.font = '25px sans-serif';
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos].stats.division.metadata.name, 272, 310);

              context.font = applyText(canvas, body.data.segments[pos].stats.rating.value);
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos].stats.rating.value + " MMR", 30 , 255);

              try {
                context.font = '25px sans-serif';
                context.fillStyle = '#737373';
                context.fillText(body.data.segments[pos].stats.division.metadata.deltaDown + "v  ⚬  " + body.data.segments[pos].stats.division.metadata.deltaUp + "∧", 30, 300);
              } catch (error) {}

              const OneRank = await Canvas.loadImage(body.data.segments[pos].stats.tier.metadata.iconUrl);
              context.drawImage(OneRank, 270, 150, 150, 150);

              //2v2
              context.font = '28px sans-serif';
                context.fillStyle = '#00ccff';
                context.fillText(body.data.segments[pos + 1].metadata.name, 450, 200);

              context.font = '25px sans-serif';
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos + 1].stats.division.metadata.name, 725, 310);

              context.font = applyText(canvas, body.data.segments[pos + 1].stats.rating.value);
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos + 1].stats.rating.value + " MMR", 450 , 255);
		
              try {
              context.font = '25px sans-serif';
                context.fillStyle = '#737373';
                context.fillText(body.data.segments[pos + 1].stats.division.metadata.deltaDown + "v  ⚬  " + body.data.segments[pos + 1].stats.division.metadata.deltaUp + "∧", 450, 300);
              } catch (error) {}

              const twoRank = await Canvas.loadImage(body.data.segments[pos + 1].stats.tier.metadata.iconUrl);
              context.drawImage(twoRank, 725, 150, 150, 150);

              //3v3
              context.font = '28px sans-serif';
                context.fillStyle = '#00ccff';
                context.fillText(body.data.segments[pos + 2].metadata.name, 30, 400);

              context.font = '25px sans-serif';
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos + 2].stats.division.metadata.name, 272, 560);

              context.font = applyText(canvas, body.data.segments[pos + 2].stats.rating.value);
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[pos + 2].stats.rating.value + " MMR", 30 , 455);

              try {
                context.font = '25px sans-serif';
                context.fillStyle = '#737373';
                context.fillText(body.data.segments[pos + 2].stats.division.metadata.deltaDown + "v  ⚬  " + body.data.segments[pos + 2].stats.division.metadata.deltaUp + "∧", 30, 500);
              } catch (error) {}

              const ThreeRank = await Canvas.loadImage(body.data.segments[pos + 2].stats.tier.metadata.iconUrl);
              context.drawImage(ThreeRank, 270, 400, 150, 150);
		
              try {
                //CHAMP
                context.font = '28px sans-serif';
                context.fillStyle = '#00ccff';
                context.fillText(body.data.segments[tour].metadata.name, 450, 400);

                context.font = applyText(canvas, body.data.segments[tour].stats.tier.metadata.name);
                context.fillStyle = '#ffffff';
                context.fillText(body.data.segments[tour].stats.tier.metadata.name, 450 , 455);

                const CHRank = await Canvas.loadImage(body.data.segments[tour].stats.tier.metadata.iconUrl);
                context.drawImage(CHRank, 725, 400, 150, 150);
              } catch (error) {"TESTING THIS"}


              //PRINT STUFF
              context.beginPath();
              context.arc(125, 125, 100, 0, Math.PI * 2, true);
              context.closePath();
              context.clip();
              const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'statistics.png');
              message.reply({ files: [attachment] }).then(async (embedmsg) => {
                await embedmsg.react('🔁').then(() => {
                  const filter = (reaction, user) => (reaction.emoji.name === '🔁');
                  let collector = embedmsg.createReactionCollector(
                    () => {return true;},{
                    time: 360000,
                    dispose: true,
                  });
                  collector.on('collect', r => r.emoji.name === '🔁' ? message.channel.send(`>stat ${args[0]} ${temp}`) : console.log('No'));
                });
              });
	          }catch (error) {console.log(error); python.on('close', (code) => {});}
            });
        }); //comment this one out
        //});
        //python.on('close', (code) => {});
        await browser.close();
      }
      else {message.channel.send("Can't find user");}
    }
	}
});

/* --------------------------------------------------------------------------------------------- */



/* ------------------------------------------- STUFF ------------------------------------------- */

/* PICK A RANDOM NUMBER */
function getRandomNumberBetween(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

/* READ ONE LINE FROM A FILE */
const lineReader = require('line-reader');
function getLine(msg) {
  var lineNum = getRandomNumberBetween(0,728);
  var fs = require('fs');
  var readline = require('readline');
  var cntr = 0;
  var rl = readline.createInterface({
      input: fs.createReadStream('./List.txt')
  });

  rl.on('line', function(line) {
      if (cntr++ === lineNum) {
   return msg.edit(`${line}`)
      }
  });
}

/* PRINT ONE RANDOM LINE FROM A TEXT FILE OF LINES, REFRESH THE LINE BY REACTING TO EMOJI (CAN BE USED FOR IMAGES)*/
client.on('message', async message => {
if (message.content.indexOf(prefix) !== 0) return;
if (!message.content.startsWith(prefix)) return;
const { guild } = message;
const args = message.content.slice(prefix.length).trim().split(/ +/);
const command = args.shift().toLowerCase();
if (command == 'one' && message.channel.id === 'ID') {
  var lineNum = getRandomNumberBetween(0,728);
  var fs = require('fs');
  var readline = require('readline');
  var cntr = 0;

  var rl = readline.createInterface({
    input: fs.createReadStream('./List.txt')
  });

  rl.on('line', function(line) {
    if (cntr++ === lineNum) {
      message.channel.send(`${line}`).then(async (embedmsg) => {
        await embedmsg.react('🔁').then(() => {
          const filter = (reaction, user) => (reaction.emoji.name === '🔁');
          let collector = embedmsg.createReactionCollector(
            () => {return true;},{
            time: 360000,
            dispose: true,
          });
          collector.on('collect', r => r.emoji.name === '🔁' ? /*embedmsg.edit('>one')*/ getLine(embedmsg) : console.log('No'));
        });
      });
    }
  });
};
});

/* --------------------------------------------------------------------------------------------- */



/* ----------------------------------- PLAYING YOUTUBE AUDIO ----------------------------------- */

const queue = new Map();
client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const serverQueue = queue.get(message.guild.id);

  /* PLAY YOUTUBE LINK PROVIDED */
  if (message.content.startsWith(`${prefix}p`)) {
    try {
	    execute(message, serverQueue);
    } catch (err){console.log(err)};
    return;
  }

  /* SKIP CURRENT SONG PLAYING */
  else if (message.content.startsWith(`${prefix}skip`)) {
    try {
      skip(message, serverQueue);
    }catch(err){console.log(err)};
    return;
  }

  /* CLEAR QUEUE AND BOT LEAVES VC */
  else if (message.content.startsWith(`${prefix}clear`)) {
    try {
    	clear(message, serverQueue);
    }catch(err){console.log(err)};
    return;
  }

  /* PRINT QUEUE */
  else if (message.content.startsWith(`${prefix}queue`)) {
    list = printQueue(message, serverQueue);
    const embed = new Discord.MessageEmbed()
    .setTitle("QUEUE LIST")
    .setColor(0x00AE86)
    .setDescription(list)
    .setTimestamp()
    message.channel.send({embed})
    return;
  }

  /* PAUSE CURRENT SONG (very buggy and might not work)*/
  else if (message.content.startsWith(`${prefix}pause`)) {
    serverQueue.connection.dispatcher.pause()
    return;
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) 
    return message.channel.send("You need to be in a voice channel to play music!");
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send("I need the permissions to join and speak in your voice channel!");
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("You have to be in a voice channel to stop the music!");
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function clear(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send("You have to be in a voice channel to stop the music!");    
  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");   
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url, { filter : 'audioonly' }))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

function printQueue(message,serverQueue){
  if (!serverQueue) return message.channel.send("Queue is empty");
  try{
    var list = ""
    for (let item of serverQueue.songs) {
      list = "- " + list + "\n"  +item.title;
    }
    return list
  } catch(err){console.log(err)};
}

/* --------------------------------------------------------------------------------------------- */

client.login(token)
