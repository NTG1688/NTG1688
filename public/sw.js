// Service Worker for NTG1688 - Nam Trung Logistics PWA
// Handles push notifications and offline caching

const CACHE_NAME = "ntg1688-v1";
const OFFLINE_URL = "/offline.html";

// Install event: cache critical assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Push notification received
self.addEventListener("push", (event) => {
  let data = { title: "Nam Trung Logistics", body: "Bạn có thông báo mới" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Xem ngay" },
      { action: "close", title: "Đóng" },
    ],
    tag: data.tag || "ntg-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  if (event.action === "close") return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Fetch handler: network-first with cache fallback for navigation requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || new Response(
          "<!DOCTYPE html><html><head><meta charset='utf-8'><title>NTG1688 - Offline</title></head><body style='font-family:sans-serif;text-align:center;padding:60px'><h1>Không có kết nối mạng</h1><p>Vui lòng kiểm tra kết nối internet và thử lại.</p></body></html>",
          { headers: { "Content-Type": "text/html" } }
        );
      })
    );
  }
});
