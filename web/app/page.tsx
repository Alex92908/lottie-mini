const GITHUB = "https://github.com/Alex92908/lottie-mini";

export default function Home() {
  return (
    <>
      <nav>
        <div className="nav-inner">
          <span className="nav-logo">
            lottie<span>-mini</span>
          </span>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#install">Install</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero container">
          <div className="hero-badge">✦ Open source · MIT · Python + PyQt6</div>
          <h1>
            Shrink Lottie files
            <br />
            by <em>50–100×</em>
          </h1>
          <p>
            Re-encode embedded PNG frame sequences to WebP, skip every other
            frame, rewrite the timeline — all from a desktop GUI.
          </p>
          <div className="hero-btns">
            <a className="btn btn-primary" href="#install">
              ↓ Get started
            </a>
            <a
              className="btn btn-ghost"
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </section>

        <div className="container">
          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <div className="stat-value accent">64×</div>
              <div className="stat-label">typical compression ratio</div>
            </div>
            <div className="stat">
              <div className="stat-value green">~1 MB</div>
              <div className="stat-label">from a 70 MB source file</div>
            </div>
            <div className="stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">offline · no uploads</div>
            </div>
          </div>

          {/* Before / After bar */}
          <div className="compare">
            <div className="compare-title">FILE SIZE COMPARISON — same animation</div>
            <div className="compare-bars">
              <div className="bar-row">
                <div className="bar-label">Before</div>
                <div className="bar-track">
                  <div className="bar-fill before">70 MB PNG frames</div>
                </div>
                <div className="bar-size">70 MB</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">After</div>
                <div className="bar-track">
                  <div className="bar-fill after" />
                </div>
                <div className="bar-size" style={{ color: "var(--green)" }}>1.1 MB</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="section-label">Features</div>
          <div className="section-heading">Everything you need, nothing you don't</div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🖥</div>
              <h3>Desktop GUI</h3>
              <p>
                PyQt6 window with presets, progress bar, and live log. No
                terminal knowledge needed.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">⏩</div>
              <h3>Smart frame skipping</h3>
              <p>
                Halve the frame count to 15 fps. Timeline{" "}
                <code>ip</code>/<code>op</code>/<code>st</code> fields are
                rewritten so playback speed stays identical.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🖼</div>
              <h3>WebP encoding</h3>
              <p>
                Pillow <code>method=2</code> for speed. Avoids the
                alpha-channel corruption bug in lossless mode. PNG fallback
                for old SDKs.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>Fully offline</h3>
              <p>
                Runs entirely on your machine. Your animations never leave
                your computer — no cloud, no accounts.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div id="how">
            <div className="section-label">How it works</div>
            <div className="section-heading">Three steps under the hood</div>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <h3>Decode embedded frames</h3>
                <p>
                  Reads base64-encoded PNG (or JPEG) assets from the Lottie
                  JSON and decodes them in memory with Pillow.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <h3>Re-encode to WebP</h3>
                <p>
                  Optional resize, then lossy WebP at your chosen quality
                  (default q=75). Frame skipping keeps every Nth frame and
                  drops the rest.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <h3>Rebuild the timeline</h3>
                <p>
                  Sequence-asset layers get new <code>ip</code>/{" "}
                  <code>op</code>/<code>st</code> values so the animation
                  runs at the correct speed after frame reduction.
                </p>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="section-label">Presets</div>
          <div className="section-heading">Pick a preset or go custom</div>
          <table style={{ marginBottom: 80 }}>
            <thead>
              <tr>
                <th>Preset</th>
                <th>Frame skip</th>
                <th>WebP quality</th>
                <th>Typical size</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Quality first</td>
                <td>none</td>
                <td>75</td>
                <td>~3% of original</td>
              </tr>
              <tr>
                <td>
                  Balanced <span className="badge">⭐ default</span>
                </td>
                <td>every 2nd frame</td>
                <td>75</td>
                <td>~1.5%</td>
              </tr>
              <tr>
                <td>Smallest</td>
                <td>every 2nd frame</td>
                <td>70</td>
                <td>~1%</td>
              </tr>
              <tr>
                <td>Lossless</td>
                <td>none</td>
                <td>—</td>
                <td>~50–70%</td>
              </tr>
              <tr>
                <td>Custom</td>
                <td colSpan={3} style={{ color: "var(--muted)" }}>
                  Set quality, stride, target width, and output format manually
                </td>
              </tr>
            </tbody>
          </table>

          {/* Install */}
          <div id="install" className="install">
            <div className="install-heading">Get started in 3 commands</div>
            <pre>
              <span className="comment"># clone the repo</span>{"\n"}
              <span className="cmd">git</span> clone https://github.com/Alex92908/lottie-mini.git{"\n"}
              <span className="cmd">cd</span> lottie-mini{"\n\n"}
              <span className="comment"># install dependencies (Python 3.10+)</span>{"\n"}
              <span className="cmd">pip</span> install -r requirements.txt{"\n\n"}
              <span className="comment"># launch the GUI</span>{"\n"}
              <span className="cmd">python</span> compress_lottie_qt.py
            </pre>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Requires Python 3.10+ · macOS and Windows supported ·{" "}
              <a href={`${GITHUB}/blob/main/docs/manual_zh.md`} target="_blank" rel="noopener noreferrer">
                中文操作手册 ↗
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>
            <strong>lottie-mini</strong> · MIT License ·{" "}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p style={{ marginTop: 8 }}>
            Only works on Lottie files with embedded image frames. Vector-only
            animations are already tiny.
          </p>
        </div>
      </footer>
    </>
  );
}
