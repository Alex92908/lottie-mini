# lottie-mini

**Compress image-sequence Lottie files by 50–100×, with a desktop GUI.**

[![Landing page](https://img.shields.io/badge/website-lottie--mini.com-7c6dfa?style=flat-square&logo=vercel)](https://www.lottie-mini.com)
[![Live preview tool](https://img.shields.io/badge/preview_tool-lottie--mini.com%2Fpreview-4ade80?style=flat-square&logo=vercel)](https://www.lottie-mini.com/preview)
[![中文文档](https://img.shields.io/badge/文档-中文版-orange?style=flat-square)](README_zh.md)

> **🌐 Landing page:** https://www.lottie-mini.com
> **🎬 Lottie Preview Tool:** https://www.lottie-mini.com/preview

---

![lottie-mini GUI](docs/screenshot_en.png)

## What it does

Lottie files that embed PNG frame sequences can balloon to 30–100 MB. `lottie-mini` re-encodes every frame to WebP (with optional frame-skipping and resize), then rewrites the timeline — shrinking those files to under 1 MB while remaining visually indistinguishable.

| File | Before | After (Balanced) | Ratio |
|------|--------|-----------------|-------|
| Sample animation | 70 MB | 1.1 MB | **64×** |

> Only works on Lottie files with **embedded image frames** (base64 PNG/JPEG).
> Vector-only Lottie files are already tiny — this tool won't help them.

---

## Features

- **Desktop GUI** — PyQt6 window, no terminal needed
- **EN / 中文 toggle** — switch language from the bottom-right button, preference saved locally
- **Smart frame skipping** — halve the frame count at 15 fps with no perceived motion loss
- **WebP encoding** — Pillow's `method=2` encodes fast while avoiding the alpha-channel bug in lossless mode
- **4 presets** — Quality / Balanced ⭐ / Smallest / Lossless
- **Custom mode** — tweak quality, stride, target width, and output format (WebP or PNG)
- **Timeline rewrite** — correctly patches `ip`/`op`/`st` on sequence layers after frame skipping
- **Offline / private** — runs entirely on your machine, no uploads

---

## Installation

Requires Python 3.10+.

```bash
# 1. Clone
git clone https://github.com/Alex92908/lottie-mini.git
cd lottie-mini

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run GUI
python compress_lottie_qt.py
```

Or just copy `compress_lottie_qt.py` and `requirements.txt` into any folder — nothing else is needed.

---

## Presets

| Preset | Frame skip | WebP quality | Resize | Typical size |
|--------|-----------|-------------|--------|--------------|
| Quality first | none | 75 | — | ~3% of original |
| **Balanced ⭐** | every 2nd | 75 | — | ~1.5% |
| Smallest | every 2nd | 70 | 600 px wide | ~1% |
| Lossless | none | — | — | ~50–70% |
| Custom | user-set | user-set | user-set | — |

---

## Platform compatibility

| Runtime | WebP support |
|---------|-------------|
| lottie-web (browser) | ✅ |
| lottie-ios 4.x+ | ✅ |
| lottie-android 4.x+ | ✅ |
| Mini-programs / older SDKs | use PNG output |

---

## Live preview tool

Drop your before & after Lottie files side-by-side to compare them visually.
Runs 100% in the browser — no uploads, no size limit.

![Lottie Preview Tool](docs/preview_en.png)

→ https://www.lottie-mini.com/preview

---

## Requirements

```
pillow>=10.0.0
PyQt6>=6.5.0
```

---

## License

MIT
