# I compressed a 70 MB Lottie file down to 800 KB — here's how it works

> **Try it:** https://www.lottie-mini.com  
> **GitHub:** https://github.com/Alex92908/lottie-mini  
> Supports Lottie JSON and dotLottie (.lottie) · No size limit · No upload · 100% local

---

A designer handed me a Lottie animation and said "it's just a small animation, shouldn't be slow." It was **71 MB**.

There's no way to ship that — a 70 MB JSON on a landing page would take several seconds even on WiFi, and destroy mobile performance. So I built a tool to fix it.

---

## Why are some Lottie files so huge?

Pure vector Lottie files are tiny — usually just a few dozen KB. The problem is **embedded bitmap frame sequences**.

When designers export from After Effects with Bodymovin, any image-based frames get base64-encoded and embedded directly into the JSON:

```json
{
  "assets": [
    { "id": "image_0", "p": "data:image/png;base64,iVBORw0KGgo...(thousands of chars)..." },
    { "id": "image_1", "p": "data:image/png;base64,..." }
    // ... potentially hundreds of frames
  ]
}
```

A single PNG frame is roughly 100–300 KB. 300 frames = 30–90 MB, then base64 encoding adds another 33% on top. That's how you get 70 MB Lottie files.

---

## The compression approach

| Problem | Solution |
|---------|----------|
| PNG frames are large | Re-encode to lossy WebP (5–10× smaller at equivalent visual quality) |
| Too many frames | Frame skipping — keep every 2nd frame (30fps → 15fps) |
| Timeline breaks after frame skip | Rewrite `ip`/`op`/`st` fields on sequence asset layers |

**Result: 70 MB → 800 KB, ~64× compression.**

---

## Bugs I hit along the way

### WebP lossless has an alpha channel bug in Pillow

My first attempt used WebP lossless mode. Some frames came out with corrupted transparency — black patches where there should be transparent pixels. This is a known Pillow bug with lossless + RGBA.

Fix: use lossy mode at q=75 with `method=2`. Visually indistinguishable, alpha works correctly, and it's much faster than the default `method=4`.

### Frame skipping broke the animation speed

After cutting 300 frames to 150, the 10-second animation played back in 5 seconds — because the timeline still counted 300 frames.

Lottie sequence layers have three fields that control timing: `ip` (in point), `op` (out point), and `st` (start time). You have to rewrite all three after skipping frames, plus update the root `op` and `fr` (frame rate). Easy to miss, annoying when you do.

### Browser Canvas `toBlob` is async — and blocks the UI if you're not careful

Porting the Python logic to the browser, the main gotcha was that `canvas.toBlob()` is async. Running hundreds of frames serially with `await` freezes the tab completely. The fix: yield to the browser every 5 frames with `setTimeout(0)` and fire a progress callback so the UI stays responsive.

---

## dotLottie support

dotLottie (`.lottie` extension) is LottieFiles' newer format — basically a ZIP containing the animation JSON. Unpacking it is straightforward:

**Browser (using fflate, an 8 KB zip library):**
```typescript
import { unzipSync, strFromU8 } from "fflate";

async function parseDotLottie(buf: ArrayBuffer) {
  const zip = unzipSync(new Uint8Array(buf));
  const key = Object.keys(zip).find(
    k => k.startsWith("animations/") && k.endsWith(".json")
  );
  return JSON.parse(strFromU8(zip[key!]));
}
```

**Python (stdlib only):**
```python
import zipfile

def load_lottie_json(path):
    if path.endswith(".lottie"):
        with zipfile.ZipFile(path) as zf:
            anim = next(n for n in zf.namelist()
                       if n.startswith("animations/") and n.endswith(".json"))
            with zf.open(anim) as f:
                return json.load(f)
    with open(path) as f:
        return json.load(f)
```

---

## The tool

I packaged all of this into two things:

**🗜️ Compressor (https://www.lottie-mini.com)**
- Drag and drop Lottie JSON or .lottie files
- **No size limit** — LottieFiles' official tooling caps at 20 MB, this doesn't
- Nothing uploaded; everything runs locally in your browser

**🎬 Preview tool (https://www.lottie-mini.com/preview)**

While building the compressor I realized "preview a Lottie file online" is its own under-served problem — most online viewers require a login or cap uploads at 5-10 MB. So I broke Preview out into its own page:

- Drop any `.json` or `.lottie` — no signup, no size limit
- **Side-by-side mode:** drop two files to compare versions (great for compression QA, or for diffing two animation revisions)
- Shows fps, duration, embedded asset size
- 100% local

Use it standalone as a no-friction Lottie viewer, even if you never compress anything.

**🖥️ Desktop GUI (Python + PyQt6)**
- For batch processing or when you want to keep files completely off the network
- Same .json and .lottie support

Compression presets:

| Preset | Frame skip | WebP quality | Typical output size |
|--------|-----------|--------------|---------------------|
| Quality first | None | 75 | ~3% of original |
| Balanced ⭐ | Every 2nd frame | 75 | ~1.5% |
| Smallest | Every 2nd frame | 70 | ~1% |
| Lossless | None | — | ~50–70% |

---

## When does this actually help?

**Good fit:**
- AE-exported Lottie files with embedded PNG/JPEG frame sequences
- Marketing landing pages, app splash screens, in-app animations

**Not useful for:**
- Pure vector Lottie files (they're already tiny — nothing to compress)
- Animations where dropping from 30fps to 15fps is unacceptable

---

Happy to answer questions about the implementation. The whole thing is MIT licensed and open source.
