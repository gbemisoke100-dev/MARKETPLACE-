import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
  const supabase=await createClient();if(!supabase)return NextResponse.json({error:"Marketplace backend is unavailable."},{status:503});
  const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Sign in first."},{status:401});
  const body=await request.json(),gross=Number(body.amountMinor),bps=Number(process.env.MARKETPLACE_COMMISSION_BPS);
  if(!Number.isSafeInteger(gross)||gross<10000)return NextResponse.json({error:"Minimum payout request is NGN 100."},{status:400});
  if(!Number.isInteger(bps)||bps<0||bps>3000)return NextResponse.json({error:"Payouts are paused until the marketplace commission rate is configured."},{status:503});
  const {data,error}=await supabase.rpc("request_seller_payout",{p_gross_amount_minor:gross,p_fee_bps:bps});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({success:true,payoutId:data});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not request payout."},{status:500});}
}