#!/usr/bin/env python3
"""
Lottie 压缩工具 - PyQt6 GUI 版本

依赖:
  pip install pyqt6 pillow

运行:
  python compress_lottie_qt.py
"""

import base64
import io
import json
import os
import sys
import time

from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import (
    QApplication, QCheckBox, QComboBox, QFileDialog, QFormLayout,
    QGroupBox, QHBoxLayout, QLabel, QLineEdit, QMainWindow, QMessageBox,
    QProgressBar, QPushButton, QRadioButton, QSlider, QTextEdit,
    QVBoxLayout, QWidget,
)

# ---------- 多语言字符串 ----------

STRINGS = {
    "zh": {
        "window_title": "Lottie 压缩工具",
        "lang_btn": "EN",
        "file_group": "文件",
        "input_label": "输入:",
        "output_label": "输出:",
        "browse": "浏览...",
        "preset_group": "预设",
        "presets": [
            ("quality",  "质量优先 (~3% 大小)",     "全帧 WebP q75"),
            ("balanced", "均衡 (~1.5%) ⭐ 推荐",     "抽帧到一半 + WebP q75"),
            ("smallest", "极小 (~1%)",               "抽帧 + 缩到 600 宽 + q70"),
            ("lossless", "无损 (~50-70%)",            "WebP lossless，视觉无差"),
            ("custom",   "自定义",                   "下方手动设参数"),
        ],
        "param_group": "参数（自定义模式生效）",
        "quality_label": "WebP 质量:",
        "stride_label": "抽帧步长:",
        "stride_note": "(1=全帧, 2=15fps, 3=保留1/3)",
        "width_label": "目标宽度:",
        "width_note": "(留空=保持原尺寸，高度自动)",
        "width_placeholder": "空",
        "format_label": "输出格式:",
        "lossless_cb": "无损（仅 WebP）",
        "analyze_btn": "分析输入文件",
        "run_btn": "开始压缩",
        "log_group": "日志",
        "status_ready": "就绪",
        "status_processing": "正在处理...",
        "status_done": "✓ 完成",
        "status_failed": "✗ 失败",
        # 对话框
        "dlg_error": "错误",
        "dlg_analysis_failed": "分析失败",
        "dlg_compress_failed": "压缩失败",
        "dlg_processing": "正在处理",
        "dlg_processing_msg": "请等待当前任务完成",
        "dlg_done": "完成",
        "dlg_done_msg": "压缩完成！是否打开输出文件夹？",
        "err_no_input": "请选择有效的输入文件",
        "err_no_output": "请指定输出文件",
        "err_same_path": "输出路径不能和输入相同",
        "err_bad_width": "目标宽度必须是正整数或留空",
        "pick_input_title": "选择 Lottie JSON",
        "pick_output_title": "保存为",
        # 分析日志
        "log_file_info": "=== 文件信息 ===",
        "log_file_size": "文件大小",
        "log_version": "Lottie 版本",
        "log_canvas": "画布",
        "log_duration": "动画时长",
        "log_img_frames": "内嵌图片帧",
        "log_frame_fmt": "帧格式",
        "log_frame_size": "帧尺寸",
        "log_avg_frame": "平均每帧 base64 长度",
        "log_suitable": "✓ 此文件适合用本工具压缩",
        "log_no_frames": "⚠ 此文件没有内嵌图片帧（可能是矢量 Lottie），本工具无效",
        "log_sec": "秒",
        "log_frames_unit": "帧",
    },
    "en": {
        "window_title": "Lottie Compress Tool",
        "lang_btn": "中文",
        "file_group": "File",
        "input_label": "Input:",
        "output_label": "Output:",
        "browse": "Browse...",
        "preset_group": "Preset",
        "presets": [
            ("quality",  "Quality first (~3%)",          "All frames · WebP q75"),
            ("balanced", "Balanced (~1.5%) ⭐ Recommended", "Half frames + WebP q75"),
            ("smallest", "Smallest (~1%)",               "Half frames + 600px wide + q70"),
            ("lossless", "Lossless (~50-70%)",            "WebP lossless, visually identical"),
            ("custom",   "Custom",                       "Set parameters below"),
        ],
        "param_group": "Parameters (custom mode only)",
        "quality_label": "WebP Quality:",
        "stride_label": "Frame Stride:",
        "stride_note": "(1=all frames, 2=15fps, 3=keep 1/3)",
        "width_label": "Target Width:",
        "width_note": "(blank=keep original, height auto)",
        "width_placeholder": "blank",
        "format_label": "Output Format:",
        "lossless_cb": "Lossless (WebP only)",
        "analyze_btn": "Analyze Input",
        "run_btn": "Start Compress",
        "log_group": "Log",
        "status_ready": "Ready",
        "status_processing": "Processing...",
        "status_done": "✓ Done",
        "status_failed": "✗ Failed",
        # dialogs
        "dlg_error": "Error",
        "dlg_analysis_failed": "Analysis failed",
        "dlg_compress_failed": "Compression failed",
        "dlg_processing": "Processing",
        "dlg_processing_msg": "Please wait for the current task to finish",
        "dlg_done": "Done",
        "dlg_done_msg": "Compression complete! Open output folder?",
        "err_no_input": "Please select a valid input file",
        "err_no_output": "Please specify an output file",
        "err_same_path": "Output path cannot be the same as input",
        "err_bad_width": "Target width must be a positive integer or blank",
        "pick_input_title": "Select Lottie JSON",
        "pick_output_title": "Save as",
        # analyze log
        "log_file_info": "=== File Info ===",
        "log_file_size": "File size",
        "log_version": "Lottie version",
        "log_canvas": "Canvas",
        "log_duration": "Duration",
        "log_img_frames": "Embedded image frames",
        "log_frame_fmt": "Frame format",
        "log_frame_size": "Frame size",
        "log_avg_frame": "Avg frame base64 length",
        "log_suitable": "✓ This file is suitable for compression",
        "log_no_frames": "⚠ No embedded image frames (may be vector Lottie). This tool cannot help.",
        "log_sec": "s",
        "log_frames_unit": "frames",
    },
}

_LANG_FILE = os.path.expanduser("~/.lottie_mini_lang")


def _load_lang() -> str:
    try:
        with open(_LANG_FILE) as f:
            v = f.read().strip()
            return v if v in ("en", "zh") else "en"
    except OSError:
        return "en"


def _save_lang(lang: str):
    try:
        with open(_LANG_FILE, "w") as f:
            f.write(lang)
    except OSError:
        pass


# ---------- 核心压缩逻辑 ----------

def is_image_asset(asset: dict) -> bool:
    p = asset.get("p", "")
    return isinstance(p, str) and p.startswith("data:")


def analyze_file(src_path: str) -> dict:
    info = {"file_size": os.path.getsize(src_path)}
    with open(src_path) as f:
        d = json.load(f)
    info["version"] = d.get("v", "?")
    info["w"] = d.get("w", 0)
    info["h"] = d.get("h", 0)
    info["fr"] = d.get("fr", 0)
    info["op"] = d.get("op", 0)

    img_assets = [a for a in d.get("assets", []) if is_image_asset(a)]
    info["image_count"] = len(img_assets)
    info["asset_count"] = len(d.get("assets", []))

    if img_assets:
        sample_p = img_assets[0]["p"]
        header = sample_p.split(",", 1)[0]
        sample_raw = base64.b64decode(sample_p.split(",", 1)[1])
        info["frame_format"] = header.split(";")[0].split(":")[-1]
        try:
            from PIL import Image
            sample_im = Image.open(io.BytesIO(sample_raw))
            sample_im.load()
            info["frame_w"], info["frame_h"] = sample_im.size
            info["frame_mode"] = sample_im.mode
        except Exception:
            info["frame_w"] = info["frame_h"] = 0
            info["frame_mode"] = "?"
        sizes = [len(a["p"]) for a in img_assets]
        info["avg_frame_b64"] = sum(sizes) // len(sizes)

    return info


def compress(
    src_path, out_path,
    quality=75, stride=1, target_width=None, target_height=None,
    lossless=False, method=2, output_format="webp",
    progress_cb=None, log_cb=None,
):
    from PIL import Image

    def log(s):
        if log_cb: log_cb(s)
    def progress(pct, msg=""):
        if progress_cb: progress_cb(pct, msg)

    log(f"loading {os.path.basename(src_path)}...")
    progress(0, "loading")
    with open(src_path) as f:
        src = json.load(f)
    orig_size = os.path.getsize(src_path)
    log(f"original size: {orig_size / 1024 / 1024:.2f} MB")

    img_assets_orig = [a for a in src.get("assets", []) if is_image_asset(a)]
    if not img_assets_orig:
        raise ValueError("no embedded image assets found")
    log(f"found {len(img_assets_orig)} embedded image frames")

    progress(2, "decoding")
    log("decoding frames...")
    t = time.time()
    frames = []
    for i, a in enumerate(img_assets_orig):
        raw = base64.b64decode(a["p"].split(",", 1)[1])
        im = Image.open(io.BytesIO(raw))
        im.load()
        frames.append(im)
        if i % 20 == 0:
            progress(2 + int(i / len(img_assets_orig) * 18), f"decoding {i}/{len(img_assets_orig)}")
    log(f"decoded in {time.time() - t:.1f}s, frame size: {frames[0].size}")

    orig_w, orig_h = frames[0].size
    if target_width is None and target_height is None:
        new_w, new_h = orig_w, orig_h
    elif target_width is not None and target_height is None:
        ratio = target_width / orig_w
        new_w, new_h = target_width, int(round(orig_h * ratio))
    elif target_height is not None and target_width is None:
        ratio = target_height / orig_h
        new_w, new_h = int(round(orig_w * ratio)), target_height
    else:
        new_w, new_h = target_width, target_height
    if (new_w, new_h) != (orig_w, orig_h):
        log(f"resizing: {orig_w}x{orig_h} -> {new_w}x{new_h}")

    if stride < 1:
        raise ValueError("stride must be >= 1")
    kept_indices = list(range(0, len(frames), stride))
    if stride > 1:
        log(f"frame skipping: keeping {len(kept_indices)}/{len(frames)} frames")

    progress(20, "encoding")
    enc_desc = "lossless" if lossless else f"q={quality}"
    log(f"encoding to {output_format} ({enc_desc}, method={method})...")
    t = time.time()
    encoded_b64s = []
    total = len(kept_indices)
    for new_i, orig_i in enumerate(kept_indices):
        im = frames[orig_i]
        if (new_w, new_h) != im.size:
            im = im.resize((new_w, new_h), Image.LANCZOS)
        buf = io.BytesIO()
        if output_format == "webp":
            if lossless:
                im.save(buf, format="WebP", lossless=True, quality=100, method=method)
            else:
                im.save(buf, format="WebP", quality=quality, method=method)
        elif output_format == "png":
            im.save(buf, format="PNG", optimize=True)
        encoded_b64s.append(base64.b64encode(buf.getvalue()).decode("ascii"))
        if new_i % 5 == 0:
            progress(20 + int(new_i / total * 70), f"encoding {new_i}/{total}")
    log(f"encoded {len(encoded_b64s)} frames in {time.time() - t:.1f}s")

    progress(92, "rebuilding")
    log("rebuilding Lottie JSON...")
    d = json.loads(json.dumps(src))
    seq_asset = next(
        (a for a in d.get("assets", []) if not is_image_asset(a) and "layers" in a), None
    )

    new_image_assets = []
    for new_i, orig_i in enumerate(kept_indices):
        a = json.loads(json.dumps(img_assets_orig[orig_i]))
        a["p"] = f"data:image/{output_format};base64,{encoded_b64s[new_i]}"
        a["w"] = new_w
        a["h"] = new_h
        new_image_assets.append(a)

    if seq_asset is not None:
        orig_total = len(img_assets_orig)
        new_total = len(kept_indices)
        new_seq_layers = []
        if stride > 1:
            for new_i, orig_i in enumerate(kept_indices):
                src_layer = (
                    seq_asset["layers"][orig_i]
                    if orig_i < len(seq_asset["layers"])
                    else seq_asset["layers"][0]
                )
                l = json.loads(json.dumps(src_layer))
                stride_f = orig_total / new_total
                l["ip"] = int(round(new_i * stride_f))
                l["op"] = int(round((new_i + 1) * stride_f))
                l["st"] = l["ip"]
                l["refId"] = new_image_assets[new_i]["id"]
                new_seq_layers.append(l)
        else:
            for i, l in enumerate(seq_asset["layers"]):
                l = json.loads(json.dumps(l))
                if i < len(new_image_assets):
                    l["refId"] = new_image_assets[i]["id"]
                new_seq_layers.append(l)

        new_assets = []
        for a in d["assets"]:
            if a.get("id") == seq_asset.get("id"):
                a = json.loads(json.dumps(seq_asset))
                a["layers"] = new_seq_layers
            elif is_image_asset(a):
                continue
            new_assets.append(a)
        d["assets"] = new_image_assets + new_assets
    else:
        d["assets"] = [a for a in d["assets"] if not is_image_asset(a)]
        d["assets"] = new_image_assets + d["assets"]

    if (new_w, new_h) != (orig_w, orig_h):
        if d.get("w") == orig_w and d.get("h") == orig_h:
            d["w"] = new_w
            d["h"] = new_h
        for l in d.get("layers", []):
            if l.get("w") == orig_w and l.get("h") == orig_h:
                l["w"] = new_w
                l["h"] = new_h

    progress(96, "writing")
    with open(out_path, "w") as f:
        json.dump(d, f, separators=(",", ":"))
    out_size = os.path.getsize(out_path)
    progress(100, "done")
    log(f"\noutput: {os.path.basename(out_path)}")
    log(f"size: {out_size / 1024 / 1024:.2f} MB ({out_size / orig_size * 100:.1f}% of original)")
    log(f"compression ratio: {orig_size / out_size:.1f}x smaller")
    return out_size


# ---------- 后台 Worker ----------

class CompressWorker(QThread):
    progress_signal = pyqtSignal(int, str)
    log_signal = pyqtSignal(str)
    done_signal = pyqtSignal(str)
    error_signal = pyqtSignal(str)

    def __init__(self, params):
        super().__init__()
        self.params = params

    def run(self):
        try:
            compress(
                **self.params,
                progress_cb=lambda p, m: self.progress_signal.emit(p, m),
                log_cb=lambda s: self.log_signal.emit(s),
            )
            self.done_signal.emit(self.params["out_path"])
        except Exception as e:
            self.error_signal.emit(str(e))


# ---------- GUI ----------

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self._lang = _load_lang()
        self.worker = None
        self.resize(720, 760)

        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(12, 12, 12, 12)

        # ---- 文件区 ----
        self._file_box = QGroupBox()
        file_layout = QFormLayout(self._file_box)

        in_row = QHBoxLayout()
        self.in_edit = QLineEdit()
        self._in_btn = QPushButton()
        self._in_btn.clicked.connect(self._pick_input)
        in_row.addWidget(self.in_edit)
        in_row.addWidget(self._in_btn)
        self._in_label = QLabel()
        file_layout.addRow(self._in_label, _wrap(in_row))

        out_row = QHBoxLayout()
        self.out_edit = QLineEdit()
        self._out_btn = QPushButton()
        self._out_btn.clicked.connect(self._pick_output)
        out_row.addWidget(self.out_edit)
        out_row.addWidget(self._out_btn)
        self._out_label = QLabel()
        file_layout.addRow(self._out_label, _wrap(out_row))
        root.addWidget(self._file_box)

        # ---- 预设 ----
        self._preset_box = QGroupBox()
        preset_layout = QVBoxLayout(self._preset_box)
        self.preset_radios = {}
        self._preset_radio_labels = {}   # val -> (QRadioButton, QLabel)
        for val, _, _ in STRINGS["zh"]["presets"]:
            row = QHBoxLayout()
            rb = QRadioButton()
            rb.toggled.connect(lambda checked, v=val: checked and self._apply_preset(v))
            self.preset_radios[val] = rb
            desc_lbl = QLabel()
            desc_lbl.setStyleSheet("color: gray;")
            self._preset_radio_labels[val] = (rb, desc_lbl)
            row.addWidget(rb)
            row.addWidget(desc_lbl)
            row.addStretch()
            preset_layout.addLayout(row)
        root.addWidget(self._preset_box)

        # ---- 参数 ----
        self._param_box = QGroupBox()
        param_layout = QFormLayout(self._param_box)

        q_row = QHBoxLayout()
        self.q_slider = QSlider(Qt.Orientation.Horizontal)
        self.q_slider.setMinimum(30)
        self.q_slider.setMaximum(100)
        self.q_slider.setValue(75)
        self.q_label = QLabel("75")
        self.q_label.setMinimumWidth(30)
        self.q_slider.valueChanged.connect(lambda v: self.q_label.setText(str(v)))
        q_row.addWidget(self.q_slider)
        q_row.addWidget(self.q_label)
        self._q_row_label = QLabel()
        param_layout.addRow(self._q_row_label, _wrap(q_row))

        s_row = QHBoxLayout()
        self.stride_combo = QComboBox()
        self.stride_combo.addItems(["1", "2", "3", "4"])
        self.stride_combo.setCurrentText("2")
        self.stride_combo.setMaximumWidth(80)
        self._s_note = QLabel()
        self._s_note.setStyleSheet("color: gray;")
        s_row.addWidget(self.stride_combo)
        s_row.addWidget(self._s_note)
        s_row.addStretch()
        self._s_row_label = QLabel()
        param_layout.addRow(self._s_row_label, _wrap(s_row))

        w_row = QHBoxLayout()
        self.width_edit = QLineEdit()
        self.width_edit.setMaximumWidth(100)
        self._w_note = QLabel()
        self._w_note.setStyleSheet("color: gray;")
        w_row.addWidget(self.width_edit)
        w_row.addWidget(self._w_note)
        w_row.addStretch()
        self._w_row_label = QLabel()
        param_layout.addRow(self._w_row_label, _wrap(w_row))

        f_row = QHBoxLayout()
        self.fmt_combo = QComboBox()
        self.fmt_combo.addItems(["webp", "png"])
        self.fmt_combo.setMaximumWidth(100)
        self.lossless_cb = QCheckBox()
        f_row.addWidget(self.fmt_combo)
        f_row.addSpacing(20)
        f_row.addWidget(self.lossless_cb)
        f_row.addStretch()
        self._f_row_label = QLabel()
        param_layout.addRow(self._f_row_label, _wrap(f_row))

        root.addWidget(self._param_box)

        # ---- 按钮区 ----
        btn_row = QHBoxLayout()
        self.analyze_btn = QPushButton()
        self.analyze_btn.clicked.connect(self._analyze)
        self.run_btn = QPushButton()
        self.run_btn.setStyleSheet("font-weight: bold;")
        self.run_btn.clicked.connect(self._start_compress)
        self._lang_btn = QPushButton()
        self._lang_btn.setFixedWidth(52)
        self._lang_btn.clicked.connect(self._toggle_lang)
        btn_row.addWidget(self.analyze_btn)
        btn_row.addWidget(self.run_btn)
        btn_row.addStretch()
        btn_row.addWidget(self._lang_btn)
        root.addLayout(btn_row)

        # ---- 进度 ----
        self.progress = QProgressBar()
        self.progress.setMinimum(0)
        self.progress.setMaximum(100)
        root.addWidget(self.progress)
        self.status_label = QLabel()
        self.status_label.setStyleSheet("color: gray;")
        root.addWidget(self.status_label)

        # ---- 日志 ----
        self._log_box = QGroupBox()
        log_layout = QVBoxLayout(self._log_box)
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        mono = QFont("Menlo" if sys.platform == "darwin" else "Consolas")
        mono.setStyleHint(QFont.StyleHint.Monospace)
        mono.setPointSize(11)
        self.log_text.setFont(mono)
        log_layout.addWidget(self.log_text)
        root.addWidget(self._log_box, 1)

        self.preset_radios["balanced"].setChecked(True)
        self._retranslate()

    # ---- 语言切换 ----

    def _toggle_lang(self):
        self._lang = "en" if self._lang == "zh" else "zh"
        _save_lang(self._lang)
        self._retranslate()

    def _retranslate(self):
        s = STRINGS[self._lang]
        self.setWindowTitle(s["window_title"])
        self._lang_btn.setText(s["lang_btn"])

        self._file_box.setTitle(s["file_group"])
        self._in_label.setText(s["input_label"])
        self._out_label.setText(s["output_label"])
        self._in_btn.setText(s["browse"])
        self._out_btn.setText(s["browse"])

        self._preset_box.setTitle(s["preset_group"])
        for val, label, desc in s["presets"]:
            rb, desc_lbl = self._preset_radio_labels[val]
            rb.setText(label)
            desc_lbl.setText(desc)

        self._param_box.setTitle(s["param_group"])
        self._q_row_label.setText(s["quality_label"])
        self._s_row_label.setText(s["stride_label"])
        self._s_note.setText(s["stride_note"])
        self._w_row_label.setText(s["width_label"])
        self._w_note.setText(s["width_note"])
        self.width_edit.setPlaceholderText(s["width_placeholder"])
        self._f_row_label.setText(s["format_label"])
        self.lossless_cb.setText(s["lossless_cb"])

        self.analyze_btn.setText(s["analyze_btn"])
        self.run_btn.setText(s["run_btn"])
        self._log_box.setTitle(s["log_group"])

        if self.status_label.text() in (
            STRINGS["zh"]["status_ready"], STRINGS["en"]["status_ready"]
        ):
            self.status_label.setText(s["status_ready"])

    def _s(self, key: str) -> str:
        return STRINGS[self._lang][key]

    # ---- 操作 ----

    def _pick_input(self):
        path, _ = QFileDialog.getOpenFileName(
            self, self._s("pick_input_title"), "", "Lottie JSON (*.json);;All (*.*)"
        )
        if path:
            self.in_edit.setText(path)
            base, ext = os.path.splitext(path)
            self.out_edit.setText(f"{base}_compressed{ext}")
            self._analyze()

    def _pick_output(self):
        path, _ = QFileDialog.getSaveFileName(
            self, self._s("pick_output_title"), "", "Lottie JSON (*.json)"
        )
        if path:
            if not path.endswith(".json"):
                path += ".json"
            self.out_edit.setText(path)

    def _apply_preset(self, name):
        if name == "quality":
            self.q_slider.setValue(75); self.stride_combo.setCurrentText("1")
            self.width_edit.setText(""); self.lossless_cb.setChecked(False)
            self.fmt_combo.setCurrentText("webp")
        elif name == "balanced":
            self.q_slider.setValue(75); self.stride_combo.setCurrentText("2")
            self.width_edit.setText(""); self.lossless_cb.setChecked(False)
            self.fmt_combo.setCurrentText("webp")
        elif name == "smallest":
            self.q_slider.setValue(70); self.stride_combo.setCurrentText("2")
            self.width_edit.setText("600"); self.lossless_cb.setChecked(False)
            self.fmt_combo.setCurrentText("webp")
        elif name == "lossless":
            self.q_slider.setValue(100); self.stride_combo.setCurrentText("1")
            self.width_edit.setText(""); self.lossless_cb.setChecked(True)
            self.fmt_combo.setCurrentText("webp")

    def _log(self, msg):
        self.log_text.append(msg)

    def _analyze(self):
        path = self.in_edit.text().strip()
        if not path or not os.path.exists(path):
            QMessageBox.warning(self, self._s("dlg_error"), self._s("err_no_input"))
            return
        s = STRINGS[self._lang]
        try:
            self.log_text.clear()
            info = analyze_file(path)
            self._log(s["log_file_info"])
            self._log(f"{s['log_file_size']}: {info['file_size'] / 1024 / 1024:.2f} MB")
            self._log(f"{s['log_version']}: {info['version']}")
            self._log(f"{s['log_canvas']}: {info['w']} × {info['h']} @ {info['fr']}fps")
            dur = f"{info['op']} {s['log_frames_unit']} (~{info['op']/max(info['fr'],1):.1f}{s['log_sec']})"
            self._log(f"{s['log_duration']}: {dur}")
            self._log(f"{s['log_img_frames']}: {info['image_count']}")
            if info['image_count'] > 0:
                self._log(f"{s['log_frame_fmt']}: {info.get('frame_format', '?')}")
                self._log(f"{s['log_frame_size']}: {info.get('frame_w', 0)} × {info.get('frame_h', 0)} ({info.get('frame_mode', '?')})")
                self._log(f"{s['log_avg_frame']}: {info.get('avg_frame_b64', 0) // 1024} KB")
                self._log("")
                self._log(s["log_suitable"])
            else:
                self._log("")
                self._log(s["log_no_frames"])
        except Exception as e:
            QMessageBox.critical(self, s["dlg_analysis_failed"], str(e))

    def _start_compress(self):
        if self.worker and self.worker.isRunning():
            QMessageBox.information(self, self._s("dlg_processing"), self._s("dlg_processing_msg"))
            return

        in_path = self.in_edit.text().strip()
        out_path = self.out_edit.text().strip()
        if not in_path or not os.path.exists(in_path):
            QMessageBox.warning(self, self._s("dlg_error"), self._s("err_no_input"))
            return
        if not out_path:
            QMessageBox.warning(self, self._s("dlg_error"), self._s("err_no_output"))
            return
        if os.path.abspath(in_path) == os.path.abspath(out_path):
            QMessageBox.warning(self, self._s("dlg_error"), self._s("err_same_path"))
            return

        target_w = None
        tw_str = self.width_edit.text().strip()
        if tw_str:
            try:
                target_w = int(tw_str)
                if target_w <= 0:
                    raise ValueError()
            except ValueError:
                QMessageBox.warning(self, self._s("dlg_error"), self._s("err_bad_width"))
                return

        params = dict(
            src_path=in_path,
            out_path=out_path,
            quality=self.q_slider.value(),
            stride=int(self.stride_combo.currentText()),
            target_width=target_w,
            lossless=self.lossless_cb.isChecked(),
            method=2,
            output_format=self.fmt_combo.currentText(),
        )

        self.log_text.clear()
        self.run_btn.setEnabled(False)
        self.analyze_btn.setEnabled(False)
        self.progress.setValue(0)
        self.status_label.setText(self._s("status_processing"))
        self.status_label.setStyleSheet("color: gray;")

        self.worker = CompressWorker(params)
        self.worker.progress_signal.connect(self._on_progress)
        self.worker.log_signal.connect(self._log)
        self.worker.done_signal.connect(self._on_done)
        self.worker.error_signal.connect(self._on_error)
        self.worker.start()

    def _on_progress(self, pct, msg):
        self.progress.setValue(pct)
        if msg:
            self.status_label.setText(msg)

    def _on_done(self, out_path):
        self.run_btn.setEnabled(True)
        self.analyze_btn.setEnabled(True)
        self.status_label.setText(self._s("status_done"))
        self.status_label.setStyleSheet("color: green;")
        reply = QMessageBox.question(
            self, self._s("dlg_done"), self._s("dlg_done_msg"),
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            self._open_folder(os.path.dirname(os.path.abspath(out_path)))

    def _on_error(self, msg):
        self.run_btn.setEnabled(True)
        self.analyze_btn.setEnabled(True)
        self.status_label.setText(self._s("status_failed"))
        self.status_label.setStyleSheet("color: red;")
        QMessageBox.critical(self, self._s("dlg_compress_failed"), msg)

    @staticmethod
    def _open_folder(path):
        import platform
        import subprocess
        try:
            if platform.system() == "Darwin":
                subprocess.run(["open", path])
            elif platform.system() == "Windows":
                os.startfile(path)
            else:
                subprocess.run(["xdg-open", path])
        except Exception:
            pass


def _wrap(layout):
    w = QWidget()
    w.setLayout(layout)
    layout.setContentsMargins(0, 0, 0, 0)
    return w


def main():
    try:
        from PIL import Image  # noqa
    except ImportError:
        app = QApplication(sys.argv)
        QMessageBox.critical(None, "Missing dependency", "Please install Pillow:\n\npip install pillow")
        return

    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
