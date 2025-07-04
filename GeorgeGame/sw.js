const CACHE_NAME = "george-game-v1.0.0";
const GITHUB_API_URL =
  "https://api.github.com/repos/JackGormanBackstory/georgeGame/commits/main";

// Files to cache for offline play
const CACHE_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./game-bundled.js",
  "./js/GameController.js",
  "./favicon.svg",
  "./SuperSmashShowdown.svg",
  "./gameBg.png",
  "./landscapeBG.png",
  "./bowserSprite.png",
  "./bowserAttackSheet.png",
  "./bowserbackground.png",
  "./cloud.png",
  "./characterSelect.mp4",
  "./videoBGLoop.mp4",
  // Add all sprite files
  "./sprites/Mario_Cape.png",
  "./sprites/Mario_Cat.png",
  "./sprites/Mario_Fire.png",
  "./sprites/Mario_Fire_drag.png",
  "./sprites/Mario_Giant.png",
  "./sprites/Mario_Penguin.png",
  "./sprites/Mario_Raccoon.png",
  "./sprites/Sidekick_DK.png",
  "./sprites/Sidekick_Luigi.png",
  "./sprites/Sidekick_Peach.png",
  "./sprites/Sidekick_Toad.png",
  "./sprites/Sidekick_Waluigi.png",
  "./sprites/Sidekick_Wario.png",
  // Add sound files
  "./sounds/gameOver.mp3",
  "./sounds/stomp2.wav",
  "./music/bossMusic.mp3",
  "./music/characterSelectMusic.mp3",
];

// Install event - cache files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log("Service Worker: Cached all files successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network fails, try to serve a fallback
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// Check for updates from GitHub
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_FOR_UPDATES") {
    checkForUpdates().then((hasUpdate) => {
      event.ports[0].postMessage({ hasUpdate });
    });
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch(GITHUB_API_URL);
    const data = await response.json();
    const latestCommitSha = data.sha;

    // Get stored commit SHA
    const storedCommitSha = await getStoredCommitSha();

    if (storedCommitSha !== latestCommitSha) {
      // Store new commit SHA
      await storeCommitSha(latestCommitSha);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking for updates:", error);
    return false;
  }
}

async function getStoredCommitSha() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match("commit-sha");
    if (response) {
      return await response.text();
    }
  } catch (error) {
    console.error("Error getting stored commit SHA:", error);
  }
  return null;
}

async function storeCommitSha(sha) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put("commit-sha", new Response(sha));
  } catch (error) {
    console.error("Error storing commit SHA:", error);
  }
}

// Periodic background sync to check for updates
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      checkForUpdates().then((hasUpdate) => {
        if (hasUpdate) {
          // Notify all clients about the update
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: "UPDATE_AVAILABLE",
                message: "A new version of George Game is available!",
              });
            });
          });
        }
      })
    );
  }
});
