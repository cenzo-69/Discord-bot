const fs = require('fs');
const path = require('path');
const prefixesPath = path.join(__dirname, '../prefixes.json');

module.exports = {
  name: 'prefix',
  description: 'View or change the guild prefix',
  async execute(message, args, client) {
    const prefixes = require(prefixesPath);
    const defaultPrefix = process.env.PREFIX || '?';
    const guildId = message.guild.id;

    // show current prefix
    if (!args[0]) {
      const guildPrefix = prefixes[guildId] || defaultPrefix;
      return message.reply(`The current prefix for this guild is \`${guildPrefix}\``);
    }

    // change prefix
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('You need `Manage Server` permission to change the prefix.');
    }
    if (args[0].length > 5)
        {
      return message.reply('prefix cant be longer than 5 characters papi');

    };
    const newPrefix = args[0];
    prefixes[guildId] = newPrefix;

    fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));
    return message.reply(`Prefix updated to \`${newPrefix}\``);
  }
};