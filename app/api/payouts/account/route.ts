import {NextResponse} from "next/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import {createClient as createUserClient} from "@/lib/supabase/server";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
  const userClient=await createUserClient();if(!userClient)return NextResponse.json({error:"WORKNA backend is unavailable."},{status:503});
  const {data:{user}}=await userClient.auth.getUser();if(!user)return NextResponse.json({error:"Sign in first."},{status:401});
  const body=await request.json();const bankCode=String(body.bankCode??"").trim(),accountNumber=String(body.accountNumber??"").trim();
  if(!/^\d{3}$/.test(bankCode)||!/^\d{10}$/.test(accountNumber))return NextResponse.json({error:"Enter a valid 3-digit bank code and 10-digit account number."},{status:400});
  const key=process.env.PAYSTACK_SECRET_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
  if(!key||!url||!secret)return NextResponse.json({error:"Paystack payouts are not configured. Add the server keys in Vercel."},{status:503});
  const response=await fetch("https://api.paystack.co/transferrecipient",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({type:"nuban",name:String(body.accountName??user.email??"WORKNA seller").slice(0,100),account_number:accountNumber,bank_code:bankCode,currency:"NGN"}),cache:"no-store"});
  const result=await response.json();if(!response.ok||!result.status||!result.data?.recipient_code)return NextResponse.json({error:result.message||"Paystack could not verify this bank account."},{status:502});
  const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const details=result.data.details??{};
  const {error}=await admin.from("payout_accounts").upsert({user_id:user.id,provider:"paystack",recipient_code:result.data.recipient_code,account_last4:accountNumber.slice(-4),bank_name:details.bank_name??String(body.bankName??"Nigerian bank"),account_name:details.account_name??result.data.name??String(body.accountName??""),currency:"NGN",status:"active",updated_at:new Date().toISOString()},{onConflict:"user_id,provider"});
  if(error)return NextResponse.json({error:"Bank verification succeeded, but we could not save the payout account."},{status:500});
  return NextResponse.json({success:true,accountName:details.account_name??result.data.name,bankName:details.bank_name??body.bankName,last4:accountNumber.slice(-4)});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not save payout account."},{status:500});}
}