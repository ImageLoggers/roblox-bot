const noblox = require('noblox.js');
const open = require('open');
const axios = require('axios');

// Roblox Configuration
const robloxSecurityCookie = '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhAB.5C3252F625299763C946C36F9763295683E1AD69B3EE011BF8CBF9F1B2761749F62118968123941D906604C1EEBE460D6FFD7BE17F3C14C792DC7C1DD76E23B139102B9C6A99780F21722985E7138DE0BF696E509D631E894AE56E7A434063F8BAA7F46C5788A5808E03480A2FB21B7821C34A741BE3BC7B70170B46D43F8EC2A862C176400454600CC012034F19F3920D49A1DEC22BF7FEF6943036CA16D879B746D6ED88197B1D4D060CB52A45B5CD5B38B7E3E8F20BC3B090F33A6BBBA2504B8BFC3D282F2541DF17E21A768B9DD676964A950D2115967CF68BECFB5CCE8DD8274CA52FFE8F80B4CF81CB1D73527BC66CC1BB7CFAE99B3D7B39B638C657798182418CAE59FE228A33DCD41DF917F51DE50FE2D1307121B02DB970DE27C36B7FDE77900E8ED223AB4F82CB73F1542E209CEDB053878A6F3C4D958F3F9D1F8F4EF60DDB6EA23B8DCCB4EC9BE95EFC22F2F98DB3026FEEA155203DAD9F3A1A5BFE4412F3A1675D48EBBE2D84C3BF05DCB00A5D1AFA501C78A14E61084D230C5F4A767688534326DEA1AB6EBE0C553B4A1ED02A1E7568002CE9BE98EDE281DC5606CD7914993826352AE3007E9DF9753BF5EB5F7D196CB1614E9ECCE784739C23D7213A7D1A9CCB3056CDB7BE25C1E21F409F5BCAD4D0CF3381236C5AD18CBA5EBC033AF12C5FA7EE40EB23335DF262B7D2BB2AA9B13C5EFF280D66E069CB6B66CDFE193BA75D3E3AC7223D05AE78C027D2462AC3653F5D16A28F37069D9417AD07FF9EEE566BEBD12DED960829B8BB6375E8F39B51BC8D261D15E4E0B83186A5DAA4C94FAECDEC0689699193D5A6499C8E13B3304DA25D699A47F3BE6E0F99F95727D9FA4505C48136B5E297C91B7F72392A39AE2B28B288A7399C474F316ED5341DC6A7E4BF80EE641512522CA2F2210FDCD61440C84CFC19491825535079B4598F9B9D000C75710A36CFE97EB497CDE724BE81974A99DC9A1EF4116D978FCFC679213BDF42EE782EDC81BB8AE85216A2725DD533C092DDC3E840B1EF7D90A87571D24DA0C3CC2E14DAB99318C79B8E14A37F2CD2D79E079A1D8FB4AE5C62F081CF088A304AAC3E26E4C2C03B07B8EFB37FCA34E5F33C1E41F18577E2752AA46EFD23949F7866621E4906E4BAF512165FD3D17612B6E3D2FFFC47F9428C114D323B17425B4B95B0E10EA971A301E924C5259349E863CE8B0EE6F131DEA12492FC2D912A0CD206E531F024D03E19A8A82E32784653BFC680473F8A4F94A785FCEFBD208F';
const gameLink = 'https://www.roblox.com/games/109983668079237/Steal-a-Brainrot';
const discordWebhookURL = 'https://discord.com/api/webhooks/1421088738515226664/xvMAu1YTNQW2nH8VCtulNvEZi9S4XuSNCHCQutKOAaXQBH4q4qGs_f4M3WRLIFUFlsAz'; // Your Discord Webhook URL

// Extract game ID from the link
function getGameIdFromLink(gameLink) {
    const parts = gameLink.split('/');
    const gameId = parts[5];
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
