# Card Knight — Landing Page

Marketing / launch site for **Card Knight**, an action deckbuilder RPG in a handcrafted HD-2D world.

- **Live:** https://darienbathalter.github.io/CardKnight_LandingPage
- Static site (HTML/CSS/JS), no build step, hosted on GitHub Pages.

## Structure
```
index.html      # page markup
styles.css      # glassmorphic dark-luxe theme
main.js         # nav scroll state, reveal-on-scroll
assets/img/     # brand art, hero key-art, wordmark, generated accents
assets/shots/   # in-engine screenshots
```

## Editing
Open `index.html` locally in a browser — no tooling required. Push to `main` to deploy.

## TODO before public launch
The funnel is **Wishlist (primary) + YouTube + Discord**. All three are currently
placeholder links marked `class="soon"` (they pop a "coming soon" notice).
- [ ] Wire **Wishlist** to the real Steam store URL (`#steam-btn` in `index.html`) — remove its `soon` class + `data-msg`.
- [ ] Wire **Watch on YouTube** to the channel/trailer URL — remove `soon` class + `data-msg`, add `target="_blank" rel="noopener"`.
- [ ] Wire **Join the Discord** to the invite URL — same treatment.
- [ ] (Optional) custom domain via `CNAME`.

Donationware (GitHub Sponsors / pay-what-you-want / direct download) was removed by design.
