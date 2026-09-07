# gyul.ai

Gyula Halmos’s AI consulting studio: a static, accessible Astro website with original procedural artwork, an illustrative agent-workflow playground, and an entirely local email-brief composer.

## Develop

Use **Node 24 LTS** (the exact version is in [.nvmrc](.nvmrc)):

```sh
npm ci
npm run dev
```

`npm run build` produces **dist/**. `npm run preview` serves that production output on the loopback interface. The canonical origin is **https://gyul.ai**, with no repository-name base path.

## Verify

```sh
npm run verify
npx playwright install chromium webkit
npm run test:e2e
npm run audit:performance
```

- `verify`: formatting, Astro/TypeScript diagnostics, native Node unit tests, production build, internal references, metadata, and asset/JavaScript budgets.
- Browser tests: Chromium at 320, 390, 768, and 1440 pixels; WebKit at 390 and 1440 pixels. Covers all three workflows, keyboard focus, native navigation, motion preferences, 200% text resizing, contact encoding/copy fallbacks, and no-JavaScript behavior.
- axe scans the enabled page and completed scenario states. Actual script-disabled contexts are tested separately because axe itself requires JavaScript. WebKit link-tab behavior respects the operating system’s keyboard-access preferences.
- Persisted page lifecycle events are simulated to exercise teardown/remount and focus recovery; this is not a claim of exhaustive browser BFcache behavior.
- Performance auditing uses an isolated Chromium profile against the local production preview. It writes Lighthouse HTML/JSON under ignored `test-results/`. Simulated lab scores are **not** field Core Web Vitals.

On Linux CI, install browser OS dependencies with `npx playwright install --with-deps chromium webkit`. Run `npm run format` after editing. Generated test reports and build output are intentionally not committed.

## Where to change things

- [src/lib/content.ts](src/lib/content.ts): public biography, consulting interests, offers, and speaking links.
- [src/lib/workflows.ts](src/lib/workflows.ts): authored synthetic scenarios and the pure review-gated state machine.
- [src/lib/brief.ts](src/lib/brief.ts): bounded, Unicode-safe plain-text email draft generation.
- [src/lib/signal.ts](src/lib/signal.ts): deterministic geometry shared by static SVG, enhanced Canvas, and social artwork.
- [src/components](src/components): page sections and scoped styles.
- [src/scripts](src/scripts): progressive enhancements, timer/observer cleanup, keyboard behavior, and in-memory lifecycle restoration.
- [src/styles/global.css](src/styles/global.css): design tokens, local fonts, reset, focus, and reduced-motion defaults.

No React application shell, SSR, CMS, database, or animation library is required. TypeScript 6 is intentional: the pinned Astro checker’s peer range does not support TypeScript 7. Dependencies and GitHub Actions are pinned; check compatibility before updating them.

## Interaction and privacy boundaries

The playground is an **illustration**, not a live model session. Its inputs and outputs are synthetic, and its approval gate changes only local demo state. Real systems need permissions, evaluation, auditability, and server-side review enforcement.

The contact composer does not submit a form, store drafts, or send messages. It updates a plain-text preview in memory. Copy uses the Clipboard API with a manual-selection fallback; the email action opens the visitor’s mail app with encoded subject/body values. Do not enter confidential information. The existing intentionally public email address remains a mailto destination, not a secret hidden by styling.

There are no analytics, advertising cookies, third-party font calls, account connections, or client API keys. The static page, native mobile menu, readable default workflow, and direct email links remain available without JavaScript. Decorative motion stops offscreen, in background tabs, or when reduced motion is requested; it can also be paused manually.

## Artwork and licenses

The signal sculpture and project concept illustrations are original code-generated artwork—not product screenshots. `npm run assets:social` regenerates the committed 1200 × 630 social card using the same geometry and embedded local fonts; Playwright Chromium must be installed. Rebuild afterward.

The original HG AI artwork remains in [assets/logo.jpg](assets/logo.jpg); a small optimized derivative is delivered in the footer. Self-hosted Space Grotesk and Instrument Serif font licenses are included in [public/fonts](public/fonts).

## Publishing

See [the deployment and HTTPS checklist](docs/deployment.md). CI has read-only repository permissions. Production publishing is **manual only**, requires an explicit confirmation input, and checks the configured custom-domain origin before deployment.

The previous site’s certificate-name mismatch is separate from the redesign. A successful build is not proof that public HTTPS works. Preserve the custom domain, verify the certificate and www redirect, and do not bypass certificate verification.

See [public-content provenance](docs/public-content.md) when updating role, contribution, project, or speaking claims. Never copy private correspondence, client terms, personal details, or research artifacts into this repository.
