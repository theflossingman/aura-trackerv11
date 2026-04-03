# 🚀 Aura Tracker v4 Deployment Guide

## 📋 Repository Setup
- **Repository Name**: `aura-trackerv4`
- **GitHub Username**: `theflossingman`
- **Port**: `3040`
- **Registry**: `ghcr.io/theflossingman/aura-trackerv4`

## 🔧 What's Fixed:
✅ **.gitignore** - Excludes node_modules, data files, IDE files
✅ **Dockerfile** - Updated for port 3040 and volume persistence
✅ **docker-compose.yml** - Uses GitHub Container Registry with correct image
✅ **GitHub Workflow** - Auto-builds and pushes to GHCR with correct repo name
✅ **Data Persistence** - Proper volume mapping for user data
✅ **Health Checks** - Container health monitoring

## 📦 Deployment Steps:

### 1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - Aura Tracker v4"
git branch -M main
git remote add origin https://github.com/theflossingman/aura-trackerv4.git
git push -u origin main
```

### 2. **GitHub Actions**
- Auto-triggers on push to main
- Builds Docker image
- Pushes to `ghcr.io/theflossingman/aura-trackerv4:latest`

### 3. **Portainer Setup**

#### Option A: Stack (Recommended)
1. **Add Registry**: `ghcr.io`
   - URL: `https://ghcr.io`
   - Username: `theflossingman`
   - Password: GitHub Personal Access Token

2. **Create Stack**:
   - Go to Stacks → Add stack
   - Name: `aura-tracker`
   - Copy content from `docker-compose.yml`
   - **IMPORTANT**: Update volume path for your system
   - Deploy

#### Option B: Container
1. **Pull Image**: `ghcr.io/theflossingman/aura-trackerv4:latest`
2. **Create Container**:
   - Name: `aura-tracker`
   - Port: `3040:3040`
   - Volume: `your/host/path:/app/data`
   - Restart: `Unless stopped`

### 4. **Volume Mapping (CRITICAL)**
The application stores user data in `/app/data/data.json`. You MUST map this to persist data.

**Examples**:
- **Linux**: `./data:/app/data`
- **Synology**: `/volume1/docker/aura-tracker/data:/app/data`
- **Windows**: `C:\docker\aura-tracker\data:/app/data`

**Create data directory**:
```bash
mkdir -p ./data
chmod 755 ./data
```

## 🔐 GitHub Token Setup:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `read:packages` and `write:packages` scopes
3. Use this token as password in Portainer registry

## 🌐 Access:
- **Local**: http://localhost:3040
- **Production**: http://your-server:3040

## � Updates
### Automatic
GitHub Actions builds new images on every push to main.

### Manual Update
```bash
docker-compose pull
docker-compose up -d
```

### Portainer Update
1. Go to Stacks → aura-tracker
2. Click "Update"
3. Select "Pull latest image"
4. Click "Update"

## 🐛 Troubleshooting

### Container Won't Start
```bash
docker-compose logs aura-tracker
```

### Data Not Persisting
1. Check volume mapping is correct
2. Verify host directory permissions
3. Ensure data directory exists

### Permission Issues
```bash
sudo chown -R 1000:1000 ./data
```

## 📱 Features:
- ✅ Custom trophy app icon
- ✅ Dashboard gradient background
- ✅ PWA support (iOS/Android)
- ✅ Name tag customization
- ✅ Achievement system
- ✅ Real-time aura updates

## 🎯 Ready to Deploy!
All configurations are set. Just push to GitHub and deploy with Portainer!
