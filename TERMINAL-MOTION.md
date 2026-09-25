# Terminal motion

Formal locomotion laws for the Mininja mark in terminal / console surfaces. Machine source of truth: [`kit/scene.json`](kit/scene.json). Console `src/lib/scene.ts` / `banner.tsx` are a historical source and must stay aligned to kit — they are not live SoT. The mascot has no name.

Scenery symbols \(W, N, L, \alpha, x_i, c_i\) are defined in [SCENERY.md](SCENERY.md).

![Terminal motion](assets/visuals/terminal-motion.png)

## Scene state

A resolved **Scene** is always fully concrete:

| Field | Type | Default |
|-------|------|---------|
| `emotion` | registered id | `idle` |
| `action` | registered id | `idle` |
| `stage` | registered id | `dock` |
| `facing` | `left` \| `right` | `right` |
| `line` | string | `""` |
| `intensity` | \(0 \mid 1 \mid 2\) | `1` |
| `holdMs` | number | `0` |

**SceneIntent** may omit fields. Resolution (`applyIntent`):

| Condition | Result |
|-----------|--------|
| Unknown `emotion` | `curious` |
| Unknown `action` | `wait` |
| Unknown `stage` | **keep current** (no teleport to a fake id) |
| Stage changes and `facing` omitted | \(\mathrm{facing} = \mathrm{right}\) if \(x_{\mathrm{next}} \ge x_{\mathrm{cur}}\), else `left` |
| `line` omitted | keep current |
| `intensity` omitted | keep current |
| `holdMs` omitted | `0` |

## Facing → lockup (5 × 3 cells)

Every line is exactly **5 monospace cells** (see [CONSTRUCTION.md](CONSTRUCTION.md)).

Let eyes be the emotion pair \((e_L, e_R)\). Blink forces `(─, ─)`; sleep action forces `(‒, ‒)`.

\[
\mathrm{pair} =
\begin{cases}
e_R e_L & \text{facing left} \\
e_L e_R & \text{facing right}
\end{cases}
\]

| Facing | Hood (stand) | Mid (stand) | Feet (stand) |
|--------|--------------|-------------|--------------|
| right | `▚████` | `██ ` + pair | `▀▀▀▀▀` |
| left | `████▞` | pair + ` ██` | `▀▀▀▀▀` |

Pose overrides (still 5 cells):

| Pose | Hood right | Hood left | Feet |
|------|------------|-----------|------|
| lean | ` ▚███` | `███▞ ` | unchanged |
| crouch | stand hood | stand hood | `▄▄▄▄▄` |
| jump | `▚████` | `████▞` | stand / walk feet |

Walk / run / carry feet alternate on tick parity:

| tick mod 2 | Feet |
|------------|------|
| 0 | `▀▀ ▀▀` |
| 1 | `▀ ▀▀▀` |

## Locomotion constants

| Symbol | Name | Value |
|--------|------|------:|
| \(v_w\) | Walk speed | **170** px/s |
| \(v_r\) | Run speed | **280** px/s |
| \(v_p\) | Patrol speed | **26** px/s |
| \(\varepsilon\) | Arrive epsilon | **6** px |
| \(p_0\) | Patrol left inset | **56** px |
| \(p_1\) | Patrol right inset | **90** px |
| \(\lambda_R\) | Camera look-ahead (face right) | **0.32** × view width |
| \(\lambda_L\) | Camera look-ahead (face left) | **0.52** × view width |
| \(\kappa\) | Camera follow rate | **5.2** s⁻¹ |
| \(\tau_w\) | Step period (moving / run) | **0.16** s |
| \(\tau_i\) | Step period (idle cadence) | **0.28** s |
| \(\Delta t_{\max}\) | Frame dt clamp | **0.05** s |

### Travel

Let actor abscissa be \(a(t)\), destination \(c^\star = c(\mathrm{stage})\).

\[
\mathrm{moving} \iff |c^\star - a| > \varepsilon
\]

While moving:

\[
v =
\begin{cases}
v_r = 280 & \text{if intensity } \ge 2 \\
v_w = 170 & \text{otherwise}
\end{cases}
\]

\[
a \leftarrow a + \mathrm{sign}(c^\star - a) \cdot \min(|c^\star - a|,\ v \cdot \Delta t)
\]

Facing is forced to the travel direction. Live `action` is forced to `run` or `walk` for the duration of travel.

Time between adjacent stages (rest → rest), ignoring epsilon:

\[
T_w = \frac{W}{v_w} = \frac{420}{170} \approx 2.4706\ \mathrm{s}
\]

\[
T_r = \frac{420}{280} = 1.5\ \mathrm{s}
\]

For \(k\) stages of separation: \(T = k \cdot W / v\).

### Arrive

When \(|c^\star - a| \le 6\): snap \(a = c^\star\); restore the scene’s declared action.

### Patrol

Allowed only when **all** hold: ready, `action === idle`, `line === ""`, not reduced-motion.

Patrol interval inside stage \(i\):

\[
a \in [x_i + 56,\ x_i + W - 90] = [x_i + 56,\ x_i + 330]
\]

Length of the patrol segment:

\[
(W - 56 - 90) = 274 \text{ px}
\]

Speed \(v_p = 26\) px/s; reverse and flip facing at endpoints. One full end-to-end patrol takes \(274 / 26 = 10.538\ldots\) s.

### Camera

View width \(V\). Desired camera origin:

\[
C^\star = \mathrm{clamp}\bigl(a - \lambda V,\ 0,\ L - V\bigr)
\]

\[
\lambda =
\begin{cases}
0.32 & \text{facing right} \\
0.52 & \text{facing left}
\end{cases}
\]

Exponential smooth toward \(C^\star\):

\[
C \leftarrow C + \bigl(C^\star - C\bigr)\bigl(1 - e^{-\kappa \Delta t}\bigr),\quad \kappa = 5.2
\]

### Reduced motion

If `prefers-reduced-motion: reduce`: set \(a = c^\star\), facing from intent, **no** walk/run/patrol animation.

### Offline / wake

| Event | stage | emotion | action |
|-------|-------|---------|--------|
| Offline / sleep | `nightwatch` | `sleepy` | `sleep` |
| Wake / online | `dock` | `alert` | `wave` |

## Emotion catalog (16)

| id | eyes | tone | motion |
|----|------|------|--------|
| `idle` | ● ● | idle | — |
| `curious` | ◉ ● | accent | — |
| `focused` | ◐ ◑ | accent | pulse |
| `happy` | > < | ok | bounce |
| `proud` | ▴ ▴ | ok | bounce |
| `mischievous` | ¬ ¬ | accent | — |
| `worried` | ◆ ◆ | warn | sway |
| `confused` | ? ? | warn | — |
| `startled` | ◎ ◎ | err | shake |
| `embarrassed` | ◦ ◦ | muted | — |
| `frustrated` | × × | err | shake |
| `determined` | ◣ ◢ | accent | pulse |
| `relieved` | ◠ ◠ | ok | — |
| `sleepy` | ‒ ‒ | muted | — |
| `alert` | ● ● | accent | pulse |
| `sad` | . . | muted | — |

## Action catalog (22)

| id | motion | pose | fx |
|----|--------|------|----|
| `idle` | none | stand | none |
| `blink` | none | stand | none |
| `walk` | bob | stand | none |
| `run` | bob | stand | none |
| `think` | pulse | stand | think |
| `scan` | pulse | stand | scan |
| `type` | pulse | lean | type |
| `read` | sway | stand | none |
| `point` | none | lean | none |
| `wave` | bounce | stand | wave |
| `jump` | hop | jump | spark |
| `crouch` | none | crouch | none |
| `lookBack` | sway | stand | none |
| `celebrate` | bounce | jump | spark |
| `shakeHead` | shake | stand | none |
| `nod` | bob | stand | none |
| `search` | sway | lean | search |
| `wait` | sway | stand | none |
| `sleep` | none | crouch | sleep |
| `carry` | bob | lean | none |
| `peek` | none | crouch | search |
| `climb` | hop | jump | none |

## Command → stage map

| Command family | Stage | Typical action |
|----------------|-------|----------------|
| help, clear, wake | `dock` | wave / idle |
| now, overview, todo, plan, brief, turn, save | `desk` | read / point / carry |
| refine, compound, qa, ralph | `workshop` | type / scan |
| look, api, web, postgres, pgeon | `archives` | scan / search |
| unknown, freeze/pause, bad feel/do/go | `gate` | shakeHead / point |
| completed / default success | `rooftop` | celebrate |
| offline, sleep | `nightwatch` | sleep |

Operator verbs: `go <stage>`, `feel <emotion>`, `do <action>`, `scene`.

## STYLEGUIDE face bridge (15 → scene)

| Face | emotion | action | stage |
|------|---------|--------|-------|
| idle / blink | idle | idle / blink | dock |
| evaluating | focused | think | desk |
| loadingRight | focused | walk | (facing right) |
| loadingLeft | focused | walk | (facing left) |
| allowed | happy | nod | desk |
| asking | curious | wait | — |
| denied | frustrated | shakeHead | gate |
| sandboxing | mischievous | peek | workshop |
| executing | determined | type | workshop |
| completed | proud | celebrate | rooftop |
| warning | worried | point | gate |
| error | confused | shakeHead | gate |
| cancelled | embarrassed | lookBack | dock |
| offline | sleepy | sleep | nightwatch |

## Don’ts

- No flight, warp, or pop across stages when motion is enabled.
- No patrol while a line is showing or while not idle.
- Reduced motion ⇒ jump cut only.
- No stages outside the registered \(N = 7\) strip in brand stills without updating SCENERY.md.
- No personal name on the walker.

Scenery: [SCENERY.md](SCENERY.md).
