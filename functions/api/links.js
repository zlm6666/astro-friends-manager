// functions/api/links.js
// 返回已通过的友链，严格按指定 JSON 格式
import { getList } from './_utils.js';

export async function onRequestGet({ env }) {
  const ids = await getList(env, 'link:list:approved');
  const out = [];
  for (const id of ids) {
    const r = JSON.parse(await env.LINKS.get(`link:approved:${id}`) || 'null');
    if (!r) continue;
    out.push({
      name: r.title,
      link: r.link,
      avatar: r.avatar,
      descr: r.descr
    });
  }
  return new Response(JSON.stringify(out, null, 2), {
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
