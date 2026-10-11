import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
const route=readFileSync('src/routes/agent.tsx','utf8');
const control=readFileSync('src/components/bloom-control-room.tsx','utf8');
const css=readFileSync('src/bloom-control-room.css','utf8');
describe('BLOOM agent shares the immersive studio design',()=>{
 test('builds control room instead of the previous green hero',()=>{
  expect(route).toContain('<BloomControlRoomIntro/>');
  expect(route).not.toContain('<FormaHero/>');
  expect(route).toContain('bloom-control-room');
  expect(route).toContain('id="workspace"');
 });
 test('keeps the tools and learning behind active dock actions',()=>{
  expect(route).toContain('setTab(\'learning\')');
  expect(route).toContain('setTab(\'preview\')');
  expect(route).toContain('runPuterAgent(');
  expect(route).toContain('FormaLearningStudio');
  expect(route).toContain('download()');
  expect(control).toContain('onClick={onLearning}');
  expect(control).toContain('onClick={onPreview}');
 });
 test('has a real rendered canvas and responsive, accessible styling',()=>{
  expect(control).toContain('requestAnimationFrame');
  expect(control).toContain('IntersectionObserver');
  expect(control).toContain("prefers-reduced-motion");
  expect(css).toContain('.bloom-control-room');
  expect(css).toContain('@media(max-width:520px)');
  expect(control).toContain('aria-label="BLOOM floating utility dock"');
 });
});
