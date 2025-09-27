const noblox = require("noblox.js");
const axios = require("axios");

// Roblox Config
const robloxSecurityCookie = "_|WARNING:-DO-NOT-SHARE-THIS.|_YOUR_COOKIE_HERE";
const placeId = "109983668079237"; // Your place ID as string
const discordWebhookURL = "https://discord.com/api/webhooks/1421088738515226664/xvMAu1YTNQW2nH8VCtulNvEZi9S4XuSNCHCQutKOAaXQBH4q4qGs_f4M3WRLIFUFlsAz";

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let lastServerIds = [];

// Get universe ID from place ID
async function getUniverseId(placeId) {
  try {
    const res = await axios.get(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    return res.data.universeId;
  } catch (err) {
    console.error("Failed to get universe ID:", err.message);
    return null;
  }
}

// Fetch public servers for a universe
async function getGameServers(universeId) {
  try {
    const res = await axios.get(`https://games.roblox.com/v1/games/${universeId}/servers/Public?sortOrder=Asc&limit=100`);
    return res.data.data || [];
  } catch (err) {
    console.error("Failed to get game servers:", err.message);
    return [];
  }
}

// Send message to Discord
async function sendDiscordMessage(message) {
  try {
    await axios.post(discordWebhookURL, { content: message });
    console.log("Sent message to Discord:", message);
  } catch (err) {
    console.error("Failed to send Discord message:", err.message);
  }
}

// Monitor servers
async function monitorServers() {
  const universeId = await getUniverseId(placeId);
  if (!universeId) return console.error("Could not fetch universe ID.");

  const servers = await getGameServers(universeId);
  if (!servers.length) return console.log("No servers found.");

  // Check for new servers
  for (const server of servers) {
    if (!lastServerIds.includes(server.id)) {
      lastServerIds.push(server.id);
      const msg = `🎮 New Server Detected!\nServer ID: ${server.id}\nPlayers: ${server.playing}/${server.maxPlayers}\nTime: ${new Date().toLocaleString()}`;
      await sendDiscordMessage(msg);
      console.log(msg);
    }
  }

  // Keep last 50 servers only
  lastServerIds = lastServerIds.slice(-50);
}

// Get authenticated user
async function getUserInfo() {
  try {
    return await noblox.getCurrentUser();
  } catch (err) {
    console.error("Failed to get user info:", err.message);
    return null;
  }
}

// Start bot
async function startBot() {
  console.log("🚀 Starting Roblox Server Monitor Bot...");

  try {
    await noblox.setCookie(robloxSecurityCookie);
    const user = await getUserInfo();
    if (!user) return console.error("❌ Failed to authenticate.");

    console.log(`✅ Authenticated as ${user.UserName} [ID: ${user.UserID}]`);
    await sendDiscordMessage(`🤖 Bot started as ${user.UserName}`);

    // Initial check
    await monitorServers();

    // Monitor every 30 seconds
    setInterval(monitorServers, 30000);
  } catch (err) {
    console.error("❌ Bot startup failed:", err.message);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Bot shutting down...");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start bot
startBot();
