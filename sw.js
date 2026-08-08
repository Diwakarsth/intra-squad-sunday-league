const C="issl-v1.0.0";
const ASSETS=[
  "./","./index.html","./app.js","./version.json","./manifest.json","./icon.svg","./league-logo.png",
  "./app-icon-192.png","./app-icon-512.png","./favicon-64.png","./Momo Strikers Logo.png","./Momo Strikers Jersey.png",
  "./No Stamina Hustlers Logo.png","./No Stamina Hustlers Jersey.png",
  "./Jhyap Warriors Logo.png","./Jhyap Warriors Jersey.png"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(e.request.mode==="navigate" || url.pathname.endsWith("/app.js") || url.pathname.endsWith("/index.html")){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting();});
