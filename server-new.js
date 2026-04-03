const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Database setup
const db = new sqlite3.Database('./data/aura.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get today's date string
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// API Routes

// Login system
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        aura: user.aura
      });
    } catch (compareError) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role, aura FROM users ORDER BY username', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Give aura
app.post('/api/give-aura', (req, res) => {
  const { from, to, amount = 25 } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and to users required' });
  }
  
  if (from === to) {
    return res.status(400).json({ error: 'Cannot give aura to yourself' });
  }
  
  // Check daily limit: Max 500 aura per day per giver → receiver
  const today = getTodayString();
  
  db.get(
    'SELECT SUM(amount) as daily_total FROM aura_logs WHERE from_user = ? AND to_user = ? AND date = ?',
    [from, to, today],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const dailyTotal = result.daily_total || 0;
      
      if (dailyTotal + amount > 500) {
        return res.status(400).json({ 
          error: 'Daily 500 aura limit reached',
          daily_given: dailyTotal,
          remaining: 500 - dailyTotal
        });
      }
      
      // Get receiver's current aura
      db.get('SELECT aura FROM users WHERE username = ?', [to], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
          return res.status(404).json({ error: 'Receiver not found' });
        }
        
        // Update receiver's aura
        db.run(
          'UPDATE users SET aura = aura + ? WHERE username = ?',
          [amount, to],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Log the aura transaction
            db.run(
              'INSERT INTO aura_logs (from_user, to_user, amount, date) VALUES (?, ?, ?, ?)',
              [from, to, amount, today],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }
                
                res.json({ 
                  message: 'Aura given successfully',
                  amount,
                  new_aura_total: user.aura + amount,
                  daily_given: dailyTotal + amount
                });
              }
            );
          }
        );
      });
    }
  );
});

// Remove aura
app.post('/api/remove-aura', (req, res) => {
  const { from, to, amount = 25 } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and to users required' });
  }
  
  if (from === to) {
    return res.status(400).json({ error: 'Cannot remove aura from yourself' });
  }
  
  // Get user's current aura
  db.get('SELECT aura FROM users WHERE username = ?', [to], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.aura < amount) {
      return res.status(400).json({ error: 'Insufficient aura to remove' });
    }
    
    // Update user's aura
    db.run(
      'UPDATE users SET aura = aura - ? WHERE username = ?',
      [amount, to],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Log the aura transaction
        db.run(
          'INSERT INTO aura_logs (from_user, to_user, amount, date) VALUES (?, ?, ?, ?)',
          [from, to, -amount, getTodayString()],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ 
              message: 'Aura removed successfully',
              amount,
              new_aura_total: user.aura - amount
            });
          }
        );
      }
    );
  });
});

// Get aura history (for graph)
app.get('/api/aura-history', (req, res) => {
  const { user } = req.query;
  
  if (!user) {
    return res.status(400).json({ error: 'User parameter required' });
  }
  
  db.all(
    'SELECT * FROM aura_logs WHERE to_user = ? ORDER BY date DESC',
    [user],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(logs);
    }
  );
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Aura Tracker server running on http://localhost:${PORT}`);
  console.log('📊 API Endpoints:');
  console.log('  POST /api/login - Login');
  console.log('  GET  /api/users - Get all users');
  console.log('  POST /api/give-aura - Give aura');
  console.log('  POST /api/remove-aura - Remove aura');
  console.log('  GET  /api/aura-history?user=USERNAME - Get aura history');
});
