const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const cron = require('node-cron');

// Use environment variable for the bot token
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('Error: DISCORD_TOKEN environment variable is not set.');
  process.exit(1); // Exit the app if the token is missing
}

// Create a new client instance with correct intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Express server setup to keep the bot alive
const app = express();
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// List of German words and their meanings
const words = [
  { word: 'Apfel', meaning: 'Apple' },
  { word: 'Haus', meaning: 'House' },
  { word: 'Hund', meaning: 'Dog' },
  { word: 'Katze', meaning: 'Cat' },
  { word: 'Tisch', meaning: 'Table' },
  { word: 'Stuhl', meaning: 'Chair' },
  { word: 'Bett', meaning: 'Bed' },
  { word: 'Tür', meaning: 'Door' },
  { word: 'Fenster', meaning: 'Window' },
  { word: 'Lampe', meaning: 'Lamp' }
];

// Shuffle array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Quiz management variables
let quizInProgress = false;

// Function to send a quiz message
const sendQuizMessage = async (channel, question, options) => {
  const embed = new EmbedBuilder()
    .setTitle('**German Vocabulary Quiz**')
    .setDescription(question)
    .addFields(options.map((opt) => ({ name: opt, value: '\u200B', inline: true })))
    .setColor('#0099ff')
    .setFooter({ text: 'React with the emoji corresponding to your answer' });

  const quizMessage = await channel.send({ embeds: [embed] });

  for (const option of ['🇦', '🇧', '🇨', '🇩']) {
    await quizMessage.react(option);
  }

  return quizMessage;
};

// Event listener when the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Event listener for messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!quiz') {
    if (quizInProgress) {
      return message.reply('A quiz is already in progress. Please wait until it finishes.');
    }

    quizInProgress = true;

    shuffleArray(words); // Shuffle questions
    const selectedWords = words.slice(0, 5); // Select 5 random words
    let score = 0;
    let detailedResults = [];

    for (let i = 0; i < selectedWords.length; i++) {
      const currentWord = selectedWords[i];
      const question = `What is the English meaning of the German word "${currentWord.word}"?`;

      const quizMessage = await sendQuizMessage(message.channel, question, currentWord.options);

      const filter = (reaction, user) =>
        ['🇦', '🇧', '🇨', '🇩'].includes(reaction.emoji.name) && !user.bot;

      try {
        const collected = await quizMessage.awaitReactions({ filter, max: 1, time: 15000 });
        const reaction = collected.first();

        if (reaction) {
          const userChoiceIndex = ['🇦', '🇧', '🇨', '🇩'].indexOf(reaction.emoji.name);
          const userAnswer = currentWord.options[userChoiceIndex].split(': ')[1]; // Extract answer
          const isCorrect = userAnswer === currentWord.meaning;

          if (isCorrect) {
            score++;
          }

          detailedResults.push({
            word: currentWord.word,
            userAnswer: userAnswer,
            correct: currentWord.meaning,
            isCorrect: isCorrect
          });
        } else {
          detailedResults.push({
            word: currentWord.word,
            userAnswer: 'No reaction',
            correct: currentWord.meaning,
            isCorrect: false
          });
        }
      } catch (error) {
        console.error('Reaction collection failed:', error);
        detailedResults.push({
          word: currentWord.word,
          userAnswer: 'No reaction',
          correct: currentWord.meaning,
          isCorrect: false
        });
      }

      await quizMessage.delete();
    }

    quizInProgress = false;

    const resultEmbed = new EmbedBuilder()
      .setTitle('Quiz Results')
      .setDescription(`You scored ${score} out of 5!`)
      .setColor('#00FF00');

    let resultsDetail = '';

    detailedResults.forEach((result) => {
      resultsDetail += `**German word:** "${result.word}"\n` +
        `Your answer: ${result.userAnswer}\n` +
        `Correct answer: ${result.correct}\n` +
        `Result: ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}\n\n`;
    });

    resultEmbed.addFields({ name: 'Detailed Results', value: resultsDetail });

    await message.channel.send({ embeds: [resultEmbed] });
  }
});

// Word of the Day (scheduled task)
cron.schedule('40 12 * * *', async () => {
  const randomWord = words[Math.floor(Math.random() * words.length)];

  const wordEmbed = new EmbedBuilder()
    .setTitle('**Word of the Day**')
    .addFields(
      { name: 'German Word', value: randomWord.word, inline: true },
      { name: 'English Meaning', value: randomWord.meaning, inline: true }
    )
    .setColor('#FFCC00');

  const channel = await client.channels.fetch('1327875414584201350'); // Updated channel ID
  await channel.send({ embeds: [wordEmbed] });
});

// Log in the bot
client.login(TOKEN);