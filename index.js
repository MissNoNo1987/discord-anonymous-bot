// Requiere Node.js v16.9+ y discord.js v14

const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const TOKEN = process.env.DISCORD_TOKEN;  // Pon aquí tu token en archivo .env
const GUILD_ID = 'TU_SERVIDOR_ID';       // Reemplaza con tu ID de servidor
const CHANNEL_ID = 'ID_CANAL_dark-room'; // Reemplaza con el ID de canal dark-room
const ROLE_CONTROLLER = 'controller';
const ROLE_CONTROLLED = 'controlled';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.guild) return; // Sólo DMs

  const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
  if (!guild) return;

  const member = await guild.members.fetch(message.author.id).catch(() => null);
  if (!member) {
    message.author.send('❌ You must be a member of the server to use this bot.');
    return;
  }

  const hasController = member.roles.cache.some(r => r.name.toLowerCase() === ROLE_CONTROLLER);
  const hasControlled = member.roles.cache.some(r => r.name.toLowerCase() === ROLE_CONTROLLED);

  if (!hasController && !hasControlled) {
    message.author.send('❌ Only users with roles `controller` or `controlled` can send anonymous messages.');
    return;
  }

  const channel = await guild.channels.fetch(CHANNEL_ID).catch(() => null);
  if (!channel) {
    message.author.send('❌ The anonymous channel was not found.');
    return;
  }

  const prefix = hasController ? 'Controller said:' : 'Controlled said:';

  channel.send(`**${prefix}**\n${message.content}`)
    .then(() => {
      message.author.send('✅ Your anonymous message was sent successfully.');
    })
    .catch(() => {
      message.author.send('❌ Failed to send your anonymous message.');
    });
});

client.login(TOKEN);
