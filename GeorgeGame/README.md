# George Game - Packaging & Distribution Guide

## Overview

George Game is a web-based multiplayer fighting game that can be packaged and distributed in multiple ways, each with automatic update capabilities.

## Distribution Options

### 1. Progressive Web App (PWA) - **Recommended**

The PWA approach allows users to install the game locally through their browser while maintaining automatic update checking.

#### Features:

- ✅ Cross-platform (works on all modern browsers)
- ✅ Automatic update notifications
- ✅ Offline gameplay capability
- ✅ Native app-like experience
- ✅ Installable from browser
- ✅ Minimal setup required

#### Setup:

1. The PWA is already configured with these files:

   - `manifest.json` - PWA manifest
   - `sw.js` - Service Worker for caching and updates
   - `pwa-handler.js` - PWA installation and update logic

2. To test locally:

   ```bash
   npm run serve
   ```

3. For production deployment:
   ```bash
   npm run deploy
   ```

#### How it works:

- Service Worker caches game assets for offline play
- Checks GitHub API for new commits every 30 seconds
- Shows update notification when new version is available
- Users can click "Update Now" to refresh with latest version

### 2. Electron Desktop App

Package as a native desktop application with auto-update capabilities.

#### Features:

- ✅ Native desktop experience
- ✅ Automatic updates via electron-updater
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Access to native OS features
- ✅ Can distribute via app stores

#### Setup:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Update `package.json` to set Electron as main entry:

   ```json
   {
     "main": "electron-main.js"
   }
   ```

3. Build the desktop app:
   ```bash
   npm run package:electron
   ```

#### How it works:

- Uses `electron-updater` to check for updates
- Downloads updates in background
- Prompts user to restart when update is ready
- Requires app signing for automatic updates

### 3. Tauri Desktop App (Alternative)

Rust-based alternative to Electron with smaller bundle size.

#### Features:

- ✅ Smaller bundle size than Electron
- ✅ Better performance
- ✅ Built-in updater
- ✅ Cross-platform

#### Setup:

1. Install Tauri CLI:

   ```bash
   npm install -g @tauri-apps/cli
   ```

2. Initialize Tauri:

   ```bash
   tauri init
   ```

3. Build:
   ```bash
   npm run package:tauri
   ```

## Update Mechanisms

### PWA Update System

The PWA uses a sophisticated update system:

1. **Service Worker Caching**: All game assets are cached for offline play
2. **GitHub API Integration**: Checks for new commits on the main branch
3. **Automatic Notifications**: Shows update prompts when new version is available
4. **Manual Check**: Users can manually check for updates via the "Check Updates" button

### Electron Update System

The Electron app uses `electron-updater`:

1. **Background Downloads**: Updates download automatically in the background
2. **Update Notifications**: Users are notified when updates are available
3. **Restart Prompt**: Users can choose when to restart and apply updates
4. **Rollback Support**: Can rollback to previous versions if needed

## Development Workflow

### For PWA Updates:

1. Make changes to your game code
2. Commit and push to the main branch
3. The PWA will automatically detect the new commit
4. Users will receive update notifications

### For Electron Updates:

1. Update version in `package.json`
2. Build and publish new version
3. Update server will distribute to users
4. Users will receive automatic update notifications

## Testing Updates

### PWA Testing:

1. Start local server: `npm run serve`
2. Install PWA in browser
3. Make changes and commit
4. PWA should detect updates within 30 seconds

### Electron Testing:

1. Build app: `npm run package:electron`
2. Set up update server (like electron-release-server)
3. Publish new version
4. Test auto-update functionality

## Production Deployment

### PWA Deployment:

1. Deploy to GitHub Pages: `npm run deploy`
2. Or deploy to any static hosting service
3. Ensure HTTPS is enabled for PWA features

### Electron Deployment:

1. Set up code signing certificates
2. Configure update server
3. Build and distribute installers
4. Users receive automatic updates

## Configuration

### Update Check Frequency:

- PWA: Every 30 seconds when active, on window focus
- Electron: Every hour, plus manual checks

### GitHub API Configuration:

Update the repository URL in `sw.js`:

```javascript
const GITHUB_API_URL =
  "https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/commits/main";
```

## Security Considerations

1. **HTTPS Required**: PWA features require HTTPS in production
2. **Code Signing**: Electron apps should be signed for user trust
3. **Update Server Security**: Ensure update server uses HTTPS
4. **Content Security Policy**: Implement CSP headers for web deployment

## Troubleshooting

### PWA Issues:

- Check browser console for service worker errors
- Verify HTTPS is enabled in production
- Ensure GitHub API is accessible

### Electron Issues:

- Check for code signing issues
- Verify update server configuration
- Test with development builds first

## File Structure

```
george-game/
├── manifest.json           # PWA manifest
├── sw.js                  # Service Worker
├── pwa-handler.js         # PWA update logic
├── electron-main.js       # Electron main process
├── package.json           # Build configuration
├── index.html             # Game entry point
├── game.js                # Game logic
├── style.css              # Game styles
├── sprites/               # Game sprites
├── sounds/                # Game audio
└── music/                 # Game music
```

## Commands Quick Reference

```bash
# Development
npm run dev                 # Start development server
npm run serve               # Start production server

# Building
npm run build               # Build PWA
npm run package:electron    # Build Electron app
npm run package:tauri       # Build Tauri app

# Deployment
npm run deploy              # Deploy PWA to GitHub Pages
```

## Support

For issues with packaging or updates:

1. Check the console for error messages
2. Verify network connectivity for update checks
3. Test in different browsers/platforms
4. Check GitHub repository permissions

---

Choose the distribution method that best fits your needs. PWA is recommended for most use cases due to its simplicity and cross-platform compatibility.
