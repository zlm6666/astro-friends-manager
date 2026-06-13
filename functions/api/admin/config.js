// functions/api/admin/config.js
// 邮件配置（MailChannels）+ 图床配置
import { ok, err, requireAdmin } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);
  const email = JSON.parse(await env.LINKS.get('config:email') || 'null');
  const tuCang = JSON.parse(await env.LINKS.get('config:tuCang') || 'null');
  // 掩码 token
  const safe = (obj) => obj ? { ...obj, token: obj.token ? '******' : '' } : null;
  return ok({ email: email || null, tuCang: safe(tuCang) });
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);

  let body;
  try { body = await request.json(); } catch { return err('请求体不是 JSON'); }
  const { type, data } = body;

  if (type === 'email') {
    if (!data.from || !data.to) return err('发件邮箱和收件邮箱必填');
    await env.LINKS.put('config:email', JSON.stringify({
      from: data.from.trim(),
      fromName: (data.fromName || '').trim(),
      to: data.to.trim()
    }));
    return ok({ message: '邮件配置已保存' });
  }

  if (type === 'tucang') {
    if (data.token === '******') {
      const old = JSON.parse(await env.LINKS.get('config:tuCang') || '{}');
      data.token = old.token || '';
    }
    if (!data.token || !data.folderId) return err('token 和 folderId 必填');
    await env.LINKS.put('config:tuCang', JSON.stringify(data));
    return ok({ message: '图床配置已保存' });
  }

  return err('未知 type');
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
