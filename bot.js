const noblox = require('noblox.js');
const axios = require('axios');

// Roblox Configuration
const robloxSecurityCookie = '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhAB.AC9C5C9E4F101CA6663C1ADEF6B6298E8C0F34B42DD90C3CA9BC11A8944190D111352BA85825A934E5B876C3CC7288917D229E21B0C0DD0F599140008AC92389EF34B76297E1F17D05F424809104D5256B1C0320ED3B5EE8406700B6ABEF2EAB6C7C42ECFF55B6D09C99065F4A21BC46CFB3B388F32652B33030D0590B5A870AC3031864805B3FFD80B0CBCC90DF38771D789B50AB885E549FF3E43FCE30167AA1BFA39A758C8EA2984E7DDF43105826620D903F4755CF9BDF8BF73599B47761706118A1C87605359CF5905C0FE0DD851D4FE5BBE4EB9960BBED74198CD9A86CAE1492CBA848358D371DFD5ED7470D9C2F8F89BB5E206BEC6A43D0DA8F4FDF3D724F843E027D89F2D8DEED7FE565F99306A30B6620E1C88C7BAA78F88F51CE9D0B2B80F67DDFEA859C9805391CD9928F08B68482F7FEEDDC3B8931592DF27AB599F5BFFF3028F967604FE206944C8B098445E0978D517CADC938A0933F0699D5C339C689410C52E21BEB7C7C8688FEE41643D45714B4453B7D5CFF96914E89FF7043B5463EDC6D83343833F4A0E38BD508F76086E2E7D178B2AD6A08749FE7DF3AA96A04CDEFA51201AAB9AC4D0C3EA82B821F4600D3EF4B69207EEF761F61F9CA3C1B6E988C81D3C85013DC76B8E33E847B702BE204232E48827159414280E31DAE584F3290F1240AAEAFF9E37E547415CE5D1BB9B4E7BCCDED252141A10C27CE3F3D3DC0141845EA222F1C59F46BE07860F12BB90833C2A341E7F5A5CAB124E1233971A67469E4E6350124AAF2036F1729C764BF0A7DBC268D0038C24FB2F2B044FB404B6146674A2DCFA0AEB7569928E9DA812A952C5B05E05C2F93A0030AAFEF0AE427B32D4B0D6046A11CB7676B554479CF12013D6F88109BB75EC50FD099607078FDB4E40234D3195178741260D94799208369C8DDA84F0D85DED5E743753CCF341DB698599A03EC3A7BB83F792A4BDCEF7568BA7B5710D73A4412C043AC512012CEFD201A8D7F6222F9BBF69453E3563155A2824F5FB05C41E0DCABDA1E621659AC01A56A0CB7214F35B65A104665C45DE7D5344ACEF839B320798ADD1673998A03A6C4A31278FC2513E8C73FA1F95C9E306A52650D1191CBC37ED30E5FC6AC44C61155CE23F86CB5EF51AB6EEE52229ACBE3CF69FE095ECD5941831A7FDFB8666E80C81F3C9A30418244C60B97E8AAEE0D25B81E4A51FC514DDA49E6BCCA4C10377C12457E320AE98B8719D289929131B9F5752E401A4017B312E548AE4D0142';
const gameId = '109983668079237'; // Use string for large numbers
const discordWebhookURL = 'https://discord.com/api/webhooks/1421088738515226664/xvMAu1YTNQW2nH8VCtulNvEZi9S4XuSNCHCQutKOAaXQBH4q4qGs_f4M3WRLIFUFlsAz';

// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let lastServerPlayers = [];
let currentServerId = null;

// Function to get server information
async function getGameServers(universeId) {
    try {
        await delay(1000); // Add delay to avoid rate limiting
        
        const response = await axios.get(`https://games.roblox.com/v1/games/${universeId}/servers/Public?sortOrder=Asc&limit=100`);
        
        if (response.status === 200) {
            return response.data.data;
        } else {
            console.error(`Failed to get servers. Status code: ${response.status}`);
            return [];
        }
    } catch (error) {
        console.error('Failed to get game servers:', error.message);
        return [];
    }
}

// Function to get universe ID from game ID
async function getUniverseId(gameId) {
    try {
        const response = await axios.get(`https://apis.roblox.com/universes/v1/places/${gameId}/universe`);
        return response.data.universeId;
    } catch (error) {
        console.error('Failed to get universe ID:', error.message);
        return null;
    }
}

// Function to send message to Discord
async function sendDiscordMessage(message) {
    try {
        await axios.post(discordWebhookURL, {
            content: message
        });
        console.log('Sent message to Discord:', message);
    } catch (error) {
        console.error('Failed to send message to Discord:', error.message);
    }
}

// Function to monitor server players
async function monitorServer() {
    try {
        const universeId = await getUniverseId(gameId);
        if (!universeId) {
            console.error('Could not get universe ID');
            return;
        }

        const servers = await getGameServers(universeId);
        
        if (servers.length === 0) {
            console.log('No servers found');
            return;
        }

        // Get the first server (you can modify this logic)
        const server = servers[0];
        currentServerId = server.id;
        
        const currentPlayers = server.playerTokens || [];
        const playerCount = server.playing;

        // Check if player list changed
        if (JSON.stringify(currentPlayers) !== JSON.stringify(lastServerPlayers)) {
            const message = `🎮 **Server Update**\nServer ID: ${currentServerId}\nPlayers: ${playerCount}/${server.maxPlayers}\nTime: ${new Date().toLocaleString()}`;
            await sendDiscordMessage(message);
            lastServerPlayers = currentPlayers;
            console.log(`Player count changed: ${playerCount} players online`);
        } else {
            console.log(`No changes. Current players: ${playerCount}`);
        }

    } catch (error) {
        console.error('Error monitoring server:', error.message);
    }
}

// Function to get user information
async function getUserInfo() {
    try {
        const currentUser = await noblox.getCurrentUser();
        return currentUser;
    } catch (error) {
        console.error('Failed to get user info:', error.message);
        return null;
    }
}

// Main bot function
async function startBot() {
    try {
        console.log('Starting Roblox server monitor bot...');
        
        // Set the cookie for authentication
        await noblox.setCookie(robloxSecurityCookie);
        
        // Get current user info
        const currentUser = await getUserInfo();
        if (currentUser) {
            console.log(`✅ Authenticated as: ${currentUser.UserName} [ID: ${currentUser.UserID}]`);
            await sendDiscordMessage(`🤖 Bot started! Monitoring as: ${currentUser.UserName}`);
        } else {
            console.log('❌ Failed to authenticate. Check your cookie.');
            return;
        }

        // Start monitoring every 30 seconds
        console.log('🔍 Starting server monitoring...');
        setInterval(monitorServer, 30000); // 30 seconds
        
        // Run initial check
        await monitorServer();

    } catch (error) {
        console.error('❌ Bot startup failed:', error.message);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Bot shutting down...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
console.log('🚀 Initializing Roblox Server Monitor Bot...');
startBot();
