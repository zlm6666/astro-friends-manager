// functions/api/admin/blacklist.js
// 黑名单：邮件黑名单 + URL 黑名单
import { ok, err, requireAdmin } from '../_utils.js';

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: '此接口需要 POST 请求' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);

  let body;
  try { body = await request.json(); } catch { return err('请求体不是 JSON'); }
  const { action, type, email, url } = body;
  const blType = type || 'email';

  // ===== 邮件黑名单 =====
  if (blType === 'email') {
    if (action === 'list') {
      const emailRaw = JSON.parse(await env.LINKS.get('config:email') || '{}');
      const adminEmail = emailRaw.to || '';
      const raw = await env.LINKS.get('email-blacklist') || '{}';
      const bl = JSON.parse(raw);
      const list = Object.entries(bl)
        .filter(([e]) => e !== adminEmail)
        .map(([email, count]) => ({ email, blocked: count >= 3, count }));
      return ok({ list });
    }
    if (action === 'reset' && email) {
      const raw = await env.LINKS.get('email-blacklist') || '{}';
      const bl = JSON.parse(raw);
      delete bl[email];
      await env.LINKS.put('email-blacklist', JSON.stringify(bl));
      return ok({ message: `已解除 ${email} 的黑名单` });
    }
    if (action === 'block' && email) {
      const raw = await env.LINKS.get('email-blacklist') || '{}';
      const bl = JSON.parse(raw);
      bl[email] = 3;
      await env.LINKS.put('email-blacklist', JSON.stringify(bl));
      return ok({ message: `已拉黑 ${email}` });
    }
  }

  // ===== URL 黑名单 =====
  if (blType === 'url') {
    if (action === 'list') {
      const raw = await env.LINKS.get('config:url-blacklist') || '[]';
      const list = JSON.parse(raw);
      return ok({ list });
    }
    if (action === 'add' && url) {
      const raw = await env.LINKS.get('config:url-blacklist') || '[]';
      const list = JSON.parse(raw);
      const normalized = url.replace(/\/+$/, '').toLowerCase();
      if (!list.includes(normalized)) {
        list.push(normalized);
        await env.LINKS.put('config:url-blacklist', JSON.stringify(list));
      }
      return ok({ message: `已添加 ${url}` });
    }
    if (action === 'remove' && url) {
      const raw = await env.LINKS.get('config:url-blacklist') || '[]';
      const list = JSON.parse(raw);
      const filtered = list.filter(u => u !== url.replace(/\/+$/, '').toLowerCase());
      await env.LINKS.put('config:url-blacklist', JSON.stringify(filtered));
      return ok({ message: `已移除 ${url}` });
    }
  }

  return err('缺少参数');
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
