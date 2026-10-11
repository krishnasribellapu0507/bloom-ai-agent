/**
 * The published ThreeUI Sublevel Studio HTML is served as an authored,
 * in-project document under /landing-pages/bloom-studio.html, not as a
 * documentation-site embed. Its 0.160 Three.js scene, motion system,
 * DOM composition and original media are kept inside the document.
 * The copied current-version HTML has approved BLOOM-facing content edits.
 */
export function SublevelStudioLandingPage(){
 return <div className="bloom-sublevel-outer" style={{position:'fixed',inset:0,background:'#000'}}>
   <a href="/agent" aria-label="Open BLOOM AI Agent" className="bloom-enter-agent" style={{position:'fixed',zIndex:5000,bottom:'clamp(14px,4vw,42px)',right:'clamp(12px,4vw,42px)',background:'#cdf47b',color:'#131d0c',textDecoration:'none',padding:'16px 20px',fontFamily:'monospace',fontSize:'12px',fontWeight:800,letterSpacing:'0.02em',boxShadow:'0 20px 55px #000b',border:'1px solid #e5ffc4',display:'inline-flex',alignItems:'center',gap:12,minHeight:48}}>OPEN BLOOM AGENT <span aria-hidden="true">↗</span></a>
   <iframe
     title="BLOOM immersive creative studio — interactive WebGL experience"
     src="/landing-pages/bloom-studio.html"
     sandbox="allow-scripts allow-top-navigation-by-user-activation allow-forms allow-downloads allow-modals allow-popups"
     loading="eager"
     style={{display:'block',width:'100%',height:'100%',border:0,background:'#000'}}
   />
 </div>;
}
