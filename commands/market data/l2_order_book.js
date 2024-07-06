const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const blockchainApiKey = process.env.BLOCKCHAIN_API_KEY;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('l2-order-book')
        .setDescription("Level 2 Order Book data")
        .addUserOption(option => option.setName('symbol').setDescription('Blockchain symbol identifier, e.g., BTC-USD').setRequired(true)),
    
        async execute(interaction) {
            const symbol = interaction.options.getString('symbol');
            const headers = {
                'Accept': 'application/json',
                'X-API-Token': blockchainApiKey
            };

            try {
                const response = await fetch(`https://api.blockchain.com/v3/exchange/l2/${symbol}`, {
                    method: 'GET',
                    headers: headers
                });
                const data = await response.json();
                
                const symbol = data.symbol;
                const bids = data.bids;
                const asks = data.asks;

                
                const bidFields = bids.map(bid => ({
                    name: `Bid - Price: ${bid.px}`,
                    value: `Quantity: ${bid.qty}, Number: ${bid.num}`,
                    inline: true
                }));

                const askFields = asks.map(ask => ({
                    name: `Ask - Price: ${ask.px}`,
                    value: `Quantity: ${ask.qty}, Number: ${ask.num}`,
                    inline: true
                }));

                const orderBookEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`Level 2 Order Book for ${symbol}`)
                    .addFields(bidFields)
                    .addFields(askFields)
                    .setTimestamp()
                    .setFooter({ text: 'Data provided by Blockchain.com' });

                // Send the embed in response to the interaction
                await interaction.reply({ embeds: [orderBookEmbed] });

            } catch (error) {
                console.error('Error fetching order book data:', error);
                await interaction.reply(`There was an error fetching the order book data for ${symbol}. Please try again later.`);
            }
        }
};