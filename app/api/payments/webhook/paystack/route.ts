import {NextResponse} from "next/server";
import {createHmac,timingSafeEqual} from "node:crypto";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request:Request){
 const raw=await request.text(),signature=request.headers.get("x-paystack-signature"),secret=process.env.PAYSTACK_SECRET_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,dbSecret=process.env.SUPABASE_SECRET_KEY;
 if(!signature||!secret||!url||!dbSecret)return NextResponse.json({error:"Webhook is not configured."},{status:503});
 const expected=createHmac("sha512",secret).update(raw).digest("hex");
 const a=Buffer.from(signature),b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"Invalid signature."},{status:401});
 try{
  const event=JSON.parse(raw),admin=createClient(url,dbSecret,{auth:{autoRefreshToken:false,persistSession:false}});
  if(event.event==="transfer.success"||event.event==="transfer.failed"){
   const reference=event.data?.reference;if(typeof reference!=="string")return NextResponse.json({error:"Missing transfer reference."},{status:400});
   const {data:payout}=await admin.from("seller_payouts").select("id,seller_id,gross_amount_minor,amount_minor,fee_minor,currency,status").eq("provider","paystack").eq("provider_reference",reference).maybeSingle();
   if(!payout)return NextResponse.json({received:true});
   if(event.event==="transfer.success"){
    await admin.from("seller_payouts").update({status:"paid",processed_at:new Date().toISOString(),failure_reason:null}).eq("id",payout.id).in("status",["processing","pending"]);
   }else{
    await admin.from("seller_payouts").update({status:"failed",processed_at:new Date().toISOString(),failure_reason:event.data?.reason??"Paystack transfer failed"}).eq("id",payout.id).in("status",["processing","pending"]);
    const gross=Number(payout.gross_amount_minor??(Number(payout.amount_minor)+Number(payout.fee_minor??0)));
    await admin.from("wallet_ledger").upsert({user_id:payout.seller_id,entry_type:"payout_release",amount_minor:gross,currency:payout.currency,reference:"payout-release:"+payout.id,description:"Failed payout returned to seller balance"},{onConflict:"reference",ignoreDuplicates:true});
   }
   await admin.from("payment_events").upsert({provider:"paystack",provider_event_id:String(event.data?.id??reference),event_type:event.event,payload:event,processed_at:new Date().toISOString()},{onConflict:"provider,provider_event_id",ignoreDuplicates:true});
   return NextResponse.json({received:true});
  }
  if(event.event!=="charge.success")return NextResponse.json({received:true});
  const reference=event.data?.reference;if(typeof reference!=="string")return NextResponse.json({error:"Missing reference."},{status:400});
  const verify=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{Authorization:"Bearer "+secret},cache:"no-store"});
  const result=await verify.json();if(!verify.ok||result.data?.status!=="success")return NextResponse.json({error:"Transaction verification failed."},{status:400});
  const {data:order}=await admin.from("orders").select("id,total_minor,currency,status").eq("provider_reference",reference).eq("payment_provider","paystack").maybeSingle();
  if(!order)return NextResponse.json({error:"Order reference not found."},{status:404});
  if(Number(result.data.amount)!==Number(order.total_minor)||result.data.currency!==order.currency)return NextResponse.json({error:"Payment amount or currency mismatch."},{status:400});
  const {data:items,error:itemsError}=await admin.from("order_items").select("seller_id,unit_price_minor,quantity").eq("order_id",order.id);
  if(itemsError)return NextResponse.json({error:"Could not load order sellers."},{status:500});
  const bps=Number(process.env.WORKNA_COMMISSION_BPS);if(!Number.isInteger(bps)||bps<0||bps>3000)return NextResponse.json({error:"Marketplace commission is not configured."},{status:503});
  const totals=new Map<string,number>();for(const item of items??[])totals.set(item.seller_id,(totals.get(item.seller_id)??0)+Number(item.unit_price_minor)*Number(item.quantity));
  const credits=[...totals].map(([seller_id,gross])=>{const fee=Math.floor(gross*bps/10000);return {user_id:seller_id,entry_type:"sale_credit",amount_minor:gross-fee,currency:order.currency,reference:"sale:"+order.id+":"+seller_id,related_order_id:order.id,description:"Confirmed sale earnings after marketplace commission"};});
  const commissions=[...totals].map(([seller_id,gross])=>{const fee=Math.floor(gross*bps/10000);return {order_id:order.id,seller_id,gross_amount_minor:gross,commission_minor:fee,currency:order.currency,reference:"commission:"+order.id+":"+seller_id};});
  if(credits.length){const {error}=await admin.from("wallet_ledger").upsert(credits,{onConflict:"reference",ignoreDuplicates:true});if(error)return NextResponse.json({error:"Could not record seller earnings."},{status:500});}
  if(commissions.length){const {error}=await admin.from("platform_ledger").upsert(commissions,{onConflict:"reference",ignoreDuplicates:true});if(error)return NextResponse.json({error:"Could not record marketplace commission."},{status:500});}
  if(order.status==="pending"){const {error}=await admin.from("orders").update({status:"paid"}).eq("id",order.id).eq("status","pending");if(error)return NextResponse.json({error:"Could not update order."},{status:500});}
  await admin.from("payment_events").upsert({provider:"paystack",provider_event_id:String(event.data.id??reference),event_type:event.event,payload:event,processed_at:new Date().toISOString()},{onConflict:"provider,provider_event_id",ignoreDuplicates:true});
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}