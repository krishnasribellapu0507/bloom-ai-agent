import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight, CircleDot, Command, Sparkles } from 'lucide-react';

/** Lightweight original canvas-based kinetic pattern for the BLOOM operating system. */
function SignalField(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,visible=true,width=0,height=0,dpr=1;
  const pointer={x:.5,y:.5};
  const resize=()=>{const r=canvas.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);width=r.width;height=r.height;canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));};
  const move=(event:PointerEvent)=>{const r=canvas.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width;pointer.y=(event.clientY-r.top)/r.height;};
  const obs=new ResizeObserver(resize);obs.observe(canvas);resize();canvas.addEventListener('pointermove',move);
  const io=new IntersectionObserver((entries)=>{visible=entries[0]?.isIntersecting??true;});io.observe(canvas);
  const render=(time:number)=>{
   frame=requestAnimationFrame(render);
   if(!visible||document.hidden||!width||!height)return;
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
   ctx.fillStyle='#060707';ctx.fillRect(0,0,width,height);
   const cols=Math.max(16,Math.min(58,Math.ceil(width/15))),rows=Math.ceil(cols*height/width*.72);
   const t=mq.matches?0:time*.00065;
   for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const x=(i+.5)*width/(cols+1),y=(j+.5)*height/(rows+1);
    const dist=Math.hypot(x/width-pointer.x,y/height-pointer.y);
    const z=Math.sin(i*.24+j*.35-t*1.7)*.5+Math.sin(i*.14-t*.8)*.5;
    const a=Math.min(.95,Math.max(.1,.35+z*.24+Math.max(0,1-dist*2.5)*.52));
    ctx.fillStyle=(i+j)%27===0?`rgba(255,80,30,${a})`:`rgba(238,241,231,${a})`;
    ctx.beginPath();ctx.arc(x,y+z*(mq.matches?0:7),Math.max(.6,1.1+(z+1)*.8+(1-dist)*.35),0,Math.PI*2);ctx.fill();
   }
  };frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);obs.disconnect();io.disconnect();canvas.removeEventListener('pointermove',move);};
 },[]);
 return <canvas className="bloom-control-field" ref={ref} aria-label="Live animated monochrome particle field that responds to pointer movement" role="img"/>;
}

export function BloomControlRoomIntro(){
 return <section className="bloom-control-intro" id="top">
   <div className="bloom-control-meta"><span><i className="bloom-status-light"/> BLOOM / CREATIVE OPERATING SYSTEM</span><span>VERSION 02.6.0 — LIVE WORKSPACE</span></div>
   <div className="bloom-control-hero-grid">
     <div className="bloom-control-copy">
       <span className="bloom-control-label">0001 / THE WORKSPACE</span>
       <h1>MAKE<br/>SOMETHING<br/><em>UNREAL.</em></h1>
       <p>Human imagination in. Interactive code out. Plan, build, review, refine—without the ordinary template look.</p>
       <div className="bloom-control-hero-actions"><a href="#workspace" className="bloom-control-cta">INITIATE BUILD <ArrowUpRight size={18}/></a><a href="/" className="bloom-control-underlink">EXPLORE 3D STUDIO <ArrowDownRight size={15}/></a></div>
     </div>
     <div className="bloom-control-visual"><SignalField/><div className="bloom-visual-top"><span>VISUAL // GENERATIVE</span><span>[ LIVE ]</span></div><div className="bloom-control-visual-center"><span>001 / STUDIO ENGINE</span><strong>BLOOM<span className="bloom-red-dot">.</span></strong><span>THE NEXT THING BEGINS HERE.</span></div><div className="bloom-control-visual-bottom">[ X / POINTER ] &nbsp; [ Y / MOTION ] &nbsp; [ Z / IDEAS ]</div></div>
   </div>
   <div className="bloom-control-index"><div><span>01</span> DESCRIBE YOUR IDEA</div><div><span>02</span> DIRECT THE DESIGN</div><div><span>03</span> BUILD & ITERATE</div><div><span>04</span> EXPORT THE RESULT</div></div>
  </section>;
}

export function BloomUtilityDock({onLearning,onPreview}:{onLearning:()=>void;onPreview:()=>void}){
 return <nav aria-label="BLOOM floating utility dock" className="bloom-utility-dock">
   <a href="/" title="Immersive ThreeUI homepage"><span className="bloom-dock-key">01</span><CircleDot size={17}/><span>SCENE</span></a>
   <a href="#workspace" title="AI agent workspace"><span className="bloom-dock-key">02</span><Command size={16}/><span>AGENT</span></a>
   <button type="button" title="Open Learning Studio" onClick={onLearning}><span className="bloom-dock-key">03</span><Sparkles size={15}/><span>LEARN</span></button>
   <button type="button" title="Open live preview" onClick={onPreview}><span className="bloom-dock-key">04</span><ArrowUpRight size={17}/><span>OUTPUT</span></button>
   <span className="bloom-dock-status"><i/> ONLINE</span>
  </nav>;
}
