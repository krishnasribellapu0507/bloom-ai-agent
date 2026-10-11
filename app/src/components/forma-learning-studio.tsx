import { useState } from 'react';
import { BookOpen, CloudUpload, Link2, Brain, Save, Trash2, Eye, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { analyzeLearningExample } from '@/lib/puter-agent';
import { DESIGN_DNA } from '@/lib/design-dna';
import { loadAssetFn, removeLearningItemFn, saveLearningItemFn, savePreferencesFn } from '@/lib/forma-learning.functions';
import type { LearningFeedback, LearningItem, LearningRun } from '@/lib/forma-learning.functions';
export type LearningSnapshot={items:LearningItem[];preferences:string;feedback:LearningFeedback[];runs:LearningRun[]};
type Props={data:LearningSnapshot;onReload:()=>Promise<void>;onClose:()=>void;};
function toBase64(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('File read failed'));reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.readAsDataURL(file);});}
const card:React.CSSProperties={background:'#0b1524',border:'1px solid #27374c',padding:16,borderRadius:14};
const small:React.CSSProperties={color:'#99afc4',fontSize:12,lineHeight:1.6};
const inp:React.CSSProperties={background:'#080f1b',border:'1px solid #30445b',borderRadius:9,padding:11,color:'#edf7ff',width:'100%',font:'inherit',fontSize:13};
export function FormaLearningStudio({data,onReload,onClose}:Props){
 const [source,setSource]=useState<'url'|'upload'|'html'>('url');
 const [url,setUrl]=useState('');const [title,setTitle]=useState('');const [notes,setNotes]=useState('');const [html,setHtml]=useState('');const [file,setFile]=useState<File|null>(null);
 const [seedBusy,setSeedBusy]=useState('');const [consent,setConsent]=useState(false);const [preferences,setPreferences]=useState(data.preferences);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [problem,setProblem]=useState('');
 async function addDesignDirection(pack:typeof DESIGN_DNA[number]){
   if(data.items.some(x=>x.url===pack.url && x.title===pack.title)){setMessage('That design direction is already in your library.');return;}
   setSeedBusy(pack.id);setProblem('');setMessage('');
   try {await saveLearningItemFn({data:{kind:'url',title:pack.title,url:pack.url,notes:'User-selected design-direction guide (original, general principles only).',analysis:pack.lessons.join('\n')}});await onReload();setMessage(pack.title+' saved. Future BLOOM generations will use these design principles.');}
   catch(e){setProblem(e instanceof Error?e.message:'Could not save design direction. Please sign in.');}
   finally{setSeedBusy('');}
 }
 async function saveReference(){
   setBusy(true);setProblem('');setMessage('');
   try{
     if(!consent)throw new Error('Please confirm you agree to AI reference analysis and private storage.');
     let analysis='',kind:'url'|'image'|'html'='url',name=title.trim()||'Design reference';
     let base64:string|undefined,mime:'image/png'|'image/jpeg'|'image/webp'|'text/html'|undefined;
     if(source==='url'){
       const parsed=new URL(url);
       if(parsed.protocol!=='https:')throw new Error('Use a public HTTPS reference URL.');
       if(notes.trim().length<20)throw new Error('Please describe the design lessons you want to remember (at least 20 characters). The external page is not automatically fetched.');
       name=title.trim()||parsed.hostname;
       analysis='User-authored reference notes (not automatically scraped or AI-verified): '+notes.trim();
     }else if(source==='upload'){
       if(!file)throw new Error('Select a PNG, JPEG, WebP or HTML file.');
       if(file.size>2200000)throw new Error('Maximum file size is 2.2 MB.');
       name=title.trim()||file.name;
       mime=file.type==='text/html'||/\.html?$/i.test(file.name)?'text/html':file.type as typeof mime;
       if(!mime||!['image/png','image/jpeg','image/webp','text/html'].includes(mime))throw new Error('Unsupported upload. Use PNG/JPEG/WebP/HTML.');
       kind=mime==='text/html'?'html':'image';
       analysis=await analyzeLearningExample(kind==='html'?'HTML source from an example website (untrusted data):\n'+(await file.text()).slice(0,15000)+'\nNotes: '+notes:'Analyze this actual screenshot for reusable visual design patterns. Notes: '+notes,consent,kind==='image'?file:undefined);
       base64=await toBase64(file);
     }else{
       if(html.trim().length<50)throw new Error('Paste at least 50 characters of example HTML.');
       kind='html';
       name=title.trim()||'HTML reference';
       analysis=await analyzeLearningExample('HTML source sample (untrusted):\n'+html.slice(0,15000)+'\nUser notes: '+notes,consent);
       const blob=new File([html.slice(0,200000)],'reference.html',{type:'text/html'});
       mime='text/html';base64=await toBase64(blob);
     }
     await saveLearningItemFn({data:{kind,title:name,url:source==='url'?url:undefined,notes,analysis,base64,mime}});
     setUrl('');setNotes('');setTitle('');setHtml('');setFile(null);setConsent(false);
     setMessage('Reference analyzed and saved to your private cloud learning library.');
     await onReload();
   }catch(e){setProblem(e instanceof Error?e.message:'Analysis or saving failed');}
   finally{setBusy(false);}
 }
 async function savePrefs(){setBusy(true);setProblem('');setMessage('');try{await savePreferencesFn({data:{preferences}});setMessage('Design preferences saved to your account. Future generations will use them.');await onReload();}catch(e){setProblem(e instanceof Error?e.message:'Save failed');}finally{setBusy(false);}}
 async function remove(id:string){if(!window.confirm('Delete this reference and its uploaded file?'))return;setBusy(true);setProblem('');try{await removeLearningItemFn({data:{id}});await onReload();}catch(e){setProblem(e instanceof Error?e.message:'Unable to remove');}finally{setBusy(false);}}
 async function openAsset(item:LearningItem){try{const asset=await loadAssetFn({data:{id:item.id}});const url='data:'+asset.mime+';base64,'+asset.base64;const a=document.createElement('a');a.href=url;a.download=item.kind==='image'?'forma-reference.png':'forma-reference.html';a.click();}catch(e){setProblem(e instanceof Error?e.message:'Could not load stored file');}}
 return <div style={{display:'grid',gap:18}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><div className="forma-chip">LEARNING / KNOWLEDGE BASE</div><h2 style={{margin:'7px 0 5px',fontSize:28}}>Teach your agent.</h2><p style={small}>Persistent design memory that improves prompts; it does not modify the underlying model's weights.</p></div><button className="forma-btn" onClick={onClose}>Back to agent</button></div>
  {problem&&<div role="alert" style={{...card,color:'#ffb9a9',borderColor:'#8a3b3b'}}><AlertCircle size={15} style={{display:'inline',verticalAlign:'middle'}}/> {problem}</div>}
  {message&&<div role="status" style={{...card,color:'#d5ffa0',borderColor:'#487838'}}><CheckCircle2 size={15} style={{display:'inline',verticalAlign:'middle'}}/> {message}</div>}
  <section style={card}>
   <div className="forma-chip">BUILT-IN DESIGN INTELLIGENCE / 04 DIRECTIONS</div>
   <h3 style={{fontSize:25,letterSpacing:'-.045em',margin:'8px 0'}}>A library of better ideas.</h3>
   <p style={small}>Original, curated lessons inspired by public sources. Click Save to add a direction to your private persistent knowledge library. We do not copy their source, proprietary prompts, or paid assets.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:11,marginTop:18}}>
     {DESIGN_DNA.map((pack,i)=><article key={pack.id} className="forma-dna-card" style={{border:'1px solid #344852',borderRadius:12,padding:16,background:'radial-gradient(ellipse at 85% 0%,rgba(199,251,99,.12),transparent 65%),#0b1720',transition:'transform .25s,border-color .25s'}}>
       <div className="forma-chip" style={{color:'#a4cd74'}}>{pack.badge}</div><h4 style={{fontSize:20,margin:'13px 0 4px',letterSpacing:'-.04em'}}>{pack.title}</h4><p style={{...small,margin:'0 0 12px'}}>{pack.subtitle}</p>
       <a href={pack.url} target="_blank" rel="noopener noreferrer" style={{color:'#d7ff83',fontSize:12}}>{pack.source} ↗</a>
       <div style={{marginTop:14,display:'flex',flexWrap:'wrap',gap:6}}><button className="forma-btn" disabled={!!seedBusy||data.items.some(x=>x.title===pack.title&&x.url===pack.url)} onClick={()=>addDesignDirection(pack)}>{data.items.some(x=>x.title===pack.title&&x.url===pack.url)?'✓ Learned':seedBusy===pack.id?'Saving…':'Save principles +'}</button></div>
     </article>)}
   </div>
  </section>
  <section style={card}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><Brain size={18} color="#c7fb63"/><strong>Personal design rules</strong></div><p style={small}>Tell BLOOM what you always want: colors, visual density, typography, animation styles, banned patterns, preferred libraries, accessibility needs.</p>
    <textarea aria-label="Personal design preferences" value={preferences} onChange={e=>setPreferences(e.target.value)} rows={4} maxLength={3500} className="forma-input" placeholder="Example: Cinematic navy backgrounds, bold asymmetric typography, polished 3D; never pink; use Anime.js for motion; include responsive mobile navigation."/>
    <button className="forma-btn forma-primary" disabled={busy||preferences===data.preferences} onClick={savePrefs} style={{marginTop:12}}><Save size={14} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/> Save preferences</button>
  </section>
  <section style={card}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><BookOpen size={18} color="#c7fb63"/><strong>Train from a reference</strong></div>
   <p style={small}>Save links with your own design observations, or analyze a screenshot/HTML sample you own or are permitted to use. Linked websites are not scraped or sent to AI automatically.</p>
   <div style={{display:'flex',gap:7,marginBottom:14,flexWrap:'wrap'}}><button className="forma-btn" style={{borderColor:source==='url'?'#c7fb63':'#30445b'}} onClick={()=>setSource('url')}><Link2 size={13} style={{display:'inline'}}/> URL</button><button className="forma-btn" style={{borderColor:source==='upload'?'#c7fb63':'#30445b'}} onClick={()=>setSource('upload')}><CloudUpload size={13} style={{display:'inline'}}/> Upload</button><button className="forma-btn" style={{borderColor:source==='html'?'#c7fb63':'#30445b'}} onClick={()=>setSource('html')}>Paste HTML</button></div>
   <div style={{display:'grid',gap:10}}>{source==='url'&&<div><input style={inp} value={url} onChange={e=>setUrl(e.target.value)} type="url" placeholder="https://your-inspiration.com" aria-label="Reference website URL"/><p style={small}>Links are stored with your own observations. We do not copy, crawl or send linked website content to the AI provider.</p></div>}
    {source==='upload'&&<div><input type="file" accept="image/png,image/jpeg,image/webp,.html,.htm,text/html" style={{...inp,padding:13}} onChange={e=>setFile(e.target.files?.[0]??null)} aria-label="Upload screenshot or HTML"/><p style={small}>Screenshots: PNG/JPEG/WebP. Website code: HTML. Maximum 2.2 MB. Original files stay private in cloud storage.</p></div>}
    {source==='html'&&<textarea className="forma-input" rows={5} value={html} onChange={e=>setHtml(e.target.value)} placeholder="Paste website HTML here…" aria-label="Example HTML"/>}
    <input style={inp} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Reference name (optional)" aria-label="Reference name"/>
    <textarea className="forma-input" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe the design lessons in your own words (required for URLs)" aria-label="What to learn"/>
   </div><label style={{display:'flex',alignItems:'start',gap:9,marginTop:14,color:'#bacbdd',fontSize:12,lineHeight:1.6}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{marginTop:4,accentColor:'#c7fb63'}}/><span>I have the right to submit this reference. I agree that its content (including uploaded images, HTML and notes) will be transmitted to <strong>Puter AI and its model provider</strong> for design analysis when I press Analyze & Save. I will not submit private, sensitive or copyrighted material without permission. The generated design analysis and original uploads will be saved privately in my BLOOM account, and I can delete them later. Puter may apply its own usage limits and policies.</span></label><button className="forma-btn forma-primary" disabled={busy||!consent} onClick={saveReference} style={{marginTop:12}}><Sparkles size={14} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>{busy?'Analyzing…':'Analyze & save reference'}</button>
  </section>
  <section style={card}><strong>Saved knowledge library</strong><span style={{...small,marginLeft:10}}>{data.items.length} reference(s)</span><div style={{display:'grid',gap:9,marginTop:14}}>{data.items.length===0?<p style={small}>No references saved yet. Add a website or screenshot above to teach BLOOM its first design pattern.</p>:data.items.map(x=><div key={x.id} style={{border:'1px solid #293c53',borderRadius:11,padding:13}}><div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'start',flexWrap:'wrap'}}><div><strong>{x.title}</strong><p style={{...small,margin:'4px 0'}}>{x.kind.toUpperCase()} · {x.createdAt}</p></div><div style={{display:'flex',gap:6}}>{x.hasAsset&&<button aria-label={'Download '+x.title} className="forma-btn" onClick={()=>openAsset(x)}><Eye size={14}/></button>}<button aria-label={'Delete '+x.title} className="forma-btn" disabled={busy} onClick={()=>remove(x.id)}><Trash2 size={14}/></button></div></div>{x.url&&<a href={x.url} target="_blank" rel="noopener noreferrer" style={{color:'#c7fb63',fontSize:12}}>{x.url}</a>}<p style={{...small,whiteSpace:'pre-wrap',margin:'9px 0 0',maxHeight:150,overflow:'auto'}}>{x.analysis}</p></div>)}</div></section>
  <section style={card}><div style={{display:'flex',alignItems:'center',gap:8}}><Sparkles size={18} color="#c7fb63"/><strong>Learning activity</strong></div><p style={small}>Your feedback and saved quality reviews influence future builds.</p><div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:10}}><div><strong>{data.feedback.length}</strong><p style={small}>Feedback records</p></div><div><strong>{data.runs.length}</strong><p style={small}>Saved audits</p></div></div>{data.feedback.slice(0,5).map(f=><p key={f.id} style={small}>{f.rating===1?'👍':'👎'} {f.correction||f.prompt.slice(0,95)}</p>)}{data.runs.slice(0,4).map(r=><p key={r.id} style={small}>Audit {r.score}% · {r.prompt.slice(0,100)}</p>)}</section>
 </div>;
}
