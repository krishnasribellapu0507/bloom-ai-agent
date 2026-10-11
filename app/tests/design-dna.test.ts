import { describe, expect, test } from 'bun:test';
import { DESIGN_DNA, createDesignBrief, auditInteractions } from '../src/lib/design-dna';
import { INTERACTIVE_SHOWCASE } from '../src/lib/forma-demo';

describe('Forma interactive design direction',()=>{
  test('offers four original grounded design directions',()=>{
    expect(DESIGN_DNA.map(d=>d.id)).toEqual(['cinema','dimension','taste','components']);
    for(const pack of DESIGN_DNA){expect(pack.url.startsWith('https://')).toBe(true);expect(pack.lessons.length).toBeGreaterThan(2);}
  });
  test('adapts style and motion without copying outside code',()=>{
    const cinema=createDesignBrief('cinema','immersive');
    const dimensional=createDesignBrief('dimension','subtle');
    expect(cinema).toContain('scroll');
    expect(cinema).toContain('High motion');
    expect(dimensional).toContain('Three.js');
    expect(dimensional).toContain('Subtle motion');
    expect(cinema).toContain('do not clone');
  });
  test('requires honest interaction hooks for cinematic sites',()=>{
    const staticPage='<!DOCTYPE html><html><head><style>@media(max-width:600px){}</style></head><body><main><h1>Hi</h1></main></body></html>';
    const result=auditInteractions(staticPage,'cinema');
    expect(result.missing).toContain('scroll');
    expect(result.missing).toContain('interactive');
    expect(result.score).toBeLessThan(100);
  });
  test('requires real geometry or canvas for the dimensional preset',()=>{
    const staticPage='<main><h1>3D</h1><div style="transform:rotate(30deg)"></div></main>';
    expect(auditInteractions(staticPage,'dimension').missing).toContain('threeD');
  });
  test('demo contains real pointer, scroll, filter and accessibility logic',()=>{
    expect(INTERACTIVE_SHOWCASE).toContain('pointermove');
    expect(INTERACTIVE_SHOWCASE).toContain('IntersectionObserver');
    expect(INTERACTIVE_SHOWCASE).toContain('data-filter');
    expect(INTERACTIVE_SHOWCASE).toContain('prefers-reduced-motion');
    expect(auditInteractions(INTERACTIVE_SHOWCASE,'cinema').score).toBe(100);
  });
});
