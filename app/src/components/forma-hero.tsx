import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowDownRight, ArrowUpRight, MoveUpRight, MousePointer2 } from 'lucide-react';
import { BloomGetStartedButton } from './bloom-get-started-button';

/** Original real-time WebGL sculpture. No stock image, native Spline claim or pre-rendered placeholder. */
function OrbitSculpture(){
  const mount = useRef<HTMLDivElement>(null);
  const [webglFailed,setWebglFailed]=useState(false);
  useEffect(()=>{
    const el=mount.current; if(!el)return;
    const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});}catch{setWebglFailed(true);return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.48;
    el.appendChild(renderer.domElement);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.set(0,0,10.7);
    const holder=new THREE.Group();scene.add(holder);
    const green=new THREE.MeshPhysicalMaterial({color:'#c3f65a',metalness:.62,roughness:.23,clearcoat:1,clearcoatRoughness:.08,transmission:0.04,side:THREE.DoubleSide});
    const silver=new THREE.MeshPhysicalMaterial({color:'#dae3d7',metalness:1,roughness:.16,clearcoat:1});
    const black=new THREE.MeshPhysicalMaterial({color:'#101817',metalness:.8,roughness:.25,clearcoat:.6});
    const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(2.0,.59,250,24,3,7),green);
    knot.rotation.set(.5,-.28,-.15);holder.add(knot);
    const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(1.04,4),black); holder.add(orb);
    const rod=new THREE.Mesh(new THREE.TorusGeometry(2.62,.047,8,132),silver);rod.rotation.x=1.19;rod.rotation.z=.44;holder.add(rod);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.95,.014,7,132),silver);ring2.rotation.y=.93;ring2.rotation.x=.35;holder.add(ring2);
    const glow=new THREE.PointLight('#d9ff91',80,18,2);glow.position.set(4,4,7);scene.add(glow);
    const cool=new THREE.PointLight('#6f9a9d',45,18,2);cool.position.set(-5,-2,5);scene.add(cool);
    scene.add(new THREE.AmbientLight('#e9f6ef',1.4));
    const stars=210;const points=new Float32Array(stars*3);
    for(let i=0;i<stars;i++){const a=i*2.39996,r=3.9+((i*61)%97)/24;points[i*3]=Math.cos(a)*r;points[i*3+1]=Math.sin(a)*r;points[i*3+2]=-1.4+(i%7)*.16;}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(points,3));
    const dotsMat=new THREE.PointsMaterial({color:'#7f9688',size:.021,sizeAttenuation:true,transparent:true,opacity:.45});const dots=new THREE.Points(bg,dotsMat);scene.add(dots);
    let targetX=0,targetY=0, currentX=0,currentY=0,drag=false,oldX=0,rotationOffset=0,raf=0,visible=true;
    const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();holder.scale.setScalar(w<530?.73:1);};
    const obs=new ResizeObserver(resize);obs.observe(el);resize();
    const pointer=(ev:PointerEvent)=>{const r=el.getBoundingClientRect();if(drag){rotationOffset+=(ev.clientX-oldX)*.012;oldX=ev.clientX;}targetX=((ev.clientY-r.top)/Math.max(1,r.height)-.5)*.58;targetY=((ev.clientX-r.left)/Math.max(1,r.width)-.5)*1.0;};
    const down=(ev:PointerEvent)=>{drag=true;oldX=ev.clientX;el.setPointerCapture(ev.pointerId);};
    const up=()=>{drag=false;};
    el.addEventListener('pointermove',pointer);el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{threshold:0});io.observe(el);
    const clock=new THREE.Clock();
    const loop=()=>{raf=requestAnimationFrame(loop);if(!visible ||document.hidden)return;
      const elapsed=clock.getElapsedTime();const animate=!motionQuery.matches;
      currentX+=(targetX-currentX)*.05;currentY+=(targetY-currentY)*.05;
      holder.rotation.x=animate?Math.sin(elapsed*.18)*.08+currentX:0;
      holder.rotation.y=(animate?elapsed*.085:0)+currentY+rotationOffset;
      holder.rotation.z=animate?Math.sin(elapsed*.11)*.05:0;
      knot.rotation.y+=animate?.0004:0;
      renderer.render(scene,camera);
    };loop();
    return ()=>{cancelAnimationFrame(raf);io.disconnect();obs.disconnect();el.removeEventListener('pointermove',pointer);el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);
      knot.geometry.dispose();orb.geometry.dispose();rod.geometry.dispose();ring2.geometry.dispose();bg.dispose();green.dispose();silver.dispose();black.dispose();dotsMat.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className="forma-sculpture" ref={mount} aria-label="Interactive real-time 3D chrome and acid-lime torus knot sculpture. Drag to orbit." role="img">{webglFailed&&<div className="forma-hero-gl-fallback"><div className="forma-hero-fallback-ring"/><span>NO WEBGL / 001</span></div>}<span className="forma-hero-sculpture-label">01 — DRAG TO ROTATE <MousePointer2 size={12}/></span></div>;
}
export function FormaHero(){
  const hero=useRef<HTMLElement>(null);
  const [pos,setPos]=useState(0);
  useEffect(()=>{
    let raf=0;
    const track=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=hero.current?.getBoundingClientRect();if(r)setPos(Math.max(0,Math.min(1,-r.top/Math.max(1,r.height))));});};
    window.addEventListener('scroll',track,{passive:true});track();return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',track);};
  },[]);
  return <>
    <section className="forma-world-hero" ref={hero} id="top" style={{'--scroll-drift':`${pos*150}px`} as React.CSSProperties}>
      <div className="forma-hero-grid" aria-hidden="true"/>
      <div className="forma-hero-sidetext" aria-hidden="true">AN IDEA SHOULD FEEL LIKE SOMETHING.</div>
      <div className="forma-hero-topline"><span><i className="forma-signal"/>AUTONOMOUS CREATIVE ENGINE</span><span>EDITION / 2026</span></div>
      <div className="forma-hero-composition">
        <div className="forma-hero-left">
          <div className="forma-hero-label"><span className="forma-hero-index">001 /</span> THE NEW CREATIVE PROCESS</div>
          <h1 className="forma-hero-headline">BEYOND<br/><span className="forma-hero-headline-outline">THE</span><br/><em>ordinary.</em></h1>
          <div className="forma-hero-copy"><span className="forma-hero-copy-rule"/><div><p>Most AI makes another website.<br/><strong>BLOOM makes an experience.</strong></p><p>One brief. An autonomous agent. Intelligent design, real interactions, and work that refuses to look generated.</p></div></div>
          <div className="forma-hero-actions"><BloomGetStartedButton/><a href="#method" className="forma-hero-secondary-cta">EXPLORE THE PROCESS <ArrowDownRight size={17}/></a></div>
        </div>
        <div className="forma-hero-right"><div className="forma-hero-orbit-outline"/><OrbitSculpture/><div className="forma-hero-coordinate"><span>FIG 01 / THE BLOOM ENGINE</span><span>LIVE RENDER / WEBGL</span></div></div>
      </div>
      <div className="forma-hero-footer"><a href="#workspace" className="forma-hero-scroll"><span className="forma-downline"/>SCROLL TO ENTER THE AGENT</a><div>THE FUTURE IS NOT A TEMPLATE. <span>↗</span></div><span>THE BLOOM LAB — ALL RIGHTS RESERVED</span></div>
    </section>
    <div className="forma-marquee" aria-hidden="true"><div className="forma-marquee-track">BRIEF <span>✳</span> THINK <span>✳</span> BUILD <span>✳</span> MOVE <span>✳</span> REFINE <span>✳</span> REPEAT <span>✳</span> BRIEF <span>✳</span> THINK <span>✳</span> BUILD <span>✳</span> MOVE <span>✳</span> REFINE <span>✳</span> REPEAT <span>✳</span></div></div>
    <section className="forma-method" id="method"><div className="forma-method-intro"><div className="forma-kicker"><span>02 / </span> PROCESS, NOT PROMPTS</div><h2>It doesn’t stop<br/>at <i>generate.</i></h2><a href="#workspace" className="forma-text-link">MEET YOUR AGENT <MoveUpRight size={18}/></a></div><div className="forma-method-steps">{[
      ['01','UNDERSTAND','Your intention, your audience, your aesthetic.'],
      ['02','ARCHITECT','Layout, interaction, content and motion direction.'],
      ['03','EXECUTE','Build real code and a functioning preview.'],
      ['04','EVOLVE','Audit, improve, and remember your feedback.'],
    ].map(item=><div className="forma-method-step" key={item[0]}><span>{item[0]}</span><div><strong>{item[1]}</strong><p>{item[2]}</p></div><ArrowUpRight size={21}/></div>)}</div></section>
  </>;
}
