// functions/api/admin/change-password.js
import { ok, err, requireAdmin, hashPassword, verifyPassword } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);

  let body;
  try { body = await request.json(); } catch { return err('请求体不是 JSON'); }
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) return err('原密码和新密码必填');
  if (newPassword.length < 6) return err('新密码至少 6 位');

  const cfg = JSON.parse(await env.LINKS.get('config:admin') || '{}');
  const valid = await verifyPassword(oldPassword, cfg.passHash);
  if (!valid) return err('原密码错误', 403);

  cfg.passHash = await hashPassword(newPassword);
  await env.LINKS.put('config:admin', JSON.stringify(cfg));
  return ok({ message: '密码已更新' });
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
