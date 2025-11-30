# Tapestry Design Guide (Neo-Brutalism)

This document outlines the styling conventions for Tapestry, following a **Neo-Brutalist** aesthetic. This guide is intended for both human developers and AI agents to ensure consistency across the application.

## Core Philosophy

-   **Raw & Bold**: High contrast, thick borders, hard shadows.
-   **Functional yet Playful**: Use distinct, exaggerated UI elements that feel tactile.
-   **Accessible**: Despite the "brutal" name, maintain high readability and proper contrast ratios.
-   **Dark Mode Support**: All Neo-Brutalist tokens (borders, shadows) must adapt to dark mode using semantic variables.

## Design Tokens

### Borders

-   **Standard Width**: `border-2`
-   **Color**: `border-border` (Semantic variable).
    -   In Light Mode: `oklch(0 0 0)` (Black)
    -   In Dark Mode: `oklch(1 0 0)` (White)
-   **Usage**: Almost all containers (Cards, Dialogs, Inputs, Buttons) should have a `border-2 border-border`.

### Shadows

-   **Hard Shadows**: No blur. Distinct directional offset.
-   **Token**: `shadow-[4px_4px_0px_0px_var(--shadow-color)]` (Standard)
    -   For smaller elements (buttons, badges): `shadow-[2px_2px_0px_0px_var(--shadow-color)]`
    -   For hover states: Increase offset, e.g., `shadow-[6px_6px_0px_0px_var(--shadow-color)]`
-   **Color**: `var(--shadow-color)` (Always black `#000000`, even in dark mode, to maintain contrast against background).

### Radius

-   **Standard**: `rounded-md` or `rounded-xl`.
-   **Note**: While brutalism often uses sharp corners, our "Neo" variation allows for slight rounding to soften the harshness while keeping the bold definition.

### Colors

-   **Background**: `bg-background` (Off-white/Cream in light, Dark in dark)
-   **Card Background**: `bg-card` (White in light, Darker Gray in dark)
-   **Primary**: `bg-primary` (Vibrant Purple)
-   **Secondary**: `bg-secondary` (Vibrant Orange/Yellow)
-   **Text**: `text-foreground` (Black in light, White in dark)

## Component Patterns

### 1. Buttons

**Style**:
```tsx
className="border-2 border-border shadow-[2px_2px_0px_0px_var(--shadow-color)] bg-primary text-primary-foreground font-bold uppercase hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
```

-   **Hover Effect**: The button should visually "lift" (translate up/left) and the shadow should grow.
-   **Active/Pressed Effect**: The button should "press" down (translate down/right) and the shadow should disappear or shrink.

### 2. Inputs & Selects

**Style**:
```tsx
className="h-12 border-2 border-border bg-input shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all"
```

-   **Interaction**: On focus, the element should "press" down to flatten against the page (remove shadow, translate).

### 3. Cards

**Style**:
```tsx
className="rounded-xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_var(--shadow-color)]"
```

-   **Hover (Interactive Cards)**:
    ```tsx
    hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all
    ```

### 4. Dialogs & Modals

-   **Overlay**: `bg-black/50` (Standard dimming).
-   **Content**:
    ```tsx
    border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow-color)]
    ```
-   **Headers**: Solid colors (e.g., `bg-primary`) with `border-b-2 border-border`. Text should be `uppercase tracking-tight` and `font-black`.

## Typography

-   **Headings**: `font-black`, `uppercase`, `tracking-tight`.
-   **Body**: Standard sans-serif (`DM Sans` / `Inter`).
-   **Labels**: `font-bold`, often `uppercase`.

## Dark Mode Implementation

DO NOT use hardcoded colors like `border-black` or `bg-white` for structural elements. Always use semantic tokens:

-   ❌ `border-black` (Invisible in dark mode against dark background)
-   ✅ `border-border` (Auto-switches to white in dark mode)

-   ❌ `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` (Hardcoded black shadow)
-   ✅ `shadow-[4px_4px_0px_0px_var(--shadow-color)]` (System variable)

## Common Utilities (Tailwind)

The `globals.css` includes custom utility classes for convenience:

-   `.neo-card`: Applies standard border and shadow.
-   `.neo-button`: Applies standard button styles.

*Prefer using the full Tailwind classes in components for granularity, but these serve as the reference implementation.*

