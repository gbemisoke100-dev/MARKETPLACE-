import {NextResponse} from "next/server";
import {createClient as createAdminClient} from "@supabase/supabase-js";
import {createClient as createUserClient} from "@/lib/supabase/server";
export const runtime="nodejs";
export async function POST(request:Request){try{
 const userClient=await createUserClient();if(!userClient)return NextResponse.json({error:"WORKNA backend is not configured."},{status:503});
 const {data:{user}}=await userClient.auth.getUser();if(!user)return NextResponse.json({error:"Sign in before checkout."},{status:401});
 const body=await request.json();if(!Array.isArray(body.items))return NextResponse.json({error:"Cart items are required."},{status:400});
 const merged=new Map<string,number>();for(const item of body.items){if(typeof item?.product_id!=="string"||!Number.isInteger(item?.quantity)||item.quantity<1||item.quantity>50)return NextResponse.json({error:"Invalid cart item."},{status:400});merged.set(item.product_id,(merged.get(item.product_id)||0)+item.quantity);}
 if(merged.size>30||[...merged.values()].some(q=>q>50))return NextResponse.json({error:"Cart quantity limit exceeded."},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;if(!url||!secret)return NextResponse.json({error:"Secure order processing is not configured yet."},{status:503});
 const admin=createAdminClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data,error}=await admin.rpc("create_WORKNA_order",{p_buyer_id:user.id,p_items:[...merged].map(([product_id,quantity])=>({product_id,quantity}))});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({orderId:data});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not create order."},{status:500});}}