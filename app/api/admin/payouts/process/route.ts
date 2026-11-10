import {NextResponse} from "next/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import {createClient as createUserClient} from "@/lib/supabase/server";
export const runtime="nodejs";
async function refundHold(admin:any,payout:any){const gross=Number(payout.gross_amount_minor??(Number(payout.amount_minor)+Number(payout.fee_minor??0)));await admin.from("wallet_ledger").upsert({user_id:payout.seller_id,entry_type:"payout_release",amount_minor:gross,currency:payout.currency??"NGN",reference:"payout-release:"+payout.id,description:"Payout request returned to available balance"},{onConflict:"reference",ignoreDuplicates:true});}
export async function POST(request:Request){
 try{
  const auth=await createUserClient();if(!auth)return NextResponse.json({error:"Not configured."},{status:503});
  const {data:{user}}=await auth.auth.getUser();if(!user)return NextResponse.json({error:"Sign in first."},{status:401});
  const allow=(process.env.WORKNA_ADMIN_EMAILS??"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!user.email||!allow.includes(user.email.toLowerCase()))return NextResponse.json({error:"Admin access required."},{status:403});
  const {payoutId,action}=await request.json();if(typeof payoutId!=="string"||!["approve","reject"].includes(action))return NextResponse.json({error:"Invalid payout action."},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY,key=process.env.PAYSTACK_SECRET_KEY;
  if(!url||!secret)return NextResponse.json({error:"Secure admin backend is not configured."},{status:503});
  const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:payout}=await admin.from("seller_payouts").select("id,seller_id,payout_account_id,amount_minor,gross_amount_minor,fee_minor,currency,status").eq("id",payoutId).maybeSingle();
  if(!payout)return NextResponse.json({error:"Payout request not found."},{status:404});
  if(payout.status!=="pending")return NextResponse.json({error:"This payout has already been actioned."},{status:409});
  if(action==="reject"){
   const {error}=await admin.from("seller_payouts").update({status:"failed",failure_reason:"Rejected by WORKNA administrator",processed_at:new Date().toISOString()}).eq("id",payout.id).eq("status","pending");
   if(error)return NextResponse.json({error:"Could not reject payout."},{status:500});
   await refundHold(admin,payout);return NextResponse.json({success:true,status:"failed"});
  }
  if(!key)return NextResponse.json({error:"Paystack transfer credentials are not configured."},{status:503});
  const {data:account}=await admin.from("payout_accounts").select("recipient_code").eq("id",payout.payout_account_id).eq("user_id",payout.seller_id).eq("provider","paystack").maybeSingle();
  if(!account?.recipient_code)return NextResponse.json({error:"Seller has no verified Paystack transfer recipient."},{status:409});
  const reference="mkt_payout_"+payout.id.replaceAll("-","");
  const {data:locked,error:lockError}=await admin.from("seller_payouts").update({status:"processing",provider_reference:reference}).eq("id",payout.id).eq("status","pending").select("id").maybeSingle();
  if(lockError||!locked)return NextResponse.json({error:"Payout is already being processed."},{status:409});
  const response=await fetch("https://api.paystack.co/transfer",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({source:"balance",amount:Number(payout.amount_minor),recipient:account.recipient_code,reason:"WORKNA seller payout",reference}),cache:"no-store"});
  const result=await response.json();
  if(!response.ok||!result.status||!result.data){
   const reason=result.message??"Paystack transfer failed to initialize.";
   await admin.from("seller_payouts").update({status:"failed",failure_reason:reason,processed_at:new Date().toISOString()}).eq("id",payout.id);
   await refundHold(admin,payout);return NextResponse.json({error:reason},{status:502});
  }
  const status=result.data.status==="success"?"paid":"processing";
  await admin.from("seller_payouts").update({status,provider_reference:result.data.reference??reference,processed_at:status==="paid"?new Date().toISOString():null}).eq("id",payout.id);
  return NextResponse.json({success:true,status});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Payout action failed."},{status:500});}
}