const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3040;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Marketplace data (mirrored from client)
const marketplaceBackgrounds = [
  {
    id: 'sunset_blaze',
    name: 'Sunset Blaze',
    price: 100,
    gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    description: 'Warm sunset colors'
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    price: 150,
    gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    description: 'Cool ocean mist'
  },
  {
    id: 'forest_glow',
    name: 'Forest Glow',
    price: 200,
    gradient: 'linear-gradient(135deg, #d299c2, #fef9d7)',
    description: 'Mystical forest vibes'
  },
  {
    id: 'galaxy_nebula',
    name: 'Galaxy Nebula',
    price: 250,
    gradient: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
    description: 'Cosmic purple swirl'
  },
  {
    id: 'golden_luxury',
    name: 'Golden Luxury',
    price: 300,
    gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    description: 'Premium gold shine'
  },
  {
    id: 'arctic_frost',
    name: 'Arctic Frost',
    price: 350,
    gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    description: 'Cool winter blues'
  },
  {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    price: 400,
    gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
    description: 'Pink spring flowers'
  },
  {
    id: 'midnight_void',
    name: 'Midnight Void',
    price: 500,
    gradient: 'linear-gradient(135deg, #000000, #434343)',
    description: 'Dark mysterious void'
  }
];

const marketplaceNameColors = [
  {
    id: 'crimson_red',
    name: 'Crimson Red',
    price: 50,
    color: '#dc143c',
    description: 'Bold red color'
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    price: 50,
    color: '#0066cc',
    description: 'Deep ocean blue'
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    price: 50,
    color: '#228b22',
    description: 'Natural forest green'
  },
  {
    id: 'royal_purple',
    name: 'Royal Purple',
    price: 75,
    color: '#7851a9',
    description: 'Elegant royal purple'
  },
  {
    id: 'golden_yellow',
    name: 'Golden Yellow',
    price: 75,
    color: '#ffd700',
    description: 'Shiny golden yellow'
  },
  {
    id: 'hot_pink',
    name: 'Hot Pink',
    price: 75,
    color: '#ff69b4',
    description: 'Vibrant hot pink'
  },
  {
    id: 'electric_blue',
    name: 'Electric Blue',
    price: 100,
    color: '#00bfff',
    description: 'Bright electric blue'
  },
  {
    id: 'neon_green',
    name: 'Neon Green',
    price: 100,
    color: '#39ff14',
    description: 'Bright neon green'
  }
];

const gainingAchievements = [
  { id: 'first_aura', name: 'First Aura', description: 'Receive your first aura point', requirement: 1 },
  { id: 'rising_star', name: 'Rising Star', description: 'Reach 50 aura', requirement: 50 },
  { id: 'aura_master', name: 'Aura Master', description: 'Reach 100 aura', requirement: 100 },
  { id: 'aura_legend', name: 'Aura Legend', description: 'Reach 250 aura', requirement: 250 },
  { id: 'aura_myth', name: 'Aura Myth', description: 'Reach 500 aura', requirement: 500 },
  { id: 'aura_god', name: 'Aura God', description: 'Reach 1000 aura', requirement: 1000 }
];

const givingAchievements = [
  { id: 'first_gift', name: 'First Gift', description: 'Give your first aura point', requirement: 1 },
  { id: 'generous', name: 'Generous', description: 'Give 50 aura total', requirement: 50 },
  { id: 'super_generous', name: 'Super Generous', description: 'Give 100 aura total', requirement: 100 },
  { id: 'mega_generous', name: 'Mega Generous', description: 'Give 250 aura total', requirement: 250 },
  { id: 'ultra_generous', name: 'Ultra Generous', description: 'Give 500 aura total', requirement: 500 },
  { id: 'giving_legend', name: 'Giving Legend', description: 'Give 1000 aura total', requirement: 1000 }
];

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Service worker registration
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// PWA manifest
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Serve index.html at root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure data directory exists with proper permissions
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Function to initialize data file with proper structure
function initializeDataFile() {
  const initialData = {
    announcement: "Welcome to Aura Tracker!",
    users: [
      { 
        username: "Max", 
        password: "crocs13", 
        aura: 100, 
        role: "admin", 
        netDailyAura: {},
        totalGiven: 0,
        totalReceived: 0,
        achievements: []
      },
      { 
        username: "Gigi", 
        password: "1234", 
        aura: 100, 
        role: "user", 
        netDailyAura: {},
        totalGiven: 0,
        totalReceived: 0,
        achievements: []
      },
      { 
        username: "Marco", 
        password: "1234", 
        aura: 100, 
        role: "user", 
        netDailyAura: {},
        totalGiven: 0,
        totalReceived: 0,
        achievements: []
      },
      { 
        username: "Dezi", 
        password: "1234", 
        aura: 100, 
        role: "user", 
        netDailyAura: {},
        totalGiven: 0,
        totalReceived: 0,
        achievements: []
      },
      { 
        username: "Sevi", 
        password: "1234", 
        aura: 100, 
        role: "user", 
        netDailyAura: {},
        totalGiven: 0,
        totalReceived: 0,
        achievements: []
      }
    ]
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  console.log('Created new data file with default users');
}

// Function to wait for data file with retry logic (for Docker volumes)
function waitForDataFile(maxRetries = 10, delay = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    function checkFile() {
      if (fs.existsSync(DATA_FILE)) {
        try {
          // Try to read and parse the file to ensure it's valid
          const data = fs.readFileSync(DATA_FILE, 'utf8');
          JSON.parse(data); // Validate JSON
          console.log('Data file found and is valid');
          resolve();
        } catch (error) {
          console.error('Data file exists but is corrupted:', error);
          if (retries < maxRetries) {
            retries++;
            console.log(`Retrying (${retries}/${maxRetries})...`);
            setTimeout(checkFile, delay);
          } else {
            reject(error);
          }
        }
      } else {
        if (retries < maxRetries) {
          retries++;
          console.log(`Data file not found, retrying (${retries}/${maxRetries})...`);
          setTimeout(checkFile, delay);
        } else {
          console.log('Data file not found after retries, creating new one');
          initializeDataFile();
          resolve();
        }
      }
    }
    
    checkFile();
  });
}

// Initialize data file with retry logic for Docker environments
if (process.env.NODE_ENV === 'production') {
  // In production (Docker), wait for volume to be ready
  waitForDataFile().catch(error => {
    console.error('Failed to initialize data file:', error);
    process.exit(1);
  });
} else {
  // In development, create file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    initializeDataFile();
  }
}

// Achievement definitions
const ACHIEVEMENTS = [
  // Gaining Aura achievements (50)
  { id: 'who_even_are_you', name: 'Who Even Are You', description: 'Reach 25 aura', type: 'current', requirement: 25 },
  { id: 'slightly_known', name: 'Slightly Known', description: 'Reach 50 aura', type: 'current', requirement: 50 },
  { id: 'lowkey_cool', name: 'Lowkey Cool', description: 'Reach 75 aura', type: 'current', requirement: 75 },
  { id: 'getting_noticed', name: 'Getting Noticed', description: 'Reach 100 aura', type: 'current', requirement: 100 },
  { id: 'kinda_him', name: 'Kinda Him', description: 'Reach 150 aura', type: 'current', requirement: 150 },
  { id: 'respectable', name: 'Respectable', description: 'Reach 200 aura', type: 'current', requirement: 200 },
  { id: 'solid_reputation', name: 'Solid Reputation', description: 'Reach 300 aura', type: 'current', requirement: 300 },
  { id: 'rising_star', name: 'Rising Star', description: 'Reach 400 aura', type: 'current', requirement: 400 },
  { id: 'main_character_loading', name: 'Main Character Loading', description: 'Reach 500 aura', type: 'current', requirement: 500 },
  { id: 'certified_him', name: 'Certified Him', description: 'Reach 750 aura', type: 'current', requirement: 750 },
  { id: 'big_w_energy', name: 'Big W Energy', description: 'Reach 1,000 aura', type: 'current', requirement: 1000 },
  { id: 'aura_legend', name: 'Aura Legend', description: 'Reach 1,500 aura', type: 'current', requirement: 1500 },
  { id: 'mythical_status', name: 'Mythical Status', description: 'Reach 2,000 aura', type: 'current', requirement: 2000 },
  { id: 'transcendent', name: 'Transcendent', description: 'Reach 5,000 aura', type: 'current', requirement: 5000 },
  { id: 'god_tier', name: 'God Tier', description: 'Reach 10,000 aura', type: 'current', requirement: 10000 },
  // Giving Aura achievements (50)
  { id: 'first_gift', name: 'First Gift', description: 'Give 25 total aura', type: 'given', requirement: 25 },
  { id: 'generous', name: 'Generous', description: 'Give 50 total aura', type: 'given', requirement: 50 },
  { id: 'super_generous', name: 'Super Generous', description: 'Give 100 total aura', type: 'given', requirement: 100 },
  { id: 'mega_generous', name: 'Mega Generous', description: 'Give 250 total aura', type: 'given', requirement: 250 },
  { id: 'ultra_generous', name: 'Ultra Generous', description: 'Give 500 total aura', type: 'given', requirement: 500 },
  { id: 'philanthropist', name: 'Philanthropist', description: 'Give 1,000 total aura', type: 'given', requirement: 1000 },
  { id: 'mega_philanthropist', name: 'Mega Philanthropist', description: 'Give 2,500 total aura', type: 'given', requirement: 2500 },
  { id: 'aura_bank', name: 'Aura Bank', description: 'Give 5,000 total aura', type: 'given', requirement: 5000 },
  { id: 'walking_charity', name: 'Walking Charity', description: 'Give 10,000 total aura', type: 'given', requirement: 10000 },
  { id: 'legendary_giver', name: 'Legendary Giver', description: 'Give 25,000 total aura', type: 'given', requirement: 25000 },
  { id: 'mythical_giver', name: 'Mythical Giver', description: 'Give 50,000 total aura', type: 'given', requirement: 50000 },
  { id: 'divine_generosity', name: 'Divine Generosity', description: 'Give 100,000 total aura', type: 'given', requirement: 100000 },
  // Receiving Aura achievements (50)
  { id: 'first_receive', name: 'First Receive', description: 'Receive 25 total aura', type: 'received', requirement: 25 },
  { id: 'well_liked', name: 'Well Liked', description: 'Receive 50 total aura', type: 'received', requirement: 50 },
  { id: 'super_liked', name: 'Super Liked', description: 'Receive 100 total aura', type: 'received', requirement: 100 },
  { id: 'mega_liked', name: 'Mega Liked', description: 'Receive 250 total aura', type: 'received', requirement: 250 },
  { id: 'ultra_liked', name: 'Ultra Liked', description: 'Receive 500 total aura', type: 'received', requirement: 500 },
  { id: 'fan_favorite', name: 'Fan Favorite', description: 'Receive 1,000 total aura', type: 'received', requirement: 1000 },
  { id: 'mega_favorite', name: 'Mega Favorite', description: 'Receive 2,500 total aura', type: 'received', requirement: 2500 },
  { id: 'aura_magnet', name: 'Aura Magnet', description: 'Receive 5,000 total aura', type: 'received', requirement: 5000 },
  { id: 'people_person', name: 'People Person', description: 'Receive 10,000 total aura', type: 'received', requirement: 10000 },
  { id: 'beloved', name: 'Beloved', description: 'Receive 25,000 total aura', type: 'received', requirement: 25000 },
  { id: 'mythical_receiver', name: 'Mythical Receiver', description: 'Receive 50,000 total aura', type: 'received', requirement: 50000 },
  { id: 'divine_charisma', name: 'Divine Charisma', description: 'Receive 100,000 total aura', type: 'received', requirement: 100000 }
];

// Check and unlock retroactive achievements for existing users
function checkRetroactiveAchievements() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let hasChanges = false;
    
    data.users.forEach(user => {
      if (!user.achievements) user.achievements = [];
      
      // Check all achievement types for retroactive unlocking
      const currentAuraAchievements = checkCurrentAuraAchievements(user);
      const totalGivenAchievements = checkTotalGivenAchievements(user);
      const totalReceivedAchievements = checkTotalReceivedAchievements(user);
      
      if (currentAuraAchievements.length > 0 || totalGivenAchievements.length > 0 || totalReceivedAchievements.length > 0) {
        hasChanges = true;
        console.log(`Unlocked retroactive achievements for ${user.username}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('Updated retroactive achievements');
    }
  } catch (error) {
    console.error('Error checking retroactive achievements:', error);
  }
}

// Run retroactive check on server start
checkRetroactiveAchievements();

// Check achievements for a user
function checkAchievements(user) {
  const newAchievements = [];
  
  // Sort achievements by requirement to check in order
  const sortedAchievements = ACHIEVEMENTS.sort((a, b) => a.requirement - b.requirement);
  
  sortedAchievements.forEach(achievement => {
    // Skip if already unlocked
    if (user.achievements && user.achievements.includes(achievement.id)) {
      return;
    }
    
    let unlocked = false;
    
    switch (achievement.type) {
      case 'totalGiven':
        unlocked = (user.totalGiven || 0) >= achievement.requirement;
        break;
      case 'totalReceived':
        unlocked = (user.totalReceived || 0) >= achievement.requirement;
        break;
      case 'current':
        unlocked = user.aura >= achievement.requirement;
        break;
    }
    
    if (unlocked) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}

// Check only totalGiven achievements
function checkTotalGivenAchievements(user) {
  const newAchievements = [];
  
  // Filter and sort only totalGiven achievements by requirement
  const totalGivenAchievements = ACHIEVEMENTS
    .filter(a => a.type === 'given')
    .sort((a, b) => a.requirement - b.requirement);
  
  totalGivenAchievements.forEach(achievement => {
    // Skip if already unlocked
    if (user.achievements && user.achievements.includes(achievement.id)) {
      return;
    }
    
    // Check if user meets the requirement
    if ((user.totalGiven || 0) >= achievement.requirement) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}

// Check only totalReceived achievements
function checkTotalReceivedAchievements(user) {
  const newAchievements = [];
  
  // Filter and sort only totalReceived achievements by requirement
  const totalReceivedAchievements = ACHIEVEMENTS
    .filter(a => a.type === 'totalReceived')
    .sort((a, b) => a.requirement - b.requirement);
  
  totalReceivedAchievements.forEach(achievement => {
    // Skip if already unlocked
    if (user.achievements && user.achievements.includes(achievement.id)) {
      return;
    }
    
    // Check if user meets the requirement
    if ((user.totalReceived || 0) >= achievement.requirement) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}

// Check only current aura achievements
function checkCurrentAuraAchievements(user) {
  const newAchievements = [];
  
  // Filter and sort only current achievements by requirement
  const currentAchievements = ACHIEVEMENTS
    .filter(a => a.type === 'current')
    .sort((a, b) => a.requirement - b.requirement);
  
  currentAchievements.forEach(achievement => {
    // Skip if already unlocked
    if (user.achievements && user.achievements.includes(achievement.id)) {
      return;
    }
    
    // Check if user meets the requirement
    if (user.aura >= achievement.requirement) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
}

// API Routes

// GET /api/users - Return all users
app.get('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(parsed);
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ error: 'Failed to read users data' });
  }
});

// POST /api/users - Save updated users array
app.post('/api/users', (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid users data' });
    }
    
    // Ensure all users have achievement tracking fields
    users.forEach(user => {
      if (!user.totalGiven) user.totalGiven = 0;
      if (!user.totalReceived) user.totalReceived = 0;
      if (!user.achievements) user.achievements = [];
      if (!user.purchasedBackgrounds) user.purchasedBackgrounds = [];
      if (!user.purchasedNameColors) user.purchasedNameColors = [];
      if (!user.equippedBackground) user.equippedBackground = null;
      if (!user.equippedNameColor) user.equippedNameColor = null;
      if (!user.equippedNameTag) user.equippedNameTag = null;
      if (!user.purchasedNameTags) user.purchasedNameTags = [];
      if (!user.gems) user.gems = 0; // Initialize gems to 0 for existing users
    });
    
    // Read existing data to preserve announcement
    const existingData = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : {};
    const data = { 
      ...existingData,
      users 
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Users data saved successfully' });
  } catch (error) {
    console.error('Error saving users:', error);
    res.status(500).json({ error: 'Failed to save users data' });
  }
});

// GET /api/announcement - Get current announcement
app.get('/api/announcement', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json({ announcement: parsed.announcement || '' });
  } catch (error) {
    console.error('Error reading announcement:', error);
    res.status(500).json({ error: 'Failed to read announcement' });
  }
});

// POST /api/announcement - Update announcement
app.post('/api/announcement', (req, res) => {
  try {
    const { announcement } = req.body;
    
    if (typeof announcement !== 'string') {
      return res.status(400).json({ error: 'Invalid announcement data' });
    }
    
    // Read existing data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.announcement = announcement;
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// GET /api/achievements - Return all achievement definitions
app.get('/api/achievements', (req, res) => {
  try {
    res.json({ achievements: ACHIEVEMENTS });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// POST /api/give-aura - Handle giving aura with achievement tracking
app.post('/api/give-aura', (req, res) => {
  try {
    const { giverUsername, receiverUsername, amount } = req.body;
    
    if (!giverUsername || !receiverUsername || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Read current data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const giver = data.users.find(u => u.username === giverUsername);
    const receiver = data.users.find(u => u.username === receiverUsername);
    
    if (!giver || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize netDailyAura and achievements if needed
    if (!giver.netDailyAura) giver.netDailyAura = {};
    if (!giver.netDailyAura[receiverUsername]) giver.netDailyAura[receiverUsername] = 0;
    if (!giver.achievements) giver.achievements = [];
    if (!receiver.achievements) receiver.achievements = [];
    
    // Check daily limit for positive direction (+500)
    const currentNetAmount = giver.netDailyAura[receiverUsername];
    if (currentNetAmount + amount > 500) {
      return res.status(400).json({ error: `Daily +500 aura limit reached! Current net: ${currentNetAmount}. Try removing some aura first.` });
    }
    
    // Update aura and tracking
    receiver.aura += amount;
    receiver.totalReceived = (receiver.totalReceived || 0) + amount;
    giver.totalGiven = (giver.totalGiven || 0) + amount;
    giver.netDailyAura[receiverUsername] += amount;
    
    // Add gems to giver (2 gems per 25 aura given)
    giver.gems = (giver.gems || 0) + 2;
    
    // Check achievements only for users whose stats changed
    const giverNewAchievements = checkTotalGivenAchievements(giver); // giver's totalGiven changed
    const receiverCurrentAuraAchievements = checkCurrentAuraAchievements(receiver); // receiver's current aura changed
    const receiverNewAchievements = receiverCurrentAuraAchievements;
    
    // Save updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Broadcast real-time update to all connected clients (without achievements)
    io.emit('auraUpdate', {
      type: 'give',
      giver: {
        username: giver.username,
        aura: giver.aura,
        totalGiven: giver.totalGiven,
        gems: giver.gems
      },
      receiver: {
        username: receiver.username,
        aura: receiver.aura,
        totalReceived: receiver.totalReceived
      },
      amount: amount,
      message: `${giver.username} gave ${amount} aura to ${receiver.username}!`,
      newAchievements: {
        giver: [],
        receiver: []
      }
    });
    
    // Send achievement notifications only to specific users
    if (giverNewAchievements.length > 0) {
      const giverSocketId = Array.from(socketToUser.entries())
        .find(([_, username]) => username === giver.username)?.[0];
      if (giverSocketId) {
        io.to(giverSocketId).emit('achievementUnlock', {
          user: giver.username,
          achievements: giverNewAchievements
        });
      }
    }
    
    if (receiverNewAchievements.length > 0) {
      const receiverSocketId = Array.from(socketToUser.entries())
        .find(([_, username]) => username === receiver.username)?.[0];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('achievementUnlock', {
          user: receiver.username,
          achievements: receiverNewAchievements
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Aura given successfully',
      newAchievements: {
        giver: giverNewAchievements,
        receiver: receiverNewAchievements
      }
    });
  } catch (error) {
    console.error('Error giving aura:', error);
    res.status(500).json({ error: 'Failed to give aura' });
  }
});

// POST /api/customization - Handle customization updates with real-time broadcasting
app.post('/api/customization', (req, res) => {
  try {
    const { username, customizationType, itemId, action } = req.body;
    
    console.log('Received customization request:', { username, customizationType, itemId, action });
    
    // Validate required fields
    if (!username || typeof username !== 'string') {
      console.log('Validation failed - invalid username');
      return res.status(400).json({ error: 'Missing or invalid username' });
    }
    
    if (!customizationType || typeof customizationType !== 'string') {
      console.log('Validation failed - invalid customizationType');
      return res.status(400).json({ error: 'Missing or invalid customizationType' });
    }
    
    if (action === undefined || action === null || typeof action !== 'string') {
      console.log('Validation failed - invalid action');
      return res.status(400).json({ error: 'Missing or invalid action' });
    }
    
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    const users = parsed.users;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let updateMessage = '';
    let updatedUser = null;
    
    switch (customizationType) {
      case 'nameColor':
        if (action === 'equip') {
          user.equippedNameColor = itemId;
          const nameColor = marketplaceNameColors.find(c => c.id === itemId);
          updateMessage = `${username} equipped ${nameColor ? nameColor.name : 'name color'}!`;
        } else if (action === 'unequip') {
          user.equippedNameColor = null;
          updateMessage = `${username} unequipped name color!`;
        }
        break;
        
      case 'background':
        if (action === 'equip') {
          user.equippedBackground = itemId;
          const background = marketplaceBackgrounds.find(b => b.id === itemId);
          updateMessage = `${username} equipped ${background ? background.name : 'background'}!`;
        } else if (action === 'unequip') {
          user.equippedBackground = null;
          updateMessage = `${username} unequipped background!`;
        }
        break;
        
      case 'nameTag':
        if (action === 'equip') {
          user.equippedNameTag = itemId;
          const allAchievements = [...gainingAchievements, ...givingAchievements];
          const achievement = allAchievements.find(a => a.id === itemId);
          updateMessage = `${username} equipped ${achievement ? achievement.name : 'name tag'}!`;
        } else if (action === 'unequip') {
          user.equippedNameTag = null;
          updateMessage = `${username} unequipped name tag!`;
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid customization type' });
    }
    
    // Save updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
    
    // Prepare updated user data for broadcasting
    updatedUser = {
      username: user.username,
      equippedNameColor: user.equippedNameColor,
      equippedBackground: user.equippedBackground,
      equippedNameTag: user.equippedNameTag,
      aura: user.aura
    };
    
    // Broadcast customization update to all connected users
    io.emit('customizationUpdate', {
      user: updatedUser,
      customizationType,
      action,
      itemId,
      message: updateMessage
    });
    
    res.json({ 
      success: true, 
      message: updateMessage,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating customization:', error);
    res.status(500).json({ error: 'Failed to update customization' });
  }
});

// POST /api/remove-aura - Handle removing aura with achievement tracking
app.post('/api/remove-aura', (req, res) => {
  try {
    const { removerUsername, targetUsername, amount } = req.body;
    
    if (!removerUsername || !targetUsername || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Read current data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const remover = data.users.find(u => u.username === removerUsername);
    const target = data.users.find(u => u.username === targetUsername);
    
    if (!remover || !target) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize netDailyAura and achievements if needed
    if (!remover.netDailyAura) remover.netDailyAura = {};
    if (!remover.netDailyAura[targetUsername]) remover.netDailyAura[targetUsername] = 0;
    if (!remover.achievements) remover.achievements = [];
    if (!target.achievements) target.achievements = [];
    
    // Check daily limit for negative direction (-500)
    const currentNetAmount = remover.netDailyAura[targetUsername];
    if (currentNetAmount - amount < -500) {
      return res.status(400).json({ error: `Daily -500 aura limit reached! Current net: ${currentNetAmount}. Try giving some aura first.` });
    }
    
    // Update aura and tracking
    target.aura -= amount;
    target.totalReceived = Math.max(0, (target.totalReceived || 0) - amount);
    remover.totalGiven = Math.max(0, (remover.totalGiven || 0) - amount);
    remover.netDailyAura[targetUsername] -= amount;
    
    // Check achievements only for users whose stats changed
    const removerNewAchievements = []; // remover's totalGiven decreased, no new achievements
    const targetCurrentAuraAchievements = checkCurrentAuraAchievements(target); // target's current aura changed
    const targetNewAchievements = targetCurrentAuraAchievements;
    
    // Save updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Broadcast real-time update to all connected clients (without achievements)
    io.emit('auraUpdate', {
      type: 'remove',
      remover: {
        username: remover.username,
        aura: remover.aura,
        totalGiven: remover.totalGiven,
        gems: remover.gems
      },
      target: {
        username: target.username,
        aura: target.aura,
        totalReceived: target.totalReceived
      },
      amount: amount,
      message: `${remover.username} removed ${amount} aura from ${target.username}!`,
      newAchievements: {
        remover: [],
        target: []
      }
    });
    
    // Send achievement notifications only to specific users
    if (targetNewAchievements.length > 0) {
      const targetSocketId = Array.from(socketToUser.entries())
        .find(([_, username]) => username === target.username)?.[0];
      if (targetSocketId) {
        io.to(targetSocketId).emit('achievementUnlock', {
          user: target.username,
          achievements: targetNewAchievements
        });
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Aura removed successfully',
      newAchievements: {
        remover: removerNewAchievements,
        target: targetNewAchievements
      }
    });
  } catch (error) {
    console.error('Error removing aura:', error);
    res.status(500).json({ error: 'Failed to remove aura' });
  }
});

// POST /api/reset-achievements - Reset all achievements for all users
app.post('/api/reset-achievements', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Reset achievements and stats for all users
    data.users.forEach(user => {
      user.achievements = [];
      user.aura = 0;        // Reset to 0 aura
      user.totalGiven = 0;  // Reset giving progress  
      user.totalReceived = 0; // Reset receiving progress
      user.gems = 0;       // Reset gems to 0
      // Keep netDailyAura as is since it's for daily limits
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ 
      success: true, 
      message: 'All achievements have been reset for all users'
    });
  } catch (error) {
    console.error('Error resetting achievements:', error);
    res.status(500).json({ error: 'Failed to reset achievements' });
  }
});

// POST /api/reset-all-aura - Set everyone to 100 aura
app.post('/api/reset-all-aura', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Set aura to 100 for all users
    data.users.forEach(user => {
      user.aura = 100;
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ 
      success: true, 
      message: 'All users have been set to 100 aura'
    });
  } catch (error) {
    console.error('Error resetting all aura:', error);
    res.status(500).json({ error: 'Failed to reset aura' });
  }
});

// Function to reset daily aura limits at midnight
function resetDailyLimits() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    let resetCount = 0;
    
    data.users.forEach(user => {
      if (user.netDailyAura && Object.keys(user.netDailyAura).length > 0) {
        user.netDailyAura = {};
        resetCount++;
      }
    });
    
    if (resetCount > 0) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log(`🔄 Daily aura limits reset for ${resetCount} users at EST: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
    }
  } catch (error) {
    console.error('Error resetting daily limits:', error);
  }
}

// Function to schedule daily reset at midnight EST
function scheduleDailyReset() {
  const scheduleNextReset = () => {
    const now = new Date();
    
    // Get current time in EST
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // Calculate tomorrow at midnight EST (12:00 AM)
    const tomorrowEST = new Date(estNow);
    tomorrowEST.setDate(estNow.getDate() + 1);
    tomorrowEST.setHours(0, 0, 0, 0);
    
    // Get the UTC time for EST midnight
    const estMidnightUTC = new Date(tomorrowEST.toLocaleString('en-US', { timeZone: 'UTC' }));
    const msUntilMidnight = estMidnightUTC.getTime() - now.getTime();
    
    console.log(`⏰ Current EST time: ${estNow.toLocaleString()}`);
    console.log(`⏰ Next daily reset scheduled for EST: ${tomorrowEST.toLocaleString()}`);
    console.log(`⏰ Milliseconds until reset: ${msUntilMidnight}`);
    
    // Ensure we don't have a negative timeout
    if (msUntilMidnight <= 0) {
      console.log('⚠️ Reset time is in the past, scheduling for tomorrow');
      setTimeout(scheduleNextReset, 60000); // Try again in 1 minute
      return;
    }
    
    setTimeout(() => {
      console.log(`🔄 Executing daily reset at EST: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
      resetDailyLimits();
      
      // Schedule the next reset exactly 24 hours later
      setInterval(() => {
        console.log(`🔄 Executing daily reset at EST: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
        resetDailyLimits();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  };
  
  scheduleNextReset();
}

// Initialize daily reset scheduler
scheduleDailyReset();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Aura Tracker server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`⏰ Server started at EST: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
});

// Socket.IO connection handling
const socketToUser = new Map(); // Map socket.id to username

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Handle user authentication to map socket to username
  socket.on('authenticate', (username) => {
    socketToUser.set(socket.id, username);
    console.log(`🔑 Socket ${socket.id} authenticated as ${username}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    socketToUser.delete(socket.id);
  });
});
