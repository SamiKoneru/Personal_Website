import type { Metadata } from "next";
import Link from "next/link";
import { Eq, M, tex } from "@/components/Math";
import "katex/dist/katex.min.css";
import "./notes.css";

export const metadata: Metadata = {
  title: "Convolution, Kernels, and Subquadratic Sequence Models",
  description:
    "A worked, complexity-first walkthrough of discrete convolution, LTI systems, convolution kernels, FFT-based evaluation, and the family of subquadratic sequence models built on them: S4, H3, Hyena, Mamba, linear attention, and the 2026 state of the art.",
};

/* ---------- small presentational helpers (server components) ---------- */

function H2({
  n,
  id,
  children,
}: {
  n: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="note-h2">
      <span className="num">{n}</span>
      <span>{children}</span>
    </h2>
  );
}

function H3({
  n,
  id,
  children,
}: {
  n: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3 id={id} className="note-h3">
      <span className="num">{n}</span>
      {children}
    </h3>
  );
}

const LABELS = {
  def: "Definition",
  ex: "Example",
  prop: "Proposition",
  note: "Note",
} as const;

function Block({
  kind,
  title,
  children,
}: {
  kind: keyof typeof LABELS;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`block block-${kind}`}>
      <div className="block-label">
        <span className="dot" />
        {LABELS[kind]}
        {title ? <span className="title">&nbsp;&middot;&nbsp;{title}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="note-table-wrap">
      <table className="note-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? "rowname" : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TOC = [
  ["1", "cost-model", "The problem and the cost model"],
  ["2", "convolution", "Convolution from first principles"],
  ["3", "fft", "The Fourier route to L log L"],
  ["4", "kernels", "Kernels: how you parameterize h"],
  ["5", "ssm", "Linear state-space models"],
  ["6", "attention", "Attention as the reference point"],
  ["7", "hyena", "Hyena"],
  ["8", "selective", "Breaking time-invariance: Mamba"],
  ["9", "linear-attention", "Linear attention and state space duality"],
  ["10", "unified", "One picture: P = A ⊙ M"],
  ["11", "frontier", "Where the field is now"],
  ["12", "summary", "Complexity summary"],
  ["13", "glossary", "Glossary of symbols and operators"],
  ["14", "refs", "References"],
];

export default function Page() {
  return (
    <main className="note-page">
      <header className="space-y-5 animate-fade-in-up">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
          <Link href="/" className="pill">
            &larr; Home
          </Link>
          <span className="pill">Notes</span>
          <span className="pill">Sequence models</span>
          <span className="pill">Updated September 2026</span>
        </div>
        <h1 className="gradient-text pb-2 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Convolution, Kernels, and
          <br className="hidden sm:block" /> Subquadratic Sequence Models
        </h1>
        <div className="accent-bar" />
        <p className="max-w-3xl text-lg text-[color:var(--muted)] sm:text-xl">
          What a convolution actually is, why linear time-invariant systems have
          no choice but to be convolutions, how the FFT drops the cost to{" "}
          <M>{tex`\mathcal{O}(L\log L)`}</M>, and how S4, H3,{" "}
          <a
            href="https://arxiv.org/abs/2302.10866"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-[color:var(--foreground)]"
          >
            Hyena
          </a>
          , Mamba and linear attention all fall out of that one idea. Everything
          is stated with its time complexity and demonstrated on a small worked
          example.
        </p>
      </header>

      <div className="mt-16 gap-14 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="mb-14 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[color:var(--muted)]">
              Contents
            </p>
            <nav className="toc">
              {TOC.map(([n, id, label]) => (
                <a key={id} href={`#${id}`}>
                  <span className="n">{n}</span>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="note-prose">
          {/* ================= 1 ================= */}
          <H2 n="1" id="cost-model">
            The problem and the cost model
          </H2>

          <p>
            A <strong>sequence model layer</strong> is a map{" "}
            <M>{tex`\mathsf{T}:\mathbb{R}^{L\times D}\to\mathbb{R}^{L\times D}`}</M>
            . <M>{tex`L`}</M> is the <strong>sequence length</strong> (number of
            positions, tokens, base pairs, samples) and <M>{tex`D`}</M> is the{" "}
            <strong>width</strong> (number of channels per position). Write the
            input as <M>{tex`u`}</M>, with <M>{tex`u_t\in\mathbb{R}^D`}</M> the
            vector at position <M>{tex`t`}</M> and{" "}
            <M>{tex`u_t^{(d)}\in\mathbb{R}`}</M> its <M>{tex`d`}</M>-th channel.
          </p>

          <p>
            Almost every such layer splits into two jobs:{" "}
            <strong>channel mixing</strong> (each position independently, a
            matrix multiply of cost <M>{tex`\mathcal{O}(LD^2)`}</M>) and{" "}
            <strong>position mixing</strong> (moving information between
            positions). Channel mixing is linear in <M>{tex`L`}</M> and nobody
            argues about it. The entire subquadratic literature is about the
            second job. Softmax attention does it in{" "}
            <M>{tex`\Theta(L^2D)`}</M>, and the question is what else can be put
            there.
          </p>

          <Block kind="def" title="What we count">
            <p>Four separate resources, which are easy to conflate:</p>
            <ul>
              <li>
                <strong>Work</strong> <M>{tex`W(L)`}</M>: total real
                multiply-adds, counted as FLOPs. This is what &quot;
                <M>{tex`\mathcal{O}(L^2)`}</M> attention&quot; refers to.
              </li>
              <li>
                <strong>Depth</strong> <M>{tex`\mathsf{D}(L)`}</M>: the length of
                the longest chain of data-dependent operations, i.e. the runtime
                given unlimited parallelism. A sequential RNN has depth{" "}
                <M>{tex`\Theta(L)`}</M>; a convolution evaluated by FFT has depth{" "}
                <M>{tex`\Theta(\log L)`}</M>. Depth, not work, is why RNNs lost
                to Transformers on GPUs.
              </li>
              <li>
                <strong>Parameters</strong> <M>{tex`|\theta|`}</M>: learned
                reals. Independent of the two above. A layer can have{" "}
                <M>{tex`\mathcal{O}(1)`}</M> parameters and{" "}
                <M>{tex`\mathcal{O}(L^2)`}</M> work, or the reverse.
              </li>
              <li>
                <strong>Decode state</strong> <M>{tex`S`}</M>: bytes that must
                survive between autoregressive steps. Attention keeps a KV cache
                of size <M>{tex`\Theta(LD)`}</M>; a state-space model keeps{" "}
                <M>{tex`\Theta(DN)`}</M>, independent of <M>{tex`L`}</M>. At
                inference time this, not FLOPs, is usually the binding
                constraint.
              </li>
            </ul>
          </Block>

          <p>
            &quot;Subquadratic&quot; in this literature always means{" "}
            <em>subquadratic work in <M>{tex`L`}</M></em>: something in{" "}
            <M>{tex`o(L^2)`}</M>, typically <M>{tex`\Theta(L\log L)`}</M> (FFT
            convolutions) or <M>{tex`\Theta(L)`}</M> (recurrences and linear
            attention). It says nothing about the <M>{tex`D`}</M> or{" "}
            <M>{tex`N`}</M> factors, which is where the real constants hide.
          </p>

          <hr className="rule" />

          {/* ================= 2 ================= */}
          <H2 n="2" id="convolution">
            Convolution from first principles
          </H2>

          <H3 n="2.1" id="conv-def">
            The definition
          </H3>

          <p>
            A <strong>filter</strong> (also called a <strong>kernel</strong>) is
            a sequence of real numbers{" "}
            <M>{tex`h=(h_t)_{t\in\mathbb{Z}}`}</M>, absolutely summable so the
            sums below converge. The <strong>linear (aperiodic) convolution</strong>{" "}
            of <M>{tex`h`}</M> with a length-<M>{tex`L`}</M> signal{" "}
            <M>{tex`u\in\mathbb{R}^L`}</M> is
          </p>

          <Eq tag="2.1">{tex`y_t \;=\; (h * u)_t \;=\; \sum_{n=0}^{L-1} h_{t-n}\, u_n .`}</Eq>

          <p>
            Read it as: the output at position <M>{tex`t`}</M> is a weighted sum
            of the whole input, where the weight applied to input position{" "}
            <M>{tex`n`}</M> depends only on the <strong>offset</strong>{" "}
            <M>{tex`t-n`}</M>, never on <M>{tex`t`}</M> and <M>{tex`n`}</M>{" "}
            separately. That single restriction is the entire content of the
            operation, and section 2.2 shows it is forced rather than chosen.
          </p>

          <Block kind="ex" title="A convolution, computed by hand">
            <p>
              Take the filter <M>{tex`h=(h_0,h_1,h_2)=(1,2,3)`}</M> (so{" "}
              <M>{tex`h_t=0`}</M> outside <M>{tex`t\in\{0,1,2\}`}</M>) and the
              signal <M>{tex`u=(1,0,-1,4)`}</M>, with <M>{tex`L=4`}</M>. Apply
              (2.1) term by term, dropping every <M>{tex`h_{t-n}`}</M> that is
              zero:
            </p>
            <Eq>{tex`\begin{aligned}
y_0 &= h_0u_0 = 1\cdot 1 &&= 1\\
y_1 &= h_1u_0 + h_0u_1 = 2\cdot 1 + 1\cdot 0 &&= 2\\
y_2 &= h_2u_0 + h_1u_1 + h_0u_2 = 3 + 0 - 1 &&= 2\\
y_3 &= h_2u_1 + h_1u_2 + h_0u_3 = 0 - 2 + 4 &&= 2\\
y_4 &= h_2u_2 + h_1u_3 = -3 + 8 &&= 5\\
y_5 &= h_2u_3 = 3\cdot 4 &&= 12
\end{aligned}`}</Eq>
            <p>
              So <M>{tex`h*u=(1,2,2,2,5,12)`}</M>. Note the length:{" "}
              <M>{tex`L+M-1=4+3-1=6`}</M>, where <M>{tex`M`}</M> is the filter
              support. A length-<M>{tex`L`}</M> input convolved with a
              length-<M>{tex`M`}</M> filter is longer than either. In a sequence
              model you keep the first <M>{tex`L`}</M> entries and discard the
              tail; the tail is exactly what would wrap around and corrupt the
              result if you were careless with the FFT, which is the subject of{" "}
              <a href="#padding">section 3.4</a>.
            </p>
          </Block>

          <H3 n="2.2" id="lti">
            Why convolution is not a design choice
          </H3>

          <p>
            Convolution is usually introduced as &quot;a thing you can do to a
            signal.&quot; It is better understood as the unique answer to a
            structural constraint. Define the <strong>shift operator</strong>{" "}
            <M>{tex`\mathsf{S}_k`}</M> by{" "}
            <M>{tex`(\mathsf{S}_k u)_t = u_{t-k}`}</M>, and the{" "}
            <strong>Kronecker delta</strong> <M>{tex`\delta`}</M> by{" "}
            <M>{tex`\delta_0=1`}</M> and <M>{tex`\delta_t=0`}</M> otherwise.
          </p>

          <Block kind="def" title="Linear time-invariant (LTI) operator">
            <p>
              An operator{" "}
              <M>{tex`\mathsf{T}:\mathbb{R}^{\mathbb{Z}}\to\mathbb{R}^{\mathbb{Z}}`}</M>{" "}
              is
            </p>
            <ul>
              <li>
                <strong>linear</strong> if{" "}
                <M>{tex`\mathsf{T}(au+bw)=a\,\mathsf{T}u+b\,\mathsf{T}w`}</M> for
                all <M>{tex`a,b\in\mathbb{R}`}</M> and all signals{" "}
                <M>{tex`u,w`}</M>;
              </li>
              <li>
                <strong>time-invariant</strong> if it commutes with every shift:{" "}
                <M>{tex`\mathsf{T}\,\mathsf{S}_k=\mathsf{S}_k\,\mathsf{T}`}</M>{" "}
                for all <M>{tex`k\in\mathbb{Z}`}</M>. Concretely: delaying the
                input by <M>{tex`k`}</M> steps delays the output by{" "}
                <M>{tex`k`}</M> steps and changes nothing else.
              </li>
            </ul>
            <p>
              The <strong>impulse response</strong> of <M>{tex`\mathsf{T}`}</M>{" "}
              is <M>{tex`h := \mathsf{T}\delta`}</M>, the output on a single
              spike.
            </p>
          </Block>

          <Block kind="prop" title="Every LTI operator is a convolution">
            <p>
              If <M>{tex`\mathsf{T}`}</M> is linear and time-invariant with
              impulse response <M>{tex`h=\mathsf{T}\delta`}</M>, then{" "}
              <M>{tex`\mathsf{T}u = h*u`}</M> for every <M>{tex`u`}</M>.
            </p>
            <p>
              <em>Proof.</em> Any signal is a sum of shifted, scaled impulses:{" "}
              <M>{tex`u=\sum_{n} u_n\,\mathsf{S}_n\delta`}</M>, because the{" "}
              <M>{tex`t`}</M>-th entry of the right side is{" "}
              <M>{tex`\sum_n u_n\delta_{t-n}=u_t`}</M>. Now push{" "}
              <M>{tex`\mathsf{T}`}</M> through:
            </p>
            <Eq>{tex`\mathsf{T}u \;\overset{\text{lin.}}{=}\; \sum_n u_n\,\mathsf{T}\mathsf{S}_n\delta \;\overset{\text{t.i.}}{=}\; \sum_n u_n\,\mathsf{S}_n\mathsf{T}\delta \;=\; \sum_n u_n\,\mathsf{S}_n h ,`}</Eq>
            <p>
              and evaluating at <M>{tex`t`}</M> gives{" "}
              <M>{tex`(\mathsf{T}u)_t=\sum_n u_n h_{t-n}`}</M>, which is (2.1).{" "}
              <M>{tex`\square`}</M>
            </p>
          </Block>

          <p>
            This is the load-bearing fact for everything below. The set of LTI
            layers and the set of convolution layers are the same set. So if you
            want a position-mixing layer that is (a) linear in its input and (b)
            indifferent to absolute position, you have already chosen a
            convolution, and the only remaining freedom is <em>which filter</em>.
            It follows that any layer strictly more expressive than a convolution
            must break linearity or break time-invariance. Both escape hatches
            are used in practice, and they name the two branches of this field:
          </p>

          <ul>
            <li>
              <strong>Break linearity in <M>{tex`u`}</M></strong>: keep fixed
              filters, but multiply by input-dependent diagonal matrices between
              convolutions. This is H3, GSS, and{" "}
              <a href="#hyena">Hyena</a>.
            </li>
            <li>
              <strong>Break time-invariance</strong>: let the system matrices
              depend on the input at each step. This is{" "}
              <a href="#selective">Mamba</a> and the gated linear attention
              family.
            </li>
          </ul>

          <H3 n="2.3" id="causal">
            Causality, FIR, IIR, and receptive field
          </H3>

          <ul>
            <li>
              <M>{tex`h`}</M> is <strong>causal</strong> if{" "}
              <M>{tex`h_t=0`}</M> for all <M>{tex`t<0`}</M>. Then{" "}
              <M>{tex`y_t`}</M> depends only on{" "}
              <M>{tex`u_0,\dots,u_t`}</M>, which is exactly the requirement for
              autoregressive language modeling.
            </li>
            <li>
              <M>{tex`h`}</M> is <strong>FIR</strong> (finite impulse response)
              if its support has finite size <M>{tex`M`}</M>; otherwise{" "}
              <strong>IIR</strong>. A standard CNN kernel is FIR with{" "}
              <M>{tex`M\in\{3,5,7\}`}</M>. A &quot;long convolution&quot; means{" "}
              <M>{tex`M\approx L`}</M>.
            </li>
            <li>
              The <strong>receptive field</strong> or <strong>memory</strong> of
              the layer is measured by{" "}
              <M>{tex`\partial y_t/\partial u_{t-n} = h_n`}</M>. The number of
              non-negligible <M>{tex`h_n`}</M> is how far back the layer can see.
              For an FIR filter that is <M>{tex`M`}</M>, hard-capped. This is the
              key number that implicit parameterizations decouple from the
              parameter count.
            </li>
          </ul>

          <H3 n="2.4" id="toeplitz">
            Matrix form: Toeplitz
          </H3>

          <p>
            Restrict (2.1) to outputs <M>{tex`t=0,\dots,L-1`}</M>. Then the map{" "}
            <M>{tex`u\mapsto h*u`}</M> is a matrix-vector product{" "}
            <M>{tex`\mathsf{S}_h u`}</M> with{" "}
            <M>{tex`(\mathsf{S}_h)_{tn}=h_{t-n}`}</M>:
          </p>

          <Eq tag="2.2">{tex`\mathsf{S}_h=\begin{bmatrix} h_0 & h_{-1} & h_{-2} & h_{-3}\\ h_1 & h_0 & h_{-1} & h_{-2}\\ h_2 & h_1 & h_0 & h_{-1}\\ h_3 & h_2 & h_1 & h_0 \end{bmatrix},\qquad \mathsf{S}_h^{\text{causal}}=\begin{bmatrix} h_0 & 0 & 0 & 0\\ h_1 & h_0 & 0 & 0\\ h_2 & h_1 & h_0 & 0\\ h_3 & h_2 & h_1 & h_0 \end{bmatrix}.`}</Eq>

          <Block kind="def" title="Toeplitz matrix">
            <p>
              <M>{tex`\mathsf{S}\in\mathbb{R}^{L\times L}`}</M> is{" "}
              <strong>Toeplitz</strong> if{" "}
              <M>{tex`\mathsf{S}_{tn}`}</M> depends only on{" "}
              <M>{tex`t-n`}</M>, i.e. it is constant along every diagonal. Such a
              matrix has <M>{tex`L^2`}</M> entries but only{" "}
              <M>{tex`2L-1`}</M> degrees of freedom. A causal filter gives a{" "}
              <strong>lower-triangular</strong> Toeplitz matrix with{" "}
              <M>{tex`L`}</M> degrees of freedom.
            </p>
          </Block>

          <p>
            Keep this picture: attention&apos;s <M>{tex`\mathsf{A}(u)`}</M> and a
            convolution&apos;s <M>{tex`\mathsf{S}_h`}</M> are both{" "}
            <M>{tex`L\times L`}</M> matrices acting on the value sequence. They
            differ in two ways: <M>{tex`\mathsf{A}`}</M> depends on the input and
            is unstructured (<M>{tex`L^2`}</M> free entries), while{" "}
            <M>{tex`\mathsf{S}_h`}</M> is fixed and structured (<M>{tex`L`}</M>{" "}
            free entries). Structure buys speed; data-dependence buys
            expressivity. Every architecture in this write-up is a different
            trade between those two.
          </p>

          <H3 n="2.5" id="direct-cost">
            Cost of the direct evaluation
          </H3>

          <p>
            Evaluating (2.1) as written, for a filter of support{" "}
            <M>{tex`M`}</M>, costs <M>{tex`\Theta(LM)`}</M> multiply-adds per
            channel, <M>{tex`\Theta(LMD)`}</M> for <M>{tex`D`}</M> channels with
            per-channel (depthwise) filters. Depth is{" "}
            <M>{tex`\Theta(\log M)`}</M> if each output sum is reduced as a tree.
          </p>

          <Block kind="note" title="A long convolution is not automatically cheap">
            <p>
              Setting <M>{tex`M=L`}</M> gives{" "}
              <M>{tex`\Theta(L^2 D)`}</M>, which is the same asymptotic cost as
              attention. Long convolutions are <em>not</em> subquadratic because
              they are convolutions. They are subquadratic because the DFT
              diagonalizes them, and that is a fact about circulant matrices, not
              about sequence models. Section 3 is therefore not an
              implementation detail; it is the whole reason the architecture
              family exists.
            </p>
          </Block>

          <hr className="rule" />

          {/* ================= 3 ================= */}
          <H2 n="3" id="fft">
            The Fourier route to <M>{tex`\mathcal{O}(L\log L)`}</M>
          </H2>

          <H3 n="3.1" id="dft">
            The discrete Fourier transform
          </H3>

          <Block kind="def" title="DFT">
            <p>
              Fix <M>{tex`N`}</M> and let{" "}
              <M>{tex`\omega_N := e^{-2\pi i/N}`}</M>, a primitive{" "}
              <M>{tex`N`}</M>-th root of unity. The{" "}
              <strong>discrete Fourier transform</strong> of{" "}
              <M>{tex`x\in\mathbb{C}^N`}</M> is{" "}
              <M>{tex`\hat{x}=\mathsf{W}x`}</M> where
            </p>
            <Eq tag="3.1">{tex`\hat{x}_k=\sum_{n=0}^{N-1}x_n\,\omega_N^{kn},\qquad \mathsf{W}_{kn}=\omega_N^{kn},\qquad (\mathsf{W}^{-1})_{nk}=\tfrac1N\omega_N^{-nk}.`}</Eq>
            <p>
              <M>{tex`\mathsf{W}`}</M> is the <strong>DFT matrix</strong>;{" "}
              <M>{tex`\tfrac{1}{\sqrt N}\mathsf{W}`}</M> is unitary. Nothing is
              approximated: (3.1) is a change of basis in{" "}
              <M>{tex`\mathbb{C}^N`}</M>.
            </p>
          </Block>

          <p>
            It pays to build the transform up from its smallest cases, because
            the fast algorithm in section 3.5 is nothing but these smallest
            cases stitched together.
          </p>

          <Block kind="ex" title="N = 1 and N = 2, the atoms">
            <p>
              At <M>{tex`N=1`}</M> there is a single root of unity,{" "}
              <M>{tex`\omega_1=1`}</M>, and <M>{tex`\mathsf{W}=[1]`}</M>: the DFT
              of one number is that number. Nothing moves. This is the base case
              every recursion below bottoms out at.
            </p>
            <p>
              At <M>{tex`N=2`}</M>, <M>{tex`\omega_2=e^{-\pi i}=-1`}</M>, so
            </p>
            <Eq>{tex`\mathsf{W}_2=\begin{bmatrix}1&1\\ 1&-1\end{bmatrix},\qquad
\widehat{(x_0,x_1)}=(\,x_0+x_1,\;\;x_0-x_1\,).`}</Eq>
            <p>
              The 2-point DFT is <em>one sum and one difference</em>, nothing
              more. <M>{tex`\hat x_0=x_0+x_1`}</M> is the mean up to scale (the DC
              or <M>{tex`\omega=0`}</M> mode) and{" "}
              <M>{tex`\hat x_1=x_0-x_1`}</M> is the fastest oscillation the
              2-point grid can carry. Concretely{" "}
              <M>{tex`\widehat{(3,5)}=(8,\,-2)`}</M>. This sum/difference pair is
              the single primitive, the <strong>butterfly</strong>, that every
              larger FFT is assembled from.
            </p>
          </Block>

          <Block kind="ex" title="The DFT matrix at N = 4">
            <p>
              <M>{tex`\omega_4=e^{-2\pi i/4}=-i`}</M>, so{" "}
              <M>{tex`\mathsf{W}_{kn}=(-i)^{kn}`}</M>:
            </p>
            <Eq>{tex`\mathsf{W}=\begin{bmatrix}1&1&1&1\\ 1&-i&-1&i\\ 1&-1&1&-1\\ 1&i&-1&-i\end{bmatrix},\qquad
u=\begin{bmatrix}1\\0\\-1\\4\end{bmatrix}\;\Longrightarrow\;
\hat u=\mathsf{W}u=\begin{bmatrix}4\\2+4i\\-4\\2-4i\end{bmatrix}.`}</Eq>
            <p>
              Check row 1 by hand:{" "}
              <M>{tex`\hat u_1 = 1 + 0\cdot(-i) + (-1)(-1) + 4\cdot i = 1+1+4i = 2+4i`}</M>
              . Row 2:{" "}
              <M>{tex`\hat u_2 = 1 - 0 + (-1) - 4 = -4`}</M>. The conjugate
              symmetry <M>{tex`\hat u_{N-k}=\overline{\hat u_k}`}</M> visible
              here holds for every real input, and is why real-input FFTs cost
              about half of complex ones.
            </p>
          </Block>

          <p>
            The 4-point transform is really two 2-point transforms in disguise.
            Split <M>{tex`u=(1,0,-1,4)`}</M> into its even-indexed entries{" "}
            <M>{tex`(1,-1)`}</M> and odd-indexed entries <M>{tex`(0,4)`}</M>,
            transform each half with the sum/difference rule above, and recombine
            with a single twiddle factor. Section 3.5 makes this precise and
            turns it into the fast algorithm; the trace there rebuilds exactly the{" "}
            <M>{tex`\hat u=(4,\,2+4i,\,-4,\,2-4i)`}</M> we just got by brute
            force, at a fraction of the multiplies.
          </p>

          <H3 n="3.2" id="circulant">
            Circular convolution and circulant matrices
          </H3>

          <Block kind="def" title="Circular convolution">
            <p>
              For <M>{tex`h,u\in\mathbb{R}^N`}</M>,
            </p>
            <Eq tag="3.2">{tex`(h\circledast_N u)_t=\sum_{n=0}^{N-1}h_{(t-n)\bmod N}\,u_n .`}</Eq>
            <p>
              The matrix <M>{tex`\mathsf{C}_h`}</M> with{" "}
              <M>{tex`(\mathsf{C}_h)_{tn}=h_{(t-n)\bmod N}`}</M> is a{" "}
              <strong>circulant</strong> matrix: each row is the previous row
              rotated right by one. A circulant is a Toeplitz matrix whose
              diagonals wrap around.
            </p>
          </Block>

          <Block kind="prop" title="The DFT diagonalizes every circulant">
            <p>
              <M>{tex`\mathsf{C}_h=\mathsf{W}^{-1}\operatorname{diag}(\mathsf{W}h)\,\mathsf{W}`}</M>
              . Equivalently, the eigenvalues of{" "}
              <M>{tex`\mathsf{C}_h`}</M> are exactly the DFT coefficients of{" "}
              <M>{tex`h`}</M>, and the eigenvectors are the Fourier modes,{" "}
              <em>independently of <M>{tex`h`}</M></em>.
            </p>
            <p>
              <em>Proof.</em> Let <M>{tex`\mathsf{P}`}</M> be the cyclic shift,{" "}
              <M>{tex`(\mathsf{P}u)_t=u_{(t-1)\bmod N}`}</M>. By (3.2),{" "}
              <M>{tex`\mathsf{C}_h=\sum_{k=0}^{N-1}h_k\mathsf{P}^k`}</M>: a
              circulant is a polynomial in the shift. Take{" "}
              <M>{tex`v_j\in\mathbb{C}^N`}</M> with{" "}
              <M>{tex`(v_j)_t=\omega_N^{-jt}`}</M>. Then
            </p>
            <Eq>{tex`(\mathsf{P}v_j)_t=(v_j)_{t-1}=\omega_N^{-j(t-1)}=\omega_N^{\,j}\,(v_j)_t
\;\Longrightarrow\; \mathsf{P}v_j=\omega_N^{\,j}v_j ,`}</Eq>
            <p>
              so every <M>{tex`v_j`}</M> is an eigenvector of{" "}
              <M>{tex`\mathsf{P}`}</M>, hence of any polynomial in{" "}
              <M>{tex`\mathsf{P}`}</M>, with
            </p>
            <Eq>{tex`\mathsf{C}_h v_j=\Big(\sum_k h_k\,\omega_N^{\,jk}\Big)v_j=\hat h_j\,v_j .`}</Eq>
            <p>
              Since{" "}
              <M>{tex`(\mathsf{W}^{-1})_{tj}=\tfrac1N\omega_N^{-tj}=\tfrac1N (v_j)_t`}</M>
              , the matrix of eigenvectors is{" "}
              <M>{tex`N\,\mathsf{W}^{-1}`}</M>, and the eigendecomposition is the
              claim. <M>{tex`\square`}</M>
            </p>
          </Block>

          <p>
            This is the payoff. A circulant is an <M>{tex`N\times N`}</M> matrix,
            but in the Fourier basis it is <em>diagonal</em>. Applying a diagonal
            matrix costs <M>{tex`\Theta(N)`}</M>. The only question left is how
            fast you can change basis.
          </p>

          <H3 n="3.3" id="conv-theorem">
            The convolution theorem
          </H3>

          <p>
            Write <M>{tex`\odot`}</M> for the elementwise (Hadamard) product,{" "}
            <M>{tex`(a\odot b)_k=a_kb_k`}</M>. Then for all{" "}
            <M>{tex`h,u\in\mathbb{R}^N`}</M>:
          </p>

          <Eq tag="3.3">{tex`h\circledast_N u \;=\; \mathsf{W}^{-1}\big((\mathsf{W}h)\odot(\mathsf{W}u)\big) \;=\; \mathrm{iDFT}\big(\mathrm{DFT}(h)\odot\mathrm{DFT}(u)\big).`}</Eq>

          <p>
            It is immediate from the previous proposition:{" "}
            <M>{tex`h\circledast_N u=\mathsf{C}_hu=\mathsf{W}^{-1}\operatorname{diag}(\hat h)\mathsf{W}u=\mathsf{W}^{-1}(\hat h\odot\hat u)`}</M>
            . The dual statement, used later to read Hyena, is that{" "}
            <strong>
              a pointwise product in the time domain is a convolution in the
              frequency domain
            </strong>
            : <M>{tex`\mathrm{DFT}(x\odot u)=\tfrac1N\,\hat x\circledast_N\hat u`}</M>.
          </p>

          <Block kind="ex" title="The convolution theorem, checked on numbers">
            <p>
              Take <M>{tex`h=(1,2,3)`}</M> zero-padded to{" "}
              <M>{tex`(1,2,3,0)`}</M> and <M>{tex`u=(1,0,-1,4)`}</M> at{" "}
              <M>{tex`N=4`}</M>. From section 3.1,{" "}
              <M>{tex`\hat u=(4,\,2+4i,\,-4,\,2-4i)`}</M>; the same matrix gives
            </p>
            <Eq>{tex`\hat h=\mathsf{W}\,(1,2,3,0)^{\top}=(6,\;-2-2i,\;2,\;-2+2i).`}</Eq>
            <p>
              Multiply the two spectra pointwise, then invert with{" "}
              <M>{tex`\mathsf{W}^{-1}`}</M>:
            </p>
            <Eq>{tex`\hat h\odot\hat u=(24,\;\,4-12i,\;\,-8,\;\,4+12i)
\;\;\xrightarrow{\ \mathrm{iDFT}\ }\;\;
(6,\,14,\,2,\,2).`}</Eq>
            <p>
              Three length-4 DFTs and four multiplies reproduce the circular
              convolution <M>{tex`h\circledast_4 u`}</M> exactly. Section 3.4
              shows that this <M>{tex`(6,14,2,2)`}</M> is the wrapped version of
              the linear result <M>{tex`(1,2,2,2,5,12)`}</M> from section 2.1, and
              how one padding step separates the two. The frequency domain never
              lies; it just convolves circularly.
            </p>
          </Block>

          <H3 n="3.4" id="padding">
            Getting a <em>linear</em> convolution out of a circular one
          </H3>

          <p>
            (3.3) computes the wrong thing: it wraps. The fix is zero-padding,
            and it is worth seeing the failure concretely, because forgetting it
            in a causal language model silently leaks the future into the past.
          </p>

          <Block kind="ex" title="Wraparound, and the padding that removes it">
            <p>
              Same <M>{tex`h=(1,2,3)`}</M> and{" "}
              <M>{tex`u=(1,0,-1,4)`}</M>. The true linear convolution from
              section 2.1 is <M>{tex`(1,2,2,2,5,12)`}</M>, of length 6. Now
              compute the circular convolution at{" "}
              <M>{tex`N=4`}</M>, i.e. pad <M>{tex`h`}</M> to{" "}
              <M>{tex`(1,2,3,0)`}</M> and apply (3.2):
            </p>
            <Eq>{tex`h\circledast_4 u=(6,\,14,\,2,\,2)\qquad\text{vs.}\qquad h*u=(\underbrace{1,2,2,2}_{\text{wanted}},\underbrace{5,12}_{\text{tail}}).`}</Eq>
            <p>
              The tail folded back onto the head:{" "}
              <M>{tex`6=1+5`}</M> and <M>{tex`14=2+12`}</M>. Entry{" "}
              <M>{tex`y_0`}</M> has been contaminated by information from input
              position 3, which sits <em>after</em> it. Now pad both sequences
              with zeros to <M>{tex`N=8\ge L+M-1=6`}</M> and repeat:
            </p>
            <Eq>{tex`h\circledast_8 u=(1,2,2,2,5,12,0,0),`}</Eq>
            <p>
              whose first six entries are exactly <M>{tex`h*u`}</M>. The rule:{" "}
              <strong>
                pad to any <M>{tex`N\ge L+M-1`}</M>
              </strong>{" "}
              (in practice the next power of two, so <M>{tex`N=2L`}</M> for a
              length-<M>{tex`L`}</M> filter) and truncate the result to{" "}
              <M>{tex`L`}</M>. Every long-convolution language model does exactly
              this.
            </p>
          </Block>

          <H3 n="3.5" id="fft-alg">
            The FFT and its recurrence
          </H3>

          <p>
            Computing <M>{tex`\mathsf{W}x`}</M> as a dense matrix-vector product
            is <M>{tex`\Theta(N^2)`}</M>, which would defeat the purpose. The
            Cooley-Tukey radix-2 factorization splits the sum by parity of the
            index. With <M>{tex`N`}</M> even, let{" "}
            <M>{tex`E`}</M> and <M>{tex`O`}</M> be the length-<M>{tex`N/2`}</M>{" "}
            DFTs of the even- and odd-indexed entries of <M>{tex`x`}</M>. Then
            for <M>{tex`k=0,\dots,N/2-1`}</M>:
          </p>

          <Eq tag="3.4">{tex`\hat x_k = E_k + \omega_N^{\,k}O_k,\qquad \hat x_{k+N/2}=E_k-\omega_N^{\,k}O_k .`}</Eq>

          <p>
            The second identity uses{" "}
            <M>{tex`\omega_N^{\,k+N/2}=-\omega_N^{\,k}`}</M>. Each level does{" "}
            <M>{tex`N/2`}</M> complex multiplications by the twiddle factors{" "}
            <M>{tex`\omega_N^k`}</M> plus <M>{tex`N`}</M> additions, so
          </p>

          <Eq>{tex`T(N)=2\,T(N/2)+\Theta(N)\;\Longrightarrow\;T(N)=\Theta(N\log_2 N),`}</Eq>

          <p>
            by the master theorem (<M>{tex`a=b=2`}</M>,{" "}
            <M>{tex`f(N)=\Theta(N)=\Theta(N^{\log_b a})`}</M>, case 2). The depth
            is <M>{tex`\Theta(\log N)`}</M>: every butterfly at a level is
            independent. Counting complex multiplications, the direct DFT needs{" "}
            <M>{tex`N^2`}</M> and the FFT needs{" "}
            <M>{tex`\tfrac N2\log_2N`}</M>; at{" "}
            <M>{tex`N=2^{16}`}</M> that is{" "}
            <M>{tex`4.29\times10^9`}</M> versus{" "}
            <M>{tex`5.24\times10^5`}</M>, a factor of 8192.
          </p>

          <Block kind="ex" title="One radix-2 FFT, traced end to end">
            <p>
              Run (3.4) by hand on the same{" "}
              <M>{tex`u=(1,0,-1,4)`}</M> at <M>{tex`N=4`}</M>. Split the input by
              the parity of its index:
            </p>
            <Eq>{tex`\text{even }(u_0,u_2)=(1,-1),\qquad \text{odd }(u_1,u_3)=(0,4).`}</Eq>
            <p>
              Transform each half with the 2-point sum/difference rule from
              section 3.1, which costs only additions:
            </p>
            <Eq>{tex`E=\widehat{(1,-1)}=(0,\;2),\qquad O=\widehat{(0,4)}=(4,\;-4).`}</Eq>
            <p>
              The twiddle factors are <M>{tex`\omega_4^{0}=1`}</M> and{" "}
              <M>{tex`\omega_4^{1}=-i`}</M>. Recombine the halves with (3.4),{" "}
              <M>{tex`\hat u_k=E_k+\omega_4^{k}O_k`}</M> and{" "}
              <M>{tex`\hat u_{k+2}=E_k-\omega_4^{k}O_k`}</M> for{" "}
              <M>{tex`k=0,1`}</M>:
            </p>
            <Eq>{tex`\begin{aligned}
\hat u_0 &= E_0+\omega_4^{0}O_0 = 0+1\cdot 4 &&= 4\\
\hat u_1 &= E_1+\omega_4^{1}O_1 = 2+(-i)(-4) &&= 2+4i\\
\hat u_2 &= E_0-\omega_4^{0}O_0 = 0-4 &&= -4\\
\hat u_3 &= E_1-\omega_4^{1}O_1 = 2-(-i)(-4) &&= 2-4i
\end{aligned}`}</Eq>
            <p>
              which is exactly the{" "}
              <M>{tex`\hat u=(4,\,2+4i,\,-4,\,2-4i)`}</M> that the dense{" "}
              <M>{tex`4\times4`}</M> matrix produced in section 3.1. The
              difference is only arithmetic: the direct product needs{" "}
              <M>{tex`N^2=16`}</M> complex multiplies, this trace needs{" "}
              <M>{tex`\tfrac N2\log_2 N=4`}</M>, and most of those are by{" "}
              <M>{tex`1`}</M> or <M>{tex`-i`}</M> and not real multiplies at all.
              At <M>{tex`N=4`}</M> the saving is trivial; it is the{" "}
              <em>recursion</em> that makes it enormous.
            </p>
          </Block>

          <p>
            Scaling up is just doing this at every level. An 8-point FFT is two
            4-point FFTs (each traced exactly as above) plus <M>{tex`4`}</M>{" "}
            butterflies; a 16-point FFT is two 8-point FFTs plus <M>{tex`8`}</M>{" "}
            butterflies; and so on. The transform sizes halve until they reach 1:
          </p>

          <Eq>{tex`8\;\longrightarrow\;\underbrace{4,\;4}_{\text{2 halves}}\;\longrightarrow\;\underbrace{2,2,\;2,2}_{\text{4}}\;\longrightarrow\;\underbrace{1,1,1,1,\;1,1,1,1}_{\text{8 atoms}} .`}</Eq>

          <p>
            That tree has <M>{tex`\log_2 N`}</M> levels, and each level does{" "}
            <M>{tex`\Theta(N)`}</M> work across its <M>{tex`N/2`}</M> butterflies.
            Multiplying gives the same <M>{tex`\Theta(N\log N)`}</M> as the master
            theorem, now read off the tree the recurrence unrolls into rather than
            the recurrence itself. Every butterfly on a level is independent, so
            the depth is just the number of levels, <M>{tex`\Theta(\log N)`}</M>.
          </p>

          <H3 n="3.6" id="fftconv">
            FFTConv, and what it costs
          </H3>

          <Block kind="def" title="FFTConv">
            <p>
              To compute <M>{tex`y=(h*u)_{0:L}`}</M> for a filter of support{" "}
              <M>{tex`M\le L`}</M>:
            </p>
            <ol>
              <li>
                pick <M>{tex`N=2^{\lceil\log_2(L+M-1)\rceil}`}</M> (so{" "}
                <M>{tex`N\le 2(L+M)`}</M>, and <M>{tex`N=2L`}</M> when{" "}
                <M>{tex`M\approx L`}</M>);
              </li>
              <li>
                <M>{tex`\hat h=\mathrm{FFT}(\mathrm{pad}_N(h))`}</M>,{" "}
                <M>{tex`\hat u=\mathrm{FFT}(\mathrm{pad}_N(u))`}</M>;
              </li>
              <li>
                <M>{tex`\hat y=\hat h\odot\hat u`}</M>;
              </li>
              <li>
                <M>{tex`y=\mathrm{iFFT}(\hat y)_{0:L}`}</M>.
              </li>
            </ol>
            <p>
              Three transforms of length <M>{tex`N`}</M> plus{" "}
              <M>{tex`N`}</M> complex multiplies. Using the standard{" "}
              <M>{tex`5N\log_2N`}</M> real-flop count per complex FFT, one
              channel costs about{" "}
              <M>{tex`15N\log_2N+6N`}</M> real flops, i.e.{" "}
              <M>{tex`\Theta(L\log L)`}</M>, with{" "}
              <M>{tex`\Theta(\log L)`}</M> depth and{" "}
              <M>{tex`\Theta(L)`}</M> working memory. Note step 2 computes{" "}
              <M>{tex`\hat h`}</M> once and reuses it across the batch, and in a
              depthwise layer steps 2 to 4 are independent across the{" "}
              <M>{tex`D`}</M> channels.
            </p>
          </Block>

          <p>
            The asymptotic gap over direct evaluation, at filter length{" "}
            <M>{tex`M=L`}</M>:
          </p>

          <Table
            head={["L", "direct L²", "FFT ~ L log₂ L", "speedup"]}
            rows={[
              ["128", "1.6e4", "9.0e2", "18x"],
              ["1,024", "1.0e6", "1.0e4", "102x"],
              ["8,192", "6.7e7", "1.1e5", "630x"],
              ["65,536", "4.3e9", "1.0e6", "4,096x"],
              ["131,072", "1.7e10", "2.2e6", "7,710x"],
            ]}
          />

          <Block kind="note" title="Where the asymptotics lie to you">
            <p>
              FLOP counts are not runtimes. An FFT convolution is{" "}
              <strong>memory-bandwidth bound</strong>: it streams{" "}
              <M>{tex`\Theta(L)`}</M> data through low-arithmetic-intensity
              butterflies and cannot use tensor cores, so it typically runs at a
              few percent of peak, whereas a matmul-shaped attention kernel runs
              at 50 to 70 percent. This is why a{" "}
              <M>{tex`250\times`}</M> FLOP advantage at{" "}
              <M>{tex`L=65{,}536`}</M> shows up as a{" "}
              <M>{tex`100\times`}</M> wall-clock advantage, and why nothing
              happens at all below <M>{tex`L\approx 2`}</M>K.{" "}
              <a
                href="https://arxiv.org/abs/2311.05908"
                target="_blank"
                rel="noopener noreferrer"
              >
                FlashFFTConv
              </a>{" "}
              attacks this directly: it rewrites the FFT as a{" "}
              <strong>Monarch decomposition</strong>, a factorization of{" "}
              <M>{tex`\mathsf{W}`}</M> into a product of block-diagonal matrices
              and permutations, so the transform becomes a sequence of small
              matrix-matrix multiplies that do hit tensor cores. Reported: up to{" "}
              <M>{tex`7.9\times`}</M> over PyTorch FFT convolutions with{" "}
              <M>{tex`8.2\times`}</M> less memory, and kernels up to{" "}
              <M>{tex`4{,}194{,}304`}</M> long.
            </p>
          </Block>

          <hr className="rule" />

          {/* ================= 4 ================= */}
          <H2 n="4" id="kernels">
            Kernels: how you parameterize <M>{tex`h`}</M>
          </H2>

          <p>
            Section 3 made applying a filter cheap. It said nothing about where
            the filter comes from. That choice, the{" "}
            <strong>kernel parameterization</strong>, is what actually
            distinguishes S4 from Hyena from FNO, and it is governed by a
            constraint that has nothing to do with speed: the parameter count.
          </p>

          <H3 n="4.1" id="explicit">
            Explicit (FIR) parameterization
          </H3>

          <p>
            The classical CNN choice: the parameters <em>are</em> the filter
            taps, <M>{tex`\theta=(h_0,\dots,h_{M-1})`}</M>, so{" "}
            <M>{tex`|\theta|=M`}</M>. Cost <M>{tex`\Theta(LM)`}</M> direct.
            Simple, fast, and hardware-friendly, but memory and parameter count
            are the same number. A layer that can see 8,192 steps back needs
            8,192 parameters per channel. With <M>{tex`D=768`}</M> that is{" "}
            <M>{tex`6.3\times10^6`}</M> parameters for a single position-mixing
            layer, all of them spent on reach rather than on capacity.
          </p>

          <H3 n="4.2" id="implicit">
            Implicit parameterization
          </H3>

          <Block kind="def" title="Implicit filter">
            <p>
              An <strong>implicit</strong> filter represents the taps as the
              values of a learned function of the index,
            </p>
            <Eq tag="4.1">{tex`h_t=\gamma_\theta(t),\qquad t=0,1,\dots,L-1 ,`}</Eq>
            <p>
              where <M>{tex`\gamma_\theta`}</M> is any parametric map{" "}
              <M>{tex`\mathbb{Z}_{\ge0}\to\mathbb{R}`}</M>. The layer has{" "}
              <strong>sublinear parameter scaling</strong> if{" "}
              <M>{tex`|\theta|=o(L)`}</M> while the filter still has support{" "}
              <M>{tex`L`}</M>. Materializing the filter costs{" "}
              <M>{tex`L`}</M> evaluations of <M>{tex`\gamma_\theta`}</M>, which
              are independent and therefore parallel across{" "}
              <M>{tex`t`}</M>.
            </p>
          </Block>

          <p>
            This single move is what makes attention-free long-context models
            possible. It buys the property attention has for free: reach is
            decoupled from parameter count. Attention looks at the whole sequence
            with <M>{tex`3D^2`}</M> parameters regardless of{" "}
            <M>{tex`L`}</M>; an implicit convolution looks at the whole sequence
            with <M>{tex`|\theta|`}</M> parameters regardless of{" "}
            <M>{tex`L`}</M>. It also changes the inductive bias:{" "}
            <M>{tex`\gamma_\theta`}</M> is a smooth function of{" "}
            <M>{tex`t`}</M>, so nearby taps are correlated by construction, which
            is a strong and usually correct prior for long filters.
          </p>

          <H3 n="4.3" id="kernel-zoo">
            The catalogue
          </H3>

          <Table
            head={[
              "Parameterization",
              "γθ(t)",
              "Params",
              "Cost to materialize h",
            ]}
            rows={[
              [
                "Explicit FIR (CNN)",
                <M key="a">{tex`h_t`}</M>,
                <M key="b">{tex`M`}</M>,
                "free",
              ],
              [
                "SSM (S4, S4D, S5)",
                <M key="c">{tex`\mathsf{C}\bar{\mathsf{A}}^t\bar{\mathsf{B}}`}</M>,
                <M key="d">{tex`\mathcal{O}(N)`}</M>,
                <span key="e">
                  <M>{tex`\mathcal{O}(NL)`}</M> diagonal;{" "}
                  <M>{tex`\mathcal{O}((N{+}L)\log^2(N{+}L))`}</M> for S4 DPLR
                </span>,
              ],
              [
                "CKConv / Hyena",
                <M key="f">{tex`\mathsf{FFN}(\mathsf{PE}(t))`}</M>,
                <M key="g">{tex`\mathcal{O}(D_e w + w^2)`}</M>,
                <span key="h">
                  one batched <M>{tex`\mathsf{FFN}`}</M> pass, parallel in{" "}
                  <M>{tex`t`}</M>
                </span>,
              ],
              [
                "FNO",
                <span key="i">
                  learn <M>{tex`\hat h_k`}</M> for{" "}
                  <M>{tex`k<K`}</M>, zero above
                </span>,
                <M key="j">{tex`\mathcal{O}(K)`}</M>,
                "free (already in frequency domain)",
              ],
              [
                "SGConv",
                "sum of decaying, progressively coarser sub-kernels",
                <M key="k">{tex`\mathcal{O}(\log L)`}</M>,
                <M key="l">{tex`\mathcal{O}(L)`}</M>,
              ],
            ]}
          />

          <p>
            Hyena&apos;s empirical finding is that this table has a ranking on
            hard recall tasks, and the ranking tracks two things: whether the
            parameterization decouples length from parameters, and how expressive{" "}
            <M>{tex`\gamma_\theta`}</M> is. Explicit and FNO filters degrade
            first as <M>{tex`L`}</M> grows; SSM kernels hold longer; free-form{" "}
            <M>{tex`\mathsf{FFN}`}</M> kernels hold longest. At{" "}
            <M>{tex`L=131`}</M>K on associative recall, Hyena&apos;s
            parameterization beats CKConv by roughly 80 accuracy points.
          </p>

          <hr className="rule" />

          {/* ================= 5 ================= */}
          <H2 n="5" id="ssm">
            Linear state-space models
          </H2>

          <H3 n="5.1" id="ssm-def">
            The system, and its discretization
          </H3>

          <p>
            A continuous single-input single-output linear system with state
            dimension <M>{tex`N`}</M>:
          </p>

          <Eq tag="5.1">{tex`\dot x(t)=\mathsf{A}x(t)+\mathsf{B}u(t),\qquad y(t)=\mathsf{C}x(t)+\mathsf{D}u(t),`}</Eq>

          <p>
            with{" "}
            <M>{tex`\mathsf{A}\in\mathbb{R}^{N\times N},\ \mathsf{B}\in\mathbb{R}^{N\times1},\ \mathsf{C}\in\mathbb{R}^{1\times N},\ \mathsf{D}\in\mathbb{R}`}</M>
            . Sequence data is discrete, so (5.1) is <strong>discretized</strong>{" "}
            with a step size <M>{tex`\Delta`}</M>. Three standard rules, all of
            which appear in the literature:
          </p>

          <Table
            head={["Rule", "Ā", "B̄", "Used by"]}
            rows={[
              [
                "Forward Euler",
                <M key="a">{tex`\mathsf{I}+\Delta\mathsf{A}`}</M>,
                <M key="b">{tex`\Delta\mathsf{B}`}</M>,
                "rarely (unstable for stiff A)",
              ],
              [
                "Bilinear / Tustin",
                <M key="c">{tex`(\mathsf{I}-\tfrac\Delta2\mathsf{A})^{-1}(\mathsf{I}+\tfrac\Delta2\mathsf{A})`}</M>,
                <M key="d">{tex`(\mathsf{I}-\tfrac\Delta2\mathsf{A})^{-1}\Delta\mathsf{B}`}</M>,
                "S4",
              ],
              [
                "Zero-order hold",
                <M key="e">{tex`e^{\Delta\mathsf{A}}`}</M>,
                <M key="f">{tex`\mathsf{A}^{-1}(e^{\Delta\mathsf{A}}-\mathsf{I})\mathsf{B}`}</M>,
                "Mamba, S4D",
              ],
            ]}
          />

          <p>
            Either way you land on the first-order difference equation
          </p>

          <Eq tag="5.2">{tex`x_t=\bar{\mathsf{A}}x_{t-1}+\bar{\mathsf{B}}u_t,\qquad y_t=\mathsf{C}x_t+\mathsf{D}u_t ,\qquad x_{-1}=0 .`}</Eq>

          <p>
            (Some papers write{" "}
            <M>{tex`x_{t+1}=\bar{\mathsf{A}}x_t+\bar{\mathsf{B}}u_t`}</M>{" "}
            instead, which shifts every index below by one and changes nothing
            else.)
          </p>

          <H3 n="5.2" id="ssm-kernel">
            An SSM is a convolution, and its filter is <M>{tex`\mathsf{C}\bar{\mathsf{A}}^t\bar{\mathsf{B}}`}</M>
          </H3>

          <p>
            (5.2) is linear and its coefficients do not depend on{" "}
            <M>{tex`t`}</M>, so by the proposition in section 2.2 it{" "}
            <em>must</em> be a convolution. Unrolling from{" "}
            <M>{tex`x_0=0`}</M> confirms it and identifies the filter:
          </p>

          <Eq tag="5.3">{tex`x_t=\sum_{n=0}^{t}\bar{\mathsf{A}}^{\,t-n}\bar{\mathsf{B}}\,u_n
\;\Longrightarrow\;
y_t=\sum_{n=0}^{t}\big(\mathsf{C}\bar{\mathsf{A}}^{\,t-n}\bar{\mathsf{B}}+\mathsf{D}\,\delta_{t-n}\big)u_n
\;=\;(h*u)_t ,`}</Eq>

          <p>
            so the filter is exactly{" "}
            <M>{tex`h_t=\mathsf{C}\bar{\mathsf{A}}^{\,t}\bar{\mathsf{B}}+\mathsf{D}\delta_t`}</M>{" "}
            for <M>{tex`t\ge0`}</M> and <M>{tex`h_t=0`}</M> for{" "}
            <M>{tex`t<0`}</M>. This is an implicit parameterization in the sense
            of (4.1) with{" "}
            <M>{tex`\gamma_\theta(t)=\mathsf{C}\bar{\mathsf{A}}^t\bar{\mathsf{B}}`}</M>{" "}
            and <M>{tex`|\theta|=\mathcal{O}(N^2)`}</M>, or{" "}
            <M>{tex`\mathcal{O}(N)`}</M> when <M>{tex`\bar{\mathsf{A}}`}</M> is
            diagonal. It is causal by construction, and it is IIR: the filter is
            infinitely long even though the parameters are few.
          </p>

          <Block kind="ex" title="The smallest possible SSM">
            <p>
              <M>{tex`N=1`}</M>, <M>{tex`\bar{\mathsf{A}}=0.9`}</M>,{" "}
              <M>{tex`\bar{\mathsf{B}}=\mathsf{C}=1`}</M>,{" "}
              <M>{tex`\mathsf{D}=0`}</M>. Then{" "}
              <M>{tex`h_t=0.9^{\,t}`}</M>:
            </p>
            <Eq>{tex`h=(1,\;0.9,\;0.81,\;0.729,\;0.6561,\;0.5905,\;0.5314,\;0.4783,\;\dots)`}</Eq>
            <p>
              a pure exponential-decay memory. The recurrence is{" "}
              <M>{tex`x_{t+1}=0.9\,x_t+u_t`}</M>, which is an exponential moving
              average. Its effective memory length is{" "}
              <M>{tex`\approx 1/(1-0.9)=10`}</M> steps; more generally the
              memory is set by the spectral radius{" "}
              <M>{tex`\rho(\bar{\mathsf{A}})`}</M>, through{" "}
              <M>{tex`\partial y_t/\partial u_{t-n}=\mathsf{C}\bar{\mathsf{A}}^n\bar{\mathsf{B}}`}</M>
              . Three learned scalars produce a filter of unbounded length: this
              is the whole point of implicit parameterization, in miniature.
            </p>
            <p>
              With a complex pole{" "}
              <M>{tex`\bar{\mathsf{A}}=re^{i\omega}`}</M> and a real output you
              get{" "}
              <M>{tex`h_t=|c|\,r^{\,t}\cos(\omega t+\varphi)`}</M>: a damped
              sinusoid. A diagonal SSM with <M>{tex`N`}</M> poles therefore has a
              kernel that is a sum of <M>{tex`N`}</M> damped sinusoids. That is
              the honest description of an SSM filter: a length-<M>{tex`L`}</M>{" "}
              signal expanded in a learned basis of <M>{tex`N`}</M> exponentials.
            </p>
          </Block>

          <H3 n="5.3" id="ssm-duality">
            The same map, three algorithms
          </H3>

          <Table
            head={["Form", "Work (per channel)", "Depth", "State", "When"]}
            rows={[
              [
                "Recurrent (5.2)",
                <M key="a">{tex`\Theta(LN)`}</M>,
                <M key="b">{tex`\Theta(L)`}</M>,
                <M key="c">{tex`\Theta(N)`}</M>,
                "autoregressive decoding",
              ],
              [
                "Convolutional (5.3) + FFTConv",
                <M key="d">{tex`\Theta(L\log L)`}</M>,
                <M key="e">{tex`\Theta(\log L)`}</M>,
                <M key="f">{tex`\Theta(L)`}</M>,
                "training, teacher forcing",
              ],
              [
                "Dense matrix",
                <M key="g">{tex`\Theta(L^2)`}</M>,
                <M key="h">{tex`\Theta(\log L)`}</M>,
                <M key="i">{tex`\Theta(L^2)`}</M>,
                "never",
              ],
            ]}
          />

          <p>
            This duality is the central engineering fact about linear SSMs. The
            <em> same</em> operator is a parallel convolution during training,
            where you have the whole sequence and want depth{" "}
            <M>{tex`\Theta(\log L)`}</M>, and a constant-memory recurrence during
            generation, where you have one token and want{" "}
            <M>{tex`\Theta(1)`}</M> state growth. Attention has no such dual
            form: its decode state grows as <M>{tex`\Theta(LD)`}</M>. Hold onto
            this, because it is precisely what Hyena gives up.
          </p>

          <H3 n="5.4" id="s4">
            The materialization problem, and what S4 actually fixed
          </H3>

          <p>
            To run the convolutional form you must first produce{" "}
            <M>{tex`h_0,\dots,h_{L-1}`}</M>. Computing{" "}
            <M>{tex`\mathsf{C}\bar{\mathsf{A}}^t\bar{\mathsf{B}}`}</M> by
            repeated multiplication is <M>{tex`\Theta(LN^2)`}</M> and{" "}
            <M>{tex`\Theta(L)`}</M>-deep, which is worse than just running the
            recurrence. Two fixes:
          </p>

          <ul>
            <li>
              <strong>S4</strong> restricts{" "}
              <M>{tex`\mathsf{A}`}</M> to <em>diagonal plus low rank</em>{" "}
              (DPLR), computes the truncated generating function{" "}
              <M>{tex`\hat h(z)=\sum_{t<L}h_tz^t`}</M> at the{" "}
              <M>{tex`L`}</M> roots of unity instead of the taps themselves,
              evaluates the diagonal part as a{" "}
              <strong>Cauchy kernel</strong>{" "}
              <M>{tex`\sum_j c_j/(z-a_j)`}</M> in{" "}
              <M>{tex`\mathcal{O}((N+L)\log^2(N+L))`}</M>, and corrects the
              low-rank part with the Woodbury identity. The output of this is
              already <M>{tex`\hat h`}</M>, exactly what FFTConv wants.
            </li>
            <li>
              <strong>S4D / diagonal SSMs</strong> drop the low-rank term
              entirely. Then{" "}
              <M>{tex`h_t=\sum_{j=1}^{N}c_j a_j^{\,t}`}</M>, a Vandermonde
              product, computed in <M>{tex`\Theta(NL)`}</M> with trivial
              parallelism and about ten lines of code. This is what essentially
              everything after 2022 uses.
            </li>
          </ul>

          <p>
            The other half of S4 is initialization.{" "}
            <strong>HiPPO</strong> chooses <M>{tex`\mathsf{A}`}</M> so that the
            state <M>{tex`x_t`}</M> holds the coefficients of an optimal
            polynomial approximation (Legendre, in HiPPO-LegS) of the input
            history under a chosen measure. Random{" "}
            <M>{tex`\mathsf{A}`}</M> gives kernels that decay far too fast and
            the model fails on long-range tasks; HiPPO initialization is the
            difference between roughly 60 percent and roughly 90 percent on
            Long Range Arena. Structure buys the speed, initialization buys the
            memory.
          </p>

          <H3 n="5.5" id="lti-limit">
            The wall that LTI hits
          </H3>

          <p>
            After training, <M>{tex`h`}</M> is a constant. So the layer is{" "}
            <em>one</em> fixed matrix <M>{tex`\mathsf{S}_h`}</M> applied to every
            input. Compare attention, which selects a different{" "}
            <M>{tex`\mathsf{A}(u)`}</M> per input out of a family of{" "}
            <M>{tex`L\times L`}</M> matrices. The gap shows up sharply on one
            task.
          </p>

          <Block kind="def" title="Associative recall">
            <p>
              The input is a sequence of key-value pairs followed by a query
              key, for example{" "}
              <code>a 1 b e 3 f ... b</code> with target{" "}
              <code>e</code>. The model must output the value that followed the
              earlier occurrence of the query key. The keys, values, and their
              positions are chosen at random per sequence, and difficulty is
              tuned by vocabulary size and by <M>{tex`L`}</M>.
            </p>
          </Block>

          <p>
            A single LTI layer cannot do this, and the reason is structural
            rather than statistical. Its output is{" "}
            <M>{tex`y_t=\sum_n h_{t-n}u_n`}</M>: the weight on position{" "}
            <M>{tex`n`}</M> is a function of the offset{" "}
            <M>{tex`t-n`}</M> alone. But the position that must be retrieved
            depends on <em>where the matching key happened to appear</em>, which
            varies per sequence and is uncorrelated with the offset. To route
            information from a content-selected position you need the entries of
            the operator to depend on the content. That is precisely the
            definition of a data-controlled operator, and it is precisely what
            fixed <M>{tex`h`}</M> forbids. Empirically this is exactly the gap
            Hyena&apos;s benchmarks expose: on associative recall at{" "}
            <M>{tex`L=30`}</M>K with vocabulary 30, H3 scores 8.4 percent, GSS
            5.3, RWKV 12.4, while attention-based and Hyena models are at or near
            100.
          </p>

          <hr className="rule" />

          {/* ================= 6 ================= */}
          <H2 n="6" id="attention">
            Attention as the reference point
          </H2>

          <p>
            One head of scaled dot-product self-attention on{" "}
            <M>{tex`u\in\mathbb{R}^{L\times D}`}</M>, with projections{" "}
            <M>{tex`\mathsf{M}_q,\mathsf{M}_k,\mathsf{M}_v\in\mathbb{R}^{D\times D}`}</M>
            , <M>{tex`q=u\mathsf{M}_q`}</M>,{" "}
            <M>{tex`k=u\mathsf{M}_k`}</M>, <M>{tex`v=u\mathsf{M}_v`}</M>:
          </p>

          <Eq tag="6.1">{tex`\mathsf{A}(u)=\mathsf{SoftMax}\!\left(\tfrac{1}{\sqrt D}\,q\,k^{\mathsf{T}}+\mathsf{Mask}\right),\qquad y=\mathsf{A}(u)\,v ,`}</Eq>

          <p>
            with <M>{tex`\mathsf{SoftMax}`}</M> applied row-wise and{" "}
            <M>{tex`\mathsf{Mask}_{ts}=-\infty`}</M> for{" "}
            <M>{tex`s>t`}</M> in the causal case.
          </p>

          <Block kind="def" title="Data-controlled operator">
            <p>
              A layer is <strong>data-controlled</strong> if it can be written{" "}
              <M>{tex`y=\mathsf{H}(u)\,v`}</M> where{" "}
              <M>{tex`\mathsf{H}(u)\in\mathbb{R}^{L\times L}`}</M> depends
              nonlinearly on <M>{tex`u`}</M> and <M>{tex`v`}</M> is a linear
              projection of <M>{tex`u`}</M>. The map is linear in{" "}
              <M>{tex`v`}</M> but nonlinear in <M>{tex`u`}</M>: a single block
              encodes an entire indexed family of linear operators, and the input
              selects one. Attention is the canonical example with{" "}
              <M>{tex`\mathsf{H}=\mathsf{A}(q,k)`}</M>; an LTI convolution is the
              canonical non-example, with{" "}
              <M>{tex`\mathsf{H}=\mathsf{S}_h`}</M> constant.
            </p>
          </Block>

          <p>Costs, stated carefully, because three different numbers get called &quot;the cost of attention&quot;:</p>

          <Table
            head={["Quantity", "Naive", "FlashAttention", "Note"]}
            rows={[
              [
                "Training work",
                <M key="a">{tex`\Theta(L^2D)`}</M>,
                <M key="b">{tex`\Theta(L^2D)`}</M>,
                "unchanged; tiling does not remove FLOPs",
              ],
              [
                "Training memory",
                <M key="c">{tex`\Theta(L^2)`}</M>,
                <M key="d">{tex`\Theta(L)`}</M>,
                "online softmax + recompute in backward",
              ],
              [
                "Depth",
                <M key="e">{tex`\Theta(\log L)`}</M>,
                <M key="f">{tex`\Theta(\log L)`}</M>,
                "fully parallel over positions",
              ],
              [
                "Decode work / step",
                <M key="g">{tex`\Theta(LD)`}</M>,
                <M key="h">{tex`\Theta(LD)`}</M>,
                "must touch the whole cache",
              ],
              [
                "Decode state",
                <M key="i">{tex`\Theta(LD)`}</M>,
                <M key="j">{tex`\Theta(LD)`}</M>,
                "the KV cache; grows without bound",
              ],
            ]}
          />

          <p>
            Three properties of attention are worth naming precisely, because
            Hyena is explicitly designed to reproduce all three rather than to
            approximate (6.1):
          </p>

          <ol>
            <li>
              <strong>Data control</strong>, as defined above.
            </li>
            <li>
              <strong>Sublinear parameter scaling</strong>:{" "}
              <M>{tex`|\theta|=3D^2`}</M> is independent of{" "}
              <M>{tex`L`}</M>, so parameters can be spent on the MLPs instead of
              on reach.
            </li>
            <li>
              <strong>Unrestricted context</strong>: every{" "}
              <M>{tex`\mathsf{A}_{ts}`}</M> with{" "}
              <M>{tex`s\le t`}</M> can be nonzero. No locality window, no stride,
              no fixed sparsity pattern. This is what sparse and low-rank
              approximations give up, and why they historically needed to be
              interleaved with dense attention layers to recover quality.
            </li>
          </ol>

          <hr className="rule" />

          {/* ================= 7 ================= */}
          <H2 n="7" id="hyena">
            Hyena
          </H2>

          <p>
            <a
              href="https://arxiv.org/abs/2302.10866"
              target="_blank"
              rel="noopener noreferrer"
            >
              Poli et al., 2023
            </a>{" "}
            take the three properties above as a specification and build an
            operator that satisfies all of them out of two subquadratic
            primitives only: <strong>implicit long convolutions</strong>{" "}
            (section 4.2) and <strong>elementwise multiplicative gating</strong>.
            No softmax, no approximation of the attention matrix, no{" "}
            <M>{tex`L\times L`}</M> object ever materialized.
          </p>

          <H3 n="7.1" id="hyena-rec">
            The recurrence
          </H3>

          <Block kind="def" title="Order-N Hyena operator">
            <p>
              Let{" "}
              <M>{tex`v,x^1,\dots,x^N\in\mathbb{R}^{L}`}</M> be projections of
              the input <M>{tex`u`}</M> and let{" "}
              <M>{tex`h^1,\dots,h^N`}</M> be learnable filters. Define
            </p>
            <Eq tag="7.1">{tex`z^1_t=v_t,\qquad
z^{n+1}_t=x^n_t\,\big(h^n * z^n\big)_t\ \ (n=1,\dots,N),\qquad
y_t=z^{N+1}_t .`}</Eq>
            <p>
              Written out, that is an alternating chain
            </p>
            <Eq>{tex`y=x^N\cdot\Big(h^N*\big(x^{N-1}\cdot\big(h^{N-1}*(\cdots (x^1\cdot(h^1*v)))\big)\big)\Big).`}</Eq>
            <p>
              Each <M>{tex`*`}</M> is a full-length causal convolution evaluated
              by FFTConv in <M>{tex`\Theta(L\log L)`}</M>; each{" "}
              <M>{tex`\cdot`}</M> is elementwise in{" "}
              <M>{tex`\Theta(L)`}</M>. Nothing else happens.
            </p>
          </Block>

          <p>
            The projections come from a linear map{" "}
            <M>{tex`\mathbb{R}^D\to\mathbb{R}^{(N+1)D}`}</M> applied per
            position, followed by a <em>short</em> explicit depthwise
            convolution (filter size 3 or so) which supplies local
            shift-and-compare structure cheaply, then a split into{" "}
            <M>{tex`N+1`}</M> pieces. One piece plays the role of{" "}
            <M>{tex`v`}</M>; the others play the role of gates.
          </p>

          <H3 n="7.2" id="hyena-matrix">
            The matrix form: a factorization, not an approximation
          </H3>

          <p>
            (7.1) is <strong>linear in <M>{tex`v`}</M></strong> and nonlinear in{" "}
            <M>{tex`u`}</M> through the gates, so it is data-controlled in the
            sense of section 6. Writing{" "}
            <M>{tex`\mathsf{D}_x^n=\operatorname{diag}(x^n)`}</M> and{" "}
            <M>{tex`\mathsf{S}_h^n`}</M> for the Toeplitz matrix of{" "}
            <M>{tex`h^n`}</M>,
          </p>

          <Eq tag="7.2">{tex`y=\mathsf{H}(u)\,v,\qquad
\mathsf{H}(u)=\mathsf{D}_x^N\mathsf{S}_h^N\,\mathsf{D}_x^{N-1}\mathsf{S}_h^{N-1}\cdots\mathsf{D}_x^{1}\mathsf{S}_h^{1}.`}</Eq>

          <p>
            So Hyena&apos;s surrogate attention matrix is an alternating product
            of <M>{tex`2N`}</M> structured factors: <M>{tex`N`}</M> diagonal
            matrices carrying the data dependence, and <M>{tex`N`}</M> Toeplitz
            matrices carrying the mixing. Each factor is applied in{" "}
            <M>{tex`\Theta(L)`}</M> or <M>{tex`\Theta(L\log L)`}</M> and the
            product is never formed. This is structurally the same idea as a{" "}
            <strong>butterfly decomposition</strong> for fast structured
            matrix-vector products, with data control grafted on and the depth of
            the decomposition controlling expressivity.
          </p>

          <Block kind="note" title="Special cases">
            <p>
              <M>{tex`\mathsf{Hyena}_1`}</M> is GSS. <M>{tex`\mathsf{Hyena}_2`}</M>{" "}
              is H3, whose surrogate attention matrix is written{" "}
              <M>{tex`\mathsf{A}(q,k)=\mathsf{D}_q\mathsf{S}_\psi\mathsf{D}_k\mathsf{S}_\varphi`}</M>{" "}
              with <M>{tex`\varphi,\psi`}</M> parameterized by SSMs. Hyena
              generalizes on two axes at once: arbitrary order{" "}
              <M>{tex`N`}</M>, and free-form <M>{tex`\mathsf{FFN}`}</M> filters
              in place of SSM filters.
            </p>
          </Block>

          <H3 n="7.3" id="hyena-example">
            Worked example: two gates and two fixed filters perform a recall
          </H3>

          <Block kind="ex" title="Order 2, L = 4, associative recall by hand">
            <p>
              Take <M>{tex`L=4`}</M>, <M>{tex`N=2`}</M>, and choose the two
              filters to be the simplest interesting causal kernels:
            </p>
            <ul>
              <li>
                <M>{tex`h^1=(0,1,0,0)`}</M>, a <strong>unit shift</strong>, so{" "}
                <M>{tex`(h^1*z)_t=z_{t-1}`}</M>;
              </li>
              <li>
                <M>{tex`h^2=(1,1,1,1)`}</M>, a{" "}
                <strong>running sum</strong>, so{" "}
                <M>{tex`(h^2*z)_t=\sum_{s\le t}z_s`}</M>.
              </li>
            </ul>
            <p>Their Toeplitz matrices are</p>
            <Eq>{tex`\mathsf{S}_h^1=\begin{bmatrix}0&0&0&0\\1&0&0&0\\0&1&0&0\\0&0&1&0\end{bmatrix},
\qquad
\mathsf{S}_h^2=\begin{bmatrix}1&0&0&0\\1&1&0&0\\1&1&1&0\\1&1&1&1\end{bmatrix}.`}</Eq>
            <p>
              Name the gates <M>{tex`x^1=k`}</M> and{" "}
              <M>{tex`x^2=q`}</M>. Running the recurrence (7.1):
            </p>
            <Eq>{tex`z^2_t=k_t\,v_{t-1},\qquad
y_t=q_t\sum_{s\le t}z^2_s=q_t\sum_{s\le t}k_s\,v_{s-1},`}</Eq>
            <p>which is the same as reading off (7.2) entrywise:</p>
            <Eq tag="7.3">{tex`\mathsf{H}(u)_{tn}=\underbrace{q_t}_{\text{read gate}}\ \underbrace{k_{n+1}}_{\text{write gate}}\ \mathbf{1}[\,n+1\le t\,].`}</Eq>
            <p>
              Now instantiate. Let the value stream be{" "}
              <M>{tex`v=(5,7,9,11)`}</M>. Suppose the write gate fires at
              position 1 and the read gate at position 3,{" "}
              <M>{tex`k=(0,1,0,0)`}</M>, <M>{tex`q=(0,0,0,1)`}</M>. Then{" "}
              <M>{tex`z^2=(0,\;1\cdot v_0,\;0,\;0)=(0,5,0,0)`}</M>, its running
              sum is <M>{tex`(0,5,5,5)`}</M>, and
            </p>
            <Eq>{tex`y=q\odot(0,5,5,5)=(0,0,0,5)=(0,0,0,v_0).`}</Eq>
            <p>
              Position 3 has retrieved the value that sat at position 0, selected
              by <em>where the gate fired</em>, not by a fixed offset. The
              corresponding <M>{tex`\mathsf{H}(u)`}</M> is
            </p>
            <Eq>{tex`\mathsf{H}(u)=\mathsf{D}_q\mathsf{S}_h^2\mathsf{D}_k\mathsf{S}_h^1=\begin{bmatrix}0&0&0&0\\0&0&0&0\\0&0&0&0\\1&0&0&0\end{bmatrix},`}</Eq>
            <p>
              a one-hot routing matrix that no fixed{" "}
              <M>{tex`\mathsf{S}_h`}</M> could equal for all inputs, since
              changing <M>{tex`k`}</M> moves the 1. That is data control,
              produced by nothing but two elementwise multiplications and two
              convolutions, at <M>{tex`\Theta(L\log L)`}</M>.
            </p>
            <p>
              One more instructive substitution: set{" "}
              <M>{tex`h^1=\delta`}</M> instead of the shift. Then{" "}
              <M>{tex`y_t=q_t\sum_{s\le t}k_sv_s`}</M>, which is exactly
              unnormalized causal <strong>linear attention</strong> at feature
              dimension 1. Hyena, H3, and linear attention are the same shape of
              object with different filters; see section 9.
            </p>
          </Block>

          <H3 n="7.4" id="hyena-filters">
            The filters
          </H3>

          <p>
            Hyena parameterizes each <M>{tex`h^n`}</M> implicitly, in the sense
            of (4.1):
          </p>

          <Eq tag="7.4">{tex`h_t=\mathsf{Window}(t)\cdot\big(\mathsf{FFN}\circ\mathsf{PositionalEncoding}\big)(t).`}</Eq>

          <p>Three components, each doing a specific job:</p>

          <ul>
            <li>
              <M>{tex`\mathsf{PositionalEncoding}:t\mapsto\mathbb{R}^{D_e}`}</M>{" "}
              maps the integer index to a feature vector, typically{" "}
              <M>{tex`t`}</M> itself together with{" "}
              <M>{tex`\sin(\omega_j t),\cos(\omega_j t)`}</M> at a bank of
              frequencies. Without this the network sees a scalar and cannot
              produce high-frequency structure.
            </li>
            <li>
              <M>{tex`\mathsf{FFN}`}</M> is a shallow MLP with{" "}
              <strong>sine activations</strong>. Sinusoidal activations are used
              deliberately to counter the spectral bias of ReLU networks toward
              low-frequency functions; a filter that must encode a sharp shift or
              a comb needs high-frequency content.
            </li>
            <li>
              <M>{tex`\mathsf{Window}(t)=e^{-\alpha t}+\beta`}</M> modulates the
              output toward exponential decay, with <M>{tex`\alpha`}</M> varying
              across channels so that different channels get different effective
              filter lengths. The bias <M>{tex`\beta`}</M> keeps the tail from
              being forced to exactly zero. Long decaying filters pair
              productively with high-frequency ones: the decaying channel
              supplies &quot;how far back,&quot; the oscillatory channel supplies
              &quot;which positions.&quot;
            </li>
          </ul>

          <p>
            Parameter count is <M>{tex`\mathcal{O}(D_ew+w^2)`}</M> for hidden
            width <M>{tex`w`}</M>, independent of{" "}
            <M>{tex`L`}</M>: property 2 satisfied. Materializing all{" "}
            <M>{tex`N\times D`}</M> filters is one batched forward pass,
            parallel across <M>{tex`t`}</M> and <M>{tex`n`}</M>, which matters
            because the alternative (iterative numerical methods to build a
            kernel) is exactly what tanks hardware utilization in other implicit
            schemes. Because <M>{tex`\mathsf{FFN}`}</M> is a universal
            approximator on the index domain, (7.4) can represent the kernels
            produced by S4, CKConv, SGConv and FNO as special cases.
          </p>

          <Block kind="prop" title="Causal Hyenas">
            <p>
              If every <M>{tex`h^n`}</M> is causal then{" "}
              <M>{tex`\mathsf{Hyena}_N`}</M> is causal.{" "}
              <em>Proof.</em> Each <M>{tex`\mathsf{S}_h^n`}</M> is lower
              triangular (section 2.4) and each{" "}
              <M>{tex`\mathsf{D}_x^n`}</M> is diagonal; the product of lower
              triangular matrices is lower triangular, so{" "}
              <M>{tex`\mathsf{H}(u)_{tn}=0`}</M> for{" "}
              <M>{tex`n>t`}</M>. <M>{tex`\square`}</M>
            </p>
            <p>
              In practice you do not constrain the{" "}
              <M>{tex`\mathsf{FFN}`}</M> at all. You evaluate (7.4) only at{" "}
              <M>{tex`t=0,\dots,L-1`}</M>, which makes{" "}
              <M>{tex`h`}</M> causal by construction, and then{" "}
              <strong>
                zero-pad both <M>{tex`h`}</M> and the input to{" "}
                <M>{tex`2L`}</M> before the FFT
              </strong>
              . Skipping the pad gives circular convolution, and by the worked
              example in section 3.4 the tail folds onto the head, which in a
              language model means future tokens leak into past positions. The
              padding is not an optimization detail; it is the causality
              guarantee.
            </p>
          </Block>

          <H3 n="7.5" id="hyena-cost">
            Complexity
          </H3>

          <Block kind="prop" title="Cost of an order-N Hyena operator">
            <p>
              Processing <M>{tex`u\in\mathbb{R}^{L\times D}`}</M> costs
            </p>
            <Eq tag="7.5">{tex`\mathcal{O}\big(N D L(\log_2 L + D)\big).`}</Eq>
            <p>
              The two terms are the two stages. Projections: a linear map{" "}
              <M>{tex`\mathbb{R}^{D}\to\mathbb{R}^{(N+1)D}`}</M> at each of{" "}
              <M>{tex`L`}</M> positions is{" "}
              <M>{tex`\mathcal{O}(NLD^2)`}</M>. Mixing:{" "}
              <M>{tex`N`}</M> FFTConvs over <M>{tex`D`}</M> channels is{" "}
              <M>{tex`\mathcal{O}(NDL\log_2L)`}</M>. Depth is{" "}
              <M>{tex`\mathcal{O}(N\log L)`}</M>, and memory is{" "}
              <M>{tex`\mathcal{O}(NDL)`}</M>, with no{" "}
              <M>{tex`L^2`}</M> anywhere.
            </p>
          </Block>

          <p>
            Concretely, at <M>{tex`D=768`}</M> and{" "}
            <M>{tex`N=2`}</M>, comparing only the position-mixing work (attention
            scores plus the value product, versus the FFT convolutions):
          </p>

          <Table
            head={[
              "L",
              "attention 4L²D",
              "Hyena₂ FFTConvs",
              "FLOP ratio",
              "Hyena projections (linear in L)",
            ]}
            rows={[
              ["1,024", "3.2e9", "5.4e8", "6x", "2.4e9"],
              ["2,048", "1.3e10", "1.2e9", "11x", "4.8e9"],
              ["4,096", "5.2e10", "2.5e9", "20x", "9.7e9"],
              ["8,192", "2.1e11", "5.4e9", "38x", "1.9e10"],
              ["16,384", "8.2e11", "1.2e10", "71x", "3.9e10"],
              ["65,536", "1.3e13", "5.3e10", "251x", "1.5e11"],
            ]}
          />

          <p>
            Two things to read off this table. First, the quadratic term is
            genuinely gone: the mixing column grows by{" "}
            <M>{tex`\approx2.1\times`}</M> per doubling rather than{" "}
            <M>{tex`4\times`}</M>. Second, past a few thousand tokens the{" "}
            <em>convolutions are no longer the cost</em>; the{" "}
            <M>{tex`\mathcal{O}(NLD^2)`}</M> projections dominate, exactly as
            they do in a Transformer. A subquadratic mixer moves the bottleneck
            back to the dense layers, which is what you want.
          </p>

          <p>
            Measured, Hyena reports roughly <M>{tex`5\times`}</M> over dense
            PyTorch attention and <M>{tex`2\times`}</M> over FlashAttention at{" "}
            <M>{tex`L=8`}</M>K, and <M>{tex`100\times`}</M> over FlashAttention
            at <M>{tex`L=64`}</M>K, where a naive attention implementation runs
            out of memory outright. The gap between the{" "}
            <M>{tex`251\times`}</M> FLOP ratio and the{" "}
            <M>{tex`100\times`}</M> wall-clock ratio at 64K is the
            hardware-utilization penalty from section 3.6.
          </p>

          <H3 n="7.6" id="hyena-freq">
            Why alternate at all
          </H3>

          <p>
            By the convolution theorem and its dual (section 3.3), the two
            primitives are each other&apos;s image under the DFT: convolution in
            time is a pointwise product in frequency, and a pointwise product in
            time is a convolution in frequency. So (7.1) is literally{" "}
            <em>
              alternating pointwise products between the time and frequency
              domains
            </em>
            . The convolution step extends memory (it mixes across positions);
            the gating step selects (it is a convolution in the frequency domain,
            reshaping which frequency components survive). Stacking{" "}
            <M>{tex`N`}</M> of these gives a richer class of operators than
            either alone, and the order <M>{tex`N`}</M> is the knob controlling
            how rich.
          </p>

          <H3 n="7.7" id="hyena-results">
            Results, and the catch
          </H3>

          <ul>
            <li>
              <strong>Recall.</strong> The only operator in its comparison to
              solve associative recall at{" "}
              <M>{tex`L=30`}</M>K to <M>{tex`64`}</M>K with vocabulary 30 (100
              percent, versus 32.4 for FlashAttention-based GPT at 30K under the
              same budget, 8.4 for H3, 5.3 for GSS, 12.4 for RWKV, 2.3 for AFT).
              Solves it at <M>{tex`L=131`}</M>K.
            </li>
            <li>
              <strong>Language.</strong> State of the art for dense-attention-free
              architectures on WikiText103 and The Pile; matches GPT perplexity
              at 335M parameters on The Pile with{" "}
              <M>{tex`20\%`}</M> fewer training FLOPs at{" "}
              <M>{tex`L=2`}</M>K.
            </li>
            <li>
              <strong>Vision.</strong> Drops into ViT in place of attention and
              matches it on ImageNet-1k from scratch, so the operator is not
              language-specific.
            </li>
          </ul>

          <Block kind="note" title="Hyena has no recurrent state">
            <p>
              This is the real cost, and it is the mirror image of section 5.3.
              An SSM filter is the impulse response of an{" "}
              <M>{tex`N`}</M>-dimensional linear system, so it has a
              constant-size recurrent form. A filter produced by an arbitrary{" "}
              <M>{tex`\mathsf{FFN}`}</M> has no finite-order realization: there
              is no small state that summarizes the prefix. Generating token{" "}
              <M>{tex`t`}</M> therefore requires a convolution against the entire
              prefix, so naive autoregressive generation is{" "}
              <M>{tex`\Theta(L^2)`}</M> total work with{" "}
              <M>{tex`\Theta(L)`}</M> memory. Hyena is subquadratic in training
              and quadratic in decoding, precisely the reverse of what you want
              for inference-heavy deployment. Two repairs exist: distill the
              learned long filter into a low-order SSM after training, or use the
              tiled evaluation of{" "}
              <a
                href="https://arxiv.org/abs/2410.12982"
                target="_blank"
                rel="noopener noreferrer"
              >
                Flash Inference
              </a>
              , which borrows relaxed polynomial interpolation to compute the
              running convolution incrementally and brings total generation to{" "}
              <M>{tex`\mathcal{O}(L\log^2 L)`}</M> (reported{" "}
              <M>{tex`110\times`}</M> on the position-mixing step,{" "}
              <M>{tex`7.8\times`}</M> end to end). It remains the reason the
              field&apos;s attention moved toward selective SSMs and gated linear
              attention, which keep the constant-size state.
            </p>
          </Block>

          <hr className="rule" />

          {/* ================= 8 ================= */}
          <H2 n="8" id="selective">
            Breaking time-invariance: selective SSMs
          </H2>

          <p>
            Hyena takes escape hatch (a) from section 2.2: keep the filters
            fixed, break linearity with gates. Mamba takes escape hatch (b):
            keep the system linear in <M>{tex`u`}</M> at each step, but make its
            coefficients depend on the input.
          </p>

          <Eq tag="8.1">{tex`\Delta_t=\tau_\Delta(u_t),\quad \mathsf{B}_t=\mathsf{W}_Bu_t,\quad \mathsf{C}_t=\mathsf{W}_Cu_t,\qquad
x_t=\bar{\mathsf{A}}_t x_{t-1}+\bar{\mathsf{B}}_t u_t,\quad y_t=\mathsf{C}_t x_t,`}</Eq>

          <p>
            with{" "}
            <M>{tex`\bar{\mathsf{A}}_t=\exp(\Delta_t\mathsf{A})`}</M> and{" "}
            <M>{tex`\tau_\Delta=\mathsf{softplus}\circ\text{linear}`}</M>.
            Unrolling now gives
          </p>

          <Eq tag="8.2">{tex`y_t=\sum_{n\le t}\Big(\mathsf{C}_t\Big(\textstyle\prod_{j=n+1}^{t}\bar{\mathsf{A}}_j\Big)\bar{\mathsf{B}}_n\Big)u_n ,`}</Eq>

          <p>
            and the bracketed weight depends on <M>{tex`t`}</M> and{" "}
            <M>{tex`n`}</M> separately, and on the input at{" "}
            <em>every position in between</em>. It is not a function of{" "}
            <M>{tex`t-n`}</M>. So the system is linear time-varying, it is{" "}
            <strong>not</strong> a convolution, the operator is not Toeplitz, and{" "}
            <strong>the FFT no longer applies</strong>. That is the price, and
            everything about Mamba&apos;s implementation follows from paying it.
          </p>

          <Block kind="def" title="Associative scan">
            <p>
              Recover parallelism without the DFT. Define on pairs{" "}
              <M>{tex`(a,b)\in\mathbb{R}^{N\times N}\times\mathbb{R}^N`}</M> the
              operator
            </p>
            <Eq>{tex`(a_1,b_1)\bullet(a_2,b_2)=(a_2a_1,\;a_2b_1+b_2),`}</Eq>
            <p>
              which is associative (check:{" "}
              <M>{tex`((a_1,b_1)\bullet(a_2,b_2))\bullet(a_3,b_3)`}</M> and{" "}
              <M>{tex`(a_1,b_1)\bullet((a_2,b_2)\bullet(a_3,b_3))`}</M> both give{" "}
              <M>{tex`(a_3a_2a_1,\;a_3a_2b_1+a_3b_2+b_3)`}</M>). Seeding with{" "}
              <M>{tex`(\bar{\mathsf{A}}_t,\bar{\mathsf{B}}_tu_t)`}</M>, the
              prefix products of <M>{tex`\bullet`}</M> are exactly the states{" "}
              <M>{tex`x_t`}</M>. A Blelloch scan computes all prefixes in{" "}
              <M>{tex`\Theta(L)`}</M> work and{" "}
              <M>{tex`\Theta(\log L)`}</M> depth.
            </p>
          </Block>

          <p>
            The remaining problem is bandwidth, not arithmetic: the scan
            materializes an <M>{tex`L\times D\times N`}</M> state tensor.
            Mamba&apos;s kernel keeps that tensor in SRAM, fuses discretization,
            scan and gating into one kernel, and recomputes the states in the
            backward pass rather than storing them. Cost per layer:{" "}
            <M>{tex`\Theta(LDN)`}</M> work, <M>{tex`\Theta(\log L)`}</M> depth,{" "}
            <M>{tex`\Theta(DN)`}</M> decode state,{" "}
            <M>{tex`\Theta(DN)`}</M> per decode step, with{" "}
            <M>{tex`N=16`}</M> in Mamba-1.
          </p>

          <p>
            What selection buys is exactly what section 5.5 said LTI could not
            do. When <M>{tex`\Delta_t\to0`}</M>,{" "}
            <M>{tex`\bar{\mathsf{A}}_t\to\mathsf{I}`}</M> and{" "}
            <M>{tex`\bar{\mathsf{B}}_t\to0`}</M>: the state <em>holds</em> and
            the current token is ignored. When <M>{tex`\Delta_t`}</M> is large
            the state is overwritten by the current token. A content-dependent{" "}
            <M>{tex`\Delta_t`}</M> is therefore a learned gate on{" "}
            &quot;is this token worth remembering,&quot; which is what selective
            copying and induction require.
          </p>

          <hr className="rule" />

          {/* ================= 9 ================= */}
          <H2 n="9" id="linear-attention">
            Linear attention and state space duality
          </H2>

          <H3 n="9.1" id="la-def">
            From softmax to a recurrence
          </H3>

          <p>
            Causal softmax attention, written per position, is
          </p>

          <Eq>{tex`y_t=\frac{\sum_{s\le t}\exp\!\big(q_t^{\mathsf{T}}k_s/\sqrt d\big)\,v_s}{\sum_{s\le t}\exp\!\big(q_t^{\mathsf{T}}k_s/\sqrt d\big)} .`}</Eq>

          <p>
            Replace the exponential kernel by an explicit feature map,{" "}
            <M>{tex`\exp(q^{\mathsf{T}}k)\rightsquigarrow\phi(q)^{\mathsf{T}}\phi(k)`}</M>{" "}
            with <M>{tex`\phi:\mathbb{R}^d\to\mathbb{R}^{d'}`}</M> elementwise
            nonnegative (<M>{tex`\phi=\mathsf{elu}+1`}</M> in the original,
            random features in Performer, a Taylor expansion in Based). The
            numerator becomes
          </p>

          <Eq tag="9.1">{tex`\sum_{s\le t}\phi(q_t)^{\mathsf{T}}\phi(k_s)\,v_s=\phi(q_t)^{\mathsf{T}}\underbrace{\sum_{s\le t}\phi(k_s)v_s^{\mathsf{T}}}_{=:\ \mathsf{S}_t\ \in\ \mathbb{R}^{d'\times d}} .`}</Eq>

          <p>
            <strong>That regrouping is the entire trick.</strong> It is nothing
            but associativity of matrix multiplication:{" "}
            <M>{tex`(QK^{\mathsf{T}})V`}</M> costs{" "}
            <M>{tex`\Theta(L^2d)`}</M>, while{" "}
            <M>{tex`Q(K^{\mathsf{T}}V)`}</M> costs{" "}
            <M>{tex`\Theta(Ld^2)`}</M>. The softmax is what blocks it, because it
            is applied to <M>{tex`QK^{\mathsf{T}}`}</M> before the product with{" "}
            <M>{tex`V`}</M>. Remove the softmax and attention collapses into a
            linear recurrence:
          </p>

          <Eq tag="9.2">{tex`\mathsf{S}_t=\mathsf{S}_{t-1}+\phi(k_t)v_t^{\mathsf{T}},\qquad
z_t=z_{t-1}+\phi(k_t),\qquad
y_t=\frac{\mathsf{S}_t^{\mathsf{T}}\phi(q_t)}{z_t^{\mathsf{T}}\phi(q_t)} .`}</Eq>

          <p>
            So a linear attention layer <em>is</em> an RNN whose hidden state is
            a <M>{tex`d'\times d`}</M> matrix, an outer-product associative
            memory. Training uses the parallel form; decoding uses (9.2) with{" "}
            <M>{tex`\Theta(d^2)`}</M> state and{" "}
            <M>{tex`\Theta(d^2)`}</M> per step, independent of{" "}
            <M>{tex`L`}</M>. The crossover against softmax attention is at{" "}
            <M>{tex`L\approx d`}</M>.
          </p>

          <Block kind="ex" title="The memory is an outer-product store, and it collides">
            <p>
              Take <M>{tex`\phi=\mathrm{id}`}</M>, <M>{tex`d=2`}</M>, and drop
              the normalizer. Feed two orthonormal keys:
            </p>
            <Eq>{tex`k_1=\begin{bmatrix}1\\0\end{bmatrix},v_1=\begin{bmatrix}5\\1\end{bmatrix}
\;\Rightarrow\;\mathsf{S}_1=\begin{bmatrix}5&1\\0&0\end{bmatrix};\qquad
k_2=\begin{bmatrix}0\\1\end{bmatrix},v_2=\begin{bmatrix}7\\2\end{bmatrix}
\;\Rightarrow\;\mathsf{S}_2=\begin{bmatrix}5&1\\7&2\end{bmatrix}.`}</Eq>
            <p>
              Query with <M>{tex`q=k_1`}</M>:{" "}
              <M>{tex`y=\mathsf{S}_2^{\mathsf{T}}q=(5,1)^{\mathsf{T}}=v_1`}</M>,
              exact retrieval. Query with{" "}
              <M>{tex`q=(1,1)^{\mathsf{T}}`}</M>:{" "}
              <M>{tex`y=(12,3)^{\mathsf{T}}=v_1+v_2`}</M>, a superposition.
              Non-orthogonal keys interfere, and since{" "}
              <M>{tex`\mathsf{S}_t`}</M> has only{" "}
              <M>{tex`d'd`}</M> entries, writing more than about{" "}
              <M>{tex`d'`}</M> distinct keys guarantees collisions. This is the
              precise, mechanical reason plain linear attention loses to softmax
              on recall, and the thing the decay gates and delta rules below are
              all trying to manage.
            </p>
          </Block>

          <H3 n="9.2" id="gating">
            Decay and gating
          </H3>

          <p>
            <M>{tex`\mathsf{S}_t`}</M> in (9.2) only ever grows. Every serious
            variant adds a forget mechanism, and they differ only in how
            structured the forgetting is:
          </p>

          <Table
            head={["Model", "State update", "Forget structure"]}
            rows={[
              [
                "Linear attention",
                <M key="a">{tex`\mathsf{S}_t=\mathsf{S}_{t-1}+k_tv_t^{\mathsf{T}}`}</M>,
                "none",
              ],
              [
                "RetNet",
                <M key="b">{tex`\mathsf{S}_t=\gamma\,\mathsf{S}_{t-1}+k_tv_t^{\mathsf{T}}`}</M>,
                "fixed scalar per head",
              ],
              [
                "Mamba-2",
                <M key="c">{tex`\mathsf{S}_t=a_t\,\mathsf{S}_{t-1}+\mathsf{B}_tx_t^{\mathsf{T}}`}</M>,
                "data-dependent scalar",
              ],
              [
                "GLA",
                <M key="d">{tex`\mathsf{S}_t=\operatorname{diag}(\alpha_t)\,\mathsf{S}_{t-1}+k_tv_t^{\mathsf{T}}`}</M>,
                "data-dependent, per channel",
              ],
              [
                "DeltaNet",
                <M key="e">{tex`\mathsf{S}_t=\mathsf{S}_{t-1}(\mathsf{I}-\beta_tk_tk_t^{\mathsf{T}})+\beta_tv_tk_t^{\mathsf{T}}`}</M>,
                "targeted erase at the written key",
              ],
              [
                "Gated DeltaNet",
                <M key="f">{tex`\mathsf{S}_t=\alpha_t\mathsf{S}_{t-1}(\mathsf{I}-\beta_tk_tk_t^{\mathsf{T}})+\beta_tv_tk_t^{\mathsf{T}}`}</M>,
                "both",
              ],
            ]}
          />

          <p>
            The delta rule deserves its name spelled out. The update is exactly
            one step of online gradient descent, with step size{" "}
            <M>{tex`\beta_t`}</M>, on the regression loss{" "}
            <M>{tex`\mathcal{L}(\mathsf{S})=\tfrac12\|\mathsf{S}k_t-v_t\|^2`}</M>:
          </p>

          <Eq>{tex`\mathsf{S}_t=\mathsf{S}_{t-1}-\beta_t\nabla_{\mathsf{S}}\mathcal{L}
=\mathsf{S}_{t-1}-\beta_t(\mathsf{S}_{t-1}k_t-v_t)k_t^{\mathsf{T}}
=\mathsf{S}_{t-1}(\mathsf{I}-\beta_tk_tk_t^{\mathsf{T}})+\beta_tv_tk_t^{\mathsf{T}} .`}</Eq>

          <p>
            It <em>removes</em> whatever was previously stored at{" "}
            <M>{tex`k_t`}</M> before writing, instead of adding on top of it,
            which directly attacks the collision failure in the example above.
            The update is a rank-1 perturbation of the identity, so a chunk of{" "}
            <M>{tex`C`}</M> steps composes into a WY-style product that is again
            expressible with matmuls, preserving the{" "}
            <M>{tex`\Theta(Ld^2)`}</M> chunkwise-parallel training form.
          </p>

          <H3 n="9.3" id="ssd">
            State space duality: SSMs and attention are the same matrix
          </H3>

          <p>
            Mamba-2 makes the connection exact. Any structured SSM can be written
            as a single matrix multiplication
          </p>

          <Eq tag="9.3">{tex`Y=\big(\mathsf{L}\odot \mathsf{C}\mathsf{B}^{\mathsf{T}}\big)X,\qquad
\mathsf{L}=\begin{bmatrix}1&&&\\ \alpha_1&1&&\\ \vdots&&\ddots&\\ \alpha_{T:1}&\cdots&\alpha_T&1\end{bmatrix},`}</Eq>

          <p>
            where{" "}
            <M>{tex`\mathsf{B},\mathsf{C}\in\mathbb{R}^{T\times N}`}</M>,{" "}
            <M>{tex`X\in\mathbb{R}^{T\times P}`}</M>, and{" "}
            <M>{tex`\alpha_{t:s}=\prod_{j=s+1}^{t}\alpha_j`}</M> is the
            cumulative decay. Set{" "}
            <M>{tex`Q:=\mathsf{C}`}</M>, <M>{tex`K:=\mathsf{B}`}</M>,{" "}
            <M>{tex`V:=X`}</M> and (9.3) reads{" "}
            <M>{tex`Y=(\mathsf{L}\odot QK^{\mathsf{T}})V`}</M>: attention without
            softmax, with a data-dependent decay mask in place of positional
            encodings. Causal linear attention is the case{" "}
            <M>{tex`\alpha_j\equiv1`}</M>.
          </p>

          <Block kind="def" title="Semiseparable matrix">
            <p>
              A lower-triangular{" "}
              <M>{tex`\mathsf{M}\in\mathbb{R}^{T\times T}`}</M> is{" "}
              <M>{tex`N`}</M>-<strong>semiseparable</strong> if every submatrix
              lying entirely on or below the diagonal has rank at most{" "}
              <M>{tex`N`}</M>. The theorem behind SSD: the matrix of a
              state-space model with state size <M>{tex`N`}</M> is exactly an{" "}
              <M>{tex`N`}</M>-semiseparable matrix in sequentially semiseparable
              form, and conversely. &quot;SSM&quot; can be read as either{" "}
              <em>state space model</em> or <em>semiseparable matrix</em> with no
              ambiguity.
            </p>
          </Block>

          <p>
            Two algorithms compute the same <M>{tex`Y`}</M>, and the choice is
            purely about hardware:
          </p>

          <ul>
            <li>
              <strong>Quadratic (attention-like)</strong>: form{" "}
              <M>{tex`\mathsf{L}\odot QK^{\mathsf{T}}`}</M> and multiply.{" "}
              <M>{tex`\Theta(T^2N)`}</M> work, all of it matmul, so it runs at
              near-peak throughput. Best when <M>{tex`T`}</M> is small.
            </li>
            <li>
              <strong>Linear (recurrent)</strong>: propagate the state.{" "}
              <M>{tex`\Theta(TN^2)`}</M> work but elementwise and sequential.
              Best when <M>{tex`T`}</M> is large.
            </li>
          </ul>

          <p>
            The SSD algorithm blocks <M>{tex`\mathsf{M}`}</M> into chunks of size{" "}
            <M>{tex`C`}</M> and uses each form where it wins: diagonal blocks
            (within a chunk) are computed quadratically with matmuls, and
            off-diagonal blocks are low rank by semiseparability, so they are
            summarized by one state per chunk and applied with two more matmuls.
            The result is <M>{tex`\Theta(TN^2)`}</M> training FLOPs,{" "}
            <M>{tex`\Theta(TN)`}</M> memory,{" "}
            <M>{tex`\Theta(N^2)`}</M> decode state and per-step cost, dominated
            by matrix multiplication throughout. In practice this is 2 to 8 times
            faster than Mamba-1&apos;s selective scan and allows a state size of{" "}
            <M>{tex`N=64`}</M> to <M>{tex`256`}</M> rather than 16.
          </p>

          <hr className="rule" />

          {/* ================= 10 ================= */}
          <H2 n="10" id="unified">
            One picture: <M>{tex`\mathsf{P}=\mathsf{A}\odot\mathsf{M}`}</M>
          </H2>

          <p>
            Almost every model in this write-up is an instance of one equation.
            Let
          </p>

          <Eq tag="10.1">{tex`\mathsf{P}=\mathsf{A}\odot\mathsf{M},\qquad O=\mathsf{P}V,`}</Eq>

          <p>
            where <M>{tex`\mathsf{A}\in\mathbb{R}^{T\times T}`}</M> is the{" "}
            <strong>interaction term</strong> (how content at two positions
            matches) and{" "}
            <M>{tex`\mathsf{M}\in\mathbb{R}^{T\times T}`}</M> is a
            lower-triangular <strong>mask</strong> (how much signal survives
            travelling from <M>{tex`s`}</M> to <M>{tex`t`}</M>), possibly
            data-dependent. The structure imposed on{" "}
            <M>{tex`\mathsf{M}`}</M> determines the algorithm and therefore the
            complexity; the structure on <M>{tex`\mathsf{A}`}</M> determines what
            can be expressed.
          </p>

          <Table
            head={[
              "Model",
              "A",
              "M structure",
              "Data-dep. M?",
              "Train time",
              "Decode time",
              "Decode space",
            ]}
            rows={[
              [
                "Softmax attention",
                <M key="a">{tex`\sigma(QK^{\mathsf{T}})`}</M>,
                "0/1 causal mask",
                "no",
                <M key="b">{tex`\mathcal{O}(T^2)`}</M>,
                <M key="c">{tex`\mathcal{O}(T)`}</M>,
                <M key="d">{tex`\mathcal{O}(T)`}</M>,
              ],
              [
                "Linear attention",
                <M key="e">{tex`QK^{\mathsf{T}}`}</M>,
                "0/1 causal mask",
                "no",
                <M key="f">{tex`\mathcal{O}(T)`}</M>,
                <M key="g">{tex`\mathcal{O}(1)`}</M>,
                <M key="h">{tex`\mathcal{O}(1)`}</M>,
              ],
              [
                "RetNet",
                <M key="i">{tex`QK^{\mathsf{T}}`}</M>,
                "semiseparable",
                "no",
                <M key="j">{tex`\mathcal{O}(T)`}</M>,
                <M key="k">{tex`\mathcal{O}(1)`}</M>,
                <M key="l">{tex`\mathcal{O}(1)`}</M>,
              ],
              [
                "Mamba-2",
                <M key="m">{tex`QK^{\mathsf{T}}`}</M>,
                "semiseparable",
                "yes",
                <M key="n">{tex`\mathcal{O}(T)`}</M>,
                <M key="o">{tex`\mathcal{O}(1)`}</M>,
                <M key="p">{tex`\mathcal{O}(1)`}</M>,
              ],
              [
                "Hyena / long conv",
                <M key="q">{tex`QK^{\mathsf{T}}`}</M>,
                "Toeplitz",
                "no",
                <M key="r">{tex`\mathcal{O}(T\log T)`}</M>,
                <M key="s">{tex`\mathcal{O}(\log^2 T)`}</M>,
                <M key="t">{tex`\mathcal{O}(T)`}</M>,
              ],
              [
                "DeltaNet",
                <M key="u">{tex`\mathcal{T}_K(QK^{\mathsf{T}})`}</M>,
                "0/1 causal mask",
                "no",
                <M key="v">{tex`\mathcal{O}(T)`}</M>,
                <M key="w">{tex`\mathcal{O}(1)`}</M>,
                <M key="x">{tex`\mathcal{O}(1)`}</M>,
              ],
              [
                "Gated DeltaNet",
                <M key="y">{tex`\mathcal{T}_K(QK^{\mathsf{T}})`}</M>,
                "semiseparable",
                "yes",
                <M key="z">{tex`\mathcal{O}(T)`}</M>,
                <M key="A">{tex`\mathcal{O}(1)`}</M>,
                <M key="B">{tex`\mathcal{O}(1)`}</M>,
              ],
              [
                "Log-linear attention",
                <M key="C">{tex`QK^{\mathsf{T}}`}</M>,
                "hierarchical (Fenwick)",
                "yes",
                <M key="D">{tex`\mathcal{O}(T\log T)`}</M>,
                <M key="E">{tex`\mathcal{O}(\log T)`}</M>,
                <M key="F">{tex`\mathcal{O}(\log T)`}</M>,
              ],
            ]}
          />

          <p>
            Reading the table as a design space rather than a list:{" "}
            <M>{tex`\mathsf{M}`}</M> Toeplitz means &quot;the mask depends only
            on distance,&quot; which is what makes the FFT applicable and what
            makes the decode state large.{" "}
            <M>{tex`\mathsf{M}`}</M> semiseparable means &quot;the mask is a
            cumulative product,&quot; which is what makes a constant-size
            recurrent state exist. Those two properties are close to mutually
            exclusive, and every model here sits on one side of that line or
            hybridizes across it. Note that{" "}
            <M>{tex`\mathcal{T}_K(\mathsf{A})=(\mathsf{A}\odot\mathsf{L})(\mathsf{I}+KK^{\mathsf{T}}\odot(\mathsf{I}-\mathsf{L}))^{-1}`}</M>{" "}
            (with <M>{tex`\mathsf{L}`}</M> the lower-triangular all-ones matrix)
            is just the closed form of the delta rule&apos;s accumulated
            corrections.
          </p>

          <hr className="rule" />

          {/* ================= 11 ================= */}
          <H2 n="11" id="frontier">
            Where the field is now
          </H2>

          <H3 n="11.1" id="tradeoff">
            The recall-memory tradeoff, which nobody has repealed
          </H3>

          <p>
            There is a reason the story did not end with &quot;replace attention
            with a linear model.&quot; To answer an arbitrary recall query over a
            context containing <M>{tex`m`}</M> distinct key-value pairs, the
            information you carry forward must be sufficient to reconstruct any
            of them, so the recurrent state must hold{" "}
            <M>{tex`\Omega(m)`}</M> bits. Attention satisfies this by brute
            force: the KV cache <em>is</em> the context, at{" "}
            <M>{tex`\Theta(LD)`}</M>. A model with an{" "}
            <M>{tex`L`}</M>-independent state of size <M>{tex`S`}</M> must start
            losing pairs once <M>{tex`m`}</M> exceeds what{" "}
            <M>{tex`S`}</M> can encode, and empirically recall accuracy on
            multi-query associative recall tracks state size closely and smoothly
            across architectures. Subquadratic work and constant decode state are
            not free; they are purchased with exact recall.
          </p>

          <p>
            The practical resolution, now essentially universal, is{" "}
            <strong>hybridization</strong>: interleave a small number of full
            attention layers, which handle exact recall, with a majority of
            linear or convolutional layers, which handle bulk mixing. The
            empirical ratio has converged on roughly{" "}
            <M>{tex`3:1`}</M> linear to full.
          </p>

          <H3 n="11.2" id="recent">
            2025 and 2026
          </H3>

          <ul>
            <li>
              <strong>Log-linear attention</strong> puts a third structure on{" "}
              <M>{tex`\mathsf{M}`}</M>: a Fenwick-tree partition of the prefix,
              so position <M>{tex`t`}</M> is summarized at{" "}
              <M>{tex`\mathcal{O}(\log t)`}</M> geometrically growing scales,
              recent history finely and distant history coarsely. Training is{" "}
              <M>{tex`\mathcal{O}(T\log T)`}</M> via a chunked scan, decode state
              and per-step cost are <M>{tex`\mathcal{O}(\log T)`}</M>. It is a
              modification applied to an existing layer rather than a new one:
              Log-Linear Mamba-2 and Log-Linear Gated DeltaNet. This sits exactly
              between the constant state of an SSM and the linear state of
              attention, and it buys back part of the recall tradeoff above.
            </li>
            <li>
              <strong>Mamba-3</strong> returns to the discretization step of
              section 5.1 and replaces the exponential-Euler rule implicit in
              Mamba-1 and Mamba-2 with an{" "}
              <strong>exponential-trapezoidal</strong> one, averaging the input
              at both endpoints of the step:{" "}
              <M>{tex`h_t=\alpha_th_{t-1}+\beta_t\mathsf{B}_{t-1}x_{t-1}+\gamma_t\mathsf{B}_tx_t`}</M>
              . In SSD terms this makes <M>{tex`\mathsf{L}`}</M> a decay mask
              times a two-band convolutional mask, a strictly more expressive
              structure at no asymptotic cost. It adds complex-valued states
              (real diagonal SSMs cannot represent rotation, so they struggle at
              parity and modular state tracking) and a MIMO formulation that
              raises arithmetic intensity at decode, where the bottleneck is
              bandwidth rather than FLOPs. Reported at 1.5B: +0.6 points average
              downstream over Gated DeltaNet, +1.8 with MIMO, and Mamba-2-level
              perplexity at half the state size.
            </li>
            <li>
              <strong>Hybrids in production.</strong> Qwen3-Next uses Gated
              DeltaNet with gated attention at 3:1. Kimi Linear uses 20 layers of
              Kimi Delta Attention, a Gated DeltaNet whose forget gate is
              per-channel rather than per-head, to 7 layers of gated multi-head
              latent attention, reporting large KV-cache reductions and up to{" "}
              <M>{tex`6\times`}</M> decode throughput at long context. Nemotron-H
              and Falcon-H1 hybridize Mamba-2 with attention similarly.
            </li>
            <li>
              <strong>The Hyena line continues where context is genuinely
              enormous.</strong> StripedHyena interleaves rotary grouped
              attention with Hyena blocks. StripedHyena 2 uses three distinct
              input-dependent convolution operators, short and explicit for local
              multi-token recall, medium and regularized for hundreds of tokens,
              long and implicit for the whole sequence. This is the backbone of
              Evo and Evo 2 for genomics, where the sequence is single
              nucleotides and contexts reach the million-token range, so the
              asymptotics stop being a talking point and start being the only
              thing that matters.
            </li>
          </ul>

          <hr className="rule" />

          {/* ================= 12 ================= */}
          <H2 n="12" id="summary">
            Complexity summary
          </H2>

          <p>
            Per layer, per head or channel group. <M>{tex`L`}</M> is length,{" "}
            <M>{tex`D`}</M> width, <M>{tex`N`}</M> state size or Hyena order as
            appropriate.
          </p>

          <Table
            head={[
              "Operator",
              "Train work",
              "Depth",
              "Train memory",
              "Decode / step",
              "Decode state",
              "Data-controlled",
            ]}
            rows={[
              [
                "Softmax attention",
                <M key="a">{tex`\Theta(L^2D)`}</M>,
                <M key="b">{tex`\Theta(\log L)`}</M>,
                <M key="c">{tex`\Theta(L^2)`}</M>,
                <M key="d">{tex`\Theta(LD)`}</M>,
                <M key="e">{tex`\Theta(LD)`}</M>,
                "yes",
              ],
              [
                "FlashAttention",
                <M key="f">{tex`\Theta(L^2D)`}</M>,
                <M key="g">{tex`\Theta(\log L)`}</M>,
                <M key="h">{tex`\Theta(L)`}</M>,
                <M key="i">{tex`\Theta(LD)`}</M>,
                <M key="j">{tex`\Theta(LD)`}</M>,
                "yes",
              ],
              [
                "FIR conv (kernel M)",
                <M key="k">{tex`\Theta(LMD)`}</M>,
                <M key="l">{tex`\Theta(\log M)`}</M>,
                <M key="m">{tex`\Theta(LD)`}</M>,
                <M key="n">{tex`\Theta(MD)`}</M>,
                <M key="o">{tex`\Theta(MD)`}</M>,
                "no",
              ],
              [
                "LTI SSM, conv form (S4)",
                <M key="p">{tex`\Theta(DL\log L)`}</M>,
                <M key="q">{tex`\Theta(\log L)`}</M>,
                <M key="r">{tex`\Theta(LD)`}</M>,
                <M key="s">{tex`\Theta(DN)`}</M>,
                <M key="t">{tex`\Theta(DN)`}</M>,
                "no",
              ],
              [
                "Hyena (order N)",
                <M key="u">{tex`\Theta(NDL(\log L+D))`}</M>,
                <M key="v">{tex`\Theta(N\log L)`}</M>,
                <M key="w">{tex`\Theta(NDL)`}</M>,
                <span key="x">
                  <M>{tex`\Theta(L)`}</M> naive,{" "}
                  <M>{tex`\Theta(\log^2L)`}</M> tiled
                </span>,
                <M key="y">{tex`\Theta(LD)`}</M>,
                "yes",
              ],
              [
                "Mamba (selective SSM)",
                <M key="z">{tex`\Theta(LDN)`}</M>,
                <M key="A">{tex`\Theta(\log L)`}</M>,
                <M key="B">{tex`\Theta(LD)`}</M>,
                <M key="C">{tex`\Theta(DN)`}</M>,
                <M key="D">{tex`\Theta(DN)`}</M>,
                "yes",
              ],
              [
                "Mamba-2 / SSD",
                <M key="E">{tex`\Theta(LN^2)`}</M>,
                <M key="F">{tex`\Theta(\log L)`}</M>,
                <M key="G">{tex`\Theta(LN)`}</M>,
                <M key="H">{tex`\Theta(N^2)`}</M>,
                <M key="I">{tex`\Theta(N^2)`}</M>,
                "yes",
              ],
              [
                "Linear attention family",
                <M key="J">{tex`\Theta(Ld^2)`}</M>,
                <M key="K">{tex`\Theta(\log L)`}</M>,
                <M key="L">{tex`\Theta(Ld)`}</M>,
                <M key="M">{tex`\Theta(d^2)`}</M>,
                <M key="N">{tex`\Theta(d^2)`}</M>,
                "yes",
              ],
              [
                "Log-linear attention",
                <M key="O">{tex`\Theta(Ld^2\log L)`}</M>,
                <M key="P">{tex`\Theta(\log L)`}</M>,
                <M key="Q">{tex`\Theta(Ld)`}</M>,
                <M key="R">{tex`\Theta(d^2\log L)`}</M>,
                <M key="S">{tex`\Theta(d^2\log L)`}</M>,
                "yes",
              ],
            ]}
          />

          <p>
            If you take one thing from the table: the interesting axis is no
            longer training FLOPs, which everybody has driven to{" "}
            <M>{tex`\tilde{\Theta}(L)`}</M>, but the{" "}
            <strong>decode state column</strong>. That column is where the
            quality tradeoff lives, it is what the recall argument in section
            11.1 constrains, and it is why the 2026 answer is a hybrid rather
            than a single operator.
          </p>

          <hr className="rule" />

          {/* ================= 13 ================= */}
          <H2 n="13" id="glossary">
            Glossary of symbols and operators
          </H2>

          <dl className="kv">
            <dt><M>{tex`L,\;T`}</M></dt>
            <dd>sequence length (number of positions)</dd>
            <dt><M>{tex`D`}</M></dt>
            <dd>model width, number of channels per position</dd>
            <dt><M>{tex`N`}</M></dt>
            <dd>SSM state dimension, or Hyena recurrence order</dd>
            <dt><M>{tex`M`}</M></dt>
            <dd>filter support (number of nonzero taps)</dd>
            <dt><M>{tex`u,\;v,\;y`}</M></dt>
            <dd>input signal, value projection, output signal</dd>
            <dt><M>{tex`h`}</M></dt>
            <dd>filter or convolution kernel; <M>{tex`h_t`}</M> is a tap</dd>
            <dt><M>{tex`(h*u)_t`}</M></dt>
            <dd>
              linear convolution, <M>{tex`\sum_n h_{t-n}u_n`}</M>
            </dd>
            <dt><M>{tex`h\circledast_N u`}</M></dt>
            <dd>circular convolution modulo <M>{tex`N`}</M></dd>
            <dt><M>{tex`\odot`}</M></dt>
            <dd>elementwise (Hadamard) product</dd>
            <dt><M>{tex`\delta`}</M></dt>
            <dd>
              Kronecker delta, <M>{tex`\delta_0=1`}</M> and 0 elsewhere
            </dd>
            <dt><M>{tex`\mathsf{S}_k`}</M></dt>
            <dd>shift operator, <M>{tex`(\mathsf{S}_ku)_t=u_{t-k}`}</M></dd>
            <dt><M>{tex`\mathsf{S}_h`}</M></dt>
            <dd>
              Toeplitz matrix of the filter <M>{tex`h`}</M>,{" "}
              <M>{tex`(\mathsf{S}_h)_{tn}=h_{t-n}`}</M>
            </dd>
            <dt><M>{tex`\mathsf{C}_h`}</M></dt>
            <dd>circulant matrix of <M>{tex`h`}</M></dd>
            <dt><M>{tex`\mathsf{D}_x`}</M></dt>
            <dd>
              diagonal matrix <M>{tex`\operatorname{diag}(x)`}</M>; in Hyena it
              carries the data dependence
            </dd>
            <dt><M>{tex`\mathsf{W},\;\omega_N`}</M></dt>
            <dd>
              DFT matrix and the root of unity{" "}
              <M>{tex`e^{-2\pi i/N}`}</M>
            </dd>
            <dt><M>{tex`\hat x`}</M></dt>
            <dd>DFT of <M>{tex`x`}</M></dd>
            <dt><M>{tex`\mathsf{A},\mathsf{B},\mathsf{C},\mathsf{D}`}</M></dt>
            <dd>continuous SSM matrices; bars denote discretized versions</dd>
            <dt><M>{tex`\Delta`}</M></dt>
            <dd>
              discretization step; in Mamba it is input-dependent and acts as a
              gate
            </dd>
            <dt><M>{tex`\mathsf{H}(u)`}</M></dt>
            <dd>
              surrogate attention matrix; a data-controlled operator with{" "}
              <M>{tex`y=\mathsf{H}(u)v`}</M>
            </dd>
            <dt><M>{tex`\mathsf{S}_t`}</M></dt>
            <dd>
              recurrent matrix state of a linear attention layer (section 9);
              distinct from <M>{tex`\mathsf{S}_h`}</M>
            </dd>
            <dt><M>{tex`\rho(\cdot)`}</M></dt>
            <dd>spectral radius, largest eigenvalue magnitude</dd>
            <dt>FIR / IIR</dt>
            <dd>finite / infinite impulse response</dd>
            <dt>LTI / LTV</dt>
            <dd>linear time-invariant / linear time-varying</dd>
            <dt>SISO / MIMO</dt>
            <dd>single / multiple input, single / multiple output</dd>
            <dt>DPLR</dt>
            <dd>diagonal plus low rank, the S4 structure on <M>{tex`\mathsf{A}`}</M></dd>
          </dl>

          <hr className="rule" />

          {/* ================= 14 ================= */}
          <H2 n="14" id="refs">
            References
          </H2>

          <ul className="refs">
            <li>
              Poli, Massaroli, Nguyen, Fu, Dao, Baccus, Bengio, Ermon, Ré.{" "}
              <a href="https://arxiv.org/abs/2302.10866" target="_blank" rel="noopener noreferrer">
                Hyena Hierarchy: Towards Larger Convolutional Language Models
              </a>{" "}
              (2023).
            </li>
            <li>
              Gu, Goel, Ré.{" "}
              <a href="https://arxiv.org/abs/2111.00396" target="_blank" rel="noopener noreferrer">
                Efficiently Modeling Long Sequences with Structured State Spaces
              </a>{" "}
              (S4, 2021), and Gu, Goel, Gupta, Ré,{" "}
              <a href="https://arxiv.org/abs/2206.11893" target="_blank" rel="noopener noreferrer">
                On the Parameterization and Initialization of Diagonal State
                Space Models
              </a>{" "}
              (S4D, 2022).
            </li>
            <li>
              Fu, Dao, Saab, Thomas, Rudra, Ré.{" "}
              <a href="https://arxiv.org/abs/2212.14052" target="_blank" rel="noopener noreferrer">
                Hungry Hungry Hippos: Towards Language Modeling with State Space
                Models
              </a>{" "}
              (H3, 2022).
            </li>
            <li>
              Romero, Kuzina, Bekkers, Tomczak, Hoogendoorn.{" "}
              <a href="https://arxiv.org/abs/2102.02611" target="_blank" rel="noopener noreferrer">
                CKConv: Continuous Kernel Convolution for Sequential Data
              </a>{" "}
              (2021).
            </li>
            <li>
              Gu, Dao.{" "}
              <a href="https://arxiv.org/abs/2312.00752" target="_blank" rel="noopener noreferrer">
                Mamba: Linear-Time Sequence Modeling with Selective State Spaces
              </a>{" "}
              (2023).
            </li>
            <li>
              Dao, Gu.{" "}
              <a href="https://arxiv.org/abs/2405.21060" target="_blank" rel="noopener noreferrer">
                Transformers are SSMs: Generalized Models and Efficient
                Algorithms Through Structured State Space Duality
              </a>{" "}
              (Mamba-2, 2024).
            </li>
            <li>
              Katharopoulos, Vyas, Pappas, Fleuret.{" "}
              <a href="https://arxiv.org/abs/2006.16236" target="_blank" rel="noopener noreferrer">
                Transformers are RNNs: Fast Autoregressive Transformers with
                Linear Attention
              </a>{" "}
              (2020).
            </li>
            <li>
              Yang, Wang, Shen, Panda, Kim.{" "}
              <a href="https://arxiv.org/abs/2312.06635" target="_blank" rel="noopener noreferrer">
                Gated Linear Attention Transformers with Hardware-Efficient
                Training
              </a>{" "}
              (2023), and{" "}
              <a href="https://arxiv.org/abs/2412.06464" target="_blank" rel="noopener noreferrer">
                Gated Delta Networks
              </a>{" "}
              (2024).
            </li>
            <li>
              Guo et al.{" "}
              <a href="https://arxiv.org/abs/2506.04761" target="_blank" rel="noopener noreferrer">
                Log-Linear Attention
              </a>{" "}
              (ICLR 2026).
            </li>
            <li>
              <a href="https://arxiv.org/abs/2603.15569" target="_blank" rel="noopener noreferrer">
                Mamba-3: Improved Sequence Modeling using State Space Principles
              </a>{" "}
              (2026).
            </li>
            <li>
              Fu, Kumbong, Nguyen, Ré.{" "}
              <a href="https://arxiv.org/abs/2311.05908" target="_blank" rel="noopener noreferrer">
                FlashFFTConv: Efficient Convolutions for Long Sequences with
                Tensor Cores
              </a>{" "}
              (2023).
            </li>
            <li>
              <a href="https://arxiv.org/abs/2410.12982" target="_blank" rel="noopener noreferrer">
                Flash Inference: Near Linear Time Inference for Long Convolution
                Sequence Models
              </a>{" "}
              (2024).
            </li>
            <li>
              Arora et al.{" "}
              <a href="https://arxiv.org/abs/2312.04927" target="_blank" rel="noopener noreferrer">
                Zoology: Measuring and Improving Recall in Efficient Language
                Models
              </a>{" "}
              (2023), and{" "}
              <a href="https://arxiv.org/abs/2402.18668" target="_blank" rel="noopener noreferrer">
                Simple Linear Attention Balances the Recall-Throughput Tradeoff
              </a>{" "}
              (Based, 2024).
            </li>
            <li>
              Together AI.{" "}
              <a href="https://www.together.ai/blog/stripedhyena-7b" target="_blank" rel="noopener noreferrer">
                StripedHyena-7B
              </a>{" "}
              (2023); Nguyen et al., Evo and Evo 2 for genome-scale sequence
              modeling.
            </li>
            <li>
              Dao, Fu, Ermon, Rudra, Ré.{" "}
              <a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noopener noreferrer">
                FlashAttention
              </a>{" "}
              (2022).
            </li>
          </ul>

          <p className="mt-10 text-sm text-[color:var(--muted)]">
            Worked numerical examples on this page were verified directly rather
            than quoted. Reported speedups and accuracies are taken from the
            cited papers.
          </p>
        </article>
      </div>
    </main>
  );
}
