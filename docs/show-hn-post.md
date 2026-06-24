# Show HN draft

> Format: title ≤ 80 chars, body is short and factual. No marketing language.
> HN audience hates hype — lead with the technical specifics.
> Best posting time: Tue-Thu, 8-10am PT (best chance for first-page).

---

## Title (pick one, all under 80 chars)

**Recommended:**
Show HN: Lottie-mini – compress 70MB Lottie animations to under 1MB in-browser

**Alternatives:**
- Show HN: A browser-only Lottie compressor (no upload, no size limit)
- Show HN: Lottie-mini – re-encode embedded PNG frames to WebP, 100% local
- Show HN: Compressing massive Lottie files by transcoding embedded PNGs to WebP

---

## Body (the comment you post immediately after submitting)

Hi HN,

I built lottie-mini after spending an afternoon trying (and failing) to compress a 71MB Lottie file a designer dropped on me.

The problem: when designers use PNG frame sequences in After Effects, Bodymovin exports them as base64-encoded PNGs embedded directly inside the Lottie JSON. A 5-second animation can easily exceed 50MB. Existing Lottie optimizers only touch vector data — they don't re-encode the embedded raster frames. Online compressors either have small upload limits or require sending the file to a server.

What it does:
- Parses the Lottie JSON and locates embedded PNG assets
- Decodes each frame and re-encodes as WebP via WebAssembly (libwebp)
- Optionally drops frames at a target framerate and rewrites the animation timeline keyframes so playback stays in sync
- Supports both classic .json and the newer .lottie (zip container) format

There's a companion preview tool at /preview that loads any Lottie file (or two, side-by-side) for visual inspection. It started as a QA aid for the compressor but turned out to be the most no-friction online Lottie viewer I know of — most others either gate behind login or cap uploads at 5-10MB.

Everything runs in a Web Worker. Nothing is uploaded — no size limit, no rate limit, no account.

Typical results: 70MB → ~800KB at quality 80 with 30fps target (50–100× depending on content). There's a side-by-side preview at /preview so you can compare original vs compressed playback before downloading.

Tech: Next.js for the static landing, plain TS for the compression pipeline, libwebp.js (WASM) for encoding. The compression logic is also packaged as a standalone Python GUI in the same repo for batch jobs.

Site: https://lottie-mini.com
Code: https://github.com/Alex92908/lottie-mini

Happy to answer questions about the encoding pipeline or why I didn't just use AVIF (short answer: lottie-web doesn't decode AVIF yet).

---

## Pre-submission checklist

- [ ] Test the demo on a fresh incognito session — no console errors, no broken assets
- [ ] Have 1-2 sample large Lottie files ready to drop in case commenters ask "does it work on X"
- [ ] Set up Plausible/GA so you can see HN traffic spike
- [ ] Submit Tuesday-Thursday, 8-10am Pacific Time
- [ ] DO NOT ask friends to upvote — HN will detect and shadow-rank you
- [ ] Stay online for ~6 hours after posting to reply to comments (engagement is heavily weighted)

## Likely questions & prepared answers

**Q: Why not just gzip the JSON?**
A: Lottie players don't accept gzipped JSON natively. And base64-encoded PNG data inside JSON doesn't compress well with gzip (≈10-15%) because it's already entropy-dense.

**Q: Why WebP and not AVIF?**
A: lottie-web (the dominant player) only added AVIF support in very recent versions; WebP has been supported for years and works across React Native, web, and most native players.

**Q: Why not server-side?**
A: Two reasons — (1) people work with confidential brand assets and don't want to upload, (2) it lets me avoid running infrastructure and removes file size limits.

**Q: How do you handle expressions / advanced Bodymovin features?**
A: I don't touch the expression code or layer structure — only re-encode raster assets and resample the timeline. The preview tool exists specifically so users can verify nothing visually broke.

**Q: Is there a CLI?**
A: There's a Python GUI in the repo that handles batch jobs. A standalone npm CLI is on the roadmap if there's demand.
