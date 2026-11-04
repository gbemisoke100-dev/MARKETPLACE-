import type {Metadata} from "next";
import {DM_Sans,Bodoni_Moda} from "next/font/google";
import "./globals.css";
const bodyFont=DM_Sans({subsets:["latin"],variable:"--font-body",display:"swap"});
const displayFont=Bodoni_Moda({subsets:["latin"],variable:"--font-display",display:"swap",weight:["400","500","600","700"]});
export const metadata:Metadata={title:"MARKETPLACE — Work, discover, move forward.",description:"A considered marketplace for exceptional talent and things worth finding.",metadataBase:new URL("https://marketplace-ejka5e2b3-gbemilabs-8940.vercel.app"),openGraph:{title:"MARKETPLACE",description:"Independent minds. Remarkable finds. One place.",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body></html>;}