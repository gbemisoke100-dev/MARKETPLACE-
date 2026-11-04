import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import PayoutWorkspace from "@/components/payout-workspace";
export default async function PayoutsPage(){
 const supabase=await createClient();if(!supabase)redirect("/auth");
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/auth?mode=login");
 const [{data:account},{data:payouts}]=await Promise.all([
  supabase.from("payout_accounts").select("account_last4,account_name,bank_name,status").eq("user_id",user.id).eq("provider","paystack").maybeSingle(),
  supabase.from("seller_payouts").select("id,amount_minor,gross_amount_minor,fee_minor,currency,status,requested_at,processed_at,failure_reason").eq("seller_id",user.id).order("requested_at",{ascending:false}).limit(30)
 ]);
 let balance=0;const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(url&&secret){const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});const {data}=await admin.rpc("get_seller_wallet_balance",{p_seller_id:user.id});balance=Math.max(0,Number(data??0));}
 const bps=Number(process.env.MARKETPLACE_COMMISSION_BPS);
 return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">m</span><span>marketplace<span className="brand-period">.</span></span></Link><Link href="/dashboard" className="back-link">← Dashboard</Link></header><PayoutWorkspace balanceMinor={balance} account={account} payouts={payouts??[]} commissionBps={Number.isInteger(bps)&&bps>=0&&bps<=3000?bps:null}/></main>;
}