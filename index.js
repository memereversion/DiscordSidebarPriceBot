const auth = require('./auth.json');
const Discord = require('discord.js');
const bot = new Discord.Client();
const OpenseaScraper = require("opensea-scraper");

let UPDATE_INTERVAL;  // Price update interval in milliseconds
let TOKEN_INDEX;      // Discord bot token index to use (in auth.json)

let guildMeCache = [];

// Ready up activities
bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  // bot.user.setActivity(`😀`);

  bot.guilds.cache.each(guild => guildMeCache.push(guild.me));

  // Get update interval from args, default to 1 minute if unpopulated
  if (typeof process.argv[3] !== 'undefined') {
    UPDATE_INTERVAL = process.argv[3];
  }
  else {
    UPDATE_INTERVAL = 600000;
  }
  showPrice();
  setInterval(showPrice, UPDATE_INTERVAL);
});

async function showPrice() {
  try {
    const slug = "n-project"
    const floor = await OpenseaScraper.floorPrice(slug);
    const floorName = (floor[0][0][0]).substring(1)
    const floorPrice = floor[0][0][1]
    const forSale = (floor[1][0]).split(" ")[0].split(",").join("")
    const channel = await bot.channels.cache.get(auth.discordChannelId)
    guildMeCache.forEach(guildMe => guildMe.setNickname(`nfloor`));
    console.log("floor : ", floor[0])
    console.log("floor name : ", floorName.substring(1))
    console.log("floor price : ",floorPrice)
    console.log(forSale)
    // bot.user.setActivity(`FLOOR PRICE : ${floorPrice[1]} ETH`);
    
    // console.log(channel)
    const embed = {
      "author": {
        "name": "N | Market Summary"
        
      },
      "fields": [
        {
          "name": "Floor",
          "value": `${floorPrice} ETH`
        },
        {
          "name": "Floor Ns",
          "value": `[N #${floorName}](https://opensea.io/assets/0x05a46f1e545526fb803ff974c790acea34d1f2d6/${floorName})`,
          "inline": true
        },
        {
          "name": "Total N for sale",
          "value": `[${forSale}](https://opensea.io/collection/n-project?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW)`,
          "inline": true
        },
      ],
      "footer": {
        "text": "Always be aware of scam! Check the link of collections and verification status!"
      },
    };
    channel.send({ embed });
  } catch (error) {
    console.log(error)
  }
}

// Get token index from args, default to 0
if (typeof process.argv[4] !== 'undefined') {
  TOKEN_INDEX = process.argv[4];
}
else {
  TOKEN_INDEX = 0;
}

// New server join event that causes the guild cache to refresh
bot.on('guildCreate', guild => {
  bot.guilds.cache.each(guild => guildMeCache.push(guild.me));
  console.log(`New server has added the bot! Name: ${guild.name}`);
});

bot.login(auth.discordBotTokens[TOKEN_INDEX]);