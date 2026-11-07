"use client";
import {useEffect,useState} from "react";
type Theme="dark"|"light";
export default function ThemeControl(){
 const [theme,setTheme]=useState<Theme>("dark");
 useEffect(()=>{const saved=window.localStorage.getItem("marketplace-theme");const next:Theme=saved==="light"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;},[]);
 function toggle(){const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;window.localStorage.setItem("marketplace-theme",next);}
 return <button type="button" className="theme-control" onClick={toggle} aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"} title={theme==="dark"?"Switch to light mode":"Switch to dark mode"}><span className="theme-control-icon">{theme==="dark"?"☼":"◐"}</span><span>{theme==="dark"?"Light mode":"Dark mode"}</span></button>;
}