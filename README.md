# Gobble Dash — The Great Thanksgiving Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun)
[![rank](https://make.fun/badge/turkey-run-game-01/keyi898/turkey-run-game-01/rank.svg)](https://make.fun)
[![reward](https://make.fun/badge/turkey-run-game-01/keyi898/turkey-run-game-01/reward.svg)](https://make.fun)

An entry in make.fun's [turkey escape game bounty](https://make.fun/c/turkey-run-game-01):
a complete, original turkey escape game that plays offline in a desktop browser.

You are a turkey in the week before Thanksgiving. The farmer has a net, a
carving knife, and the oven is already lit. Run 1,500 metres through the
farmyard, the barn and the kitchen to reach the Freedom Gate — jump fences,
duck under carts, dodge falling and thrown carving knives, slip past the
oven's flame blasts, hide in haystacks when the farmer loses your trail, and
gobble corn for points. Three hits (or one good netting) and you are dinner.

## Controls

- ← → / A D — run · SPACE / ↑ / W — jump · ↓ / S — duck
- SHIFT or hold mouse — sprint (fast but noisy: the farmer hears you)
- H — hide in a haystack · P / ESC — pause

The farmer patrols, chases when he spots you, searches haystacks when he
loses you, and lunges when you are cornered. Sprinting while hidden gives
you away. Stages grow harder from farmyard to kitchen, and your best score
is kept between runs.

## Run it

Serve the `game/` folder with any static file server and open it in Chrome:

```
npx serve game        # or: python3 -m http.server -d game 8080
```

No build step, no network requests: every script is a file under `game/`,
all art is drawn in code, and all sound is synthesised with WebAudio.

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to `/output` and writes `dossier.json` with
`vendor/makefun-game.ts`. Locally:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed — see `LICENSE`.
