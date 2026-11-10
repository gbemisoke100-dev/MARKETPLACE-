import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
const money = (amount: number | null, currency = "NGN") => amount == null ? "Budget on discussion" : new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount / 100);
export default async function Jobs() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.from("jobs").select("id,title,description,category,budget_minor,currency,work_type,skills,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(60) : { data: [] };
  const jobs = data ?? [];
  return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link><Link href="/" className="back-link">← Back home</Link></header>
    <div className="catalog-content"><div className="section-kicker">02 / WORK & PROJECTS</div><h1>Find work that <em>matters.</em></h1><p>Open briefs published by clients. Apply to opportunities that fit your craft.</p>
      {jobs.length ? <div className="job-list">{jobs.map((job: any) => <article className="job-card" key={job.id}><div className="job-index">↗</div><div className="job-info"><span>{job.category} / {job.work_type}</span><h3>{job.title}</h3><p>{job.description?.slice(0, 180)}</p><small>{job.skills?.join(" · ")}</small></div><div className="job-rate"><strong>{money(job.budget_minor, job.currency)}</strong><Link href={`/jobs/${job.id}`}>View & apply ↗</Link></div></article>)}</div> : <div className="empty-catalog"><span className="empty-symbol">✳</span><div className="section-kicker">THE NEXT GREAT PROJECT STARTS HERE</div><h2>No open briefs yet.</h2><p>Every opportunity here is published by a real client. Join WORKNA to post your first project or build your freelancer profile.</p><Link href="/auth?mode=signup" className="button button-dark">Join WORKNA ↗</Link></div>}
    </div>
  </main>;
}