import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request:Request){
 const signature=request.headers.get("verif-hash"),expected=process.env.FLUTTERWAVE_SECRET_HASH,key=process.env.FLUTTERWAVE_SECRET_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,dbSecret=process.env.SUPABASE_SECRET_KEY;
 if(!signature||!expected||!key||!url||!dbSecret)return NextResponse.json({error:"Webhook is not configured."},{status:503});
 if(signature!==expected)return NextResponse.json({error:"Invalid signature."},{status:401});
 try{
  const event=await request.json();if(event.event!=="charge.completed"||event.data?.status!=="successful")return NextResponse.json({received:true});
  const transactionId=event.data?.id;if(!transactionId)return NextResponse.json({error:"Missing transaction ID."},{status:400});
  const response=await fetch("https://api.flutterwave.com/v3/transactions/"+encodeURIComponent(String(transactionId))+"/verify",{headers:{Authorization:"Bearer "+key},cache:"no-store"});
  const verified=await response.json();const tx=verified.data;
  if(!response.ok||verified.status!=="success"||tx?.status!=="successful")return NextResponse.json({error:"Transaction verification failed."},{status:400});
  const admin=createClient(url,dbSecret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:order}=await admin.from("orders").select("id,total_minor,currency,status").eq("provider_reference",tx.tx_ref).eq("payment_provider","flutterwave").maybeSingle();
  if(!order)return NextResponse.json({error:"Order reference not found."},{status:404});
  if(Math.round(Number(tx.amount)*100)!==Number(order.total_minor)||tx.currency!==order.currency)return NextResponse.json({error:"Payment amount or currency mismatch."},{status:400});
  if(order.status==="pending"){const {error}=await admin.from("orders").update({status:"paid"}).eq("id",order.id).eq("status","pending");if(error)return NextResponse.json({error:"Could not update order."},{status:500});}
  await admin.from("payment_events").insert({provider:"flutterwave",provider_event_id:String(transactionId),event_type:event.event,payload:event,processed_at:new Date().toISOString()});
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}