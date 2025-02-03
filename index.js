const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

// Load commands
const duel = require('./duel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('ready', () => {
    console.log(`${client.user.tag} has logged in!`);
});

// Handling the !duel command
client.on('messageCreate', (message) => {
    if (message.content.startsWith('!duel')) {
        duel.handleDuel(message);
    }
});

client.login(process.env.DISCORD_TOKEN);