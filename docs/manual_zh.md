# Lottie 压缩工具 操作手册

适用对象：完全没装过 Python / PyCharm 的同事，按步骤跟着做即可。

适用平台：macOS 和 Windows（步骤略有不同，本文都标注了）

完成后你将拥有：一个图形化窗口工具，能把动辄几十 MB 的 Lottie JSON 压缩到几 MB 以内。

---

## 一、下载并安装 PyCharm

PyCharm 是 JetBrains 出的 Python 开发工具。从 2025.1 开始 PyCharm 合并成了统一产品，**核心功能完全免费**，安装后还会自动给 30 天 Pro 试用。

### 1.1 下载

打开浏览器访问 JetBrains 官网：

```
https://www.jetbrains.com/pycharm/download/
```

页面会自动识别你的操作系统（macOS / Windows / Linux）。

- **macOS 用户**：注意选择对应的芯片版本
  - Apple Silicon（M1/M2/M3/M4 芯片）：选 `.dmg (Apple Silicon)`
  - Intel 芯片的旧 Mac：选 `.dmg (Intel)`
  - 不确定的话：左上角苹果菜单 → 「关于本机」，看「芯片」一栏
- **Windows 用户**：直接下 `.exe` 安装包

文件大约 600-800 MB，下载需要几分钟。

### 1.2 安装

**macOS：**
1. 双击下载的 `.dmg` 文件
2. 把 PyCharm 图标拖进 Applications 文件夹
3. 打开 Launchpad，点 PyCharm 图标启动
4. 第一次启动会问"是否信任此应用"，点「打开」

**Windows：**
1. 双击 `.exe` 安装包
2. 一路 Next（建议勾上 `Add launchers dir to the PATH` 和 `.py` 关联）
3. 安装完桌面会有 PyCharm 图标，双击启动

### 1.3 首次启动

第一次启动 PyCharm 会让你做几个选择：

- **隐私协议**：勾上同意，Continue
- **数据共享**：随便选
- **UI 主题**：随便选（Dark 黑色 / Light 白色）
- **试用**：会让你登录 JetBrains 账号开始 30 天 Pro 试用，可以登录也可以选「Continue without signing in」继续用免费版

走完这些，会看到 PyCharm 的欢迎窗口。

---

## 二、安装 Python

PyCharm 是个**编辑器**，不是 Python 本身。你还需要单独装 Python。

### 2.1 检查是否已装 Python

**macOS：** 打开 Terminal（应用程序 → 实用工具 → 终端），输入：
```bash
python3 --version
```

**Windows：** 按 `Win+R`，输入 `cmd` 打开命令提示符，输入：
```bash
python --version
```

如果看到 `Python 3.10.x` 或更高版本（如 3.11、3.12），跳过本节，直接看第三步。

如果提示「找不到命令」或者版本太老（比如 2.7），继续往下看。

### 2.2 下载 Python

打开浏览器访问：
```
https://www.python.org/downloads/
```

页面会推荐你下载最新稳定版（推荐 **Python 3.12** 或 **3.13**，不要装 3.14 以上的太新版本，第三方库可能还没适配）。

- **macOS**：下载 `macOS 64-bit universal2 installer` (.pkg)
- **Windows**：下载 `Windows installer (64-bit)` (.exe)

### 2.3 安装 Python

**macOS：**
1. 双击 `.pkg`，全程点 Continue
2. 安装完成

**Windows：**
1. 双击 `.exe`
2. **⚠️ 重要：勾选最下面的 `Add Python to PATH`**（不勾的话命令行用不了 python）
3. 点 `Install Now`

### 2.4 验证安装

重新打开 Terminal / 命令提示符（**重要：要重新打开**，已开的窗口加载不到新 PATH）：

```bash
# macOS
python3 --version
# Windows  
python --version
```

应该能看到刚才装的版本号了。

---

## 三、把工具代码放进 PyCharm

### 3.1 创建项目文件夹

在你喜欢的位置创建一个新文件夹，比如：
- macOS: `/Users/你的用户名/PycharmProjects/LottieCompress`
- Windows: `C:\Users\你的用户名\PycharmProjects\LottieCompress`

### 3.2 把代码文件放进去

把我给你的两个文件放进刚创建的文件夹里：

```
LottieCompress/
├── compress_lottie_qt.py     ← 主程序（GUI 版）
└── requirements.txt           ← 依赖列表
```

### 3.3 用 PyCharm 打开项目

1. 启动 PyCharm
2. 欢迎窗口选 `Open`（或 `打开`）
3. 选中刚才那个 `LottieCompress` 文件夹，点 Open

### 3.4 配置 Python 解释器

PyCharm 打开项目后，**右下角**会显示当前 Python 解释器，如果显示「No interpreter」或者红色感叹号，需要手动配置：

1. 点右下角解释器名字 → `Add New Interpreter` → `Add Local Interpreter`
2. 左侧选 `Virtualenv Environment`（虚拟环境，推荐做法，每个项目独立）
3. 选 `New environment`
4. **Base interpreter** 选你刚装的 Python 3.12（应该会自动检测到）
5. 点 OK

PyCharm 会创建一个 `venv` 目录，几秒钟搞定。

---

## 四、安装依赖

我们的工具用到两个第三方库（在 `requirements.txt` 里写好了）。

### 4.1 打开 PyCharm 的终端

PyCharm 底部菜单栏有 `Terminal`（或叫「终端」），点开它。

终端的开头应该显示 `(venv)` 字样，表示当前在我们刚创建的虚拟环境里。

### 4.2 装依赖

在终端里输入：

```bash
pip install -r requirements.txt
```

按回车，等几十秒，会看到下载和安装两个包：
- `pillow` —— 图像处理
- `PyQt6` —— 图形界面框架

如果遇到下载慢或失败，可以临时换成国内镜像源：

```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 五、运行工具

### 5.1 启动方式 A：在 PyCharm 里点「运行」

1. 在 PyCharm 左侧文件树里，**右键点击** `compress_lottie_qt.py`
2. 选 `Run 'compress_lottie_qt'`
3. 程序窗口弹出 ✅

以后再次运行：直接点 PyCharm 右上角的绿色三角运行按钮 ▶️

### 5.2 启动方式 B：终端命令

也可以在 PyCharm 的终端里直接跑：

```bash
python compress_lottie_qt.py
```

---

## 六、使用工具

程序窗口长这样：

```
┌────────────────────────────────────────────┐
│ 文件                                        │
│   输入: [_______________________]  [浏览...] │
│   输出: [_______________________]  [浏览...] │
├────────────────────────────────────────────┤
│ 预设                                        │
│   ○ 质量优先 (~3% 大小)    全帧 WebP q75    │
│   ● 均衡 (~1.5%) ⭐ 推荐    抽帧+WebP q75   │
│   ○ 极小 (~1%)             抽帧+缩+q70      │
│   ○ 无损 (~50-70%)          WebP lossless   │
│   ○ 自定义                  下方手动设       │
├────────────────────────────────────────────┤
│ 参数（自定义模式生效）                       │
│   WebP 质量:    [滑块 30─────●──── 100]  75 │
│   抽帧步长:     [2 ▼]                       │
│   目标宽度:     [____]                       │
│   输出格式:     [webp ▼]  ☐ 无损模式         │
├────────────────────────────────────────────┤
│ [分析输入文件]  [开始压缩]                   │
│ ████████████░░░░░░░░░░░ 60%                 │
│ 正在编码 80/121                              │
├────────────────────────────────────────────┤
│ 日志                                        │
│ ...                                         │
└────────────────────────────────────────────┘
```

### 6.1 基础用法（90% 场景）

1. 点输入框旁的 `浏览...`，选你要压缩的 Lottie JSON 文件
2. 程序会自动：
   - 在输出框填一个建议路径（同目录，文件名加 `_compressed`）
   - 在日志区显示文件分析结果
3. 在「预设」里选一个：
   - **均衡** ⭐ 推荐：抽帧到一半 + WebP q75。压缩比最高，质量足够好，适合大多数场景
   - **质量优先**：保留全部帧，WebP q75。质量稍好，文件略大
   - **极小**：抽帧 + 缩到 600 宽。极致小体积，画质稍糊
   - **无损**：视觉无差但文件较大（约原 PNG 的 50-70%）
4. 点 `开始压缩`
5. 看进度条走完，弹窗提示完成
6. 选「打开输出文件夹」可直接看到压缩好的文件

### 6.2 高级用法

如果预设不满足需求，选「自定义」，下方四个参数变成可调：

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| **WebP 质量** | 数值越高越清晰但文件越大 | 70-85 是甜点区间 |
| **抽帧步长** | 1=保留全部帧，2=隔一帧抽一帧（约 15fps），3=保留 1/3 | 2 通常无感损失 |
| **目标宽度** | 留空=保持原图尺寸；填数字=按比例缩放 | 移动端不需要超过 750 |
| **输出格式** | webp 体积小但要现代播放器；png 兼容性最好 | 默认 webp |

### 6.3 哪种场景该用哪种

- **H5 Web 端**：用「均衡」预设。`lottie-web` 完全支持 WebP
- **iOS App**：用「均衡」预设，前提 lottie-ios 是 4.x+；如果是老版本 3.x 不确定能否解 WebP，建议先选「自定义」+「输出格式 png」试试
- **Android App**：用「均衡」预设，lottie-android 4.x+ 支持 WebP
- **小程序 / 其他端**：先选「自定义」+ PNG 格式，避免格式不兼容
- **设计稿验证 / 内部审核**：用「无损」预设，保证视觉零损失

---

## 七、常见问题

### Q1: 提示 "No module named 'PyQt6'" 或 'PIL'

意思是依赖没装上。回到第四步在终端里再跑一次：
```bash
pip install -r requirements.txt
```

### Q2: 提示 "No module named '_tkinter'"

你跑的是 `compress_lottie_gui.py`（Tkinter 版本）。**直接用 `compress_lottie_qt.py`**（PyQt6 版本）就行，避开这个问题。

### Q3: 压缩出来的文件比原文件还大？

**最可能原因：原文件本来就是优化过的 WebP 或者其他高效格式**，再压一遍当然变大。本工具最适合输入是「内嵌 PNG 帧序列」的 Lottie。

点「分析输入文件」按钮可以看到原文件的帧格式。如果帧本来就是 webp，那已经压过了，不用再压。

### Q4: 文件没有内嵌图片帧？

日志会显示「⚠ 此文件没有内嵌图片帧（可能是矢量 Lottie），本工具无效」。

矢量 Lottie（纯 shapes 动画）本身就很小（几十 KB-几百 KB），不需要也不能用本工具压缩。

### Q5: 压缩很慢？

正常情况：100 帧约 5 秒，500 帧约 30 秒。如果远超这个时长，可能是：
- 原图很大（比如 4K）→ 设置「目标宽度」缩小
- CPU 负载高 → 关掉其他占资源的程序

### Q6: PyCharm 启动很慢/卡？

PyCharm 第一次打开项目要建索引，需要几分钟。后续启动会快。如果电脑配置较低（< 8GB 内存），考虑换轻量的 VS Code。

### Q7: 想压缩多个文件批量处理？

目前 GUI 一次只能压一个。要批量处理直接用命令行版（`compress_lottie.py`）：

```bash
# 在终端里循环
for file in *.json; do
  python compress_lottie.py "$file" "compressed_$file" --stride 2
done
```

---

## 八、文件清单

你需要这些文件，都已经给你了：

| 文件 | 用途 |
|------|------|
| `compress_lottie_qt.py` | **主程序**（带 GUI 窗口，推荐用这个） |
| `compress_lottie.py` | 命令行版（无窗口，适合脚本批量处理） |
| `compress_lottie_gui.py` | Tkinter 版（macOS Homebrew Python 上不一定能跑，不建议） |
| `requirements.txt` | 依赖列表 |
| `操作手册.md` | 这份文档 |

---

## 九、求助

跑不通的话告诉我以下信息：
1. 你的操作系统（macOS / Windows，版本号）
2. Python 版本（终端跑 `python --version` 看到的）
3. 报错的完整截图
4. 第几步出错的

就这些，祝顺利。
