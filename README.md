# 🪐 Astro Friends Manager

> 专为 **Astro 框架 + vh-astro 主题** 打造的友链管理系统，特殊兼容 **Qexo 返回格式**。  
> 基于 Cloudflare Pages，零成本运行。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zlm6666/astro-friends-manager)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## 🎯 为什么用这个？

vh-astro 主题的友链通过 API 拉取，这个系统提供两个接口：

| 接口 | 格式 | 用途 |
|------|------|------|
| `/api/links` | 标准 JSON 数组 | 大多数主题 |
| `/api/links-qexo` | `{ data: [], status: true }` | **Qexo / vh-astro 专用** |
| `/pub/friends` | 同 links-qexo | Qexo 配置时的短路径 |

vh-astro 主题在 Qexo 配置里填 `/pub/friends`，直接无缝对接。

---

## ✨ 功能一览

| 页面 | 功能 |
|------|------|
| 🏠 `/` | 访客提交友链（表单 + 一键导入 YAML/JSON） |
| 🔍 `/cheak` | 查询审核状态 |
| 🔐 `/admin` | 审核、编辑、置顶、邮件/RSS/图床/AI 配置 |
| 🔗 `/api/links` | 已通过友链（标准格式） |
| 🎯 `/api/links-qexo` | Qexo 兼容格式 |
| 📡 `/api/rss` | 友链文章聚合 |

---

## 🚀 一键部署

点击上面的 **Deploy to Cloudflare** 按钮，授权 GitHub 后自动创建项目。

> 如果按钮打不开，手动步骤👇

### 手动部署

1. Fork 本仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git
3. 选你 Fork 的仓库，Build settings：
   - Framework preset: **None**
   - Build command: 留空
   - Output directory: **`public`**
4. Deploy

### 必须配 KV

1. Cloudflare → Workers & Pages → KV → 创建命名空间 `friend-links`
2. 回到 Pages 项目 → Settings → Functions → KV bindings
3. 变量名: **`LINKS`**，选 `friend-links`
4. ⚠️ **Production 和 Preview 各绑一次**

### 环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CRON_SECRET` | 随意乱码 | 保护定时任务 |

---

## 🔧 vh-astro 主题对接

在 Astro 项目的 Qexo 配置中：

```yaml
# vh-astro 主题配置
qexo:
  url: https://你的域名.pages.dev/pub/friends
```

系统返回 Qexo 兼容格式：
```json
{
  "data": [
    {
      "name": "笑的博客",
      "link": "https://www.xiaow.qzz.io",
      "avatar": "https://wp-cdn.4ce.cn/v2/xxx.jpeg",
      "descr": "随性收拢生活散落的笑意"
    }
  ],
  "status": true
}
```

---

## 📧 邮件通知（可选）

- SMTP 直连：QQ 邮箱等，配置后有人申请会发邮件通知
- Resend API：免费 100 封/天

---

## 🖼️ 图床（可选）

审核通过时自动上传头像到 TuCang 图床，防止对方头像挂了。

---

## 🤖 AI 解析（可选）

一键导入粘贴的非标准格式，DeepSeek AI 兜底转成标准格式填入表单。不配也能用——标准 YAML/JSON 前端直接解析。

---

## 📡 RSS 定时刷新

用 [cron-job.org](https://cron-job.org) 免费触发：
- URL: `https://你的域名/api/cron/refresh`
- Header: `X-Cron-Secret: 你设的 CRON_SECRET`
- 建议每 4 小时一次

---

## 📄 License

MIT
