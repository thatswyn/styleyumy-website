# StyleYumy — Design Package (Tier 1, trimmed)
Written BEFORE generation. Consumed by Phase 8. Every line of copy ships verbatim.

## 0. The business (real, verified from styleyumy.com)
- Name: StyleYumy · Owner/colorist: Yusmary Baños Baños
- Positioning line already in market: "Balayage y Coloración Experta en Austin, TX"
- Address: 15608 Spring Hill Ln, Ste 109, Pflugerville, TX 78660 (Austin metro)
- Phone / SMS: +1 (737) 350-8549
- WhatsApp: https://wa.link/pn1qvn
- Maps: https://maps.app.goo.gl/ZLe7hUFpdAaSCd4C8
- Hours: Mon–Sat 9:00–19:00, Sun closed. Free parking.
- Instagram https://www.instagram.com/styleyumy · Facebook https://www.facebook.com/share/189SYVQdMG/ · TikTok https://www.tiktok.com/@styleyumy
- Story: international career including cruise lines, dedicated to advanced colorimetry + balayage.
- Language: BILINGUAL ES/EN with a toggle. ES is default.
- Imagery: AI generated, to be swapped for real photos later. No disclosure line requested.

### Booking links (the ONE call to action)
- Balayage / Full Blonde / Moreno Iluminado: https://link.styleyumy.com/widget/bookings/styleyumy-balayage-full-blonde-moreno-iluminado
- Tinte Regular: https://link.styleyumy.com/widget/bookings/styleyumy-tinte-regular
- Corte y Secado: https://link.styleyumy.com/widget/bookings/styleyumy-corte-y-secado
- Extensiones Tape-In: https://link.styleyumy.com/widget/bookings/styleyumy-extensiones-tape-in
- Alisado / Botox capilar: https://link.styleyumy.com/widget/bookings/styleyumy-tratamientos-alisado-botox

## 1. Brand premise
ONE word from her world: **pintar**. Balayage is French for sweeping, for painting.
The whole site teaches one idea: **color is not applied, it is painted**. Applying is
uniform, fast, and flat. Painting requires reading the canvas first (level, undertone,
history), then placing light by hand where the light would actually fall. That single
idea answers all three fears the research found: it explains why it does not turn brassy
(the canvas was read), why it does not fry (light is placed, not blanket-lifted), and why
the client is understood (the reading happens before anything is touched). Every section
serves this. Anything that does not, is off the page.

## 2. Palette tokens (from the logo's own gold and the footage's grade)
```css
:root{
  --canvas:#F8F4ED;        /* warm bone, never pure white */
  --canvas-deep:#F0E8DA;   /* alternating section ground */
  --panel:#FDFAF4;         /* raised cards */
  --accent:#A87C28;        /* gold: the CTA and rare emphasis */
  --accent-hover:#8E661C;
  --accent-ink:#7A5618;    /* gold that passes AA as small text on canvas (6.0:1) */
  --accent-muted:#E7D3A1;  /* whisper: the signature line, borders, glows, motes */
  --accent-pale:#F5EAD0;
  --text-primary:#17140F;  /* warm near-black */
  --text-secondary:#5C554A;
}
```
Contrast verified: `--accent` bg with `--text-primary` = 4.94:1 (AA). `--accent-ink` on
`--canvas` = 6.0:1 (AA). `--text-primary` on `--canvas` = 15.6:1.

Stated deviation: gold + bone + serif sits near the banned "cream canvas with serif"
default. Earned here because it IS the client's existing logo and material world. Tones
sampled from her mark, not from a template. Signature element invented, layout is not the
stock stack.

## 3. Type trio
- Display: **Bodoni Moda** 400/500/600/700 — a true Didone, near-identical to the logo wordmark.
- Body: **Jost** 300/400/500 — geometric, warm, has character. Not Inter, not Roboto.
- Mono: **IBM Plex Mono** 400/500 — used only for the colorimetry level numbers and small
  technical labels, where a mono earns its place.
- Label style echoes the logo's "THE ART OF STYLE": Jost 500, uppercase, 0.24em tracking.

## 4. Band map (4 bands, starting points, validated later by the flick test)
Hair fills the RIGHT of frame. Captions live LEFT. Action lane stays clear.

| Band | Range | Footage moment | Copy ES (verbatim) | Copy EN (verbatim) | Entrance |
|---|---|---|---|---|---|
| 1 | 0.00–0.18 | dark espresso root, warm light entering from upper left | kicker "STYLEYUMY · AUSTIN, TX" / h1 "El color no se aplica. Se pinta." | kicker "STYLEYUMY · AUSTIN, TX" / h1 "Color is not applied. It is painted." | strand-fall: words drop in from above on a soft ease, echoing the descent |
| 2 | 0.24–0.44 | the melt begins, honey enters the strands | "Cada mechón se lee antes de tocarlo. Nivel, fondo, historia." | "Every strand is read before it is touched. Level, undertone, history." | line-sweep: a gold hairline draws left to right, the text rides in behind it |
| 3 | 0.50–0.70 | caramel, full dimension, light strongest | "Por eso sale luminoso y no naranja." | "That is why it comes out luminous, not brassy." | bloom: the words warm up from muted to full as the footage brightens |
| 4 | 0.76–0.96 | champagne ends curling into stillness | "Y crece sin línea, como si hubiera nacido ahí." | "And it grows out with no line, as if it grew there." | settle: words rise a few pixels and stop, matching the hair coming to rest |

Pacing: each band ~0.20 wide, ramps ~0.03 at each edge, plateau ~0.14 so a normal flick
never lands between two states.

## 5. Static-hero copy block (phones, reduced motion)
Sits over the ending frame. No journey behind it.
- ES: kicker "STYLEYUMY · AUSTIN, TX" / h1 "El color no se aplica. Se pinta." /
  sub "Balayage y colorimetría con Yusmary Baños. Luminoso, con dimensión, y crece sin línea." /
  CTA "Agendar Cita"
- EN: kicker "STYLEYUMY · AUSTIN, TX" / h1 "Color is not applied. It is painted." /
  sub "Balayage and color work with Yusmary Baños. Luminous, dimensional, and it grows out with no line." /
  CTA "Book Now"

## 6. Below-fold outline (each section funnels to #agendar)
1. **La firma / The signature** — her story in her own confident voice. Premise expanded.
2. **La escala de niveles / The level scale** — THE INTERACTIVE MOMENT. A 1–10 hair level
   scale. Pick your level, see its name, its underlying pigment (the real reason hair goes
   orange), and what one session can honestly reach from there. Teaches the premise and
   defuses the number-one fear with real colorimetry, not reassurance.
3. **Servicios / Services** — the real service list, each with its real booking link.
4. **El proceso / The process** — three steps: la lectura, el plan, la pincelada.
   Answers "nobody understands what I want".
5. **Transformaciones / Real results** — the three real testimonials, real handles.
6. **Preguntas / Questions** — the real objections found in research.
7. **Visita / Visit** — address, hours, free parking, map, phone, WhatsApp, final CTA.
8. Footer. No fictional-brand disclosure needed: this is a real business.

Contact handling decision: this business already runs a real booking system. A generic
contact form that goes nowhere would be a worse path than the widget they already convert
on. Primary = booking link. Secondary = WhatsApp and tap-to-call. Confirm with the user.

## 7. Vector layer plan (all hand-drawn SVG, all reduced-motion safe)
- **Signature element: la línea de oro.** One continuous SVG path running the full page
  top to bottom, curving between sections, drawing itself via stroke-dashoffset tied to
  scroll. It is the logo's single unbroken ribbon, unrolled down the whole site. Remove it
  and the page collapses into stacked boxes. Section headings hang off it on small gold nodes.
- Brush-sweep dividers: a hand-drawn gold arc echoing the logo's ribbon, between sections.
- Whisper particles: faint gold motes in the fixed background layer, very low opacity.
- Fixed background environment: one slow warm light bloom drifting on a 90s cycle plus fine
  film grain, so scrolling feels like moving through a lit room.
- Reduced motion: final states shown, all drives stopped.

## 8. Engineering list
Blob fetch with loading ring · dt-normalized lerp · gated seeks · delta-gated DOM writes ·
band pacing validated by the flick test · four-layer legibility system · the five
static-hero gates kept live with change listeners · complete-without-video · the full
quality floor in scrub-pipeline.md · whole-site-animated standard.

## 9. Being found and being believed
- title ES: "StyleYumy | Balayage y Colorimetría en Austin, TX"
- title EN: "StyleYumy | Balayage and Hair Color in Austin, TX"
- meta desc ES: "Balayage, full blonde y corrección de color con Yusmary Baños. Color luminoso, con dimensión, que crece sin línea. Pflugerville y Austin, TX."
- Structured data: schema.org HairSalon with the real name, address, phone, hours, geo,
  areaServed and sameAs links above. No invented rating, no invented review.
- Analytics: none by default.

## 10. The copy gate
Every viewer-facing line above ships verbatim. The built page must pass the Phase 9 grep
gate (zero em dashes, zero stock words) plus the hand sweep for AI tells before anyone
sees it. Deliberate devices written here stay; drift gets cut.

## 11. Generation prompts (written before generating, per the laws)

### Start frame (16:9, 2k)
A single long fall of hair occupying the right half of the frame, seen from very close,
composed as the first moment of a slow downward camera descent. At the top the hair is deep
espresso brown, dense and cool at the root. Warm afternoon window light rakes across it from
the upper left, catching individual strands and separating them. The left half of the frame
is the same softly defocused ivory studio wall the hair hangs in front of, one continuous
space edge to edge, receding gently into warm shadow. Palette: deep espresso brown, warm
honey, pale champagne, warm bone ivory, soft bronze light. Fine dust motes drift through the
light beam. Cinematic, photorealistic, shallow depth of field, 16:9. No text, no logos, no
lettering anywhere.

### Video (image-to-video, 6s, 1080p, no audio)
One continuous shot, no cuts. The camera descends slowly and steadily straight down along a
single long fall of hair, from the deep espresso brown at the root to the pale champagne
ends, in one unbroken vertical move. As the camera travels down, the color melts through warm
honey and caramel into luminous champagne. The hair stays alive throughout: strands sway and
separate gently, individual hairs lifting in a faint draft, light sliding along them. The
scene stays alive: dust motes drift through the warm light beam and the light strengthens as
the camera descends. The shot ends at rest: the camera settles on the pale champagne ends of
the hair as they curl and come to stillness, filling the lower two thirds of the frame in a
soft luminous sweep with warm ivory light above them, the light steady and golden. No text or
lettering anywhere.

### Law check on this concept
1 down reads as down ✓ · 2 one subject, one motion ✓ · 3 path locked, strands and motes
alive ✓ · 4 ending composed and near-full-bleed, crops safely on any screen ✓ · 5 hair is a
forgiving subject, no faces, no hands ✓ · 6 vertical axis ✓ · 7 action right, captions left ✓ ·
8 no boundary crossed, not needed ✓ · 9 no product ✓ · 10–11 handled by the band map ✓ ·
12 no-text guard in both prompts ✓
