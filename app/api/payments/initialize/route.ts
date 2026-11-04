import {NextResponse} from "next/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import {createClient as createUserClient} from "@/lib/supabase/server";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
  const userClient=await createUserClient();
  if(!userClient)return NextResponse.json({error:"Marketplace backend is not configured."},{status:503});
  const {data:{user}}=await userClient.auth.getUser();
  if(!user)return NextResponse.json({error:"Sign in to continue."},{status:401});
  const {orderId,provider}=await request.json();
  if(typeof orderId!=="string"||!["paystack","flutterwave"].includes(provider))return NextResponse.json({error:"A valid order and payment provider are required."},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
  if(!url||!secret)return NextResponse.json({error:"Secure payment processing is not configured yet. Add the Supabase server secret in Vercel."},{status:503});
  const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:order,error}=await admin.from("orders").select("id,buyer_id,status,total_minor,currency").eq("id",orderId).eq("buyer_id",user.id).maybeSingle();
  if(error||!order)return NextResponse.json({error:"Order not found."},{status:404});
  if(order.status!=="pending"||order.total_minor<=0)return NextResponse.json({error:"This order is not payable."},{status:409});
  if(order.currency!=="NGN")return NextResponse.json({error:"This checkout is currently configured for NGN payments."},{status:400});
  const reference="mkt_"+crypto.randomUUID().replaceAll("-","");
  const site=process.env.NEXT_PUBLIC_SITE_URL||(process.env.VERCEL_URL? "https://"+process.env.VERCEL_URL:"https://marketplace-b0v5ultxz-gbemilabs-8940.vercel.app");
  let checkoutUrl="";
  if(provider==="paystack"){
   const key=process.env.PAYSTACK_SECRET_KEY;if(!key)return NextResponse.json({error:"Paystack is not configured yet."},{status:503});
   const response=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({email:user.email,amount:order.total_minor,currency:order.currency,reference,callback_url:site+"/checkout/return",metadata:{order_id:order.id,user_id:user.id}}),cache:"no-store"});
   const result=await response.json();if(!response.ok||!result.status||!result.data?.authorization_url)return NextResponse.json({error:result.message||"Paystack could not initialize checkout."},{status:502});checkoutUrl=result.data.authorization_url;
  }else{
   const key=process.env.FLUTTERWAVE_SECRET_KEY;if(!key)return NextResponse.json({error:"Flutterwave is not configured yet."},{status:503});
   const response=await fetch("https://api.flutterwave.com/v3/payments",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({tx_ref:reference,amount:(order.total_minor/100).toFixed(2),currency:order.currency,redirect_url:site+"/checkout/return",customer:{email:user.email},meta:{order_id:order.id,user_id:user.id}}),cache:"no-store"});
   const result=await response.json();if(!response.ok||result.status!=="success"||!result.data?.link)return NextResponse.json({error:result.message||"Flutterwave could not initialize checkout."},{status:502});checkoutUrl=result.data.link;
  }
  const {error:updateError}=await admin.from("orders").update({payment_provider:provider,provider_reference:reference}).eq("id",order.id).eq("status","pending");
  if(updateError)return NextResponse.json({error:"Could not attach the payment reference to the order."},{status:500});
  return NextResponse.json({checkoutUrl,reference});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Payment initialization failed."},{status:500});}
}