import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProposalForm from "@/components/proposal-form";
export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, supabase = await createClient();
  if (!supabase) notFound();
  const { data: job } = await supabase.from("jobs").select("id,title,description,category,budget_minor,currency,work_type,skills,created_at").eq("id", id).eq("status", "open").maybeSingle();
  if (!job) notFound();
  const budget = job.budget_minor == null ? "Budget on discussion" : new Intl.NumberFormat("en-NG", { style: "currency", currency: job.currency, maximumFractionDigits: 0 }).format(job.budget_minor / 100);
  return <main className="catalog-page"><header className="catalog-head"><Link href="/" className="brand"><span className="brand-mark">W</span><span>WORKNA<span className="brand-period">.</span></span></Link><Link href="/jobs" className="back-link">← All opportunities</Link></header>
    <div className="job-detail-layout"><article className="job-detail-copy"><div className="section-kicker">{job.category} / {job.work_type}</div><h1>{job.title}</h1><div className="job-detail-budget">{budget}</div><p>{job.description}</p><div className="job-detail-skills">{job.skills?.map((skill: string) => <span key={skill}>{skill}</span>)}</div><p className="demo-note">Only apply if your skills and availability match the brief. WORKNA never guarantees that a proposal will be accepted.</p></article><ProposalForm jobId={job.id} /></div>
  </main>;
}