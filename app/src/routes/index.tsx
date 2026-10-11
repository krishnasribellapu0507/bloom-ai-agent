import { createFileRoute } from '@tanstack/react-router';
import { SublevelStudioLandingPage } from '@/components/sublevel-studio-landing-page';

/** The immersive product home. The existing AI agent stays intact at /agent. */
export const Route = createFileRoute('/')({
  component: () => <SublevelStudioLandingPage />,
});
