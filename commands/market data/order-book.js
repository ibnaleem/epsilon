const { SlashCommandBuilder, EmbedBuilder, SKU } = require('discord.js');
require('dotenv').config();
const blockchainApiKey = process.env.BLOCKCHAIN_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('order-book')
        .setDescription('Level 2/Level 3 Order Book Data')
        .addStringOption(option =>
            option.setName('order-book')
            .setDescription('Order Book Level')
            .setRequired(true) 
            .addChoices(
                { name: 'Level 2', value: 'l2' },
                { name: 'Level 3', value: 'l3' }
            ))
        
        .addStringOption(option => 
            option.setName('symbol')
            .setDescription('Blockchain symbol identifier, e.g., BTC-USD')
            .setRequired(true)),

        async execute(interaction) {
            const symbol = interaction.options.getString("symbol");
            const levelValue = interaction.options.getString("order-book");
            const levelMapping = {
                "l2": "Level 2",
                "l3": "Level 3"
            }
            const levelTitle = levelMapping[levelValue];
            const headers = {
                'Accept': 'application/json',
                'X-API-Token': blockchainApiKey
            }

            try {
                const fetch = await import('node-fetch').then(module => module.default);
                const response = await fetch(`https://api.blockchain.com/v3/exchange/${levelValue}/${symbol}`, {
                    method: 'GET',
                    headers: headers
                });

                const data = await response.json();
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
                
                //const combinedFields = bidFields.concat(askFields).slice(0, 25);
                const slicedBids = bidFields.slice(0,10);
                const slicedAsk = askFields.slice(0,10);

                const orderBookEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`${levelTitle} Order Book for ${symbol}`)
                    .addFields(slicedBids)
                    .addFields(slicedAsk)
                    .setTimestamp()
                    .setFooter({ text: 'Data provided by Blockchain.com' });

            
                await interaction.reply({ embeds: [orderBookEmbed] });
                

            } catch (error) {
                console.error('Error fetching order book data:', error);
                await interaction.reply(`There was an error fetching the order book data for ${symbol}. Please try again later.`);

        }
}}