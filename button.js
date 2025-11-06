const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'button',
  description: 'button',
  async execute(message, args, client) {

    const embed = new EmbedBuilder()
      .setDescription('button')
      .setColor('00eeff');

    const button = new ButtonBuilder()
      .setCustomId('hi')
      .setLabel('Hi with username')
      .setStyle(ButtonStyle.Primary);
    
    const buttonID = new ButtonBuilder()
    .setCustomId('hiID')
    .setLabel('Hi with id')
    .setStyle(ButtonStyle.Primary);
    
    const buttonMention = new ButtonBuilder()
    .setCustomId('hiMention')
    .setLabel('Hi with mention')
    .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(button, buttonID,buttonMention);

    await message.channel.send({ embeds: [embed], components: [row] });
    
  }
};