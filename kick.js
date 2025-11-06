const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'kick a user',
  async execute(message, args, client) {
    // ignores bot and gooning peoples
    if (message.author.bot) return;

    // Get the member either from mention or ID
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    // checks if member has permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      const embed = new EmbedBuilder()
        .setDescription('you dont have permission papi') // weird ass embed for no permission people
        .setColor('Red');
      return message.reply({ embeds: [embed] });
    }

    // checking if bot has n word pass
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("I don't have permission to kick members."); 
    }

    // if no one is mentioned 
    if (!member) return message.reply('please mention someone papi');
    
    if (!member) return message.reply("User not found."); // kicking ghosts gg

    
    // sucide prevention 
    if (member.id === message.author.id) return message.reply('you cant kick yourself papi');  

    // begging for life 
    if (member.id === client.user.id) return message.reply('you cant kick me papi please im begging you');

    // checking high level discord mod role if they got any which i doubt but just incase 
    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("I can't kick this user because their role is higher than mine."); 
    }
if (member.roles.highest.position >= message.member.roles.highest.position) 

  return message.reply("You can't kick this user because their role is higher than yours."); 
    
    // blud just kicked for fun 
    let reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await member.kick(reason);

      // weird ass embed after someone is kicked 
      const embed = new EmbedBuilder()
        .setDescription(`
**_Victim_**: ${member}  
**_Mod_**: ${message.author} 
**_Reason_**: ${reason}`)
        .setColor('Green'); 
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error); // ofc i made this code there should be an error so thats why this part kinda works same as condoms to prevent errors/kids
      message.reply('There was an error kicking the member.');
    }
  }
};