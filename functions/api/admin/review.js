// functions/api/admin/review.js
// 审核操作：approve / reject / delete
import { ok, err, requireAdmin, getList, setList, uploadToTuCang, sendEmail } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);

  let body;
  try { body = await request.json(); } catch { return err('请求体不是 JSON'); }
  const { action, id } = body;
  if (!action || !id) return err('action 和 id 必填');

  if (action === 'approve') {
    const pending = await getList(env, 'link:list:pending');
    if (!pending.includes(id)) return err('记录不存在');
    const record = JSON.parse(await env.LINKS.get(`link:pending:${id}`) || 'null');
    if (!record) return err('记录不存在');

    // 上传头像到图床
    const up = await uploadToTuCang(env, record.avatar);
    if (up.ok) record.avatar = up.url;

    record.approvedAt = new Date().toISOString();

    // 移到 approved
    const approved = await getList(env, 'link:list:approved');
    await env.LINKS.put(`link:approved:${id}`, JSON.stringify(record));
    approved.push(id);
    await setList(env, 'link:list:approved', approved);
    await env.LINKS.delete(`link:pending:${id}`);
    await setList(env, 'link:list:pending', pending.filter(x => x !== id));

    // 通知申请人
    if (record.email) {
      try {
        await sendEmail(env, `【友链通过】${record.title}`,
          `<h2>友链已通过审核 ✅</h2><p>${escapeHtml(record.title)}，您的友链申请已通过！</p><p><a href="${new URL(request.url).origin}/cheak">查看详情</a></p>`,
          record.email);
      } catch (e) { console.error('通过通知失败:', e.message); }
    }

    return ok({ message: '已通过', record });
  }

  if (action === 'reject') {
    const pending = await getList(env, 'link:list:pending');
    if (!pending.includes(id)) return err('记录不存在');
    const record = JSON.parse(await env.LINKS.get(`link:pending:${id}`) || 'null');
    if (!record) return err('记录不存在');
    record.rejectedAt = new Date().toISOString();
    record.rejectReason = body.reason || '';

    const rejected = await getList(env, 'link:list:rejected');
    await env.LINKS.put(`link:rejected:${id}`, JSON.stringify(record));
    rejected.push(id);
    await setList(env, 'link:list:rejected', rejected);
    await env.LINKS.delete(`link:pending:${id}`);
    await setList(env, 'link:list:pending', pending.filter(x => x !== id));

    // 通知申请人
    if (record.email) {
      try {
        const reasonHtml = record.rejectReason ? `<p>原因：${escapeHtml(record.rejectReason)}</p>` : '';
        await sendEmail(env, `【友链未通过】${record.title}`,
          `<h2>友链未通过审核 ❌</h2><p>${escapeHtml(record.title)}，您的友链申请未通过。</p>${reasonHtml}<p><a href="${new URL(request.url).origin}/cheak">查看详情</a></p>`,
          record.email);
      } catch (e) { console.error('拒绝通知失败:', e.message); }
    }

    return ok({ message: '已拒绝' });
  }

  if (action === 'delete') {
    // 删除任何状态的记录
    for (const status of ['pending', 'approved', 'rejected']) {
      const list = await getList(env, `link:list:${status}`);
      if (list.includes(id)) {
        await env.LINKS.delete(`link:${status}:${id}`);
        await setList(env, `link:list:${status}`, list.filter(x => x !== id));
        return ok({ message: '已删除' });
      }
    }
    return err('记录不存在');
  }

  if (action === 'edit') {
    const { data } = body;
    if (!data) return err('缺少 data');
    // 遍历三个状态找到记录
    for (const status of ['pending', 'approved', 'rejected']) {
      const list = await getList(env, `link:list:${status}`);
      if (list.includes(id)) {
        const raw = await env.LINKS.get(`link:${status}:${id}`);
        if (!raw) return err('记录不存在');
        const record = JSON.parse(raw);
        // 更新字段（仅更新传了的）
        if (data.title !== undefined) record.title = data.title.trim();
        if (data.avatar !== undefined) record.avatar = data.avatar.trim();
        if (data.link !== undefined) record.link = data.link.trim();
        if (data.descr !== undefined) record.descr = data.descr.trim();
        if (data.rss !== undefined) record.rss = data.rss.trim();
        record.updatedAt = new Date().toISOString();
        await env.LINKS.put(`link:${status}:${id}`, JSON.stringify(record));
        return ok({ message: '已更新', record });
      }
    }
    return err('记录不存在');
  }

  if (action === 'pin' || action === 'unpin') {
    for (const status of ['pending', 'approved', 'rejected']) {
      const list = await getList(env, `link:list:${status}`);
      if (list.includes(id)) {
        const raw = await env.LINKS.get(`link:${status}:${id}`);
        if (!raw) return err('记录不存在');
        const record = JSON.parse(raw);
        record.pinned = action === 'pin';
        await env.LINKS.put(`link:${status}:${id}`, JSON.stringify(record));
        return ok({ message: action === 'pin' ? '已置顶' : '已取消置顶', record });
      }
    }
    return err('记录不存在');
  }

  return err('未知 action');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
