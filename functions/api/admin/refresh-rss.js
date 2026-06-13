// functions/api/admin/refresh-rss.js
// 手动触发 RSS 更新
import { ok, err, requireAdmin } from '../_utils.js';
import { runRssUpdate } from '../_rss_core.js';

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return err(auth.reason, 401);
  try {
    const result = await runRssUpdate(env);
    return ok({ message: '已更新', result });
  } catch (e) {
    return err('更新失败: ' + e.message);
  }
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
