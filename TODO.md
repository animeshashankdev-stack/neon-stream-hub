# TODO — Senpai.tv full redesign (16 pages) + Next.js migration

## Plan approval steps
- [ ] Create Next.js App Router scaffold (or migrate repo) so we can add routes exactly as specified.
- [ ] Move/align Senpai visual system (AppShell, primitives, CSS tokens/animations) to the new Next.js structure.
- [ ] Add missing route files (Browse, Detail, Watch, etc.) matching mockups pixel-faithfully.

## Functional milestones
- [ ] Replace mock data imports with data hooks (Drizzle/Postgres + REST/Server Actions).
- [ ] Implement custom HLS player with chapter markers and watch progress persistence.
- [ ] Implement watch parties (synced playback + sync chat).
- [ ] Implement PWA: install prompt, offline caching, push notifications.

## Quality gates
- [ ] Run lint + typecheck + build.
- [ ] Lighthouse checks for Home/Browse/Detail.
- [ ] Accessibility pass (focus rings, reduced motion, SR labels).

