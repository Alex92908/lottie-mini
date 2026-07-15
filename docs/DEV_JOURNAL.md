# lottie-mini 开发与上线过程记录

> 这个文档记录了从设计到部署过程中遇到的所有问题、原因、解决方案,以及待办事项。
> **换电脑或重开会话时先读这个**,免得踩重复的坑。
>
> 最后更新: 2026-07-02

---

## 一、项目当前状态

| 项 | 值 |
|---|---|
| 主站 | https://lottie-mini.com |
| 备用/预览 | https://lottie-mini.vercel.app |
| GitHub | https://github.com/Alex92908/lottie-mini |
| 主分支 | `main` |
| 部署 | Vercel(自动 CI) |
| 域名 Primary | `lottie-mini.com`(apex,**不带 www**) |
| DNS | Cloudflare 托管 |
| 广告 | Google AdSense(审核中) + Carbon Ads |
| 分析 | Vercel Analytics |
| Git 身份 | `Alex <1224717847@qq.com>`(global + local 都锁死) |

---

## 二、站内页面结构(部署后)

```
/                          ← 落地页 = 压缩工具 + Hero + Stats + 8-Q FAQ + Guide 入口   [有 GoogleAd]
/compress                  ← 独立压缩页                                                 [无广告]
/preview                   ← Lottie 并排预览 + 4 段说明                                  [仅 CarbonAd]
/inspect                   ← Lottie JSON 分析 + 编辑器 + 4 段说明                       [仅 CarbonAd]
/guide                     ← 文章索引                                                   [有 GoogleAd]
/guide/why-lottie-files-are-big  ← ~2500 字深度文(双语)                                 [有 GoogleAd]
/guide/best-practices       ← ~2000 字最佳实践(双语)                                    [有 GoogleAd]
/guide/how-it-works         ← ~2200 字技术原理(双语)                                    [有 GoogleAd]
/about                     ← 项目介绍 + 作者身份                                        [无广告]
/privacy                   ← 隐私政策                                                   [无广告]
/terms                     ← 使用条款                                                   [无广告]
/contact                   ← 联系方式                                                   [无广告]
```

所有页面共享 `<Footer />`,包含 4 个法务页链接 + Guide + GitHub + 版权行(含姓名和邮箱)。

---

## 三、遇到的关键问题与解决方案

### 问题 1:换白色主题后页面依然显示黑色

**症状**:改了 `globals.css` 里 `--bg` 为白色后,浏览器里依然黑色。

**原因**:dev server 跑在**主仓库** `/Users/edy/PycharmProjects/lottie-mini/web/`,而我改的是**worktree 副本** `.claude/worktrees/youthful-margulis-c9d069/web/`。两个是不同目录,dev server 看不到 worktree 里的改动。

**解决**:worktree 完成后必须 merge 回主仓库,或者停 dev server 在 worktree 里重启。

**记忆点**:worktree 的所有代码改动最终要 `git merge --ff-only <branch>` 合回 main 才在主仓库生效。

---

### 问题 2:Hydration mismatch 报错

**症状**:控制台报 "A tree hydrated but some attributes of the server rendered HTML didn't match",指向 `<html>` 上的 `data-immersive-translate-page-theme="dark"`。

**原因**:浏览器扩展 **Immersive Translate** 在 React 水合之前给 `<html>` 加了属性,导致 SSR 和客户端 tree 不匹配。

**解决**:在 [web/app/layout.tsx:67](web/app/layout.tsx:67) 给 `<html>` 加 `suppressHydrationWarning`。该属性只对 `<html>` 本身生效,不影响子树,正好覆盖扩展注入的场景。

---

### 问题 3:域名从 `vercel.app` 迁到 `lottie-mini.com`

**处理点**:代码里 10+ 处 hardcode 的 `https://lottie-mini.vercel.app` 全部换成 `https://lottie-mini.com`。涉及:
- `web/app/layout.tsx` 的 `BASE` 常量
- `web/app/sitemap.ts` 的 base
- `web/app/robots.ts` 的 sitemap URL
- 每个 layout.tsx 的 canonical + OG URL
- README badges
- docs/ 里的所有 promotion 稿

**命令模板**(以后再迁域名可复用):
```bash
grep -rln "old-domain" web/ docs/ README*.md
sed -i '' 's|https://old-domain|https://new-domain|g' <files>
```

---

### 问题 4:Git 作者名一直是"Alex朱枝文",要改成"Alex" + qq 邮箱

**症状**:GitHub 上历史 commits author 是 `Alex朱枝文 <alex.zzw@galaxyoversea.com>`,想统一改成 `Alex <1224717847@qq.com>`。

**踩坑**:
1. 只改 global `git config` **不够** —— 某些工具(可能是 Claude Code 环境初始化或 IDE)会**悄悄把 global config 改回旧值**。
2. filter-branch 之后不清 `refs/original/*` 备份,下次再 filter-branch 会因为已有备份存在而失败。
3. filter-branch 无法处理已推送的 remote-tracking ref,必须 force push。

**正确的做法**(现在的最终状态):
```bash
# 同时锁定 global + local(local 覆盖 global,防止 global 被别的工具改回)
git config --global user.name "Alex"
git config --global user.email "1224717847@qq.com"
git config --local user.name "Alex"
git config --local user.email "1224717847@qq.com"

# 清掉上一次 filter-branch 的备份(如果有)
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

# 重写作者身份
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --env-filter '
  if [ "$GIT_AUTHOR_NAME" = "Alex朱枝文" ]; then export GIT_AUTHOR_NAME="Alex"; fi
  if [ "$GIT_COMMITTER_NAME" = "Alex朱枝文" ]; then export GIT_COMMITTER_NAME="Alex"; fi
  if [ "$GIT_AUTHOR_EMAIL" = "alex.zzw@galaxyoversea.com" ]; then export GIT_AUTHOR_EMAIL="1224717847@qq.com"; fi
  if [ "$GIT_COMMITTER_EMAIL" = "alex.zzw@galaxyoversea.com" ]; then export GIT_COMMITTER_EMAIL="1224717847@qq.com"; fi
' --tag-name-filter cat -- --all

# 强推(HTTPS 没配 credential,用 SSH URL)
git push --force git@github.com:Alex92908/lottie-mini.git main
```

**重要**:换电脑后**第一件事**就是设 local config,免得再次被 global 污染。

---

### 问题 5:AdSense 拒绝 #1 — ads.txt "Not found"

**症状**:AdSense 后台一直显示 `Ads.txt status: Not found`,即使 `web/public/ads.txt` 文件早已部署。

**排查路径**:
1. `curl -sL https://www.lottie-mini.com/ads.txt` → 200 OK,内容正确 ✅
2. `curl -sI https://lottie-mini.com/ads.txt` → 308 → www ⚠️

**根因**:AdSense 后台注册的域是**根域** `lottie-mini.com`,但 Vercel 默认把根域 308 跳转到 `www`。Google 的 ads.txt 爬虫**官方文档说会跟跳转,但实操经常不跟**,所以直接判定文件不存在。

**解决**:在 Vercel Dashboard → Settings → Domains 里,把 Primary 换成 apex:
```
之前:  www.lottie-mini.com   Primary
       lottie-mini.com       308 → www

之后:  lottie-mini.com       Primary          ← 根域直接 200
       www.lottie-mini.com   308 → apex        ← www 反过来跳
```

改完之后代码里 canonical / OG URL / sitemap / robots 全部改到根域,避免链接权重分散。

**验证**:
```bash
curl -sI https://lottie-mini.com/ads.txt
# 期望: HTTP/2 200,直接返回,无 Location 头
```

---

### 问题 6:AdSense 拒绝 #2 — "Screens without publisher-content" + "Low value content"

**症状**:AdSense 站点状态从 "Getting ready" 变成 "Needs attention",列出两条违规:
1. Google-served ads on screens without publisher-content(工具页广告违规)
2. Low value content(全站内容不足)

**已做的修复**(仍在等复审):

**针对第 1 条**:
- 从 `/preview` 和 `/inspect` 移除 `<GoogleAd />`(保留 CarbonAd,那个不受 Google 政策管辖)
- 给两个工具页各加了 ~400 字的解释性内容(为什么需要 / 常见工作流 / 隐私说明)

**针对第 2 条**:
- 新建 `/guide` 板块,3 篇长文(双语,每篇 1500-2500 字):
  - Why Lottie files are 70MB
  - Lottie best practices
  - How the compressor works
- 落地页加 8 题 FAQ 板块(~500 字)
- **新建 4 个法务/身份页**:About / Privacy / Terms / Contact(AdSense 的硬门槛)
- 所有页面共享 `<Footer />`,含法务链接 + 版权行(实名 + 邮箱)

**接下来的关键动作**(第二次复审前必做):
1. Google Search Console 加急索引(下面详细写)
2. **等 GSC 显示新页面已索引后**,再点 AdSense 里的 "I confirm I have fixed the issues"
3. **别频繁点复审** —— 冷却时间会加长

---

## 四、Vercel 域名配置(重要!AdSense 依赖此)

当前正确的配置:

```
Vercel Project → Settings → Domains
──────────────────────────────────────────
lottie-mini.com          ↑ Production      ← Primary,ads.txt 从这里直接服务
www.lottie-mini.com      ↳ 308 lottie-mini.com
lottie-mini.vercel.app   ↑ Production      ← 保留,不用改
```

**新加域名时不要**再让 Vercel 默认 apex → www 跳转,否则 AdSense 又要重踩一次。

`tide-now.com` 同样在 AdSense 排队,建议**用同样方式**把 Primary 换成 apex 再申请。

---

## 五、待办清单(优先级从高到低)

### 🔥 立即做(不做的话复审必挂)

1. **在 Google Search Console 手动索引所有新页面**
   - 打开 https://search.google.com/search-console
   - 验证 `lottie-mini.com`(如果还没验证)
   - 用 URL Inspection 逐个提交:
     ```
     https://lottie-mini.com/about
     https://lottie-mini.com/privacy
     https://lottie-mini.com/terms
     https://lottie-mini.com/contact
     https://lottie-mini.com/guide
     https://lottie-mini.com/guide/why-lottie-files-are-big
     https://lottie-mini.com/guide/best-practices
     https://lottie-mini.com/guide/how-it-works
     ```
   - 每个页面点 "Request Indexing",Google 24-48 小时会爬

2. **等 GSC 显示至少 5 个页面已索引** 后,再回 AdSense 点 "I confirm I have fixed the issues"

### ⏳ 一周内做

3. 观察 AdSense 后台,如果 3-5 天内复审依然拒绝,考虑升级到 B/C 方案:
   - **B 方案**:再加 3-5 篇长文(比如 "Lottie vs GIF vs MP4"、"How to embed Lottie in React")
   - **C 方案**:B + 每篇加真人化的作者署名区块 + 站内交叉引用

4. `tide-now.com` 的 Vercel 也做同样的 apex-primary 改造

### 🎯 有余力时做

5. **推广**(见 [docs/PROMOTION.md](./PROMOTION.md)):
   - 即刻 → 掘金 → Twitter/X → Show HN → Reddit → 小红书 → 少数派
   - 每个平台稿子都写好了,按 PROMOTION.md 的顺序和节奏发
   - Show HN 只有一次机会,发前务必准备好(周二~周四 8-10am PT)

6. 录制**对比 GIF**(70MB → 820KB),各平台推广都用得上

7. 修复 `examples/before.json`(70MB)超 GitHub 建议大小的警告,可以用 lottie-mini 自己压一下再传

---

## 六、快速命令参考

### Git identity(换电脑后立刻做)
```bash
cd <repo>
git config --local user.name "Alex"
git config --local user.email "1224717847@qq.com"
```

### 推送(HTTPS 没配 credential,用 SSH)
```bash
git push git@github.com:Alex92908/lottie-mini.git main
# force push:
git push --force git@github.com:Alex92908/lottie-mini.git main
```

### 本地验证构建
```bash
cd web && npx next build
```

### 检查 ads.txt
```bash
curl -sI https://lottie-mini.com/ads.txt   # 期望 200 直接返回
curl -sL https://lottie-mini.com/ads.txt   # 期望内容正确
```

### 检查全站 www 引用
```bash
grep -rln "www.lottie-mini" web/ docs/ README*.md
# 期望空输出
```

---

## 七、常见误区提醒

- ❌ **不要点 AdSense 复审两次以上**(短期内),会加长冷却
- ❌ **不要在 Vercel 让 apex 跳转到 www**(AdSense ads.txt 会失败)
- ❌ **不要只设 global git config**(会被别的工具改回),必须同时设 local
- ❌ **不要在 next-env.d.ts 上 commit 改动**(Next 每次 dev server 启动都会重写它)
- ❌ **不要以为 `<Link>` 会硬导航**(是软导航,模块单例 handoff 因此能工作)
- ❌ **不要再引入 www.** —— 全站已经统一到根域,SEO / OG / canonical 全一致

---

## 八、核心代码位置(方便快速定位)

| 功能 | 文件 |
|---|---|
| 压缩管线 | [web/lib/lottie-compress.ts](../web/lib/lottie-compress.ts) |
| Inspector 分析核心 | [web/lib/inspect.ts](../web/lib/inspect.ts) |
| JSON patch/undo/redo 系统 | [web/lib/json-patch.ts](../web/lib/json-patch.ts) |
| Lottie 校验 | [web/lib/lottie-validate.ts](../web/lib/lottie-validate.ts) |
| dotLottie 解压/重打包 | [web/lib/dotlottie.ts](../web/lib/dotlottie.ts) |
| 跨页文件 handoff(内存单例) | [web/lib/handoff.ts](../web/lib/handoff.ts) |
| 语言 Context | [web/lib/LangContext.tsx](../web/lib/LangContext.tsx) |
| 页面级 SEO 元数据 | 每个 `web/app/*/layout.tsx` |
| 共享 Footer | [web/components/Footer.tsx](../web/components/Footer.tsx) |
| Sitemap | [web/app/sitemap.ts](../web/app/sitemap.ts) |
| Robots | [web/app/robots.ts](../web/app/robots.ts) |
| ads.txt | [web/public/ads.txt](../web/public/ads.txt) |

---

## 九、AdSense 复审判定要点(经验总结)

Google 评审员看什么:

1. **合规必备页齐全** ✅ 已加(About / Privacy / Terms / Contact)
2. **有真实作者身份** ✅ 已加(About 页 + Footer 版权行)
3. **可联系** ✅ 已加(邮箱 alex.chu0206@gmail.com + GitHub)
4. **实质编辑内容(非纯工具)** ✅ 已加(3 篇 Guide 长文 + FAQ)
5. **广告位在有内容的页面** ✅ 已改(仅 landing + guide 有 GoogleAd)
6. **ads.txt 直接可访问** ✅ 已改(Vercel apex primary)
7. **canonical URL 一致** ✅ 已改(全站根域)
8. **Google 已索引主要页面** ⏳ **待手动提交 GSC**

第 8 条是当前唯一没做完的,做完再点复审。

---

## 十、联系与凭证

- 项目作者:Alex Chu(朱枝文)
- 邮箱:alex.chu0206@gmail.com(公开使用)
- Git commit 邮箱:1224717847@qq.com
- GitHub:https://github.com/Alex92908
- AdSense Publisher ID:pub-2701427752265946
- AdSense Customer ID:4744122385
