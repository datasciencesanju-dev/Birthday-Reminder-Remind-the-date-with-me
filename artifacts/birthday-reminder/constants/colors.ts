/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#182230',
    tint: '#3867d6',

    // Core surfaces
    background: '#f7f8fc',
    foreground: '#182230',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#182230',

    // Primary action color (buttons, links, active states)
    primary: '#3867d6',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#edf1ff',
    secondaryForeground: '#29448d',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eef0f5',
    mutedForeground: '#647083',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#ffedf2',
    accentForeground: '#b33d60',

    // Destructive actions (delete, error states)
    destructive: '#d94d64',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e2e6ef',
    input: '#d4dbe7',
  },

  dark: {
    text: '#f4f6fb',
    tint: '#8ca9ff',
    background: '#101522',
    foreground: '#f4f6fb',
    card: '#182132',
    cardForeground: '#f4f6fb',
    primary: '#8ca9ff',
    primaryForeground: '#101522',
    secondary: '#202d47',
    secondaryForeground: '#d8e2ff',
    muted: '#202735',
    mutedForeground: '#aeb9cc',
    accent: '#46293a',
    accentForeground: '#ffb2c5',
    destructive: '#ff859a',
    destructiveForeground: '#30111a',
    border: '#2b364a',
    input: '#364257',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
