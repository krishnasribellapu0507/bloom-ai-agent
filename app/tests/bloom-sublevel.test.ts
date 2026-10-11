import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'public/landing-pages/bloom-studio.html'),'utf8');
const home = readFileSync(join(process.cwd(),'src/routes/index.tsx'),'utf8');
const wrapper=readFileSync(join(process.cwd(),'src/components/sublevel-studio-landing-page.tsx'),'utf8');

describe('BLOOM ThreeUI Sublevel adaptation',()=>{
 test('uses authored ThreeUI html and WebGL scene rather than screenshot mockup',()=>{
  expect(source).toContain('three.module.min.js');
  expect(source).toContain('0.160.0');
  expect(source).toContain('<canvas id="gl"></canvas>');
  expect(source).toContain('<div class="masonry">');
  expect(source).toContain('id="paper-stage"');
  expect(source).toContain('BLOOM — agent index');
 });
 test('links its home and studio without replacing the AI builder',()=>{
  expect(home).toContain('SublevelStudioLandingPage');
  expect(wrapper).toContain('/landing-pages/bloom-studio.html');
  expect(wrapper).toContain('href="/agent"');
 });
 test('does not present template clients or pretend newsletter works',()=>{
  expect(source).not.toContain('Trusted by the builders');
  expect(source).not.toContain('Halide’s developer summit needed');
  expect(source).toContain('.signup{display:none!important}');
  expect(source).toContain('ThreeUI demo art, not BLOOM client work');
 });
});
