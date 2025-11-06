const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'eval',
  description: 'eval',
  async execute(message, args, client) {
    const ownerID = "830747048386494490";
    if (message.author.id !== ownerID)
      return message.reply('nice try');

    const code = args.join(' ');
    if (!code) return message.reply('Please provide code to evaluate.');

    try {
      let evaled = eval(code);
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

      const embed = new EmbedBuilder()
        .setDescription(`\`\`\`js\n${evaled}\`\`\``)
        .setColor('Green');
      message.reply({ embeds: [embed] });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setDescription(`\`\`\`js\n${err}\`\`\``)
        .setColor('Red');
      message.reply({ embeds: [embed] });
    }
  },
};