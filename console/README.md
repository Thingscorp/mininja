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

## Layout

```
console/
  src/components/   # mark, banner, shell
  src/lib/          # faces, scene, programs
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
