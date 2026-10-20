// superbig-gateway — the CF Pages entry for superbig.jiangjiangze.icu.
//
// The game server runs in a ModelScope container. Page navigations get this site's shell; EVERYTHING else
// (js/css/vendor/data/assets/fonts/icons, /ws, /healthz, /api/*) is proxied to the studio, so the browser sees the
// real bytes instead of the HTML fallback (which is what made the board art and data manifests fail to load).
const ORIGIN = 'https://jingjiangze-stronghold-protocol.ms.show';
const STATIC_PREFIX = /^\/(js|css|vendor|data|assets|fonts|media|icons|packs|shared|schemas)\//;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const wantsHtml = (req.headers.get('accept') || '').includes('text/html');
    const isStatic = STATIC_PREFIX.test(url.pathname);
    const isApi = url.pathname === '/ws' || url.pathname === '/healthz' || url.pathname.startsWith('/api/');
    if (wantsHtml && !isStatic && !isApi) return env.ASSETS.fetch(req);

    const target = new URL(url.pathname + url.search, ORIGIN);
    const headers = new Headers(req.headers);
    headers.set('host', new URL(ORIGIN).host);
    const upstream = await fetch(target, {
      method: req.method, headers, body: req.body, redirect: 'manual',
    });
    const out = new Response(upstream.body, upstream);
    out.headers.set('access-control-allow-origin', '*');
    return out;
  },
};
