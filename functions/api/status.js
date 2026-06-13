// functions/api/status.js
import { ok, err, getList } from './_utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return err('查询参数 q 必填');

  const pending = await getList(env, 'link:list:pending');
  const approved = await getList(env, 'link:list:approved');
  const rejected = await getList(env, 'link:list:rejected');

  const match = (r) => r && (r.title.includes(q) || r.link.includes(q));

  for (const id of pending) {
    const r = JSON.parse(await env.LINKS.get(`link:pending:${id}`) || 'null');
    if (match(r)) return ok({ status: 'pending', record: r });
  }
  for (const id of approved) {
    const r = JSON.parse(await env.LINKS.get(`link:approved:${id}`) || 'null');
    if (match(r)) return ok({ status: 'approved', record: r });
  }
  for (const id of rejected) {
    const r = JSON.parse(await env.LINKS.get(`link:rejected:${id}`) || 'null');
    if (match(r)) return ok({ status: 'rejected', record: r });
  }

  return ok({ status: 'not_found', message: '未找到该申请记录' });
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
