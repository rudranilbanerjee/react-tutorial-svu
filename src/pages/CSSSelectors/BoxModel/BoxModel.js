import React, { useState, useCallback, useEffect } from "react";
import "./BoxModel.css";

/* =========================================================
   BoxModelDiagram — DevTools-style visual Box Model diagram
   Shows nested colored rectangles: margin → border → padding → content
   Props:
     margin: [top, right, bottom, left] (default [0,0,0,0])
     border: [top, right, bottom, left] (default [0,0,0,0])
     padding: [top, right, bottom, left] (default [0,0,0,0])
     content: [width, height] (default ["auto","auto"])
     highlight: "margin" | "border" | "padding" | "content" | "all" | null
   ========================================================= */
const BoxModelDiagram = ({
  margin = [0, 0, 0, 0],
  border = [0, 0, 0, 0],
  padding = [0, 0, 0, 0],
  content = ["auto", "auto"],
  highlight = "all",
}) => {
  const isDimmed = (layer) =>
    highlight !== "all" && highlight !== layer;

  return (
    <div className="bm-diagram-wrapper">
      <div className="bm-diagram-title">📐 Box Model Diagram</div>
      <div className="bm-diagram-container">
        {/* MARGIN LAYER */}
        <div className={`bm-diagram-layer bm-diagram-margin${isDimmed("margin") ? " bm-diagram-margin-dim" : ""}`}>
          <span className={`bm-diagram-layer-label${isDimmed("margin") ? " bm-diagram-label-dim" : ""}`}>margin</span>
          <span className={`bm-diagram-val bm-diagram-val-top${isDimmed("margin") ? " bm-diagram-val-dim" : ""}`}>{margin[0]}</span>
          <span className={`bm-diagram-val bm-diagram-val-right${isDimmed("margin") ? " bm-diagram-val-dim" : ""}`}>{margin[1]}</span>
          <span className={`bm-diagram-val bm-diagram-val-bottom${isDimmed("margin") ? " bm-diagram-val-dim" : ""}`}>{margin[2]}</span>
          <span className={`bm-diagram-val bm-diagram-val-left${isDimmed("margin") ? " bm-diagram-val-dim" : ""}`}>{margin[3]}</span>

          {/* BORDER LAYER */}
          <div className={`bm-diagram-layer bm-diagram-border${isDimmed("border") ? " bm-diagram-border-dim" : ""}`}>
            <span className={`bm-diagram-layer-label${isDimmed("border") ? " bm-diagram-label-dim" : ""}`}>border</span>
            <span className={`bm-diagram-val bm-diagram-val-top${isDimmed("border") ? " bm-diagram-val-dim" : ""}`}>{border[0]}</span>
            <span className={`bm-diagram-val bm-diagram-val-right${isDimmed("border") ? " bm-diagram-val-dim" : ""}`}>{border[1]}</span>
            <span className={`bm-diagram-val bm-diagram-val-bottom${isDimmed("border") ? " bm-diagram-val-dim" : ""}`}>{border[2]}</span>
            <span className={`bm-diagram-val bm-diagram-val-left${isDimmed("border") ? " bm-diagram-val-dim" : ""}`}>{border[3]}</span>

            {/* PADDING LAYER */}
            <div className={`bm-diagram-layer bm-diagram-padding${isDimmed("padding") ? " bm-diagram-padding-dim" : ""}`}>
              <span className={`bm-diagram-layer-label${isDimmed("padding") ? " bm-diagram-label-dim" : ""}`}>padding</span>
              <span className={`bm-diagram-val bm-diagram-val-top${isDimmed("padding") ? " bm-diagram-val-dim" : ""}`}>{padding[0]}</span>
              <span className={`bm-diagram-val bm-diagram-val-right${isDimmed("padding") ? " bm-diagram-val-dim" : ""}`}>{padding[1]}</span>
              <span className={`bm-diagram-val bm-diagram-val-bottom${isDimmed("padding") ? " bm-diagram-val-dim" : ""}`}>{padding[2]}</span>
              <span className={`bm-diagram-val bm-diagram-val-left${isDimmed("padding") ? " bm-diagram-val-dim" : ""}`}>{padding[3]}</span>

              {/* CONTENT LAYER */}
              <div className={`bm-diagram-layer bm-diagram-content${isDimmed("content") ? " bm-diagram-content-dim" : ""}`}>
                <span className={`bm-diagram-content-size${isDimmed("content") ? " bm-diagram-val-dim" : ""}`}>
                  {content[0]} × {content[1]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {highlight && highlight !== "all" && (
        <div className="bm-diagram-highlight-label">
          🔍 Highlighted: <strong>{highlight}</strong>
        </div>
      )}
      <div className="bm-diagram-legend">
        <span className="bm-diagram-legend-item"><span className="bm-legend-color bm-legend-margin"></span>Margin</span>
        <span className="bm-diagram-legend-item"><span className="bm-legend-color bm-legend-border"></span>Border</span>
        <span className="bm-diagram-legend-item"><span className="bm-legend-color bm-legend-padding"></span>Padding</span>
        <span className="bm-diagram-legend-item"><span className="bm-legend-color bm-legend-content"></span>Content</span>
      </div>
    </div>
  );
};


/* =========================================================
   Reusable BoxModelSection Component
   - Editable CSS + HTML textareas with single Apply / Reset
   - Injects a <style> tag scoped to a unique wrapper id
   - Right-side notes panel with detailed explanation
   - Visual Box Model Diagram with per-section values
   ========================================================= */
const BoxModelSection = ({ id, title, description, defaultCSS, htmlCode, notes, children, diagram }) => {
  const [cssCode, setCssCode] = useState(defaultCSS);
  const [appliedCSS, setAppliedCSS] = useState(defaultCSS);

  const [htmlInput, setHtmlInput] = useState(htmlCode);
  const [appliedHTML, setAppliedHTML] = useState(htmlCode);

  const [useCustomHTML, setUseCustomHTML] = useState(false);

  const isEdited = cssCode !== defaultCSS || htmlInput !== htmlCode;

  const wrapperId = `bm-live-output-${id}`;

  const scopeCSS = useCallback((css) => {
    return css
      .split("}")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        const braceIndex = trimmed.lastIndexOf("{");
        if (braceIndex === -1) return "";
        const selector = trimmed.substring(0, braceIndex).trim();
        const declarations = trimmed.substring(braceIndex + 1).trim();
        const scopedSelectors = selector
          .split(",")
          .map((s) => `#${wrapperId} ${s.trim()}`)
          .join(", ");
        return `${scopedSelectors} { ${declarations} }`;
      })
      .join("\n");
  }, [wrapperId]);

  const handleApply = () => {
    setAppliedCSS(cssCode);
    setAppliedHTML(htmlInput);
    if (htmlInput !== htmlCode) {
      setUseCustomHTML(true);
    }
  };

  const handleReset = () => {
    setCssCode(defaultCSS);
    setAppliedCSS(defaultCSS);
    setHtmlInput(htmlCode);
    setAppliedHTML(htmlCode);
    setUseCustomHTML(false);
  };

  const makeKeyHandler = (value, setter) => (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd);
      setter(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  return (
    <section className="bm-section">
      <h2>{title}</h2>
      <p className="bm-description">{description}</p>

      <div className="bm-section-layout">
        {/* ======== LEFT: Editors + Live Output ======== */}
        <div className="bm-section-left">
          <div className="bm-code-label bm-css-label">🎨 CSS <span className="bm-editable-hint">( ✏️ Editable )</span></div>
          <div className="bm-css-editor-wrapper">
            <textarea
              className={`bm-css-editor${cssCode !== defaultCSS ? " bm-css-edited" : ""}`}
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              onKeyDown={makeKeyHandler(cssCode, setCssCode)}
              spellCheck={false}
              rows={Math.max(cssCode.split("\n").length, 3)}
            />
          </div>

          <div className="bm-code-label bm-html-label">📄 HTML <span className="bm-editable-hint">( ✏️ Editable )</span></div>
          <div className="bm-html-editor-wrapper">
            <textarea
              className={`bm-html-editor${htmlInput !== htmlCode ? " bm-html-edited" : ""}`}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              onKeyDown={makeKeyHandler(htmlInput, setHtmlInput)}
              spellCheck={false}
              rows={Math.max(htmlInput.split("\n").length, 3)}
            />
          </div>

          <div className="bm-editor-actions">
            <button className="bm-btn-apply" onClick={handleApply} title="Apply CSS & HTML (Ctrl+Enter)">▶ Apply</button>
            <button className="bm-btn-reset" onClick={handleReset} title="Reset CSS & HTML to original">↺ Reset</button>
            {isEdited && <span className="bm-edited-badge">Modified</span>}
          </div>

          <div className="bm-code-label bm-output-label">👁️ Live Output</div>
          <div className="bm-demo" id={wrapperId}>
            <style>{scopeCSS(appliedCSS)}</style>
            {useCustomHTML ? (
              <div dangerouslySetInnerHTML={{ __html: appliedHTML }} />
            ) : (
              children
            )}
          </div>

          {/* ======== Box Model Diagram ======== */}
          {diagram && <BoxModelDiagram {...diagram} />}
        </div>

        {/* ======== RIGHT: Description / Notes Panel ======== */}
        {notes && (
          <aside className="bm-section-right">
            <div className="bm-notes-panel">
              <div className="bm-notes-title">📖 Explanation</div>
              <div className="bm-notes-content" dangerouslySetInnerHTML={{ __html: notes }} />
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};


/* =========================================================
   MAIN COMPONENT — Complete CSS Box Model (Paginated)
   Only ONE topic visible at a time with arrow navigation
   ========================================================= */
const BoxModel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sections = [

    /* =====================================================
       1. INTRODUCTION — What is the Box Model?
       ===================================================== */
    <BoxModelSection
      key="1" id="1-intro"
      title="1. The CSS Box Model — Introduction"
      description="Every HTML element is a rectangular box. The box model describes how content, padding, border, and margin work together."
      diagram={{ margin: [20, 20, 20, 20], border: [5, 5, 5, 5], padding: [20, 20, 20, 20], content: [250, "auto"], highlight: "all" }}
      defaultCSS={`.box-intro {\n  width: 250px;\n  padding: 20px;\n  border: 5px solid #1976d2;\n  margin: 20px;\n  background: #e3f2fd;\n  font-family: 'Segoe UI', sans-serif;\n}`}
      htmlCode={`<div class="box-intro">\n  I am a box! I have content, padding, border, and margin.\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What is the Box Model?</div>Every element in CSS is treated as a <b>rectangular box</b>. The box model is the foundation of CSS layout and consists of <b>4 layers</b>:<br/><br/>
        <div style="text-align:center; font-size:1.1em;">
          <code>Margin → Border → Padding → Content</code>
        </div></div>
        <div class="note-section"><div class="note-section-title">📦 The 4 Layers (Outside → Inside)</div>
        <ol>
          <li><b>Margin</b> — Space <em>outside</em> the border (transparent, pushes other elements away)</li>
          <li><b>Border</b> — The edge of the box (visible, has color, width, style)</li>
          <li><b>Padding</b> — Space <em>inside</em> the border, around the content (takes background color)</li>
          <li><b>Content</b> — The actual text, image, or child elements</li>
        </ol></div>
        <div class="note-section"><div class="note-section-title">📐 Total Width Calculation</div>
        <code>Total width = margin-left + border-left + padding-left + content width + padding-right + border-right + margin-right</code><br/><br/>
        Same logic applies to height vertically.</div>
        <div class="note-section"><div class="note-section-title">💡 Remember</div>By default, <code>width</code> and <code>height</code> only set the <b>content</b> size. Padding and border are <b>added on top</b>. This can be changed with <code>box-sizing</code>.</div>
      `}
    >
      <div className="box-intro" style={{ width: "250px", padding: "20px", border: "5px solid #1976d2", margin: "20px", background: "#e3f2fd" }}>
        I am a box! I have content, padding, border, and margin.
      </div>
    </BoxModelSection>,

    /* =====================================================
       2. CONTENT — width & height
       ===================================================== */
    <BoxModelSection
      key="2" id="2-content"
      title="2. Content Area — width & height"
      description="The content area is where your text and child elements appear. Controlled by width and height properties."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [20, 20, 20, 20], content: [250, 80], highlight: "content" }}
      defaultCSS={`.content-box {\n  width: 300px;\n  height: 100px;\n  background: #c8e6c9;\n  color: #1b5e20;\n  font-weight: bold;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.1em;\n}`}
      htmlCode={`<div class="content-box">\n  300px wide × 100px tall\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The <b>content area</b> is the innermost layer — it holds text, images, or child elements.<br/><br/>
        <code>width</code> — sets horizontal size of the content<br/>
        <code>height</code> — sets vertical size of the content</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>px</code> — fixed pixels: <code>width: 300px;</code></li>
          <li><code>%</code> — percentage of parent: <code>width: 50%;</code></li>
          <li><code>em/rem</code> — relative to font size: <code>width: 20em;</code></li>
          <li><code>vw/vh</code> — viewport units: <code>width: 50vw;</code></li>
          <li><code>auto</code> — browser calculates (default for block elements = 100% of parent)</li>
          <li><code>fit-content</code> — shrinks to fit the content</li>
          <li><code>max-content</code> — as wide as the content needs (no wrapping)</li>
          <li><code>min-content</code> — as narrow as possible (wraps aggressively)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Default behavior</div>By default, <code>width</code> and <code>height</code> set only the <b>content</b> size. Padding and border are added on top, making the total box bigger. Use <code>box-sizing: border-box;</code> to include padding and border in the specified width/height.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Avoid setting fixed heights on text containers — content can overflow! Use <code>min-height</code> instead.</div>
      `}
    >
      <div style={{ width: "300px", height: "100px", background: "#c8e6c9", color: "#1b5e20", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1em" }}>
        300px wide × 100px tall
      </div>
    </BoxModelSection>,

    /* =====================================================
       3. PADDING
       ===================================================== */
    <BoxModelSection
      key="3" id="3-padding"
      title="3. Padding"
      description="Padding is the space between the content and the border. It takes the background color of the element."
      diagram={{ margin: [0, 0, 0, 0], border: [2, 2, 2, 2], padding: [10, 30, 40, 50], content: [200, "auto"], highlight: "padding" }}
      defaultCSS={`.padding-demo {\n  background: #fff9c4;\n  border: 2px solid #f57f17;\n  padding-top: 10px;\n  padding-right: 30px;\n  padding-bottom: 40px;\n  padding-left: 50px;\n  font-weight: bold;\n}`}
      htmlCode={`<div class="padding-demo">\n  Notice different padding on each side!\n  Top: 10px | Right: 30px | Bottom: 40px | Left: 50px\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Padding creates space <b>inside</b> the element, between the content and the border. The padding area takes the element's <b>background color</b>.</div>
        <div class="note-section"><div class="note-section-title">📐 Individual Sides</div><ul>
          <li><code>padding-top: 10px;</code></li>
          <li><code>padding-right: 30px;</code></li>
          <li><code>padding-bottom: 40px;</code></li>
          <li><code>padding-left: 50px;</code></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚡ Shorthand</div>
        <ul>
          <li><code>padding: 20px;</code> → all 4 sides = 20px</li>
          <li><code>padding: 10px 20px;</code> → top/bottom = 10px, left/right = 20px</li>
          <li><code>padding: 10px 20px 30px;</code> → top = 10px, left/right = 20px, bottom = 30px</li>
          <li><code>padding: 10px 20px 30px 40px;</code> → top, right, bottom, left (clockwise ⏰)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Important</div><ul>
          <li>Padding <b>cannot be negative</b></li>
          <li>Padding is <b>added to the element's width/height</b> (unless <code>box-sizing: border-box</code>)</li>
          <li>Padding takes the element's <b>background color</b>, unlike margin</li>
          <li>You can use <code>%</code> values — they're relative to the <b>parent's width</b> (even for top/bottom!)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>The clockwise mnemonic: <b>T</b>op → <b>R</b>ight → <b>B</b>ottom → <b>L</b>eft = <b>TRouBLe</b> 🕐</div>
      `}
    >
      <div style={{ background: "#fff9c4", border: "2px solid #f57f17", paddingTop: "10px", paddingRight: "30px", paddingBottom: "40px", paddingLeft: "50px", fontWeight: "bold" }}>
        Notice different padding on each side!<br />
        Top: 10px | Right: 30px | Bottom: 40px | Left: 50px
      </div>
    </BoxModelSection>,

    /* =====================================================
       4. BORDER — Basics
       ===================================================== */
    <BoxModelSection
      key="4" id="4-border"
      title="4. Border — Basics"
      description="The border wraps around the padding and content. It has width, style, and color."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [15, 15, 15, 15], content: [200, "auto"], highlight: "border" }}
      defaultCSS={`.border-solid {\n  border: 3px solid #1976d2;\n  padding: 15px;\n  margin-bottom: 10px;\n}\n.border-dashed {\n  border: 3px dashed #d32f2f;\n  padding: 15px;\n  margin-bottom: 10px;\n}\n.border-dotted {\n  border: 3px dotted #388e3c;\n  padding: 15px;\n  margin-bottom: 10px;\n}\n.border-double {\n  border: 5px double #6a1b9a;\n  padding: 15px;\n  margin-bottom: 10px;\n}\n.border-groove {\n  border: 5px groove #ff6f00;\n  padding: 15px;\n  margin-bottom: 10px;\n}`}
      htmlCode={`<div class="border-solid">solid border</div>\n<div class="border-dashed">dashed border</div>\n<div class="border-dotted">dotted border</div>\n<div class="border-double">double border</div>\n<div class="border-groove">groove border</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The <b>border</b> is a visible line that wraps around the padding and content. Every border has 3 sub-properties:<br/>
        <code>border: [width] [style] [color];</code></div>
        <div class="note-section"><div class="note-section-title">🎨 Border Styles</div><ul>
          <li><code>solid</code> — continuous line (most common)</li>
          <li><code>dashed</code> — series of dashes</li>
          <li><code>dotted</code> — series of dots</li>
          <li><code>double</code> — two parallel lines</li>
          <li><code>groove</code> — 3D grooved effect</li>
          <li><code>ridge</code> — 3D ridged effect</li>
          <li><code>inset</code> — 3D inset effect</li>
          <li><code>outset</code> — 3D outset effect</li>
          <li><code>none</code> — no border (default)</li>
          <li><code>hidden</code> — same as none but wins in table border conflicts</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📐 Individual Sides</div>
        <code>border-top: 3px solid red;</code><br/>
        <code>border-right: 2px dashed blue;</code><br/>
        <code>border-bottom: 4px dotted green;</code><br/>
        <code>border-left: 1px solid black;</code></div>
        <div class="note-section"><div class="note-section-title">⚠️ Important</div><code>border-style</code> is <b>required</b>! Without it (or with <code>none</code>), no border shows even if width and color are set.</div>
      `}
    >
      <div style={{ border: "3px solid #1976d2", padding: "15px", marginBottom: "10px" }}>solid border</div>
      <div style={{ border: "3px dashed #d32f2f", padding: "15px", marginBottom: "10px" }}>dashed border</div>
      <div style={{ border: "3px dotted #388e3c", padding: "15px", marginBottom: "10px" }}>dotted border</div>
      <div style={{ border: "5px double #6a1b9a", padding: "15px", marginBottom: "10px" }}>double border</div>
      <div style={{ border: "5px groove #ff6f00", padding: "15px" }}>groove border</div>
    </BoxModelSection>,

    /* =====================================================
       5. BORDER — Individual Side Properties
       ===================================================== */
    <BoxModelSection
      key="5" id="5-border-sides"
      title="5. Border — Individual Sides"
      description="You can set different border styles on each side of an element independently."
      diagram={{ margin: [0, 0, 0, 0], border: [2, 4, 6, 8], padding: [15, 15, 15, 15], content: [200, "auto"], highlight: "border" }}
      defaultCSS={`.border-sides {\n  border-top: 4px solid #d32f2f;\n  border-right: 4px dashed #1976d2;\n  border-bottom: 4px dotted #388e3c;\n  border-left: 4px double #ff6f00;\n  padding: 20px;\n  background: #fafafa;\n}`}
      htmlCode={`<div class="border-sides">\n  Top: solid red | Right: dashed blue\n  Bottom: dotted green | Left: double orange\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 Individual Side Borders</div>Each side can have its own <b>width, style, and color</b>:<br/><br/>
        <code>border-top: 4px solid red;</code><br/>
        <code>border-right: 4px dashed blue;</code><br/>
        <code>border-bottom: 4px dotted green;</code><br/>
        <code>border-left: 4px double orange;</code></div>
        <div class="note-section"><div class="note-section-title">📐 Sub-properties for each side</div><ul>
          <li><code>border-top-width</code>, <code>border-top-style</code>, <code>border-top-color</code></li>
          <li><code>border-right-width</code>, <code>border-right-style</code>, <code>border-right-color</code></li>
          <li><code>border-bottom-width</code>, <code>border-bottom-style</code>, <code>border-bottom-color</code></li>
          <li><code>border-left-width</code>, <code>border-left-style</code>, <code>border-left-color</code></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 Width Shorthand</div>
        <code>border-width: 2px 4px 6px 8px;</code> → top, right, bottom, left (clockwise TRouBLe ⏰)</div>
        <div class="note-section"><div class="note-section-title">💡 Common Pattern</div>Using <code>border-left</code> or <code>border-bottom</code> alone for accent styling on cards, nav items, or blockquotes.</div>
      `}
    >
      <div style={{ borderTop: "4px solid #d32f2f", borderRight: "4px dashed #1976d2", borderBottom: "4px dotted #388e3c", borderLeft: "4px double #ff6f00", padding: "20px", background: "#fafafa" }}>
        Top: solid red | Right: dashed blue<br />
        Bottom: dotted green | Left: double orange
      </div>
    </BoxModelSection>,

    /* =====================================================
       6. BORDER-RADIUS
       ===================================================== */
    <BoxModelSection
      key="6" id="6-border-radius"
      title="6. Border Radius (Rounded Corners)"
      description="border-radius rounds the corners of an element's border."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [20, 20, 20, 20], content: [150, 150], highlight: "border" }}
      defaultCSS={`.radius-small {\n  border: 3px solid #1976d2;\n  border-radius: 8px;\n  padding: 15px;\n  margin-bottom: 10px;\n  background: #e3f2fd;\n}\n.radius-pill {\n  border: 3px solid #388e3c;\n  border-radius: 50px;\n  padding: 12px 30px;\n  margin-bottom: 10px;\n  background: #e8f5e9;\n  display: inline-block;\n}\n.radius-circle {\n  width: 80px;\n  height: 80px;\n  border: 3px solid #d32f2f;\n  border-radius: 50%;\n  background: #ffebee;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 10px;\n}\n.radius-individual {\n  border: 3px solid #6a1b9a;\n  border-radius: 20px 0 20px 0;\n  padding: 15px;\n  background: #f3e5f5;\n}`}
      htmlCode={`<div class="radius-small">border-radius: 8px</div>\n<div class="radius-pill">Pill shape (50px)</div>\n<br/><br/>\n<div class="radius-circle">50%</div>\n<div class="radius-individual">20px 0 20px 0 (diagonal)</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>border-radius</code> rounds the corners of an element. It affects the border AND the background.</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>border-radius: 8px;</code> → all 4 corners equally</li>
          <li><code>border-radius: 50%;</code> → perfect circle (if width = height)</li>
          <li><code>border-radius: 50px;</code> → pill / capsule shape on short elements</li>
          <li><code>border-radius: 10px 20px 30px 40px;</code> → top-left, top-right, bottom-right, bottom-left</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📐 Individual Corners</div>
        <code>border-top-left-radius: 10px;</code><br/>
        <code>border-top-right-radius: 20px;</code><br/>
        <code>border-bottom-right-radius: 30px;</code><br/>
        <code>border-bottom-left-radius: 40px;</code></div>
        <div class="note-section"><div class="note-section-title">🔧 Elliptical Corners</div>
        <code>border-radius: 50px / 25px;</code> → horizontal-radius / vertical-radius for oval shapes.</div>
        <div class="note-section"><div class="note-section-title">💡 Common Patterns</div><ul>
          <li>Cards: <code>border-radius: 8px–16px</code></li>
          <li>Buttons: <code>border-radius: 4px–8px</code> or pill shape</li>
          <li>Avatars: <code>border-radius: 50%</code></li>
        </ul></div>
      `}
    >
      <div style={{ border: "3px solid #1976d2", borderRadius: "8px", padding: "15px", marginBottom: "10px", background: "#e3f2fd" }}>border-radius: 8px</div>
      <div style={{ border: "3px solid #388e3c", borderRadius: "50px", padding: "12px 30px", marginBottom: "10px", background: "#e8f5e9", display: "inline-block" }}>Pill shape (50px)</div>
      <br /><br />
      <div style={{ width: "80px", height: "80px", border: "3px solid #d32f2f", borderRadius: "50%", background: "#ffebee", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>50%</div>
      <div style={{ border: "3px solid #6a1b9a", borderRadius: "20px 0 20px 0", padding: "15px", background: "#f3e5f5" }}>20px 0 20px 0 (diagonal)</div>
    </BoxModelSection>,

    /* =====================================================
       7. MARGIN
       ===================================================== */
    <BoxModelSection
      key="7" id="7-margin"
      title="7. Margin"
      description="Margin is the space outside the border. It creates distance between elements and is always transparent."
      diagram={{ margin: [10, 30, 40, 50], border: [2, 2, 2, 2], padding: [15, 15, 15, 15], content: [200, "auto"], highlight: "margin" }}
      defaultCSS={`.margin-box-1 {\n  background: #bbdefb;\n  padding: 15px;\n  border: 2px solid #1976d2;\n  margin-bottom: 30px;\n}\n.margin-box-2 {\n  background: #c8e6c9;\n  padding: 15px;\n  border: 2px solid #388e3c;\n  margin-top: 20px;\n  margin-left: 50px;\n}`}
      htmlCode={`<div class="margin-box-1">\n  Box 1: margin-bottom: 30px\n</div>\n<div class="margin-box-2">\n  Box 2: margin-top: 20px, margin-left: 50px\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Margin is the <b>outermost layer</b> of the box model. It creates space <b>outside</b> the border, pushing other elements away. Margin is always <b>transparent</b> (doesn't take background color).</div>
        <div class="note-section"><div class="note-section-title">📐 Individual Sides</div><ul>
          <li><code>margin-top: 10px;</code></li>
          <li><code>margin-right: 20px;</code></li>
          <li><code>margin-bottom: 30px;</code></li>
          <li><code>margin-left: 40px;</code></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚡ Shorthand</div>
        Same as padding shorthand (clockwise TRouBLe ⏰):<br/>
        <code>margin: 10px;</code> → all 4 sides<br/>
        <code>margin: 10px 20px;</code> → top/bottom, left/right<br/>
        <code>margin: 10px 20px 30px 40px;</code> → top, right, bottom, left</div>
        <div class="note-section"><div class="note-section-title">⚠️ Margin can be NEGATIVE!</div>
        <code>margin-top: -20px;</code> pulls the element upward, overlapping with the element above. Useful for overlapping layouts.</div>
        <div class="note-section"><div class="note-section-title">🎯 margin: auto</div>
        <code>margin: 0 auto;</code> centers a block element horizontally (element must have a defined width).<br/>
        This is one of the most classic centering techniques in CSS!</div>
        <div class="note-section"><div class="note-section-title">💡 Key Difference: Margin vs Padding</div>
        <b>Padding</b> = inside the border (takes background)<br/>
        <b>Margin</b> = outside the border (always transparent)</div>
      `}
    >
      <div style={{ background: "#bbdefb", padding: "15px", border: "2px solid #1976d2", marginBottom: "30px" }}>
        Box 1: margin-bottom: 30px
      </div>
      <div style={{ background: "#c8e6c9", padding: "15px", border: "2px solid #388e3c", marginTop: "20px", marginLeft: "50px" }}>
        Box 2: margin-top: 20px, margin-left: 50px
      </div>
    </BoxModelSection>,

    /* =====================================================
       8. MARGIN COLLAPSING
       ===================================================== */
    <BoxModelSection
      key="8" id="8-margin-collapse"
      title="8. Margin Collapsing"
      description="When vertical margins of two block elements touch, they collapse into a single margin (the larger one wins)."
      diagram={{ margin: [0, 0, 40, 0], border: [2, 2, 2, 2], padding: [15, 15, 15, 15], content: [200, "auto"], highlight: "margin" }}
      defaultCSS={`.collapse-box-1 {\n  background: #ffcdd2;\n  padding: 15px;\n  border: 2px solid #d32f2f;\n  margin-bottom: 40px;\n}\n.collapse-box-2 {\n  background: #c8e6c9;\n  padding: 15px;\n  border: 2px solid #388e3c;\n  margin-top: 25px;\n}\n.collapse-info {\n  font-size: 0.85em;\n  color: #666;\n  margin-top: 15px;\n  padding: 10px;\n  background: #fff3e0;\n  border-left: 4px solid #ff9800;\n}`}
      htmlCode={`<div class="collapse-box-1">\n  Box 1: margin-bottom: 40px\n</div>\n<div class="collapse-box-2">\n  Box 2: margin-top: 25px\n</div>\n<div class="collapse-info">\n  ⚠️ Gap between them is 40px (NOT 65px).\n  The margins collapse — the larger one wins!\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What is Margin Collapsing?</div>When <b>vertical margins</b> of two adjacent block-level elements touch, they don't add up. Instead, they <b>collapse into one margin</b> — the larger value wins.<br/><br/>
        Example: Box 1 has <code>margin-bottom: 40px</code>, Box 2 has <code>margin-top: 25px</code>.<br/>
        Result: gap = <b>40px</b> (not 40 + 25 = 65px).</div>
        <div class="note-section"><div class="note-section-title">📐 When does it happen?</div><ul>
          <li><b>Adjacent siblings</b> — vertical margins between two elements</li>
          <li><b>Parent & first/last child</b> — parent's margin-top + child's margin-top collapse</li>
          <li><b>Empty blocks</b> — top and bottom margin of an empty element collapse with each other</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🚫 When does it NOT happen?</div><ul>
          <li>Horizontal margins — they <b>never</b> collapse</li>
          <li>Elements with <code>overflow: hidden/auto/scroll</code></li>
          <li>Flex and Grid children</li>
          <li>Floated elements</li>
          <li>Elements with padding or border between them</li>
          <li>Absolutely/fixedly positioned elements</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 How to prevent it</div>
        <ul>
          <li>Use <code>padding</code> instead of margin</li>
          <li>Add a border: <code>border-top: 1px solid transparent;</code></li>
          <li>Use <code>overflow: hidden;</code> on parent</li>
          <li>Use Flexbox or Grid (margins don't collapse in flex/grid)</li>
        </ul></div>
      `}
    >
      <div style={{ background: "#ffcdd2", padding: "15px", border: "2px solid #d32f2f", marginBottom: "40px" }}>
        Box 1: margin-bottom: 40px
      </div>
      <div style={{ background: "#c8e6c9", padding: "15px", border: "2px solid #388e3c", marginTop: "25px" }}>
        Box 2: margin-top: 25px
      </div>
      <div style={{ fontSize: "0.85em", color: "#666", marginTop: "15px", padding: "10px", background: "#fff3e0", borderLeft: "4px solid #ff9800" }}>
        ⚠️ Gap between them is 40px (NOT 65px). The margins collapse — the larger one wins!
      </div>
    </BoxModelSection>,

    /* =====================================================
       9. MARGIN AUTO — Centering
       ===================================================== */
    <BoxModelSection
      key="9" id="9-margin-auto"
      title="9. margin: auto — Centering Elements"
      description="Using margin: auto to center block elements horizontally is one of the most fundamental CSS techniques."
      diagram={{ margin: [0, "auto", 0, "auto"], border: [3, 3, 3, 3], padding: [20, 20, 20, 20], content: [300, "auto"], highlight: "margin" }}
      defaultCSS={`.center-box {\n  width: 300px;\n  margin: 0 auto;\n  background: #e8eaf6;\n  border: 3px solid #3f51b5;\n  padding: 20px;\n  text-align: center;\n  font-weight: bold;\n}\n.left-auto {\n  width: 200px;\n  margin-left: auto;\n  background: #fce4ec;\n  border: 2px solid #c62828;\n  padding: 10px;\n  margin-top: 15px;\n  text-align: center;\n}`}
      htmlCode={`<div class="center-box">\n  margin: 0 auto → CENTERED!\n</div>\n<div class="left-auto">\n  margin-left: auto → RIGHT aligned!\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 How margin: auto works</div>When you set <code>margin-left: auto</code> and <code>margin-right: auto</code> (or shorthand <code>margin: 0 auto</code>), the browser distributes the remaining space equally on both sides → <b>centering</b> the element.</div>
        <div class="note-section"><div class="note-section-title">📐 Requirements</div><ul>
          <li>The element must have a <b>defined width</b> (not <code>auto</code>)</li>
          <li>The element must be <b>block-level</b> (or <code>display: block</code>)</li>
          <li>Only works for <b>horizontal</b> centering (not vertical)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🎯 Common Patterns</div><ul>
          <li><code>margin: 0 auto;</code> → centered, no top/bottom margin</li>
          <li><code>margin: 20px auto;</code> → centered + 20px top/bottom gap</li>
          <li><code>margin-left: auto;</code> → pushes element to the <b>right</b></li>
          <li><code>margin-right: auto;</code> → pushes element to the <b>left</b></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Modern Alternatives</div>
        For vertical + horizontal centering, use Flexbox:<br/>
        <code>display: flex; justify-content: center; align-items: center;</code></div>
      `}
    >
      <div style={{ width: "300px", margin: "0 auto", background: "#e8eaf6", border: "3px solid #3f51b5", padding: "20px", textAlign: "center", fontWeight: "bold" }}>
        margin: 0 auto → CENTERED!
      </div>
      <div style={{ width: "200px", marginLeft: "auto", background: "#fce4ec", border: "2px solid #c62828", padding: "10px", marginTop: "15px", textAlign: "center" }}>
        margin-left: auto → RIGHT aligned!
      </div>
    </BoxModelSection>,

    /* =====================================================
       10. BOX-SIZING
       ===================================================== */
    <BoxModelSection
      key="10" id="10-box-sizing"
      title="10. box-sizing: content-box vs border-box"
      description="box-sizing controls whether padding and border are included in or added to the element's width/height."
      diagram={{ margin: [0, 0, 0, 0], border: [5, 5, 5, 5], padding: [20, 20, 20, 20], content: [200, "auto"], highlight: "all" }}
      defaultCSS={`.content-box-demo {\n  box-sizing: content-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #d32f2f;\n  background: #ffcdd2;\n  margin-bottom: 15px;\n}\n.border-box-demo {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid #1976d2;\n  background: #bbdefb;\n}\n.size-label {\n  font-size: 0.85em;\n  color: #555;\n  margin-top: 5px;\n}`}
      htmlCode={`<div class="content-box-demo">\n  content-box (default)\n  <div class="size-label">width:200px + 40px pad + 10px border = 250px total</div>\n</div>\n<div class="border-box-demo">\n  border-box ✅\n  <div class="size-label">width:200px INCLUDES padding & border = 200px total</div>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>box-sizing</code> determines how <code>width</code> and <code>height</code> are calculated for an element.</div>
        <div class="note-section"><div class="note-section-title">📦 content-box (DEFAULT)</div>
        <code>width</code> and <code>height</code> only apply to the <b>content</b>. Padding and border are <b>added on top</b>.<br/><br/>
        Total width = width + padding-left + padding-right + border-left + border-right<br/>
        <b>200px + 20px + 20px + 5px + 5px = 250px!</b></div>
        <div class="note-section"><div class="note-section-title">📦 border-box ✅ (Recommended)</div>
        <code>width</code> and <code>height</code> <b>include</b> padding and border. Content area shrinks to fit.<br/><br/>
        Total width = exactly <b>200px</b>! Content area = 200 - 40 - 10 = 150px.<br/>
        This is <b>much more intuitive</b> and predictable!</div>
        <div class="note-section"><div class="note-section-title">⚡ Universal Reset (Best Practice)</div>
        <code>*, *::before, *::after {<br/>&nbsp;&nbsp;box-sizing: border-box;<br/>}</code><br/><br/>
        This is in virtually every CSS reset / normalize. Makes layout <b>much easier</b> to reason about.</div>
        <div class="note-section"><div class="note-section-title">💡 This is CRITICAL</div>Understanding box-sizing is one of the most important concepts in CSS. <code>border-box</code> is universally recommended.</div>
      `}
    >
      <div style={{ boxSizing: "content-box", width: "200px", padding: "20px", border: "5px solid #d32f2f", background: "#ffcdd2", marginBottom: "15px" }}>
        content-box (default)
        <div style={{ fontSize: "0.85em", color: "#555", marginTop: "5px" }}>width:200 + 40pad + 10border = <b>250px total!</b></div>
      </div>
      <div style={{ boxSizing: "border-box", width: "200px", padding: "20px", border: "5px solid #1976d2", background: "#bbdefb" }}>
        border-box ✅
        <div style={{ fontSize: "0.85em", color: "#555", marginTop: "5px" }}>width:200 INCLUDES all = <b>200px total!</b></div>
      </div>
    </BoxModelSection>,

    /* =====================================================
       11. WIDTH — min-width, max-width
       ===================================================== */
    <BoxModelSection
      key="11" id="11-min-max-width"
      title="11. min-width & max-width"
      description="min-width and max-width set boundaries for how narrow or wide an element can be."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [20, 20, 20, 20], content: ["80%", "auto"], highlight: "content" }}
      defaultCSS={`.min-max-box {\n  min-width: 150px;\n  max-width: 400px;\n  width: 80%;\n  background: #e8f5e9;\n  border: 3px solid #388e3c;\n  padding: 20px;\n  font-weight: bold;\n}\n.info-text {\n  font-size: 0.85em;\n  color: #666;\n  margin-top: 10px;\n}`}
      htmlCode={`<div class="min-max-box">\n  I am 80% wide, but never less than 150px and never more than 400px.\n  <div class="info-text">Resize the browser to see me adapt!</div>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What they do</div>
        <code>min-width</code> — element will <b>never be narrower</b> than this value<br/>
        <code>max-width</code> — element will <b>never be wider</b> than this value<br/><br/>
        They act as <b>constraints</b> on the computed width.</div>
        <div class="note-section"><div class="note-section-title">📐 Priority Rules</div><ul>
          <li>If <code>width</code> &lt; <code>min-width</code> → <code>min-width</code> wins</li>
          <li>If <code>width</code> &gt; <code>max-width</code> → <code>max-width</code> wins</li>
          <li>If <code>min-width</code> &gt; <code>max-width</code> → <code>min-width</code> wins</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 Common Patterns</div><ul>
          <li>Responsive images: <code>img { max-width: 100%; height: auto; }</code></li>
          <li>Content containers: <code>.container { max-width: 1200px; margin: 0 auto; }</code></li>
          <li>Inputs: <code>min-width: 200px;</code> to prevent them from being too small</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>max-width: 100%</code> is the most important responsive pattern — prevents elements from overflowing their parent!</div>
      `}
    >
      <div style={{ minWidth: "150px", maxWidth: "400px", width: "80%", background: "#e8f5e9", border: "3px solid #388e3c", padding: "20px", fontWeight: "bold" }}>
        I am 80% wide, but never less than 150px and never more than 400px.
        <div style={{ fontSize: "0.85em", color: "#666", marginTop: "10px" }}>Resize the browser to see me adapt!</div>
      </div>
    </BoxModelSection>,

    /* =====================================================
       12. HEIGHT — min-height, max-height
       ===================================================== */
    <BoxModelSection
      key="12" id="12-min-max-height"
      title="12. min-height & max-height"
      description="min-height and max-height constrain how short or tall an element can be."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [15, 15, 15, 15], content: ["auto", 100], highlight: "content" }}
      defaultCSS={`.min-h-box {\n  min-height: 100px;\n  background: #e3f2fd;\n  border: 3px solid #1976d2;\n  padding: 15px;\n  margin-bottom: 15px;\n}\n.max-h-box {\n  max-height: 80px;\n  overflow: auto;\n  background: #fff3e0;\n  border: 3px solid #ff6f00;\n  padding: 15px;\n}`}
      htmlCode={`<div class="min-h-box">\n  min-height: 100px (even though my content is short)\n</div>\n<div class="max-h-box">\n  max-height: 80px with overflow: auto.\n  This box has a lot of text.\n  When the content exceeds the max-height,\n  a scrollbar appears.\n  Keep reading to see the scroll!\n  More text here for overflow.\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What they do</div>
        <code>min-height</code> — element is at <b>least</b> this tall (grows if content needs more)<br/>
        <code>max-height</code> — element is at <b>most</b> this tall (content may overflow)</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul>
          <li><code>min-height</code> → hero sections, cards that need minimum space: <code>min-height: 300px;</code></li>
          <li><code>max-height</code> → dropdowns, chat boxes, scrollable areas</li>
          <li>Full viewport height: <code>min-height: 100vh;</code></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ max-height + overflow</div>When content exceeds <code>max-height</code>, it <b>overflows</b> by default. Always pair with:<br/>
        <code>overflow: auto;</code> (scrollbar when needed)<br/>
        <code>overflow: hidden;</code> (clip the excess)<br/>
        <code>overflow: scroll;</code> (always show scrollbar)</div>
        <div class="note-section"><div class="note-section-title">💡 Best Practice</div>Prefer <code>min-height</code> over fixed <code>height</code> for text containers — allows content to grow naturally without overflow issues.</div>
      `}
    >
      <div style={{ minHeight: "100px", background: "#e3f2fd", border: "3px solid #1976d2", padding: "15px", marginBottom: "15px" }}>
        min-height: 100px (even though my content is short)
      </div>
      <div style={{ maxHeight: "80px", overflow: "auto", background: "#fff3e0", border: "3px solid #ff6f00", padding: "15px" }}>
        max-height: 80px with overflow: auto.
        This box has a lot of text.
        When the content exceeds the max-height,
        a scrollbar appears.
        Keep reading to see the scroll!
        More text here for overflow.
      </div>
    </BoxModelSection>,

    /* =====================================================
       13. OUTLINE
       ===================================================== */
    <BoxModelSection
      key="13" id="13-outline"
      title="13. Outline (vs Border)"
      description="Outline is drawn OUTSIDE the border. It does NOT affect layout (no space taken). Commonly used for focus indicators."
      diagram={{ margin: [30, 30, 30, 30], border: [3, 3, 3, 3], padding: [20, 20, 20, 20], content: ["auto", "auto"], highlight: "border" }}
      defaultCSS={`.outline-box {\n  border: 3px solid #1976d2;\n  outline: 4px dashed #d32f2f;\n  outline-offset: 5px;\n  padding: 20px;\n  background: #e3f2fd;\n  margin: 30px;\n}\n.no-outline-btn {\n  padding: 10px 20px;\n  font-size: 1em;\n  background: #388e3c;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  margin-top: 15px;\n}\n.no-outline-btn:focus {\n  outline: 3px solid #ff6f00;\n  outline-offset: 2px;\n}`}
      htmlCode={`<div class="outline-box">\n  I have a blue BORDER and a red dashed OUTLINE.\n  The outline is 5px away (outline-offset).\n</div>\n<button class="no-outline-btn">Tab to me → focus outline!</button>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>outline</code> draws a line <b>outside</b> the border. Unlike border, it does <b>NOT</b> take up space and does <b>NOT</b> affect layout.</div>
        <div class="note-section"><div class="note-section-title">🔄 Outline vs Border</div>
        <table style="width:100%; border-collapse:collapse; font-size:0.9em;">
          <tr style="background:#f5f5f5;"><th style="padding:6px; border:1px solid #ddd;">Feature</th><th style="padding:6px; border:1px solid #ddd;">Border</th><th style="padding:6px; border:1px solid #ddd;">Outline</th></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Takes space?</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td><td style="padding:6px; border:1px solid #ddd;">No ❌</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Part of box model?</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td><td style="padding:6px; border:1px solid #ddd;">No ❌</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Individual sides?</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td><td style="padding:6px; border:1px solid #ddd;">No ❌</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Rounded corners?</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td><td style="padding:6px; border:1px solid #ddd;">Modern browsers ✅</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Offset control?</td><td style="padding:6px; border:1px solid #ddd;">No ❌</td><td style="padding:6px; border:1px solid #ddd;">Yes (outline-offset) ✅</td></tr>
        </table></div>
        <div class="note-section"><div class="note-section-title">📐 Properties</div>
        <code>outline: [width] [style] [color];</code><br/>
        <code>outline-offset: 5px;</code> — gap between outline and border<br/>
        <code>outline-style: solid | dashed | dotted | double | ...</code></div>
        <div class="note-section"><div class="note-section-title">⚠️ Accessibility Warning</div>Never use <code>outline: none;</code> on focusable elements without providing an alternative focus indicator! Focus outlines are critical for keyboard navigation accessibility.</div>
      `}
    >
      <div style={{ border: "3px solid #1976d2", outline: "4px dashed #d32f2f", outlineOffset: "5px", padding: "20px", background: "#e3f2fd", margin: "30px" }}>
        I have a blue BORDER and a red dashed OUTLINE. The outline is 5px away (outline-offset).
      </div>
      <button style={{ padding: "10px 20px", fontSize: "1em", background: "#388e3c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "15px" }}>
        Tab to me → focus outline!
      </button>
    </BoxModelSection>,

    /* =====================================================
       14. OVERFLOW
       ===================================================== */
    <BoxModelSection
      key="14" id="14-overflow"
      title="14. Overflow — visible, hidden, scroll, auto"
      description="overflow controls what happens when content is larger than its container."
      diagram={{ margin: [0, 0, 0, 0], border: [2, 2, 2, 2], padding: [10, 10, 10, 10], content: [200, 60], highlight: "content" }}
      defaultCSS={`.overflow-visible {\n  width: 200px;\n  height: 60px;\n  overflow: visible;\n  background: #ffcdd2;\n  border: 2px solid #d32f2f;\n  padding: 10px;\n  margin-bottom: 50px;\n}\n.overflow-hidden {\n  width: 200px;\n  height: 60px;\n  overflow: hidden;\n  background: #c8e6c9;\n  border: 2px solid #388e3c;\n  padding: 10px;\n  margin-bottom: 15px;\n}\n.overflow-scroll {\n  width: 200px;\n  height: 60px;\n  overflow: scroll;\n  background: #bbdefb;\n  border: 2px solid #1976d2;\n  padding: 10px;\n  margin-bottom: 15px;\n}\n.overflow-auto {\n  width: 200px;\n  height: 60px;\n  overflow: auto;\n  background: #fff9c4;\n  border: 2px solid #f57f17;\n  padding: 10px;\n}`}
      htmlCode={`<div class="overflow-visible">\n  overflow: visible (default) — content spills out of the box! This text is too long.\n</div>\n<div class="overflow-hidden">\n  overflow: hidden — extra content is clipped and invisible! This text is too long.\n</div>\n<div class="overflow-scroll">\n  overflow: scroll — always shows scrollbars. This text is too long to fit.\n</div>\n<div class="overflow-auto">\n  overflow: auto — scrollbar only when needed. This text is too long to fit.\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>overflow</code> controls how content that's <b>larger than its container</b> is handled.</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>visible</code> (default) — content overflows, spilling outside the box</li>
          <li><code>hidden</code> — content is clipped; no scrollbars</li>
          <li><code>scroll</code> — always show scrollbars (even if content fits)</li>
          <li><code>auto</code> — show scrollbars <b>only when needed</b> (most commonly used ✅)</li>
          <li><code>clip</code> — like hidden but forbids programmatic scrolling</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📐 Directional Overflow</div>
        <code>overflow-x: hidden;</code> — horizontal only<br/>
        <code>overflow-y: auto;</code> — vertical only<br/><br/>
        Common pattern: <code>overflow-x: hidden; overflow-y: auto;</code> for vertical-only scrolling.</div>
        <div class="note-section"><div class="note-section-title">🔧 text-overflow</div>
        For single-line text truncation:<br/>
        <code>white-space: nowrap;<br/>overflow: hidden;<br/>text-overflow: ellipsis;</code><br/>
        Shows "..." when text overflows.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>overflow: auto</code> is almost always better than <code>overflow: scroll</code> because it only shows scrollbars when actually needed.</div>
      `}
    >
      <div style={{ width: "200px", height: "60px", overflow: "visible", background: "#ffcdd2", border: "2px solid #d32f2f", padding: "10px", marginBottom: "50px" }}>
        overflow: visible (default) — content spills out of the box! This text is too long.
      </div>
      <div style={{ width: "200px", height: "60px", overflow: "hidden", background: "#c8e6c9", border: "2px solid #388e3c", padding: "10px", marginBottom: "15px" }}>
        overflow: hidden — extra content is clipped and invisible! This text is too long.
      </div>
      <div style={{ width: "200px", height: "60px", overflow: "scroll", background: "#bbdefb", border: "2px solid #1976d2", padding: "10px", marginBottom: "15px" }}>
        overflow: scroll — always shows scrollbars. This text is too long to fit.
      </div>
      <div style={{ width: "200px", height: "60px", overflow: "auto", background: "#fff9c4", border: "2px solid #f57f17", padding: "10px" }}>
        overflow: auto — scrollbar only when needed. This text is too long to fit.
      </div>
    </BoxModelSection>,

    /* =====================================================
       15. TEXT OVERFLOW & ELLIPSIS
       ===================================================== */
    <BoxModelSection
      key="15" id="15-text-overflow"
      title="15. text-overflow & Ellipsis"
      description="Truncate overflowing text with an ellipsis (...) — single line and multi-line techniques."
      diagram={{ margin: [0, 0, 0, 0], border: [2, 2, 2, 2], padding: [10, 10, 10, 10], content: [250, "auto"], highlight: "content" }}
      defaultCSS={`.text-ellipsis {\n  width: 250px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  background: #e3f2fd;\n  border: 2px solid #1976d2;\n  padding: 10px;\n  margin-bottom: 15px;\n}\n.text-multiline {\n  width: 250px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  background: #fff3e0;\n  border: 2px solid #ff6f00;\n  padding: 10px;\n}`}
      htmlCode={`<div class="text-ellipsis">\n  This is a very long single-line text that will be truncated with an ellipsis at the end.\n</div>\n<div class="text-multiline">\n  This is a multi-line text. It will be clamped to 2 lines maximum. Any content beyond the second line will be hidden with an ellipsis. Pretty useful for card descriptions!\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 Single-Line Ellipsis</div>The classic 3-property combo for single-line truncation:<br/><br/>
        <code>white-space: nowrap;</code> — prevent text wrapping<br/>
        <code>overflow: hidden;</code> — hide overflowing text<br/>
        <code>text-overflow: ellipsis;</code> — show "..." at the cut point</div>
        <div class="note-section"><div class="note-section-title">📐 Multi-Line Clamp</div>For limiting to N lines (e.g., 2):<br/><br/>
        <code>display: -webkit-box;<br/>-webkit-line-clamp: 2;<br/>-webkit-box-orient: vertical;<br/>overflow: hidden;</code><br/><br/>
        Despite the <code>-webkit</code> prefix, this works in <b>all modern browsers</b>.</div>
        <div class="note-section"><div class="note-section-title">🔧 text-overflow values</div><ul>
          <li><code>ellipsis</code> — shows "..." (most common)</li>
          <li><code>clip</code> — cuts off without indicator (default)</li>
          <li><code>"custom"</code> — custom string (limited browser support)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Common Uses</div>Card descriptions, table cells, navigation items, email subjects — anywhere text needs to be contained within a fixed space.</div>
      `}
    >
      <div style={{ width: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: "#e3f2fd", border: "2px solid #1976d2", padding: "10px", marginBottom: "15px" }}>
        This is a very long single-line text that will be truncated with an ellipsis at the end.
      </div>
      <div style={{ width: "250px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", background: "#fff3e0", border: "2px solid #ff6f00", padding: "10px" }}>
        This is a multi-line text. It will be clamped to 2 lines maximum. Any content beyond the second line will be hidden with an ellipsis. Pretty useful for card descriptions!
      </div>
    </BoxModelSection>,

    /* =====================================================
       16. DISPLAY PROPERTY
       ===================================================== */
    <BoxModelSection
      key="16" id="16-display"
      title="16. display — block, inline, inline-block, none"
      description="The display property controls how an element participates in layout. It fundamentally changes box behavior."
      diagram={{ margin: [0, 0, 5, 0], border: [2, 2, 2, 2], padding: [8, 8, 8, 8], content: [200, "auto"], highlight: "all" }}
      defaultCSS={`.d-block {\n  display: block;\n  background: #bbdefb;\n  border: 2px solid #1976d2;\n  padding: 8px;\n  margin-bottom: 5px;\n  width: 200px;\n}\n.d-inline {\n  display: inline;\n  background: #c8e6c9;\n  border: 2px solid #388e3c;\n  padding: 8px;\n}\n.d-inline-block {\n  display: inline-block;\n  background: #fff9c4;\n  border: 2px solid #f57f17;\n  padding: 8px;\n  width: 150px;\n  margin-top: 15px;\n}\n.d-none {\n  display: none;\n}`}
      htmlCode={`<div class="d-block">block 1 (200px wide)</div>\n<div class="d-block">block 2 (200px wide)</div>\n<hr/>\n<span class="d-inline">inline A</span>\n<span class="d-inline">inline B</span>\n<span class="d-inline">inline C</span>\n<hr/>\n<span class="d-inline-block">inline-block 1</span>\n<span class="d-inline-block">inline-block 2</span>\n<hr/>\n<div class="d-none">You can't see me! (display: none)</div>\n<div>↑ There's a hidden div above this line.</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 display: block</div><ul>
          <li>Takes <b>full width</b> of parent</li>
          <li>Starts on a <b>new line</b></li>
          <li><code>width</code>, <code>height</code>, <code>margin</code>, <code>padding</code> all work normally</li>
          <li>Default for: <code>&lt;div&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;h1-h6&gt;</code>, <code>&lt;section&gt;</code>, etc.</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📌 display: inline</div><ul>
          <li>Flows <b>on the same line</b> as surrounding content</li>
          <li><code>width</code> and <code>height</code> are <b>IGNORED</b></li>
          <li>Vertical <code>margin</code> and <code>padding</code> don't push other elements</li>
          <li>Default for: <code>&lt;span&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>, etc.</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📌 display: inline-block</div><ul>
          <li>Flows <b>inline</b> (same line) like inline</li>
          <li>But <code>width</code>, <code>height</code>, <code>margin</code>, <code>padding</code> all work like block!</li>
          <li>Best of both worlds — inline flow + block-level box properties</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📌 display: none</div>
        Completely <b>removes</b> the element from layout. It takes <b>no space</b> and is invisible.<br/><br/>
        🔄 <b>vs visibility: hidden</b> — <code>visibility: hidden</code> hides the element but it still takes up space!</div>
        <div class="note-section"><div class="note-section-title">💡 Summary Table</div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85em;">
          <tr style="background:#f5f5f5;"><th style="padding:5px; border:1px solid #ddd;">Display</th><th style="padding:5px; border:1px solid #ddd;">New Line?</th><th style="padding:5px; border:1px solid #ddd;">Width/Height?</th><th style="padding:5px; border:1px solid #ddd;">Margin/Padding?</th></tr>
          <tr><td style="padding:5px; border:1px solid #ddd;">block</td><td style="padding:5px; border:1px solid #ddd;">Yes</td><td style="padding:5px; border:1px solid #ddd;">Yes</td><td style="padding:5px; border:1px solid #ddd;">All directions</td></tr>
          <tr><td style="padding:5px; border:1px solid #ddd;">inline</td><td style="padding:5px; border:1px solid #ddd;">No</td><td style="padding:5px; border:1px solid #ddd;">No</td><td style="padding:5px; border:1px solid #ddd;">Horizontal only</td></tr>
          <tr><td style="padding:5px; border:1px solid #ddd;">inline-block</td><td style="padding:5px; border:1px solid #ddd;">No</td><td style="padding:5px; border:1px solid #ddd;">Yes</td><td style="padding:5px; border:1px solid #ddd;">All directions</td></tr>
          <tr><td style="padding:5px; border:1px solid #ddd;">none</td><td style="padding:5px; border:1px solid #ddd;">-</td><td style="padding:5px; border:1px solid #ddd;">-</td><td style="padding:5px; border:1px solid #ddd;">Removed</td></tr>
        </table></div>
      `}
    >
      <div style={{ display: "block", background: "#bbdefb", border: "2px solid #1976d2", padding: "8px", marginBottom: "5px", width: "200px" }}>block 1 (200px wide)</div>
      <div style={{ display: "block", background: "#bbdefb", border: "2px solid #1976d2", padding: "8px", marginBottom: "5px", width: "200px" }}>block 2 (200px wide)</div>
      <hr />
      <span style={{ display: "inline", background: "#c8e6c9", border: "2px solid #388e3c", padding: "8px" }}>inline A</span>{" "}
      <span style={{ display: "inline", background: "#c8e6c9", border: "2px solid #388e3c", padding: "8px" }}>inline B</span>{" "}
      <span style={{ display: "inline", background: "#c8e6c9", border: "2px solid #388e3c", padding: "8px" }}>inline C</span>
      <hr />
      <span style={{ display: "inline-block", background: "#fff9c4", border: "2px solid #f57f17", padding: "8px", width: "150px" }}>inline-block 1</span>{" "}
      <span style={{ display: "inline-block", background: "#fff9c4", border: "2px solid #f57f17", padding: "8px", width: "150px" }}>inline-block 2</span>
      <hr />
      <div style={{ display: "none" }}>You can't see me! (display: none)</div>
      <div>↑ There's a hidden div above this line.</div>
    </BoxModelSection>,

    /* =====================================================
       17. VISIBILITY
       ===================================================== */
    <BoxModelSection
      key="17" id="17-visibility"
      title="17. visibility — visible, hidden, collapse"
      description="visibility controls whether an element is visible, but unlike display: none, it still takes up space."
      diagram={{ margin: [5, 5, 5, 5], border: [2, 2, 2, 2], padding: [0, 0, 0, 0], content: [100, 60], highlight: "all" }}
      defaultCSS={`.vis-box {\n  display: inline-block;\n  width: 100px;\n  height: 60px;\n  background: #bbdefb;\n  border: 2px solid #1976d2;\n  margin: 5px;\n  text-align: center;\n  line-height: 60px;\n  font-weight: bold;\n}\n.vis-hidden {\n  visibility: hidden;\n}`}
      htmlCode={`<div class="vis-box">Box 1</div>\n<div class="vis-box vis-hidden">Hidden</div>\n<div class="vis-box">Box 3</div>\n<div style="margin-top:10px; font-size: 0.85em; color: #666;">\n  ↑ Box 2 is visibility: hidden — invisible but still takes space!\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>visibility</code> controls whether an element is <b>rendered visually</b>, but it still <b>occupies its space</b> in the layout.</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>visible</code> (default) — element is visible</li>
          <li><code>hidden</code> — element is invisible but still takes space</li>
          <li><code>collapse</code> — for table rows/columns, removes the element like <code>display: none</code></li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔄 visibility: hidden vs display: none</div>
        <table style="width:100%; border-collapse:collapse; font-size:0.9em;">
          <tr style="background:#f5f5f5;"><th style="padding:6px; border:1px solid #ddd;">Feature</th><th style="padding:6px; border:1px solid #ddd;">display: none</th><th style="padding:6px; border:1px solid #ddd;">visibility: hidden</th></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Visible?</td><td style="padding:6px; border:1px solid #ddd;">No</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Takes space?</td><td style="padding:6px; border:1px solid #ddd;">No</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Events fire?</td><td style="padding:6px; border:1px solid #ddd;">No</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Animatable?</td><td style="padding:6px; border:1px solid #ddd;">No</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Children?</td><td style="padding:6px; border:1px solid #ddd;">All hidden</td><td style="padding:6px; border:1px solid #ddd;">Children can override!</td></tr>
        </table></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>visibility: hidden</code> children can be made visible with <code>visibility: visible</code>. This is NOT possible with <code>display: none</code>.</div>
      `}
    >
      <div style={{ display: "inline-block", width: "100px", height: "60px", background: "#bbdefb", border: "2px solid #1976d2", margin: "5px", textAlign: "center", lineHeight: "60px", fontWeight: "bold" }}>Box 1</div>
      <div style={{ display: "inline-block", width: "100px", height: "60px", background: "#bbdefb", border: "2px solid #1976d2", margin: "5px", textAlign: "center", lineHeight: "60px", fontWeight: "bold", visibility: "hidden" }}>Hidden</div>
      <div style={{ display: "inline-block", width: "100px", height: "60px", background: "#bbdefb", border: "2px solid #1976d2", margin: "5px", textAlign: "center", lineHeight: "60px", fontWeight: "bold" }}>Box 3</div>
      <div style={{ marginTop: "10px", fontSize: "0.85em", color: "#666" }}>
        ↑ Box 2 is visibility: hidden — invisible but still takes space!
      </div>
    </BoxModelSection>,

    /* =====================================================
       18. BOX-SHADOW
       ===================================================== */
    <BoxModelSection
      key="18" id="18-box-shadow"
      title="18. box-shadow"
      description="box-shadow adds shadow effects around an element's frame. Supports multiple shadows, inset, spread, and blur."
      diagram={{ margin: [0, 0, 0, 0], border: [0, 0, 0, 0], padding: [20, 20, 20, 20], content: ["auto", "auto"], highlight: "all" }}
      defaultCSS={`.shadow-basic {\n  box-shadow: 5px 5px 10px rgba(0,0,0,0.3);\n  padding: 20px;\n  background: white;\n  border-radius: 8px;\n  margin-bottom: 15px;\n}\n.shadow-inset {\n  box-shadow: inset 0 0 15px rgba(0,0,0,0.2);\n  padding: 20px;\n  background: #f5f5f5;\n  border-radius: 8px;\n  margin-bottom: 15px;\n}\n.shadow-multi {\n  box-shadow: 3px 3px 0 #d32f2f,\n             6px 6px 0 #ff6f00,\n             9px 9px 0 #388e3c;\n  padding: 20px;\n  background: white;\n  border-radius: 8px;\n  margin-bottom: 15px;\n}\n.shadow-glow {\n  box-shadow: 0 0 20px 5px rgba(33,150,243,0.5);\n  padding: 20px;\n  background: white;\n  border-radius: 8px;\n}`}
      htmlCode={`<div class="shadow-basic">Basic shadow (5px 5px 10px)</div>\n<div class="shadow-inset">Inset shadow (inner shadow)</div>\n<div class="shadow-multi">Multiple layered shadows!</div>\n<div class="shadow-glow">Glow effect (0 offset + spread)</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 Syntax</div><code>box-shadow: [inset] [x-offset] [y-offset] [blur] [spread] [color];</code><br/><br/>
        <ul>
          <li><b>x-offset</b> — horizontal shadow position</li>
          <li><b>y-offset</b> — vertical shadow position</li>
          <li><b>blur</b> — how blurry the shadow is (0 = sharp)</li>
          <li><b>spread</b> — how much larger/smaller the shadow is</li>
          <li><b>inset</b> — moves shadow inside the element</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 Common Patterns</div><ul>
          <li>Subtle card shadow: <code>box-shadow: 0 2px 8px rgba(0,0,0,0.1);</code></li>
          <li>Elevated card: <code>box-shadow: 0 4px 20px rgba(0,0,0,0.15);</code></li>
          <li>Glow: <code>box-shadow: 0 0 20px 5px rgba(color, 0.5);</code></li>
          <li>Border alternative: <code>box-shadow: 0 0 0 3px blue;</code> (doesn't affect layout!)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🎨 Multiple Shadows</div>Comma-separate multiple shadows for layered effects:<br/>
        <code>box-shadow: 3px 3px 0 red, 6px 6px 0 orange, 9px 9px 0 green;</code></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>box-shadow</code> does <b>NOT affect layout</b> — it's purely visual and doesn't change the element's size or position. It also respects <code>border-radius</code>!</div>
      `}
    >
      <div style={{ boxShadow: "5px 5px 10px rgba(0,0,0,0.3)", padding: "20px", background: "white", borderRadius: "8px", marginBottom: "15px" }}>Basic shadow (5px 5px 10px)</div>
      <div style={{ boxShadow: "inset 0 0 15px rgba(0,0,0,0.2)", padding: "20px", background: "#f5f5f5", borderRadius: "8px", marginBottom: "15px" }}>Inset shadow (inner shadow)</div>
      <div style={{ boxShadow: "3px 3px 0 #d32f2f, 6px 6px 0 #ff6f00, 9px 9px 0 #388e3c", padding: "20px", background: "white", borderRadius: "8px", marginBottom: "15px" }}>Multiple layered shadows!</div>
      <div style={{ boxShadow: "0 0 20px 5px rgba(33,150,243,0.5)", padding: "20px", background: "white", borderRadius: "8px" }}>Glow effect (0 offset + spread)</div>
    </BoxModelSection>,

    /* =====================================================
       19. BACKGROUND & BOX MODEL
       ===================================================== */
    <BoxModelSection
      key="19" id="19-background-clip"
      title="19. background-clip & background-origin"
      description="background-clip controls where the background is painted. background-origin defines where background positioning starts."
      diagram={{ margin: [0, 0, 0, 0], border: [10, 10, 10, 10], padding: [20, 20, 20, 20], content: ["auto", "auto"], highlight: "all" }}
      defaultCSS={`.bg-border-box {\n  background: #bbdefb;\n  background-clip: border-box;\n  border: 10px dashed #1976d2;\n  padding: 20px;\n  margin-bottom: 15px;\n}\n.bg-padding-box {\n  background: #c8e6c9;\n  background-clip: padding-box;\n  border: 10px dashed #388e3c;\n  padding: 20px;\n  margin-bottom: 15px;\n}\n.bg-content-box {\n  background: #fff9c4;\n  background-clip: content-box;\n  border: 10px dashed #f57f17;\n  padding: 20px;\n}`}
      htmlCode={`<div class="bg-border-box">\n  background-clip: border-box (extends under border)\n</div>\n<div class="bg-padding-box">\n  background-clip: padding-box (stops at border)\n</div>\n<div class="bg-content-box">\n  background-clip: content-box (only behind content)\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 background-clip</div>Controls <b>where the background is painted</b>:<br/><br/><ul>
          <li><code>border-box</code> (default) — background extends under the border</li>
          <li><code>padding-box</code> — background stops at the border (common)</li>
          <li><code>content-box</code> — background only behind content area</li>
          <li><code>text</code> — clips background to text (gradient text effect!)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📌 background-origin</div>Controls <b>where background positioning starts</b>:<br/><br/><ul>
          <li><code>border-box</code> — position relative to border edge</li>
          <li><code>padding-box</code> (default) — position relative to padding edge</li>
          <li><code>content-box</code> — position relative to content edge</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🎨 Gradient Text Trick</div>
        <code>background: linear-gradient(...);<br/>-webkit-background-clip: text;<br/>-webkit-text-fill-color: transparent;</code><br/><br/>
        Creates beautiful gradient text effects!</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use dashed borders to clearly see the difference between clip values in demos.</div>
      `}
    >
      <div style={{ background: "#bbdefb", backgroundClip: "border-box", border: "10px dashed #1976d2", padding: "20px", marginBottom: "15px" }}>
        background-clip: border-box (extends under border)
      </div>
      <div style={{ background: "#c8e6c9", backgroundClip: "padding-box", border: "10px dashed #388e3c", padding: "20px", marginBottom: "15px" }}>
        background-clip: padding-box (stops at border)
      </div>
      <div style={{ background: "#fff9c4", backgroundClip: "content-box", border: "10px dashed #f57f17", padding: "20px" }}>
        background-clip: content-box (only behind content)
      </div>
    </BoxModelSection>,

    /* =====================================================
       20. NEGATIVE MARGINS
       ===================================================== */
    <BoxModelSection
      key="20" id="20-negative-margins"
      title="20. Negative Margins"
      description="Unlike padding, margins can be negative — pulling elements closer or overlapping them."
      diagram={{ margin: [-25, 0, 0, 0], border: [2, 2, 2, 2], padding: [15, 15, 15, 15], content: ["auto", "auto"], highlight: "margin" }}
      defaultCSS={`.neg-container {\n  background: #e0e0e0;\n  padding: 20px;\n  border: 2px solid #757575;\n}\n.neg-box-1 {\n  background: #bbdefb;\n  border: 2px solid #1976d2;\n  padding: 15px;\n  margin-bottom: 10px;\n}\n.neg-box-2 {\n  background: #ffcdd2;\n  border: 2px solid #d32f2f;\n  padding: 15px;\n  margin-top: -25px;\n  margin-left: 40px;\n}`}
      htmlCode={`<div class="neg-container">\n  <div class="neg-box-1">Box 1 (normal margin)</div>\n  <div class="neg-box-2">Box 2 (margin-top: -25px) → overlaps Box 1!</div>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Negative margins <b>pull</b> the element (or its neighbors) <b>closer</b>, causing overlap.<br/><br/>
        <code>margin-top: -25px;</code> → pulls the element 25px upward<br/>
        <code>margin-left: -25px;</code> → pulls the element 25px to the left</div>
        <div class="note-section"><div class="note-section-title">📐 How each side works</div><ul>
          <li><code>margin-top: -N</code> → pulls element UP (overlaps element above)</li>
          <li><code>margin-bottom: -N</code> → pulls element BELOW closer (next sibling moves up)</li>
          <li><code>margin-left: -N</code> → pulls element LEFT</li>
          <li><code>margin-right: -N</code> → pulls next element closer (or expands into margin)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 Use Cases</div><ul>
          <li>Overlapping elements for visual effects</li>
          <li>Breaking out of parent padding: <code>margin-left: -20px; margin-right: -20px;</code></li>
          <li>Removing unwanted gaps from elements</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Caution</div>Negative margins can cause <b>overlapping content</b> and <b>accessibility issues</b>. Use sparingly and test thoroughly. Padding can <b>never</b> be negative.</div>
      `}
    >
      <div style={{ background: "#e0e0e0", padding: "20px", border: "2px solid #757575" }}>
        <div style={{ background: "#bbdefb", border: "2px solid #1976d2", padding: "15px", marginBottom: "10px" }}>Box 1 (normal margin)</div>
        <div style={{ background: "#ffcdd2", border: "2px solid #d32f2f", padding: "15px", marginTop: "-25px", marginLeft: "40px" }}>Box 2 (margin-top: -25px) → overlaps Box 1!</div>
      </div>
    </BoxModelSection>,

    /* =====================================================
       21. BOX MODEL CALCULATION — Complete Example
       ===================================================== */
    <BoxModelSection
      key="21" id="21-calculation"
      title="21. Box Model Calculation — Complete Example"
      description="Let's calculate the total space an element takes with content-box vs border-box."
      diagram={{ margin: [15, 15, 15, 15], border: [5, 5, 5, 5], padding: [20, 20, 20, 20], content: [200, 80], highlight: "all" }}
      defaultCSS={`.calc-content {\n  box-sizing: content-box;\n  width: 200px;\n  height: 80px;\n  padding: 20px;\n  border: 5px solid #d32f2f;\n  margin: 15px;\n  background: #ffcdd2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.85em;\n}\n.calc-border {\n  box-sizing: border-box;\n  width: 200px;\n  height: 80px;\n  padding: 20px;\n  border: 5px solid #1976d2;\n  margin: 15px;\n  background: #bbdefb;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.85em;\n}`}
      htmlCode={`<div class="calc-content">\n  content-box: 250 × 130 total\n</div>\n<div class="calc-border">\n  border-box: 200 × 80 total\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📐 content-box Calculation</div>
        <b>CSS says:</b> width: 200px, height: 80px<br/>
        <b>padding:</b> 20px each side<br/>
        <b>border:</b> 5px each side<br/>
        <b>margin:</b> 15px each side<br/><br/>
        <b>Rendered Width:</b><br/>
        <code>200 + 20 + 20 + 5 + 5 = <b>250px</b></code><br/><br/>
        <b>Rendered Height:</b><br/>
        <code>80 + 20 + 20 + 5 + 5 = <b>130px</b></code><br/><br/>
        <b>Total Space (with margin):</b><br/>
        <code>250 + 15 + 15 = <b>280px wide</b></code><br/>
        <code>130 + 15 + 15 = <b>160px tall</b></code></div>
        <div class="note-section"><div class="note-section-title">📐 border-box Calculation</div>
        <b>CSS says:</b> width: 200px, height: 80px<br/>
        <b>padding:</b> 20px each side<br/>
        <b>border:</b> 5px each side<br/><br/>
        <b>Rendered Width:</b> <code><b>200px</b></code> (padding & border fit inside!)<br/>
        <b>Content Width:</b> <code>200 - 20 - 20 - 5 - 5 = <b>150px</b></code><br/><br/>
        <b>Rendered Height:</b> <code><b>80px</b></code><br/>
        <b>Content Height:</b> <code>80 - 20 - 20 - 5 - 5 = <b>30px</b></code><br/><br/>
        <b>Total Space (with margin):</b><br/>
        <code>200 + 15 + 15 = <b>230px wide</b></code><br/>
        <code>80 + 15 + 15 = <b>110px tall</b></code></div>
        <div class="note-section"><div class="note-section-title">💡 Key Takeaway</div>
        With <code>content-box</code>, the actual rendered box is <b>bigger</b> than the specified width/height.<br/>
        With <code>border-box</code>, the rendered box is <b>exactly</b> the specified width/height.<br/><br/>
        <b>Margin is NEVER included in either box-sizing model.</b> It's always extra space outside.</div>
      `}
    >
      <div style={{ boxSizing: "content-box", width: "200px", height: "80px", padding: "20px", border: "5px solid #d32f2f", margin: "15px", background: "#ffcdd2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85em" }}>
        content-box: 250×130 total
      </div>
      <div style={{ boxSizing: "border-box", width: "200px", height: "80px", padding: "20px", border: "5px solid #1976d2", margin: "15px", background: "#bbdefb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85em" }}>
        border-box: 200×80 total
      </div>
    </BoxModelSection>,

    /* =====================================================
       22. BORDER-IMAGE
       ===================================================== */
    <BoxModelSection
      key="22" id="22-border-image"
      title="22. border-image"
      description="border-image lets you use an image or gradient as the border of an element."
      diagram={{ margin: [0, 0, 0, 0], border: [5, 5, 5, 5], padding: [20, 20, 20, 20], content: ["auto", "auto"], highlight: "border" }}
      defaultCSS={`.border-gradient {\n  border: 5px solid transparent;\n  border-image: linear-gradient(45deg, #d32f2f, #ff6f00, #fdd835, #388e3c, #1976d2, #6a1b9a) 1;\n  padding: 20px;\n  margin-bottom: 15px;\n  font-weight: bold;\n}\n.border-gradient-radius {\n  border: 5px solid;\n  border-image: linear-gradient(to right, #1976d2, #d32f2f) 1;\n  padding: 20px;\n  font-weight: bold;\n}`}
      htmlCode={`<div class="border-gradient">\n  🌈 Rainbow gradient border!\n</div>\n<div class="border-gradient-radius">\n  Blue → Red gradient border\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>border-image</code> replaces the regular border with an <b>image or gradient</b>.</div>
        <div class="note-section"><div class="note-section-title">📐 Syntax</div><code>border-image: [source] [slice] [width] [outset] [repeat];</code><br/><br/>
        Shorthand: <code>border-image: linear-gradient(...) 1;</code></div>
        <div class="note-section"><div class="note-section-title">📐 Sub-properties</div><ul>
          <li><code>border-image-source</code> — the image/gradient to use</li>
          <li><code>border-image-slice</code> — how to slice the image (number or %)</li>
          <li><code>border-image-width</code> — width of the image border</li>
          <li><code>border-image-outset</code> — how far beyond the border box</li>
          <li><code>border-image-repeat</code> — stretch, repeat, round, space</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Gotcha</div><code>border-image</code> does <b>NOT work with border-radius</b>! The corners remain square. For rounded gradient borders, use a pseudo-element technique or <code>background-clip</code>.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>You need <code>border: Npx solid transparent;</code> first, then apply the gradient on top with <code>border-image</code>.</div>
      `}
    >
      <div style={{ border: "5px solid transparent", borderImage: "linear-gradient(45deg, #d32f2f, #ff6f00, #fdd835, #388e3c, #1976d2, #6a1b9a) 1", padding: "20px", marginBottom: "15px", fontWeight: "bold" }}>
        🌈 Rainbow gradient border!
      </div>
      <div style={{ border: "5px solid", borderImage: "linear-gradient(to right, #1976d2, #d32f2f) 1", padding: "20px", fontWeight: "bold" }}>
        Blue → Red gradient border
      </div>
    </BoxModelSection>,

    /* =====================================================
       23. ASPECT-RATIO
       ===================================================== */
    <BoxModelSection
      key="23" id="23-aspect-ratio"
      title="23. aspect-ratio"
      description="aspect-ratio sets a preferred width-to-height ratio for an element, automatically calculating one dimension from the other."
      diagram={{ margin: [0, 0, 0, 0], border: [3, 3, 3, 3], padding: [0, 0, 0, 0], content: [300, 169], highlight: "content" }}
      defaultCSS={`.aspect-16-9 {\n  width: 300px;\n  aspect-ratio: 16 / 9;\n  background: #bbdefb;\n  border: 3px solid #1976d2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: bold;\n  margin-bottom: 15px;\n}\n.aspect-square {\n  width: 120px;\n  aspect-ratio: 1;\n  background: #c8e6c9;\n  border: 3px solid #388e3c;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: bold;\n  border-radius: 8px;\n}`}
      htmlCode={`<div class="aspect-16-9">\n  16:9 (300px wide → 168.75px tall)\n</div>\n<div class="aspect-square">\n  1:1 Square\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>aspect-ratio</code> sets a <b>preferred ratio</b> between width and height. Set one dimension, the other is calculated automatically.</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>aspect-ratio: 16 / 9;</code> → widescreen video ratio</li>
          <li><code>aspect-ratio: 4 / 3;</code> → classic photo ratio</li>
          <li><code>aspect-ratio: 1;</code> or <code>1 / 1</code> → perfect square</li>
          <li><code>aspect-ratio: 2 / 1;</code> → twice as wide as tall</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul>
          <li>Video containers: <code>aspect-ratio: 16/9;</code></li>
          <li>Image placeholders to prevent layout shift</li>
          <li>Card thumbnails, avatar containers</li>
          <li>Responsive squares without the padding hack</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>If both <code>width</code> and <code>height</code> are set, <code>aspect-ratio</code> is ignored. It only calculates the <b>missing</b> dimension.</div>
      `}
    >
      <div style={{ width: "300px", aspectRatio: "16 / 9", background: "#bbdefb", border: "3px solid #1976d2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "15px" }}>
        16:9 (300px wide → 168.75px tall)
      </div>
      <div style={{ width: "120px", aspectRatio: "1", background: "#c8e6c9", border: "3px solid #388e3c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", borderRadius: "8px" }}>
        1:1 Square
      </div>
    </BoxModelSection>,

    /* =====================================================
       24. RESIZE
       ===================================================== */
    <BoxModelSection
      key="24" id="24-resize"
      title="24. resize"
      description="The resize property lets users manually resize an element by dragging its corner."
      diagram={{ margin: [0, 0, 0, 0], border: [2, 2, 2, 2], padding: [15, 15, 15, 15], content: [250, 100], highlight: "content" }}
      defaultCSS={`.resize-both {\n  resize: both;\n  overflow: auto;\n  width: 250px;\n  height: 100px;\n  background: #e3f2fd;\n  border: 2px solid #1976d2;\n  padding: 15px;\n  margin-bottom: 15px;\n}\n.resize-horizontal {\n  resize: horizontal;\n  overflow: auto;\n  width: 250px;\n  background: #fff3e0;\n  border: 2px solid #ff6f00;\n  padding: 15px;\n  margin-bottom: 15px;\n}\n.resize-none {\n  resize: none;\n  width: 250px;\n  background: #ffebee;\n  border: 2px solid #d32f2f;\n  padding: 15px;\n}`}
      htmlCode={`<div class="resize-both">\n  resize: both — drag my bottom-right corner!\n</div>\n<div class="resize-horizontal">\n  resize: horizontal — only width changes\n</div>\n<div class="resize-none">\n  resize: none — can't resize me\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Allows users to <b>resize an element</b> by dragging a handle at the bottom-right corner.</div>
        <div class="note-section"><div class="note-section-title">📐 Values</div><ul>
          <li><code>none</code> (default) — no user resizing</li>
          <li><code>both</code> — resize width and height</li>
          <li><code>horizontal</code> — resize width only</li>
          <li><code>vertical</code> — resize height only</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Requirement</div><code>overflow</code> must be set to something other than <code>visible</code> for resize to work (use <code>overflow: auto;</code>).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul>
          <li><code>&lt;textarea&gt;</code> — has <code>resize: both</code> by default</li>
          <li>Resizable panels in dashboards</li>
          <li>Code editors or text areas</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use <code>min-width</code>, <code>max-width</code>, <code>min-height</code>, <code>max-height</code> to set boundaries for the resizable area.</div>
      `}
    >
      <div style={{ resize: "both", overflow: "auto", width: "250px", height: "100px", background: "#e3f2fd", border: "2px solid #1976d2", padding: "15px", marginBottom: "15px" }}>
        resize: both — drag my bottom-right corner!
      </div>
      <div style={{ resize: "horizontal", overflow: "auto", width: "250px", background: "#fff3e0", border: "2px solid #ff6f00", padding: "15px", marginBottom: "15px" }}>
        resize: horizontal — only width changes
      </div>
      <div style={{ resize: "none", width: "250px", background: "#ffebee", border: "2px solid #d32f2f", padding: "15px" }}>
        resize: none — can't resize me
      </div>
    </BoxModelSection>,

    /* =====================================================
       25. CSS UNITS IN BOX MODEL
       ===================================================== */
    <BoxModelSection
      key="25" id="25-units"
      title="25. CSS Units in the Box Model"
      description="Understanding px, em, rem, %, vw, vh, and other units — and when to use each for box model properties."
      diagram={{ margin: [0, 0, 8, 0], border: [2, 2, 2, 2], padding: [10, 10, 10, 10], content: [200, "auto"], highlight: "all" }}
      defaultCSS={`.unit-px {\n  width: 200px;\n  padding: 10px;\n  background: #bbdefb;\n  border: 2px solid #1976d2;\n  margin-bottom: 8px;\n}\n.unit-percent {\n  width: 50%;\n  padding: 10px;\n  background: #c8e6c9;\n  border: 2px solid #388e3c;\n  margin-bottom: 8px;\n}\n.unit-em {\n  width: 15em;\n  padding: 0.5em;\n  font-size: 14px;\n  background: #fff9c4;\n  border: 2px solid #f57f17;\n  margin-bottom: 8px;\n}\n.unit-rem {\n  width: 15rem;\n  padding: 0.5rem;\n  background: #f3e5f5;\n  border: 2px solid #6a1b9a;\n  margin-bottom: 8px;\n}\n.unit-vw {\n  width: 40vw;\n  padding: 10px;\n  background: #ffccbc;\n  border: 2px solid #e64a19;\n}`}
      htmlCode={`<div class="unit-px">width: 200px (fixed)</div>\n<div class="unit-percent">width: 50% (of parent)</div>\n<div class="unit-em">width: 15em (relative to font-size)</div>\n<div class="unit-rem">width: 15rem (relative to root font-size)</div>\n<div class="unit-vw">width: 40vw (40% of viewport)</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📐 Absolute Units</div><ul>
          <li><code>px</code> — pixels (most common, fixed size)</li>
          <li><code>cm</code>, <code>mm</code>, <code>in</code> — physical units (print only)</li>
          <li><code>pt</code> — points (1pt = 1/72 inch, for print)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">📐 Relative Units</div><ul>
          <li><code>%</code> — relative to parent element's size</li>
          <li><code>em</code> — relative to the element's font-size (1em = current font size)</li>
          <li><code>rem</code> — relative to the <b>root</b> element's font-size (more predictable!)</li>
          <li><code>vw</code> — 1% of viewport width</li>
          <li><code>vh</code> — 1% of viewport height</li>
          <li><code>vmin</code> — 1% of the smaller viewport dimension</li>
          <li><code>vmax</code> — 1% of the larger viewport dimension</li>
          <li><code>ch</code> — width of the "0" character (great for text widths)</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🎯 When to use what</div><ul>
          <li><b>px</b> — borders, shadows, precise spacing</li>
          <li><b>rem</b> — font sizes, padding, margin (consistent, accessible)</li>
          <li><b>em</b> — padding/margin that should scale with the element's font</li>
          <li><b>%</b> — fluid widths relative to parent</li>
          <li><b>vw/vh</b> — full-viewport layouts, hero sections</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ % for padding/margin</div>When using <code>%</code> for <code>padding</code> or <code>margin</code>, it's always relative to the <b>parent's width</b> — even for top/bottom padding!</div>
      `}
    >
      <div style={{ width: "200px", padding: "10px", background: "#bbdefb", border: "2px solid #1976d2", marginBottom: "8px" }}>width: 200px (fixed)</div>
      <div style={{ width: "50%", padding: "10px", background: "#c8e6c9", border: "2px solid #388e3c", marginBottom: "8px" }}>width: 50% (of parent)</div>
      <div style={{ width: "15em", padding: "0.5em", fontSize: "14px", background: "#fff9c4", border: "2px solid #f57f17", marginBottom: "8px" }}>width: 15em (relative to font-size)</div>
      <div style={{ width: "15rem", padding: "0.5rem", background: "#f3e5f5", border: "2px solid #6a1b9a", marginBottom: "8px" }}>width: 15rem (relative to root font-size)</div>
      <div style={{ width: "40vw", padding: "10px", background: "#ffccbc", border: "2px solid #e64a19" }}>width: 40vw (40% of viewport)</div>
    </BoxModelSection>,

    /* =====================================================
       26. DevTools Inspection
       ===================================================== */
    <BoxModelSection
      key="26" id="26-devtools"
      title="26. Inspecting the Box Model — DevTools"
      description="Use browser DevTools to visually inspect the box model of any element. Right-click → Inspect → see all 4 layers."
      diagram={{ margin: [30, 30, 30, 30], border: [8, 8, 8, 8], padding: [25, 25, 25, 25], content: [250, "auto"], highlight: "all" }}
      defaultCSS={`.devtools-box {\n  width: 250px;\n  padding: 25px;\n  border: 8px solid #1976d2;\n  margin: 30px;\n  background: #e3f2fd;\n  font-weight: bold;\n  border-radius: 8px;\n}`}
      htmlCode={`<div class="devtools-box">\n  Right-click me → Inspect → see the Box Model diagram!\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 How to Inspect</div><ol>
          <li><b>Right-click</b> on any element in the browser</li>
          <li>Select <b>"Inspect"</b> (or press F12 / Ctrl+Shift+I)</li>
          <li>Go to the <b>"Computed"</b> tab in DevTools</li>
          <li>You'll see the <b>Box Model diagram</b> showing all 4 layers with exact values</li>
        </ol></div>
        <div class="note-section"><div class="note-section-title">🎨 Color Coding in DevTools</div><ul>
          <li><span style="color:#ff9800;font-weight:bold;">Orange</span> = Margin</li>
          <li><span style="color:#f0d98c;font-weight:bold;">Yellow/Cream</span> = Border</li>
          <li><span style="color:#c8e6c9;font-weight:bold;">Green</span> = Padding</li>
          <li><span style="color:#90caf9;font-weight:bold;">Blue</span> = Content</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">🔧 What to look for</div><ul>
          <li>Is the total size what you expected?</li>
          <li>Is <code>box-sizing</code> set to <code>border-box</code> or <code>content-box</code>?</li>
          <li>Are margins collapsing unexpectedly?</li>
          <li>Is padding causing the element to be larger than you thought?</li>
        </ul></div>
        <div class="note-section"><div class="note-section-title">💡 Pro Tip</div>Hover over elements in the Elements panel to see the box model overlay directly on the page — margin (orange), padding (green), content (blue), and border (yellow).</div>
      `}
    >
      <div style={{ width: "250px", padding: "25px", border: "8px solid #1976d2", margin: "30px", background: "#e3f2fd", fontWeight: "bold", borderRadius: "8px" }}>
        Right-click me → Inspect → see the Box Model diagram!
      </div>
    </BoxModelSection>,

    /* =====================================================
       27. BEST PRACTICES & SUMMARY
       ===================================================== */
    <BoxModelSection
      key="27" id="27-best-practices"
      title="27. Box Model — Best Practices & Summary"
      description="Key takeaways and best practices for working with the CSS Box Model in real projects."
      diagram={{ margin: [0, 0, 0, 0], border: [1, 1, 1, 1], padding: [24, 24, 24, 24], content: [350, "auto"], highlight: "all" }}
      defaultCSS={`*, *::before, *::after {\n  box-sizing: border-box;\n}\n.practice-card {\n  max-width: 350px;\n  padding: 24px;\n  border: 1px solid #e0e0e0;\n  border-radius: 12px;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n  background: white;\n}\n.practice-card h3 {\n  margin: 0 0 12px 0;\n  color: #1976d2;\n}\n.practice-card p {\n  margin: 0;\n  color: #555;\n  line-height: 1.6;\n}`}
      htmlCode={`<div class="practice-card">\n  <h3>📦 Well-Structured Card</h3>\n  <p>\n    This card uses border-box, max-width, padding,\n    border-radius, and box-shadow — all box model\n    properties working together beautifully!\n  </p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">✅ Best Practice #1 — Universal border-box</div>
        Always set at the top of your CSS:<br/>
        <code>*, *::before, *::after {<br/>&nbsp;&nbsp;box-sizing: border-box;<br/>}</code><br/>
        This makes width/height calculations intuitive.</div>
        <div class="note-section"><div class="note-section-title">✅ Best Practice #2 — Use rem/em for spacing</div>
        Use <code>rem</code> for padding/margin instead of <code>px</code>. This makes your layout accessible and scalable when users change browser font size.</div>
        <div class="note-section"><div class="note-section-title">✅ Best Practice #3 — Prefer min-height over height</div>
        Don't use fixed <code>height</code> on text containers. Use <code>min-height</code> to allow content to grow.</div>
        <div class="note-section"><div class="note-section-title">✅ Best Practice #4 — max-width for responsiveness</div>
        Use <code>max-width: 100%</code> on images and <code>max-width: 1200px; margin: 0 auto;</code> for containers.</div>
        <div class="note-section"><div class="note-section-title">✅ Best Practice #5 — Avoid negative margins when possible</div>
        They cause overlaps and are hard to debug. Use padding, flexbox gaps, or grid gaps instead.</div>
        <div class="note-section"><div class="note-section-title">📦 Complete Box Model Summary</div>
        <table style="width:100%; border-collapse:collapse; font-size:0.85em;">
          <tr style="background:#f5f5f5;"><th style="padding:6px; border:1px solid #ddd;">Layer</th><th style="padding:6px; border:1px solid #ddd;">Property</th><th style="padding:6px; border:1px solid #ddd;">Takes BG?</th><th style="padding:6px; border:1px solid #ddd;">Can be -?</th></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Content</td><td style="padding:6px; border:1px solid #ddd;">width, height</td><td style="padding:6px; border:1px solid #ddd;">Yes</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Padding</td><td style="padding:6px; border:1px solid #ddd;">padding</td><td style="padding:6px; border:1px solid #ddd;">Yes</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Border</td><td style="padding:6px; border:1px solid #ddd;">border</td><td style="padding:6px; border:1px solid #ddd;">Own color</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Margin</td><td style="padding:6px; border:1px solid #ddd;">margin</td><td style="padding:6px; border:1px solid #ddd;">No (transparent)</td><td style="padding:6px; border:1px solid #ddd;">Yes ✅</td></tr>
          <tr><td style="padding:6px; border:1px solid #ddd;">Outline</td><td style="padding:6px; border:1px solid #ddd;">outline</td><td style="padding:6px; border:1px solid #ddd;">No</td><td style="padding:6px; border:1px solid #ddd;">No</td></tr>
        </table></div>
      `}
    >
      <div style={{ maxWidth: "350px", padding: "24px", border: "1px solid #e0e0e0", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", background: "white" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#1976d2" }}>📦 Well-Structured Card</h3>
        <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
          This card uses border-box, max-width, padding, border-radius, and box-shadow — all box model properties working together beautifully!
        </p>
      </div>
    </BoxModelSection>,
  ];

  const totalSections = sections.length;

  const goNext = () => {
    setCurrentIndex((prev) => (prev < totalSections - 1 ? prev + 1 : prev));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToSection = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "textarea" || tag === "input" || tag === "select") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) => (prev < totalSections - 1 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSections]);

  const sectionTitles = [
    "1. Box Model — Introduction",
    "2. Content Area — width & height",
    "3. Padding",
    "4. Border — Basics",
    "5. Border — Individual Sides",
    "6. Border Radius (Rounded Corners)",
    "7. Margin",
    "8. Margin Collapsing",
    "9. margin: auto — Centering",
    "10. box-sizing: content-box vs border-box",
    "11. min-width & max-width",
    "12. min-height & max-height",
    "13. Outline (vs Border)",
    "14. Overflow — visible, hidden, scroll, auto",
    "15. text-overflow & Ellipsis",
    "16. display — block, inline, inline-block, none",
    "17. visibility — visible, hidden, collapse",
    "18. box-shadow",
    "19. background-clip & background-origin",
    "20. Negative Margins",
    "21. Box Model Calculation — Complete Example",
    "22. border-image",
    "23. aspect-ratio",
    "24. resize",
    "25. CSS Units in Box Model",
    "26. Inspecting Box Model — DevTools",
    "27. Best Practices & Summary",
  ];

  return (
    <div className="box-model-page">
      <h1>📦 Complete CSS Box Model Reference</h1>
      <p className="bm-page-subtitle">
        ✏️ Each CSS &amp; HTML section is <strong>editable</strong> — modify the code, click <strong>Apply</strong>, and see changes instantly!
        <br />
        <span style={{ fontSize: "0.9em", opacity: 0.8 }}>Use ← → arrow keys or buttons to navigate • Jump to any topic with the dropdown • 📖 Read the explanation on the right</span>
      </p>

      {/* ======== NAVIGATION BAR ======== */}
      <div className="bm-nav-bar">
        <button
          className="bm-nav-arrow bm-nav-arrow-left"
          onClick={goPrev}
          disabled={currentIndex === 0}
          title="Previous topic (← Arrow Key)"
        >
          ◀
        </button>

        <div className="bm-nav-center">
          <select
            className="bm-nav-dropdown"
            value={currentIndex}
            onChange={(e) => goToSection(Number(e.target.value))}
          >
            {sectionTitles.map((title, i) => (
              <option key={i} value={i}>{title}</option>
            ))}
          </select>
          <span className="bm-nav-counter">
            {currentIndex + 1} / {totalSections}
          </span>
        </div>

        <button
          className="bm-nav-arrow bm-nav-arrow-right"
          onClick={goNext}
          disabled={currentIndex === totalSections - 1}
          title="Next topic (→ Arrow Key)"
        >
          ▶
        </button>
      </div>

      {/* ======== PROGRESS BAR ======== */}
      <div className="bm-nav-progress-bar">
        <div
          className="bm-nav-progress-fill"
          style={{ width: `${((currentIndex + 1) / totalSections) * 100}%` }}
        />
      </div>

      {/* ======== RENDER ONLY CURRENT SECTION ======== */}
      {sections[currentIndex]}

      {/* ======== BOTTOM NAVIGATION ======== */}
      <div className="bm-nav-bar bm-nav-bar-bottom">
        <button
          className="bm-nav-arrow bm-nav-arrow-left"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ◀ Prev
        </button>
        <span className="bm-nav-counter">
          {currentIndex + 1} / {totalSections}
        </span>
        <button
          className="bm-nav-arrow bm-nav-arrow-right"
          onClick={goNext}
          disabled={currentIndex === totalSections - 1}
        >
          Next ▶
        </button>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "30px", color: "#666", borderTop: "2px solid #eee", marginTop: "40px" }}>
        <p>🎓 Total: 27 Box Model Topics Covered — One at a Time!</p>
        <p>Each section: 🎨 Editable CSS → 📄 Editable HTML → 👁️ Live Output → 📖 Explanation</p>
        <p>✏️ Edit any CSS or HTML block, click <strong>Apply</strong> (or Ctrl+Enter), and see live changes!</p>
        <p>Prepared for CSS Box Model Class Lecture</p>
      </footer>
    </div>
  );
};

export default BoxModel;
