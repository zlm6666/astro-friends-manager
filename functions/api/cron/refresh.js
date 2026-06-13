// functions/api/cron/refresh.js
// 外部定时任务调用：每 30 分钟由 cron-job.org 触发
// 鉴权：Header X-Cron-Secret 与环境变量 CRON_SECRET 匹配
import { ok, err } from '../_utils.js';
import { runRssUpdate } from '../_rss_core.js';

export async function onRequestPost({ request, env }) {
  const secret = request.headers.get('X-Cron-Secret');
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return err('未授权', 401);
  }
  try {
    const result = await runRssUpdate(env);
    return ok({ message: 'Cron 触发成功', result });
  } catch (e) {
    return err('Cron 执行失败: ' + e.message);
  }
}

export async function onRequestGet({ request, env }) {
  // 也支持 GET，方便 cron-job.org GET 模式
  return onRequestPost({ request, env });
}

export async function onRequestOptions() { return new Response(null, { status: 204 }); }
