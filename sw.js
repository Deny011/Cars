var C="flip-v3",F=["./","index.html","style.css","app.js","manifest.webmanifest","icon.svg"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}))});
self.addEventListener("fetch",function(e){e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request)}))});
