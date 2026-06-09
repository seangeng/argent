import { useState } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";

/** A restrained theme — desaturated, just enough color to read by. */
const theme: PrismTheme = {
  plain: { color: "#e6e6e3", backgroundColor: "transparent" },
  styles: [
    { types: ["comment", "prolog", "cdata"], style: { color: "#6b6b70", fontStyle: "italic" } },
    { types: ["punctuation"], style: { color: "#8b8b90" } },
    { types: ["keyword", "operator", "boolean", "rule"], style: { color: "#b6a6e6" } },
    { types: ["string", "char", "attr-value", "inserted"], style: { color: "#9bc7a3" } },
    { types: ["function", "function-variable", "method"], style: { color: "#8fb6e6" } },
    { types: ["number", "constant", "symbol"], style: { color: "#e0b083" } },
    { types: ["tag", "selector", "deleted"], style: { color: "#e29a9a" } },
    { types: ["attr-name", "property", "class-name"], style: { color: "#d8cba0" } },
    { types: ["variable", "parameter"], style: { color: "#e6e6e3" } },
  ],
};

export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div className="code">
      <div className="code-head">
        <span className="code-lang">{lang}</span>
        <button className="code-copy" onClick={copy} aria-label="Copy code">
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <Highlight code={code.trim()} language={lang} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre>
            {tokens.map((line, i) => {
              const { key, ...lineProps } = getLineProps({ line });
              return (
                <div key={i} {...lineProps} className="code-line">
                  <span className="code-ln">{i + 1}</span>
                  <span className="code-lc">
                    {line.map((token, k) => {
                      const { key: tk, ...tokenProps } = getTokenProps({ token });
                      return <span key={k} {...tokenProps} />;
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
