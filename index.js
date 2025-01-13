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

// List of 40 German words and their meanings
const words = [
  { word: 'Apfel', meaning: 'Apple', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇦' },
  { word: 'Haus', meaning: 'House', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇧' },
  { word: 'Katze', meaning: 'Cat', options: ['A: Apple', 'B: House', 'C: Cat', 'D: Dog'], correct: '🇨' },
  { word: 'Hund', meaning: 'Dog', options: ['A: Dog', 'B: Cat', 'C: Apple', 'D: House'], correct: '🇦' },
  { word: 'Buch', meaning: 'Book', options: ['A: Book', 'B: Table', 'C: Chair', 'D: Pen'], correct: '🇦' },
  { word: 'Tisch', meaning: 'Table', options: ['A: Book', 'B: Table', 'C: Chair', 'D: Bed'], correct: '🇧' },
  { word: 'Stuhl', meaning: 'Chair', options: ['A: Table', 'B: Bed', 'C: Chair', 'D: Window'], correct: '🇨' },
  { word: 'Fenster', meaning: 'Window', options: ['A: Door', 'B: Table', 'C: Chair', 'D: Window'], correct: '🇩' },
  { word: 'Tür', meaning: 'Door', options: ['A: Door', 'B: Table', 'C: Chair', 'D: Window'], correct: '🇦' },
  { word: 'Schule', meaning: 'School', options: ['A: School', 'B: Office', 'C: University', 'D: Library'], correct: '🇦' },
  { word: 'Auto', meaning: 'Car', options: ['A: Bicycle', 'B: Car', 'C: Train', 'D: Bus'], correct: '🇧' },
  { word: 'Zug', meaning: 'Train', options: ['A: Train', 'B: Bus', 'C: Car', 'D: Bicycle'], correct: '🇦' },
  { word: 'Fahrrad', meaning: 'Bicycle', options: ['A: Train', 'B: Bus', 'C: Bicycle', 'D: Car'], correct: '🇨' },
  { word: 'Bus', meaning: 'Bus', options: ['A: Car', 'B: Train', 'C: Bicycle', 'D: Bus'], correct: '🇩' },
  { word: 'Straße', meaning: 'Street', options: ['A: Street', 'B: Road', 'C: Path', 'D: Alley'], correct: '🇦' },
  { word: 'Brücke', meaning: 'Bridge', options: ['A: Tunnel', 'B: Bridge', 'C: Highway', 'D: Path'], correct: '🇧' },
  { word: 'Fluss', meaning: 'River', options: ['A: Lake', 'B: Ocean', 'C: River', 'D: Pond'], correct: '🇨' },
  { word: 'Berg', meaning: 'Mountain', options: ['A: Valley', 'B: Mountain', 'C: Hill', 'D: Peak'], correct: '🇧' },
  { word: 'See', meaning: 'Lake', options: ['A: Lake', 'B: River', 'C: Ocean', 'D: Pond'], correct: '🇦' },
  { word: 'Meer', meaning: 'Ocean', options: ['A: River', 'B: Ocean', 'C: Lake', 'D: Pond'], correct: '🇧' },
  { word: 'Baum', meaning: 'Tree', options: ['A: Tree', 'B: Grass', 'C: Bush', 'D: Flower'], correct: '🇦' },
  { word: 'Blume', meaning: 'Flower', options: ['A: Grass', 'B: Flower', 'C: Tree', 'D: Bush'], correct: '🇧' },
  { word: 'Gras', meaning: 'Grass', options: ['A: Tree', 'B: Bush', 'C: Grass', 'D: Flower'], correct: '🇨' },
  { word: 'Busch', meaning: 'Bush', options: ['A: Flower', 'B: Grass', 'C: Bush', 'D: Tree'], correct: '🇨' },
  { word: 'Sonne', meaning: 'Sun', options: ['A: Moon', 'B: Star', 'C: Sun', 'D: Planet'], correct: '🇨' },
  { word: 'Mond', meaning: 'Moon', options: ['A: Moon', 'B: Sun', 'C: Planet', 'D: Star'], correct: '🇦' },
  { word: 'Stern', meaning: 'Star', options: ['A: Planet', 'B: Star', 'C: Moon', 'D: Sun'], correct: '🇧' },
  { word: 'Planet', meaning: 'Planet', options: ['A: Star', 'B: Moon', 'C: Planet', 'D: Sun'], correct: '🇨' },
  { word: 'Tasche', meaning: 'Bag', options: ['A: Bag', 'B: Box', 'C: Case', 'D: Pocket'], correct: '🇦' },
  { word: 'Koffer', meaning: 'Suitcase', options: ['A: Bag', 'B: Suitcase', 'C: Box', 'D: Backpack'], correct: '🇧' },
  { word: 'Rucksack', meaning: 'Backpack', options: ['A: Bag', 'B: Suitcase', 'C: Backpack', 'D: Case'], correct: '🇨' },
  { word: 'Schrank', meaning: 'Cupboard', options: ['A: Cupboard', 'B: Wardrobe', 'C: Drawer', 'D: Shelf'], correct: '🇦' },
  { word: 'Regal', meaning: 'Shelf', options: ['A: Shelf', 'B: Drawer', 'C: Cupboard', 'D: Table'], correct: '🇦' },
  { word: 'Schublade', meaning: 'Drawer', options: ['A: Shelf', 'B: Drawer', 'C: Cupboard', 'D: Wardrobe'], correct: '🇧' },
  { word: 'Küche', meaning: 'Kitchen', options: ['A: Kitchen', 'B: Bedroom', 'C: Bathroom', 'D: Living Room'], correct: '🇦' },
  { word: 'Bad', meaning: 'Bathroom', options: ['A: Kitchen', 'B: Bathroom', 'C: Living Room', 'D: Bedroom'], correct: '🇧' },
  { word: 'Schlafzimmer', meaning: 'Bedroom', options: ['A: Living Room', 'B: Kitchen', 'C: Bedroom', 'D: Bathroom'], correct: '🇨' },
  { word: 'Wohnzimmer', meaning: 'Living Room', options: ['A: Kitchen', 'B: Bathroom', 'C: Living Room', 'D: Bedroom'], correct: '🇨' },
  { word: 'Apfelbaum', meaning: 'Apple tree', options: ['A: Pear tree', 'B: Apple tree', 'C: Cherry tree', 'D: Pine tree'], correct: '🇧' },
  { word: 'Eichhörnchen', meaning: 'Squirrel', options: ['A: Dog', 'B: Cat', 'C: Rabbit', 'D: Squirrel'], correct: '🇩' },
  { word: 'Himmel', meaning: 'Sky', options: ['A: Ground', 'B: Cloud', 'C: Sky', 'D: Ocean'], correct: '🇩' },
{ word: 'Wald', meaning: 'Forest', options: ['A: Desert', 'B: Forest', 'C: Meadow', 'D: Sea'], correct: '🇧' },
{ word: 'Baumhaus', meaning: 'Treehouse', options: ['A: Treehouse', 'B: Hut', 'C: Tent', 'D: Cabin'], correct: '🇦' },
{ word: 'Löffel', meaning: 'Spoon', options: ['A: Fork', 'B: Knife', 'C: Spoon', 'D: Plate'], correct: '🇩' },
{ word: 'Gabel', meaning: 'Fork', options: ['A: Spoon', 'B: Plate', 'C: Fork', 'D: Knife'], correct: '🇩' },
{ word: 'Messer', meaning: 'Knife', options: ['A: Knife', 'B: Spoon', 'C: Fork', 'D: Plate'], correct: '🇦' },
{ word: 'Teller', meaning: 'Plate', options: ['A: Fork', 'B: Spoon', 'C: Knife', 'D: Plate'], correct: '🇩' },
{ word: 'Stuhlgang', meaning: 'Bowel movement', options: ['A: Cough', 'B: Stomachache', 'C: Bowel movement', 'D: Headache'], correct: '🇩' },
{ word: 'Hose', meaning: 'Pants', options: ['A: Shirt', 'B: Pants', 'C: Shoes', 'D: Hat'], correct: '🇧' },
{ word: 'Jacke', meaning: 'Jacket', options: ['A: Shirt', 'B: Jacket', 'C: Pants', 'D: Sweater'], correct: '🇧' },
{ word: 'Pullover', meaning: 'Sweater', options: ['A: Pants', 'B: Jacket', 'C: Sweater', 'D: Scarf'], correct: '🇩' },
{ word: 'Schuhe', meaning: 'Shoes', options: ['A: Hat', 'B: Shoes', 'C: Pants', 'D: Socks'], correct: '🇧' },
{ word: 'Socken', meaning: 'Socks', options: ['A: Pants', 'B: Hat', 'C: Shoes', 'D: Socks'], correct: '🇩' },
{ word: 'Brille', meaning: 'Glasses', options: ['A: Hat', 'B: Glasses', 'C: Jacket', 'D: Sweater'], correct: '🇧' },
{ word: 'Mütze', meaning: 'Cap', options: ['A: Gloves', 'B: Shoes', 'C: Cap', 'D: Jacket'], correct: '🇩' },
{ word: 'Handschuh', meaning: 'Glove', options: ['A: Socks', 'B: Shoes', 'C: Gloves', 'D: Hat'], correct: '🇨' },
{ word: 'Regenschirm', meaning: 'Umbrella', options: ['A: Hat', 'B: Umbrella', 'C: Jacket', 'D: Shoes'], correct: '🇧' },
{ word: 'Kopf', meaning: 'Head', options: ['A: Arm', 'B: Leg', 'C: Head', 'D: Foot'], correct: '🇩' },
{ word: 'Arm', meaning: 'Arm', options: ['A: Hand', 'B: Arm', 'C: Foot', 'D: Head'], correct: '🇧' },
{ word: 'Bein', meaning: 'Leg', options: ['A: Foot', 'B: Leg', 'C: Arm', 'D: Hand'], correct: '🇧' },
{ word: 'Fuß', meaning: 'Foot', options: ['A: Foot', 'B: Leg', 'C: Head', 'D: Arm'], correct: '🇦' },
{ word: 'Auge', meaning: 'Eye', options: ['A: Ear', 'B: Eye', 'C: Mouth', 'D: Nose'], correct: '🇧' },
{ word: 'Nase', meaning: 'Nose', options: ['A: Mouth', 'B: Ear', 'C: Nose', 'D: Eye'], correct: '🇩' },
{ word: 'Mund', meaning: 'Mouth', options: ['A: Nose', 'B: Eye', 'C: Ear', 'D: Mouth'], correct: '🇩' },
{ word: 'Zunge', meaning: 'Tongue', options: ['A: Nose', 'B: Eye', 'C: Tongue', 'D: Ear'], correct: '🇩' },
{ word: 'Zahn', meaning: 'Tooth', options: ['A: Eye', 'B: Tooth', 'C: Nose', 'D: Ear'], correct: '🇧' },
{ word: 'Hals', meaning: 'Neck', options: ['A: Neck', 'B: Head', 'C: Shoulder', 'D: Arm'], correct: '🇦' },
{ word: 'Rücken', meaning: 'Back', options: ['A: Leg', 'B: Back', 'C: Foot', 'D: Arm'], correct: '🇧' },
{ word: 'Bauch', meaning: 'Stomach', options: ['A: Head', 'B: Stomach', 'C: Leg', 'D: Foot'], correct: '🇧' },
{ word: 'Hand', meaning: 'Hand', options: ['A: Leg', 'B: Foot', 'C: Hand', 'D: Arm'], correct: '🇩' },
{ word: 'Fingernagel', meaning: 'Fingernail', options: ['A: Hand', 'B: Nail', 'C: Fingernail', 'D: Foot'], correct: '🇩' },
{ word: 'Zehe', meaning: 'Toe', options: ['A: Finger', 'B: Foot', 'C: Toe', 'D: Leg'], correct: '🇩' },
{ word: 'Herz', meaning: 'Heart', options: ['A: Brain', 'B: Heart', 'C: Stomach', 'D: Lungs'], correct: '🇧' },
{ word: 'Lunge', meaning: 'Lung', options: ['A: Heart', 'B: Lung', 'C: Kidney', 'D: Liver'], correct: '🇧' },
{ word: 'Leber', meaning: 'Liver', options: ['A: Kidney', 'B: Stomach', 'C: Liver', 'D: Heart'], correct: '🇩' },
{ word: 'Nieren', meaning: 'Kidneys', options: ['A: Heart', 'B: Kidney', 'C: Lung', 'D: Stomach'], correct: '🇧' },
{ word: 'Hirn', meaning: 'Brain', options: ['A: Heart', 'B: Stomach', 'C: Brain', 'D: Lungs'], correct: '🇩' }
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