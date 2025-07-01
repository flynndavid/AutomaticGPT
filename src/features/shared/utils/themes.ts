import { vars } from 'nativewind';

export const themes = {
  light: vars({
    // Modern off-white background (warm, cream-tinted white)
    '--background': '250 250 249',
    '--foreground': '39 39 42',
    // Card uses pure white for better contrast against off-white background
    '--card': '255 255 255',
    '--card-foreground': '39 39 42',
    '--primary': '59 130 246',
    '--primary-foreground': '255 255 255',
    // Adjusted secondary to work with new background
    '--secondary': '245 245 244',
    '--secondary-foreground': '39 39 42',
    // Refined muted colors for better contrast
    '--muted': '247 247 246',
    '--muted-foreground': '115 115 115',
    '--border': '231 229 228',
    // Input uses a more contrasted light gray for better visibility
    '--input': '241 241 240',
    '--accent': '245 245 244',
    '--accent-foreground': '39 39 42',
  }),
  dark: vars({
    // Modern off-black background (warm, slightly purple-tinted dark)
    '--background': '15 15 17',
    '--foreground': '250 250 249',
    // Card uses slightly lighter off-black for layering
    '--card': '24 24 27',
    '--card-foreground': '250 250 249',
    '--primary': '59 130 246',
    '--primary-foreground': '255 255 255',
    // Adjusted secondary to complement new background
    '--secondary': '30 30 34',
    '--secondary-foreground': '212 212 216',
    '--muted': '24 24 27',
    '--muted-foreground': '161 161 170',
    '--border': '60 60 67',
    '--input': '30 30 34',
    '--accent': '30 30 34',
    '--accent-foreground': '212 212 216',
  }),
};
