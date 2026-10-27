var C="flip-v4",F=["./","index.html","style.css?v=4","app.js?v=4","manifest.webmanifest","icon.svg"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return Promise.all(F.map(function(u){return fetch(new Request(u,{cache:"reload"})).then(function(r){return c.put(u,r)})}))}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){if(e.request.method!=="GET")return;e.respondWith(fetch(e.request,{cache:"no-cache"}).catch(function(){return caches.match(e.request)}))});
