# DentSide Remote — Design System (`design.md`)

**Version:** 2.0.0  
**Palette Foundation:** Grayscale Base (`#111111` · `#6B7280` · `#E5E7EB` · `#FFFFFF`) + Electric Blue (`#2563EB`)  
**Modes:** Light & Dark (`@custom-variant dark` via `.dark` class on `<html>`)

---

## 1. Visual Philosophy & Color Allocation

DentSide Remote is built around an ultra-clean, high-contrast clinical workspace aesthetic. We pair a strict **grayscale structural foundation** with **Electric Blue (`#2563EB`)** reserved for high-intent actions, active clinical workflows, and brand identity.

### 60–30–10 Distribution Rule
- **60% Neutral Canvas**: Crisp `#FFFFFF` in Light Mode / deep Obsidian `#111111` in Dark Mode.
- **30% Structural Surfaces & Dividers**: Elevated surfaces (`#F9FAFB` / `#18181B`), muted bands (`#F3F4F6` / `#202024`), hairline borders (`#E5E7EB` / `#27272A`), and secondary copy (`#6B7280` / `#9CA3AF`).
- **10% Electric Blue Accent (`#2563EB`)**: Primary CTAs, active navigation indicators, active tab states, focus rings, and interactive progress highlights.

---

## 2. Core Color Tokens

### Brand & Grayscale Base

| Role | Hex | Usage |
| :--- | :--- | :--- |
| **Obsidian Ink / Dark Canvas** | `#111111` | Primary text in Light Mode; primary canvas in Dark Mode; high-contrast secondary actions |
| **Neutral Slate Gray** | `#6B7280` | Secondary body copy, muted metadata, placeholder labels, inactive navigation links |
| **Hairline Border / Divider** | `#E5E7EB` | 1px card borders, table dividers, input outlines, structural separators (Light Mode) |
| **Pure White / Light Canvas** | `#FFFFFF` | Primary canvas & elevated cards (Light Mode); primary text & on-accent text (Dark Mode) |
| **Electric Blue (Primary)** | `#2563EB` | Primary buttons, focus indicators, active nav/tab states, interactive highlights |
| **Electric Blue (Hover - Light)** | `#1D4ED8` | Pressed/hover state for `#2563EB` fills in Light Mode |
| **Electric Blue (Hover / Text - Dark)** | `#3B82F6` / `#60A5FA` | Enhanced legibility for blue interactive text & hovers on `#111111` / `#18181B` surfaces |

### Light vs. Dark Semantic CSS Variables (`src/index.css`)

| CSS Variable | Light (`:root`) | Dark (`.dark`) | Tailwind Token (`@theme inline`) |
| :--- | :--- | :--- | :--- |
| `--ds-bg` | `#FFFFFF` | `#111111` | `bg-background` / `bg-surface` |
| `--ds-bg-subtle` | `#F9FAFB` | `#161618` | `bg-surface-container-low` |
| `--ds-surface` | `#FFFFFF` | `#18181B` | `bg-surface-container-lowest` |
| `--ds-surface-muted` | `#F3F4F6` | `#202024` | `bg-surface-container` |
| `--ds-surface-strong` | `#E5E7EB` | `#27272A` | `bg-surface-container-high` |
| `--ds-ink` | `#111111` | `#FFFFFF` | `text-on-surface` / `text-on-background` |
| `--ds-ink-muted` | `#6B7280` | `#9CA3AF` | `text-on-surface-variant` / `text-secondary` |
| `--ds-border` | `#E5E7EB` | `#27272A` | `border-outline-variant` |
| `--ds-accent` | `#2563EB` | `#2563EB` | `bg-primary` / `text-primary` |
| `--ds-accent-hover` | `#1D4ED8` | `#3B82F6` | Hover state for primary fills |
| `--ds-accent-text` | `#2563EB` | `#60A5FA` | Accessible blue link/icon text |
| `--ds-accent-soft` | `#EFF6FF` | `rgba(37, 99, 235, 0.16)` | `bg-primary-fixed` / `bg-secondary-container` |
| `--ds-accent-on-soft` | `#1D4ED8` | `#93C5FD` | `text-on-primary-fixed-variant` |
| `--ds-on-accent` | `#FFFFFF` | `#FFFFFF` | `text-on-primary` |

### Semantic Status Tokens (Accessibility Rule: Never Convey by Color Alone)
Always pair semantic status colors with an explicit label or icon:
- **Verified / Completed / Positive**: `#16A34A` (Light) · `#22C55E` (Dark) on subtle green surface (`rgba(22, 163, 74, 0.12)`)
- **Pending / Warning / Urgent**: `#D97706` (Light) · `#F59E0B` (Dark) on subtle amber surface (`rgba(217, 119, 6, 0.12)`)
- **Emergency / Error / Debit**: `#DC2626` (Light) · `#EF4444` (Dark) on subtle red surface (`rgba(220, 38, 38, 0.12)`)

---

## 3. Typography & Tabular Numerals

- **Display & Headings (`font-headline`)**: `Manrope`, sans-serif (`font-extrabold` / `font-bold`, `tracking-tight`, `text-wrap: balance` on hero headlines).
- **UI & Body Prose (`font-body` / `font-sans`)**: `Inter`, system-ui, sans-serif (`14px–16px`, `line-height: 1.5–1.65`).
- **Clinical & Financial Numerals**: Enforce `tabular-nums` (`font-variant-numeric: tabular-nums`) or `JetBrains Mono` (`font-mono tabular-nums`) on all wallet balances, rates, transaction rows, case fees, CDT codes, and dashboard KPIs.
- **Dark Mode Optical Compensation**: Maintain crisp contrast (`#FFFFFF` / `#D1D5DB` / `#9CA3AF`) on `#111111` and `#18181B` cards so body copy remains sharp without eye strain.

| Scale Role | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- |
| **Hero Display** | `clamp(2.25rem, 4.5vw, 3.75rem)` | `800` | `-0.03em` |
| **Page Title** | `1.5rem–1.875rem` (`24px–30px`) | `700–800` | `-0.02em` |
| **Section Heading** | `1.125rem–1.25rem` (`18px–20px`) | `700` | `-0.015em` |
| **Body Default** | `0.875rem–1rem` (`14px–16px`) | `400–500` | `0` |
| **Caption / Metadata** | `0.75rem–0.8125rem` (`12px–13px`) | `500–600` | `+0.01em` |

---

## 4. Layout, Spacing & Elevation Architecture

- **Single-Elevation Depth**: Cards sit directly on `--ds-bg` using `--ds-surface` with a crisp `1px solid var(--ds-border)` hairline border (`#E5E7EB` light / `#27272A` dark). Avoid nested cards-within-cards or heavy drop shadows.
- **Radius Scale**:
  - Inputs & small buttons: `8px` (`rounded-lg`)
  - Standard buttons & filter bars: `10px–12px` (`rounded-xl`)
  - Primary cards & panels: `16px` (`rounded-2xl`)
  - Modals & dialogs: `20px–24px` (`rounded-2xl` / `rounded-3xl`)
  - Nested radius rule: `r_inner = max(6px, r_outer - padding)`
- **Top Navigation Bar Contract**:
  - Single sticky/fixed row (`h-16`), subtle backdrop blur, bottom `1px` hairline border (`border-outline-variant`).
  - Three balanced zones: Brand wordmark (`DentSide`) · Clean single-line navigation links (`whitespace-nowrap shrink-0`) · Theme toggle + primary action / user menu.
- **Touch & Focus Accessibility**:
  - Minimum interactive height `40px` desktop / `44px` mobile.
  - Visible keyboard focus ring: `2px solid #2563EB` with `2px` offset.
  - Horizontal button padding $\approx 2\times$ vertical padding (`py-2.5 px-5`, `py-2 px-4`).

---

## 5. Component Patterns & Governance

1. **Buttons**:
   - **Primary CTA**: `bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl` (single primary Electric Blue CTA per decision area).
   - **High-Contrast Dark/Light Secondary**: `bg-on-surface text-background` or `bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container`.
   - **Ghost / Link**: `text-on-surface-variant hover:text-on-surface hover:bg-surface-container`.
2. **Cards & Dividers**:
   - Use generous whitespace (`p-6` outer padding, `gap-4`/`gap-6`) and `1px` horizontal hairline dividers (`border-outline-variant`) rather than thick colored left borders (`border-l-4`) or nested bordered islands.
3. **Metadata Hygiene**:
   - Render static metadata (posted dates, categories, degree credentials, locations) as clean inline text separated by typographic dots (`·`) instead of decorative colored pill capsules. Reserve pill/segmented styling strictly for interactive filter tabs and true verification/urgency status badges paired with icons.
4. **Data Tables & Radiograph Viewports**:
   - Wallet statements and client case tables use right-aligned `tabular-nums` currency columns with `44px+` row heights and subtle row hover (`hover:bg-surface-container-low`).
   - Clinical DICOM / radiograph canvas uses pure `#111111` darkroom framing even in Light Mode so dental scans retain diagnostic contrast.
5. **Theme Switching (`ThemeContext`)**:
   - Implemented via `ThemeProvider` (`src/contexts/ThemeContext.tsx`) and `<ThemeToggle />` (`src/components/ThemeToggle.tsx`).
   - Persists preference under `localStorage` (`dentside_theme`), respects system `prefers-color-scheme`, toggles `.dark` on `document.documentElement`, and sets `color-scheme`.
   - Respects `@media (prefers-reduced-motion: reduce)` by disabling transform/slide transitions.
