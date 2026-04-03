const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Create database in ./data/ directory (matches server-new.js)
const db = new sqlite3.Database('./data/aura.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      aura INTEGER DEFAULT 100,
      gems INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user'
    )
  `);

  // Aura logs table  
  db.run(`
    CREATE TABLE IF NOT EXISTS aura_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user TEXT NOT NULL,
      to_user TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `);

  // Insert default users if empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      console.log('Inserting default users...');
      
      const defaultUsers = [
        { username: 'Max', password: '1234', role: 'admin' },
        { username: 'Gigi', password: '1234', role: 'user' },
        { username: 'Marco', password: '1234', role: 'user' },
        { username: 'Dezi', password: '1234', role: 'user' },
        { username: 'Sevi', password: '1234', role: 'user' }
      ];

      defaultUsers.forEach(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.run(
          'INSERT INTO users (username, password, aura, gems, role) VALUES (?, ?, 100, 0, ?)',
          [user.username, hashedPassword, user.role],
          (err) => {
            if (err) {
              console.error(`Error inserting ${user.username}:`, err);
            } else {
              console.log(`Inserted user: ${user.username}`);
            }
          }
        );
      });
    }
  });
});

console.log('Database initialized successfully');
db.close();
