export type Lang = "en" | "zh";

export const strings = {
  en: {
    nav: {
      how: "How it works",
      install: "Install",
      preview: "Preview",
      github: "GitHub ↗",
    },
    hero: {
      badge: "✦ Open source · MIT · Python + PyQt6",
      h1a: "Shrink Lottie files",
      h1b: "by",
      h1em: "50–100×",
      sub: "Re-encode embedded PNG frame sequences to WebP, skip every other frame, rewrite the timeline — all from a desktop GUI.",
      cta: "↓ Get started",
      ghBtn: "View on GitHub",
    },
    stats: {
      ratio: "64×",
      ratioLabel: "typical compression ratio",
      size: "~1 MB",
      sizeLabel: "from a 70 MB source file",
      offline: "100%",
      offlineLabel: "offline · no uploads",
    },
    compare: {
      title: "FILE SIZE COMPARISON — same animation",
      before: "Before",
      after: "After",
    },
    features: {
      label: "Features",
      heading: "Everything you need, nothing you don't",
      items: [
        { icon: "🖥", title: "Desktop GUI", body: "PyQt6 window with presets, progress bar, and live log. No terminal knowledge needed." },
        { icon: "⏩", title: "Smart frame skipping", body: "Halve the frame count to 15 fps. Timeline ip/op/st fields are rewritten so playback speed stays identical." },
        { icon: "🖼", title: "WebP encoding", body: "Pillow method=2 for speed. Avoids the alpha-channel corruption bug in lossless mode. PNG fallback for old SDKs." },
        { icon: "🔒", title: "Fully offline", body: "Runs entirely on your machine. Your animations never leave your computer — no cloud, no accounts." },
      ],
    },
    how: {
      label: "How it works",
      heading: "Three steps under the hood",
      steps: [
        { title: "Decode embedded frames", body: "Reads base64-encoded PNG (or JPEG) assets from the Lottie JSON and decodes them in memory with Pillow." },
        { title: "Re-encode to WebP", body: "Optional resize, then lossy WebP at your chosen quality (default q=75). Frame skipping keeps every Nth frame and drops the rest." },
        { title: "Rebuild the timeline", body: "Sequence-asset layers get new ip/op/st values so the animation runs at the correct speed after frame reduction." },
      ],
    },
    presets: {
      label: "Presets",
      heading: "Pick a preset or go custom",
      cols: ["Preset", "Frame skip", "WebP quality", "Typical size"],
      rows: [
        ["Quality first", "none", "75", "~3% of original"],
        ["Balanced", "every 2nd frame", "75", "~1.5%"],
        ["Smallest", "every 2nd frame", "70", "~1%"],
        ["Lossless", "none", "—", "~50–70%"],
        ["Custom", "set manually", "set manually", "—"],
      ],
      defaultBadge: "⭐ default",
    },
    install: {
      heading: "Get started in 3 commands",
      note: "Requires Python 3.10+ · macOS and Windows supported ·",
      manualLink: "中文操作手册 ↗",
    },
    footer: {
      line1: "lottie-mini · MIT License ·",
      line2: "Only works on Lottie files with embedded image frames. Vector-only animations are already tiny.",
    },
  },

  zh: {
    nav: {
      how: "工作原理",
      install: "安装",
      preview: "在线预览",
      github: "GitHub ↗",
    },
    hero: {
      badge: "✦ 开源 · MIT · Python + PyQt6",
      h1a: "Lottie 文件",
      h1b: "压缩",
      h1em: "50–100 倍",
      sub: "把内嵌 PNG 帧序列重新编码为 WebP，可选抽帧 + 缩放，自动修正时间轴，全程桌面 GUI 操作。",
      cta: "↓ 开始使用",
      ghBtn: "在 GitHub 上查看",
    },
    stats: {
      ratio: "64×",
      ratioLabel: "典型压缩比",
      size: "约 1 MB",
      sizeLabel: "原文件 70 MB 压缩后",
      offline: "100%",
      offlineLabel: "完全离线，不上传文件",
    },
    compare: {
      title: "文件大小对比 — 同一个动画",
      before: "压缩前",
      after: "压缩后",
    },
    features: {
      label: "功能特性",
      heading: "够用，不多余",
      items: [
        { icon: "🖥", title: "桌面 GUI", body: "PyQt6 窗口，含预设选择、进度条、实时日志，不需要任何命令行知识。" },
        { icon: "⏩", title: "智能抽帧", body: "帧数减半至 15fps。自动重写时间轴 ip/op/st 字段，播放速度保持不变。" },
        { icon: "🖼", title: "WebP 编码", body: "使用 Pillow method=2，兼顾速度与压缩率。规避了无损模式下的 alpha 通道 bug，支持 PNG 兜底。" },
        { icon: "🔒", title: "完全离线", body: "所有处理在本机完成，动画文件不会离开你的电脑，无需云服务和账号。" },
      ],
    },
    how: {
      label: "工作原理",
      heading: "三步完成压缩",
      steps: [
        { title: "解码内嵌帧", body: "从 Lottie JSON 中读取 base64 编码的 PNG（或 JPEG）资产，用 Pillow 在内存中解码。" },
        { title: "重新编码为 WebP", body: "可选缩放尺寸，然后以指定质量（默认 q=75）做有损 WebP 编码。抽帧时每隔 N 帧保留一帧。" },
        { title: "重建时间轴", body: "为序列资产层重写 ip/op/st 值，确保抽帧后动画播放速度完全正确。" },
      ],
    },
    presets: {
      label: "预设",
      heading: "选一个预设，或完全自定义",
      cols: ["预设", "抽帧", "WebP 质量", "典型大小"],
      rows: [
        ["质量优先", "不抽帧", "75", "约原始 3%"],
        ["均衡", "隔帧抽", "75", "约 1.5%"],
        ["极小", "隔帧抽", "70", "约 1%"],
        ["无损", "不抽帧", "—", "约 50–70%"],
        ["自定义", "手动设置", "手动设置", "—"],
      ],
      defaultBadge: "⭐ 默认",
    },
    install: {
      heading: "三行命令开始使用",
      note: "需要 Python 3.10+ · 支持 macOS 和 Windows ·",
      manualLink: "中文操作手册 ↗",
    },
    footer: {
      line1: "lottie-mini · MIT 开源协议 ·",
      line2: "仅对含内嵌图片帧的 Lottie 有效。纯矢量 Lottie 本身已经很小，无需使用本工具。",
    },
  },
} as const;
