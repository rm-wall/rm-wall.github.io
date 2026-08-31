const CACHE_NAME = 'portfolio-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/favicon.svg',
  '/images/angular.svg',
  '/images/ansible.svg',
  '/images/aws.svg',
  '/images/bash.svg',
  '/images/c.svg',
  '/images/cert-aws-ans.png',
  '/images/cert-aws-saa.png',
  '/images/cert-aws-sap.png',
  '/images/cert-aws-scs.png',
  '/images/cert-aws-soa.png',
  '/images/cert-cka.png',
  '/images/cert-cks.png',
  '/images/cert-comptia-csap.png',
  '/images/cert-cysa-plus.png',
  '/images/cert-itil.png',
  '/images/cert-sec-plus.png',
  '/images/cert-toeic.svg',
  '/images/claude-code.svg',
  '/images/codex.svg',
  '/images/cplusplus.svg',
  '/images/docker.svg',
  '/images/gemini.svg',
  '/images/github.svg',
  '/images/go.svg',
  '/images/grafana.svg',
  '/images/grok.svg',
  '/images/grpc.svg',
  '/images/java.svg',
  '/images/jenkins.svg',
  '/images/kotlin.svg',
  '/images/kubernetes.svg',
  '/images/linux.svg',
  '/images/macos.svg',
  '/images/mysql.svg',
  '/images/postgresql.svg',
  '/images/python.svg',
  '/images/react.svg',
  '/images/redis.svg',
  '/images/spring.svg',
  '/images/terraform.svg',
  '/images/typescript.svg',
  '/images/zsh.svg'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // addAll rejects the whole install if a single entry fails, which would
        // leave the site with no cache at all. Add each entry independently.
        return Promise.allSettled(urlsToCache.map(url => cache.add(url)))
          .then(results => {
            const failed = results
              .map((r, i) => (r.status === 'rejected' ? urlsToCache[i] : null))
              .filter(Boolean);
            if (failed.length) {
              console.warn('Service Worker could not pre-cache:', failed);
            }
          });
      })
  );
});

// 拦截请求，优先从网络获取
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 检查是否是有效响应
        if (response && response.status === 200 && response.type === 'basic') {
          // 克隆响应用于缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存读取
        return caches.match(event.request);
      })
  );
});

// 更新 Service Worker 时清除旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
