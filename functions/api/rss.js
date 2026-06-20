// functions/api/rss.js
// RSS 聚合 API：直接返回 KV 缓存的 20 篇文章（格式严格按原代码）
import { ok, err, globalRateLimit } from './_utils.js';

export async function onRequestGet({ env, request }) {
  if (!(await globalRateLimit(env, 'rss', 40, 60))) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  const raw = await env.LINKS.get('rss:articles');
  const articles = raw ? JSON.parse(raw) : [];
  // 去掉 internal 字段，只返回标准格式
  const clean = articles.map(({ isoDate, sourceFeedTitle, ...rest }) => rest);
  return new Response(JSON.stringify(clean, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=7200, s-maxage=14400'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }
  });
}
