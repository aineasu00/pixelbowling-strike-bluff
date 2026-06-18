const CACHE="strike-bluff-v1";
const FILES=["./","./index.html","./css/style.css","./css/animations.css","./js/cards.js","./js/liarbar.js","./js/effects.js","./js/app.js","./manifest.json","./assets/fonts.css","./assets/playfair-600.ttf","./assets/playfair-700.ttf","./assets/playfair-900.ttf","./assets/vt323.ttf"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("./index.html")))));
