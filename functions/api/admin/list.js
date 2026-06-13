// functions/api/admin/list.js
// 获取友链列表（按状态过滤）
import { ok, err, requireAdmin, getList } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';

  const key = `link:list:${status}`;
  const ids = await getList(env, key);
  const out = [];
  for (const id of ids) {
    const r = JSON.parse(await env.LINKS.get(`link:${status}:${id}`) || 'null');
    if (r) out.push(r);
  }
  // 倒序（新申请在前）
  out.reverse();
  return ok({ list: out, total: out.length });
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
