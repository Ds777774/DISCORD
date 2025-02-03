const { MessageEmbed } = require('discord.js');
const { frenchQuizData } = require('./frenchduel');
const { germanQuizData } = require('./germanduel');
const { russianQuizData } = require('./russianduel');
const { Pool } = require('pg');

// Set up PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = {
    name: 'duel',
    description: 'Duel game between players',
    async execute(message, args) {
        // Command only available to the user who invoked it
        if (!args.length) {
            return message.channel.send("Please mention players for the duel!");
        }

        const players = args.map(arg => arg.replace(/[<@!>]/g, ''));  // Clean player mentions
        const totalPlayers = players.length;

        if (totalPlayers < 2) {
            return message.channel.send("Need at least 2 players for a duel.");
        }

        // Fetch leaderboard data for players
        const playerData = await pool.query('SELECT * FROM leaderboard WHERE discord_id = ANY($1::text[])', [players]);

        // Form teams based on performance
        const teamRed = [];
        const teamBlue = [];
        const sortedPlayers = playerData.rows.sort((a, b) => b.score - a.score); // Sort by score

        for (let i = 0; i < sortedPlayers.length; i++) {
            if (i % 2 === 0) {
                teamRed.push(sortedPlayers[i]);
            } else {
                teamBlue.push(sortedPlayers[i]);
            }
        }

        // Create embed for teams
        const teamEmbed = new MessageEmbed()
            .setTitle('Teams for Duel')
            .addField('Team Red', teamRed.map(p => p.name).join('\n'))
            .addField('Team Blue', teamBlue.map(p => p.name).join('\n'))
            .setColor('#FF0000');

        // Show teams for 10 seconds
        const teamMessage = await message.channel.send({ embeds: [teamEmbed] });
        setTimeout(() => teamMessage.delete(), 10000);

        // Randomly choose which team will start
        const startingTeam = Math.random() > 0.5 ? 'Red' : 'Blue';

        const startEmbed = new MessageEmbed()
            .setTitle(`${startingTeam} team will start first`)
            .setColor('#00FF00');

        await message.channel.send({ embeds: [startEmbed] });

        // Ask questions for the starting team
        const askQuestions = async (team, teamName) => {
            for (let player of team) {
                const languageData = getLanguageData(player.language); // Get language data based on player performance
                const questions = languageData[player.level];

                let correctAnswers = 0;
                let totalTime = 0;

                for (let q = 0; q < questions.length; q++) {
                    const question = questions[q];
                    const questionEmbed = new MessageEmbed()
                        .setTitle(`Question ${q + 1}`)
                        .setDescription(`What is the English meaning of "${question.word}"?`)
                        .setColor('#FFFF00')
                        .addField('Options', question.options.join('\n'));

                    const questionMessage = await message.channel.send({ embeds: [questionEmbed] });

                    // User must react to answer
                    await questionMessage.react('🇦');
                    await questionMessage.react('🇧');
                    await questionMessage.react('🇨');
                    await questionMessage.react('🇩');

                    // Wait for the user's reaction (12 seconds per question)
                    const filter = (reaction, user) => user.id === player.discord_id;
                    const collected = await questionMessage.awaitReactions({
                        filter,
                        max: 1,
                        time: 12000,
                    });

                    // Calculate the result
                    const answer = collected.first();
                    if (answer.emoji.name === getEmojiFromAnswer(question.correct)) {
                        correctAnswers++;
                    }

                    totalTime += 12; // Add 12 seconds for each question
                }

                // Send result for the player
                const resultEmbed = new MessageEmbed()
                    .setTitle(`${player.name} - ${teamName} Team`)
                    .addField('Correct Answers', `${correctAnswers}/5`)
                    .addField('Time Taken', `${totalTime}s`)
                    .setColor('#00FF00');
                await message.channel.send({ embeds: [resultEmbed] });
            }

            return correctAnswers;
        };

        // Set target for the second team based on the first team's score
        const blueScore = await askQuestions(teamBlue, 'Blue');
        const redScore = await askQuestions(teamRed, 'Red');

        const targetEmbed = new MessageEmbed()
            .setTitle('Target for Red Team')
            .addField('Team Blue', `${blueScore}/25`)
            .addField('Red Team needs to score', `${blueScore + 1}`)
            .setColor('#0000FF');
        await message.channel.send({ embeds: [targetEmbed] });

        // Determine winner based on score and time
        // To be implemented
    },
};

function getLanguageData(language) {
    switch (language) {
        case 'French': return frenchQuizData;
        case 'German': return germanQuizData;
        case 'Russian': return russianQuizData;
        default: return frenchQuizData; // Default to French
    }
}

function getEmojiFromAnswer(answer) {
    switch (answer) {
        case 'A': return '🇦';
        case 'B': return '🇧';
        case 'C': return '🇨';
        case 'D': return '🇩';
        default: return '';
    }
}