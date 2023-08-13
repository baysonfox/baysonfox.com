self.importScripts("https://cdn.bootcdn.net/ajax/libs/sw-toolbox/3.6.1/sw-toolbox.js");
self.toolbox.options.debug = false;
self.toolbox.options.networkTimeoutSeconds = 3;
var cacheVersion = "-17104";
var staticImageCacheName = "image" + cacheVersion;
var staticAssetsCacheName = "assets" + cacheVersion;
var contentCacheName = "content" + cacheVersion;
var vendorCacheName = "vendor" + cacheVersion;
var maxEntries = 100;

/* Static ImageCache */
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /article\.biliimg\.com/,
    cache: {
        name: staticImageCacheName,
        maxEntries: maxEntries
    }
});
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /cdn1\.tianli0\.top/,
    cache: {
        name: staticImageCacheName,
        maxEntries: maxEntries
    }
});

/* Static Cache */
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /cdn\.bootcdn\.net/,
    cache: {
        name: staticAssetsCacheName,
        maxEntries: maxEntries
    }
});
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /npm\.elemecdn\.com/,
    cache: {
        name: staticAssetsCacheName,
        maxEntries: maxEntries
    }
});
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /fonts\.googleapis\.com/,
    cache: {
        name: staticAssetsCacheName,
        maxEntries: maxEntries
    }
});
self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
    origin: /fonts\.gstatic\.com/,
    cache: {
        name: staticAssetsCacheName,
        maxEntries: maxEntries
    }
});

/* ContentCache */
self.toolbox.router.get("/(.*)", self.toolbox.networkFirst, {
    origin: /baysonfox\.com/,
    cache: {
       name: contentCacheName,
       maxEntries: maxEntries
    }
});

/* NoCache */
self.toolbox.router.get("scripts/service_workers.js",self.toolbox.networkFirst);

/* PreCache */
self.addEventListener("install",
function(event) {return event.waitUntil(self.skipWaiting())
});
self.addEventListener("activate",
function(event) {return event.waitUntil(self.clients.claim())
})