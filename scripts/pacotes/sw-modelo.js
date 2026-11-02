// Service worker do NISIALAND (gerado no build; versão __VERSAO__).
// Guarda no aparelho o que cada nível usa: telas, imagens, texturas 3D e vozes.
//   • Arquivos com nome único (telas do build e vozes): ficam guardados entre versões.
//   • Imagens e demais arquivos: guardados por versão (uma nova publicação renova).
//   • Página e listas (pacotes.json, indice.json): sempre da rede quando houver internet.
const VERSAO = '__VERSAO__';
const FIXO = 'nisialand-fixo';
const DA_VERSAO = 'nisialand-' + VERSAO;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== FIXO && k !== DA_VERSAO) await caches.delete(k);
    await self.clients.claim();
  })());
});

const imutavel = p => /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(js|css)$/.test(p) || /^\/assets\/vozes\/[0-9a-f]{8}\.mp3$/.test(p);
const daRede = p => p === '/pacotes.json' || p.endsWith('/indice.json') || p.endsWith('/manifesto.json');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return; // vídeos e áudios em partes: deixa com o navegador
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(DA_VERSAO).then(x => x.put('/index.html', c)); return r; })
      .catch(async () => (await caches.match('/index.html')) || Response.error()));
    return;
  }
  if (daRede(url.pathname)) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(DA_VERSAO).then(x => x.put(req, c)); return r; }).catch(async () => (await caches.match(req)) || Response.error()));
    return;
  }
  if (!url.pathname.startsWith('/assets/')) return;
  const nome = imutavel(url.pathname) ? FIXO : DA_VERSAO;
  e.respondWith((async () => {
    const guardado = await caches.match(req);
    if (guardado) return guardado;
    const r = await fetch(req);
    if (r.ok && r.status === 200) { const c = r.clone(); (await caches.open(nome)).put(req, c); }
    return r;
  })());
});
