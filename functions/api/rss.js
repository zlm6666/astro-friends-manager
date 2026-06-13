// functions/api/rss.js
// RSS 聚合 API：直接返回 KV 缓存的 20 篇文章（格式严格按原代码）
import { ok, err } from './_utils.js';

export async function onRequestGet({ env }) {
  const raw = await env.LINKS.get('rss:articles');
  const articles = raw ? JSON.parse(raw) : [];
  return new Response(JSON.stringify(articles, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=600'
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
