// Gate: cfhubuk.com / www.cfhubuk.com shows the "Under Construction" page.
// Any other hostname (e.g. the cf-gold.vercel.app deployment alias, other
// Vercel preview URLs, or localhost) renders the site normally.
//
// To bring cfhubuk.com back online WITHOUT a redeploy: set the env var
// FORCE_SITE_LIVE=true in Vercel (Production) — this function reads
// process.env fresh on every request, so the change takes effect
// immediately, no rebuild required.

const GATED_HOSTNAMES = new Set(['cfhubuk.com', 'www.cfhubuk.com']);

export default function handler(req, res) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase().split(':')[0];
  const forceLive = process.env.FORCE_SITE_LIVE === 'true';

  const underConstruction = !forceLive && GATED_HOSTNAMES.has(host);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(underConstruction ? 'CF_HUB_UNDER_CONSTRUCTION' : 'OK');
}
