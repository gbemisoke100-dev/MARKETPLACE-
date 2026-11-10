import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const money = (amount: number, currency = "NGN") => new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
export default async function Storefront({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, supabase = await createClient();
  if (!supabase) notFound();
  const { data: store } = await supabase.from("stores").select("id,name,slug,description,logo_url,banner_url,is_published").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!store) notFound();
  const { data: products } = await supabase.from("products").select("id,title,slug,category,price_minor,currency,image_url,stock").eq("store_id", store.id).eq("status", "active").gt("stock", 0).order("created_at", { ascending: false });
  return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link><Link href="/products" className="back-link">← Discover</Link></header>
    <div className="storefront-hero">{store.banner_url ? <img src={store.banner_url} alt="" /> : <div className="storefront-banner" />}<div className="storefront-profile">{store.logo_url ? <img src={store.logo_url} alt="" /> : <span>{store.name.slice(0, 1).toUpperCase()}</span>}<div><div className="section-kicker">INDEPENDENT WORKNA SELLER</div><h1>{store.name}</h1><p>{store.description || "An independent seller on WORKNA."}</p></div></div></div>
    <div className="storefront-products"><div className="section-kicker">THE STORE EDIT</div><h2>Available now.</h2>{products?.length ? <div className="catalog-grid">{products.map((product: any) => <article className="product-card" key={product.id}><Link href={`/products/${product.slug}`} className="product-image-wrap">{product.image_url ? <img className="product-image" src={product.image_url} alt={product.title} /> : <div className="product-image-placeholder"><span>W.</span></div>}</Link><div className="product-meta"><span>{product.category}</span><span>{product.stock} available</span></div><h3>{product.title}</h3><strong>{money(product.price_minor, product.currency)}</strong></article>)}</div> : <div className="empty-catalog"><span className="empty-symbol">✳</span><h2>This store is preparing its next release.</h2><p>There are no active products available right now. Check back soon.</p><Link href="/products" className="button button-dark">Discover other listings ↗</Link></div>}</div>
  </main>;
}