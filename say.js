module.exports = {
  name: 'say',
  description: 'yapping',
  async execute(message, args, client) {

    try {
       
    if (message.content.includes('nigga')) {
      console.log('say command used');
      await message.reply('no n word papi');
      await message.react('💔');
      if (message.guild.members.me.permissions.has('ManageMessages')) {
        await message.delete();
        return; 
         }
      else {
        return message.reply('i dont have permission to delete messages papi');
        
      }
// stopping code from gooning
    }

    if (message.content.includes('@everyone')) {
      console.log('say command used');
      await message.reply('no pinging everyone papi');
      await message.react('💔'); // sad face for gooning peoples
      return;
    }
// 
     
    return message.channel.send(args.join(' '));

      } catch (error) {
      console.log(error);

      }

  }
}