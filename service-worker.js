// Service Worker do painel Biobel — permite abrir o sistema mesmo sem internet.
//
// IMPORTANTE: usa estratégia "rede primeiro, cache por último recurso". Isso é de propósito —
// esse sistema recebe atualizações com frequência, e um cache "cache primeiro" deixaria as
// pessoas presas numa versão antiga sem perceber. Com essa estratégia, sempre que tiver
// internet, a versão mais nova é buscada e exibida; o cache só entra em ação quando o
// aparelho está genuinamente sem conexão.

const CACHE_NAME = 'biobel-cache-v1';
const ARQUIVOS_ESSENCIAIS = ['./dashboard.html', './login.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Só mexe em pedidos GET pras páginas do próprio site — tudo que for de outro domínio
  // (Google Sheets, CDNs de bibliotecas, etc.) passa direto, sem interferência nenhuma.
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        // Conseguiu buscar online — guarda uma cópia fresca no cache, pra ficar disponível
        // se um dia faltar internet, e devolve a versão mais nova de verdade.
        const respostaClone = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respostaClone));
        return resposta;
      })
      .catch(() => {
        // Sem internet — tenta achar uma cópia salva antes, pra não ficar com a tela em branco.
        return caches.match(event.request);
      })
  );
});
