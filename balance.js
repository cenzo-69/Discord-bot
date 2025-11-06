const db = require('quick.db');

module.exports = {
  name: 'bal',
  async execute(client,message, args) {
    const target = message.mentions.users.first() || message.author;
    const money = db.get(`money_${target.id}`) || 0;
    message.reply(`${target.username} has 💰 ${money}`);
  }
};