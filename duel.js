const { EmbedBuilder } = require('discord.js');
const { startQuiz, shuffleArray, getTeamResults, getUserLevel } = require('./logic');
const { Pool } = require('pg'); // PostgreSQL client

const embedColors = {
    russian: '#7907ff',
    german: '#f4ed09',
    french: '#09ebf6',
    default: '#acf508',
};

const activeDuels = {};

// PostgreSQL client setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports.handleDuel = async (message) => {
    const mentionedUsers = message.mentions.users.array();

    if (mentionedUsers.length < 2 || mentionedUsers.length > 10) {
        return message.channel.send('Please mention at least 2 and at most 10 users for the duel.');
    }

    try {
        // Select Language
        const languageEmbed = new EmbedBuilder()
            .setTitle('Choose a Language for the Duel Quiz')
            .setDescription('React to select the language:\n\n🇩🇪: German\n🇫🇷: French\n🇷🇺: Russian')
            .setColor(embedColors.default);

        const languageMessage = await message.channel.send({ embeds: [languageEmbed] });
        const languageEmojis = ['🇩🇪', '🇫🇷', '🇷🇺'];
        const languages = ['german', 'french', 'russian'];

        for (const emoji of languageEmojis) {
            await languageMessage.react(emoji);
        }

        const languageReaction = await languageMessage.awaitReactions({
            filter: (reaction, user) => languageEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
        });

        if (!languageReaction.size) {
            await languageMessage.delete();
            return message.channel.send('No language selected. Duel cancelled.');
        }

        const selectedLanguage = languages[languageEmojis.indexOf(languageReaction.first().emoji.name)];
        await languageMessage.delete();

        // Create Teams
        const blueTeam = mentionedUsers.slice(0, Math.ceil(mentionedUsers.length / 2));
        const redTeam = mentionedUsers.slice(Math.ceil(mentionedUsers.length / 2));

        // Show Teams
        const teamEmbed = new EmbedBuilder()
            .setTitle('Duel Teams')
            .setDescription(
                `**Blue Team**\n` + blueTeam.map(user => user.tag).join('\n') +
                `\n\n**Red Team**\n` + redTeam.map(user => user.tag).join('\n')
            )
            .setColor(embedColors.default);

        const teamMessage = await message.channel.send({ embeds: [teamEmbed] });
        setTimeout(() => teamMessage.delete(), 10000);

        // Randomly Select Starting Team
        const startingTeam = Math.random() > 0.5 ? 'blue' : 'red';
        const startMessage = new EmbedBuilder()
            .setTitle('Duel Starting!')
            .setDescription(`${startingTeam.charAt(0).toUpperCase() + startingTeam.slice(1)} Team will start first.`)
            .setColor(embedColors.default);

        const startMessageSend = await message.channel.send({ embeds: [startMessage] });
        setTimeout(() => startMessageSend.delete(), 5000);

        // Start Duel - Fetch user levels from leaderboard table
        const duelData = {
            blueTeam: blueTeam.map(user => user.id),
            redTeam: redTeam.map(user => user.id),
            language: selectedLanguage,
            scores: { blue: 0, red: 0 },
            detailedResults: [],
            startTeam: startingTeam,
        };

        // Fetch levels for each user from the leaderboard table
        for (const team of [blueTeam, redTeam]) {
            for (const user of team) {
                const level = await getUserLevel(user.id);
                duelData[user.id] = { level }; // Store the level
                await startQuiz(user, selectedLanguage, level, duelData); // Pass level to startQuiz
            }
        }

        // Calculate Winning Team
        await getTeamResults(message, duelData);

        // Reset the duel tracking after the results
        delete activeDuels[message.author.id];
    } catch (error) {
        console.error(error);
        message.channel.send('An error occurred. Please try again.');
    }
};