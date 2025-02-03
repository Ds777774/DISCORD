const { EmbedBuilder } = require('discord.js');
const { russianQuizData } = require('./russianData');
const { germanQuizData } = require('./germanData');
const { frenchQuizData } = require('./frenchData');

module.exports.startQuiz = async (user, selectedLanguage, userId, duelData) => {
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

    const level = 'A1'; // Can be adjusted to prompt for level selection like in your quiz logic
    const questions = quizData[level];
    shuffleArray(questions);

    const questionsToAsk = questions.slice(0, 5);
    if (questionsToAsk.length === 0) {
        return;
    }

    const emojis = ['🇦', '🇧', '🇨', '🇩'];

    duelData.detailedResults.push({ userId: userId, results: [] });

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
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === userId,
            max: 1,
            time: 60000,
        });

        const userReaction = quizReaction.first();
        const correctEmoji = emojis[question.options.indexOf(correctOption)];
        const userAnswer = userReaction ? question.options[emojis.indexOf(userReaction.emoji.name)] : 'No Answer';
        const isCorrect = userReaction && userReaction.emoji.name === correctEmoji;

        if (isCorrect) {
            duelData.scores[duelData.blueTeam.includes(userId) ? 'blue' : 'red']++;
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