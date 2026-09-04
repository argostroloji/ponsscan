// Serves index.html with token-specific Open Graph tags for /?token=0x…
// so shared links unfurl with the token's own card (see /api/og).
import fs from 'fs';
import path from 'path';

const ADDR = /^0x[0-9a-f]{40}$/;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtUsd = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? '$' + Math.round(v).toLocaleString('en-US') : '$' + Math.round(v);

let cachedHtml = null;
function loadHtml() {
  if (!cachedHtml) cachedHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');
  return cachedHtml;
}

async function tokenInfo(token) {
  try {
    const r = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + token, { signal: AbortSignal.timeout(4000) });
    const d = await r.json();
    const own = (d.pairs || [])
      .filter(p => (p.baseToken && p.baseToken.address || '').toLowerCase() === token)
      .sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0));
    const p = own[0];
    if (!p) return null;
    const graduated = ((p.liquidity && p.liquidity.usd) || 0) > 1000; // curve-phase pools carry bogus prices
    return {
      symbol: p.baseToken.symbol, name: p.baseToken.name, graduated,
      mc: graduated ? (p.marketCap != null ? p.marketCap : p.fdv) : null,
      change: graduated && p.priceChange ? p.priceChange.h24 : null
    };
  } catch { return null; }
}

export default async function handler(req, res) {
  const token = String((req.query && req.query.token) || '').toLowerCase();
  let html = loadHtml();
  if (ADDR.test(token)) {
    const info = await tokenInfo(token);
    const short = token.slice(0, 6) + '…' + token.slice(-4);
    const title = info
      ? `${info.symbol} on pons — ${info.graduated && info.mc != null ? 'MC ' + fmtUsd(info.mc) : 'on the bonding curve'} · PonsScan rug-check`
      : `PonsScan rug-check · ${short}`;
    const desc = info
      ? `${info.name || info.symbol}: ${info.graduated ? 'graduated, pool live' : 'pre-graduation curve'}${info.change != null ? ' · 24h ' + (info.change >= 0 ? '+' : '') + Math.round(info.change) + '%' : ''}. Creator history, holder concentration, dev allocation and an on-chain safety score — free on PonsScan.`
      : 'Creator history, holder concentration, dev allocation and an on-chain safety score for any pons token — free on PonsScan.';
    const img = `https://ponsscan.xyz/api/og?token=${token}`;
    const url = `https://ponsscan.xyz/?token=${token}`;
    const rep = (re, val) => { html = html.replace(re, val); };
    rep(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
    rep(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
    rep(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
    rep(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(url)}">`);
    rep(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(img)}">`);
    rep(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
    rep(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(desc)}">`);
    rep(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${esc(img)}">`);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.status(200).send(html);
}
