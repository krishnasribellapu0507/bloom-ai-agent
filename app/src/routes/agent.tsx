import { createServerFn } from "@tanstack/react-start";
import { BloomControlRoomIntro, BloomUtilityDock } from "@/components/bloom-control-room";
import "@/bloom-control-room.css";
import "@/forma-experience.css";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { preloadPuter, runPuterAgent } from "@/lib/puter-agent";
import { loadLearningFn, saveFeedbackFn, saveLearningRunFn } from "@/lib/forma-learning.functions";
import { FormaLearningStudio } from "@/components/forma-learning-studio";
import { DESIGN_DNA, createDesignBrief, auditInteractions } from "@/lib/design-dna";
import type { DesignMode, MotionLevel } from "@/lib/design-dna";
import { INTERACTIVE_SHOWCASE } from "@/lib/forma-demo";
import type { LearningSnapshot } from "@/components/forma-learning-studio";
import { Sparkles, Download, Monitor, Smartphone, ShieldCheck, Bot, BookOpen, ThumbsUp, ThumbsDown, MousePointer2, Layers3, Play, Zap, RotateCcw } from "lucide-react";

const executeAgent = createServerFn({method:"POST"}).inputValidator((d:{prompt:string;revision?:string;html?:string;designContext?:string}) => d).handler(async ({data}) => {
  const prompt=(data.prompt||"").trim();const designContext=(data.designContext||"").slice(0,9000);
  if(prompt.length<10||prompt.length>2400) throw Error("Describe the website in 10–2400 characters.");
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw Error("Online agent is deployed, but AI is not enabled yet. Configure OPENAI_API_KEY in the hosting site's Secrets settings.");
  const model=process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const steps:{phase:string;detail:string;status:string}[]=[];
  const log=(phase:string,detail:string,status="complete")=>steps.push({phase,detail,status});
  const ask=async (instructions:string,input:string,max_output_tokens=10500)=>{
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify({model,instructions,input,max_output_tokens})});
    const j=await r.json() as any;
    if(!r.ok) throw Error(j.error?.message || "Model request failed");
    return (j.output||[]).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==="output_text").map((c:any)=>c.text).join("\n").trim() as string;
  };
  log("01 · Understand","Brief parsed, goals and design constraints identified");
  const plan=await ask("You are an autonomous creative web developer. Output a concise 5-step execution plan, no markdown. Describe the site's structure, interactions, animation and 3D direction, responsive design, and checks.",prompt+'\nDesign director constraints: '+designContext,700);
  log("02 · Plan",plan.slice(0,650));
  const spec="Build ONE self-contained HTML document with embedded CSS and JavaScript. Output HTML ONLY beginning with <!DOCTYPE html>. Make it stunning, complete, mobile-responsive and technically plausible. Premium cinematic aesthetic, dark navy/cyan/lime unless user expressly requests otherwise; NEVER pink by default. Create real copy relevant to the brief, no invented endorsements. Use complex visual layouts, detailed sections, buttons and interactive JS. Include semantic main, nav, h1, meta description, CSS @media and working links. Real Anime.js animation may be imported from https://cdn.jsdelivr.net/npm/animejs@4.2.2/lib/anime.esm.min.js via type=module with import { animate, stagger, onScroll } or simply use native Web Animations API with graceful fallback. For interactive 3D, use Three.js via https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js and create actual interactive WebGL geometry; add Spline embed only if a real published Spline URL was supplied. Respect reduced motion and device memory. No fake testimonials or fake APIs. This page will be sandboxed in an iframe. No markdown fences. Include everything necessary.";
  let html=await ask(spec+"\nDESIGN PLAYBOOK:\n"+designContext,data.html? "Change request: "+prompt+"\nCurrent website:\n"+data.html.slice(0,60000):"Brief: "+prompt+"\nPlan: "+plan,12500);
  html=html.replace(/^\x60\x60\x60(?:html)?\s*/i,"").replace(/\s*\x60\x60\x60$/,"");
  log("03 · Build","Generated complete HTML/CSS/JS, visual system, responsive layout and interactive components");
  const audit=(s:string)=>({doctype:/<!doctype html/i.test(s),responsive:/@media/i.test(s),semantic:/<main\b/i.test(s),heading:/<h1\b/i.test(s),description:/name=["']description["']/i.test(s),closing:/<\/html>/i.test(s)});
  let checks=audit(html);
  const failures=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  log("04 · Audit",failures.length?"Found issues: "+failures.join(", "):"Six structural checks passed",failures.length?"needs-repair":"complete");
  if(failures.length){html=await ask(spec+" CRITICAL: FIX the failed audit checks: "+failures.join(", ")+".", "Improve this document without dropping its functionality:\n"+html.slice(0,60000),12500);html=html.replace(/^\x60\x60\x60(?:html)?\s*/i,"").replace(/\s*\x60\x60\x60$/,"");checks=audit(html);log("05 · Repair","Rewrote output and repeated structural audit");}
  const good=Object.values(checks).filter(Boolean).length;
  log("06 · Deliver","Website and execution trace ready; "+good+"/6 structural checks passed");
  return {html,steps,checks,score:Math.round(good/6*100),model};
});

function AgentPage(){
 const [prompt,setPrompt]=useState("Create a stunning futuristic AI robotics studio with a real interactive Three.js chrome sculpture, animated typography, cinematic transitions, services, project showcase and contact section. No pink.");
 const [html,setHtml]=useState("");
 const [trace,setTrace]=useState<{phase:string;detail:string;status:string}[]>([]);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 const [tab,setTab]=useState<"preview"|"code"|"activity"|"learning">("preview");
 const [mobile,setMobile]=useState(false);
 const [score,setScore]=useState<number|null>(null);
 const [model,setModel]=useState("");
 const [engine,setEngine]=useState<"puter"|"openai">("puter");
 const [designMode,setDesignMode]=useState<DesignMode>('cinema');
 const [motion,setMotion]=useState<MotionLevel>('immersive');
 const [exampleLoaded,setExampleLoaded]=useState(false);
 const [interactiveScore,setInteractiveScore]=useState<number|null>(null);
 const [learning,setLearning]=useState<LearningSnapshot>({items:[],preferences:'',feedback:[],runs:[]});
 const [learningError,setLearningError]=useState('');
 const [learningLoading,setLearningLoading]=useState(true);
 const [critique,setCritique]=useState('');
 const [rating,setRating]=useState<1|-1|null>(null);
 const [correction,setCorrection]=useState('');
 const [feedbackNotice,setFeedbackNotice]=useState('');
 const [feedbackBusy,setFeedbackBusy]=useState(false);
 async function reloadLearning(){try{const data=await loadLearningFn();setLearning(data);setLearningError('');}catch(e){setLearningError(e instanceof Error?e.message:'Could not load cloud learning library');}finally{setLearningLoading(false);}}
 function designMemory(){return [
    'Personal rules: '+learning.preferences,
    ...learning.items.slice(0,12).map(x=>'Reference '+x.title+': '+x.analysis.slice(0,1300)+' User notes: '+x.notes.slice(0,400)),
    ...learning.feedback.slice(0,12).map(x=>(x.rating===1?'Preferred approach':'Avoid repeating negative outcome')+' for '+x.prompt.slice(0,120)+': '+x.correction.slice(0,800)),
  ].filter(Boolean).join('\n').slice(0,9500);}
 async function submitFeedback(){if(rating===null)return;setFeedbackBusy(true);setFeedbackNotice('');try{await saveFeedbackFn({data:{rating,prompt,correction}});await reloadLearning();setFeedbackNotice('Feedback saved. Future websites will use this guidance.');setRating(null);setCorrection('');}catch(e){setFeedbackNotice(e instanceof Error?e.message:'Could not save feedback — sign in to Higgsfield.');}finally{setFeedbackBusy(false);}}
 useEffect(()=>{void reloadLearning();},[]);
 useEffect(() => { void preloadPuter().catch(() => undefined); }, []);
 async function run(revise=false){
  setError("");setPending(true);setCritique("");setFeedbackNotice("");
  setTrace([{phase:"Agent started",detail:"Analyzing the website brief",status:"running"}]);
  try {
   const memory=designMemory();const brief=createDesignBrief(designMode,motion);
   const r=engine==="puter"
     ? await runPuterAgent(prompt,revise?html:undefined,(next)=>setTrace(next),memory,designMode,motion)
     : await executeAgent({data:{prompt,designContext:brief+'\n'+memory,html:revise?html:undefined}});
   setHtml(r.html);setExampleLoaded(false);setInteractiveScore(auditInteractions(r.html,designMode).score);setTrace(r.steps);setScore(r.score);setModel(r.model);setTab("preview");if(window.innerWidth<821)window.setTimeout(()=>document.getElementById("forma-results")?.scrollIntoView({behavior:"smooth"}),80);setCritique('critique' in r && typeof r.critique==='string'?r.critique:'Structural audit completed.');
   try{await saveLearningRunFn({data:{prompt,score:r.score,critique:'critique' in r && typeof r.critique==='string'?r.critique:'Structural audit only'}});await reloadLearning();}catch(e){setLearningError('Generated website is ready, but cloud audit history could not be saved. Sign in to Higgsfield to enable persistent learning.');}
  }catch(e){
   const message=e instanceof Error?e.message:"Generation failed";
   setError(message);setTrace(a=>[...a,{phase:"Agent blocked",detail:message,status:"error"}]);
  }finally{setPending(false);}
 }
 function loadDemo(){setHtml(INTERACTIVE_SHOWCASE);setExampleLoaded(true);setModel('Built-in interactive example · not AI-generated');setScore(null);setInteractiveScore(auditInteractions(INTERACTIVE_SHOWCASE,designMode).score);setTab('preview');setTrace([{phase:'Reference demo',detail:'Loaded a hand-authored interactive site. Drag the orb, scroll, and filter cards. To create your own, press Run AI Agent.',status:'complete'}]);}
 function download(){if(!html)return;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([html],{type:"text/html"}));a.download="bloom-generated-site.html";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);}
 return <div className="forma-experience bloom-control-room">
   <header className="bloom-control-nav">
    <a href="/" className="bloom-control-logo" aria-label="BLOOM immersive homepage">BLOOM<span>.</span></a>
    <span className="bloom-control-nav-id">[ SYS: BL-001 ] &nbsp;AUTONOMOUS WEBSITE ENGINE</span>
    <nav aria-label="Agent sections"><a href="/">IMMERSIVE HOME ↗</a><a href="#workspace">WORKSPACE</a><button type="button" onClick={()=>{setTab('learning');document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'})}}>LEARNING STUDIO ↗</button></nav>
   </header>
   <BloomControlRoomIntro/>
   <BloomUtilityDock onLearning={()=>{setTab('learning');document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'})}} onPreview={()=>{setTab('preview');document.getElementById('forma-results')?.scrollIntoView({behavior:'smooth'})}}/>
   <section id="workspace" className="forma-studio-area">
     <div className="forma-workspace-intro bloom-workspace-heading">
       <div><div className="forma-kicker"><span>MODULE 01 /</span> THE INTERACTIVE ENGINE</div><h2>CREATIVE<br/><em>CONTROL.</em></h2></div>
       <p>One command center. Describe, direct and run your AI agent. Inspect the process, work in your preview, and make it yours.</p>
     </div>
   <div className="forma-layout">
    <aside className="forma-panel"><div className="bloom-panel-head"><span>[ B-01 ] / INPUT TERMINAL</span><span>● READY</span></div><span className="forma-chip">INPUT / REQUIREMENTS</span><h2 className="forma-title">DESCRIBE<br/>THE IDEA<span style={{color:'#ff4d00'}}>.</span></h2><p style={{color:"#9aabc0",fontSize:13,lineHeight:1.6}}>No template-picking required. BLOOM thinks, builds and improves. The website is the output; the agent does the work.</p>
    <label className="bloom-control-input-label">ENGINE SELECTOR / AI PROVIDER</label>
    <select aria-label="AI provider" value={engine} onChange={e=>setEngine(e.target.value as "puter"|"openai")} className="forma-input" style={{marginBottom:12,resize:"none",cursor:"pointer"}}>
      <option value="puter">Puter AI · no developer API key</option>
      <option value="openai">OpenAI server API key (optional)</option>
    </select>
    <p style={{fontSize:12,color:"#9aabc0",lineHeight:1.55,margin:"0 0 13px"}}>{engine==="puter"?"Uses your Puter account and monthly free allowance. Puter sign-in may open when you generate. Additional usage may cost money.":"Requires OPENAI_API_KEY in the hosting site's Secrets settings."}</p>
    <div style={{margin:'13px 0 12px'}}><div className="forma-chip" style={{marginBottom:11}}>DESIGN DIRECTOR / CHOOSE A DIRECTION</div><div className="forma-modes">
      {DESIGN_DNA.map(pack=><button key={pack.id} type="button" aria-pressed={designMode===pack.id} className={'forma-mode '+(designMode===pack.id?'selected':'')} onClick={()=>setDesignMode(pack.id)}><span className="forma-mode-top">{pack.tone}</span><strong>{pack.title}</strong><small>{pack.subtitle}</small></button>)}
    </div><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12,gap:8}}><label className="forma-metric" htmlFor="motion-level">MOTION INTENSITY</label><select id="motion-level" value={motion} onChange={e=>setMotion(e.target.value as MotionLevel)} className="forma-input" style={{width:'auto',minWidth:140,padding:'8px 10px',cursor:'pointer',resize:'none'}}><option value="immersive">Immersive</option><option value="balanced">Balanced</option><option value="subtle">Subtle</option></select></div></div>
    <textarea className="forma-input" rows={7} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(!pending)void run(false);}}} aria-label="Website brief"/>
    <div style={{display:"flex",gap:8,marginTop:13,flexWrap:"wrap"}}><button className="forma-btn forma-primary" disabled={pending} onClick={()=>run(false)}><Sparkles size={15} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>{pending?"Agent working…":"Run AI Agent"}</button><button className="forma-btn" disabled={pending||!html} onClick={()=>run(true)}>Refine ↗</button></div>
    <button className="forma-btn" style={{marginTop:16,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}} onClick={()=>setTab("learning")}><span><BookOpen size={15} style={{display:"inline",verticalAlign:"middle",marginRight:8}}/>TRAIN THE AGENT</span><span style={{color:"#c7fb63"}}>{learning.items.length} refs</span></button>
    <p className="forma-metric" style={{marginTop:8}}>{learningLoading?"Loading saved knowledge…":learningError?"Sign in to enable private cloud memory":"Preferences and feedback applied to future generations"}</p>
    <div style={{marginTop:16,borderTop:'1px solid #2c3e4d',paddingTop:15}}><span className="forma-chip" style={{fontSize:10}}>INTERACTION QUALITY GATE</span><p className="forma-metric">Checks scrolling, pointer behavior, reduced-motion support and working controls. Code-level signals, not a visual browser test.</p></div>
    <div style={{marginTop:22}}><span className="forma-chip">02 / EXECUTION TRACE</span><div className="forma-steps" style={{marginTop:15}}>{trace.length?trace.map((s,i)=><div className="forma-step" key={i}><strong style={{fontSize:13}}>{s.phase}</strong><p>{s.detail}</p></div>):<p className="forma-metric">Agent tools and decisions appear here after a run.</p>}</div></div>
    {error&&<p role="alert" style={{color:"#ff9b85",background:"#351d1d",padding:14,borderRadius:10,fontSize:13}}>{error}</p>}
    </aside>
    <main id="forma-results" className="forma-panel"><div className="bloom-panel-head"><span>[ B-02 ] / OUTPUT MONITOR</span><span>● {pending?"PROCESSING":"STANDBY"}</span></div><div className="forma-output-controls"><div><span className="forma-chip">{tab==="learning"?"04 / TRAINING WORKSPACE":"03 / DELIVERABLE"}</span><h2 className="forma-output-head">{tab==="learning"?"Learning Studio":"Agent output"} {score!==null&&<span style={{color:"#c7fb63",fontSize:14}}>· Audit {score}%</span>}</h2></div><div className="forma-output-tabs"><button className={"forma-btn "+(tab==="preview"?"active":"")} onClick={()=>setTab("preview")}>Preview</button><button className={"forma-btn "+(tab==="code"?"active":"")} onClick={()=>setTab("code")}>Code</button><button className={"forma-btn "+(tab==="activity"?"active":"")} onClick={()=>setTab("activity")}>Trace</button><button className={"forma-btn "+(tab==="learning"?"active":"")} onClick={()=>setTab("learning")}><BookOpen size={13} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/> Learning</button><button className="forma-btn" disabled={!html} onClick={download}><Download size={14}/></button></div></div>
    {tab==="learning"&&(learningError?<div style={{padding:25,border:"1px solid #735034",borderRadius:14}}><h3>Sign in to save your learning</h3><p style={{color:"#d5b99c"}}>{learningError}</p><a className="forma-btn forma-primary" href="/__auth/login?return=%2Fagent" style={{display:"inline-block",textDecoration:"none"}}>Sign in to Higgsfield</a><button className="forma-btn" onClick={()=>{setLearningLoading(true);void reloadLearning();}} style={{marginLeft:10}}>Retry</button></div>:<FormaLearningStudio data={learning} onReload={reloadLearning} onClose={()=>setTab("preview")}/>)}
    {tab==="preview"&&<><div className="forma-preview-top"><div className="forma-preview-dots"><i/><i/><i/></div><span>{html?(exampleLoaded?'Interactive sample — hand-authored (not AI-generated)':"AI-generated site · "+model):"INTERACTIVE STARTER EXPERIENCE · TRY DRAGGING & SCROLLING"}</span><button className="forma-btn" title="Toggle desktop or mobile preview" aria-label="Toggle desktop or mobile preview" onClick={()=>setMobile(!mobile)}>{mobile?<Monitor size={16}/>:<Smartphone size={16}/>}</button></div><div className="forma-preview-stage"><iframe title={html?'Website preview':'Interactive demo website'} className="forma-frame" style={{maxWidth:mobile?390:"100%"}} sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock" srcDoc={html||INTERACTIVE_SHOWCASE}/></div></>}
    {tab==="code"&&<><p className="forma-metric">Edit complete generated HTML below. Your edits update the preview immediately.</p><textarea aria-label="Generated HTML" className="forma-code" value={html} onChange={e=>setHtml(e.target.value)}/></>}
    {tab==="preview"&&<div className="forma-preview-notes"><div><span className="forma-chip">LIVE MOTION SHOWCASE</span><p className="forma-metric">The starter demo is hand-authored. Try dragging its orbit, scrolling and filtering work cards. Generate a fresh site to replace it.</p></div><button className="forma-btn" onClick={loadDemo}><Play size={14} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/> Load sample into editor</button>{interactiveScore!==null&&<span className="forma-chip">Interaction markers {interactiveScore}%</span>}</div>}
    {tab==="activity"&&<div style={{padding:18,minHeight:"60vh"}}>{trace.map((s,i)=><div className="forma-step" key={i}><strong>{s.phase}</strong><p>{s.detail}</p></div>)}{critique&&<section style={{padding:15,background:"#091825",borderRadius:10,whiteSpace:"pre-wrap",color:"#bad4ea"}}><strong>AI design critique</strong><p>{critique}</p></section>}</div>}
    {html&&tab!=="learning"&&<section style={{borderTop:"1px solid #293b4e",marginTop:16,paddingTop:16}}><strong>Teach BLOOM from this result</strong><p className="forma-metric">Rate this website and add a specific correction. Saved feedback guides future designs.</p><div style={{display:"flex",gap:8,marginTop:10}}><button aria-label="Like this design" className="forma-btn" style={{borderColor:rating===1?"#c7fb63":"#324559"}} onClick={()=>setRating(1)}><ThumbsUp size={15}/></button><button aria-label="Dislike this design" className="forma-btn" style={{borderColor:rating===-1?"#ff9b85":"#324559"}} onClick={()=>setRating(-1)}><ThumbsDown size={15}/></button></div><textarea className="forma-input" style={{marginTop:10}} rows={2} maxLength={1600} placeholder="Example: Increase 3D interactivity, use bolder typography, fix mobile navigation…" value={correction} onChange={e=>setCorrection(e.target.value)} aria-label="Design feedback and correction"/><button className="forma-btn forma-primary" disabled={feedbackBusy||rating===null} style={{marginTop:8}} onClick={submitFeedback}>Save feedback</button>{feedbackNotice&&<p role="status" style={{color:"#d5ffa0",fontSize:12}}>{feedbackNotice}</p>}{critique&&<details style={{marginTop:14,color:"#bad4ea",fontSize:12}}><summary>AI design review</summary><p style={{whiteSpace:"pre-wrap"}}>{critique}</p></details>}</section>}
    <div className="forma-output-footer"><ShieldCheck size={15}/>Isolated preview · Exportable HTML · Puter AI · free monthly allowance · user sign-in may be required</div>
    </main>
   </div>
   </section>
   <footer className="bloom-control-footer"><div><span>◼ BLOOM / THE CREATIVE OPERATING SYSTEM</span><span>NO TEMPLATES. NO SHORTCUTS. ONLY BETTER IDEAS.</span><a href="/">RETURN TO THREEUI SCENE ↑</a></div></footer>
 </div>;
}
export const Route=createFileRoute("/agent")({component:AgentPage});

