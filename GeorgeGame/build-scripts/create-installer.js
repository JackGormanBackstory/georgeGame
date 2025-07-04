#!/usr/bin/env node

/**
 * Simple build script to create installers for non-technical users
 * This script generates desktop app installers that users can just double-click
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🎮 George Game - Creating User-Friendly Installers");
console.log("================================================");

// Configuration
const CONFIG = {
  appName: "George Game",
  appId: "com.georgegame.app",
  version: "1.0.0",
  description: "Super Smash Showdown - A multiplayer fighting game",
  author: "Your Name",
  buildDir: "dist",
  outputDir: "installers",
};

// Check if we have the required dependencies
function checkDependencies() {
  console.log("📦 Checking dependencies...");

  try {
    // Check if electron is installed
    execSync("npm list electron", { stdio: "ignore" });
    console.log("✅ Electron found");
  } catch (error) {
    console.log("❌ Electron not found. Installing...");
    execSync("npm install electron electron-builder --save-dev", {
      stdio: "inherit",
    });
    console.log("✅ Electron installed");
  }
}

// Create directories
function createDirectories() {
  console.log("📁 Creating directories...");

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  console.log("✅ Directories created");
}

// Update package.json for electron
function updatePackageJson() {
  console.log("📝 Updating package.json...");

  const packageJsonPath = "package.json";
  let packageJson;

  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    console.log(
      "❌ Package.json not found. Please run this from your game directory."
    );
    process.exit(1);
  }

  // Update necessary fields
  packageJson.main = "electron-main.js";
  packageJson.homepage = "./";

  // Add build configuration
  packageJson.build = {
    appId: CONFIG.appId,
    productName: CONFIG.appName,
    directories: {
      output: CONFIG.outputDir,
    },
    files: [
      "**/*",
      "!node_modules/**/*",
      "!build-scripts/**/*",
      "!dist/**/*",
      "!installers/**/*",
    ],
    win: {
      target: "nsis",
      icon: "favicon.ico",
    },
    mac: {
      target: "dmg",
      icon: "favicon.icns",
      category: "public.app-category.games",
    },
    linux: {
      target: "AppImage",
      icon: "favicon.png",
      category: "Game",
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
    },
  };

  // Add build scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["build:installer"] =
    "node build-scripts/create-installer.js";
  packageJson.scripts["build:win"] = "electron-builder --win";
  packageJson.scripts["build:mac"] = "electron-builder --mac";
  packageJson.scripts["build:linux"] = "electron-builder --linux";
  packageJson.scripts["build:all"] = "electron-builder --win --mac --linux";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ Package.json updated");
}

// Build the installers
function buildInstallers() {
  console.log("🔨 Building installers...");
  console.log("This may take a few minutes...");

  try {
    // Build for current platform
    console.log("Building for current platform...");
    execSync("npx electron-builder", { stdio: "inherit" });

    console.log("✅ Installers built successfully!");
    console.log(
      `📦 Check the '${CONFIG.outputDir}' folder for your installers`
    );
  } catch (error) {
    console.log("❌ Build failed:", error.message);
    console.log("💡 Try running: npm install electron-builder --save-dev");
    process.exit(1);
  }
}

// Create user instructions
function createUserInstructions() {
  console.log("📝 Creating user instructions...");

  const instructionsPath = path.join(CONFIG.outputDir, "HOW-TO-INSTALL.txt");

  const instructions = `🎮 GEORGE GAME - INSTALLATION INSTRUCTIONS
==========================================

FOR USERS (NO TECHNICAL KNOWLEDGE REQUIRED)

Windows Users:
1. Find the file ending in ".exe" (e.g., "George Game Setup 1.0.0.exe")
2. Double-click the .exe file
3. Follow the installation wizard (click "Next" and "Install")
4. The game will appear in your Start Menu and Desktop
5. Double-click the game icon to play!

Mac Users:
1. Find the file ending in ".dmg" (e.g., "George Game-1.0.0.dmg")
2. Double-click the .dmg file
3. Drag the game icon to your Applications folder
4. Open Applications folder and double-click the game
5. If you see a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"

Linux Users:
1. Find the file ending in ".AppImage" (e.g., "George Game-1.0.0.AppImage")
2. Right-click the file and select "Properties"
3. Go to "Permissions" tab and check "Execute" or "Allow executing file as program"
4. Double-click the file to run the game

TROUBLESHOOTING:
- If installation fails, make sure you have administrator privileges
- If the game won't start, check that you have enough disk space (at least 500MB)
- If you see security warnings, it's normal for unsigned apps - click "Allow" or "Open Anyway"

GETTING UPDATES:
- The game will automatically check for updates when you start it
- You'll be notified when a new version is available
- You can download and install updates the same way you installed the original game

Need help? Contact: [your-email@example.com]`;

  fs.writeFileSync(instructionsPath, instructions);
  console.log("✅ User instructions created");
}

// Main execution
async function main() {
  try {
    console.log("Starting installer creation process...\n");

    checkDependencies();
    createDirectories();
    updatePackageJson();
    buildInstallers();
    createUserInstructions();

    console.log("");
    console.log("🎉 SUCCESS! User-friendly installers created!");
    console.log("");
    console.log("📦 What to do next:");
    console.log(`1. Check the '${CONFIG.outputDir}' folder`);
    console.log("2. Upload the installer files to your website");
    console.log("3. Share the download links with your users");
    console.log(
      "4. Users can double-click the installers to install your game!"
    );
    console.log("");
    console.log(
      "💡 Tip: Test the installers on different computers to make sure they work"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
