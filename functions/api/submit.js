// functions/api/submit.js
import { ok, err, validateLink, genId, getList, setList, sendEmail } from './_utils.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err('请求体不是合法 JSON');
  }
  const errors = validateLink(body);
  if (errors.length) return err('校验失败', 400, { errors });

  // 防止重复：按 link 去重（待审核 + 已通过）
  const pending = await getList(env, 'link:list:pending');
  const approved = await getList(env, 'link:list:approved');
  for (const id of pending) {
    const r = await env.LINKS.get(`link:pending:${id}`);
    if (r) {
      const obj = JSON.parse(r);
      if (obj.link === body.link.trim()) return err('该链接已有待审核申请');
    }
  }
  for (const id of approved) {
    const r = await env.LINKS.get(`link:approved:${id}`);
    if (r) {
      const obj = JSON.parse(r);
      if (obj.link === body.link.trim()) return err('该链接已存在友链');
    }
  }

  const id = genId();
  const record = {
    id,
    title: body.title.trim(),
    avatar: body.avatar.trim(),
    link: body.link.trim(),
    descr: body.descr.trim(),
    rss: (body.rss || '').trim(),
    email: (body.email || '').trim(),
    createdAt: new Date().toISOString()
  };
  await env.LINKS.put(`link:pending:${id}`, JSON.stringify(record));
  pending.push(id);
  await setList(env, 'link:list:pending', pending);

  // 通知管理员
  try {
    const emailCfg = await env.LINKS.get('config:email');
    if (emailCfg) {
      await sendEmail(env, `【新友链申请】${record.title}`,
        `<h2>新友链申请</h2>
         <p><b>标题：</b>${escapeHtml(record.title)}</p>
         <p><b>链接：</b><a href="${record.link}">${record.link}</a></p>
         <p><b>头像：</b><a href="${record.avatar}">${record.avatar}</a></p>
         <p><b>描述：</b>${escapeHtml(record.descr)}</p>
         <p><b>RSS：</b>${record.rss ? `<a href="${record.rss}">${record.rss}</a>` : '未提供'}</p>
         <p><b>邮箱：</b>${record.email || '未提供'}</p>
         <p><a href="${new URL(request.url).origin}/admin">前往审核</a></p>`);
    }
  } catch (e) {
    console.error('通知邮件发送失败:', e.message);
  }

  return ok({ id, message: '申请已提交，请等待审核' });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
