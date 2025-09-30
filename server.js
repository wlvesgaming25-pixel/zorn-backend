require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');

const app = express();

// Enable CORS so your frontend (Netlify) can fetch API data
app.use(cors());

// Serve static files (your Netlify-style frontend can also be served if needed)
app.use(express.static(path.join(__dirname, 'public')));

// ===== Discord Client Setup =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

// ===== API Endpoints =====

// Role Count
app.get('/api/role-count', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    await guild.members.fetch();
    const role = guild.roles.cache.get(process.env.ROLE_ID);
    res.json({ count: role ? role.members.size : 0 });
  } catch (err) {
    console.error("❌ Error fetching role count:", err);
    res.status(500).json({ count: 0 });
  }
});

// Member Count
app.get('/api/member-count', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    await guild.members.fetch();
    res.json({ count: guild.memberCount });
  } catch (err) {
    console.error("❌ Error fetching member count:", err);
    res.status(500).json({ count: 0 });
  }
});

// Social Followers Count
app.get('/api/all-followers', async (req, res) => {
  try {
    let total = 0;

    // --- Twitter/X ---
    const twitterRes = await axios.get(
      `https://api.twitter.com/2/users/by/username/ZornHQ?user.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER}` } }
    );
    total += twitterRes.data.data.public_metrics.followers_count || 0;

    // --- YouTube ---
    const youtubeRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=ZornHQ&key=${process.env.YOUTUBE_API_KEY}`
    );
    total += parseInt(youtubeRes.data.items[0].statistics.subscriberCount || 0);

    // --- Twitch ---
    const twitchTokenRes = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    );
    const twitchAccessToken = twitchTokenRes.data.access_token;
    const twitchRes = await axios.get(`https://api.twitch.tv/helix/users?login=zornhq`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
      }
    });
    total += parseInt(twitchRes.data.data[0].view_count || 0);

    // --- TikTok (placeholder) ---
    const tiktokCount = 10000;
    total += tiktokCount;

    res.json({ count: total });
  } catch (err) {
    console.error("❌ Error fetching social counts:", err);
    res.status(500).json({ count: 0 });
  }
});

// Optional: Serve frontend HTML for fallback routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
