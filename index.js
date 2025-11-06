require('dotenv').config();
/** const mongoose = require('mongoose');
 mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err)) **/
const fs = require('fs');
const path = require('path');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes
} = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const prefix = process.env.PREFIX || '!'; // default prefix

// 🔹 custom prefix support
const prefixes =  require('./prefixes.json');
const defaultPrefix = prefix;

// Handle multiple guild IDs
let guildIds = [];
if (process.env.GUILD_IDS) {
  guildIds = process.env.GUILD_IDS.split(',').map(id => id.trim());
} else if (process.env.GUILD_ID) {
  guildIds = [process.env.GUILD_ID];
}

const client = new Client({
  intents: Object.values(GatewayIntentBits)
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.interactions = new Collection();

let slashCount = 0;
let prefixCount = 0;
let interactionCount = 0;
let eventCount = 0;

// Load Slash Commands with support for nested folders
function loadSlash(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadSlash(fullPath);
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.slashCommands.set(command.data.name, command);
        slashCount++;
      }
    }
  }
}

// Load Prefix Commands with support for nested folders
function loadPrefix(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadPrefix(fullPath);
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.name && command.execute) {
        client.prefixCommands.set(command.name, command);
        prefixCount++;
      }
    }
  }
}

// ✅ Load Interactions (supports regex, string, and arrays)
function loadInteractions(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadInteractions(fullPath);
    } else if (file.name.endsWith('.js')) {
      const interactionFile = require(fullPath);

      if (interactionFile.execute) {
        if (interactionFile.customIds) {
          // Array of strings or regex
          interactionFile.customIds.forEach(id => {
            client.interactions.set(id, interactionFile.execute);
            interactionCount++;
          });
        } else if (interactionFile.customId) {
          // Single string or regex
          client.interactions.set(interactionFile.customId, interactionFile.execute);
          interactionCount++;
        }
      }
    }
  }
}

// Load Events with support for nested folders
function loadEvents(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      loadEvents(fullPath);
    } else if (file.name.endsWith('.js')) {
      const event = require(fullPath);
      if (event.name && event.execute) {
        if (event.once)
          client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
        eventCount++;
      }
    }
  }
}

// Load everything
loadSlash(path.join(__dirname, 'slash'));
loadPrefix(path.join(__dirname, 'prefix'));
loadInteractions(path.join(__dirname, 'interactions'));
loadEvents(path.join(__dirname, 'events'));

// Register Slash Commands for multiple guilds
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    if (guildIds.length === 0) {
      console.log('⚠️ No guild IDs specified. Registering global commands...');
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: client.slashCommands.map(cmd => cmd.data.toJSON()) }
      );
    } else {
      for (const guildId of guildIds) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: client.slashCommands.map(cmd => cmd.data.toJSON()) }
        );
        console.log(`✅ Registered commands for guild: ${guildId}`);
      }
    }

    console.log(`✅ Loaded ${slashCount} slash commands`);
    console.log(`✅ Loaded ${prefixCount} prefix commands`);
    console.log(`✅ Loaded ${interactionCount} interactions`);
    console.log(`✅ Loaded ${eventCount} events`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// Prefix Command Handler (🔹 now supports per-guild prefixes)
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  // Get guild-specific prefix
  const guildPrefix = prefixes[message.guild.id] || defaultPrefix;

  if (!message.content.startsWith(guildPrefix)) return;
  const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  // Built-in setprefix command
  if (commandName === 'setprefix') {
    if (!message.member.permissions.has('Administrator'))
      return message.reply('no perms papi');

    const newPrefix = args[0];
    if (!newPrefix) return message.reply('give me a prefix papi');

    prefixes[message.guild.id] = newPrefix;
    fs.writeFileSync('./prefixes.json', JSON.stringify(prefixes, null, 2));
    return message.reply(`prefix set to \`${newPrefix}\``);
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Error executing prefix command ${commandName}:`, error);
    message.reply('There was an error executing that command.').catch(console.error);
  }
});

// ✅ Improved Interaction Handler (regex + string support)
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (command) await command.execute(interaction, client);
    } else {
      let matchedHandler;

      // Support both string and regex matches
      for (const [id, handler] of client.interactions) {
        if (typeof id === 'string' && id === interaction.customId) {
          matchedHandler = handler;
          break;
        } else if (id instanceof RegExp && id.test(interaction.customId)) {
          matchedHandler = handler;
          break;
        }
      }

      if (matchedHandler) {
        console.log(`⚡ Interaction matched: ${interaction.customId}`);
        await matchedHandler(interaction, client);
      } else {
        console.log(`❌ No interaction handler for ID: ${interaction.customId}`);
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error executing this interaction.',
        ephemeral: true
      }).catch(console.error);
    } else {
      await interaction.reply({
        content: 'There was an error executing this interaction.',
        ephemeral: true
      }).catch(console.error);
    }
  }
});
console.log('Bot is online!');
client.login(token);