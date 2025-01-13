const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');

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

// List of 20 German words and their meanings
const words = [
  { word: 'Apfel', meaning: 'Apple', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇦' },
  { word: 'Haus', meaning: 'House', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇧' },
  // ... add the remaining words here ...
];

// Quiz management variables
let quizInProgress = false;
let currentQuestion = 0;
let score = 0;
let quizChannel;

// Function to send a quiz message
const sendQuizMessage = async (channel, question, options) => {
  const embed = new EmbedBuilder()
    .setTitle('**German Vocabulary Quiz**')
    .setDescription(question)
    .addFields(options.map((opt, index) => ({ name: opt, value: '\u200B', inline: true })))
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
  if (message.content.toLowerCase() === '!quiz') {
    if (quizInProgress) {
      return message.reply('A quiz is already in progress. Please wait until it finishes.');
    }

    quizInProgress = true;
    quizChannel = message.channel;
    currentQuestion = 0;
    score = 0;

    while (currentQuestion < 5) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const question = `What is the English meaning of the German word "${randomWord.word}"?`;

      const quizMessage = await sendQuizMessage(quizChannel, question, randomWord.options);

      const filter = (reaction, user) =>
        ['🇦', '🇧', '🇨', '🇩'].includes(reaction.emoji.name) && !user.bot;

      const collected = await quizMessage
        .awaitReactions({ filter, max: 1, time: 15000 })
        .catch(() => null);

      const reaction = collected?.first();
      if (reaction?.emoji.name === randomWord.correct) {
        score++;
      }

      currentQuestion++;
      await quizMessage.delete();
    }

    quizInProgress = false;

    const resultEmbed = new EmbedBuilder()
      .setTitle('Quiz Results')
      .setDescription(`You scored ${score} out of 5!`)
      .setColor('#00FF00');

    await quizChannel.send({ embeds: [resultEmbed] });
  }
});

// Log in to Discord with the app's token
client.login(TOKEN);