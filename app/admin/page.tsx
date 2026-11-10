import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient as createUserClient} from "@/lib/supabase/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import AdminPayouts from "@/components/admin-payouts";
export const dynamic="force-dynamic";
export default async function AdminPage(){
 const userClient=await createUserClient();if(!userClient)redirect("/auth");
 const {data:{user}}=await userClient.auth.getUser();if(!user)redirect("/auth?mode=login");
 const allowed=(process.env.WORKNA_ADMIN_EMAILS??"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!user.email||!allowed.includes(user.email.toLowerCase()))return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">m</span><span>WORKNA<span className="brand-period">.</span></span></Link><Link href="/dashboard" className="back-link">← Dashboard</Link></header><div className="empty-catalog"><span className="empty-symbol">✳</span><h2>Admin access only.</h2><p>This workspace is restricted to the email addresses configured in the server-only WORKNA_ADMIN_EMAILS setting.</p></div></main>;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)return <main className="catalog-page"><div className="empty-catalog"><h2>Admin backend is not configured.</h2><p>Add the server-only Supabase secret in Vercel before opening the console.</p></div></main>;
 const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const [{data:payouts},{count:orders},{count:paid},{count:users},{data:events},{data:commissionRows}]=await Promise.all([
  admin.from("seller_payouts").select("id,seller_id,payout_account_id,amount_minor,gross_amount_minor,fee_minor,status,requested_at,provider_reference").order("requested_at",{ascending:false}).limit(100),
  admin.from("orders").select("id",{count:"exact",head:true}),
  admin.from("orders").select("id",{count:"exact",head:true}).eq("status","paid"),
  admin.from("profiles").select("id",{count:"exact",head:true}),
  admin.from("payment_events").select("provider,event_type,created_at,processed_at").order("created_at",{ascending:false}).limit(12),
  admin.from("platform_ledger").select("commission_minor,gross_amount_minor").limit(10000)
 ]);
 const ids=[...new Set((payouts??[]).map(x=>x.seller_id))],accountIds=[...new Set((payouts??[]).map(x=>x.payout_account_id))];
 const [{data:profiles},{data:accounts}]=await Promise.all([
  ids.length?admin.from("profiles").select("id,full_name").in("id",ids):Promise.resolve({data:[] as any[]}),
  accountIds.length?admin.from("payout_accounts").select("id,bank_name,account_name,account_last4").in("id",accountIds):Promise.resolve({data:[] as any[]})
 ]);
 const rows=(payouts??[]).map(p=>{const profile=profiles?.find(x=>x.id===p.seller_id),account=accounts?.find(x=>x.id===p.payout_account_id);return {...p,name:profile?.full_name??"Seller",email:"",bank_name:account?.bank_name??null,account_name:account?.account_name??null,account_last4:account?.account_last4??null};});
 const pending=(payouts??[]).filter(x=>x.status==="pending").length;const commissionTotal=(commissionRows??[]).reduce((sum,x)=>sum+Number(x.commission_minor),0);const salesTotal=(commissionRows??[]).reduce((sum,x)=>sum+Number(x.gross_amount_minor),0);const money=(n:number)=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n/100);
 return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">m</span><span>WORKNA<span className="brand-period">.</span></span></Link><Link href="/dashboard" className="back-link">← Dashboard</Link></header><section className="admin-shell"><div className="admin-heading"><span className="section-kicker">MARKETPLACE OPERATIONS</span><h1>Behind the WORKNA.</h1><p>Review seller payouts, monitor payment events and keep an eye on the health of the WORKNA. Admin access is controlled by a server-side email allowlist.</p></div><div className="admin-kpis"><article><span>Members</span><strong>{users??0}</strong></article><article><span>Orders</span><strong>{orders??0}</strong></article><article><span>Paid orders</span><strong>{paid??0}</strong></article><article><span>Payouts awaiting review</span><strong>{pending}</strong></article><article><span>Gross processed sales</span><strong>{money(salesTotal)}</strong></article><article><span>10% platform commission</span><strong>{money(commissionTotal)}</strong></article></div><AdminPayouts items={rows}/><section className="admin-panel" style={{marginTop:22}}><h2>Recent payment events</h2>{events?.length?events.map((e,i)=><div className="admin-row" key={i}><div><strong>{e.provider} · {e.event_type}</strong><small>{new Date(e.created_at).toLocaleString()}</small></div><span className="order-status">{e.processed_at?"processed":"received"}</span></div>):<p className="payout-muted">No verified payment webhooks have been recorded yet.</p>}</section></section></main>;
}