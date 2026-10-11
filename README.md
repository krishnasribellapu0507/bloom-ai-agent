# BLOOM — Autonomous AI Website Development Agent

**TriCity AI Hackathon | Team Mind Masters**

BLOOM turns natural-language descriptions into interactive websites through a multi-step workflow: **understand → plan → generate → audit → improve → preview and export**. Its Learning Studio saves user design preferences, design references and feedback to guide future generations.

### Live demo
- [BLOOM website](https://forma-agent-studio.higgsfield.app/)
- [AI Agent workspace](https://forma-agent-studio.higgsfield.app/agent)

> The Higgsfield deployment may require a platform sign-in. AI generation requires access to Puter AI (or a separately configured OpenAI API key). ChatGPT Plus does not provide an API key.

### Tech stack
React, TypeScript, TanStack Start, Three.js/WebGL, ThreeUI, Bun, cloud server functions, and cloud database/storage. Hosted on Higgsfield.

### Project files
- `app/src/` — application, real AI agent, interactive frontend, Learning Studio and previews
- `app/migrations/` — cloud database schema
- `app/tests/` — automated tests
- `app/package.json` — dependencies and scripts
- `app/packages/` — bundled workspace packages required by the Higgsfield integration
- `app/public/landing-pages/bloom-studio.html` — immersive ThreeUI-inspired homepage

**To clone and inspect the complete source:**
```bash
git clone https://github.com/krishnasribellapu0507/bloom-ai-agent.git
cd bloom-ai-agent/app
bun install
bun run typecheck
bun test tests/*.test.ts
```

[Download a separate verified source ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3K57uTnoF8KBwAkkfcYL4fgCcnz/cbd3caf9-f531-4b95-af60-d28d4e47d6ab.zip).

The original template's `.github/workflows/ci.yml` was omitted because GitHub Actions cannot add another workflow with the current token permissions. This does not affect the application code.

Higgsfield-specific environment bindings and external AI authentication must be configured in the host; no API keys or private runtime secrets are included.

### Design credits
BLOOM's immersive landing-page adaptation and animated components draw from the published [ThreeUI](https://threeui.com/) component package and the Sublevel Studio design. Third-party assets retain their respective licenses/rights; this repository is provided for hackathon review, not as a claim of authorship over those assets.

### Current project status
The application is deployed, with a working agent workspace, interactive preview, source export, design modes, and a cloud-backed learning feature. Provider authentication and end-to-end generated output depend on host configuration. Automated code-level quality checks do not guarantee visually perfect generated sites.
