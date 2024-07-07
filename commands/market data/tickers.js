const { SlashCommandBuilder, EmbedBuilder, SKU } = require('discord.js');
require('dotenv').config();
const blockchainApiKey = process.env.BLOCKCHAIN_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickers')
    .setDescription('Get a list of ticker symbols'),

    async execute(interaction) {
      const headers = {
        'Accept': 'application/json',
        'X-API-Token': blockchainApiKey
    }

    try {
      const fetch = await import('node-fetch').then(module => module.default);
      const response = await fetch('https://api.blockchain.com/v3/exchange/tickers', {
        method: 'GET',
        headers: headers
    });
    
    const data = await response.json();
    const dataFields = data.map(d => ({
      name: `${d.symbol} - ${d.price_24h}`,
      value: `Volume: ${d.volume_24h}, Last Trade Price: ${d.last_trade_price}`,
      inline: true
  }));

    const slicedDataFileds = dataFields.slice(0, 25);

    const tickersEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`Tickers List`)
          .addFields(slicedDataFileds)
          .setTimestamp()
          .setFooter({ text: 'Data provided by Blockchain.com' });
    
    
    await interaction.reply({ embeds: [tickersEmbed] });

    }

    catch (error) {
      console.error('Error fetching order book data:', error);
      await interaction.reply(`There was an error fetching the order book data for ${symbol}. Please try again later.`);

    }
}}