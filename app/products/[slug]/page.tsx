import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCart from "@/components/add-to-cart";
export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, supabase = await createClient();
  if (!supabase) notFound();
  const { data: product } = await supabase.from("products").select("id,title,slug,description,category,price_minor,currency,image_url,stock,stores(name,slug,description)").eq("slug", slug).eq("status", "active").maybeSingle();
  if (!product || product.stock < 1) notFound();
  const price = new Intl.NumberFormat("en-NG", { style: "currency", currency: product.currency, maximumFractionDigits: 0 }).format(product.price_minor / 100);
  return <main className="catalog-page">
    <header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link><div className="catalog-head-actions"><Link href="/cart" className="back-link">Bag ↗</Link><Link href="/products" className="back-link">← Back to shop</Link></div></header>
    <div className="product-detail"><div className="product-detail-image">{product.image_url ? <img src={product.image_url} alt={product.title} /> : <div className="product-image-placeholder"><span>W.</span></div>}</div>
      <div className="product-detail-copy"><div className="section-kicker">{product.category} / THE WORKNA SHOP</div><h1>{product.title}</h1><div className="product-detail-price">{price}</div><p>{product.description}</p><div className="product-stock">{product.stock} available · Listed by {product.stores?.[0]?.name ?? "an independent seller"}</div><AddToCart productId={product.id} /><Link href="/cart" className="text-link">View your bag ↗</Link><div className="product-detail-note">Secure checkout is available through supported payment providers. Product availability is checked again when you place your order.</div></div>
    </div>
  </main>;
}