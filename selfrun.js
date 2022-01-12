const Discord = require('discord.js');
const client = new Discord.Client();

const { prefix } = require ('./config.json');
const { token } = require ('./config.json');

client.once('ready', () => {
        client.channels.cache.get('CHANNEL ID').send('MESSAGE TO SEND');
	
});

client.login(token)

