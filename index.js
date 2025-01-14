const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// Use environment variable for the bot token and client ID
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('Error: DISCORD_TOKEN or CLIENT_ID environment variable is not set.');
  process.exit(1); // Exit the app if the token or client ID is missing
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
  { word: 'Apfel', meaning: 'Apple', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇦' },
  { word: 'Haus', meaning: 'House', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇧' },
  { word: 'Hund', meaning: 'Dog', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇨' },
  { word: 'Katze', meaning: 'Cat', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇩' },
  { word: 'Tisch', meaning: 'Table', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Stuhl', meaning: 'Chair', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇧' },
  { word: 'Bett', meaning: 'Bed', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇨' },
  { word: 'Tür', meaning: 'Door', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇩' },
  { word: 'Fenster', meaning: 'Window', options: ['A: Window', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Lampe', meaning: 'Lamp', options: ['A: Table', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇧' }
];

// Function to register the slash command
const registerCommands = async () => {
  const commands = [
    {
      name: 'quiz',
      description: 'Start a German vocabulary quiz',
    }
  ];

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
};

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
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands(); // Register slash commands on startup
});

// Event listener for interaction creation
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== 'quiz') return;

  if (quizInProgress) {
    return interaction.reply({ content: 'A quiz is already in progress. Please wait until it finishes.', ephemeral: true });
  }

  quizInProgress = true;

  shuffleArray(words); // Shuffle questions
  const selectedWords = words.slice(0, 5); // Select 5 random words
  let score = 0;
  let detailedResults = [];

  for (let i = 0; i < selectedWords.length; i++) {
    const currentWord = selectedWords[i];
    const question = `What is the English meaning of the German word "${currentWord.word}"?`;

    const quizMessage = await sendQuizMessage(interaction.channel, question, currentWord.options);

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

  await interaction.reply({ embeds: [resultEmbed] });
});

// Log in to Discord with the bot token
client.login(TOKEN);