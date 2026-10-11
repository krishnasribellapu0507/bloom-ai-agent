import { LiquidMetalButton } from '@designcodeio/threeui/components/LiquidMetalButton';
import '@designcodeio/threeui/style.css';

/**
 * Public ThreeUI v1.2.0 does not export GetStartedButton. This uses the
 * published ThreeUI LiquidMetalButton's real interactive renderer and event
 * bridge to make an accessible, working Get Started action for BLOOM.
 */
export function BloomGetStartedButton() {
  const enterWorkspace = () => {
    const workspace = document.getElementById('workspace');
    if (!workspace) return;
    workspace.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="shader-frame bloom-threeui-get-started" aria-label="Get started with BLOOM">
      <LiquidMetalButton
        variant="pill"
        rendering="colored"
        embedded
        text="Get Started"
        onClick={enterWorkspace}
      />
    </div>
  );
}
