// オフライン時の表示用。通常は常に最新のファイルを取得し、取得できないときだけ保存済みを使います（同じサイトのファイルのみ）。
const CACHE="terroirmap-v1";
self.addEventListener("install",()=>{self.skipWaiting();});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  if(new URL(req.url).origin!==self.location.origin)return;
  e.respondWith(
    fetch(req,{cache:"no-cache"}).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req))
  );
});
