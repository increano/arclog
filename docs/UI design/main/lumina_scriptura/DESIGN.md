---
name: Lumina Scriptura
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#765700'
  on-tertiary: '#ffffff'
  tertiary-container: '#956e00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  scripture-body:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  scripture-quote:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 34px
  body-regular:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-bold:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  caption:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

The design system is built to transform Bible study into an engaging, habit-forming journey. It targets learners of all ages who seek a consistent spiritual practice but struggle with the density of traditional formats. The brand personality is **encouraging, playful, and luminous**, borrowing heavily from the "gamified learning" movement to lower the barrier to entry for sacred texts.

The aesthetic blends **Modern Gamification** with **Clean Minimalism**. It utilizes high-energy colors and tactile, pill-shaped elements to create a "squishy" and responsive feel. While the UI is vibrant and approachable, the presentation of scripture remains respectful, using sophisticated serif typography to ground the experience in a sense of timeless tradition. The goal is to evoke an emotional response of joy, accomplishment, and peace.

## Colors

The palette is rooted in high-chroma, "joyful" hues that signify different states of the learning journey. 

- **Primary (Sky Blue):** Used for main actions, navigation, and focus states. It represents clarity and guidance.
- **Secondary (Emerald Green):** Dedicated to "Success" states—correct answers, completed lessons, and progress increments.
- **Tertiary (Warm Yellow):** Used for "Delight" elements—achievements, streaks, and premium features. It evokes a sense of enlightenment and warmth.
- **Neutral (Slate):** A soft, blue-tinted gray used for secondary text and borders to maintain a friendly, less-harsh tone than pure black.
- **Backgrounds:** Use a very soft off-white (`#F8FAFC`) to keep the interface feeling airy and lightweight.

## Typography

This design system uses a dual-font strategy to balance playfulness with reverence. 

**Quicksand** is the workhorse for the UI. Its rounded terminals and geometric construction feel approachable and modern. Use it for all functional elements: buttons, instructions, and headers.

**Playfair Display** is reserved exclusively for Bible verses and religious quotations. This high-contrast serif provides the necessary "editorial" weight to the text, signaling to the user that they are engaging with something significant and historic.

On mobile devices, scale down large display headers by 25% to ensure they don't push lesson content below the fold. Maintain generous line-heights (1.5x minimum) for scripture to ensure high legibility during long reading sessions.

## Layout & Spacing

The layout follows a **8pt grid system**, emphasizing vertical rhythm to support scroll-heavy learning content.

- **Mobile:** A single-column layout with 20px side margins. Cards should span the full width minus margins. Use bottom-sheet modals for supplementary information.
- **Desktop/Tablet:** A centered layout with a maximum width of 1200px. Use a 12-column grid. Lessons should be focused in a 6-8 column central container to minimize eye strain.
- **Vertical Spacing:** Use `lg` (40px) or `xl` (64px) spacing between distinct lesson blocks to provide visual "breathing room," preventing the gamified elements from feeling cluttered.

## Elevation & Depth

To achieve a tactile, "clickable" feel, the design system avoids harsh, realistic shadows in favor of **Layered Tonal Depth**.

- **Level 1 (Base Cards):** Use a 2px solid border in a slightly darker shade of the background color (e.g., `#E2E8F0`) combined with a very soft, diffused shadow (10% opacity, 8px blur).
- **Level 2 (Active/Pressed):** When a user interacts with a card or button, the shadow should disappear and the element should translate downwards by 2px, mimicking a physical button press.
- **Modals:** Use a heavy backdrop blur (20px) to keep the focus on the interactive task, with the modal itself sitting on a high-elevation shadow (20% opacity, 24px blur).

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and safe environment for learning. 

- **Standard Elements:** Buttons, input fields, and cards use a 0.5rem (8px) radius.
- **Large Containers:** Content cards and progress sections use a 1rem (16px) radius to feel more like "tiles."
- **Badges/Chips:** Use the `rounded-xl` (24px) setting to create pill shapes for achievements and status indicators.
- **Interactive States:** Buttons should have a 3D effect created by a thicker bottom border (4px) in a darker shade of the button's color, which "flattens" when pressed.

## Components

- **Buttons:** Primary buttons use a thick 4px bottom border (inner shadow technique) to look like physical keys. They should bounce slightly on hover.
- **Progress Bars:** Thick, rounded tracks (`height: 16px`) with a vibrant `Secondary Green` fill. The fill should have a "shine" gradient to look like a liquid or glass tube.
- **Lesson Cards:** White backgrounds with `Level 1` elevation. They feature a large icon or illustration on the left and the lesson title in `Quicksand Bold`.
- **Scripture Blocks:** Styled differently from UI cards; they should have no borders, using subtle background tints (soft cream or very light blue) and the `Playfair Display` font to denote "Sacred Space."
- **Achievement Badges:** Circular or shield-shaped containers using `Tertiary Yellow` and gold gradients. These should trigger a confetti micro-interaction when unlocked.
- **Input Fields:** Large, rounded text areas with `Quicksand Regular`. The focus state should be a 2px `Primary Blue` border.
- **Chips:** Small pill-shaped tags used for "Topic" categories (e.g., "Parables," "Psalms"). Use low-saturation versions of the primary colors for the background with high-contrast text.