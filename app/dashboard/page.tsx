import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import DashboardWorkspace from "@/components/dashboard-workspace";
export default async function Dashboard(){
 const supabase=await createClient();
 if(!supabase)return <main className="catalog-page"><div className="catalog-content"><h1>Connect your account.</h1><p>Marketplace needs its Supabase connection before your private workspace can load.</p><Link href="/auth" className="button button-dark">Sign in ↗</Link></div></main>;
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/auth?mode=login");
 const [{data:profile},{data:store},{count:productCount},{count:jobCount},{count:orderCount},{count:proposalCount}]=await Promise.all([
  supabase.from("profiles").select("full_name,headline,bio,roles,skills,hourly_rate_minor,currency,city,country,portfolio_url").eq("id",user.id).maybeSingle(),\n  supabase.from("stores").select("id,name,slug,description,logo_url,banner_url,is_published").eq("owner_id",user.id).maybeSingle(),
  supabase.from("products").select("id",{count:"exact",head:true}).eq("seller_id",user.id),
  supabase.from("jobs").select("id",{count:"exact",head:true}).eq("client_id",user.id),
  supabase.from("orders").select("id",{count:"exact",head:true}).eq("buyer_id",user.id),
  supabase.from("proposals").select("id",{count:"exact",head:true}).eq("freelancer_id",user.id)
 ]);
 return <DashboardWorkspace userId={user.id} email={user.email??""} profile={profile} productCount={productCount??0} jobCount={jobCount??0} orderCount={orderCount??0} proposalCount={proposalCount??0} store={store}/>;
}