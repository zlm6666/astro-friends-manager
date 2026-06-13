// functions/api/admin/test-email.js
// 测试邮件发送
import { ok, err, requireAdmin, sendEmail } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);
  try {
    const cfg = await env.LINKS.get('config:email');
    if (!cfg) return err('请先配置邮件');
    const result = await sendEmail(env, '【测试邮件】友链系统配置成功',
      `<h2>这是一封测试邮件</h2>
       <p>发送时间：${new Date().toISOString()}</p>
       <p>如果你收到这封邮件，说明 Resend 配置正确。</p>`);
    return ok({ message: '测试邮件已发送', id: result?.id });
  } catch (e) {
    return err('发送失败: ' + e.message);
  }
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
