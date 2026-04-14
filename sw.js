const CACHE_NAME = 'scanner-pwa-cache-v1';
const urlsToCache = [
  './',               // 快取根目錄
  './Code.html',     // 快取主程式
  './manifest.json',  // 快取設定檔
  // 【關鍵】強制快取外部的相機掃描套件，確保斷網也能載入
  'https://unpkg.com/html5-qrcode' 
];

// 安裝階段：將指定檔案寫入本地快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截請求階段：當斷網時，優先從快取提取檔案
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取裡有這個檔案，直接回傳快取版本 (斷網時的救星)
        if (response) {
          return response;
        }
        // 如果快取沒有，才嘗試透過網路抓取
        return fetch(event.request);
      })
  );
});

// 啟動階段：清理舊版本快取 (系統更新用)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
