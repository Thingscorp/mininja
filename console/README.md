# Mininja Console

Optional **level-4** surface: a browser terminal buddy for the Mininja mark.

Programs return cards. The last stream line is the next program's input. The scenery strip and faces follow [`kit/scene.json`](../kit/scene.json) and [`kit/mark.json`](../kit/mark.json).

Most projects should start with [`../PORTING.md`](../PORTING.md) levels 1–2. Use this console when you want the living scene.

## Quick start

```bash
cd console
npm install
npm run dev
```

Open the URL Vite prints (default `http://127.0.0.1:8080`).

```bash
npm test          # unit + script tests
npm run typecheck
```

## Programs

`now` `todo` `plan` `brief` `look` `pgeon` `refine` `turn` `save` `compound` `qa` `ralph` `scene` `help` `offline` `wake` `clear`

Type at the prompt or click a chip. Unknown input gets a clear error face — never a silent no-op.

### Composer contract (one mouth)

Same grammar as [`../bot/README.md`](../bot/README.md) § Composer contract — **one mouth** for pals + programs. Pure parse/route lives in `src/lib/mention.ts` (Unix: one job, no DOM). Teammate ops call the Mac launcher (`bot/server.py`) via `src/lib/bot-api.ts` (Vite proxies `/bot-api` → `:8787` in dev; set `VITE_BOT_URL` otherwise).

| Input | Route |
|-------|--------|
| `@Ada do X` | Task to pal Ada (roster from bot `/api/state`) |
| `@all …` | Rally-all (`POST /api/rally`) |
| `@console now` / bare `now` | Program engine (`cardFor`) |
| `stop` / `pull` / `stop @Ada` | Pull-off |
| `retarget @Bob …` | Explicit retarget |
| bare text with a pal focused | Task to that pal |

When bot is down, pal ops show a clear **Needs bot server** card; programs still work offline. Autocomplete: type `@` for Linear-minimal roster (`@all`, pals, `@console`). Sidebar focus is fallback (`@Ada` with no body selects).

**Approval modes** near the composer: `draft` · `auto` · `free` (same words as the bot spawn form). Clicking a mode updates the focused pal via `PATCH /api/bots/:id` (`mode` field). Sending an `@`-task applies the chosen mode first, then starts the task. No new backend — same bot field.

## Layout

```
console/
  src/components/   # mark, banner, shell
  src/lib/          # faces, scene, programs, mention, bot-api
  src/plugins/      # one-job program plugins
  kit alignment     # ../kit/scene.json is SoT for geometry
```

## Auth (optional)

Sign-in with an external broker is **env-only**. Set `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` (and related Better Auth vars) if you need it. No secrets are baked into this tree. Local email/password can be enabled via `src/lib/auth/` for development.

## Brand

- Glyphs are the mark. Do not rename the mascot.
- Mood colors are chrome; the lockup stays monochrome-capable.
- See root [`STYLEGUIDE.md`](../STYLEGUIDE.md) and [`PORTING.md`](../PORTING.md).

## Bring your own kit

Props and weather ride on kit stages today (`registerStage`); dedicated `registerProp` / `registerWeather` are a follow-up if overlays need them without replacing a whole stage.

Kit JSON under [`../kit`](../kit) is Lego bricks: scene and mark rules meant to be overridden. Forks and overlays of kit are first-class and encouraged — keep this console shell, swap the numbers for your environment.
