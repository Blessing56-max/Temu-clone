# Oscillate — Marketplace Frontend

Full-stack marketplace frontend built from the Frontend Build Brief. All 14 screens from
Section 3, wired end-to-end with Redux Toolkit state, populated with mock content, and a
motion layer on top.

## Latest round — hero rebuilt: 3D product carousel replaces the cart animation

The cart-travel entrance is gone entirely, replaced with what you asked for:

**New entrance choreography (`HeroIntro.jsx`):** a short accent line draws itself first, the
headline slides up from it, then everything else (badge, subhead, CTAs, category pills, stats)
pops in with a staggered spring, and the carousel slides in from the right independently. No
more clip-path wipe, no more travel/tilt/trail-mark logic — that whole system is deleted.

**`ProductGlobeCarousel.jsx`** — a real 3D rotating ring (CSS `perspective` +
`transform-style: preserve-3d`, each card placed via `rotateY(angle) translateZ(radius)`),
spinning continuously and pausing on hover so it's readable. Hovering a card reveals its name
and price; clicking navigates straight to that product's detail page
(`navigate('/products/:id')`). Populated from real Redux product data — specifically every
product that has a real image (the 4 new hoodies + the 2 from earlier rounds), not a hardcoded
list.

**Structural fix, not just a visual one:** the cart used to be an absolutely-positioned
full-bleed layer independent of the grid, which is exactly what caused the "too much empty
space in the middle" problem — the grid still reserved a column for it, but its actual position
had nothing to do with that column. The carousel is now a normal grid child in the same
`md:grid-cols-2` as the text, so spacing is consistent by construction instead of by
magic-number positioning.

**4 hoodie products added** (`p-9`–`p-12`, sand/burgundy/white/sky-blue), each with its real
photo bundled into the project (`src/assets/products/`, resized + WebP-compressed like the
cart photo was). `ProductThumb.jsx` now handles both local bundled images and Cloudinary IDs —
it tells them apart by whether the string looks like a URL.

**Removed:** `GroceryCartHero.jsx`, `HeadlineWipe.jsx`, `HeroFloatingCards.jsx`, and the cart
photo assets — all superseded by the carousel. Not left in as dead code.

## Setup

```bash
npm install
npm run dev
```

Network access wasn't available in the build sandbox, so `npm install` hasn't been run here —
run it locally to pull in the dependencies listed in `package.json`.

## Latest round — rebuilt against your actual illustration, not my guess at it

I'd missed the brief the first time — went back to your reference image directly. Three real
gaps between what I'd built and what you asked for:

1. **Size and position.** The cart was small and centered. It needed to be big and pinned to
   the right side of the page. Fixed: `GroceryCartHero.jsx` is now a full-bleed layer (not
   nested inside the text column), sized up to `620px` wide on desktop, anchored to the right
   edge of the hero. It still enters from off-screen left and travels in, same as before — just
   arrives somewhere completely different and much larger.
2. **"Real things" coming out of it, not icon badges.** The previous version used small
   category icons (shirt, cpu, house) in white rounded squares — nothing like what you drew.
   Built actual produce illustrations instead (`components/produce/ProduceIllustrations.jsx`):
   tomato, banana bunch, grape cluster, red and green peppers, corn, leafy greens, lemon — each
   with gradient shading for some dimensionality, not flat icons. They're layered and
   overlapping at the basket's opening now, reading as a pile, plus one tomato flying in
   separately above the cart — matching the floating tomato in your illustration specifically.
3. **Architecture fix that made both of the above possible:** the cart visual was previously
   trapped inside the same component as the headline's clip-path wipe, which is why it couldn't
   grow past the text column. Split that apart — `HeadlineWipe.jsx` now only handles the text
   reveal, `GroceryCartHero.jsx` is a fully independent full-bleed layer free to be whatever
   size and position it needs to be.

**Why illustrations and not the actual stock photos in your reference image:** I can't legally
bundle arbitrary stock photos I don't have rights to into a codebase I'm handing you — that's a
real constraint, not me cutting a corner. Hand-drawn SVG produce with gradient shading is the
closest honest substitute; swap in licensed photography later if you have it and I'll wire it
in the same anchor points.

## Previous round — real cart photo, trail marks, arrival tilt

**The cart is now the actual photo you sent**, not an illustration. I bundled it directly into
the project as a real static asset (`src/assets/cart-empty.png` / `.webp`) — I can't host your
uploaded image at a public URL, but I *can* ship the actual file inside the project, which is
the correct way to handle this in a real Vite app anyway. Resized and compressed it from ~1MB
down to ~59KB (WebP, with a PNG fallback via `<picture>`) since it ships to every visitor.

**Choreography, per your spec (`CartRevealHero.jsx`):**
- Travels left → right across the hero, same sync with the headline wipe as before.
- A trail of short marks fades in and shrinks away right as the cart would be passing each
  point — reads as a track left by the wheels rather than something stuck to the cart.
- On arrival, the cart tilts a few degrees like it's carrying weight, with a small spring
  "settle" bounce rather than snapping straight to the tilt.
- Items are anchored near the basket's opening (the photo's upper-middle area, where the wire
  mesh top is), not the image's center — so they read as coming out of the basket rather than
  floating in front of the whole photo.

**One honest limitation, not hidden:** true occlusion — items genuinely passing *behind* the
basket's front wire wall before crossing the rim — isn't possible with a single flat cutout
image; there's nothing in the photo to occlude against. What's built is the closest achievable
approximation: items start small at the opening and grow outward, which reads correctly at a
glance. If you want the literal behind-the-mesh effect, the fix is a second cutout of just the
cart's front panel, layered on top of the items — happy to wire that in if you get me that crop.

**Items are fruit/produce icons** (apple, banana, carrot, grape, citrus) in true-to-life colors,
not the category icons used elsewhere in the app — deliberate, since you asked for groceries
specifically. They're Lucide icons, not photos — double-check they render after `npm install`;
if any of those five icon names aren't in your installed Lucide version, that import will error
and I'll swap it for you.

**Cleaned up a loose thread:** there was an unused `HeroVisual.jsx` (a Cloudinary photo-collage
component) sitting in the project from an earlier round that never got wired into the page —
removed it, since the real cart photo now legitimately fills the space it was meant to address.

## Earlier rounds, still in place

- **Discount badges + strikethrough pricing** (`PriceTag.jsx`, corner badge in
  `ProductThumb.jsx`), **floating mini product cards** (`HeroFloatingCards.jsx`), **circular
  category icons**, **trust bar** (`TrustBar.jsx`), **flash-sale countdown**
  (`FlashSaleBanner.jsx`) — all pulled from the reference marketplace UIs you sent.
- **Trending carousel, testimonial carousel, category showcase, "how it works"** sections.
- Full green palette (`leaf`/`canopy`/`slate`) from `ui_theme.jpg`, light theme throughout, no
  dark sections left on the landing page.
- Lenis (inertia scroll) was removed after repeated lag complaints — native scroll only, with
  GSAP `ScrollTrigger` (`Reveal.jsx`) still running the section fade-ins independently of it.

## Structure

```
src/
  assets/                 cart-empty.png / .webp — the real cart photo
  pages/                  14 screens, one file each, named after the brief's screen list
  components/
    Navbar, Footer, Reveal (GSAP scroll wrapper), PageLoader, ProductThumb, PriceTag
    HeadlineWipe.jsx       headline clip-path reveal only
    GroceryCartHero.jsx    full-bleed cart: travel + trail marks + arrival tilt + produce pile
    produce/ProduceIllustrations.jsx   hand-drawn tomato/banana/grapes/pepper/corn/etc.
    HeroFloatingCards.jsx  floating mini product cards in the hero
    TrendingCarousel.jsx, TestimonialCarousel.jsx   the two slideshows
    CategoryShowcase.jsx, HowItWorks.jsx, TrustBar.jsx, FlashSaleBanner.jsx
    ui/                   Button, Input, ProgressBar
  store/slices/           authSlice (onboardingStage machine), adminSlice (queues + audit log),
                          catalogSlice (products, cart, reviews, orders)
  lib/
    categoryTints.js      category → icon/color mapping, used everywhere a product needs a visual
    cloudinary.js          minimal Cloudinary URL builder
```

## Route map

| Screen (brief) | Route |
|---|---|
| 1. Landing Page | `/` |
| 2. Auth Entry | `/auth`, `/login` |
| 3. Registration | `/register` |
| 4. OTP Verification | `/verify-otp` |
| 5. Role Confirmation | `/role-confirmation` |
| 6. Customer Onboarding Quiz | `/onboarding/quiz` |
| 7. Vendor Eligibility Flow | `/onboarding/vendor` |
| 8. Customer Dashboard | `/customer/dashboard` |
| 9. Vendor Dashboard | `/vendor/dashboard` |
| 10. Admin Dashboard | `/admin` |
| 11. Profile Customization | `/profile` |
| 12. Product Detail | `/products/:id` (+ public browse at `/products`, with `?category=` filtering) |
| 13. Checkout Flow | `/checkout` |
| 14. Terms & Privacy | `/terms` |

## Known gaps / next steps

- No backend wiring yet — all state is local Redux with mock data; forms don't hit an API.
- No route guards yet (e.g. `/admin` isn't gated behind an admin role).
- Only 3 products have a real Cloudinary image; the rest fall back to category icons.
- If you want true behind-the-mesh occlusion on the cart items, send a cutout of just the
  cart's front wire panel and I'll layer it in.
"# marketplace-frontend" 
