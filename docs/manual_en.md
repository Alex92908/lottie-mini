# Lottie Compress Tool — User Guide

For users who have never installed Python or PyCharm. Follow each step in order.

**Supported platforms:** macOS and Windows (differences are noted throughout)

**What you'll have when done:** A GUI window tool that compresses bloated Lottie JSON files (often dozens of MB) down to under a few MB.

---

## 1. Download and install PyCharm

PyCharm is a Python IDE by JetBrains. Since 2025.1, it has merged into a single product — **core features are completely free**, with a 30-day Pro trial on first launch.

### 1.1 Download

Open your browser and visit:

```
https://www.jetbrains.com/pycharm/download/
```

The page auto-detects your OS (macOS / Windows / Linux).

- **macOS users:** Choose the right chip version:
  - Apple Silicon (M1/M2/M3/M4): `.dmg (Apple Silicon)`
  - Intel Mac: `.dmg (Intel)`
  - Not sure? Apple menu → About This Mac → look at "Chip"
- **Windows users:** Download the `.exe` installer

The file is roughly 600–800 MB.

### 1.2 Install

**macOS:**
1. Double-click the `.dmg`
2. Drag the PyCharm icon into the Applications folder
3. Open Launchpad and click PyCharm to launch
4. First launch will ask "Do you trust this app?" — click Open

**Windows:**
1. Double-click the `.exe`
2. Click Next through the installer (recommended: check `Add launchers dir to the PATH` and `.py` file association)
3. A PyCharm icon will appear on the Desktop when done

### 1.3 First launch

The first launch walks you through a few choices:

- **Privacy policy:** Check agree and Continue
- **Data sharing:** Either option is fine
- **UI theme:** Dark or Light — your choice
- **Trial:** You'll be prompted to sign in to start the 30-day Pro trial; you can also choose "Continue without signing in"

After this you'll see the PyCharm welcome window.

---

## 2. Install Python

PyCharm is an editor, not Python itself. You need to install Python separately.

### 2.1 Check if Python is already installed

**macOS:** Open Terminal (Applications → Utilities → Terminal) and type:
```bash
python3 --version
```

**Windows:** Press `Win+R`, type `cmd`, and run:
```bash
python --version
```

If you see `Python 3.10.x` or higher (3.11, 3.12…), skip to step 3.

If you get "command not found" or an old version (e.g. 2.7), continue below.

### 2.2 Download Python

Go to:
```
https://www.python.org/downloads/
```

The page recommends the latest stable version. **Python 3.12 or 3.13** are recommended (avoid 3.14+, which may not have full library support yet).

- **macOS:** `macOS 64-bit universal2 installer` (.pkg)
- **Windows:** `Windows installer (64-bit)` (.exe)

### 2.3 Install Python

**macOS:** Double-click the `.pkg` and click Continue through each step.

**Windows:**
1. Double-click the `.exe`
2. **⚠️ Important: check `Add Python to PATH`** at the bottom (otherwise the terminal won't find Python)
3. Click `Install Now`

### 2.4 Verify

Open a **new** Terminal / Command Prompt window (important — the existing window won't pick up the new PATH):

```bash
# macOS
python3 --version
# Windows
python --version
```

You should see the version you just installed.

---

## 3. Open the project in PyCharm

### 3.1 Create a project folder

Create a folder somewhere convenient, for example:
- macOS: `/Users/yourname/PycharmProjects/LottieCompress`
- Windows: `C:\Users\yourname\PycharmProjects\LottieCompress`

### 3.2 Put the code files in it

Place these two files in the folder:

```
LottieCompress/
├── compress_lottie_qt.py     ← main program (GUI)
└── requirements.txt          ← dependency list
```

### 3.3 Open the project in PyCharm

1. Launch PyCharm
2. On the welcome screen, choose `Open`
3. Select the `LottieCompress` folder and click Open

### 3.4 Configure the Python interpreter

After opening, check the **bottom-right corner** of PyCharm. If it shows "No interpreter" or a red exclamation mark:

1. Click the interpreter name → `Add New Interpreter` → `Add Local Interpreter`
2. On the left, choose `Virtualenv Environment`
3. Select `New environment`
4. **Base interpreter:** choose the Python 3.12 you just installed (auto-detected)
5. Click OK

PyCharm will create a `venv` folder in seconds.

---

## 4. Install dependencies

The tool uses two third-party libraries listed in `requirements.txt`.

### 4.1 Open PyCharm's Terminal

Click `Terminal` in the bottom bar of PyCharm.

The prompt should show `(venv)` at the start, confirming you're inside the virtual environment.

### 4.2 Install

```bash
pip install -r requirements.txt
```

Press Enter and wait 20–60 seconds for two packages to download and install:
- `pillow` — image processing
- `PyQt6` — GUI framework

If the download is slow, try the Tsinghua mirror:

```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 5. Run the tool

### Option A: Run button in PyCharm

1. In the left file tree, **right-click** `compress_lottie_qt.py`
2. Choose `Run 'compress_lottie_qt'`
3. The GUI window opens ✅

Next time: click the green triangle ▶ in PyCharm's top-right corner.

### Option B: Terminal command

```bash
python compress_lottie_qt.py
```

---

## 6. Using the tool

### 6.1 Basic usage (covers 90% of cases)

1. Click `Browse...` next to the input field and select your Lottie JSON file
2. The tool will auto-fill a suggested output path (same directory, filename with `_compressed`) and show analysis results in the log
3. Choose a preset:
   - **Balanced ⭐ Recommended:** half the frames + WebP q75. Best compression, good enough quality for most use cases
   - **Quality first:** all frames, WebP q75. Slightly better quality, slightly larger file
   - **Smallest:** half frames + resize to 600px wide. Minimum file size, slightly softer image
   - **Lossless:** visually identical but larger (~50–70% of original)
4. Click `Start Compress`
5. Wait for the progress bar to finish — a dialog confirms completion
6. Choose "Open output folder" to see the compressed file

### 6.2 Custom mode

Select `Custom` to adjust all four parameters manually:

| Parameter | Description | Recommended range |
|-----------|-------------|-------------------|
| **WebP quality** | Higher = sharper but larger | 70–85 is the sweet spot |
| **Frame stride** | 1 = keep all frames, 2 = every other frame (~15 fps), 3 = keep 1/3 | 2 is usually imperceptible |
| **Target width** | Leave blank to keep original; enter a number to resize proportionally | Mobile doesn't need more than 750 px |
| **Output format** | webp (smaller) or png (compatible) | Default: webp |

### 6.3 Which preset to use

| Platform | Recommendation |
|----------|---------------|
| H5 / Web | Balanced — `lottie-web` fully supports WebP |
| iOS app (lottie-ios 4.x+) | Balanced |
| iOS app (lottie-ios 3.x) | Custom + PNG format to be safe |
| Android (lottie-android 4.x+) | Balanced |
| Mini-programs / other | Custom + PNG |
| Design review / internal | Lossless |

---

## 7. FAQ

**Q1: "No module named 'PyQt6'" or 'PIL'**  
Run the install step again in the terminal:
```bash
pip install -r requirements.txt
```

**Q2: "No module named '_tkinter'"**  
You're running `compress_lottie_gui.py` (the Tkinter version). Use `compress_lottie_qt.py` instead.

**Q3: The output file is larger than the input**  
The input was probably already an optimized WebP or similar format. Click `Analyze input file` to check the frame format. If frames are already WebP, they're already compressed.

**Q4: "No embedded image frames"**  
The log shows: `⚠ This file has no embedded image frames (possibly a vector Lottie). This tool cannot help.`  
Vector Lottie (pure shapes) is already tiny (tens to hundreds of KB) and doesn't need this tool.

**Q5: Compression is very slow**  
Normal speed: ~100 frames in 5 seconds, ~500 frames in 30 seconds. If it's much slower:
- Large frames (e.g. 4K) → set a target width to scale down
- High CPU load → close other programs

**Q6: PyCharm is slow to start**  
First launch builds an index — allow a few minutes. Subsequent launches are faster. On low-spec machines (< 8 GB RAM), consider VS Code instead.

**Q7: Batch processing multiple files**  
The GUI handles one file at a time. For batch use, run the CLI version (`compress_lottie.py`):

```bash
for file in *.json; do
  python compress_lottie.py "$file" "compressed_$file" --stride 2
done
```

---

## 8. File list

| File | Purpose |
|------|---------|
| `compress_lottie_qt.py` | **Main program** — GUI window (recommended) |
| `compress_lottie.py` | CLI version — no window, for scripted batch processing |
| `requirements.txt` | Dependency list |
| `docs/manual_zh.md` | This guide in Chinese |
| `docs/manual_en.md` | This guide |

---

## 9. Getting help

If something doesn't work, share:
1. Your OS (macOS / Windows, version number)
2. Python version (run `python --version`)
3. A full screenshot of the error
4. Which step failed

Open an issue at: https://github.com/Alex92908/lottie-mini/issues
