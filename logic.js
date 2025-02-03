const { EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const { russianQuizData } = require('./russianData');
const { germanQuizData } = require('./germanData');
const { frenchQuizData } = require('./frenchData');

// PostgreSQL client setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports.getUserLevel = async (userId) => {
    try {
        // Query the leaderboard table for the user's highest level
        const result = await pool.query('SELECT level FROM leaderboard WHERE user_id = $1 ORDER BY score DESC LIMIT 1', [userId]);
        if (result.rows.length > 0) {
            return result.rows[0].level; // Return the highest level found
        }
        return 'A1'; // Default level if no data found
    } catch (err) {
        console.error('Error fetching user level:', err);
        return 'A1'; // Default level in case of error
    }
};

module.exports.startQuiz = async (user, selectedLanguage, userLevel, duelData) => {
    let quizData;
    if (selectedLanguage === 'german') {
        quizData = germanQuizData;
    } else if (selectedLanguage === 'french') {
        quizData = frenchQuizData;
    } else if (selectedLanguage === 'russian') {
        quizData = russianQuizData;
    } else {
        return;
    }

    const questions = quizData[userLevel] || quizData['A1']; // Ensure level exists in quiz data
    shuffleArray(questions);

    const questionsToAsk = questions.slice(0, 5);
    if (questionsToAsk.length === 0) {
        return;
    }

    const emojis = ['🇦', '🇧', '🇨', '🇩'];

    duelData.detailedResults.push({ userId: user.id, results: [] });

    for (const question of questionsToAsk) {
        const correctOption = question.correct;
        question.options = question.options.sort(() => Math.random() - 0.5); // Shuffle options
        question.correct = correctOption;

        const quizEmbed = new EmbedBuilder()
            .setTitle(`**${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Vocabulary Quiz**`)
            .setDescription(
                `What is the English meaning of **"${question.word}"**?\n\n` +
                `A) ${question.options[0]}\n` +
                `B) ${question.options[1]}\n` +
                `C) ${question.options[2]}\n` +
                `D) ${question.options[3]}`
            )
            .setColor('#f4ed09') // Change based on language
            .setFooter({ text: 'React with the emoji corresponding to your answer.' });

        const quizMessage = await user.send({ embeds: [quizEmbed] });
        for (const emoji of emojis) {
            await quizMessage.react(emoji);
        }

        const quizReaction = await quizMessage.awaitReactions({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === user.id,
            max: 1,
            time: 60000,
        });

        const userReaction = quizReaction.first();
        const correctEmoji = emojis[question.options.indexOf(correctOption)];
        const userAnswer = userReaction ? question.options[emojis.indexOf(userReaction.emoji.name)] : 'No Answer';
        const isCorrect = userReaction && userReaction.emoji.name === correctEmoji;

        if (isCorrect) {
            duelData.scores[duelData.blueTeam.includes(user.id) ? 'blue' : 'red']++;
        }

        duelData.detailedResults.push({
            word: question.word,
            userAnswer: userAnswer,
            correct: correctOption,
            isCorrect: isCorrect,
        });

        await quizMessage.delete();
    }
};

module.exports.getTeamResults = async (message, duelData) => {
    const resultEmbed = new EmbedBuilder()
        .setTitle('Duel Results')
        .setDescription(
            `**Blue Team Score:** ${duelData.scores.blue}\n` +
            `**Red Team Score:** ${duelData.scores.red}\n\n` +
            `The winning team is ${duelData.scores.blue > duelData.scores.red ? 'Blue' : 'Red'} Team!`
        )
        .setColor('#acf508');

    await message.channel.send({ embeds: [resultEmbed] });
};

module.exports.shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
};