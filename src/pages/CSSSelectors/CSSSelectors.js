import React, { useState, useCallback, useEffect } from "react";
import "./CSSSelectors.css";

/* =========================================================
   Reusable SelectorSection Component
   - Editable CSS + HTML textareas with single Apply / Reset
   - Injects a <style> tag scoped to a unique wrapper id
   - Right-side notes panel with detailed explanation
   ========================================================= */
const SelectorSection = ({ id, title, description, defaultCSS, htmlCode, notes, children }) => {
  const [cssCode, setCssCode] = useState(defaultCSS);
  const [appliedCSS, setAppliedCSS] = useState(defaultCSS);

  const [htmlInput, setHtmlInput] = useState(htmlCode);
  const [appliedHTML, setAppliedHTML] = useState(htmlCode);

  const [useCustomHTML, setUseCustomHTML] = useState(false);

  const isEdited = cssCode !== defaultCSS || htmlInput !== htmlCode;

  const wrapperId = `live-output-${id}`;

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
    <section className="selector-section">
      <h2>{title}</h2>
      <p className="description">{description}</p>

      <div className="section-layout">
        {/* ======== LEFT: Editors + Live Output ======== */}
        <div className="section-left">
          <div className="code-label css-label">🎨 CSS <span className="editable-hint">( ✏️ Editable )</span></div>
          <div className="css-editor-wrapper">
            <textarea
              className={`css-editor${cssCode !== defaultCSS ? " css-edited" : ""}`}
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              onKeyDown={makeKeyHandler(cssCode, setCssCode)}
              spellCheck={false}
              rows={Math.max(cssCode.split("\n").length, 3)}
            />
          </div>

          <div className="code-label html-label">📄 HTML <span className="editable-hint">( ✏️ Editable )</span></div>
          <div className="html-editor-wrapper">
            <textarea
              className={`html-editor${htmlInput !== htmlCode ? " html-edited" : ""}`}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              onKeyDown={makeKeyHandler(htmlInput, setHtmlInput)}
              spellCheck={false}
              rows={Math.max(htmlInput.split("\n").length, 3)}
            />
          </div>

          <div className="editor-actions">
            <button className="btn-apply" onClick={handleApply} title="Apply CSS & HTML (Ctrl+Enter)">▶ Apply</button>
            <button className="btn-reset" onClick={handleReset} title="Reset CSS & HTML to original">↺ Reset</button>
            {isEdited && <span className="edited-badge">Modified</span>}
          </div>

          <div className="code-label output-label">👁️ Live Output</div>
          <div className="demo" id={wrapperId}>
            <style>{scopeCSS(appliedCSS)}</style>
            {useCustomHTML ? (
              <div dangerouslySetInnerHTML={{ __html: appliedHTML }} />
            ) : (
              children
            )}
          </div>
        </div>

        {/* ======== RIGHT: Description / Notes Panel ======== */}
        {notes && (
          <aside className="section-right">
            <div className="notes-panel">
              <div className="notes-title">📖 Explanation</div>
              <div className="notes-content" dangerouslySetInnerHTML={{ __html: notes }} />
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};


/* =========================================================
   MAIN COMPONENT — All 65 CSS Selectors (Paginated)
   Only ONE selector visible at a time with arrow navigation
   ========================================================= */
const CSSSelectors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sections = [

    /* 1 */
    <SelectorSection
      key="1" id="1-universal"
      title="1. Universal Selector ( * )"
      description="Selects ALL elements on the page."
      defaultCSS={`* {\n  color: #b02121;\n  font-family: 'Segoe UI', sans-serif;\n}`}
      htmlCode={`<div class="universal-demo">\n  <p>This paragraph is styled by *</p>\n  <span>This span is also styled by *</span>\n  <div>This div too!</div>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The <code>*</code> selector matches <b>every single element</b> in the document — paragraphs, divs, spans, headings, links, etc.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>CSS resets — e.g. <code>* { margin: 0; padding: 0; box-sizing: border-box; }</code></li><li>Applying a global font-family or color</li><li>Debugging layout issues (add <code>* { outline: 1px solid red; }</code>)</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚡ Performance</div>Low specificity (0,0,0). Can be slow on very large pages since it touches every element. Use sparingly in production.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>*, *::before, *::after { box-sizing: border-box; }</code> is the most common real-world usage.</div>
      `}
    >
      <div className="universal-demo">
        <p>This paragraph is styled by *</p>
        <span>This span is also styled by *</span>
        <div>This div too!</div>
      </div>
    </SelectorSection>,

    /* 2 */
    <SelectorSection
      key="2" id="2-type"
      title="2. Type (Element) Selector"
      description="Selects all elements of a given HTML tag."
      defaultCSS={`p {\n  color: green;\n  line-height: 1.6;\n}\nspan {\n  color: red;\n  font-weight: bold;\n}`}
      htmlCode={`<div>\n  <p>This is a paragraph — selected by p type selector.</p>\n  <span>This span — selected by span type selector.</span>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Targets elements by their HTML <b>tag name</b> — e.g. <code>p</code>, <code>h1</code>, <code>div</code>, <code>span</code>, <code>a</code>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Setting base typography — <code>p { line-height: 1.6; }</code></li><li>Styling all links — <code>a { text-decoration: none; }</code></li><li>Default heading styles — <code>h1, h2, h3 { font-weight: 700; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Specificity</div>Specificity: <b>(0,0,1)</b>. Very low — easily overridden by class or ID selectors.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Good for base/default styles. For specific components, prefer class selectors to avoid unintended style leaking.</div>
      `}
    >
      <div>
        <p>This is a paragraph — selected by p type selector.</p>
        <span>This span — selected by span type selector.</span>
      </div>
    </SelectorSection>,

    /* 3 */
    <SelectorSection
      key="3" id="3-class"
      title="3. Class Selector ( .className )"
      description="Selects all elements with the given class."
      defaultCSS={`.highlight {\n  background: yellow;\n  padding: 4px 8px;\n}`}
      htmlCode={`<p class="highlight">Has class "highlight" → selected!</p>\n<p>No class → NOT selected.</p>\n<span class="highlight">Also has "highlight" → selected!</span>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects all elements that have the specified <b>class</b> attribute. An element can have multiple classes: <code>class="btn primary"</code>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>This is the <b>most commonly used</b> selector in CSS</li><li>Component styling: <code>.card</code>, <code>.btn</code>, <code>.navbar</code></li><li>Utility classes: <code>.text-center</code>, <code>.mt-4</code>, <code>.hidden</code></li><li>Multiple elements can share the same class</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Specificity</div>Specificity: <b>(0,1,0)</b>. Higher than type selectors, lower than ID.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use meaningful class names: <code>.error-message</code> not <code>.red-text</code>. Follow BEM naming: <code>.block__element--modifier</code>.</div>
      `}
    >
      <p className="highlight">Has class "highlight" → selected!</p>
      <p>No class → NOT selected.</p>
      <span className="highlight">Also has "highlight" → selected!</span>
    </SelectorSection>,

    /* 4 */
    <SelectorSection
      key="4" id="4-id"
      title="4. ID Selector ( #idName )"
      description="Selects a single element with the given id."
      defaultCSS={`#unique-el {\n  border: 3px solid red;\n  padding: 10px;\n  background: #ffebee;\n}`}
      htmlCode={`<p id="unique-el">id="unique-el" → selected!</p>\n<p>No id → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects the <b>single element</b> whose <code>id</code> attribute matches. IDs must be <b>unique</b> per page.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Unique page landmarks: <code>#header</code>, <code>#main-content</code>, <code>#footer</code></li><li>JavaScript hooks: <code>document.getElementById("myId")</code></li><li>URL fragment targets: <code>href="#section2"</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Specificity</div>Specificity: <b>(1,0,0)</b> — very high! Hard to override without <code>!important</code> or another ID.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Avoid using IDs for styling in large projects. Prefer classes. IDs are better for JS hooks and anchor links.</div>
      `}
    >
      <p id="unique-el">id="unique-el" → selected!</p>
      <p>No id → NOT selected.</p>
    </SelectorSection>,

    /* 5 */
    <SelectorSection
      key="5" id="5-grouping"
      title="5. Grouping Selector ( A, B )"
      description="Selects all elements matching A or B."
      defaultCSS={`.group-a, .group-b {\n  color: darkgreen;\n  font-weight: bold;\n}`}
      htmlCode={`<p class="group-a">Styled with .group-a</p>\n<p class="group-b">Styled with .group-b</p>\n<p>Not styled — no class.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Applies the <b>same styles to multiple selectors</b> by separating them with commas. Avoids code duplication.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Shared styles: <code>h1, h2, h3 { font-family: Georgia; }</code></li><li>Reset margins: <code>ul, ol, p { margin: 0; }</code></li><li>Any time multiple selectors share the exact same declarations</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>Each selector in the group is independent. If one is invalid, browsers may still apply the rest (varies by spec).</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Keep grouped selectors readable — put each on its own line for clarity.</div>
      `}
    >
      <p className="group-a">Styled with .group-a</p>
      <p className="group-b">Styled with .group-b</p>
      <p>Not styled — no class.</p>
    </SelectorSection>,

    /* 6 */
    <SelectorSection
      key="6" id="6-descendant"
      title="6. Descendant Selector ( A B )"
      description="Selects B that is a descendant (at any level) of A."
      defaultCSS={`.ancestor span {\n  color: purple;\n  font-weight: bold;\n  background: #f3e5f5;\n}`}
      htmlCode={`<div class="ancestor">\n  <p>\n    <span>Deep inside .ancestor → selected!</span>\n  </p>\n</div>\n<span>Outside .ancestor → NOT selected.</span>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects elements that are <b>nested anywhere inside</b> the ancestor — children, grandchildren, great-grandchildren, etc.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Styling elements inside a component: <code>.card p { ... }</code></li><li>Scoping styles: <code>.sidebar a { color: blue; }</code></li><li>Most commonly used combinator in CSS</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Be careful</div>It matches at <b>any depth</b>, so it can unintentionally style deeply nested elements. Use child selector (<code>&gt;</code>) if you want direct children only.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Written with a <b>space</b> between selectors: <code>A B</code>. The space IS the combinator.</div>
      `}
    >
      <div className="ancestor">
        <p><span>Deep inside .ancestor → selected!</span></p>
      </div>
      <span>Outside .ancestor → NOT selected.</span>
    </SelectorSection>,

    /* 7 */
    <SelectorSection
      key="7" id="7-child"
      title="7. Child Selector ( A > B )"
      description="Selects B that is a direct child of A."
      defaultCSS={`.parent-box > p {\n  background: #e0f7fa;\n  padding: 8px;\n  border-left: 4px solid #00acc1;\n}`}
      htmlCode={`<div class="parent-box">\n  <p>Direct child → selected!</p>           <!-- ✅ -->\n  <div>\n    <p>Nested deeper → NOT selected.</p>   <!-- ❌ -->\n  </div>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects only elements that are <b>direct (immediate) children</b> — not grandchildren or deeper.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Nav menus: <code>.nav > li</code> (only top-level items)</li><li>Layout containers: <code>.grid > .col</code></li><li>When you want tight control and don't want styles leaking deeper</li></ul></div>
        <div class="note-section"><div class="note-section-title">🔄 vs Descendant</div><code>A B</code> = any depth. <code>A &gt; B</code> = direct child only. Child selector is <b>more specific</b> and <b>safer</b>.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Great for preventing unintended styling in deeply nested components.</div>
      `}
    >
      <div className="parent-box">
        <p>Direct child → selected!</p>
        <div><p>Nested deeper → NOT selected.</p></div>
      </div>
    </SelectorSection>,

    /* 8 */
    <SelectorSection
      key="8" id="8-adjacent"
      title="8. Adjacent Sibling Selector ( A + B )"
      description="Selects B that is immediately after A (same parent)."
      defaultCSS={`.first-sib + p {\n  color: red;\n  font-weight: bold;\n  border-left: 4px solid red;\n}`}
      htmlCode={`<p class="first-sib">I am .first-sib</p>\n<p>Immediately after → selected!</p>     <!-- ✅ -->\n<p>NOT immediately after → NOT selected.</p>  <!-- ❌ -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects the element that is the <b>very next sibling</b> of A. Must be the <b>immediately following</b> element, same parent.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Spacing after headings: <code>h2 + p { margin-top: 0; }</code></li><li>Label + input styling: <code>label + input { margin-left: 8px; }</code></li><li>Showing/hiding elements based on previous sibling state</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Key rule</div>Only the <b>first</b> sibling right after A is selected. Not the 2nd, 3rd, etc.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Combine with <code>:checked</code> for CSS-only toggling: <code>input:checked + .content { display: block; }</code></div>
      `}
    >
      <p className="first-sib">I am .first-sib</p>
      <p>Immediately after → selected!</p>
      <p>NOT immediately after → NOT selected.</p>
    </SelectorSection>,

    /* 9 */
    <SelectorSection
      key="9" id="9-general-sibling"
      title="9. General Sibling Selector ( A ~ B )"
      description="Selects all B that come after A (same parent)."
      defaultCSS={`.gen-sib ~ p {\n  color: orange;\n  font-weight: bold;\n}`}
      htmlCode={`<p>Before .gen-sib → NOT selected.</p>   <!-- ❌ -->\n<p class="gen-sib">I am .gen-sib</p>\n<p>After → selected!</p>                 <!-- ✅ -->\n<p>Also after → selected!</p>            <!-- ✅ -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects <b>all siblings</b> of type B that come <b>after</b> A (same parent). Unlike <code>+</code>, it's not limited to the immediately next one.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Styling all paragraphs after a heading: <code>h2 ~ p { ... }</code></li><li>Showing content after a trigger: <code>.trigger ~ .content { ... }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">🔄 + vs ~</div><code>A + B</code> → only the <b>immediately next</b> sibling.<br/><code>A ~ B</code> → <b>all following</b> siblings.</div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>Elements <b>before</b> A are never selected. Only elements that come after A in the DOM.</div>
      `}
    >
      <p>Before .gen-sib → NOT selected.</p>
      <p className="gen-sib">I am .gen-sib</p>
      <p>After → selected!</p>
      <p>Also after → selected!</p>
    </SelectorSection>,

    /* 10 */
    <SelectorSection
      key="10" id="10-attr"
      title="10. Attribute Selector ( [attr] )"
      description="Selects elements that have the given attribute."
      defaultCSS={`[title] {\n  border-bottom: 2px dotted gray;\n  cursor: help;\n}`}
      htmlCode={`<p title="I have a title">Has title → selected!</p>\n<p>No title → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects any element that <b>has the attribute present</b>, regardless of its value. Even <code>title=""</code> would match.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style all links with target: <code>a[target] { ... }</code></li><li>Highlight required fields: <code>[required] { border-left: 3px solid red; }</code></li><li>Style elements with data attributes: <code>[data-tooltip] { ... }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Specificity</div>Same as a class selector: <b>(0,1,0)</b>.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Works with <b>any</b> attribute — standard or custom <code>data-*</code> attributes.</div>
      `}
    >
      <p title="I have a title">Has title attribute → selected!</p>
      <p>No title attribute → NOT selected.</p>
    </SelectorSection>,

    /* 11 */
    <SelectorSection
      key="11" id="11-attr-value"
      title='11. Attribute Value Selector ( [attr="value"] )'
      description="Selects elements whose attribute equals the exact value."
      defaultCSS={`[data-type="primary"] {\n  background: #bbdefb;\n  padding: 8px;\n}`}
      htmlCode={`<p data-type="primary">data-type="primary" → selected!</p>\n<p data-type="secondary">data-type="secondary" → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches only if the attribute value is an <b>exact match</b>. Case-sensitive by default.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Targeting specific input types: <code>input[type="email"]</code></li><li>Data attribute driven styling: <code>[data-theme="dark"]</code></li><li>Language-specific styles: <code>[lang="en"]</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Add <code>i</code> flag for case-insensitive matching: <code>[attr="value" i]</code></div>
      `}
    >
      <p data-type="primary">data-type="primary" → selected!</p>
      <p data-type="secondary">data-type="secondary" → NOT selected.</p>
    </SelectorSection>,

    /* 12 */
    <SelectorSection
      key="12" id="12-attr-starts"
      title='12. Attribute Starts With ( [attr^="value"] )'
      description="Selects elements whose attribute starts with the value."
      defaultCSS={`[data-info^="hello"] {\n  color: teal;\n  font-weight: bold;\n}`}
      htmlCode={`<p data-info="hello-world">starts with "hello" → selected!</p>\n<p data-info="world-hello">does NOT start with "hello" → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements where the attribute value <b>begins with</b> the specified string.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>External links: <code>a[href^="https://"]</code></li><li>Protocol-based styling: <code>a[href^="mailto:"]</code></li><li>Prefix-based data attributes: <code>[data-category^="sport"]</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Very useful for styling links by their protocol or domain prefix.</div>
      `}
    >
      <p data-info="hello-world">data-info="hello-world" → selected!</p>
      <p data-info="world-hello">data-info="world-hello" → NOT selected.</p>
    </SelectorSection>,

    /* 13 */
    <SelectorSection
      key="13" id="13-attr-ends"
      title='13. Attribute Ends With ( [attr$="value"] )'
      description="Selects elements whose attribute ends with the value."
      defaultCSS={`[data-info$="world"] {\n  font-style: italic;\n  color: #6a1b9a;\n}`}
      htmlCode={`<p data-info="hello-world">ends with "world" → selected!</p>\n<p data-info="hello-earth">does NOT end with "world" → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements where the attribute value <b>ends with</b> the specified string.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>File type icons: <code>a[href$=".pdf"] { ... }</code></li><li>Image type styling: <code>img[src$=".svg"]</code></li><li>Download links: <code>a[href$=".zip"]</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Pair with <code>::after</code> to add file-type icons: <code>a[href$=".pdf"]::after { content: " 📄"; }</code></div>
      `}
    >
      <p data-info="hello-world">data-info="hello-world" → selected!</p>
      <p data-info="hello-earth">data-info="hello-earth" → NOT selected.</p>
    </SelectorSection>,

    /* 14 */
    <SelectorSection
      key="14" id="14-attr-contains"
      title='14. Attribute Contains ( [attr*="value"] )'
      description="Selects elements whose attribute contains the substring."
      defaultCSS={`[data-info*="mid"] {\n  text-decoration: underline;\n  color: #d32f2f;\n}`}
      htmlCode={`<p data-info="start-mid-end">contains "mid" → selected!</p>\n<p data-info="startend">no "mid" → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches if the attribute value <b>contains the substring anywhere</b> — beginning, middle, or end.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Searching within URLs: <code>a[href*="youtube"]</code></li><li>Data attribute filtering: <code>[data-tags*="featured"]</code></li><li>Flexible attribute matching</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Be careful</div>Very broad — <code>[class*="btn"]</code> would also match <code>class="submit-btn-large"</code>. Can cause false positives.</div>
      `}
    >
      <p data-info="start-mid-end">data-info="start-mid-end" → selected!</p>
      <p data-info="startend">data-info="startend" → NOT selected.</p>
    </SelectorSection>,

    /* 15 */
    <SelectorSection
      key="15" id="15-attr-word"
      title='15. Attribute Contains Word ( [attr~="value"] )'
      description="Selects elements whose attribute contains a space-separated word."
      defaultCSS={`[data-tags~="css"] {\n  background: #fff9c4;\n  padding: 4px;\n}`}
      htmlCode={`<p data-tags="html css js">has word "css" → selected!</p>\n<p data-tags="html js">no word "css" → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches if the attribute value is a <b>space-separated list</b> and one of the words <b>exactly matches</b> the value.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Tag-based filtering: <code>[data-tags~="important"]</code></li><li>When attributes hold multiple space-separated values</li></ul></div>
        <div class="note-section"><div class="note-section-title">🔄 vs *=</div><code>*=</code> checks substring anywhere. <code>~=</code> checks for a <b>complete word</b> in a space-separated list. <code>~=</code> is more precise.</div>
      `}
    >
      <p data-tags="html css js">data-tags="html css js" → selected!</p>
      <p data-tags="html js">data-tags="html js" → NOT selected.</p>
    </SelectorSection>,

    /* 16 */
    <SelectorSection
      key="16" id="16-attr-lang"
      title='16. Attribute Hyphen Selector ( [attr|="value"] )'
      description="Selects elements whose attribute equals the value or starts with value followed by hyphen."
      defaultCSS={`[lang|="en"] {\n  font-family: serif;\n  color: #1565c0;\n}`}
      htmlCode={`<p lang="en">lang="en" → selected!</p>         <!-- ✅ exact -->\n<p lang="en-US">lang="en-US" → selected!</p>   <!-- ✅ en- prefix -->\n<p lang="fr">lang="fr" → NOT selected.</p>      <!-- ❌ -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches if the value is exactly the given value OR starts with it followed by a <b>hyphen (-)</b>. Designed for language codes.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Language-specific typography: <code>[lang|="zh"]</code> (matches zh, zh-CN, zh-TW)</li><li>Locale-based styling for internationalization</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Specifically designed for BCP 47 language tags like <code>en-US</code>, <code>fr-CA</code>, <code>zh-Hans</code>.</div>
      `}
    >
      <p lang="en">lang="en" → selected!</p>
      <p lang="en-US">lang="en-US" → selected!</p>
      <p lang="fr">lang="fr" → NOT selected.</p>
    </SelectorSection>,

    /* 17 */
    <SelectorSection
      key="17" id="17-hover"
      title="17. :hover Pseudo-Class"
      description="Selects an element when the mouse hovers over it."
      defaultCSS={`.hover-box:hover {\n  background: #c8e6c9;\n  transform: scale(1.05);\n  box-shadow: 0 4px 12px rgba(0,0,0,0.2);\n}`}
      htmlCode={`<div class="hover-box">Hover over me!</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Activates styles when the user <b>moves the mouse pointer</b> over the element.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Button hover effects: <code>.btn:hover { background: darkblue; }</code></li><li>Link underlines: <code>a:hover { text-decoration: underline; }</code></li><li>Card lift effects, dropdown menus, tooltips</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Accessibility</div>Hover doesn't work on touch devices! Always provide alternative interactions. Don't hide critical content behind hover-only.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Add <code>transition</code> for smooth hover animations: <code>transition: all 0.3s ease;</code></div>
      `}
    >
      <div className="hover-box">Hover over me!</div>
    </SelectorSection>,

    /* 18 */
    <SelectorSection
      key="18" id="18-active"
      title="18. :active Pseudo-Class"
      description="Selects an element while it is being clicked."
      defaultCSS={`.active-btn:active {\n  background: #ff5722;\n  color: white;\n  transform: scale(0.95);\n}`}
      htmlCode={`<button class="active-btn">Click & hold me!</button>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Applies styles while the element is <b>being activated</b> — i.e., during a mouse click (mousedown to mouseup).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Button press feedback: <code>.btn:active { transform: scale(0.95); }</code></li><li>Click ripple effects</li><li>Visual feedback that something is being pressed</li></ul></div>
        <div class="note-section"><div class="note-section-title">📋 LVHA Order</div>Link pseudo-classes must be in order: <code>:link → :visited → :hover → :active</code> (remember: "LoVe HAte")</div>
      `}
    >
      <button className="active-btn">Click &amp; hold me!</button>
    </SelectorSection>,

    /* 19 */
    <SelectorSection
      key="19" id="19-focus"
      title="19. :focus Pseudo-Class"
      description="Selects an element when it receives focus."
      defaultCSS={`.focus-input:focus {\n  outline: 3px solid blue;\n  background: #e3f2fd;\n  border-color: #1976d2;\n}`}
      htmlCode={`<input class="focus-input" type="text" placeholder="Click me to focus" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles an element when it <b>receives focus</b> — via mouse click or Tab key navigation.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Form input highlighting: <code>input:focus { border-color: blue; }</code></li><li>Accessibility — clearly show which element is focused</li><li>Search bar expand on focus</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Accessibility</div><b>Never</b> do <code>*:focus { outline: none; }</code> without providing an alternative. Keyboard users need visible focus indicators!</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use <code>:focus-visible</code> instead if you only want keyboard-triggered focus styling.</div>
      `}
    >
      <input className="focus-input" type="text" placeholder="Click me to focus" />
    </SelectorSection>,

    /* 20 */
    <SelectorSection
      key="20" id="20-focus-within"
      title="20. :focus-within Pseudo-Class"
      description="Selects parent when any child inside it receives focus."
      defaultCSS={`.focus-within-box:focus-within {\n  border: 3px solid blue;\n  background: #e8eaf6;\n  padding: 12px;\n}`}
      htmlCode={`<div class="focus-within-box">\n  <label>Name: </label>\n  <input type="text" placeholder="Focus me → parent styled!" />\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles a <b>parent container</b> when <b>any element inside it</b> receives focus. Unlike <code>:focus</code>, this targets the ancestor.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Highlight a form group when any input inside is focused</li><li>Search bar container glow effect</li><li>Dropdown menu keeping parent styled while navigating children</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Perfect for <code>.form-group:focus-within { border-color: blue; }</code> — highlights the whole group, not just the input.</div>
      `}
    >
      <div className="focus-within-box">
        <label>Name: </label>
        <input type="text" placeholder="Focus me → parent styled!" />
      </div>
    </SelectorSection>,

    /* 21 */
    <SelectorSection
      key="21" id="21-focus-visible"
      title="21. :focus-visible Pseudo-Class"
      description="Selects an element when focused AND the browser decides focus should be visible (keyboard nav)."
      defaultCSS={`.focus-visible-btn:focus-visible {\n  outline: 3px dashed #ff6f00;\n  outline-offset: 3px;\n}`}
      htmlCode={`<button class="focus-visible-btn">Tab to me for visible focus!</button>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Like <code>:focus</code>, but only activates when the browser determines the focus should be <b>visually indicated</b> — typically via <b>keyboard navigation</b> (Tab key).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Show focus rings only for keyboard users, not mouse clicks</li><li><code>button:focus-visible { outline: 3px solid blue; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">🔄 :focus vs :focus-visible</div><code>:focus</code> → always when focused (click or keyboard).<br/><code>:focus-visible</code> → only when keyboard navigating.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Modern best practice: use <code>:focus-visible</code> to style focus outlines. Remove <code>:focus</code> outline only if <code>:focus-visible</code> is provided.</div>
      `}
    >
      <button className="focus-visible-btn">Tab to me for visible focus!</button>
    </SelectorSection>,

    /* 22 */
    <SelectorSection
      key="22" id="22-visited"
      title="22. :visited Pseudo-Class"
      description="Selects links that have been visited."
      defaultCSS={`a:visited {\n  color: purple;\n}`}
      htmlCode={`<a href="https://www.google.com">Visited Link (Google)</a>\n<a href="https://nevervisited12345.com">Unvisited Link</a>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles links (<code>&lt;a&gt;</code>) that the user has <b>already visited</b> (URL exists in browser history).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Different color for visited links so users know what they've already clicked</li><li>Default browser behavior: blue → purple</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Privacy restrictions</div>Browsers limit <code>:visited</code> to only <b>color-related properties</b> (color, background-color, border-color) to prevent history sniffing attacks.</div>
      `}
    >
      <a className="visited-link" href="https://www.google.com" target="_blank" rel="noreferrer">Visited Link (Google)</a>{" "} | {" "}
      <a className="visited-link" href="https://thislinkneverexists12345.com" target="_blank" rel="noreferrer">Unvisited Link</a>
    </SelectorSection>,

    /* 23 */
    <SelectorSection
      key="23" id="23-link"
      title="23. :link Pseudo-Class"
      description="Selects all unvisited links."
      defaultCSS={`a:link {\n  color: blue;\n  font-weight: bold;\n  text-decoration: underline;\n}`}
      htmlCode={`<a href="https://react.dev">Unvisited Link (React)</a>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects <code>&lt;a&gt;</code> elements with an <code>href</code> that have <b>NOT been visited yet</b>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Default link styling before a user clicks them</li><li>Usually paired with <code>:visited</code> for complete link styling</li></ul></div>
        <div class="note-section"><div class="note-section-title">🔄 :link vs a</div><code>a</code> selects ALL anchor tags. <code>a:link</code> only selects anchors with <code>href</code> that are <b>unvisited</b>.</div>
      `}
    >
      <a className="link-example" href="https://react.dev" target="_blank" rel="noreferrer">Unvisited Link (React)</a>
    </SelectorSection>,

    /* 24 */
    <SelectorSection
      key="24" id="24-first-child"
      title="24. :first-child Pseudo-Class"
      description="Selects the element that is the first child of its parent."
      defaultCSS={`p:first-child {\n  color: red;\n  font-weight: bold;\n  border-left: 5px solid red;\n  padding-left: 8px;\n}`}
      htmlCode={`<div>\n  <p>First child → selected!</p>      <!-- ✅ -->\n  <p>Second child</p>                  <!-- ❌ -->\n  <p>Third child</p>                   <!-- ❌ -->\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects an element only if it is the <b>very first child</b> of its parent. The element must also match the tag/class specified.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Remove top margin from first element: <code>.container > *:first-child { margin-top: 0; }</code></li><li>Special styling for first list item</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Common mistake</div><code>p:first-child</code> does NOT mean "first <code>&lt;p&gt;</code>". It means "a <code>&lt;p&gt;</code> that is also the first child". If the first child is a <code>&lt;div&gt;</code>, nothing is selected. Use <code>:first-of-type</code> instead.</div>
      `}
    >
      <div>
        <p>First child → selected!</p>
        <p>Second child</p>
        <p>Third child</p>
      </div>
    </SelectorSection>,

    /* 25 */
    <SelectorSection
      key="25" id="25-last-child"
      title="25. :last-child Pseudo-Class"
      description="Selects the element that is the last child of its parent."
      defaultCSS={`p:last-child {\n  color: green;\n  font-weight: bold;\n  border-left: 5px solid green;\n  padding-left: 8px;\n}`}
      htmlCode={`<div>\n  <p>First child</p>                  <!-- ❌ -->\n  <p>Second child</p>                 <!-- ❌ -->\n  <p>Last child → selected!</p>       <!-- ✅ -->\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects an element that is the <b>last child</b> of its parent.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Remove bottom border/margin: <code>li:last-child { border-bottom: none; }</code></li><li>Remove trailing separator in lists</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Same caveat as <code>:first-child</code> — the element must actually be the last child. Use <code>:last-of-type</code> if you want the last element of a specific tag.</div>
      `}
    >
      <div>
        <p>First child</p>
        <p>Second child</p>
        <p>Last child → selected!</p>
      </div>
    </SelectorSection>,

    /* 26 */
    <SelectorSection
      key="26" id="26-nth-child"
      title="26. :nth-child() Pseudo-Class"
      description="Selects element based on its position (1-indexed)."
      defaultCSS={`li:nth-child(2) { background: #ffccbc; }\nli:nth-child(odd) { background: #f5f5f5; }\nli:nth-child(even) { background: #e8eaf6; }`}
      htmlCode={`<ul>\n  <li>1st (odd)</li>\n  <li>2nd (even + nth-child(2))</li>\n  <li>3rd (odd)</li>\n  <li>4th (even)</li>\n  <li>5th (odd)</li>\n</ul>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects elements based on their <b>position number</b> among siblings. Accepts a number, keyword, or formula.</div>
        <div class="note-section"><div class="note-section-title">🔧 Patterns</div><ul><li><code>:nth-child(3)</code> — 3rd child only</li><li><code>:nth-child(odd)</code> — 1st, 3rd, 5th…</li><li><code>:nth-child(even)</code> — 2nd, 4th, 6th…</li><li><code>:nth-child(3n)</code> — every 3rd (3, 6, 9…)</li><li><code>:nth-child(3n+1)</code> — 1st, 4th, 7th…</li></ul></div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div>Zebra-striped tables, grid pattern styling, selecting every Nth item.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Formula: <code>An+B</code> where A = cycle size, B = offset. Counting starts from 1.</div>
      `}
    >
      <ul>
        <li>1st item (odd)</li>
        <li>2nd item (even + nth-child(2))</li>
        <li>3rd item (odd)</li>
        <li>4th item (even)</li>
        <li>5th item (odd)</li>
      </ul>
    </SelectorSection>,

    /* 27 */
    <SelectorSection
      key="27" id="27-nth-last-child"
      title="27. :nth-last-child() Pseudo-Class"
      description="Same as nth-child but counts from the last element."
      defaultCSS={`li:nth-last-child(1) {\n  background: #c8e6c9;\n  font-weight: bold;\n}`}
      htmlCode={`<ul>\n  <li>Item 1</li>              <!-- 3rd from last -->\n  <li>Item 2</li>              <!-- 2nd from last -->\n  <li>Item 3 → selected!</li>  <!-- ✅ 1st from last -->\n</ul>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Same as <code>:nth-child()</code> but <b>counts backward</b> from the last sibling.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style last N items: <code>:nth-last-child(-n+3)</code> → last 3 items</li><li>Conditional styling based on total count (e.g., different layouts for different list lengths)</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>:nth-last-child(1)</code> is the same as <code>:last-child</code>.</div>
      `}
    >
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3 — last (nth-last-child(1)) → selected!</li>
      </ul>
    </SelectorSection>,

    /* 28 */
    <SelectorSection
      key="28" id="28-first-of-type"
      title="28. :first-of-type Pseudo-Class"
      description="Selects the first element of its type among siblings."
      defaultCSS={`span:first-of-type {\n  color: crimson;\n  background: #ffcdd2;\n  padding: 2px 6px;\n}`}
      htmlCode={`<div>\n  <p>A paragraph</p>\n  <span>First span → selected!</span>     <!-- ✅ -->\n  <br />\n  <span>Second span</span>                 <!-- ❌ -->\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects the <b>first occurrence</b> of a specific tag type among its siblings, regardless of position.</div>
        <div class="note-section"><div class="note-section-title">🔄 vs :first-child</div><code>:first-child</code> → must be the first child overall.<br/><code>:first-of-type</code> → first of its <b>tag type</b>, even if other elements come before it. Much more reliable!</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style first paragraph in an article: <code>article p:first-of-type</code></li><li>Drop cap on first paragraph</li></ul></div>
      `}
    >
      <div>
        <p>A paragraph</p>
        <span>First span → selected!</span>
        <br />
        <span>Second span</span>
      </div>
    </SelectorSection>,

    /* 29 */
    <SelectorSection
      key="29" id="29-last-of-type"
      title="29. :last-of-type Pseudo-Class"
      description="Selects the last element of its type among siblings."
      defaultCSS={`span:last-of-type {\n  color: blue;\n  font-weight: bold;\n  background: #bbdefb;\n  padding: 2px 6px;\n}`}
      htmlCode={`<div>\n  <span>First span</span>                  <!-- ❌ -->\n  <br />\n  <span>Last span → selected!</span>       <!-- ✅ -->\n  <p>A paragraph after</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects the <b>last occurrence</b> of a specific tag type among siblings.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Remove bottom margin from last paragraph: <code>p:last-of-type { margin-bottom: 0; }</code></li><li>Style the trailing element of a specific type</li></ul></div>
      `}
    >
      <div>
        <span>First span</span>
        <br />
        <span>Last span → selected!</span>
        <p>A paragraph after</p>
      </div>
    </SelectorSection>,

    /* 30 */
    <SelectorSection
      key="30" id="30-nth-of-type"
      title="30. :nth-of-type() Pseudo-Class"
      description="Selects the nth element of its type."
      defaultCSS={`p:nth-of-type(2) {\n  background: #ffe0b2;\n  border-left: 5px solid #ff9800;\n  padding-left: 8px;\n}`}
      htmlCode={`<div>\n  <p>1st paragraph</p>            <!-- p:nth-of-type(1) -->\n  <span>A span (ignored)</span>\n  <p>2nd paragraph → selected!</p> <!-- ✅ p:nth-of-type(2) -->\n  <p>3rd paragraph</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Like <code>:nth-child()</code> but only counts elements of the <b>same tag type</b>, ignoring other siblings.</div>
        <div class="note-section"><div class="note-section-title">🔄 vs :nth-child()</div><code>:nth-child(2)</code> — 2nd child regardless of type.<br/><code>:nth-of-type(2)</code> — 2nd element <b>of that specific tag</b>. More predictable when mixing element types.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div>Zebra striping mixed-content containers, styling every other paragraph in an article.</div>
      `}
    >
      <div>
        <p>1st paragraph</p>
        <span>A span (ignored)</span>
        <p>2nd paragraph → selected!</p>
        <p>3rd paragraph</p>
      </div>
    </SelectorSection>,

    /* 31 */
    <SelectorSection
      key="31" id="31-nth-last-of-type"
      title="31. :nth-last-of-type() Pseudo-Class"
      description="Selects nth element of type counting from the end."
      defaultCSS={`p:nth-last-of-type(1) {\n  background: #e1bee7;\n  border-left: 5px solid #8e24aa;\n  padding-left: 8px;\n}`}
      htmlCode={`<div>\n  <p>1st paragraph</p>\n  <p>2nd paragraph</p>\n  <p>3rd (last) → selected!</p>  <!-- ✅ -->\n  <span>A span after</span>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Counts from the <b>end</b>, only among elements of the same tag type.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style the last N paragraphs in a section</li><li>Conditional layout based on how many of a type exist</li></ul></div>
      `}
    >
      <div>
        <p>1st paragraph</p>
        <p>2nd paragraph</p>
        <p>3rd (last) paragraph → selected!</p>
        <span>A span after</span>
      </div>
    </SelectorSection>,

    /* 32 */
    <SelectorSection
      key="32" id="32-only-child"
      title="32. :only-child Pseudo-Class"
      description="Selects an element that is the only child of its parent."
      defaultCSS={`p:only-child {\n  color: red;\n  font-weight: bold;\n  border: 2px solid red;\n  padding: 6px;\n}`}
      htmlCode={`<!-- Case 1: ONLY child -->\n<div class="box">\n  <p>Only child → selected!</p>        <!-- ✅ -->\n</div>\n\n<!-- Case 2: NOT only child -->\n<div class="box">\n  <p>NOT only child.</p>                <!-- ❌ -->\n  <p>There's another child.</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches only if the element is the <b>sole child</b> of its parent — no other siblings of any type.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Center a single item differently: <code>.flex-container > *:only-child { margin: auto; }</code></li><li>Different layout when only one child exists</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Equivalent to <code>:first-child:last-child</code>.</div>
      `}
    >
      <div className="oc-box">
        <p>I am the only child → selected!</p>
      </div>
      <div className="oc-box" style={{ marginTop: "8px" }}>
        <p>I am NOT the only child.</p>
        <p>There's another child here.</p>
      </div>
    </SelectorSection>,

    /* 33 */
    <SelectorSection
      key="33" id="33-only-of-type"
      title="33. :only-of-type Pseudo-Class"
      description="Selects an element that is the only one of its type among siblings."
      defaultCSS={`span:only-of-type {\n  color: darkgreen;\n  font-weight: bold;\n  background: #c8e6c9;\n  padding: 2px 6px;\n}`}
      htmlCode={`<div>\n  <p>A paragraph</p>\n  <span>Only span → selected!</span>  <!-- ✅ only <span> -->\n  <p>Another paragraph</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches if the element is the <b>only one of its tag type</b> among siblings. Other types don't matter.</div>
        <div class="note-section"><div class="note-section-title">🔄 vs :only-child</div><code>:only-child</code> → no siblings at all.<br/><code>:only-of-type</code> → no siblings <b>of the same tag</b>. Can have siblings of other types.</div>
      `}
    >
      <div>
        <p>A paragraph</p>
        <span>Only span → selected!</span>
        <p>Another paragraph</p>
      </div>
    </SelectorSection>,

    /* 34 */
    <SelectorSection
      key="34" id="34-empty"
      title="34. :empty Pseudo-Class"
      description="Selects elements that have no children (no text, no elements)."
      defaultCSS={`div.empty-box:empty {\n  width: 100px;\n  height: 40px;\n  background: #ef9a9a;\n  border: 2px dashed red;\n}`}
      htmlCode={`<div class="empty-box"></div>                   <!-- ✅ empty -->\n<p>↑ That empty div is selected.</p>\n<div class="empty-box">I have text → NOT selected.</div>  <!-- ❌ -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements with <b>absolutely no content</b> — no text, no child elements, not even whitespace.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Hide empty containers: <code>.message:empty { display: none; }</code></li><li>Style empty table cells: <code>td:empty { background: #eee; }</code></li><li>Placeholder for dynamically loaded content</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Gotcha</div>Even a single space or newline inside the element will make it <b>not empty</b>. Only truly empty elements match.</div>
      `}
    >
      <div className="empty-box"></div>
      <p style={{ marginTop: "8px" }}>↑ That empty div is selected (red dashed box).</p>
      <div className="empty-box">I have text, so NOT selected.</div>
    </SelectorSection>,

    /* 35 */
    <SelectorSection
      key="35" id="35-not"
      title="35. :not() Pseudo-Class (Negation)"
      description="Selects elements that do NOT match the selector."
      defaultCSS={`p:not(.exclude) {\n  color: blue;\n  font-weight: bold;\n}`}
      htmlCode={`<p>No .exclude → selected (blue)!</p>             <!-- ✅ -->\n<p class="exclude">Has .exclude → NOT selected.</p> <!-- ❌ -->\n<p>No .exclude → selected (blue)!</p>             <!-- ✅ -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects elements that do <b>NOT match</b> the given selector. It's a negation / exclusion filter.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style all items except one: <code>li:not(.active) { opacity: 0.5; }</code></li><li>Exclude a class: <code>input:not([disabled]) { ... }</code></li><li>Target non-last items: <code>li:not(:last-child) { border-bottom: 1px solid; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Can be chained: <code>p:not(.a):not(.b)</code>. In modern CSS, accepts a list: <code>p:not(.a, .b)</code>.</div>
      `}
    >
      <p>No .exclude → selected (blue)!</p>
      <p className="exclude">Has .exclude → NOT selected.</p>
      <p>Also no .exclude → selected (blue)!</p>
    </SelectorSection>,

    /* 36 */
    <SelectorSection
      key="36" id="36-is"
      title="36. :is() Pseudo-Class"
      description="Matches any element that matches one of the selectors in the list."
      defaultCSS={`:is(h3, h4, h5) {\n  color: #e65100;\n}`}
      htmlCode={`<h3>h3 → selected!</h3>\n<h4>h4 → selected!</h4>\n<h5>h5 → selected!</h5>\n<p>paragraph → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>A shorthand that matches any element matching <b>any of the listed selectors</b>. Reduces repetition.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Simplify: <code>:is(h1, h2, h3) { color: navy; }</code> instead of writing each separately</li><li>Nested: <code>.card :is(h2, h3, p) { margin: 0; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Specificity</div>Takes the <b>highest specificity</b> of its arguments. <code>:is(.class, #id)</code> has specificity of <code>#id</code>.</div>
        <div class="note-section"><div class="note-section-title">🔄 vs :where()</div><code>:is()</code> → keeps highest specificity. <code>:where()</code> → always zero specificity.</div>
      `}
    >
      <h3>h3 → selected!</h3>
      <h4>h4 → selected!</h4>
      <h5>h5 → selected!</h5>
      <p>paragraph → NOT selected.</p>
    </SelectorSection>,

    /* 37 */
    <SelectorSection
      key="37" id="37-where"
      title="37. :where() Pseudo-Class"
      description="Same as :is() but with zero specificity. Easier to override."
      defaultCSS={`:where(p, span) {\n  color: #6a1b9a;\n  font-weight: bold;\n}`}
      htmlCode={`<p>Paragraph → selected!</p>\n<span>Span → selected!</span>\n<div>Div → NOT selected.</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Works exactly like <code>:is()</code> but its specificity is <b>always zero</b> — makes it very easy to override.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>CSS resets / base styles that should be easily overridden</li><li>Library defaults: <code>:where(.card, .panel) { padding: 16px; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use <code>:where()</code> for defaults, <code>:is()</code> for intentional styles. <code>:where()</code> is the "polite" version.</div>
      `}
    >
      <p>Paragraph → selected!</p>
      <span>Span → selected!</span>
      <div>Div → NOT selected.</div>
    </SelectorSection>,

    /* 38 */
    <SelectorSection
      key="38" id="38-has"
      title="38. :has() Pseudo-Class (Parent Selector)"
      description="Selects a parent element if it contains a child matching the selector."
      defaultCSS={`div:has(> img) {\n  border: 3px solid green;\n  background: #e8f5e9;\n  padding: 10px;\n}`}
      htmlCode={`<div>\n  <img src="https://via.placeholder.com/60x30?text=IMG" alt="example" />\n  <p>Parent selected!</p>\n</div>\n<div>\n  <p>No img → NOT selected.</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The long-awaited <b>"parent selector"</b>! Selects an element based on what's <b>inside it</b>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style parent if it contains an image: <code>figure:has(img) { ... }</code></li><li>Form validation: <code>form:has(input:invalid) { border: red; }</code></li><li>Conditional layouts: <code>.grid:has(> :nth-child(4)) { grid-template-columns: repeat(2, 1fr); }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Browser support</div>Modern browsers only (2023+). Not supported in Firefox before v121. Check <b>caniuse.com</b>.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>This is one of the most powerful selectors in CSS. It enables parent-based styling that was previously impossible without JavaScript.</div>
      `}
    >
      <div>
        <img src="https://via.placeholder.com/60x30?text=IMG" alt="example" />
        <p>This div HAS an img → parent selected!</p>
      </div>
      <div style={{ marginTop: "8px" }}>
        <p>This div has no img → NOT selected.</p>
      </div>
    </SelectorSection>,

    /* 39 */
    <SelectorSection
      key="39" id="39-checked"
      title="39. :checked Pseudo-Class"
      description="Selects checked checkboxes and radio buttons."
      defaultCSS={`input:checked + label {\n  color: green;\n  font-weight: bold;\n  background: #c8e6c9;\n  padding: 2px 6px;\n}`}
      htmlCode={`<input type="checkbox" id="chk1" checked />\n<label for="chk1"> Checked → label styled!</label>\n\n<input type="checkbox" id="chk2" />\n<label for="chk2"> Unchecked → toggle me!</label>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches checkboxes and radio buttons that are in a <b>checked/selected state</b>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Custom checkboxes: <code>input:checked + .checkmark { background: green; }</code></li><li>Toggle switches, CSS-only accordions, tab panels</li><li>Often used with <code>+</code> (adjacent sibling) to style the label</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Combined with hidden inputs + labels, you can create CSS-only interactive components without JavaScript!</div>
      `}
    >
      <input type="checkbox" id="live-chk1" defaultChecked />
      <label htmlFor="live-chk1"> Checked by default → label styled!</label>
      <br />
      <input type="checkbox" id="live-chk2" />
      <label htmlFor="live-chk2"> Unchecked → toggle me!</label>
    </SelectorSection>,

    /* 40 */
    <SelectorSection
      key="40" id="40-disabled"
      title="40. :disabled Pseudo-Class"
      description="Selects form elements that are disabled."
      defaultCSS={`input:disabled {\n  background: #e0e0e0;\n  cursor: not-allowed;\n  opacity: 0.6;\n}`}
      htmlCode={`<input type="text" placeholder="Enabled input" />\n<input type="text" placeholder="Disabled input" disabled />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements that have the <code>disabled</code> attribute, making them non-interactive.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Visually indicate disabled state: gray background, reduced opacity</li><li><code>cursor: not-allowed</code> to show it can't be clicked</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Works on <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code>, <code>&lt;textarea&gt;</code>, <code>&lt;button&gt;</code>, and <code>&lt;fieldset&gt;</code>.</div>
      `}
    >
      <input type="text" placeholder="Enabled input" />
      <br />
      <input type="text" placeholder="Disabled input" disabled style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 41 */
    <SelectorSection
      key="41" id="41-enabled"
      title="41. :enabled Pseudo-Class"
      description="Selects form elements that are enabled."
      defaultCSS={`input:enabled {\n  border: 2px solid green;\n}`}
      htmlCode={`<input type="text" placeholder="Enabled → green" />\n<input type="text" placeholder="Disabled" disabled />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements that are <b>NOT disabled</b>. The default state for most form elements.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Distinguish enabled inputs visually: <code>input:enabled { border: 2px solid green; }</code></li><li>Usually used alongside <code>:disabled</code> for contrast</li></ul></div>
      `}
    >
      <input type="text" placeholder="Enabled → green border" />
      <br />
      <input type="text" placeholder="Disabled" disabled style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 42 */
    <SelectorSection
      key="42" id="42-required"
      title="42. :required Pseudo-Class"
      description="Selects form elements with the required attribute."
      defaultCSS={`input:required {\n  border-left: 5px solid red;\n}`}
      htmlCode={`<input type="text" placeholder="Required" required />\n<input type="text" placeholder="Optional" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements that have the <code>required</code> attribute — must be filled before form submission.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Visual indicator: red border, asterisk via <code>::after</code></li><li>Accessibility: help users know which fields are mandatory</li></ul></div>
      `}
    >
      <input type="text" placeholder="Required field" required />
      <br />
      <input type="text" placeholder="Optional field" style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 43 */
    <SelectorSection
      key="43" id="43-optional"
      title="43. :optional Pseudo-Class"
      description="Selects form elements that are NOT required."
      defaultCSS={`input:optional {\n  border-left: 5px solid gray;\n}`}
      htmlCode={`<input type="text" placeholder="Required" required />\n<input type="text" placeholder="Optional → gray border" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The opposite of <code>:required</code>. Matches form elements without the <code>required</code> attribute.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Gray out optional fields or add "(optional)" label</li><li>Pair with <code>:required</code> for clear form field distinction</li></ul></div>
      `}
    >
      <input type="text" placeholder="Required" required />
      <br />
      <input type="text" placeholder="Optional → gray left border" style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 44 */
    <SelectorSection
      key="44" id="44-valid"
      title="44. :valid Pseudo-Class"
      description="Selects form elements with valid input values."
      defaultCSS={`input:valid {\n  border: 2px solid green;\n  background: #e8f5e9;\n}`}
      htmlCode={`<input type="email" value="test@example.com" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements whose current value passes the browser's <b>built-in validation</b> (type, pattern, min/max, etc.).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Green border for valid email: <code>input[type="email"]:valid</code></li><li>Real-time validation feedback without JavaScript</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>An empty optional field is <code>:valid</code>! Combine with <code>:not(:placeholder-shown)</code> to only show after user types.</div>
      `}
    >
      <input type="email" placeholder="Enter valid email" defaultValue="test@example.com" />
    </SelectorSection>,

    /* 45 */
    <SelectorSection
      key="45" id="45-invalid"
      title="45. :invalid Pseudo-Class"
      description="Selects form elements with invalid input values."
      defaultCSS={`input:invalid {\n  border: 2px solid red;\n  background: #ffebee;\n}`}
      htmlCode={`<input type="email" placeholder="Enter email" />\n<!-- Type "abc" (no @) → :invalid activates -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements whose value <b>fails</b> browser validation.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Red border on invalid input: <code>input:invalid { border-color: red; }</code></li><li>Show error messages: <code>input:invalid + .error { display: block; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Use <code>:user-invalid</code> (newer) to only show invalid styles <b>after</b> user interaction, avoiding red borders on page load.</div>
      `}
    >
      <input type="email" placeholder='Enter email (type "abc" to see :invalid)' />
    </SelectorSection>,

    /* 46 */
    <SelectorSection
      key="46" id="46-range"
      title="46. :in-range & :out-of-range Pseudo-Classes"
      description="Selects number inputs based on min/max constraints."
      defaultCSS={`input:in-range {\n  background: #c8e6c9;\n  border: 2px solid green;\n}\ninput:out-of-range {\n  background: #ffcdd2;\n  border: 2px solid red;\n}`}
      htmlCode={`<label>Enter 1–10: </label>\n<input type="number" min="1" max="10" value="5" />\n<!-- Try entering 0 or 11 -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div><code>:in-range</code> — value is within min/max.<br/><code>:out-of-range</code> — value exceeds min/max.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Number inputs with limits: age, quantity, ratings</li><li>Visual feedback: green = OK, red = out of bounds</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>Only works on inputs that have <code>min</code> and/or <code>max</code> attributes set.</div>
      `}
    >
      <label>Enter 1–10: </label>
      <input type="number" min="1" max="10" defaultValue="5" />
      <p style={{ fontSize: "0.85rem", color: "#666" }}>Try entering 0 or 11 to see :out-of-range</p>
    </SelectorSection>,

    /* 47 */
    <SelectorSection
      key="47" id="47-read-only"
      title="47. :read-only Pseudo-Class"
      description="Selects elements that are not editable by the user."
      defaultCSS={`input:read-only {\n  background: #f5f5f5;\n  color: #999;\n}`}
      htmlCode={`<input type="text" value="Read only" readonly />\n<input type="text" placeholder="Editable" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements that the user <b>cannot edit</b> — inputs with <code>readonly</code>, or non-editable elements.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Display-only form fields (e.g., auto-calculated values)</li><li>Gray out read-only inputs to signal non-interactivity</li></ul></div>
      `}
    >
      <input type="text" value="Read only text" readOnly />
      <br />
      <input type="text" placeholder="Editable" style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 48 */
    <SelectorSection
      key="48" id="48-read-write"
      title="48. :read-write Pseudo-Class"
      description="Selects elements that are editable."
      defaultCSS={`input:read-write {\n  border: 2px solid #2196f3;\n  background: #e3f2fd;\n}`}
      htmlCode={`<input type="text" placeholder="Editable → blue" />\n<input type="text" value="Read only" readonly />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The opposite of <code>:read-only</code>. Matches elements the user <b>can edit</b>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Highlight editable fields distinctly from read-only ones</li><li>Blue border for active inputs in a mixed form</li></ul></div>
      `}
    >
      <input type="text" placeholder="Editable → blue border" />
      <br />
      <input type="text" value="Read only" readOnly style={{ marginTop: "5px" }} />
    </SelectorSection>,

    /* 49 */
    <SelectorSection
      key="49" id="49-placeholder-shown"
      title="49. :placeholder-shown Pseudo-Class"
      description="Selects input when placeholder text is visible."
      defaultCSS={`input:placeholder-shown {\n  border: 2px dashed orange;\n  background: #fff3e0;\n}`}
      htmlCode={`<input type="text" placeholder="Placeholder visible → dashed orange" />\n<!-- Type something → placeholder gone → style removed -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches when the <b>placeholder text is currently visible</b> — i.e., the input is empty or hasn't been typed into.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Floating labels: show label when <code>:not(:placeholder-shown)</code></li><li>Different styling for empty vs filled inputs</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>The input must have a <code>placeholder</code> attribute for this to work (even <code>placeholder=" "</code> counts).</div>
      `}
    >
      <input type="text" placeholder="Placeholder visible → dashed orange" />
      <p style={{ fontSize: "0.85rem", color: "#666" }}>Type something to remove the dashed border</p>
    </SelectorSection>,

    /* 50 */
    <SelectorSection
      key="50" id="50-target"
      title="50. :target Pseudo-Class"
      description="Selects the element whose id matches the URL fragment (#hash)."
      defaultCSS={`#target-box:target {\n  background: #fff9c4;\n  border: 3px solid gold;\n}`}
      htmlCode={`<a href="#target-box">Click to target ↓</a>\n<div id="target-box">I'll be highlighted when targeted!</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches the element whose <code>id</code> matches the current URL's <b>hash fragment</b> (<code>#hash</code>).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Highlight sections after anchor links: <code>#section:target { background: yellow; }</code></li><li>CSS-only tabs and accordions (with anchor links)</li><li>Scroll-to highlight effects</li></ul></div>
      `}
    >
      <a href="#target-box">Click me to target the section below ↓</a>
      <div id="target-box" style={{ marginTop: "10px", padding: "10px" }}>
        I am #target-box → I'll be highlighted when targeted!
      </div>
    </SelectorSection>,

    /* 51 */
    <SelectorSection
      key="51" id="51-root"
      title="51. :root Pseudo-Class"
      description="Selects the root element (<html>). Used for CSS custom properties (variables)."
      defaultCSS={`.root-text {\n  color: #1976d2;\n  font-weight: bold;\n  font-size: 1.1em;\n}`}
      htmlCode={`<!-- :root targets <html> for CSS variables -->\n<div>\n  <p class="root-text">Styled with a variable-like color.</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Selects the document's <b>root element</b> — in HTML, that's <code>&lt;html&gt;</code>. Higher specificity than <code>html</code> selector.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Define CSS custom properties (variables): <code>:root { --primary: #1976d2; }</code></li><li>Global font size for <code>rem</code> calculations</li><li>Theme switching: <code>:root[data-theme="dark"] { --bg: #222; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>CSS variables defined on <code>:root</code> are accessible everywhere in the document. The foundation of theming!</div>
      `}
    >
      <div>
        <p className="root-text">This text uses color defined for the demo.</p>
      </div>
    </SelectorSection>,

    /* 52 */
    <SelectorSection
      key="52" id="52-lang"
      title="52. :lang() Pseudo-Class"
      description="Selects elements based on their language attribute."
      defaultCSS={`p:lang(fr) {\n  font-style: italic;\n  color: #1565c0;\n  border-left: 4px solid #1565c0;\n  padding-left: 8px;\n}`}
      htmlCode={`<p lang="fr">Bonjour! (lang="fr") → selected!</p>\n<p lang="en">Hello! (lang="en") → NOT selected.</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements based on their <b>language</b>, determined by the <code>lang</code> attribute or inherited from ancestors.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Different quotes for different languages: <code>:lang(fr) { quotes: "«" "»"; }</code></li><li>Language-specific typography (fonts, direction)</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Also matches sub-languages: <code>:lang(en)</code> matches <code>en-US</code>, <code>en-GB</code>, etc.</div>
      `}
    >
      <p lang="fr">Bonjour! (lang="fr") → italic &amp; blue!</p>
      <p lang="en">Hello! (lang="en") → NOT selected.</p>
    </SelectorSection>,

    /* 53 */
    <SelectorSection
      key="53" id="53-any-link"
      title="53. :any-link Pseudo-Class"
      description="Selects every link (both :link and :visited)."
      defaultCSS={`a:any-link {\n  color: #d32f2f;\n  text-decoration: underline;\n  font-weight: bold;\n}`}
      htmlCode={`<a href="https://google.com">Google</a>\n<a href="https://github.com">GitHub</a>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches all anchor elements with <code>href</code>, regardless of whether they're <b>visited or unvisited</b>. Shorthand for <code>:link, :visited</code>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Style all links uniformly: <code>a:any-link { color: inherit; }</code></li><li>When you don't want visited/unvisited distinction</li></ul></div>
      `}
    >
      <a href="https://google.com" target="_blank" rel="noreferrer">Google</a>{" "}
      <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
    </SelectorSection>,

    /* 54 */
    <SelectorSection
      key="54" id="54-default"
      title="54. :default Pseudo-Class"
      description="Selects form elements that are the default in a group."
      defaultCSS={`input:default + label {\n  font-weight: bold;\n  color: green;\n}`}
      htmlCode={`<input type="radio" name="live-choice" id="ld1" checked />\n<label for="ld1"> Default (bold green)</label>\n\n<input type="radio" name="live-choice" id="ld2" />\n<label for="ld2"> Other choice</label>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches form elements that are the <b>default selection</b> — the one with <code>checked</code> initially, or the default submit button.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Visually distinguish the default/recommended option in a form</li><li>Always matches the initial default, even if user changes selection</li></ul></div>
      `}
    >
      <input type="radio" name="live-choice" id="ld1" defaultChecked />
      <label htmlFor="ld1"> Default choice (bold green)</label>
      <br />
      <input type="radio" name="live-choice" id="ld2" />
      <label htmlFor="ld2"> Other choice</label>
    </SelectorSection>,

    /* 55 */
    <SelectorSection
      key="55" id="55-indeterminate"
      title="55. :indeterminate Pseudo-Class"
      description="Selects checkboxes/radios in an indeterminate state, or progress bars with no value."
      defaultCSS={`progress:indeterminate {\n  opacity: 0.5;\n}`}
      htmlCode={`<progress>Loading...</progress>\n<!-- No value → browser shows indeterminate state -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Matches elements in a <b>neither true nor false</b> state. Applies to:<ul><li>Checkboxes set to indeterminate via JS</li><li>Radio buttons where none in the group is checked</li><li><code>&lt;progress&gt;</code> without a <code>value</code> attribute</li></ul></div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>"Select all" checkboxes (partially checked)</li><li>Loading progress bars with unknown completion</li></ul></div>
      `}
    >
      <progress>Loading...</progress>
      <p style={{ fontSize: "0.85rem" }}>↑ Progress bar with no value → indeterminate</p>
    </SelectorSection>,

    /* 56 */
    <SelectorSection
      key="56" id="56-before"
      title="56. ::before Pseudo-Element"
      description="Inserts content before an element's actual content."
      defaultCSS={`.before-text::before {\n  content: "👉 ";\n  font-size: 1.2em;\n}`}
      htmlCode={`<p class="before-text">This text has ::before content.</p>\n<!-- Result: "👉 This text has ::before content." -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Creates a <b>pseudo-element</b> that is inserted <b>before</b> the element's content. Requires the <code>content</code> property.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Decorative icons: <code>::before { content: "★"; }</code></li><li>Required field asterisks: <code>label.required::before { content: "* "; color: red; }</code></li><li>Custom bullets, quotation marks, badges</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Important</div><code>content</code> is <b>mandatory</b> — even if empty: <code>content: "";</code>. Without it, the pseudo-element won't render.</div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Not accessible to screen readers for important text. Use for decorative content only.</div>
      `}
    >
      <p className="before-text">This text has ::before content.</p>
    </SelectorSection>,

    /* 57 */
    <SelectorSection
      key="57" id="57-after"
      title="57. ::after Pseudo-Element"
      description="Inserts content after an element's actual content."
      defaultCSS={`.after-text::after {\n  content: " ✅";\n  font-size: 1.2em;\n}`}
      htmlCode={`<p class="after-text">This text has ::after content.</p>\n<!-- Result: "This text has ::after content. ✅" -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Creates a pseudo-element inserted <b>after</b> the element's content. Same rules as <code>::before</code>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>External link icons: <code>a[target="_blank"]::after { content: " ↗"; }</code></li><li>Clearfix: <code>.clearfix::after { content: ""; display: table; clear: both; }</code></li><li>Tooltips, decorative elements, badges</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div><code>::before</code> and <code>::after</code> are the most-used pseudo-elements. Master them for clean, decoration-free HTML.</div>
      `}
    >
      <p className="after-text">This text has ::after content.</p>
    </SelectorSection>,

    /* 58 */
    <SelectorSection
      key="58" id="58-first-line"
      title="58. ::first-line Pseudo-Element"
      description="Selects the first line of a block-level element."
      defaultCSS={`.first-line-text::first-line {\n  font-weight: bold;\n  color: #0d47a1;\n  font-size: 1.1em;\n  text-transform: uppercase;\n}`}
      htmlCode={`<p class="first-line-text" style="max-width: 400px;">\n  This is the first line — bold blue uppercase.\n  The rest continues normally.\n</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles only the <b>first rendered line</b> of a block element. What counts as "first line" changes with container width!</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Magazine/newspaper style: bold first line of an article</li><li>Small caps or uppercase first line</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Limitations</div>Only works on <b>block-level</b> elements. Limited properties: font, color, background, text-decoration, text-transform, letter-spacing, word-spacing.</div>
      `}
    >
      <p className="first-line-text" style={{ maxWidth: "400px" }}>
        This is the first line and it will be bold and blue.
        The rest of the paragraph continues normally without
        the special styling applied to the first line only.
      </p>
    </SelectorSection>,

    /* 59 */
    <SelectorSection
      key="59" id="59-first-letter"
      title="59. ::first-letter Pseudo-Element"
      description="Selects the first letter of a block-level element."
      defaultCSS={`.first-letter-text::first-letter {\n  font-size: 2.8em;\n  color: #c62828;\n  float: left;\n  margin-right: 6px;\n  line-height: 0.85;\n}`}
      htmlCode={`<p class="first-letter-text">\n  Once upon a time, this paragraph had a big drop cap.\n</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles the <b>very first letter</b> of a block element — perfect for drop caps (large initial letters).</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Drop caps in articles/stories: large, floated first letter</li><li>Magazine-style typography</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>If the first character is punctuation (like a quote), it's included with the first letter. Only works on block elements.</div>
      `}
    >
      <p className="first-letter-text">
        Once upon a time, this paragraph had a big drop cap
        on the first letter, making it look like a storybook.
      </p>
    </SelectorSection>,

    /* 60 */
    <SelectorSection
      key="60" id="60-selection"
      title="60. ::selection Pseudo-Element"
      description="Styles the text that the user selects/highlights."
      defaultCSS={`.selection-text::selection {\n  background: #ffeb3b;\n  color: black;\n}`}
      htmlCode={`<p class="selection-text">\n  Select/highlight this text to see custom colors!\n</p>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles the <b>highlighted/selected text</b> when a user drags to select with the mouse or keyboard.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Brand-colored text selection: <code>::selection { background: #brand; color: white; }</code></li><li>Improving readability of selected text</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Limited properties</div>Only <code>color</code>, <code>background-color</code>, <code>text-shadow</code>, and <code>text-decoration</code> work inside <code>::selection</code>.</div>
      `}
    >
      <p className="selection-text">
        Try selecting (highlighting) this text to see custom selection colors!
      </p>
    </SelectorSection>,

    /* 61 */
    <SelectorSection
      key="61" id="61-placeholder"
      title="61. ::placeholder Pseudo-Element"
      description="Styles the placeholder text of an input."
      defaultCSS={`.placeholder-input::placeholder {\n  color: #e91e63;\n  font-style: italic;\n  opacity: 1;\n}`}
      htmlCode={`<input class="placeholder-input" type="text"\n       placeholder="I am pink italic placeholder!" />`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles the <b>placeholder text</b> shown inside empty inputs and textareas.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Custom placeholder color: <code>::placeholder { color: #999; }</code></li><li>Italic/smaller placeholder text</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Note</div>Browsers default to low opacity for placeholders. Add <code>opacity: 1;</code> to ensure consistent rendering across browsers.</div>
      `}
    >
      <input className="placeholder-input" type="text" placeholder="I am pink italic placeholder text!" />
    </SelectorSection>,

    /* 62 */
    <SelectorSection
      key="62" id="62-marker"
      title="62. ::marker Pseudo-Element"
      description="Styles the bullet or number of list items."
      defaultCSS={`li::marker {\n  color: #e91e63;\n  font-size: 1.4em;\n  font-weight: bold;\n}`}
      htmlCode={`<ul>\n  <li>Pink bullet!</li>\n  <li>Another pink bullet!</li>\n</ul>\n<ol>\n  <li>Pink number!</li>\n  <li>Pink number!</li>\n</ol>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles the <b>bullet point (•)</b> of unordered lists or the <b>number</b> of ordered lists.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Custom bullet colors: <code>li::marker { color: red; }</code></li><li>Custom bullet content: <code>li::marker { content: "→ "; }</code></li><li>Emoji bullets: <code>li::marker { content: "✅ "; }</code></li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Limited properties</div>Only a few properties work: <code>color</code>, <code>font-size</code>, <code>font-weight</code>, <code>content</code>, and animation properties.</div>
      `}
    >
      <ul>
        <li>Pink bullet!</li>
        <li>Another pink bullet!</li>
        <li>Third pink bullet!</li>
      </ul>
      <ol>
        <li>Pink number!</li>
        <li>Pink number!</li>
      </ol>
    </SelectorSection>,

    /* 63 */
    <SelectorSection
      key="63" id="63-file-selector"
      title="63. ::file-selector-button Pseudo-Element"
      description="Styles the button of a file input."
      defaultCSS={`input[type="file"]::file-selector-button {\n  background: #1976d2;\n  color: white;\n  border: none;\n  padding: 8px 20px;\n  border-radius: 6px;\n  cursor: pointer;\n}`}
      htmlCode={`<input type="file" />\n<!-- The "Choose File" button gets custom styled -->`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Styles the <b>"Choose File" / "Browse" button</b> inside <code>&lt;input type="file"&gt;</code>.</div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Brand-styled file upload buttons matching your design system</li><li>Custom colors, padding, border-radius, hover effects</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>Add <code>::file-selector-button:hover { ... }</code> for hover effects. You can also combine with <code>:focus</code>.</div>
      `}
    >
      <input type="file" />
    </SelectorSection>,

    /* 64 */
    <SelectorSection
      key="64" id="64-nesting"
      title="64. CSS Nesting Selector ( & )"
      description="Native CSS nesting. The & refers to the parent selector."
      defaultCSS={`.nest-box {\n  color: black;\n  padding: 15px;\n}\n.nest-box .nested-child {\n  color: #1565c0;\n  font-weight: bold;\n}\n.nest-box:hover {\n  background: #f3e5f5;\n}`}
      htmlCode={`<div class="nest-box">\n  <p>Parent text (hover the box!)</p>\n  <p class="nested-child">Nested child → blue & bold!</p>\n</div>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>Native CSS nesting lets you write <b>child selectors inside the parent rule</b>, using <code>&amp;</code> to refer to the parent. Inspired by Sass/Less.</div>
        <div class="note-section"><div class="note-section-title">🔧 Syntax</div><code>.parent {<br/>&nbsp;&nbsp;color: black;<br/>&nbsp;&nbsp;&amp; .child { color: blue; }<br/>&nbsp;&nbsp;&amp;:hover { background: pink; }<br/>}</code></div>
        <div class="note-section"><div class="note-section-title">🔧 When to use</div><ul><li>Component-based CSS without preprocessors</li><li>Grouping related styles together for readability</li></ul></div>
        <div class="note-section"><div class="note-section-title">⚠️ Browser support</div>Supported in Chrome 120+, Firefox 117+, Safari 17.2+. Use with caution for older browser support.</div>
      `}
    >
      <div className="nest-box">
        <p>Parent text (hover the box!)</p>
        <p className="nested-child">Nested child → blue &amp; bold!</p>
      </div>
    </SelectorSection>,

    /* 65 */
    <SelectorSection
      key="65" id="65-column"
      title="65. Column Combinator ( || ) — Experimental"
      description="Selects table cells belonging to a column. (Limited browser support — using nth-child fallback)"
      defaultCSS={`td:nth-child(2) {\n  background: #fff9c4;\n  font-weight: bold;\n}`}
      htmlCode={`<table border="1" cellpadding="8">\n  <thead>\n    <tr>\n      <th>Name</th>\n      <th>Score (highlighted)</th>\n      <th>Grade</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr><td>Alice</td><td>95</td><td>A</td></tr>\n    <tr><td>Bob</td><td>87</td><td>B</td></tr>\n  </tbody>\n</table>`}
      notes={`
        <div class="note-section"><div class="note-section-title">📌 What it does</div>The <code>||</code> combinator is designed to select <b>table cells belonging to a specific column</b> defined by <code>&lt;col&gt;</code>. Syntax: <code>col.highlight || td</code>.</div>
        <div class="note-section"><div class="note-section-title">⚠️ Browser support</div><b>Almost no browser support!</b> This is an experimental Level 4 selector. The demo uses <code>td:nth-child(2)</code> as a practical fallback.</div>
        <div class="note-section"><div class="note-section-title">🔧 Fallback</div><ul><li>Use <code>td:nth-child(N)</code> to target specific columns</li><li>Or add classes to <code>&lt;td&gt;</code> elements in the target column</li></ul></div>
        <div class="note-section"><div class="note-section-title">💡 Tip</div>For now, stick with <code>:nth-child()</code> for column styling. The <code>||</code> combinator may gain support in the future.</div>
      `}
    >
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Score (highlighted column)</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Alice</td><td>95</td><td>A</td></tr>
          <tr><td>Bob</td><td>87</td><td>B</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: "0.85rem", color: "#999" }}>
        Note: || combinator has very limited support. Column highlighted with nth-child fallback.
      </p>
    </SelectorSection>,
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

  const selectorTitles = [
    "1. Universal Selector ( * )",
    "2. Type (Element) Selector",
    "3. Class Selector ( .className )",
    "4. ID Selector ( #idName )",
    "5. Grouping Selector ( A, B )",
    "6. Descendant Selector ( A B )",
    "7. Child Selector ( A > B )",
    "8. Adjacent Sibling ( A + B )",
    "9. General Sibling ( A ~ B )",
    "10. Attribute [attr]",
    '11. Attribute [attr="value"]',
    '12. Attribute [attr^="value"]',
    '13. Attribute [attr$="value"]',
    '14. Attribute [attr*="value"]',
    '15. Attribute [attr~="value"]',
    '16. Attribute [attr|="value"]',
    "17. :hover",
    "18. :active",
    "19. :focus",
    "20. :focus-within",
    "21. :focus-visible",
    "22. :visited",
    "23. :link",
    "24. :first-child",
    "25. :last-child",
    "26. :nth-child()",
    "27. :nth-last-child()",
    "28. :first-of-type",
    "29. :last-of-type",
    "30. :nth-of-type()",
    "31. :nth-last-of-type()",
    "32. :only-child",
    "33. :only-of-type",
    "34. :empty",
    "35. :not()",
    "36. :is()",
    "37. :where()",
    "38. :has()",
    "39. :checked",
    "40. :disabled",
    "41. :enabled",
    "42. :required",
    "43. :optional",
    "44. :valid",
    "45. :invalid",
    "46. :in-range / :out-of-range",
    "47. :read-only",
    "48. :read-write",
    "49. :placeholder-shown",
    "50. :target",
    "51. :root",
    "52. :lang()",
    "53. :any-link",
    "54. :default",
    "55. :indeterminate",
    "56. ::before",
    "57. ::after",
    "58. ::first-line",
    "59. ::first-letter",
    "60. ::selection",
    "61. ::placeholder",
    "62. ::marker",
    "63. ::file-selector-button",
    "64. CSS Nesting ( & )",
    "65. Column Combinator ( || )",
  ];

  return (
    <div className="css-selectors-page">
      <h1>Complete CSS Selectors Reference</h1>
      <p className="page-subtitle">
        ✏️ Each CSS &amp; HTML section is <strong>editable</strong> — modify the code, click <strong>Apply</strong>, and see changes instantly!
        <br />
        <span style={{ fontSize: "0.9em", opacity: 0.8 }}>Use ← → arrow keys or buttons to navigate • Jump to any selector with the dropdown • 📖 Read the explanation on the right</span>
      </p>

      {/* ======== NAVIGATION BAR ======== */}
      <div className="nav-bar">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={goPrev}
          disabled={currentIndex === 0}
          title="Previous selector (← Arrow Key)"
        >
          ◀
        </button>

        <div className="nav-center">
          <select
            className="nav-dropdown"
            value={currentIndex}
            onChange={(e) => goToSection(Number(e.target.value))}
          >
            {selectorTitles.map((title, i) => (
              <option key={i} value={i}>{title}</option>
            ))}
          </select>
          <span className="nav-counter">
            {currentIndex + 1} / {totalSections}
          </span>
        </div>

        <button
          className="nav-arrow nav-arrow-right"
          onClick={goNext}
          disabled={currentIndex === totalSections - 1}
          title="Next selector (→ Arrow Key)"
        >
          ▶
        </button>
      </div>

      {/* ======== PROGRESS BAR ======== */}
      <div className="nav-progress-bar">
        <div
          className="nav-progress-fill"
          style={{ width: `${((currentIndex + 1) / totalSections) * 100}%` }}
        />
      </div>

      {/* ======== RENDER ONLY CURRENT SECTION ======== */}
      {sections[currentIndex]}

      {/* ======== BOTTOM NAVIGATION ======== */}
      <div className="nav-bar nav-bar-bottom">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ◀ Prev
        </button>
        <span className="nav-counter">
          {currentIndex + 1} / {totalSections}
        </span>
        <button
          className="nav-arrow nav-arrow-right"
          onClick={goNext}
          disabled={currentIndex === totalSections - 1}
        >
          Next ▶
        </button>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "30px", color: "#666", borderTop: "2px solid #eee", marginTop: "40px" }}>
        <p>🎓 Total: 65 CSS Selectors Covered — One at a Time!</p>
        <p>Each section: 🎨 Editable CSS → 📄 Editable HTML → 👁️ Live Output → 📖 Explanation</p>
        <p>✏️ Edit any CSS or HTML block, click <strong>Apply</strong> (or Ctrl+Enter), and see live changes!</p>
        <p>Prepared for CSS Class Lecture</p>
      </footer>
    </div>
  );
};

export default CSSSelectors;
