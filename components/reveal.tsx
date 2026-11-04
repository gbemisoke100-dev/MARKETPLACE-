"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
export function Reveal({children,delay=0,className=""}:{children:ReactNode;delay?:number;className?:string}) {
 const reduce=useReducedMotion();
 return <motion.div className={className} initial={reduce?false:{opacity:0,y:22,filter:"blur(8px)"}} whileInView={{opacity:1,y:0,filter:"blur(0px)"}} viewport={{once:true,amount:0.14}} transition={{duration:reduce?0:0.8,delay,ease:[0.22,1,0.36,1]}}>{children}</motion.div>;
}
export function PageMotion({children}:{children:ReactNode}) {
 const reduce=useReducedMotion();
 return <motion.div initial={reduce?false:{opacity:0}} animate={{opacity:1}} transition={{duration:reduce?0:0.55,ease:"easeOut"}}>{children}</motion.div>;
}