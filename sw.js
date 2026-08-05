const C="sisl-v4-firebase";
const ASSETS=[
  "./","./index.html","./app.js","./manifest.json","./icon.svg",
  "./Momo Strikers Logo.png","./Momo Strikers Jersey.png",
  "./No Stamina Hustlers Logo.png","./No Stamina Hustlers Jersey.png",
  "./Jhyap Warriors Logo.png","./Jhyap Warriors Jersey.png"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(C).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin===location.origin && (url.pathname.endsWith("/index.html") || url.pathname.endsWith("/app.js") || url.pathname.endsWith("/sw.js") || url.pathname.endsWith("/"))) {
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(C).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(url.origin===location.origin){const copy=response.clone();caches.open(C).then(cache=>cache.put(event.request,copy));}return response;})));
});
