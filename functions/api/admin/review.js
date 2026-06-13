// functions/api/admin/review.js
// 审核操作：approve / reject / delete
import { ok, err, requireAdmin, getList, setList, uploadToTuCang } from '../_utils.js';

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

  return err('未知 action');
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
