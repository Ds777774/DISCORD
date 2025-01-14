const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const cron = require('node-cron');  // Importing node-cron

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

// Function to send "Word of the Day" message
const sendWordOfTheDay = async (channel) => {
  const randomWord = words[Math.floor(Math.random() * words.length)]; // Pick a random word
  const embed = new EmbedBuilder()
    .setTitle('**Word of the Day**')  // Title in bold
    .setDescription(`**German word:** ${randomWord.word}\n**English meaning:** ${randomWord.meaning}`)
    .setColor('#FFDD00')
    .setFooter({ text: 'Learn a new word every day!' });

  await channel.send({ embeds: [embed] });
};

// Schedule the "Word of the Day" at 12:14 PM IST every day
cron.schedule('14 12 * * *', async () => {
  const channel = await client.channels.fetch('YOUR_CHANNEL_ID'); // Replace with your channel ID
  sendWordOfTheDay(channel);
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"  // Ensure the time is in IST
});

// Event listener for messages to handle the Word of the Day command
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '!wordoftheday') {
    await sendWordOfTheDay(message.channel); // Send the "Word of the Day" message
  }

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

// Log in to Discord with the bot token
client.login(TOKEN);