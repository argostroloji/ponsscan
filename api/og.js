// Dynamic Open Graph card (1200×630) for a pons token — /api/og?token=0x…
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const ADDR = /^0x[0-9a-f]{40}$/;
const fmtUsd = v => v >= 1e6 ? '$' + (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? '$' + Math.round(v).toLocaleString('en-US') : '$' + (v >= 1 ? Math.round(v) : v);
const h = (type, props, ...children) => ({ type, props: { ...(props || {}), children: children.length === 1 ? children[0] : children } });

async function tokenInfo(token) {
  try {
    const r = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + token, { signal: AbortSignal.timeout(4000) });
    const d = await r.json();
    const own = (d.pairs || [])
      .filter(p => (p.baseToken && p.baseToken.address || '').toLowerCase() === token)
      .sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0));
    const p = own[0];
    if (!p) return null;
    const graduated = ((p.liquidity && p.liquidity.usd) || 0) > 1000;
    return {
      symbol: String(p.baseToken.symbol || '?'), name: String(p.baseToken.name || ''), graduated,
      price: graduated && p.priceUsd ? parseFloat(p.priceUsd) : null,
      change: graduated && p.priceChange && p.priceChange.h24 != null ? Number(p.priceChange.h24) : null,
      liq: graduated && p.liquidity ? Number(p.liquidity.usd) : null,
      mc: graduated ? (p.marketCap != null ? Number(p.marketCap) : (p.fdv != null ? Number(p.fdv) : null)) : null,
      image: p.info && typeof p.info.imageUrl === 'string' && /^https:\/\//.test(p.info.imageUrl) ? p.info.imageUrl : null
    };
  } catch { return null; }
}

function buildTree(token, valid, info) {
  const short = valid ? token.slice(0, 6) + '…' + token.slice(-4) : '';
  const symbol = info ? info.symbol : (valid ? short : 'PonsScan');
  const initials = symbol.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
  const hue = valid ? parseInt(token.slice(2, 8), 16) % 360 : 150;
  const up = info && info.change != null && info.change >= 0;

  const stat = (label, value, color) => h('div', { style: { display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0, padding: '22px 26px', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)' } },
    h('div', { style: { display: 'flex', fontSize: 22, color: '#8fa89b', marginBottom: 8 } }, label),
    h('div', { style: { display: 'flex', fontSize: 40, fontWeight: 700, color: color || '#ffffff' } }, value)
  );
  const gap = () => h('div', { style: { display: 'flex', width: 18 } });

  const logo = info && info.image
    ? h('img', { src: info.image, width: 132, height: 132, style: { width: 132, height: 132, borderRadius: 66 } })
    : h('div', { style: { display: 'flex', width: 132, height: 132, borderRadius: 66, alignItems: 'center', justifyContent: 'center', backgroundColor: `hsl(${hue}, 55%, 42%)`, fontSize: 52, fontWeight: 700, color: '#ffffff' } }, initials);

  const status = info
    ? (info.graduated
        ? h('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, color: '#0b1a12', backgroundColor: '#3fe39c', padding: '8px 18px', borderRadius: 999 } }, 'GRADUATED · POOL LIVE')
        : h('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, color: '#d7e6de', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: 999 } }, 'ON THE BONDING CURVE'))
    : h('div', { style: { display: 'flex', fontSize: 22, color: '#8fa89b' } }, valid ? 'Not indexed yet' : 'Independent pons launchpad analytics');

  const stats = info && info.graduated ? [
    stat('Price', info.price != null ? '$' + info.price.toPrecision(3) : '—'), gap(),
    stat('24h', info.change != null ? (up ? '+' : '') + Math.round(info.change) + '%' : '—', info.change != null ? (up ? '#3fe39c' : '#ff6b6b') : '#ffffff'), gap(),
    stat('Liquidity', info.liq != null ? fmtUsd(info.liq) : '—'), gap(),
    stat('Market cap', info.mc != null ? fmtUsd(info.mc) : '—')
  ] : [
    stat('Status', info ? 'Pre-graduation' : (valid ? 'Awaiting index' : 'Live analytics')), gap(),
    stat('On PonsScan', info ? 'Curve progress · creator record' : 'Rug-check · creators · graduations')
  ];

  return h('div', { style: { display: 'flex', flexDirection: 'column', width: 1200, height: 630, padding: 56, backgroundColor: '#0a0f0c', backgroundImage: 'linear-gradient(135deg, #0f1d15 0%, #0a0f0c 55%, #07090a 100%)', color: '#ffffff' } },
    h('div', { style: { display: 'flex', alignItems: 'center', width: '100%' } },
      logo,
      h('div', { style: { display: 'flex', flexDirection: 'column', marginLeft: 30, flexGrow: 1 } },
        h('div', { style: { display: 'flex', fontSize: 76, fontWeight: 800 } }, symbol),
        h('div', { style: { display: 'flex', fontSize: 28, color: '#a9c4b6', marginTop: 8 } }, info ? (info.name && info.name !== info.symbol ? info.name : 'pons token') : (valid ? 'pons token · ' + short : 'ponsscan.xyz'))
      ),
      status
    ),
    h('div', { style: { display: 'flex', marginTop: 44, width: '100%' } }, ...stats),
    h('div', { style: { display: 'flex', flexGrow: 1 } }),
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' } },
      h('div', { style: { display: 'flex', flexDirection: 'column' } },
        h('div', { style: { display: 'flex', fontSize: 30, fontWeight: 700, color: '#3fe39c' } }, 'ponsscan.xyz'),
        h('div', { style: { display: 'flex', fontSize: 22, color: '#8fa89b', marginTop: 4 } }, 'Rug-check · creator record · holder concentration · dev allocation')
      ),
      h('div', { style: { display: 'flex', alignItems: 'center' } },
        h('div', { style: { display: 'flex', width: 54, height: 54, borderRadius: 14, backgroundColor: '#12b06c', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#06110b' } }, 'PS'),
        h('div', { style: { display: 'flex', fontSize: 30, fontWeight: 800, marginLeft: 14 } }, 'ponsscan')
      )
    )
  );
}

export default async function handler(req) {
  const url = new URL(req.url);
  const token = (url.searchParams.get('token') || '').toLowerCase();
  const debug = url.searchParams.get('debug') === '1';
  const valid = ADDR.test(token);
  const info = valid ? await tokenInfo(token) : null;
  try {
    const tree = buildTree(token, valid, info);
    // render eagerly so failures surface as errors instead of an empty 200 stream
    const img = new ImageResponse(tree, { width: 1200, height: 630 });
    const buf = await img.arrayBuffer();
    return new Response(buf, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } });
  } catch (e) {
    const msg = 'og render failed: ' + (e && e.message ? e.message : String(e));
    return new Response(debug ? msg + '\n' + (e && e.stack || '') : msg, { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
}
