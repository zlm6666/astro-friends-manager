// functions/api/status.js
import { ok, err, getList, globalRateLimit } from './_utils.js';

export async function onRequestGet({ request, env }) {
  if (!(await globalRateLimit(env, 'status', 100, 60))) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return err('查询参数 q 必填');

  const pending = await getList(env, 'link:list:pending');
  const approved = await getList(env, 'link:list:approved');
  const rejected = await getList(env, 'link:list:rejected');

  const match = (r) => r && (r.title.includes(q) || r.link.includes(q));
  const scan = async (list, status) => {
    const out = [];
    for (const id of list) {
      const r = JSON.parse(await env.LINKS.get(`link:${status}:${id}`) || 'null');
      if (match(r)) out.push({ status, record: r });
    }
    return out;
  };

  const items = [
    ...(await scan(pending, 'pending')),
    ...(await scan(approved, 'approved')),
    ...(await scan(rejected, 'rejected'))
  ];

  return items.length
    ? ok({ items })
    : ok({ items: [], message: '未找到匹配记录' });
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
