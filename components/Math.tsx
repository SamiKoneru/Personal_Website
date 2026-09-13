import katex from "katex";

const OPTIONS = {
  throwOnError: false,
  strict: false as const,
  trust: true,
  macros: {
    "\\R": "\\mathbb{R}",
    "\\C": "\\mathbb{C}",
    "\\Z": "\\mathbb{Z}",
    "\\T": "^{\\mathsf{T}}",
    "\\Ord": "\\mathcal{O}",
  },
};

/** Inline math. Write TeX with the `tex` template tag: <M>{tex`x_t`}</M> */
export function M({ children }: { children: string }) {
  const html = katex.renderToString(children, {
    ...OPTIONS,
    displayMode: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Display math, optionally numbered. */
export function Eq({
  children,
  tag,
}: {
  children: string;
  tag?: string;
}) {
  const html = katex.renderToString(children, {
    ...OPTIONS,
    displayMode: true,
  });
  return (
    <div className={tag ? "eq eq-tagged" : "eq"}>
      <div className="eq-body" dangerouslySetInnerHTML={{ __html: html }} />
      {tag ? <span className="eq-tag">({tag})</span> : null}
    </div>
  );
}

/** String.raw alias so TeX backslashes can be written literally. */
export const tex = String.raw;
