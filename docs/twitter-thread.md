# Twitter / X Thread Drafts

> Tone: dry, technical, hooks early. Threads >>> single tweets for tools.
> Add a screenshot/GIF to the first tweet — engagement doubles.

---

## Thread A: Origin story (recommended)

**Tweet 1 (with screenshot)**
A designer sent me a 70 MB Lottie file.

Not a video. A JSON file. 70 MB.

Every existing Lottie optimizer either crashed, or didn't touch it (they only optimize vectors, not the embedded PNGs).

So I built one that runs 100% in the browser → 70 MB to under 1 MB:

https://www.lottie-mini.com

🧵👇

**Tweet 2**
The dirty secret of "huge" Lottie files:

Designers in After Effects use PNG sequences for complex effects.

Bodymovin exports those frames as **base64-encoded PNGs embedded directly in the JSON**.

A 5s/30fps animation = 150 frames of base64 bloat.

**Tweet 3**
lottie-mini does 3 things:

1. Re-encode embedded PNG → WebP (same quality, ~80% smaller)
2. Optionally drop frames (60fps → 30fps = -50%)
3. Rewrite the animation timeline to match the new frame sequence

All in your browser. Nothing uploaded. No size limit.

**Tweet 4**
Companion tool: a side-by-side Lottie preview at /preview

Drop any two .json or .lottie files, watch them play side by side. No login, no size limit.

Useful for compression QA, but also just a no-friction online Lottie viewer:
https://www.lottie-mini.com/preview

**Tweet 5 (CTA)**
Built it because I needed it. Free, no signup, no upload, no size cap.

Try it on your largest Lottie file → https://www.lottie-mini.com

RTs appreciated 🙏

---

## Thread B: Numbers-first (more viral potential)

**Tweet 1 (with comparison screenshot)**
70 MB Lottie → 820 KB.
Same animation. Same playback.

Built a browser-based Lottie compressor because nothing else could handle files this big without crashing or uploading them to a server.

https://www.lottie-mini.com 🧵

**Tweet 2**
Why are some Lottie files 70 MB?

Designer used PNG frame sequences in After Effects.
Bodymovin base64-embeds every frame into the JSON.

5 seconds @ 30fps = 150 PNGs inside one JSON file.

**Tweet 3**
The fix is mechanical:

- Decode embedded PNGs
- Re-encode as WebP at quality 80
- Drop every other frame
- Rewrite timeline keyframes to match

Done in a Web Worker. WebAssembly does the WebP encoding. Nothing uploaded.

**Tweet 4**
Free, open source, no signup:
🌐 https://www.lottie-mini.com
📦 https://github.com/Alex92908/lottie-mini
🎬 Side-by-side preview: https://www.lottie-mini.com/preview

---

## Single-tweet version (if not doing a thread)

Built a Lottie compressor that runs 100% in your browser.

70 MB → under 1 MB. No upload, no size limit, no signup.

The trick: re-encode embedded PNG frames to WebP, drop frames, rewrite the timeline.

https://www.lottie-mini.com

[attach before/after screenshot]

---

## Hashtags to consider (use sparingly)
#frontend #webdev #lottie #animation #devtools #buildinpublic

---

## Bonus: standalone Preview-tool tweet (post a few days after the main thread)

Most online Lottie previewers cap uploads at 5-10 MB and require login.

Built a free one that doesn't:

- .json + .lottie supported
- No size limit
- No signup
- Side-by-side: drop two files to compare versions
- Runs 100% in your browser

https://www.lottie-mini.com/preview
