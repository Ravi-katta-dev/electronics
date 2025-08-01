const CACHE_NAME = 'rrb-electronics-v1.0.0';
const STATIC_CACHE = 'rrb-electronics-static-v1.0.0';
const DYNAMIC_CACHE = 'rrb-electronics-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/responsive.css',
  './assets/js/app.js',
  './assets/js/circuit-engine.js',
  './assets/js/simulation.js',
  './assets/js/exam-engine.js',
  './js/utils/github-pages-router.js',
  './modules/digital-logic/index.html',
  './modules/electronic-devices/index.html',
  './modules/microcontroller/index.html',
  './modules/measurements/index.html',
  './modules/measuring-systems/index.html',
  './modules/transducers/index.html',
  './modules/display-tech/index.html',
  './tools/circuit-builder/index.html',
  './tools/virtual-lab/index.html',
  './tools/exam-simulator/index.html',
  './tools/exam-simulator/css/exam-styles.css',
  './tools/exam-simulator/js/exam-engine.js',
  './tools/exam-simulator/data/questions.json'
];

// Files that should be cached dynamically
const DYNAMIC_FILES = [
  './data/questions/',
  './data/circuits/',
  './data/formulas/',
  './data/components/',
  './assets/images/'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }

        // Fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Check if response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone response for caching
            const responseToCache = networkResponse.clone();

            // Determine which cache to use
            const isDynamicFile = DYNAMIC_FILES.some(pattern => 
              request.url.includes(pattern)
            );

            const cacheToUse = isDynamicFile ? DYNAMIC_CACHE : STATIC_CACHE;

            // Cache the response
            caches.open(cacheToUse)
              .then((cache) => {
                console.log('Service Worker: Caching new file', request.url);
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Network request failed', error);
            
            // Return offline fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // Return generic offline message for other requests
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'This content is not available offline.' 
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  switch (event.tag) {
    case 'progress-sync':
      event.waitUntil(syncProgress());
      break;
    case 'exam-results-sync':
      event.waitUntil(syncExamResults());
      break;
    case 'bookmarks-sync':
      event.waitUntil(syncBookmarks());
      break;
    default:
      console.log('Service Worker: Unknown sync tag', event.tag);
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'RRB Electronics',
    body: 'You have a new notification',
    icon: '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/badge.png',
    tag: 'general'
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (e) {
      console.error('Service Worker: Error parsing push data', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/assets/images/icons/open.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/assets/images/icons/dismiss.png'
        }
      ]
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for background sync
async function syncProgress() {
  try {
    const progressData = await getStoredData('pendingProgress');
    if (progressData.length > 0) {
      // Sync progress data with server when online
      console.log('Service Worker: Syncing progress data', progressData);
      // Implementation would send data to server
      await clearStoredData('pendingProgress');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing progress', error);
  }
}

async function syncExamResults() {
  try {
    const examResults = await getStoredData('pendingExamResults');
    if (examResults.length > 0) {
      // Sync exam results with server when online
      console.log('Service Worker: Syncing exam results', examResults);
      // Implementation would send data to server
      await clearStoredData('pendingExamResults');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing exam results', error);
  }
}

async function syncBookmarks() {
  try {
    const bookmarks = await getStoredData('pendingBookmarks');
    if (bookmarks.length > 0) {
      // Sync bookmarks with server when online
      console.log('Service Worker: Syncing bookmarks', bookmarks);
      // Implementation would send data to server
      await clearStoredData('pendingBookmarks');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing bookmarks', error);
  }
}

// Helper functions for IndexedDB operations
function getStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RRBElectronicsDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function clearStoredData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RRBElectronicsDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});