const CACHE_NAME = 'ybt-cache-v1';
const CACHE_DATA_NAME = 'ybt-cache-data-v1'

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    // './icons/icon-72x72',
    // './icons/icon-96x96',
    // './icons/icon-128x128',
    // './icons/icon-144x144',
    // './icons/icon-152x152',
    // './icons/icon-192x192',
    // './icons/icon-384x384',
    // './icons/icon-512x512',
    './js/idb.js',
    './js/index.js'
];

// install
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Installing cache: ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// activate
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            // delete old caches
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== CACHE_DATA_NAME) {
                    console.log('Deleting cache: ' + key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

// retrieve cache info
self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(CACHE_DATA_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(res => {
                            if (res.status === 200) {
                                cache.put(e.request.url, res.clone());
                            }

                            return res;
                        })
                        .catch(err => {
                            return caches.match(e.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(res) {
                if (res) {
                    return res;
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});
