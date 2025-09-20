/**
 * Ultra-optimized image service worker
 * Implements intelligent caching, prefetching, and network-aware serving
 */

const CACHE_NAME = 'ultra-images-v1';
const MANIFEST_CACHE = 'ultra-manifest-v1';
const SUPPORTED_FORMATS = ['avif', 'webp', 'jxl', 'jpg'];
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB cache limit

// Install event - setup caches
self.addEventListener('install', event => {
  console.log('Ultra Image Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(MANIFEST_CACHE),
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Ultra Image Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName =>
              cacheName.startsWith('ultra-images-') && cacheName !== CACHE_NAME ||
              cacheName.startsWith('ultra-manifest-') && cacheName !== MANIFEST_CACHE
            )
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      // Take control of all pages
      self.clients.claim(),
      // Load manifest
      loadImageManifest()
    ])
  );
});

// Fetch event - intelligent image serving
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle ultra-optimized image requests
  if (url.pathname.startsWith('/api/ultra-image') ||
      url.pathname.startsWith('/ultra-optimized/')) {
    event.respondWith(handleImageRequest(event.request, url));
    return;
  }

  // Handle manifest requests
  if (url.pathname.endsWith('ultra-image-manifest.json')) {
    event.respondWith(handleManifestRequest(event.request));
    return;
  }
});

// Message handling for prefetching and cache management
self.addEventListener('message', event => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'PREFETCH_IMAGES':
      event.waitUntil(prefetchImages(data.urls, data.priority));
      break;

    case 'CLEAR_IMAGE_CACHE':
      event.waitUntil(clearImageCache());
      break;

    case 'GET_CACHE_STATS':
      event.waitUntil(getCacheStats().then(stats => {
        event.ports[0]?.postMessage({ type: 'CACHE_STATS', data: stats });
      }));
      break;

    case 'PRELOAD_CRITICAL':
      event.waitUntil(preloadCriticalImages(data.images));
      break;
  }
});

/**
 * Handle image requests with intelligent caching and network awareness
 */
async function handleImageRequest(request, url) {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Check cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Update cache in background if stale
      if (shouldUpdateCache(cachedResponse)) {
        fetchAndCache(request, cache).catch(console.warn);
      }
      return cachedResponse;
    }

    // Network request with timeout
    const networkResponse = await fetchWithTimeout(request, 10000);

    if (networkResponse.ok) {
      // Cache successful responses
      await cacheResponse(cache, request, networkResponse.clone());

      // Manage cache size
      await manageCacheSize(cache);

      return networkResponse;
    }

    // Return fallback image for failed requests
    return createFallbackResponse();

  } catch (error) {
    console.warn('Image fetch failed:', error);
    return createFallbackResponse();
  }
}

/**
 * Handle manifest requests
 */
async function handleManifestRequest(request) {
  try {
    const cache = await caches.open(MANIFEST_CACHE);

    const cachedResponse = await cache.match(request);
    if (cachedResponse && !isStale(cachedResponse, 3600000)) { // 1 hour
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    return cachedResponse || new Response('Manifest not found', { status: 404 });

  } catch (error) {
    console.warn('Manifest fetch failed:', error);
    const cache = await caches.open(MANIFEST_CACHE);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Manifest not available', { status: 503 });
  }
}

/**
 * Prefetch images based on priority and network conditions
 */
async function prefetchImages(urls, priority = 'low') {
  if (!urls || !Array.isArray(urls)) return;

  const cache = await caches.open(CACHE_NAME);
  const networkInfo = await getNetworkInfo();

  // Skip prefetching on slow networks unless high priority
  if (networkInfo.effectiveType === '2g' && priority !== 'high') {
    return;
  }

  // Limit concurrent prefetches
  const batchSize = networkInfo.effectiveType === '4g' ? 5 : 2;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async url => {
        try {
          const cachedResponse = await cache.match(url);
          if (!cachedResponse) {
            const response = await fetchWithTimeout(url, 5000);
            if (response.ok) {
              await cacheResponse(cache, url, response);
            }
          }
        } catch (error) {
          console.warn('Prefetch failed for:', url);
        }
      })
    );

    // Pause between batches on slower networks
    if (networkInfo.effectiveType !== '4g') {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Preload critical images immediately
 */
async function preloadCriticalImages(images) {
  if (!images || !Array.isArray(images)) return;

  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    images.map(async image => {
      try {
        const request = new Request(image.url, {
          priority: 'high',
          credentials: 'same-origin'
        });

        const cachedResponse = await cache.match(request);
        if (!cachedResponse) {
          const response = await fetch(request);
          if (response.ok) {
            await cacheResponse(cache, request, response);
          }
        }
      } catch (error) {
        console.warn('Critical image preload failed:', image.url);
      }
    })
  );
}

/**
 * Load and cache the image manifest
 */
async function loadImageManifest() {
  try {
    const manifestCache = await caches.open(MANIFEST_CACHE);
    const manifestUrl = '/ultra-optimized/ultra-image-manifest.json';

    const response = await fetch(manifestUrl);
    if (response.ok) {
      manifestCache.put(manifestUrl, response.clone());
      return response.json();
    }
  } catch (error) {
    console.warn('Failed to load image manifest:', error);
  }
  return null;
}

/**
 * Cache response with metadata
 */
async function cacheResponse(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  headers.set('sw-cache-version', CACHE_NAME);

  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });

  await cache.put(request, modifiedResponse);
}

/**
 * Check if cached response should be updated
 */
function shouldUpdateCache(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;

  const age = Date.now() - parseInt(cachedAt);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return age > maxAge;
}

/**
 * Check if response is stale
 */
function isStale(response, maxAge) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return true;

  const age = Date.now() - parseInt(cachedAt);
  return age > maxAge;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(request, timeout = 10000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), timeout)
    )
  ]);
}

/**
 * Create fallback response for failed image requests
 */
function createFallbackResponse() {
  // 1x1 transparent pixel as fallback
  const fallbackImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  return fetch(fallbackImage).then(response => {
    return new Response(response.body, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=31536000',
        'X-Fallback': 'true'
      }
    });
  });
}

/**
 * Manage cache size to prevent overflow
 */
async function manageCacheSize(cache) {
  try {
    const requests = await cache.keys();
    let totalSize = 0;

    // Calculate total cache size (approximation)
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          totalSize += parseInt(contentLength);
        }
      }
    }

    // If over limit, remove oldest entries
    if (totalSize > MAX_CACHE_SIZE) {
      const requestsWithTimestamp = await Promise.all(
        requests.map(async request => {
          const response = await cache.match(request);
          const cachedAt = response ? response.headers.get('sw-cached-at') : '0';
          return { request, cachedAt: parseInt(cachedAt) };
        })
      );

      // Sort by age (oldest first)
      requestsWithTimestamp.sort((a, b) => a.cachedAt - b.cachedAt);

      // Remove oldest 25% of entries
      const toRemove = Math.floor(requestsWithTimestamp.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        await cache.delete(requestsWithTimestamp[i].request);
      }
    }
  } catch (error) {
    console.warn('Cache size management failed:', error);
  }
}

/**
 * Clear image cache
 */
async function clearImageCache() {
  try {
    await caches.delete(CACHE_NAME);
    await caches.open(CACHE_NAME); // Recreate empty cache
    console.log('Image cache cleared');
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    let totalSize = 0;
    let imageCount = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        imageCount++;
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          totalSize += parseInt(contentLength);
        }
      }
    }

    return {
      imageCount,
      totalSize,
      maxSize: MAX_CACHE_SIZE,
      utilization: (totalSize / MAX_CACHE_SIZE * 100).toFixed(2) + '%'
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return { error: error.message };
  }
}

/**
 * Get network information
 */
async function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      saveData: connection.saveData || false
    };
  }

  return {
    effectiveType: '4g',
    downlink: 10,
    saveData: false
  };
}

console.log('Ultra Image Service Worker loaded successfully');