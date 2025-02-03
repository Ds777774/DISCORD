const { Client, GatewayIntentBits } = require('discord.js');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const duelCommand = require('./duel');  // Import the duel command

dotenv.config();

// Set up PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Log in to Discord using the bot token from environment variables
client.login(process.env.BOT_TOKEN);

// When the bot is ready
client.once('ready', () => {
    console.log(`${client.user.tag} is now online!`);
});

// Command handler
client.on('messageCreate', async (message) => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Check if the message is a duel command
    if (message.content.startsWith('!duel')) {
        // Split the message to get the list of players
        const args = message.content.split(' ').slice(1);
        if (args.length < 2) {
            return message.channel.send('Please mention at least two players for the duel.');
        }

        // Call the duel command handler
        await duelCommand.execute(message, args);
    }
});