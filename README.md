# 🎯 Aura Tracker

Family Aura Tracker with persistent data.

## 🚀 Quick Start

### Docker
```bash
docker build -t aura-tracker .
docker run -d -p 3000:3000 -v ./data:/app/data aura-tracker
```

### Docker Compose
```bash
docker-compose up -d
```

## 🔑 Default Users
- Max (admin): 1234
- Gigi, Marco, Dezi, Sevi (users): 1234

## 📱 Access
http://localhost:3000

## ✨ Features
- Secure authentication
- Daily 500 aura limits
- Persistent SQLite data
- Real-time updates
- Modern glass morphism UI
