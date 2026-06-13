// functions/api/admin/rss-status.js
import { ok, err, requireAdmin } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);
  const cursor = await env.LINKS.get('rss:cursor') || '0';
  const lastUpdate = await env.LINKS.get('rss:lastUpdate');
  const current = await env.LINKS.get('rss:feeds:current');
  const articles = JSON.parse(await env.LINKS.get('rss:articles') || '[]');
  return ok({
    cursor: parseInt(cursor, 10),
    lastUpdate,
    currentFeeds: current ? JSON.parse(current) : [],
    articleCount: articles.length
  });
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
