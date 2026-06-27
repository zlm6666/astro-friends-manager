**2. 在 Cloudflare Pages 部署**
创建新项目→点下方的`想要部署 Pages？开始使用`，再点连接到git

![Cloudflare Pages 配置页面](https://img.tucang.cc/api/image/show/33d7271451a582172efe92e6a6009c9a)
- 连接你 fork 的仓库
- 构建命令：留空
- 构建输出目录：`public`

**3. 创建 KV 命名空间**
在侧边栏 → 存储和数据库 → KV 中创建命名空间 `friend-links`，然后在 Pages 项目 → Settings → Functions → KV namespace bindings 中绑定：
```
变量名：LINKS
KV 命名空间：friend-links
```
![KV 绑定配置页面](https://img.tucang.cc/api/image/show/51ae9c1ec8fd8bccd7bbb1b2888068c1)

**4. 配置环境变量**
在 Pages 项目 → Settings → Environment variables 中添加：

| 变量 | 必填 | 说明 |
|------|------|------|
| `BLOG_URL` | ✅ | `https://你的博客域名`，邮件中的友链链接和 RSS 用 |
| `SITE_DOMAIN` | ✅ | `friends.你的域名`，Referer 来源校验，防 API 直调 |
| `CRON_SECRET` | 推荐 | 随机密钥，保护 cron 接口 |

**5. 登录管理后台**
部署成功后访问 `你的域名/admin`，默认账号 `admin`，密码 `123456`，首次登录强制改密码。

**6. 配置邮件发送（可选）**
部署完成后进入后台 → 邮件选项卡，配置 Resend 或 SMTP 信息。

**7. 设置 cron 定时任务（可选）**
如果需要 RSS 自动更新，在 cron-job.org 设置每 4 小时 POST 到：
```text
https://你的域名/api/cron/refresh
Header: X-Cron-Secret: 环境变量 CRON_SECRET 的值
```
