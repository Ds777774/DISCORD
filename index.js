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
  { word: 'Hund', meaning: 'Dog', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇨' },
  { word: 'Katze', meaning: 'Cat', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇩' },
  { word: 'Tisch', meaning: 'Table', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Stuhl', meaning: 'Chair', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇧' },
  { word: 'Bett', meaning: 'Bed', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇨' },
  { word: 'Tür', meaning: 'Door', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇩' },
  { word: 'Fenster', meaning: 'Window', options: ['A: Window', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Lampe', meaning: 'Lamp', options: ['A: Table', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇧' },
  { word: 'Schule', meaning: 'School', options: ['A: Table', 'B: Chair', 'C: School', 'D: Door'], correct: '🇨' },
  { word: 'Lehrer', meaning: 'Teacher', options: ['A: Teacher', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Buch', meaning: 'Book', options: ['A: Book', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇧' },
  { word: 'Stadt', meaning: 'City', options: ['A: City', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇨' },
  { word: 'Land', meaning: 'Country', options: ['A: Country', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Wasser', meaning: 'Water', options: ['A: Water', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇧' },
  { word: 'Feuer', meaning: 'Fire', options: ['A: Table', 'B: Chair', 'C: Fire', 'D: Door'], correct: '🇨' },
  { word: 'Himmel', meaning: 'Sky', options: ['A: Sky', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇩' },
  { word: 'Sonne', meaning: 'Sun', options: ['A: Sun', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇦' },
  { word: 'Mond', meaning: 'Moon', options: ['A: Table', 'B: Chair', 'C: Moon', 'D: Door'], correct: '🇧' },
  { word: 'Stern', meaning: 'Star', options: ['A: Star', 'B: Chair', 'C: Bed', 'D: Door'], correct: '🇨' },
  { word: 'Baum', meaning: 'Tree', options: ['A: Tree', 'B: Lamp', 'C: Bed', 'D: Door'], correct: '🇩' }
];

// Shuffle the questions
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Quiz management variables
let quizInProgress = false;
let score = 0;
let incorrectResults = []; // Store incorrect answers

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
    score = 0;
    incorrectResults = []; // Reset the incorrect results

    // Shuffle questions and select the first 5
    shuffleArray(words);
    const selectedWords = words.slice(0, 5);

    for (let i = 0; i < selectedWords.length; i++) {
      const currentWord = selectedWords[i];
      const question = `What is the English meaning of the German word "${currentWord.word}"?`;

      const quizMessage = await sendQuizMessage(message.channel, question, currentWord.options);

      const filter = (reaction, user) =>
        ['🇦', '🇧', '🇨', '🇩'].includes(reaction.emoji.name) && !user.bot;

      try {
        const collected = await quizMessage.awaitReactions({ filter, max: 1, time: 15000 });
        const reaction = collected.first();

        const userAnswer = currentWord.options[['🇦', '🇧', '🇨', '🇩'].indexOf(reaction?.emoji.name)];
        const isCorrect = reaction?.emoji.name === currentWord.correct;

        if (isCorrect) {
          score++;
        }

        // Show the word, user's answer, and correct answer
        incorrectResults.push({
          word: currentWord.word,
          userAnswer: userAnswer.split(': ')[1], // Extract the option word (e.g., "Apple")
          correct: currentWord.meaning
        });
      } catch (error) {
        console.error('Reaction collection failed:', error);
        // If the timeout occurs, store "No reaction" as the answer
        incorrectResults.push({
          word: currentWord.word,
          userAnswer: 'No reaction',
          correct: currentWord.meaning
        });
      }

      await quizMessage.delete();
    }

    quizInProgress = false;

    // Send results with both correct and incorrect answers
    const resultEmbed = new EmbedBuilder()
      .setTitle('Quiz Results')
      .setDescription(`You scored ${score} out of 5!`)
      .setColor('#00FF00');

    let resultsDetail = '';

    // Show answers with details
    incorrectResults.forEach((result) => {
      resultsDetail += `**German word:** "${result.word}"\n` +
        `Your answer: ${result.userAnswer}\n` +
        `Correct answer: ${result.correct}\n\n`;
    });

    resultEmbed.addFields({ name: 'Detailed Results', value: resultsDetail });

    await message.channel.send({ embeds: [resultEmbed] });
  }
});

// Log in to Discord with the app's token
client.login(TOKEN);