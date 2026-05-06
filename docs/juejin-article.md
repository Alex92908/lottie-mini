# 我把 70MB 的 Lottie 压到 800KB——一个纯浏览器端压缩工具的实现原理

> 在线体验：https://lottie-mini.vercel.app  
> 开源地址：https://github.com/Alex92908/lottie-mini  
> 支持 Lottie JSON 和 dotLottie (.lottie)，无大小限制，不上传，100% 本地运行

---

## 背景：设计师交付了一个 70MB 的动画

运营同学发来一个 Lottie 文件，说"就是个小动画，加载一下应该不慢"。

打开一看：**71.3 MB**。

这种文件根本没法直接上线——首屏加载一个 70MB 的 JSON，即使在 WiFi 下也需要好几秒，移动端直接劝退。

问题出在哪？

---

## 一、为什么 Lottie 会这么大？

Lottie 文件本质是一个 JSON，记录了动画的路径、关键帧、变换矩阵。**纯矢量的 Lottie 通常只有几十 KB，非常小。**

但很多设计师在 AE 里做动画时，会用到位图序列帧——比如用 Bodymovin 导出时，PNG 帧序列会以 **base64 编码**直接内嵌进 JSON：

```json
{
  "assets": [
    {
      "id": "image_0",
      "p": "data:image/png;base64,iVBORw0KGgo...(几万个字符)..."
    },
    {
      "id": "image_1",
      "p": "data:image/png;base64,iVBORw0KGgo..."
    }
    // ... 可能有几百帧
  ]
}
```

一帧 PNG 大约 100–300KB，300 帧就是 30–90MB，base64 编码再膨胀 33%，轻松突破 70MB。

**根本原因：PNG 无损压缩率低 + 帧数多 + base64 编码膨胀。**

---

## 二、压缩思路

知道了原因，解法就清晰了：

| 问题 | 解法 |
|------|------|
| PNG 体积大 | 重编码为有损 WebP（同等视觉质量下小 5–10 倍） |
| 帧数多 | 抽帧（每 2 帧保留 1 帧，从 30fps → 15fps） |
| 时间轴乱了 | 重写每个序列层的 `ip/op/st` 字段 |

压缩比实测：**70MB → 800KB，约 64 倍**。

---

## 三、踩坑实录

### 坑 1：WebP lossless 模式有 alpha 通道 bug

最开始我用的是 Pillow 的 WebP lossless 模式：

```python
img.save(buf, format="WEBP", lossless=True)
```

结果部分帧的透明区域变成了黑色或出现色块。这是 Pillow 已知的 bug（lossless + RGBA 在某些版本下处理 alpha 通道有问题）。

**解法：改用有损模式，quality=75 在视觉上几乎无差别，但 alpha 通道处理正常：**

```python
img.save(buf, format="WEBP", quality=75, method=2)
```

`method=2` 是关键——它比默认的 method=4 快很多（慢压缩会让 GUI 卡住），压缩率几乎一样。

### 坑 2：抽帧后动画加速了

把 300 帧压到 150 帧之后，动画时长从 10 秒变成了 5 秒——因为时间轴还按原来 300 帧算。

Lottie 的序列帧资产层有三个关键字段：

- `ip`（in point）：当前层开始帧
- `op`（out point）：当前层结束帧  
- `st`（start time）：层内时间起点

抽帧后必须同步更新这三个值。以步长 stride=2 为例：

```python
def rewrite_timeline(layer, stride):
    layer["ip"] = layer["ip"] // stride
    layer["op"] = math.ceil(layer["op"] / stride)
    layer["st"] = layer["st"] // stride
```

同时还要更新根对象的 `op`（总帧数）和 `fr`（帧率）：

```python
result["op"] = math.ceil(src["op"] / stride)
result["fr"] = src["fr"] / stride  # 30fps → 15fps
```

这样播放器看到的仍然是"正确时长"的动画，只是每帧多停留了一倍时间。

### 坑 3：浏览器端 Canvas toBlob 是异步的

把 Python 逻辑移植到浏览器时，最大的区别是：Canvas 的 `toBlob` 是异步的。

Python 版：
```python
buf = io.BytesIO()
img.save(buf, format="WEBP", quality=75)
encoded = base64.b64encode(buf.getvalue()).decode()
```

浏览器版：
```javascript
async function encodeWebP(imageBitmap, quality) {
  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      blob.arrayBuffer().then((buf) => {
        resolve(btoa(String.fromCharCode(...new Uint8Array(buf))));
      });
    }, "image/webp", quality / 100);
  });
}
```

几百帧全部串行 await，UI 会完全卡死。解法是每 5 帧 yield 一次：

```javascript
if (i % 5 === 0) {
  await new Promise((r) => setTimeout(r, 0)); // 让浏览器喘口气
  onProgress({ pct: (i / total) * 100, msg: `${i}/${total}` });
}
```

---

## 四、dotLottie 格式支持

dotLottie（`.lottie` 扩展名）是 LottieFiles 推出的新格式，本质是一个 ZIP 压缩包：

```
animation.lottie (ZIP)
├── manifest.json
├── animations/
│   └── data.json   ← 真正的 Lottie JSON 在这里
└── images/
    └── *.webp
```

解包只需几行：

**Python：**
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

**浏览器（用 fflate，8KB 的 ZIP 库）：**
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

---

## 五、在线工具

上面这些逻辑我打包成了两个工具：

**🌐 浏览器在线版（lottie-mini.vercel.app）**
- 拖入文件直接压缩，支持 Lottie JSON 和 dotLottie
- **无大小限制**（LottieFiles 官方预览限制 20MB，这个没有）
- 压缩完可以左右对比预览原始和压缩后的动画效果
- 不上传文件，完全本地运行

**🖥️ 桌面 GUI 版（Python + PyQt6）**
- 适合批量处理或对隐私要求更高的场景
- 同样支持 .json 和 .lottie 格式

压缩预设：

| 预设 | 抽帧 | WebP 质量 | 典型大小 |
|------|------|-----------|---------|
| 质量优先 | 不抽帧 | 75 | 约原始 3% |
| 均衡 ⭐ | 隔帧抽 | 75 | 约 1.5% |
| 极小 | 隔帧抽 | 70 | 约 1% |
| 无损 | 不抽帧 | — | 约 50–70% |

---

## 六、适用场景

**适合用：**
- 设计师交付的 AE 导出 Lottie，内嵌 PNG/JPEG 帧序列
- 营销活动页、App 启动动画、运营弹窗

**不适合用：**
- 纯矢量 Lottie（本身就很小，压无可压）
- 对帧率有严格要求的场景（抽帧会从 30fps 降到 15fps）

---

欢迎试用：https://lottie-mini.vercel.app  
觉得有用的话点个 GitHub Star ⭐：https://github.com/Alex92908/lottie-mini
