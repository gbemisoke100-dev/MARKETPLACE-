import Link from "next/link";
import HeroScene from "@/components/hero-scene";
import { Reveal } from "@/components/reveal";
import { createClient } from "@/lib/supabase/server";

type Product = { id: string; title: string; slug: string; category: string; price_minor: number; currency: string; image_url: string | null; stock: number; stores?: { name: string; slug: string }[] | null };
type Job = { id: string; title: string; category: string; budget_minor: number | null; currency: string; work_type: string; skills: string[] };
type Profile = { id: string; full_name: string; headline: string | null; country: string | null; hourly_rate_minor: number | null; currency: string; skills: string[]; avatar_url: string | null };

const money = (amount: number | null, currency = "NGN") => amount == null ? "Budget on discussion" : new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
const initials = (name: string) => name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();

export default async function Home() {
  const supabase = await createClient();
  const [{ data: products }, { data: jobs }, { data: people }] = await Promise.all([
    supabase ? supabase.from("products").select("id,title,slug,category,price_minor,currency,image_url,stock,stores(name,slug)").eq("status", "active").gt("stock", 0).order("created_at", { ascending: false }).limit(4) : Promise.resolve({ data: [] as Product[] }),
    supabase ? supabase.from("jobs").select("id,title,category,budget_minor,currency,work_type,skills").eq("status", "open").order("created_at", { ascending: false }).limit(3) : Promise.resolve({ data: [] as Job[] }),
    supabase ? supabase.from("profiles").select("id,full_name,headline,country,hourly_rate_minor,currency,skills,avatar_url").contains("roles", ["freelancer"]).eq("is_available", true).order("created_at", { ascending: false }).limit(3) : Promise.resolve({ data: [] as Profile[] })
  ]);
  const liveProducts = (products ?? []) as Product[], liveJobs = (jobs ?? []) as Job[], livePeople = (people ?? []) as Profile[];

  return <main className="site-shell">
    <div className="announcement"><span className="announcement-dot" /> WORK, DISCOVER AND MOVE FORWARD <span className="announcement-separator">/</span><Link href="/about">The WORKNA story ↗</Link></div>
    <header className="site-header">
      <Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link>
      <nav className="main-nav"><Link href="/products">Shop</Link><Link href="/jobs">Find work</Link><Link href="/freelancers">Hire talent</Link><Link href="/about">Why WORKNA</Link></nav>
      <div className="header-actions"><Link href="/cart">Bag ↗</Link><Link href="/auth?mode=login">Sign in</Link><Link href="/auth?mode=signup" className="button button-light">Join WORKNA <span>↗</span></Link></div>
      <Link className="mobile-menu" href="/auth">Join WORKNA ↗</Link>
    </header>

    <section className="hero hero-dark">
      <div className="hero-copy">
        <div className="eyebrow eyebrow-gold"><span /> MADE FOR WHAT'S NEXT</div>
        <h1>Work that moves you.<br/><em>Things worth finding.</em></h1>
        <p className="hero-description">Build your next chapter with people, projects and products that move life forward. One account. More ways to make it happen.</p>
        <form action="/products" className="hero-search"><span className="search-icon">⌕</span><input name="q" placeholder="Search products, skills or services..." aria-label="Search WORKNA" /><button type="submit">Explore <span>↗</span></button></form>
        <div className="hero-ctas"><Link href="/products" className="button button-gold">Discover WORKNA <span>↗</span></Link><Link href="/jobs" className="text-link text-link-light">Find your next opportunity <span>→</span></Link></div>
        <div className="hero-caption"><span className="caption-line" /> A better place to work, shop and grow.</div>
      </div>
      <div className="hero-art"><div className="art-aura" /><div className="art-grid" /><HeroScene /><div className="art-index">FIG. 01 <span>THE WORKNA WORLD</span></div><div className="art-coordinate">MADE IN AFRICA<br/>OPEN TO THE WORLD</div><div className="art-orbit-label">Your next<br/><i>possibility.</i></div></div>
      <div className="hero-bottomline"><span>01 — DISCOVER</span><span>02 — CONNECT</span><span>03 — MAKE IT HAPPEN</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section className="intro-strip"><p>One home, many ways forward.</p><div><span>WORK & PROJECTS</span><span>PRODUCTS & STORES</span><span>BUILT AROUND TRUST</span></div></section>

    <Reveal><section className="section-wrap editorial-section">
      <div className="section-kicker">01 / THE WORKNA SHOP</div>
      <div className="section-heading"><div><h2>Find things with<br/><em>a point of view.</em></h2><p>Discover products from independent sellers and ambitious makers. Real listings, considered finds, no filler.</p></div><Link href="/products" className="round-link">Explore all products <span>↗</span></Link></div>
      {liveProducts.length ? <div className="product-grid">{liveProducts.map(p => <article className="product-card" key={p.id}><Link href={`/products/${p.slug}`} className="product-image-wrap">{p.image_url ? <img className="product-image" src={p.image_url} alt={p.title} /> : <div className="product-image-placeholder"><span>W.</span></div>}<span className="image-arrow">↗</span></Link><div className="product-meta"><span>{p.category}</span><span>{p.stock} available</span></div><h3>{p.title}</h3><strong>{money(p.price_minor, p.currency)}</strong><small className="seller-name">{p.stores?.[0]?.slug ? <Link href={`/stores/${p.stores[0].slug}`}>{p.stores[0].name}</Link> : (p.stores?.[0]?.name ?? "Independent seller")}</small></article>)}</div> : <div className="empty-editorial"><div className="empty-symbol">✳</div><div><span>THE FIRST CHAPTER IS YOURS</span><h3>Fresh shelves. Real finds.</h3><p>Our product shelves are ready for their first WORKNA sellers. Have something worth sharing? Open your store and make it yours.</p><Link href="/auth?mode=signup" className="text-link">Become a seller <span>↗</span></Link></div></div>}
    </section></Reveal>

    <section className="dark-band"><div className="dark-band-inner"><div className="section-kicker">02 / THE PEOPLE EDIT</div><div className="section-heading"><div><h2>Meet the minds<br/>behind <em>the magic.</em></h2><p>Find independent professionals with the skill and perspective to move your next idea forward.</p></div><Link href="/freelancers" className="round-link round-link-dark">Meet our talent <span>↗</span></Link></div>
      {livePeople.length ? <div className="talent-grid">{livePeople.map(p => <article className="talent-card" key={p.id}><div className="talent-avatar">{p.avatar_url ? <img src={p.avatar_url} alt="" /> : initials(p.full_name || "Member")}</div><div className="talent-card-body"><h3>{p.full_name}</h3><p>{p.headline || "Independent professional"}</p><div className="talent-card-foot"><span>{p.country || "Available worldwide"}</span><strong>{money(p.hourly_rate_minor, p.currency)}{p.hourly_rate_minor != null ? "/hr" : ""}</strong></div></div></article>)}</div> : <div className="empty-editorial empty-editorial-dark"><div className="empty-symbol">✳</div><div><span>THE PEOPLE MAKE THE PLACE</span><h3>Meet the first WORKNA professionals.</h3><p>Join as a freelancer, add your skills and portfolio, and let the right opportunities find you.</p><Link href="/auth?mode=signup" className="text-link text-link-light">Create your professional profile <span>↗</span></Link></div></div>}
    </div></section>

    <Reveal><section className="section-wrap opportunities-section"><div className="section-kicker">03 / OPEN OPPORTUNITIES</div><div className="section-heading"><div><h2>Good work is<br/><em>worth finding.</em></h2><p>Explore open projects from clients building something meaningful.</p></div><Link href="/jobs" className="round-link">Browse opportunities <span>↗</span></Link></div>
      {liveJobs.length ? <div className="job-list">{liveJobs.map(j => <article className="job-card" key={j.id}><div className="job-index">↗</div><div className="job-info"><span>{j.category} / {j.work_type}</span><h3>{j.title}</h3><p>{j.skills?.slice(0, 5).join(" · ")}</p></div><div className="job-rate"><strong>{money(j.budget_minor, j.currency)}</strong><Link href="/auth?mode=signup">View opportunity ↗</Link></div></article>)}</div> : <div className="empty-job-state"><span>NO OPEN BRIEFS JUST YET</span><p>When a client publishes a project, it will appear here. Ready to hire? Post your first brief.</p><Link href="/auth?mode=signup" className="text-link">Post a project <span>↗</span></Link></div>}
    </section></Reveal>

    <section className="closing-cta"><div className="closing-cta-inner"><div className="section-kicker">YOUR NEXT CHAPTER</div><h2>Make room for<br/><em>what's possible.</em></h2><p>Start with what you have. Find what you need. See where it takes you.</p><Link href="/auth?mode=signup" className="button button-gold">Step into WORKNA <span>↗</span></Link><div className="closing-orb">W.</div></div></section>

    <footer className="footer"><div className="footer-top"><Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link><p>Made for what's next.</p><div className="footer-links"><Link href="/products">Shop</Link><Link href="/jobs">Find work</Link><Link href="/freelancers">Hire talent</Link><Link href="/about">Why WORKNA</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} WORKNA</span><span>BUILT FOR WHAT'S NEXT.</span><Link href="/dashboard">Your workspace ↗</Link></div></footer>
  </main>;
}