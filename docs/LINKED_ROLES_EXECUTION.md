# Discord Linked Roles — execution plan (branches + PR order)

**Branches (created locally):**

| Repo | Branch | Base |
|------|--------|------|
| [RaidHub-Services](https://github.com/Raid-Hub/RaidHub-Services) | `feat/discord-linked-roles` | `main` |
| [RaidHub-Website](https://github.com/Raid-Hub/Web-App) | `feat/discord-linked-roles` | `main` |

**Canonical spec (in each repo):** [`docs/DISCORD_LINKED_ROLES.md`](./DISCORD_LINKED_ROLES.md) (Part VII = implementable checklist).

---

## PR strategy (recommended)

Ship in **two PRs** so Website (scopes + refresh) can merge and soak **before** workers start pushing to Discord.

### PR 1 — Website first (`Web-App` → `feat/discord-linked-roles`)

**Goal:** Users re-consent `role_connections.write`; Turso tokens stay fresh on session.

- [ ] Discord authorize URL: `identify` + `role_connections.write` (`src/lib/server/auth/index.ts`).
- [ ] Discord OAuth refresh on session path + `prisma.account.update` (`sessionCallback.ts`, helper; extend `adapter.ts` / `getUser` includes for Discord `account` row).
- [ ] Copy/link spec: `docs/DISCORD_LINKED_ROLES.md` + README pointer to `./docs/DISCORD_LINKED_ROLES.md`.
- [ ] Comms / settings copy: “Reconnect Discord” for existing linked users.

**Merge when:** CI green; smoke test link + session on staging Turso.

### PR 2 — Services second (`RaidHub-Services` → `feat/discord-linked-roles`)

**Goal:** Post–new-instance, debounced push to Discord using Turso read + Postgres stats.

- [ ] `DISCORD_LINKED_ROLES_ENABLED`, `DISCORD_APPLICATION_ID`, `TURSO_AUTH_DB_URL`, `TURSO_AUTH_DB_TOKEN` in `lib/env/env.go` + `example.env`.
- [ ] `routing` constant + message type + `publishing` from `orchestrator.go` (gated flag).
- [ ] Turso read client + §5 SQL; Postgres metadata read (`core.player`); Redis debounce §4.
- [ ] Hermes topic + `main.go` registration; Discord `PUT` §7; metrics §9.
- [ ] Docs: `docs/DISCORD_LINKED_ROLES.md`, `docs/ARCHITECTURE.md` see-also, this file.

**Merge when:** CI green; staging Hermes reaches Turso + Discord test app; rollout §10 dry-run with flag off then on.

### PR 3 — Optional / later

- [ ] In-app “Sync linked roles” + FR-06 Turso columns (v1.1).
- [ ] Worker token refresh ADR (only if metrics show mass 401 for inactive users).

---

## Dependency rule

**Do not enable** `DISCORD_LINKED_ROLES_ENABLED=true` in production until **PR 1** is deployed and users can obtain new scopes (otherwise workers will 401).

---

## Push branches

```bash
# Services
cd RaidHub-Services && git push -u origin feat/discord-linked-roles

# Website
cd RaidHub-Website && git push -u origin feat/discord-linked-roles
```

Open PRs with title prefix: `feat(linked-roles): …` — link cross-repo PRs in descriptions.

---

## Stash recovery (if needed)

```bash
# If you had other WIP on old branches:
cd RaidHub-Services && git stash list   # pop onto correct feature branch if relevant
cd RaidHub-Website && git stash list
```

---

## Out of scope (same as spec)

- `RaidHub-API`, `raidhub-discord`, `subscription-webhook-relay` — no branches required for v1.
