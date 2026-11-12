---
name: Pastel Quant
colors:
  surface: "#fcf9f4"
  surface-dim: "#dcdad5"
  surface-bright: "#fcf9f4"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f6f3ee"
  surface-container: "#f0ede9"
  surface-container-high: "#ebe8e3"
  surface-container-highest: "#e5e2dd"
  on-surface: "#1c1c19"
  on-surface-variant: "#40484c"
  inverse-surface: "#31302d"
  inverse-on-surface: "#f3f0eb"
  outline: "#70787c"
  outline-variant: "#c0c8cc"
  surface-tint: "#29657a"
  primary: "#29657a"
  on-primary: "#ffffff"
  primary-container: "#89c2d9"
  on-primary-container: "#095164"
  inverse-primary: "#96cfe6"
  secondary: "#725477"
  on-secondary: "#ffffff"
  secondary-container: "#fad3fd"
  on-secondary-container: "#77587c"
  tertiary: "#356668"
  on-tertiary: "#ffffff"
  tertiary-container: "#91c3c5"
  on-tertiary-container: "#1f5153"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#b8eaff"
  primary-fixed-dim: "#96cfe6"
  on-primary-fixed: "#001f29"
  on-primary-fixed-variant: "#024d61"
  secondary-fixed: "#fcd7ff"
  secondary-fixed-dim: "#dfbbe4"
  on-secondary-fixed: "#2a1131"
  on-secondary-fixed-variant: "#593d5f"
  tertiary-fixed: "#b9ecee"
  tertiary-fixed-dim: "#9ecfd1"
  on-tertiary-fixed: "#002021"
  on-tertiary-fixed-variant: "#1a4e50"
  background: "#fcf9f4"
  on-background: "#1c1c19"
  surface-variant: "#e5e2dd"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: "700"
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: "600"
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "500"
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: "700"
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1.25rem
  margin-desktop: 2.5rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 1.75rem
  space-xl: 2.5rem
---

## Brand & Style

This design system reimagines high-frequency algorithmic finance through a soothing, playful, and hyper-delightful aesthetic ("kawaii-minimalist"). It transforms traditionally intimidating quantitative metrics, hash rates, and liquidity pools into an inviting, approachable experience.

### Target Audience & Personality

- **Audience:** Digital-native retail quant traders, Web3 liquidity miners, and analytical creators who appreciate rigorous data visualization paired with soft, calming, feel-good aesthetics.
- **Personality:** Gentle, ultra-friendly, luminous, precise, and emotionally grounding. It replaces market stress with breezy visual clarity.
- **Design Movement:** Soft Kawaii Minimalism fused with modern Japanese lifestyle editorial design. It utilizes milky pastel pigments, pillowy soft geometry, ample open negative space, and micro-diffused pastel drop glows rather than industrial edges.

## Colors

The palette is rooted in warm ivory and dairy creams, entirely eliminating harsh grays or pitch blacks. High-frequency quantitative signals are rendered in delicate pastel candy hues that remain clearly legible through luminance control and tinted container backgrounds.

### Color Hierarchy & Roles

- **Canvas Base (`#FAF7F2`):** Warm milk / cream base for the primary canvas background.
- **Card Surfaces (`#FFFFFF`):** Pure cloud white, providing soft elevation against the milky canvas.
- **Primary Accent (`#89C2D9` - Baby Sky Blue):** Main interactive surfaces, focal charts, primary data streams.
- **Secondary Accent (`#E0BBE4` - Lilac Purple):** Secondary nodes, staking accounts, auxiliary operations.
- **Tertiary Accent (`#A8DADC` - Mint Frost / Matcha):** Yield gains, positive delta, active mining rigs.
- **Strawberry Milk Pink (`#F8B4C0`):** Downtrend metrics, drawdowns, negative yield adjustments.
- **Peach Butter Yellow (`#FFE5B4`):** Equity reserves, cautions, pending node handshakes, balance locks.
- **Text & Stroke Inks:**
  - **Heading Ink (`#3D3A45`):** Deep plum slate; soft on the eyes while offering AAA contrast.
  - **Body Ink (`#6C6777`):** Muted lavender slate for standard readings and charts.
  - **Border Stroke (`#F0EAE1`):** Gentle biscuit-tinted borders that keep structure subtle.

## Typography

Typography is set exclusively in **Plus Jakarta Sans**, marrying its friendly, open apertures with geometric balance suitable for financial readouts.

### Hierarchy & Application

- **Numeric Quant Readouts:** Set numerical values at semi-bold or bold weights (`600` or `700`) using tabular figures (`font-variant-numeric: tabular-nums`) to prevent shifting layout during rapid price updates.
- **Headings & Titles:** Utilize generous line-heights and slight negative tracking (`-0.01em` to `-0.02em`) to deliver a compact, bouncy editorial feel.
- **Labels & Micro-Data:** Set badge, node, and status labels in `label-md` or `label-sm` with slight positive tracking to ensure instant scanning across complex algorithmic widgets.

## Layout & Spacing

The layout is structured around an airy, uncluttered 12-column responsive fluid grid designed to lower user cognitive load. Breathing room takes precedence over information crowding.

### Form Factors & Adaptation

- **Mobile (< 768px):** 4 columns, `1.25rem` outer canvas margins, single-column stacked metric cards. Interactive controls expand to minimum 44px tap heights.
- **Tablet (768px - 1024px):** 8 columns, `1.5rem` margins, dual-column analytics widgets.
- **Desktop (> 1024px):** 12 columns, `2.5rem` outer canvas margins, max-width bounded at `1440px` centered to maintain balance on ultra-wide monitors.

Section spacing uses multiples of `space-md` (`1.25rem`) and `space-xl` (`2.5rem`) to frame quant tables with calm, open perimeters.

## Elevation & Depth

Visual hierarchy employs low-contrast pastel layering and diffused drop shadows rather than harsh dark elevations.

### Elevation Tiers

- **Tier 0 (Canvas Base):** Milk cream surface (`#FAF7F2`) with zero elevation.
- **Tier 1 (Surface Cards):** Pure white container (`#FFFFFF`) with a faint pastel drop: `0px 4px 20px -2px rgba(108, 103, 119, 0.04)`. Accompanied by a 1px soft border in `#F2EDE4`.
- **Tier 2 (Floating Modals & Flyouts):** Soft pillowy shadow: `0px 12px 32px -4px rgba(137, 194, 217, 0.14), 0px 4px 12px -2px rgba(61, 58, 69, 0.04)`.
- **Tier 3 (Active Focus / Drag):** Elevated cloud effect: `0px 18px 40px -6px rgba(224, 187, 228, 0.25)`.
- **Atmospheric Backdrops:** Overlays use a frosted blur (`backdrop-filter: blur(12px)`) with 70% opacity cream background (`rgba(250, 247, 242, 0.7)`).

## Shapes

The geometric identity is defined by plush, friendly curves (Pill-shaped level 3).

### Shape Rules

- **Interactive Badges & Buttons:** Fully rounded pills (`border-radius: 9999px`) for action buttons, status pills, and toggle tabs.
- **Cards & Data Panels:** Generously rounded at `1.5rem` to `2rem` (`rounded-2xl` / `rounded-3xl`), eliminating hard corners.
- **Input Fields & Search Bars:** Pill borders (`9999px`) or hyper-rounded `1rem` radius corners.
- **Nested Elements:** Inner elements use proportional corner radii (outer radius minus padding) to maintain consistent curvature.

## Components

### Buttons

- **Primary:** Baby Sky Blue base (`#89C2D9`) with white text, pill shape, zero outline, and soft sky-colored ambient glow (`box-shadow: 0 4px 14px rgba(137, 194, 217, 0.4)`). Scales down gently (`scale(0.97)`) on click with a playful bounce transition (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Secondary / Soft:** Strawberry cream or pastel lilac fill at 15% opacity with solid tinted text and no border.
- **Icon Buttons:** Pure circular white discs with delicate `#F0EAE1` borders and subtle hover lift.

### Chips & Pill Badges

- **Positive Yield / Rig Online:** Mint cream background (`#E8F5E9`) with dark matcha text (`#2E7D32`), featuring a tiny pulsing circular indicator.
- **Drawdown / Warning:** Strawberry milk tint (`#FDE8EC`) with soft rose ink (`#C2415D`).
- **Account / Staking Pool:** Lavender cloud background (`#F3E8FF`) with lilac text (`#6B21A8`).
- **Pill Attributes:** Fixed vertical padding of `4px`, horizontal padding of `12px`, fully rounded pill boundary.

### Cards & Dash Widgets

- **Background & Border:** Pure white background, `1.5rem` to `2rem` corner radius, surrounded by a 1.5px soft pastel stroke (`#F0EAE1`).
- **Card Header:** Title in `headline-sm` accompanied by a cute descriptive pastel chip or circular icon avatar.

### Input Fields & Toggles

- **Inputs:** Milky cloud background (`#FAF7F2`) nested within white cards. Border transitions on focus to a delicate 1.5px Baby Sky Blue ring with a matching `0 0 0 3px rgba(137, 194, 217, 0.2)` soft halo.
- **Toggles:** Pill-shaped switch tracks in muted cream (`#EAE5DC`), switching to matcha or sky blue when active, housing a pure white floating thumb.

### Quantitative Data Visualizations

- **Charts:** Area graphs use gentle semi-transparent pastel gradient fills that fade cleanly to zero at the bottom axis. Grid lines are dotted and set in ultra-faint cream biscuit (`#EFEBE4`).
- **Data Tables:** Alternating rows avoid gray zebra striping; instead, row hovers trigger a creamy peach-yellow wash (`rgba(255, 229, 180, 0.25)`) with rounded row corners.
