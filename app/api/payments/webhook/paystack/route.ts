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
  const event=JSON.parse(raw);if(event.event!=="charge.success")return NextResponse.json({received:true});
  const reference=event.data?.reference;if(typeof reference!=="string")return NextResponse.json({error:"Missing reference."},{status:400});
  const verify=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{Authorization:"Bearer "+secret},cache:"no-store"});
  const result=await verify.json();if(!verify.ok||result.data?.status!=="success")return NextResponse.json({error:"Transaction verification failed."},{status:400});
  const admin=createClient(url,dbSecret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:order}=await admin.from("orders").select("id,total_minor,currency,status").eq("provider_reference",reference).eq("payment_provider","paystack").maybeSingle();
  if(!order)return NextResponse.json({error:"Order reference not found."},{status:404});
  if(Number(result.data.amount)!==Number(order.total_minor)||result.data.currency!==order.currency)return NextResponse.json({error:"Payment amount or currency mismatch."},{status:400});
  if(order.status==="pending"){const {error}=await admin.from("orders").update({status:"paid"}).eq("id",order.id).eq("status","pending");if(error)return NextResponse.json({error:"Could not update order."},{status:500});}
  await admin.from("payment_events").insert({provider:"paystack",provider_event_id:String(event.data.id??reference),event_type:event.event,payload:event,processed_at:new Date().toISOString()});
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}