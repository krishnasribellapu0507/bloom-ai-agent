// Publicly described design approaches distilled into ORIGINAL BLOOM guidance.
// No copied component code, imagery, premium templates, or proprietary prompts.
export const DESIGN_DNA = [
  {id:'cinema', title:'SCROLL CINEMA', source:'Scrolltide', url:'https://www.scrolltide.co/', subtitle:'Scroll-driven visual storytelling', badge:'01 / DIRECTION', tone:'Cinematic', lessons:[
    'Create a dramatic opening frame with a genuine visual focal point, not a standard SaaS hero.',
    'Treat scroll as a timeline: vary scale, mask, reveal and horizontal offset across distinct sections; avoid repetitive fade-up animations.',
    'Implement working scroll progress, section choreography and sticky scenes with IntersectionObserver or performant scroll timelines.',
    'Set explicit interaction moments and build graceful non-JavaScript and reduced-motion fallbacks.'
  ]},
  {id:'dimension',title:'DIMENSION LAB',source:'ThreeUI',url:'https://threeui.com/browse',subtitle:'WebGL objects with real interaction',badge:'02 / INTERACTION',tone:'3D',lessons:[
    'Use an intentional procedural 3D hero made of real lit geometry with pointer orbit / drag response, not a static gradient masquerading as 3D.',
    'Prefer Three.js with camera, lights, shadows, depth, material response and proper resize/dispose logic; provide a graphic fallback.',
    'Experiment with physically inspired glass, liquid metal, distortion or shader surfaces when appropriate to the brand.',
    'Keep interaction tied to meaning: hover reveals information, drag rotates a product, scroll alters a scene state. Ensure touch input works.'
  ]},
  {id:'taste',title:'ANTI-SLOP CRAFT',source:'Taste Skill',url:'https://www.tasteskill.dev/',subtitle:'Art direction above boilerplate',badge:'03 / CRAFT',tone:'Editorial',lessons:[
    'Infer the brand, audience, content hierarchy and emotional direction before choosing colors or layout.',
    'Never produce the default AI startup pattern: centered gradient headline, three interchangeable feature cards and random purple glow.',
    'Commit to one coordinated color story, one corner-radius system and intentional type hierarchy; vary compositions between projects.',
    'Audit every button, image, text line and interaction for purpose, mobile hierarchy, spacing, contrast and visual consistency.',
    'Prefer real substantial copy and accessible functional controls over empty design spectacle.'
  ]},
  {id:'components',title:'COMPONENT ATELIER',source:'21st.dev',url:'https://21st.dev/',subtitle:'Beautiful functional interface systems',badge:'04 / SYSTEMS',tone:'Components',lessons:[
    'Design a coherent system of navigation, menus, tabs, galleries, dialogs and kinetic typography with true interactive states.',
    'Construct high-craft UI details: tactile controls, shimmer only when helpful, meaningful cards, layouts and microinteractions.',
    'Use original components and interaction patterns rather than copying paid/community-authored source code.',
    'Every interactive component must have working JavaScript, clear focus states, keyboard/touch support and responsive layout.'
  ]}
] as const;
export type DesignMode='auto'|'cinema'|'dimension'|'taste'|'components';
export type MotionLevel='balanced'|'immersive'|'subtle';
export function createDesignBrief(mode:DesignMode, motion:MotionLevel):string{
 const selected=DESIGN_DNA.find(x=>x.id===mode);
 const motionNotes=motion==='immersive'?'High motion: plan at least three coordinated animations including scroll-driven choreography, one tactile interactive control and depth or WebGL if relevant.':motion==='subtle'?'Subtle motion: precise elegant entrances and tactile hover, avoid perpetual motion or expensive WebGL unless essential.':'Balanced motion: one hero interaction, scroll choreography and restrained microinteraction.';
 return [
  'DESIGN QUALITY STANDARD (inspired by public high-level techniques from Scrolltide, ThreeUI, Taste Skill, 21st.dev; do not clone their site, source, assets or premium templates):',
  ...DESIGN_DNA.flatMap(x=>x.lessons.slice(0,2)),
  selected?'PRIMARY DESIGN DIRECTION: '+selected.title+'\n'+selected.lessons.join('\n'):'Select ONE original visual art direction specific to the user, not a preset default.',
  motionNotes,
  'Before implementing, decide a visual concept, signature interaction, layout system, type system, component set and motion timeline.',
  'Output working code, not a static mockup: sticky storytelling/scroll state where justified, pointer and touch response, navigation and controls that act.',
  'Respect prefers-reduced-motion, keyboard focus, touch behavior, device pixel ratio, requestAnimationFrame cleanup and responsive performance.',
  'NEVER claim native editable Spline creation. Embed only a Spline URL actually provided by the user.'
 ].join('\n');
}
export function auditInteractions(html:string,mode:DesignMode){
 const found={
  animation:/@keyframes|\.animate\s*\(|requestAnimationFrame|\banime\s*\(/i.test(html),
  responsive:/@media|matchMedia/i.test(html),
  scroll:/IntersectionObserver|addEventListener\s*\(\s*['"]scroll|ScrollTrigger|animation-timeline/i.test(html),
  pointer:/pointermove|mousemove|touchmove|pointerdown|touchstart|:hover/i.test(html),
  reducedMotion:/prefers-reduced-motion/i.test(html),
  threeD:/\bTHREE\b|from\s+['"][^'"]*three|three\.module\.js|spline-viewer|<canvas/i.test(html),
  interactive:/addEventListener|onclick|onsubmit|onchange|<form\b/i.test(html),
  accessible:/aria-label|:focus-visible|:focus/i.test(html),
 };
 const essentials: (keyof typeof found)[]=mode==='dimension'?['animation','responsive','pointer','reducedMotion','threeD','interactive','accessible']:mode==='cinema'?['animation','responsive','scroll','reducedMotion','interactive','accessible']:['animation','responsive','reducedMotion','interactive','accessible'];
 const missing=essentials.filter(k=>!found[k]);
 return {checks:found, missing,score:Math.round(100*(essentials.length-missing.length)/essentials.length)};
}
