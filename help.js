const { EmbedBuilder } = require('discord.js')
module.exports = {
  name: 'help',
  description: 'help',
  async execute(message, args, client) { 

    const embed = new EmbedBuilder()
    .setTitle('help command of baddie')
    .setDescription(' ?say <text> - say something\n ?kick <mention> - kick someone\n ?button - button\n ?eval <code> - eval code\n ?help - help command')
    .setColor('#00eeff')
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 1024 }))
                
    .setFooter({ text: 'baddie', iconURL: message.author.displayAvatarURL({ dynamic: true, size: 1024 } ) })
      
    await message.channel.send({ embeds: [embed] })
      
  }
}