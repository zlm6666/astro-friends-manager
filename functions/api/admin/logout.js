// functions/api/admin/logout.js
import { ok, parseCookies, clearSessionCookie } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const cookies = parseCookies(request);
  const token = cookies['admin_token'];
  if (token) await env.LINKS.delete(`session:${token}`);
  return new Response(JSON.stringify({ success: true }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': clearSessionCookie()
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
