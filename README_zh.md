# lottie-mini

把内嵌 PNG 帧序列的 Lottie 文件压缩 50–100 倍，带桌面 GUI。

[![项目主页](https://img.shields.io/badge/主页-lottie--mini.vercel.app-7c6dfa?style=flat-square&logo=vercel)](https://lottie-mini.vercel.app)
[![在线预览工具](https://img.shields.io/badge/预览工具-lottie--mini.vercel.app%2Fpreview-4ade80?style=flat-square&logo=vercel)](https://lottie-mini.vercel.app/preview)
[![English](https://img.shields.io/badge/docs-English-blue?style=flat-square)](README.md)

> **🌐 项目主页：** https://lottie-mini.vercel.app
> **🎬 在线预览工具：** https://lottie-mini.vercel.app/preview

---

![lottie-mini 界面](docs/screenshot_zh.png)

## 工具能做什么

Lottie 文件如果内嵌了 PNG 帧序列，体积往往高达 30–100 MB。`lottie-mini` 把每一帧重新编码为 WebP（可选抽帧 + 缩放），同时修正时间轴，把文件压到 1 MB 以内，视觉上几乎无差别。

| 文件 | 压缩前 | 压缩后（均衡预设） | 压缩比 |
|------|--------|-----------------|-------|
| 示例动画 | 70 MB | 1.1 MB | **64×** |

> 仅对**内嵌 base64 图片帧**的 Lottie 有效（PNG / JPEG）。
> 纯矢量 Lottie 本身已经很小，无需使用本工具。

---

## 功能

- **桌面 GUI** — PyQt6 窗口，不需要任何命令行知识
- **中英文切换** — 右下角 EN/中文 按钮，偏好自动保存
- **智能抽帧** — 帧数减半至 15fps，播放速度保持不变
- **WebP 编码** — Pillow `method=2`，规避无损模式的 alpha 通道 bug
- **4 种预设** — 质量优先 / 均衡 ⭐ / 极小 / 无损
- **自定义模式** — 手动调质量、抽帧步长、目标宽度、输出格式
- **时间轴重写** — 抽帧后自动修正 `ip`/`op`/`st` 字段，保证播放速度正确
- **完全离线** — 所有处理在本机完成，文件不离开你的电脑

---

## 安装和运行

需要 Python 3.10+。

```bash
# 1. 克隆仓库
git clone https://github.com/Alex92908/lottie-mini.git
cd lottie-mini

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动 GUI
python compress_lottie_qt.py
```

也可以只把 `compress_lottie_qt.py` 和 `requirements.txt` 复制到任意文件夹直接运行。

详细操作指南见 [docs/manual_zh.md](docs/manual_zh.md)。

---

## 预设说明

| 预设 | 抽帧 | WebP 质量 | 缩放 | 典型大小 |
|------|------|----------|------|---------|
| 质量优先 | 不抽 | 75 | — | 约原始 3% |
| **均衡 ⭐** | 隔帧抽 | 75 | — | 约 1.5% |
| 极小 | 隔帧抽 | 70 | 600px 宽 | 约 1% |
| 无损 | 不抽 | — | — | 约 50–70% |
| 自定义 | 手动 | 手动 | 手动 | — |

---

## 平台兼容性

| 运行时 | WebP 支持 |
|--------|----------|
| lottie-web（浏览器）| ✅ |
| lottie-ios 4.x+ | ✅ |
| lottie-android 4.x+ | ✅ |
| 小程序 / 旧版 SDK | 选 PNG 输出 |

---

## 在线预览工具

把压缩前后的文件并排拖入，直观对比效果。
完全在浏览器本地运行，不上传任何数据，无大小限制。

![在线预览工具](docs/preview_zh.png)

→ https://lottie-mini.vercel.app/preview

---

## 依赖

```
pillow>=10.0.0
PyQt6>=6.5.0
```

---

## 开源协议

MIT
