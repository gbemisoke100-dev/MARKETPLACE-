import Link from "next/link";
export default function About() {
  return <main className="catalog-page">
    <header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">W</span>WORKNA.</Link><Link href="/" className="back-link">← Back home</Link></header>
    <div className="catalog-content"><div className="eyebrow">— MADE FOR WHAT'S NEXT</div><h1>One home. <em>More possibility.</em></h1>
      <p>WORKNA brings work, people and products together. Find the right talent, discover independent sellers, build your next project and grow your business — all in one place.</p>
      <div className="about-panels">
        <article><h2>Work, together.</h2><p>Find skilled independent professionals, post opportunities and build lasting working relationships.</p><Link href="/jobs">Explore opportunities ↗</Link></article>
        <article><h2>Discover, differently.</h2><p>Shop products from independent sellers and emerging brands, all in one considered experience.</p><Link href="/products">Explore products ↗</Link></article>
      </div>
    </div>
  </main>;
}