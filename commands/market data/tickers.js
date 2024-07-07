const { SlashCommandBuilder, EmbedBuilder, SKU } = require('discord.js');
require('dotenv').config();
const blockchainApiKey = process.env.BLOCKCHAIN_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickers')
    .setDescription('Get a list of ticker symbols')
    .addStringOption(option => 
      option.setName('symbol')
      .setDescription('Blockchain symbol identifier, e.g., BTC-USD')
      .setRequired(false)
    ),

  async execute(interaction) {
    const symbol = interaction.options.getString("symbol") ?? null;
    const headers = {
      'Accept': 'application/json',
      'X-API-Token': blockchainApiKey
    }
    
    let data;
    let dataFields;


    try {
      const fetch = await import('node-fetch').then(module => module.default);

      if (symbol) {
        url = `https://api.blockchain.com/v3/exchange/tickers/${symbol}`
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        data = await response.json();
        const dataArray = [data];
        dataFields = dataArray.map(d => ({
        name: `${d.symbol} - ${d.price_24h}`,
        value: `Volume: ${d.volume_24h}, Last Trade Price: ${d.last_trade_price}`,
        inline: true
      }));
      } else {
        url = 'https://api.blockchain.com/v3/exchange/tickers/'

        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        data = await response.json();
        dataFields = data.map(d => ({
        name: `${d.symbol} - ${d.price_24h}`,
        value: `Volume: ${d.volume_24h}, Last Trade Price: ${d.last_trade_price}`,
        inline: true
        }));
      }


      const slicedDataFields = dataFields.slice(0, 25);

      const tickersEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Tickers List')
        .addFields(slicedDataFields)
        .setTimestamp()
        .setFooter({ text: 'Data provided by Blockchain.com' });

      await interaction.reply({ embeds: [tickersEmbed] });

    } catch (error) {
      console.error('Error fetching tickers data:', error);
      await interaction.reply(`There was an error fetching tickers data for ${symbol}. Please try again later.`);
    }
  }
};