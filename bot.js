const noblox = require('noblox.js');
const open = require('open');
const axios = require('axios');

// Roblox Configuration
const robloxSecurityCookie = '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhAB.AC9C5C9E4F101CA6663C1ADEF6B6298E8C0F34B42DD90C3CA9BC11A8944190D111352BA85825A934E5B876C3CC7288917D229E21B0C0DD0F599140008AC92389EF34B76297E1F17D05F424809104D5256B1C0320ED3B5EE8406700B6ABEF2EAB6C7C42ECFF55B6D09C99065F4A21BC46CFB3B388F32652B33030D0590B5A870AC3031864805B3FFD80B0CBCC90DF38771D789B50AB885E549FF3E43FCE30167AA1BFA39A758C8EA2984E7DDF43105826620D903F4755CF9BDF8BF73599B47761706118A1C87605359CF5905C0FE0DD851D4FE5BBE4EB9960BBED74198CD9A86CAE1492CBA848358D371DFD5ED7470D9C2F8F89BB5E206BEC6A43D0DA8F4FDF3D724F843E027D89F2D8DEED7FE565F99306A30B6620E1C88C7BAA78F88F51CE9D0B2B80F67DDFEA859C9805391CD9928F08B68482F7FEEDDC3B8931592DF27AB599F5BFFF3028F967604FE206944C8B098445E0978D517CADC938A0933F0699D5C339C689410C52E21BEB7C7C8688FEE41643D45714B4453B7D5CFF96914E89FF7043B5463EDC6D83343833F4A0E38BD508F76086E2E7D178B2AD6A08749FE7DF3AA96A04CDEFA51201AAB9AC4D0C3EA82B821F4600D3EF4B69207EEF761F61F9CA3C1B6E988C81D3C85013DC76B8E33E847B702BE204232E48827159414280E31DAE584F3290F1240AAEAFF9E37E547415CE5D1BB9B4E7BCCDED252141A10C27CE3F3D3DC0141845EA222F1C59F46BE07860F12BB90833C2A341E7F5A5CAB124E1233971A67469E4E6350124AAF2036F1729C764BF0A7DBC268D0038C24FB2F2B044FB404B6146674A2DCFA0AEB7569928E9DA812A952C5B05E05C2F93A0030AAFEF0AE427B32D4B0D6046A11CB7676B554479CF12013D6F88109BB75EC50FD099607078FDB4E40234D3195178741260D94799208369C8DDA84F0D85DED5E743753CCF341DB698599A03EC3A7BB83F792A4BDCEF7568BA7B5710D73A4412C043AC512012CEFD201A8D7F6222F9BBF69453E3563155A2824F5FB05C41E0DCABDA1E621659AC01A56A0CB7214F35B65A104665C45DE7D5344ACEF839B320798ADD1673998A03A6C4A31278FC2513E8C73FA1F95C9E306A52650D1191CBC37ED30E5FC6AC44C61155CE23F86CB5EF51AB6EEE52229ACBE3CF69FE095ECD5941831A7FDFB8666E80C81F3C9A30418244C60B97E8AAEE0D25B81E4A51FC514DDA49E6BCCA4C10377C12457E320AE98B8719D289929131B9F5752E401A4017B312E548AE4D0142';
const gameLink = 'https://www.roblox.com/games/109983668079237/Steal-a-Brainrot';
const discordWebhookURL = 'https://discord.com/api/webhooks/1421088738515226664/xvMAu1YTNQW2nH8VCtulNvEZi9S4XuSNCHCQutKOAaXQBH4q4qGs_f4M3WRLIFUFlsAz'; // Your Discord Webhook URL

// Extract game ID from the link
function getGameIdFromLink(gameLink) {
    const parts = gameLink.split('/');
    const gameId = parts[5];
    return gameId;
    return gameId;
}

const gameId = getGameIdFromLink(gameLink);
let currentServerPlayers = [];

// Function to join a Roblox game (no open)
async function joinRobloxGame(placeId) {
    try {
        // Get a list of available game servers
        const response = await axios.get(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=100`);
        const servers = response.data.data;

        if (servers.length > 0) {
            // Choose the first server in the list (you might want to implement more sophisticated logic)
            const serverId = servers[0].id;

            console.log(`Attempting to join game server: ${serverId}`);
            return serverId; // Return the serverId for later use
        } else {
            console.log('No available game servers found.');
            return null;
        }
    } catch (error) {
        console.error('Failed to join game:', error);
        return null;
    }
}

// Function to send a message to Discord
async function sendDiscordMessage(message) {
    try {
        await axios.post(discordWebhookURL, {
            content: message
        });
        console.log('Sent message to Discord:', message);
    } catch (error) {
        console.error('Failed to send message to Discord:', error);
    }
}

// Function to get players in the server
async function getPlayersInServer(placeId, serverId) {
    try {
        const response = await axios.get(`https://games.roblox.com/v1/games/${placeId}/servers/${serverId}`);
        const players = response.data.playerTokens;
        return players;
    } catch (error) {
        console.error('Failed to get player list:', error);
        return [];
    }
}

// Function to check player list and send to Discord if changed
async function checkAndNotifyPlayers(placeId, serverId) {
    try {
        const newPlayers = await getPlayersInServer(placeId, serverId);

        if (newPlayers && JSON.stringify(newPlayers) !== JSON.stringify(currentServerPlayers)) {
            const playerListMessage = `Players in the server: ${newPlayers.length}\n${newPlayers.join(', ')}`;
            await sendDiscordMessage(playerListMessage);
            currentServerPlayers = newPlayers;
        } else {
            console.log('Player list unchanged.');
        }
    } catch (error) {
        console.error('Error checking players:', error);
    }
}

// Function to prevent AFK kick (basic movement)
async function preventAfkKick() {
    try {
        // This is a placeholder, actual movement requires interacting with the Roblox client which is beyond the scope of noblox.js
        // You would typically need a library that can control keyboard and mouse input
        console.log('Simulating movement to prevent AFK kick...');
        // Simulate pressing 'w' key for 1 second
        await noblox.setSetting('InputUserEmulationEnabled', true)
        // Simulate releasing the key
        await noblox.setSetting('InputUserEmulationEnabled', false)
    } catch (error) {
        console.error('Failed to prevent AFK kick:', error);
    }
}

// Main bot function
async function startBot() {
    try {
        // Log in to Roblox
        await noblox.setCookie(robloxSecurityCookie);
        const currentUser = await noblox.getCurrentUser();
        console.log(`Logged in as ${currentUser.UserName} [${currentUser.UserID}]`);

        // Join the game
        const serverId = await joinRobloxGame(gameId);
        if (serverId) {
            // Check and notify players every 30 seconds
            setInterval(() => {
                checkAndNotifyPlayers(gameId, serverId);
            }, 30000); // 30000 milliseconds = 30 seconds

            // Prevent AFK kick every 120 seconds
            setInterval(() => {
                preventAfkKick();
            }, 120000); // 120000 milliseconds = 120 seconds
        }
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}

// Start the bot
startBot();
