const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const express = require('express');
const cron = require('node-cron'); 

const TOKEN = process.env.DISCORD_TOKEN; 

if (!TOKEN) {
  console.error('Error: DISCORD_TOKEN environment variable is not set.');
  process.exit(1);
} 

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}); 

// Express server to keep the bot alive
const app = express();
app.get('/', (req, res) => {
  res.send('Bot is running!');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); 

// Quiz data by levels
const quizData = {
  A1: [
  { word: 'Apfel', meaning: 'Apple', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇦' },
  { word: 'Haus', meaning: 'House', options: ['A: Apple', 'B: House', 'C: Dog', 'D: Cat'], correct: '🇧' },
  { word: 'Tisch', meaning: 'Table', options: ['A: Table', 'B: Chair', 'C: Door', 'D: Window'], correct: '🇦' },
  { word: 'Stuhl', meaning: 'Chair', options: ['A: Table', 'B: Chair', 'C: Bed', 'D: Lamp'], correct: '🇧' },
  { word: 'Brot', meaning: 'Bread', options: ['A: Bread', 'B: Butter', 'C: Cake', 'D: Milk'], correct: '🇦' },
  { word: 'Wasser', meaning: 'Water', options: ['A: Water', 'B: Juice', 'C: Coffee', 'D: Tea'], correct: '🇦' },
  { word: 'Auto', meaning: 'Car', options: ['A: Train', 'B: Bus', 'C: Car', 'D: Plane'], correct: '🇨' },
  { word: 'Blume', meaning: 'Flower', options: ['A: Tree', 'B: Grass', 'C: Flower', 'D: Leaf'], correct: '🇨' },
  { word: 'Hund', meaning: 'Dog', options: ['A: Cat', 'B: Bird', 'C: Dog', 'D: Fish'], correct: '🇨' },
  { word: 'Katze', meaning: 'Cat', options: ['A: Rabbit', 'B: Cat', 'C: Dog', 'D: Bird'], correct: '🇧' },
  { word: 'Fisch', meaning: 'Fish', options: ['A: Fish', 'B: Chicken', 'C: Meat', 'D: Egg'], correct: '🇦' },
  { word: 'Buch', meaning: 'Book', options: ['A: Book', 'B: Pen', 'C: Notebook', 'D: Paper'], correct: '🇦' },
  { word: 'Tür', meaning: 'Door', options: ['A: Window', 'B: Door', 'C: Wall', 'D: Floor'], correct: '🇧' },
  { word: 'Fenster', meaning: 'Window', options: ['A: Roof', 'B: Window', 'C: Wall', 'D: Door'], correct: '🇧' },
  { word: 'Lampe', meaning: 'Lamp', options: ['A: Light', 'B: Lamp', 'C: Fan', 'D: Clock'], correct: '🇧' },
  { word: 'Tasche', meaning: 'Bag', options: ['A: Bag', 'B: Hat', 'C: Shoes', 'D: Jacket'], correct: '🇦' },
  { word: 'Schule', meaning: 'School', options: ['A: School', 'B: Office', 'C: Library', 'D: Home'], correct: '🇦' },
  { word: 'Lehrer', meaning: 'Teacher', options: ['A: Student', 'B: Principal', 'C: Teacher', 'D: Class'], correct: '🇨' },
  { word: 'Bleistift', meaning: 'Pencil', options: ['A: Pen', 'B: Marker', 'C: Pencil', 'D: Eraser'], correct: '🇨' },
  { word: 'Rad', meaning: 'Bicycle', options: ['A: Car', 'B: Bicycle', 'C: Train', 'D: Plane'], correct: '🇧' },
  { word: 'Baum', meaning: 'Tree', options: ['A: Tree', 'B: Forest', 'C: Flower', 'D: Grass'], correct: '🇦' },
  { word: 'Hut', meaning: 'Hat', options: ['A: Shoes', 'B: Jacket', 'C: Hat', 'D: Shirt'], correct: '🇨' },
  { word: 'Zeitung', meaning: 'Newspaper', options: ['A: Magazine', 'B: Newspaper', 'C: Book', 'D: Notebook'], correct: '🇧' },
  { word: 'Stadt', meaning: 'City', options: ['A: Village', 'B: City', 'C: Town', 'D: Country'], correct: '🇧' },
  { word: 'Torte', meaning: 'Cake', options: ['A: Bread', 'B: Cake', 'C: Cookie', 'D: Pie'], correct: '🇧' },
  { word: 'Vogel', meaning: 'Bird', options: ['A: Bird', 'B: Fish', 'C: Cat', 'D: Dog'], correct: '🇦' },
  { word: 'Tischdecke', meaning: 'Tablecloth', options: ['A: Tablecloth', 'B: Curtain', 'C: Blanket', 'D: Carpet'], correct: '🇦' },
  { word: 'Kind', meaning: 'Child', options: ['A: Baby', 'B: Child', 'C: Parent', 'D: Adult'], correct: '🇧' },
  { word: 'Bett', meaning: 'Bed', options: ['A: Chair', 'B: Sofa', 'C: Bed', 'D: Desk'], correct: '🇨' },
  { word: 'Tasse', meaning: 'Cup', options: ['A: Plate', 'B: Bowl', 'C: Cup', 'D: Glass'], correct: '🇨' },
  { word: 'Schrank', meaning: 'Wardrobe', options: ['A: Shelf', 'B: Wardrobe', 'C: Drawer', 'D: Mirror'], correct: '🇧' },
  { word: 'Maus', meaning: 'Mouse', options: ['A: Rat', 'B: Mouse', 'C: Cat', 'D: Bird'], correct: '🇧' },
  { word: 'Wand', meaning: 'Wall', options: ['A: Roof', 'B: Wall', 'C: Door', 'D: Window'], correct: '🇧' },
  { word: 'Kuh', meaning: 'Cow', options: ['A: Horse', 'B: Cow', 'C: Goat', 'D: Sheep'], correct: '🇧' },
  { word: 'Blatt', meaning: 'Leaf', options: ['A: Leaf', 'B: Flower', 'C: Grass', 'D: Tree'], correct: '🇦' },
  { word: 'Hemd', meaning: 'Shirt', options: ['A: Pants', 'B: Jacket', 'C: Shirt', 'D: Hat'], correct: '🇨' },
  { word: 'Jacke', meaning: 'Jacket', options: ['A: Coat', 'B: Jacket', 'C: Sweater', 'D: Scarf'], correct: '🇧' },
  { word: 'Schuh', meaning: 'Shoe', options: ['A: Sandal', 'B: Boot', 'C: Shoe', 'D: Sock'], correct: '🇨' },
  { word: 'Zug', meaning: 'Train', options: ['A: Car', 'B: Plane', 'C: Train', 'D: Bus'], correct: '🇨' },
  { word: 'Stift', meaning: 'Pen', options: ['A: Pencil', 'B: Pen', 'C: Marker', 'D: Eraser'], correct: '🇧' },
  { word: 'Sonne', meaning: 'Sun', options: ['A: Moon', 'B: Sun', 'C: Star', 'D: Sky'], correct: '🇧' },
  { word: 'Wolke', meaning: 'Cloud', options: ['A: Sky', 'B: Rain', 'C: Cloud', 'D: Fog'], correct: '🇨' },
  { word: 'Fahrzeug', meaning: 'Vehicle', options: ['A: Airplane', 'B: Car', 'C: Vehicle', 'D: Train'], correct: '🇨' },
  { word: 'Regen', meaning: 'Rain', options: ['A: Sun', 'B: Rain', 'C: Snow', 'D: Fog'], correct: '🇧' },
  { word: 'Schnee', meaning: 'Snow', options: ['A: Snow', 'B: Rain', 'C: Storm', 'D: Cloud'], correct: '🇦' },
  { word: 'Eis', meaning: 'Ice', options: ['A: Snow', 'B: Ice', 'C: Water', 'D: Rain'], correct: '🇧' },
  { word: 'Berg', meaning: 'Mountain', options: ['A: Hill', 'B: Mountain', 'C: Sea', 'D: Plain'], correct: '🇧' },
  { word: 'Tal', meaning: 'Valley', options: ['A: Hill', 'B: Valley', 'C: Mountain', 'D: Lake'], correct: '🇧' },
  { word: 'Fluss', meaning: 'River', options: ['A: Ocean', 'B: River', 'C: Lake', 'D: Sea'], correct: '🇧' },
  { word: 'Meer', meaning: 'Sea', options: ['A: Ocean', 'B: Lake', 'C: River', 'D: Sea'], correct: '🇩' },
  { word: 'Insel', meaning: 'Island', options: ['A: Mountain', 'B: Island', 'C: Lake', 'D: River'], correct: '🇧' },
  { word: 'Wald', meaning: 'Forest', options: ['A: Desert', 'B: Forest', 'C: Lake', 'D: Mountain'], correct: '🇧' },
  { word: 'See', meaning: 'Lake', options: ['A: Sea', 'B: River', 'C: Mountain', 'D: Lake'], correct: '🇩' },
  { word: 'Land', meaning: 'Country', options: ['A: Town', 'B: Country', 'C: Village', 'D: City'], correct: '🇧' }
  ], 
  A2: [
   { word: 'Abend', meaning: 'Evening', options: ['A: Morning', 'B: Evening', 'C: Night', 'D: Afternoon'], correct: '🇧' },
  { word: 'Arzt', meaning: 'Doctor', options: ['A: Teacher', 'B: Doctor', 'C: Nurse', 'D: Patient'], correct: '🇧' },
  { word: 'Ausland', meaning: 'Abroad', options: ['A: Country', 'B: Abroad', 'C: City', 'D: Town'], correct: '🇧' },
  { word: 'Bank', meaning: 'Bank', options: ['A: Bank', 'B: Money', 'C: Store', 'D: Office'], correct: '🇦' },
  { word: 'Büro', meaning: 'Office', options: ['A: Shop', 'B: School', 'C: Office', 'D: Library'], correct: '🇨' },
  { word: 'Essen', meaning: 'Food', options: ['A: Food', 'B: Drink', 'C: Fruit', 'D: Vegetable'], correct: '🇦' },
  { word: 'Familie', meaning: 'Family', options: ['A: Family', 'B: Friends', 'C: Parents', 'D: Children'], correct: '🇦' },
  { word: 'Ferien', meaning: 'Holiday', options: ['A: Weekend', 'B: Break', 'C: Holiday', 'D: School'], correct: '🇨' },
  { word: 'Flughafen', meaning: 'Airport', options: ['A: Hotel', 'B: Train station', 'C: Airport', 'D: Bus stop'], correct: '🇨' },
  { word: 'Freund', meaning: 'Friend', options: ['A: Parent', 'B: Teacher', 'C: Friend', 'D: Neighbor'], correct: '🇨' },
  { word: 'Geschenk', meaning: 'Gift', options: ['A: Present', 'B: Letter', 'C: Food', 'D: Card'], correct: '🇦' },
  { word: 'Gesundheit', meaning: 'Health', options: ['A: Illness', 'B: Health', 'C: Disease', 'D: Fever'], correct: '🇧' },
  { word: 'Glück', meaning: 'Happiness', options: ['A: Sadness', 'B: Joy', 'C: Luck', 'D: Happiness'], correct: '🇩' },
  { word: 'Hoffnung', meaning: 'Hope', options: ['A: Despair', 'B: Hope', 'C: Anger', 'D: Fear'], correct: '🇧' },
  { word: 'Hotel', meaning: 'Hotel', options: ['A: Restaurant', 'B: Hotel', 'C: Cafe', 'D: Store'], correct: '🇧' },
  { word: 'Insel', meaning: 'Island', options: ['A: River', 'B: Ocean', 'C: Mountain', 'D: Island'], correct: '🇩' },
  { word: 'Jahr', meaning: 'Year', options: ['A: Week', 'B: Month', 'C: Day', 'D: Year'], correct: '🇩' },
  { word: 'Kaffee', meaning: 'Coffee', options: ['A: Tea', 'B: Coffee', 'C: Water', 'D: Juice'], correct: '🇧' },
  { word: 'Kamera', meaning: 'Camera', options: ['A: Phone', 'B: Camera', 'C: Laptop', 'D: Tablet'], correct: '🇧' },
  { word: 'Kleider', meaning: 'Clothes', options: ['A: Shoes', 'B: Clothes', 'C: Hat', 'D: Jacket'], correct: '🇧' },
  { word: 'Licht', meaning: 'Light', options: ['A: Darkness', 'B: Light', 'C: Shadow', 'D: Fire'], correct: '🇧' },
  { word: 'Mensch', meaning: 'Person', options: ['A: Animal', 'B: Person', 'C: Child', 'D: Woman'], correct: '🇧' },
  { word: 'Möglich', meaning: 'Possible', options: ['A: Impossible', 'B: Unlikely', 'C: Possible', 'D: Available'], correct: '🇨' },
  { word: 'Natur', meaning: 'Nature', options: ['A: Weather', 'B: Nature', 'C: Environment', 'D: Forest'], correct: '🇧' },
  { word: 'Obst', meaning: 'Fruit', options: ['A: Vegetable', 'B: Food', 'C: Fruit', 'D: Dairy'], correct: '🇨' },
  { word: 'Post', meaning: 'Mail', options: ['A: Phone', 'B: Internet', 'C: Mail', 'D: Email'], correct: '🇨' },
  { word: 'Reise', meaning: 'Trip', options: ['A: Trip', 'B: Journey', 'C: Flight', 'D: Drive'], correct: '🇦' },
  { word: 'Restaurant', meaning: 'Restaurant', options: ['A: Cafe', 'B: Hotel', 'C: Restaurant', 'D: Bar'], correct: '🇨' },
  { word: 'Schule', meaning: 'School', options: ['A: College', 'B: School', 'C: University', 'D: Office'], correct: '🇧' },
  { word: 'Schwimmbad', meaning: 'Swimming pool', options: ['A: Beach', 'B: Swimming pool', 'C: Ocean', 'D: River'], correct: '🇧' },
  { word: 'Stadt', meaning: 'City', options: ['A: Village', 'B: Town', 'C: City', 'D: Country'], correct: '🇨' },
  { word: 'Straße', meaning: 'Street', options: ['A: Park', 'B: Street', 'C: Square', 'D: Building'], correct: '🇧' },
  { word: 'Telefon', meaning: 'Telephone', options: ['A: Phone', 'B: Laptop', 'C: TV', 'D: Radio'], correct: '🇦' },
  { word: 'Tier', meaning: 'Animal', options: ['A: Person', 'B: Animal', 'C: Plant', 'D: Insect'], correct: '🇧' },
  { word: 'Universität', meaning: 'University', options: ['A: School', 'B: College', 'C: University', 'D: Highschool'], correct: '🇨' },
  { word: 'Urlaub', meaning: 'Vacation', options: ['A: School', 'B: Job', 'C: Vacation', 'D: Weekend'], correct: '🇨' },
  { word: 'Vater', meaning: 'Father', options: ['A: Mother', 'B: Father', 'C: Brother', 'D: Sister'], correct: '🇧' },
  { word: 'Woche', meaning: 'Week', options: ['A: Month', 'B: Year', 'C: Week', 'D: Day'], correct: '🇨' },
  { word: 'Zukunft', meaning: 'Future', options: ['A: Past', 'B: Future', 'C: Present', 'D: History'], correct: '🇧' },
  { word: 'Zug', meaning: 'Train', options: ['A: Car', 'B: Plane', 'C: Bus', 'D: Train'], correct: '🇩' },
  { word: 'Ziel', meaning: 'Goal', options: ['A: Goal', 'B: Target', 'C: End', 'D: Dream'], correct: '🇦' },
  { word: 'Zeitung', meaning: 'Newspaper', options: ['A: Magazine', 'B: Newspaper', 'C: Book', 'D: Journal'], correct: '🇧' },
  { word: 'Zentrum', meaning: 'Center', options: ['A: Side', 'B: Center', 'C: Top', 'D: Corner'], correct: '🇧' },
  { word: 'Zahnarzt', meaning: 'Dentist', options: ['A: Doctor', 'B: Dentist', 'C: Nurse', 'D: Teacher'], correct: '🇧' },
  { word: 'Zeichen', meaning: 'Sign', options: ['A: Symbol', 'B: Sign', 'C: Mark', 'D: Letter'], correct: '🇧' },
  { word: 'Zunge', meaning: 'Tongue', options: ['A: Lip', 'B: Tongue', 'C: Teeth', 'D: Cheeks'], correct: '🇧' }
  ],
  B1: [
  { word: 'Abenteuer', meaning: 'Adventure', options: ['A: Routine', 'B: Challenge', 'C: Adventure', 'D: Job'], correct: '🇨' },
  { word: 'Angebot', meaning: 'Offer', options: ['A: Request', 'B: Offer', 'C: Answer', 'D: Idea'], correct: '🇧' },
  { word: 'Ausdruck', meaning: 'Expression', options: ['A: Thought', 'B: Expression', 'C: Message', 'D: Feeling'], correct: '🇧' },
  { word: 'Bedingung', meaning: 'Condition', options: ['A: Rule', 'B: Term', 'C: Condition', 'D: Instruction'], correct: '🇨' },
  { word: 'Beitrag', meaning: 'Contribution', options: ['A: Payment', 'B: Post', 'C: Contribution', 'D: Reply'], correct: '🇨' },
  { word: 'Behörde', meaning: 'Authority', options: ['A: Office', 'B: Department', 'C: Authority', 'D: Worker'], correct: '🇨' },
  { word: 'Bewerbung', meaning: 'Application', options: ['A: Request', 'B: Application', 'C: Offer', 'D: Appointment'], correct: '🇧' },
  { word: 'Beziehung', meaning: 'Relationship', options: ['A: Friendship', 'B: Relationship', 'C: Partnership', 'D: Connection'], correct: '🇧' },
  { word: 'Bildung', meaning: 'Education', options: ['A: Learning', 'B: Knowledge', 'C: Education', 'D: Information'], correct: '🇨' },
  { word: 'Chance', meaning: 'Chance', options: ['A: Opportunity', 'B: Time', 'C: Moment', 'D: Chance'], correct: '🇦' },
  { word: 'Debatte', meaning: 'Debate', options: ['A: Discussion', 'B: Disagreement', 'C: Debate', 'D: Agreement'], correct: '🇨' },
  { word: 'Dienstleistung', meaning: 'Service', options: ['A: Payment', 'B: Product', 'C: Service', 'D: Delivery'], correct: '🇨' },
  { word: 'Einstellung', meaning: 'Attitude', options: ['A: Work', 'B: Attitude', 'C: Job', 'D: Opinion'], correct: '🇧' },
  { word: 'Ereignis', meaning: 'Event', options: ['A: Experience', 'B: Event', 'C: Celebration', 'D: Occasion'], correct: '🇧' },
  { word: 'Erfahrung', meaning: 'Experience', options: ['A: Expertise', 'B: Understanding', 'C: Experience', 'D: Memory'], correct: '🇨' },
  { word: 'Fähigkeit', meaning: 'Ability', options: ['A: Talent', 'B: Ability', 'C: Skill', 'D: Power'], correct: '🇧' },
  { word: 'Fortschritt', meaning: 'Progress', options: ['A: Stagnation', 'B: Setback', 'C: Progress', 'D: Decline'], correct: '🇨' },
  { word: 'Freiheit', meaning: 'Freedom', options: ['A: Power', 'B: Authority', 'C: Freedom', 'D: Independence'], correct: '🇨' },
  { word: 'Geduld', meaning: 'Patience', options: ['A: Anger', 'B: Patience', 'C: Frustration', 'D: Energy'], correct: '🇧' },
  { word: 'Gegenteil', meaning: 'Opposite', options: ['A: Similar', 'B: Equal', 'C: Opposite', 'D: Different'], correct: '🇨' },
  { word: 'Gesellschaft', meaning: 'Society', options: ['A: Community', 'B: Organization', 'C: Group', 'D: Society'], correct: '🇨' },
  { word: 'Glauben', meaning: 'Belief', options: ['A: Opinion', 'B: Truth', 'C: Fact', 'D: Belief'], correct: '🇩' },
  { word: 'Grenze', meaning: 'Border', options: ['A: Center', 'B: Border', 'C: End', 'D: Middle'], correct: '🇧' },
  { word: 'Herausforderung', meaning: 'Challenge', options: ['A: Test', 'B: Task', 'C: Challenge', 'D: Help'], correct: '🇨' },
  { word: 'Hoffnung', meaning: 'Hope', options: ['A: Faith', 'B: Despair', 'C: Hope', 'D: Truth'], correct: '🇨' },
  { word: 'Kompetenz', meaning: 'Competence', options: ['A: Skill', 'B: Experience', 'C: Knowledge', 'D: Competence'], correct: '🇨' },
  { word: 'Kritik', meaning: 'Criticism', options: ['A: Support', 'B: Praise', 'C: Criticism', 'D: Approval'], correct: '🇨' },
  { word: 'Lernziel', meaning: 'Learning objective', options: ['A: Objective', 'B: Goal', 'C: Plan', 'D: Lesson'], correct: '🇦' },
  { word: 'Mangel', meaning: 'Deficiency', options: ['A: Surplus', 'B: Lack', 'C: Deficiency', 'D: Excess'], correct: '🇧' },
  { word: 'Motivation', meaning: 'Motivation', options: ['A: Goal', 'B: Drive', 'C: Motivation', 'D: Force'], correct: '🇨' },
  { word: 'Möglichkeit', meaning: 'Possibility', options: ['A: Opportunity', 'B: Limitation', 'C: Possibility', 'D: Choice'], correct: '🇨' },
  { word: 'Nachricht', meaning: 'Message', options: ['A: Communication', 'B: Message', 'C: Call', 'D: Talk'], correct: '🇧' },
  { word: 'Notwendigkeit', meaning: 'Necessity', options: ['A: Luxury', 'B: Possibility', 'C: Need', 'D: Requirement'], correct: '🇩' },
  { word: 'Politik', meaning: 'Politics', options: ['A: Law', 'B: Governance', 'C: Politics', 'D: Society'], correct: '🇨' },
  { word: 'Qualität', meaning: 'Quality', options: ['A: Standard', 'B: Level', 'C: Quality', 'D: Amount'], correct: '🇨' },
  { word: 'Recht', meaning: 'Law', options: ['A: Law', 'B: Freedom', 'C: Justice', 'D: Rule'], correct: '🇨' },
  { word: 'Reise', meaning: 'Journey', options: ['A: Destination', 'B: Trip', 'C: Flight', 'D: Tour'], correct: '🇧' },
  { word: 'Sicherheit', meaning: 'Security', options: ['A: Risk', 'B: Danger', 'C: Safety', 'D: Protection'], correct: '🇨' },
  { word: 'Verantwortung', meaning: 'Responsibility', options: ['A: Power', 'B: Responsibility', 'C: Control', 'D: Obligation'], correct: '🇧' },
  { word: 'Verhandlung', meaning: 'Negotiation', options: ['A: Discussion', 'B: Contract', 'C: Agreement', 'D: Negotiation'], correct: '🇩' },
  { word: 'Vorschlag', meaning: 'Suggestion', options: ['A: Request', 'B: Suggestion', 'C: Answer', 'D: Decision'], correct: '🇧' },
  { word: 'Wert', meaning: 'Value', options: ['A: Price', 'B: Value', 'C: Cost', 'D: Rate'], correct: '🇧' },
  { word: 'Zustand', meaning: 'Condition', options: ['A: Situation', 'B: Condition', 'C: Stage', 'D: Moment'], correct: '🇨' },
  { word: 'Zukunft', meaning: 'Future', options: ['A: Past', 'B: Present', 'C: Future', 'D: Now'], correct: '🇨' },
  { word: 'Ziel', meaning: 'Goal', options: ['A: Target', 'B: Objective', 'C: Goal', 'D: Aim'], correct: '🇨' },
  { word: 'Zweifel', meaning: 'Doubt', options: ['A: Certainty', 'B: Hesitation', 'C: Question', 'D: Doubt'], correct: '🇨' }
   ],
  B2: [
    { word: 'Abschluss', meaning: 'Conclusion', options: ['A: Start', 'B: Conclusion', 'C: Beginning', 'D: Outcome'], correct: '🇧' },
  { word: 'Anforderung', meaning: 'Requirement', options: ['A: Suggestion', 'B: Demand', 'C: Requirement', 'D: Request'], correct: '🇩' },
  { word: 'Auswirkung', meaning: 'Impact', options: ['A: Influence', 'B: Impact', 'C: Effect', 'D: Result'], correct: '🇧' },
  { word: 'Bedenken', meaning: 'Concern', options: ['A: Doubt', 'B: Question', 'C: Concern', 'D: Fear'], correct: '🇩' },
  { word: 'Beispiel', meaning: 'Example', options: ['A: Idea', 'B: Model', 'C: Example', 'D: Test'], correct: '🇩' },
  { word: 'Beschäftigung', meaning: 'Employment', options: ['A: Job', 'B: Work', 'C: Occupation', 'D: Employment'], correct: '🇩' },
  { word: 'Beteiligung', meaning: 'Participation', options: ['A: Joining', 'B: Participation', 'C: Role', 'D: Effort'], correct: '🇧' },
  { word: 'Bevollmächtigung', meaning: 'Authorization', options: ['A: Permission', 'B: Authorization', 'C: Power', 'D: Order'], correct: '🇧' },
  { word: 'Eindruck', meaning: 'Impression', options: ['A: Impact', 'B: Understanding', 'C: Impression', 'D: Reaction'], correct: '🇩' },
  { word: 'Einfluss', meaning: 'Influence', options: ['A: Control', 'B: Authority', 'C: Influence', 'D: Suggestion'], correct: '🇩' },
  { word: 'Ergebnis', meaning: 'Result', options: ['A: Beginning', 'B: Process', 'C: Result', 'D: Preparation'], correct: '🇩' },
  { word: 'Fähigkeit', meaning: 'Ability', options: ['A: Strength', 'B: Knowledge', 'C: Ability', 'D: Talent'], correct: '🇩' },
  { word: 'Fortschritt', meaning: 'Progress', options: ['A: Development', 'B: Progress', 'C: Improvement', 'D: Change'], correct: '🇧' },
  { word: 'Gegensätzlich', meaning: 'Contrary', options: ['A: Similar', 'B: Different', 'C: Opposite', 'D: Related'], correct: '🇨' },
  { word: 'Glaubwürdigkeit', meaning: 'Credibility', options: ['A: Trust', 'B: Reliability', 'C: Authority', 'D: Credibility'], correct: '🇩' },
  { word: 'Größe', meaning: 'Size', options: ['A: Shape', 'B: Width', 'C: Height', 'D: Size'], correct: '🇩' },
  { word: 'Herkunft', meaning: 'Origin', options: ['A: Birth', 'B: Heritage', 'C: Origin', 'D: Destination'], correct: '🇩' },
  { word: 'Individuum', meaning: 'Individual', options: ['A: Group', 'B: Team', 'C: Person', 'D: Individual'], correct: '🇩' },
  { word: 'Kooperation', meaning: 'Cooperation', options: ['A: Interaction', 'B: Help', 'C: Teamwork', 'D: Cooperation'], correct: '🇩' },
  { word: 'Kritik', meaning: 'Criticism', options: ['A: Feedback', 'B: Suggestion', 'C: Review', 'D: Criticism'], correct: '🇩' },
  { word: 'Leistung', meaning: 'Performance', options: ['A: Output', 'B: Effort', 'C: Quality', 'D: Performance'], correct: '🇩' },
  { word: 'Möglichkeit', meaning: 'Possibility', options: ['A: Opportunity', 'B: Reality', 'C: Chance', 'D: Possibility'], correct: '🇩' },
  { word: 'Notwendigkeit', meaning: 'Necessity', options: ['A: Requirement', 'B: Choice', 'C: Condition', 'D: Necessity'], correct: '🇩' },
  { word: 'Qualität', meaning: 'Quality', options: ['A: Quantity', 'B: Amount', 'C: Quality', 'D: Feature'], correct: '🇩' },
  { word: 'Reaktion', meaning: 'Reaction', options: ['A: Response', 'B: Action', 'C: Reaction', 'D: Response'], correct: '🇩' },
  { word: 'Ressource', meaning: 'Resource', options: ['A: Asset', 'B: Benefit', 'C: Resource', 'D: Tool'], correct: '🇩' },
  { word: 'Schwierigkeit', meaning: 'Difficulty', options: ['A: Problem', 'B: Issue', 'C: Difficulty', 'D: Opportunity'], correct: '🇩' },
  { word: 'Sicherheit', meaning: 'Security', options: ['A: Trust', 'B: Safety', 'C: Protection', 'D: Confidence'], correct: '🇩' },
  { word: 'Spannung', meaning: 'Tension', options: ['A: Relaxation', 'B: Stress', 'C: Excitement', 'D: Tension'], correct: '🇩' },
  { word: 'Tatsache', meaning: 'Fact', options: ['A: Truth', 'B: Argument', 'C: Fact', 'D: Story'], correct: '🇩' },
  { word: 'Verantwortung', meaning: 'Responsibility', options: ['A: Control', 'B: Obligation', 'C: Accountability', 'D: Responsibility'], correct: '🇩' },
  { word: 'Vorschlag', meaning: 'Proposal', options: ['A: Idea', 'B: Suggestion', 'C: Offer', 'D: Proposal'], correct: '🇩' },
  { word: 'Zukunft', meaning: 'Future', options: ['A: Now', 'B: Past', 'C: Present', 'D: Future'], correct: '🇩' },
  { word: 'Zusammenhang', meaning: 'Context', options: ['A: Reason', 'B: Conclusion', 'C: Context', 'D: Situation'], correct: '🇩' },
  { word: 'Zufriedenheit', meaning: 'Satisfaction', options: ['A: Joy', 'B: Contentment', 'C: Happiness', 'D: Satisfaction'], correct: '🇩' },
  { word: 'Zweifel', meaning: 'Doubt', options: ['A: Certainty', 'B: Question', 'C: Doubt', 'D: Agreement'], correct: '🇩' },
  { word: 'Zugang', meaning: 'Access', options: ['A: Entrance', 'B: Connection', 'C: Access', 'D: Admission'], correct: '🇩' },
  { word: 'Abneigung', meaning: 'Dislike', options: ['A: Attraction', 'B: Dislike', 'C: Preference', 'D: Respect'], correct: '🇧' },
  { word: 'Aussicht', meaning: 'View', options: ['A: Prospect', 'B: Sight', 'C: Image', 'D: View'], correct: '🇩' },
  { word: 'Einstellung', meaning: 'Position', options: ['A: View', 'B: Approach', 'C:Position', 'D: Opinion'], correct: '🇩' },
  { word: 'Erlaubnis', meaning: 'Permission', options: ['A: Consent', 'B: Permission', 'C: Grant', 'D: Request'], correct: '🇩' },
  { word: 'Herausforderung', meaning: 'Challenge', options: ['A: Task', 'B: Issue', 'C: Difficulty', 'D: Challenge'], correct: '🇩' },
  { word: 'Lösungsweg', meaning: 'Solution', options: ['A: Plan', 'B: Answer', 'C: Strategy', 'D: Solution'], correct: '🇩' },
  { word: 'Nachhaltigkeit', meaning: 'Sustainability', options: ['A: Change', 'B: Conservation', 'C: Continuation', 'D: Sustainability'], correct: '🇩' },
  { word: 'Unterschied', meaning: 'Difference', options: ['A: Similarity', 'B: Difference', 'C: Variation', 'D: Divergence'], correct: '🇩' },
  { word: 'Verhältnis', meaning: 'Relation', options: ['A: Ratio', 'B: Comparison', 'C: Relationship', 'D: Value'], correct: '🇩' },
  { word: 'Verantwortung', meaning: 'Responsibility', options: ['A: Role', 'B: Duty', 'C: Task', 'D: Responsibility'], correct: '🇩' },
  { word: 'Verschwendung', meaning: 'Waste', options: ['A: Loss', 'B: Waste', 'C: Use', 'D: Expense'], correct: '🇩' },
  { word: 'Wachstum', meaning: 'Growth', options: ['A: Change', 'B: Expansion', 'C: Increase', 'D: Growth'], correct: '🇩' },
  { word: 'Zerstörung', meaning: 'Destruction', options: ['A: Build', 'B: Damage', 'C: Destruction', 'D: Repair'], correct: '🇩' },
  { word: 'Zusammenarbeit', meaning: 'Collaboration', options: ['A: Group', 'B: Cooperation', 'C: Teamwork', 'D: Collaboration'], correct: '🇩' },
  { word: 'Zufall', meaning: 'Chance', options: ['A: Coincidence', 'B: Event', 'C: Luck', 'D: Chance'], correct: '🇩' },
  { word: 'Zukunftsperspektive', meaning: 'Future perspective', options: ['A: Vision', 'B: Option', 'C: Outlook', 'D: Perspective'], correct: '🇩' },
  { word: 'Zustand', meaning: 'State', options: ['A: Situation', 'B: Condition', 'C: Position', 'D: State'], correct: '🇩' }
  ],
  C1: [
    { word: 'Abstraktion', meaning: 'Abstraction', options: ['A: Explanation', 'B: Simplification', 'C: Generalization', 'D: Abstraction'], correct: '🇩' },
  { word: 'Angemessenheit', meaning: 'Appropriateness', options: ['A: Fit', 'B: Relevance', 'C: Suitability', 'D: Appropriateness'], correct: '🇩' },
  { word: 'Anpassungsfähigkeit', meaning: 'Adaptability', options: ['A: Flexibility', 'B: Change', 'C: Stability', 'D: Adaptability'], correct: '🇩' },
  { word: 'Aufgeschlossenheit', meaning: 'Open-mindedness', options: ['A: Receptiveness', 'B: Tolerance', 'C: Broadmindedness', 'D: Open-mindedness'], correct: '🇩' },
  { word: 'Ausgewogenheit', meaning: 'Balance', options: ['A: Moderation', 'B: Proportion', 'C: Fairness', 'D: Balance'], correct: '🇩' },
  { word: 'Bedeutungslosigkeit', meaning: 'Insignificance', options: ['A: Unimportance', 'B: Meaninglessness', 'C: Inconsequence', 'D: Insignificance'], correct: '🇩' },
  { word: 'Begeisterung', meaning: 'Enthusiasm', options: ['A: Passion', 'B: Excitement', 'C: Zeal', 'D: Enthusiasm'], correct: '🇩' },
  { word: 'Beständigkeit', meaning: 'Consistency', options: ['A: Regularity', 'B: Stability', 'C: Dependability', 'D: Consistency'], correct: '🇩' },
  { word: 'Differenzierung', meaning: 'Differentiation', options: ['A: Contrast', 'B: Separation', 'C: Diversity', 'D: Differentiation'], correct: '🇩' },
  { word: 'Entschlossenheit', meaning: 'Determination', options: ['A: Willpower', 'B: Resolution', 'C: Steadfastness', 'D: Determination'], correct: '🇩' },
  { word: 'Erklärung', meaning: 'Clarification', options: ['A: Explanation', 'B: Argument', 'C: Justification', 'D: Clarification'], correct: '🇩' },
  { word: 'Erfahrung', meaning: 'Experience', options: ['A: Knowledge', 'B: Practice', 'C: Encounter', 'D: Experience'], correct: '🇩' },
  { word: 'Fähigkeit', meaning: 'Competence', options: ['A: Skill', 'B: Ability', 'C: Capability', 'D: Competence'], correct: '🇩' },
  { word: 'Fortschrittlichkeit', meaning: 'Progressiveness', options: ['A: Innovation', 'B: Openness', 'C: Advancement', 'D: Progressiveness'], correct: '🇩' },
  { word: 'Freundlichkeit', meaning: 'Kindness', options: ['A: Gentleness', 'B: Compassion', 'C: Friendliness', 'D: Kindness'], correct: '🇩' },
  { word: 'Freiheit', meaning: 'Freedom', options: ['A: Liberty', 'B: Independence', 'C: Autonomy', 'D: Freedom'], correct: '🇩' },
  { word: 'Generosität', meaning: 'Generosity', options: ['A: Altruism', 'B: Giving', 'C: Magnanimity', 'D: Generosity'], correct: '🇩' },
  { word: 'Gesellschaft', meaning: 'Society', options: ['A: Group', 'B: Public', 'C: Community', 'D: Society'], correct: '🇩' },
  { word: 'Komplexität', meaning: 'Complexity', options: ['A: Intricacy', 'B: Difficulty', 'C: Complication', 'D: Complexity'], correct: '🇩' },
  { word: 'Konsistenz', meaning: 'Consistency', options: ['A: Regularity', 'B: Cohesion', 'C: Stability', 'D: Consistency'], correct: '🇩' },
  { word: 'Kritikfähigkeit', meaning: 'Criticism', options: ['A: Judgment', 'B: Reflection', 'C: Sensitivity', 'D: Criticism'], correct: '🇩' },
  { word: 'Lebensqualität', meaning: 'Quality of life', options: ['A: Prosperity', 'B: Well-being', 'C: Comfort', 'D: Quality of life'], correct: '🇩' },
  { word: 'Nachhaltigkeit', meaning: 'Sustainability', options: ['A: Eco-friendliness', 'B: Durability', 'C: Responsibility', 'D: Sustainability'], correct: '🇩' },
  { word: 'Optimierung', meaning: 'Optimization', options: ['A: Improvement', 'B: Refinement', 'C: Enhancement', 'D: Optimization'], correct: '🇩' },
  { word: 'Präzision', meaning: 'Precision', options: ['A: Exactness', 'B: Accuracy', 'C: Specificity', 'D: Precision'], correct: '🇩' },
  { word: 'Reflexion', meaning: 'Reflection', options: ['A: Review', 'B: Meditation', 'C: Thought', 'D: Reflection'], correct: '🇩' },
  { word: 'Respekt', meaning: 'Respect', options: ['A: Honor', 'B: Courtesy', 'C: Regard', 'D: Respect'], correct: '🇩' },
  { word: 'Sicherheit', meaning: 'Security', options: ['A: Safety', 'B: Protection', 'C: Assurance', 'D: Security'], correct: '🇩' },
  { word: 'Souveränität', meaning: 'Sovereignty', options: ['A: Authority', 'B: Control', 'C: Supremacy', 'D: Sovereignty'], correct: '🇩' },
  { word: 'Spontaneität', meaning: 'Spontaneity', options: ['A: Impulse', 'B: Freedom', 'C: Instinct', 'D: Spontaneity'], correct: '🇩' },
  { word: 'Toleranz', meaning: 'Tolerance', options: ['A: Patience', 'B: Openness', 'C: Acceptance', 'D: Tolerance'], correct: '🇩' },
  { word: 'Transparenz', meaning: 'Transparency', options: ['A: Clarity', 'B: Openness', 'C: Insight', 'D: Transparency'], correct: '🇩' },
  { word: 'Verantwortung', meaning: 'Responsibility', options: ['A: Obligation', 'B: Accountability', 'C: Duty', 'D: Responsibility'], correct: '🇩' },
  { word: 'Verlässlichkeit', meaning: 'Reliability', options: ['A: Dependability', 'B: Trustworthiness', 'C: Steadiness', 'D: Reliability'], correct: '🇩' },
  { word: 'Vertrauen', meaning: 'Trust', options: ['A: Confidence', 'B: Belief', 'C: Faith', 'D: Trust'], correct: '🇩' },
  { word: 'Verstehen', meaning: 'Comprehension', options: ['A: Recognition', 'B: Insight', 'C: Understanding', 'D: Perception'], correct: '🇩' },
  { word: 'Verzahnung', meaning: 'Interconnection', options: ['A: Integration', 'B: Relationship', 'C: Linkage', 'D: Interconnection'], correct: '🇩' },
  { word: 'Vorbereitung', meaning: 'Preparation', options: ['A: Setup', 'B: Training', 'C: Planning', 'D: Preparation'], correct: '🇩' },
  { word: 'Wahrnehmung', meaning: 'Perception', options: ['A: View', 'B: Interpretation', 'C: Insight', 'D: Perception'], correct: '🇩' },
  { word: 'Wertschätzung', meaning: 'Appreciation', options: ['A: Acknowledgment', 'B: Recognition', 'C: Value', 'D: Appreciation'], correct: '🇩' },
  { word: 'Wissenschaftlichkeit', meaning: 'Scientific approach', options: ['A: Research', 'B: Knowledge', 'C: Methodology', 'D: Scientific approach'], correct: '🇩' },
  { word: 'Zuverlässigkeit', meaning: 'Reliability', options: ['A: Certainty', 'B: Trustworthiness', 'C: Consistency', 'D: Reliability'], correct: '🇩' },
  { word: 'Zielstrebigkeit', meaning: 'Determination', options: ['A: Dedication', 'B: Resolve', 'C: Focus', 'D: Determination'], correct: '🇩' },
  { word: 'Zusammenarbeit', meaning: 'Collaboration', options: ['A: Teamwork', 'B: Cooperation', 'C: Collaboration', 'D: Partnership'], correct: '🇩' },
  { word: 'Zweckmäßigkeit', meaning: 'Purposefulness', options: ['A: Effectiveness', 'B: Relevance', 'C: Suitability', 'D: Purposefulness'], correct: '🇩' },
  { word: 'Zustimmung', meaning: 'Approval', options: ['A: Consent', 'B: Agreement', 'C: Affirmation', 'D: Approval'], correct: '🇩' },
  { word: 'Zweifel', meaning: 'Doubt', options: ['A: Certainty', 'B: Uncertainty', 'C: Skepticism', 'D: Doubt'], correct: '🇩' }
  ],
  C2: [
    { word: 'Abgleich', meaning: 'Comparison', options: ['A: Harmony', 'B: Coordination', 'C: Adjustment', 'D: Comparison'], correct: '🇩' },
  { word: 'Abstraktionsvermögen', meaning: 'Ability to abstract', options: ['A: Logical thinking', 'B: Conceptualization', 'C: Deduction', 'D: Ability to abstract'], correct: '🇩' },
  { word: 'Allgemeingültigkeit', meaning: 'Universality', options: ['A: Generalization', 'B: Global applicability', 'C: Universality', 'D: Validity'], correct: '🇩' },
  { word: 'Amortisation', meaning: 'Amortization', options: ['A: Payback', 'B: Return', 'C: Reimbursement', 'D: Amortization'], correct: '🇩' },
  { word: 'Antizipation', meaning: 'Anticipation', options: ['A: Forecast', 'B: Prediction', 'C: Expectation', 'D: Anticipation'], correct: '🇩' },
  { word: 'Argumentationsfähigkeit', meaning: 'Argumentation skill', options: ['A: Persuasiveness', 'B: Rhetoric', 'C: Discussion ability', 'D: Argumentation skill'], correct: '🇩' },
  { word: 'Assoziation', meaning: 'Association', options: ['A: Relation', 'B: Connection', 'C: Link', 'D: Association'], correct: '🇩' },
  { word: 'Authentizität', meaning: 'Authenticity', options: ['A: Genuineness', 'B: Truth', 'C: Originality', 'D: Authenticity'], correct: '🇩' },
  { word: 'Berechenbarkeit', meaning: 'Predictability', options: ['A: Reliability', 'B: Expectability', 'C: Measurability', 'D: Predictability'], correct: '🇩' },
  { word: 'Differenzierung', meaning: 'Differentiation', options: ['A: Distinction', 'B: Segmentation', 'C: Classification', 'D: Differentiation'], correct: '🇩' },
  { word: 'Disziplin', meaning: 'Discipline', options: ['A: Orderliness', 'B: Control', 'C: Commitment', 'D: Discipline'], correct: '🇩' },
  { word: 'Erkennbarkeit', meaning: 'Recognizability', options: ['A: Visibility', 'B: Distinguishability', 'C: Clarity', 'D: Recognizability'], correct: '🇩' },
  { word: 'Ernsthaftigkeit', meaning: 'Seriousness', options: ['A: Gravity', 'B: Solemnity', 'C: Sincerity', 'D: Seriousness'], correct: '🇩' },
  { word: 'Exaktheit', meaning: 'Precision', options: ['A: Exactness', 'B: Rigidity', 'C: Carefulness', 'D: Precision'], correct: '🇩' },
  { word: 'Fähigkeitsanalyse', meaning: 'Skills analysis', options: ['A: Evaluation', 'B: Competency check', 'C: Capacity review', 'D: Skills analysis'], correct: '🇩' },
  { word: 'Flüssigkeit', meaning: 'Fluency', options: ['A: Ease', 'B: Smoothness', 'C: Flow', 'D: Fluency'], correct: '🇩' },
  { word: 'Gegenseitigkeit', meaning: 'Reciprocity', options: ['A: Symmetry', 'B: Exchange', 'C: Mutuality', 'D: Reciprocity'], correct: '🇩' },
  { word: 'Gegensatz', meaning: 'Contradiction', options: ['A: Contrast', 'B: Disagreement', 'C: Discrepancy', 'D: Contradiction'], correct: '🇩' },
  { word: 'Intuition', meaning: 'Intuition', options: ['A: Instinct', 'B: Insight', 'C: Perception', 'D: Intuition'], correct: '🇩' },
  { word: 'Konformität', meaning: 'Conformity', options: ['A: Agreement', 'B: Compliance', 'C: Adherence', 'D: Conformity'], correct: '🇩' },
  { word: 'Komplexität', meaning: 'Complexity', options: ['A: Intricacy', 'B: Difficulty', 'C: Entanglement', 'D: Complexity'], correct: '🇩' },
  { word: 'Korrektheit', meaning: 'Correctness', options: ['A: Rightness', 'B: Exactness', 'C: Accuracy', 'D: Correctness'], correct: '🇩' },
  { word: 'Kritikfähigkeit', meaning: 'Criticism capability', options: ['A: Review ability', 'B: Reflection', 'C: Analytical skill', 'D: Criticism capability'], correct: '🇩' },
  { word: 'Kultiviertheit', meaning: 'Cultivation', options: ['A: Refinement', 'B: Development', 'C: Culture', 'D: Cultivation'], correct: '🇩' },
  { word: 'Kompetenz', meaning: 'Competence', options: ['A: Expertise', 'B: Proficiency', 'C: Knowledge', 'D: Competence'], correct: '🇩' },
  { word: 'Loyalität', meaning: 'Loyalty', options: ['A: Allegiance', 'B: Faithfulness', 'C: Devotion', 'D: Loyalty'], correct: '🇩' },
  { word: 'Mangelware', meaning: 'Scarcity', options: ['A: Deficiency', 'B: Shortage', 'C: Deprivation', 'D: Scarcity'], correct: '🇩' },
  { word: 'Mobilität', meaning: 'Mobility', options: ['A: Flexibility', 'B: Motion', 'C: Mobility', 'D: Fluidity'], correct: '🇩' },
  { word: 'Modulation', meaning: 'Modulation', options: ['A: Control', 'B: Adjustment', 'C: Balance', 'D: Modulation'], correct: '🇩' },
  { word: 'Neutralität', meaning: 'Neutrality', options: ['A: Impartiality', 'B: Indifference', 'C: Objectivity', 'D: Neutrality'], correct: '🇩' },
  { word: 'Nachhaltigkeit', meaning: 'Sustainability', options: ['A: Durability', 'B: Eco-friendliness', 'C: Long-lasting', 'D: Sustainability'], correct: '🇩' },
  { word: 'Originalität', meaning: 'Originality', options: ['A: Uniqueness', 'B: Creativity', 'C: Novelty', 'D: Originality'], correct: '🇩' },
  { word: 'Permanenz', meaning: 'Permanence', options: ['A: Continuity', 'B: Stability', 'C: Durability', 'D: Permanence'], correct: '🇩' },
  { word: 'Priorität', meaning: 'Priority', options: ['A: Importance', 'B: Urgency', 'C: Preference', 'D: Priority'], correct: '🇩' },
  { word: 'Rationalität', meaning: 'Rationality', options: ['A: Reason', 'B: Logic', 'C: Sensibility', 'D: Rationality'], correct: '🇩' },
  { word: 'Skepsis', meaning: 'Skepticism', options: ['A: Doubt', 'B: Caution', 'C: Disbelief', 'D: Skepticism'], correct: '🇩' },
  { word: 'Sensibilität', meaning: 'Sensitivity', options: ['A: Awareness', 'B: Compassion', 'C: Sensitivity', 'D: Responsiveness'], correct: '🇩' },
  { word: 'Subtilität', meaning: 'Subtlety', options: ['A: Fineness', 'B: Delicacy', 'C: Refinement', 'D: Subtlety'], correct: '🇩' },
  { word: 'Synergie', meaning: 'Synergy', options: ['A: Cooperation', 'B: Efficiency', 'C: Interaction', 'D: Synergy'], correct: '🇩' },
  { word: 'Toleranz', meaning: 'Tolerance', options: ['A: Acceptance', 'B: Patience', 'C: Openness', 'D: Tolerance'], correct: '🇩' },
  { word: 'Tranzparenz', meaning: 'Transparency', options: ['A: Openness', 'B: Clarity', 'C: Disclosure', 'D: Transparency'], correct: '🇩' },
  { word: 'Universalisierung', meaning: 'Universalization', options: ['A: Globalization', 'B: Unification', 'C: Standardization', 'D: Universalization'], correct: '🇩' },
  { word: 'Verlässlichkeit', meaning: 'Reliability', options: ['A: Dependability', 'B: Trustworthiness', 'C: Consistency', 'D: Reliability'], correct: '🇩' },
  { word: 'Vernunft', meaning: 'Reason', options: ['A: Wisdom', 'B: Understanding', 'C: Logic', 'D: Reason'], correct: '🇩' },
  { word: 'Vertrauen', meaning: 'Trust', options: ['A: Confidence', 'B: Belief', 'C:Assurance', 'D: Trust'], correct: '🇩' },
  { word: 'Wahrnehmung', meaning: 'Perception', options: ['A: Sensibility', 'B: Awareness', 'C: Recognition', 'D: Perception'], correct: '🇩' },
  { word: 'Wissenschaftlichkeit', meaning: 'Scientific methodology', options: ['A: Research', 'B: Study', 'C: Examination', 'D: Scientific methodology'], correct: '🇩' },
  { word: 'Zielstrebigkeit', meaning: 'Determination', options: ['A: Focus', 'B: Persistence', 'C: Dedication', 'D: Goal orientation'], correct: '🇩' }
  ],
}; 

// Word of the Day data
const wordList = [
  { word: 'die Stadt', meaning: 'City', plural: 'die Städte', indefinite: 'eine Stadt', definite: 'die Stadt' },
  { word: 'der Apfel', meaning: 'An Apple', plural: 'die Äpfel', indefinite: 'ein Apfel', definite: 'der Apfel' },
  { word: 'das Buch', meaning: 'A Book', plural: 'die Bücher', indefinite: 'ein Buch', definite: 'das Buch' },
  { word: 'die Blume', meaning: 'Flower', plural: 'die Blumen', indefinite: 'eine Blume', definite: 'die Blume' },
  { word: 'der Hund', meaning: 'Dog', plural: 'die Hunde', indefinite: 'ein Hund', definite: 'der Hund' },
  { word: 'die Katze', meaning: 'Cat', plural: 'die Katzen', indefinite: 'eine Katze', definite: 'die Katze' },
  { word: 'das Haus', meaning: 'House', plural: 'die Häuser', indefinite: 'ein Haus', definite: 'das Haus' },
  { word: 'die Schule', meaning: 'School', plural: 'die Schulen', indefinite: 'eine Schule', definite: 'die Schule' },
  { word: 'der Tisch', meaning: 'Table', plural: 'die Tische', indefinite: 'ein Tisch', definite: 'der Tisch' },
  { word: 'die Lampe', meaning: 'Lamp', plural: 'die Lampen', indefinite: 'eine Lampe', definite: 'die Lampe' },
  { word: 'das Auto', meaning: 'Car', plural: 'die Autos', indefinite: 'ein Auto', definite: 'das Auto' },
  { word: 'die Tasche', meaning: 'Bag', plural: 'die Taschen', indefinite: 'eine Tasche', definite: 'die Tasche' },
  { word: 'der Stuhl', meaning: 'Chair', plural: 'die Stühle', indefinite: 'ein Stuhl', definite: 'der Stuhl' },
  { word: 'das Fenster', meaning: 'Window', plural: 'die Fenster', indefinite: 'ein Fenster', definite: 'das Fenster' },
  { word: 'die Wand', meaning: 'Wall', plural: 'die Wände', indefinite: 'eine Wand', definite: 'die Wand' },
  { word: 'die Tür', meaning: 'Door', plural: 'die Türen', indefinite: 'eine Tür', definite: 'die Tür' },
  { word: 'der Lehrer', meaning: 'Teacher (Male)', plural: 'die Lehrer', indefinite: 'ein Lehrer', definite: 'der Lehrer' },
  { word: 'die Lehrerin', meaning: 'Teacher (Female)', plural: 'die Lehrerinnen', indefinite: 'eine Lehrerin', definite: 'die Lehrerin' },
  { word: 'die Zeit', meaning: 'Time', plural: 'die Zeiten', indefinite: 'eine Zeit', definite: 'die Zeit' },
  { word: 'das Wasser', meaning: 'Water', plural: 'die Wasser', indefinite: 'ein Wasser', definite: 'das Wasser' },
  { word: 'der Tag', meaning: 'Day', plural: 'die Tage', indefinite: 'ein Tag', definite: 'der Tag' },
  { word: 'die Nacht', meaning: 'Night', plural: 'die Nächte', indefinite: 'eine Nacht', definite: 'die Nacht' },
  { word: 'der Monat', meaning: 'Month', plural: 'die Monate', indefinite: 'ein Monat', definite: 'der Monat' },
  { word: 'das Jahr', meaning: 'Year', plural: 'die Jahre', indefinite: 'ein Jahr', definite: 'das Jahr' },
  { word: 'der Freund', meaning: 'Friend (Male)', plural: 'die Freunde', indefinite: 'ein Freund', definite: 'der Freund' },
  { word: 'die Freundin', meaning: 'Friend (Female)', plural: 'die Freundinnen', indefinite: 'eine Freundin', definite: 'die Freundin' },
  { word: 'der Apfelbaum', meaning: 'Apple Tree', plural: 'die Apfelbäume', indefinite: 'ein Apfelbaum', definite: 'der Apfelbaum' },
  { word: 'das Schwein', meaning: 'Pig', plural: 'die Schweine', indefinite: 'ein Schwein', definite: 'das Schwein' },
  { word: 'der Vogel', meaning: 'Bird', plural: 'die Vögel', indefinite: 'ein Vogel', definite: 'der Vogel' },
  { word: 'die Maus', meaning: 'Mouse', plural: 'die Mäuse', indefinite: 'eine Maus', definite: 'die Maus' },
  { word: 'das Pferd', meaning: 'Horse', plural: 'die Pferde', indefinite: 'ein Pferd', definite: 'das Pferd' },
  { word: 'die Gabel', meaning: 'Fork', plural: 'die Gabeln', indefinite: 'eine Gabel', definite: 'die Gabel' },
  { word: 'das Messer', meaning: 'Knife', plural: 'die Messer', indefinite: 'ein Messer', definite: 'das Messer' },
  { word: 'der Löffel', meaning: 'Spoon', plural: 'die Löffel', indefinite: 'ein Löffel', definite: 'der Löffel' },
  { word: 'das Glas', meaning: 'Glass', plural: 'die Gläser', indefinite: 'ein Glas', definite: 'das Glas' },
  { word: 'die Tasse', meaning: 'Cup', plural: 'die Tassen', indefinite: 'eine Tasse', definite: 'die Tasse' },
  { word: 'der Teller', meaning: 'Plate', plural: 'die Teller', indefinite: 'ein Teller', definite: 'der Teller' },
  { word: 'die Gießkanne', meaning: 'Watering Can', plural: 'die Gießkannen', indefinite: 'eine Gießkanne', definite: 'die Gießkanne' },
  { word: 'das Kissen', meaning: 'Pillow', plural: 'die Kissen', indefinite: 'ein Kissen', definite: 'das Kissen' },
  { word: 'der Teppich', meaning: 'Carpet', plural: 'die Teppiche', indefinite: 'ein Teppich', definite: 'der Teppich' },
  { word: 'der Bildschirm', meaning: 'Screen', plural: 'die Bildschirme', indefinite: 'ein Bildschirm', definite: 'der Bildschirm' },
  { word: 'die Batterie', meaning: 'Battery', plural: 'die Batterien', indefinite: 'eine Batterie', definite: 'die Batterie' },  { word: 'das Telefon', meaning: 'Phone', plural: 'die Telefone', indefinite: 'ein Telefon', definite: 'das Telefon' },
  { word: 'die Maus', meaning: 'Mouse', plural: 'die Mäuse', indefinite: 'eine Maus', definite: 'die Maus' },
  { word: 'der Computer', meaning: 'Computer', plural: 'die Computer', indefinite: 'ein Computer', definite: 'der Computer' },
  { word: 'das Papier', meaning: 'Paper', plural: 'die Papiere', indefinite: 'ein Papier', definite: 'das Papier' },
  { word: 'der Stift', meaning: 'Pen', plural: 'die Stifte', indefinite: 'ein Stift', definite: 'der Stift' },
  { word: 'das Heft', meaning: 'Notebook', plural: 'die Hefte', indefinite: 'ein Heft', definite: 'das Heft' },
  { word: 'der Bleistift', meaning: 'Pencil', plural: 'die Bleistifte', indefinite: 'ein Bleistift', definite: 'der Bleistift' },
  { word: 'die Uhr', meaning: 'Clock', plural: 'die Uhren', indefinite: 'eine Uhr', definite: 'die Uhr' },
  { word: 'der Schreibtisch', meaning: 'Desk', plural: 'die Schreibtische', indefinite: 'ein Schreibtisch', definite: 'der Schreibtisch' },
  { word: 'die Decke', meaning: 'Ceiling', plural: 'die Decken', indefinite: 'eine Decke', definite: 'die Decke' },
  { word: 'der Boden', meaning: 'Floor', plural: 'die Böden', indefinite: 'ein Boden', definite: 'der Boden' },
  { word: 'der Raum', meaning: 'Room', plural: 'die Räume', indefinite: 'ein Raum', definite: 'der Raum' },
  { word: 'die Ecke', meaning: 'Corner', plural: 'die Ecken', indefinite: 'eine Ecke', definite: 'die Ecke' },
  { word: 'der Platz', meaning: 'Place', plural: 'die Plätze', indefinite: 'ein Platz', definite: 'der Platz' },
  { word: 'das Geschäft', meaning: 'Store', plural: 'die Geschäfte', indefinite: 'ein Geschäft', definite: 'das Geschäft' },
  { word: 'der Park', meaning: 'Park', plural: 'die Parks', indefinite: 'ein Park', definite: 'der Park' },
  { word: 'die Bibliothek', meaning: 'Library', plural: 'die Bibliotheken', indefinite: 'eine Bibliothek', definite: 'die Bibliothek' },
  { word: 'der Fluss', meaning: 'River', plural: 'die Flüsse', indefinite: 'ein Fluss', definite: 'der Fluss' },
  { word: 'der See', meaning: 'Lake', plural: 'die Seen', indefinite: 'ein See', definite: 'der See' },
  { word: 'das Meer', meaning: 'Sea', plural: 'die Meere', indefinite: 'ein Meer', definite: 'das Meer' },
  { word: 'der Himmel', meaning: 'Sky', plural: 'die Himmel', indefinite: 'ein Himmel', definite: 'der Himmel' },
  { word: 'die Wolke', meaning: 'Cloud', plural: 'die Wolken', indefinite: 'eine Wolke', definite: 'die Wolke' },
  { word: 'der Regen', meaning: 'Rain', plural: 'die Regen', indefinite: 'ein Regen', definite: 'der Regen' },
  { word: 'die Sonne', meaning: 'Sun', plural: 'die Sonnen', indefinite: 'eine Sonne', definite: 'die Sonne' },
  { word: 'der Wind', meaning: 'Wind', plural: 'die Winde', indefinite: 'ein Wind', definite: 'der Wind' },
  { word: 'das Feuer', meaning: 'Fire', plural: 'die Feuer', indefinite: 'ein Feuer', definite: 'das Feuer' },
  { word: 'der Schnee', meaning: 'Snow', plural: 'die Schneen', indefinite: 'ein Schnee', definite: 'der Schnee' },
  { word: 'die Erde', meaning: 'Earth', plural: 'die Erden', indefinite: 'eine Erde', definite: 'die Erde' },
  { word: 'der Berg', meaning: 'Mountain', plural: 'die Berge', indefinite: 'ein Berg', definite: 'der Berg' },
  { word: 'die Insel', meaning: 'Island', plural: 'die Inseln', indefinite: 'eine Insel', definite: 'die Insel' },
  { word: 'das Tal', meaning: 'Valley', plural: 'die Täler', indefinite: 'ein Tal', definite: 'das Tal' },
  { word: 'die Wüste', meaning: 'Desert', plural: 'die Wüsten', indefinite: 'eine Wüste', definite: 'die Wüste' },
  { word: 'der Wald', meaning: 'Forest', plural: 'die Wälder', indefinite: 'ein Wald', definite: 'der Wald' },
  { word: 'das Gebirge', meaning: 'Mountain Range', plural: 'die Gebirge', indefinite: 'ein Gebirge', definite: 'das Gebirge' },
  { word: 'der Ozean', meaning: 'Ocean', plural: 'die Ozeane', indefinite: 'ein Ozean', definite: 'der Ozean' },
  { word: 'die Mütze', meaning: 'Hat', plural: 'die Mützen', indefinite: 'eine Mütze', definite: 'die Mütze' },
  { word: 'der Schuh', meaning: 'Shoe', plural: 'die Schuhe', indefinite: 'ein Schuh', definite: 'der Schuh' },
  { word: 'das Hemd', meaning: 'Shirt', plural: 'die Hemden', indefinite: 'ein Hemd', definite: 'das Hemd' },
  { word: 'die Jacke', meaning: 'Jacket', plural: 'die Jacken', indefinite: 'eine Jacke', definite: 'die Jacke' },
  { word: 'der Mantel', meaning: 'Coat', plural: 'die Mäntel', indefinite: 'ein Mantel', definite: 'der Mantel' },
  { word: 'das Kleid', meaning: 'Dress', plural: 'die Kleider', indefinite: 'ein Kleid', definite: 'das Kleid' },
  { word: 'die Hose', meaning: 'Pants', plural: 'die Hosen', indefinite: 'eine Hose', definite: 'die Hose' },
  { word: 'der Rock', meaning: 'Skirt', plural: 'die Röcke', indefinite: 'ein Rock', definite: 'der Rock' },
  { word: 'das T-Shirt', meaning: 'T-shirt', plural: 'die T-Shirts', indefinite: 'ein T-Shirt', definite: 'das T-Shirt' },
  { word: 'die Brille', meaning: 'Glasses', plural: 'die Brillen', indefinite: 'eine Brille', definite: 'die Brille' },
  { word: 'der Hut', meaning: 'Hat', plural: 'die Hüte', indefinite: 'ein Hut', definite: 'der Hut' },
  { word: 'das Kleidungsstück', meaning: 'Clothing', plural: 'die Kleidungsstücke', indefinite: 'ein Kleidungsstück', definite: 'das Kleidungsstück' },
  { word: 'die Socken', meaning: 'Socks', plural: 'die Socken', indefinite: 'Socken', definite: 'die Socken' },
  { word: 'der Handschuh', meaning: 'Glove', plural: 'die Handschuhe', indefinite: 'ein Handschuh', definite: 'der Handschuh' },
  { word: 'die Tasche', meaning: 'Bag', plural: 'die Taschen', indefinite: 'eine Tasche', definite: 'die Tasche' },
  { word: 'das Portemonnaie', meaning: 'Wallet', plural: 'die Portemonnaies', indefinite: 'ein Portemonnaie', definite: 'das Portemonnaie' },
  { word: 'der Rucksack', meaning: 'Backpack', plural: 'die Rucksäcke', indefinite: 'ein Rucksack', definite: 'der Rucksack' },
  { word: 'die Kette', meaning: 'Necklace', plural: 'die Ketten', indefinite: 'eine Kette', definite: 'die Kette' },
  { word: 'der Ring', meaning: 'Ring', plural: 'die Ringe', indefinite: 'ein Ring', definite: 'der Ring' },
  { word: 'das Armband', meaning: 'Bracelet', plural: 'die Armbänder', indefinite: 'ein Armband', definite: 'das Armband' },
  { word: 'die Uhr', meaning: 'Watch', plural: 'die Uhren', indefinite: 'eine Uhr', definite: 'die Uhr' },
  { word: 'der Schlüssel', meaning: 'Key', plural: 'die Schlüssel', indefinite: 'ein Schlüssel', definite: 'der Schlüssel' },
  { word: 'das Schloss', meaning: 'Lock', plural: 'die Schlösser', indefinite: 'ein Schloss', definite: 'das Schloss' },
  { word: 'der Brief', meaning: 'Letter', plural: 'die Briefe', indefinite: 'ein Brief', definite: 'der Brief' },
  { word: 'die Post', meaning: 'Post', plural: 'die Post', indefinite: 'Post', definite: 'die Post' },
  { word: 'das Paket', meaning: 'Package', plural: 'die Pakete', indefinite: 'ein Paket', definite: 'das Paket' },
  { word: 'der Briefumschlag', meaning:'Envelope', plural: 'die Briefumschläge', indefinite: 'ein Briefumschlag', definite: 'der Briefumschlag' },
  { word: 'die Karte', meaning: 'Card', plural: 'die Karten', indefinite: 'eine Karte', definite: 'die Karte' },
  { word: 'der Stempel', meaning: 'Stamp', plural: 'die Stempel', indefinite: 'ein Stempel', definite: 'der Stempel' },
  { word: 'das Telefon', meaning: 'Phone', plural: 'die Telefone', indefinite: 'ein Telefon', definite: 'das Telefon' },
  { word: 'die Nachricht', meaning: 'Message', plural: 'die Nachrichten', indefinite: 'eine Nachricht', definite: 'die Nachricht' },
  { word: 'der Anruf', meaning: 'Call', plural: 'die Anrufe', indefinite: 'ein Anruf', definite: 'der Anruf' },
  { word: 'das Fax', meaning: 'Fax', plural: 'die Faxe', indefinite: 'ein Fax', definite: 'das Fax' },
  { word: 'die E-Mail', meaning: 'Email', plural: 'die E-Mails', indefinite: 'eine E-Mail', definite: 'die E-Mail' },
  { word: 'der Computer', meaning: 'Computer', plural: 'die Computer', indefinite: 'ein Computer', definite: 'der Computer' },
  { word: 'das Internet', meaning: 'Internet', plural: 'die Internets', indefinite: 'ein Internet', definite: 'das Internet' },
  { word: 'die Website', meaning: 'Website', plural: 'die Websites', indefinite: 'eine Website', definite: 'die Website' },
  { word: 'der Bildschirm', meaning: 'Screen', plural: 'die Bildschirme', indefinite: 'ein Bildschirm', definite: 'der Bildschirm' },
  { word: 'das Kabel', meaning: 'Cable', plural: 'die Kabel', indefinite: 'ein Kabel', definite: 'das Kabel' },
  { word: 'die Maus', meaning: 'Mouse', plural: 'die Mäuse', indefinite: 'eine Maus', definite: 'die Maus' },
  { word: 'der Lautsprecher', meaning: 'Speaker', plural: 'die Lautsprecher', indefinite: 'ein Lautsprecher', definite: 'der Lautsprecher' },
  { word: 'das Mikrofon', meaning: 'Microphone', plural: 'die Mikrofone', indefinite: 'ein Mikrofon', definite: 'das Mikrofon' },
  { word: 'die Kamera', meaning: 'Camera', plural: 'die Kameras', indefinite: 'eine Kamera', definite: 'die Kamera' },
  { word: 'der Drucker', meaning: 'Printer', plural: 'die Drucker', indefinite: 'ein Drucker', definite: 'der Drucker' },
  { word: 'das Faxgerät', meaning: 'Fax Machine', plural: 'die Faxgeräte', indefinite: 'ein Faxgerät', definite: 'das Faxgerät' },
  { word: 'die Tastatur', meaning: 'Keyboard', plural: 'die Tastaturen', indefinite: 'eine Tastatur', definite: 'die Tastatur' },
  { word: 'der Speicher', meaning: 'Memory', plural: 'die Speicher', indefinite: 'ein Speicher', definite: 'der Speicher' },
  { word: 'das Ladegerät', meaning: 'Charger', plural: 'die Ladegeräte', indefinite: 'ein Ladegerät', definite: 'das Ladegerät' },
  { word: 'die Software', meaning: 'Software', plural: 'die Software', indefinite: 'Software', definite: 'die Software' },
  { word: 'der USB-Stick', meaning: 'USB Stick', plural: 'die USB-Sticks', indefinite: 'ein USB-Stick', definite: 'der USB-Stick' },
  { word: 'das USB-Kabel', meaning: 'USB Cable', plural: 'die USB-Kabel', indefinite: 'ein USB-Kabel', definite: 'das USB-Kabel' },
  { word: 'die Festplatte', meaning: 'Hard Drive', plural: 'die Festplatten', indefinite: 'eine Festplatte', definite: 'die Festplatte' },
  { word: 'der Laptop', meaning: 'Laptop', plural: 'die Laptops', indefinite: 'ein Laptop', definite: 'der Laptop' },
  { word: 'das Tablet', meaning: 'Tablet', plural: 'die Tablets', indefinite: 'ein Tablet', definite: 'das Tablet' },
  { word: 'die Mausmatte', meaning: 'Mousepad', plural: 'die Mausmatten', indefinite: 'eine Mausmatte', definite: 'die Mausmatte' },
  { word: 'der Stecker', meaning: 'Plug', plural: 'die Stecker', indefinite: 'ein Stecker', definite: 'der Stecker' },
  { word: 'das Kabel', meaning: 'Cable', plural: 'die Kabel', indefinite: 'ein Kabel', definite: 'das Kabel' },
  { word: 'die Straße', meaning: 'Street', plural: 'die Straßen', indefinite: 'eine Straße', definite: 'die Straße' },
  { word: 'der Park', meaning: 'Park', plural: 'die Parks', indefinite: 'ein Park', definite: 'der Park' },
  { word: 'das Gebäude', meaning: 'Building', plural: 'die Gebäude', indefinite: 'ein Gebäude', definite: 'das Gebäude' },
  { word: 'die Stadt', meaning: 'City', plural: 'die Städte', indefinite: 'eine Stadt', definite: 'die Stadt' },
  { word: 'der Platz', meaning: 'Square', plural: 'die Plätze', indefinite: 'ein Platz', definite: 'der Platz' },
  { word: 'das Dorf', meaning: 'Village', plural: 'die Dörfer', indefinite: 'ein Dorf', definite: 'das Dorf' },
  { word: 'die Brücke', meaning: 'Bridge', plural: 'die Brücken', indefinite: 'eine Brücke', definite: 'die Brücke' },
  { word: 'der Fluss', meaning: 'River', plural: 'die Flüsse', indefinite: 'ein Fluss', definite: 'der Fluss' },
  { word: 'das Meer', meaning: 'Sea', plural: 'die Meere', indefinite: 'ein Meer', definite: 'das Meer' },
  { word: 'die Insel', meaning: 'Island', plural: 'die Inseln', indefinite: 'eine Insel', definite: 'die Insel' },
  { word: 'der Wald', meaning: 'Forest', plural: 'die Wälder', indefinite: 'ein Wald', definite: 'der Wald' },
  { word: 'das Land', meaning: 'Country', plural: 'die Länder', indefinite: 'ein Land', definite: 'das Land' },
  { word: 'die Wüste', meaning: 'Desert', plural: 'die Wüsten', indefinite: 'eine Wüste', definite: 'die Wüste' },
  { word: 'der Berg', meaning: 'Mountain', plural: 'die Berge', indefinite: 'ein Berg', definite: 'der Berg' },
  { word: 'das Tal', meaning: 'Valley', plural: 'die Täler', indefinite: 'ein Tal', definite: 'das Tal' },
  { word: 'die Küste', meaning: 'Coast', plural: 'die Küsten', indefinite: 'eine Küste', definite: 'die Küste' },
  { word: 'der See', meaning: 'Lake', plural: 'die Seen', indefinite: 'ein See', definite: 'der See' },
  { word: 'das Ufer', meaning: 'Shore', plural: 'die Ufer', indefinite: 'ein Ufer', definite: 'das Ufer' },
  { word: 'die Straße', meaning: 'Road', plural: 'die Straßen', indefinite: 'eine Straße', definite: 'die Straße' },
  { word: 'der Weg', meaning: 'Path', plural: 'die Wege', indefinite: 'ein Weg', definite: 'der Weg' },
  { word: 'das Auto', meaning: 'Car', plural: 'die Autos', indefinite: 'ein Auto', definite: 'das Auto' },
  { word: 'die Bahn', meaning: 'Train', plural: 'die Bahnen', indefinite: 'eine Bahn', definite: 'die Bahn' },
  { word: 'der Bus', meaning: 'Bus', plural: 'die Busse', indefinite: 'ein Bus', definite: 'der Bus' },
  { word: 'das Flugzeug', meaning: 'Airplane', plural: 'die Flugzeuge', indefinite: 'ein Flugzeug', definite: 'das Flugzeug' },
  { word: 'der Schiff', meaning: 'Ship', plural: 'die Schiffe', indefinite: 'ein Schiff', definite: 'der Schiff' },
  { word: 'die Fahrräder', meaning: 'Bicycles', plural: 'die Fahrräder', indefinite: 'Fahrräder', definite: 'die Fahrräder' },
  { word: 'der Flughafen', meaning: 'Airport', plural: 'die Flughäfen', indefinite: 'ein Flughafen', definite: 'der Flughafen' },
  { word: 'das Ticket', meaning: 'Ticket', plural: 'die Tickets', indefinite: 'ein Ticket', definite: 'das Ticket' },
  { word: 'die Karte', meaning: 'Map', plural: 'die Karten', indefinite: 'eine Karte', definite: 'die Karte' },
  { word: 'der Plan', meaning: 'Plan', plural: 'die Pläne', indefinite: 'ein Plan', definite: 'der Plan' },
  { word: 'die Richtung', meaning: 'Direction', plural: 'die Richtungen', indefinite: 'eine Richtung', definite: 'die Richtung' },
  { word: 'der Süden', meaning: 'South', plural: 'die Süden', indefinite: 'Süden', definite: 'der Süden' },
  { word: 'das Norden', meaning: 'North', plural: 'die Norden', indefinite: 'Norden', definite: 'das Norden' },
  { word: 'der Westen', meaning: 'West', plural: 'die Westen', indefinite: 'Westen', definite: 'der Westen' },
  { word: 'das Osten', meaning: 'East', plural: 'die Osten', indefinite: 'Osten', definite: 'das Osten' },
  { word: 'die Geschwindigkeit', meaning: 'Speed', plural: 'die Geschwindigkeiten', indefinite: 'eine Geschwindigkeit', definite: 'die Geschwindigkeit' },
  { word: 'der Stau', meaning: 'Traffic Jam', plural: 'die Staus', indefinite: 'ein Stau', definite: 'der Stau' },
  { word: 'die Brücke', meaning: 'Bridge', plural: 'die Brücken', indefinite: 'eine Brücke', definite: 'die Brücke' },
  { word: 'der Tunnel', meaning: 'Tunnel', plural: 'die Tunnel', indefinite: 'ein Tunnel', definite: 'der Tunnel' },
  { word: 'das Verkehrsschild', meaning: 'Traffic Sign', plural: 'die Verkehrsschilder', indefinite: 'ein Verkehrsschild', definite: 'das Verkehrsschild' },
  { word: 'die Straße', meaning: 'Street', plural: 'die Straßen', indefinite: 'eine Straße', definite: 'die Straße' },
  { word: 'der Verkehr', meaning: 'Traffic', plural: 'die Verkehre', indefinite: 'Verkehr', definite: 'der Verkehr' },
  { word: 'das Parken', meaning: 'Parking', plural: 'die Parken', indefinite: 'Parken', definite: 'das Parken' },
  { word: 'der Parkplatz', meaning: 'Parking Lot', plural: 'die Parkplätze', indefinite: 'ein Parkplatz', definite: 'der Parkplatz' },
  { word: 'das Taxi', meaning: 'Taxi', plural: 'die Taxis', indefinite: 'ein Taxi', definite: 'das Taxi' },
  { word: 'die Linie', meaning: 'Line', plural: 'die Linien', indefinite: 'eine Linie', definite: 'die Linie' },
  { word: 'der Wegweiser', meaning: 'Signpost', plural: 'die Wegweiser', indefinite: 'ein Wegweiser', definite: 'der Wegweiser' },
  { word: 'die Kreuzung', meaning: 'Intersection', plural: 'die Kreuzungen', indefinite: 'eine Kreuzung', definite: 'die Kreuzung' },
  { word: 'der Bürgersteig', meaning: 'Sidewalk', plural: 'die Bürgersteige', indefinite: 'ein Bürgersteig', definite: 'der Bürgersteig' },
  { word: 'das Autohaus', meaning: 'Car Dealership', plural: 'die Autohäuser', indefinite: 'ein Autohaus', definite: 'das Autohaus' },
  { word: 'die Werkstatt', meaning: 'Workshop', plural: 'die Werkstätten', indefinite: 'eine Werkstatt', definite: 'die Werkstatt' },
  { word: 'der Motor', meaning: 'Engine', plural: 'die Motoren', indefinite: 'ein Motor', definite: 'der Motor' },
  { word: 'das Getriebe', meaning: 'Transmission', plural: 'die Getriebe', indefinite: 'ein Getriebe', definite: 'das Getriebe' },
  { word: 'der Reifen', meaning: 'Tire', plural: 'die Reifen', indefinite: 'ein Reifen', definite: 'der Reifen' },
  { word: 'das Autozubehör', meaning: 'Car Accessories', plural: 'die Autozubehör', indefinite: 'Autozubehör', definite: 'das Autozubehör' },
  { word: 'die Karosserie', meaning: 'Car Body', plural: 'die Karosserien', indefinite: 'eine Karosserie', definite: 'die Karosserie' }
]; 

// Shuffle array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}; 

// Level selection and quiz function
let quizInProgress = false; 

// Function to send a quiz message
const sendQuizMessage = async (channel, user, question, options) => {
  const embed = new EmbedBuilder()
    .setTitle('**German Vocabulary Quiz**')
    .setDescription(question)
    .addFields(options.map((opt) => ({ name: opt, value: '\u200B', inline: true })))
    .setColor('#E67E22')
    .setFooter({ text: 'React with the emoji corresponding to your answer' }); 

  const quizMessage = await channel.send({ embeds: [embed] }); 

  for (const option of ['🇦', '🇧', '🇨', '🇩']) {
    await quizMessage.react(option);
  } 

  return quizMessage;
}; 

// Message event listener
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '!quiz') {
    if (quizInProgress) {
      return message.reply('A quiz is already in progress. Please wait.');
    } 

    quizInProgress = true;
    const levelEmbed = new EmbedBuilder()
      .setTitle('Choose Your Level')
      .setDescription('React to select your level:\n\n🇦: A1\n🇧: A2\n🇨: B1\n🇩: B2\n🇪: C1\n🇫: C2')
      .setColor('#3498DB'); 

    const levelMessage = await message.channel.send({ embeds: [levelEmbed] }); 

    const levelEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'];
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; 

    await Promise.all(levelEmojis.map((emoji) => levelMessage.react(emoji))); 

    const filter = (reaction, user) => levelEmojis.includes(reaction.emoji.name) && user.id === message.author.id; 

    try {
      const collected = await levelMessage.awaitReactions({ filter, max: 1, time: 15000 });
      const reaction = collected.first(); 

      if (!reaction) {
        quizInProgress = false;
        await levelMessage.delete();
        return message.channel.send('No level selected. Quiz cancelled.');
      } 

      const selectedLevel = levels[levelEmojis.indexOf(reaction.emoji.name)];
let userLevel = selectedLevel; // Store the user's level
      await levelMessage.delete(); 

      const questions = quizData[selectedLevel] || [];
      shuffleArray(questions); 

      // Select only 5 questions from the shuffled array (or as many as available)
      const questionsToAsk = questions.slice(0, 5); 

      if (questionsToAsk.length === 0) {
        quizInProgress = false;
        return message.channel.send('No questions available for this level.');
      } 

      let score = 0;
      const detailedResults = []; 

      for (const question of questionsToAsk) {
        const quizMessage = await sendQuizMessage(
          message.channel,
          message.author,
          `What is the English meaning of "${question.word}"?`,
          question.options
        ); 

        const quizFilter = (reaction, user) =>
          ['🇦', '🇧', '🇨', '🇩'].includes(reaction.emoji.name) && user.id === message.author.id; 

        try {
          const quizCollected = await quizMessage.awaitReactions({ filter: quizFilter, max: 1, time: 15000 });
          const quizReaction = quizCollected.first(); 

          if (quizReaction && quizReaction.emoji.name === question.correct) {
            score++;
            detailedResults.push({
              word: question.word,
              userAnswer: question.options[['🇦', '🇧', '🇨', '🇩'].indexOf(quizReaction.emoji.name)].split(': ')[1],
              correct: question.meaning,
              isCorrect: true,
            });
          } else {
            detailedResults.push({
              word: question.word,
              userAnswer: quizReaction
                ? question.options[['🇦', '🇧', '🇨', '🇩'].indexOf(quizReaction.emoji.name)].split(': ')[1]
                : 'No Answer',
              correct: question.meaning,
              isCorrect: false,
            });
          }
        } catch (error) {
          console.error('Reaction collection failed:', error);
          detailedResults.push({
            word: question.word,
            userAnswer: 'No Answer',
            correct: question.meaning,
            isCorrect: false,
          });
        } finally {
          await quizMessage.delete();
        }
      } 

       const resultEmbed = new EmbedBuilder()
  .setTitle('Quiz Results')
  .setDescription(
    `**Level:** ${userLevel}\nYou scored ${score} out of ${questionsToAsk.length}!`
  )
  .setColor('E67E22')
  .addFields(
    {
      name: 'Detailed Results',
      value: detailedResults
        .map(
          (res) =>
            `**Word:** ${res.word}\nYour Answer: ${res.userAnswer}\nCorrect: ${res.correct}\nResult: ${
              res.isCorrect ? '✅' : '❌'
            }`
        )
        .join('\n\n'),
    }
  );

      await message.channel.send({ embeds: [resultEmbed] });
    } catch (error) {
      console.error('Error during level selection:', error);
    } finally {
      quizInProgress = false;
    }
  }
}); 

// Word of the Day
const wordOfTheDayChannelId = '1225363050207514675';
const sendWordOfTheDay = async () => {
  const channel = await client.channels.fetch(wordOfTheDayChannelId);
  const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
  const embed = new EmbedBuilder()
    .setTitle('**Word of the Day**') // Bold title
    .setDescription(`Today's Word of the Day is...\n\n**${randomWord.word}**`) // Normal sentence, bold word
    .addFields(
      { name: '**Meaning**', value: randomWord.meaning, inline: false },
      { name: '**Plural**', value: randomWord.plural, inline: false },
      { name: '**Indefinite Article**', value: randomWord.indefinite, inline: false },
      { name: '**Definite Article**', value: randomWord.definite, inline: false }
    )
    .setColor('#E67E22'); 

  await channel.send({ embeds: [embed] });
}; 

cron.schedule(
  '30 04 * * *',
  () => {
    sendWordOfTheDay();
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  }
); 

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
}); 

client.login(TOKEN);