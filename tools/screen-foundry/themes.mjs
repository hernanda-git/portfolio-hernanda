// 24 distinct visual themes + 6 typography stacks for true per-product art direction.

export const THEMES = {
  'blueprint-cobalt': {
    dark: false, bg: '#eef3fb', surface: '#ffffff', surface2: '#e4ecf9',
    border: '#cad8ef', borderStrong: '#9fb8e0', text: '#0d1b36', muted: '#4f6282',
    sidebarBg: '#0f2756', sidebarText: '#e6efff', accent2: '#0284c7',
  },
  'paper-editorial': {
    dark: false, bg: '#f6f3ec', surface: '#fffdf9', surface2: '#efe9dc',
    border: '#ddd4c2', borderStrong: '#bfb299', text: '#1d1914', muted: '#655c4e',
    sidebarBg: '#231f1a', sidebarText: '#f4efe6', accent2: '#9a3412',
  },
  'clinical-mint': {
    dark: false, bg: '#f0f7f5', surface: '#ffffff', surface2: '#e2f1ed',
    border: '#c2dfd7', borderStrong: '#8ec2b5', text: '#0d2621', muted: '#496e66',
    sidebarBg: '#0b4f45', sidebarText: '#e6fbf6', accent2: '#0f766e',
  },
  'nord-dev': {
    dark: true, bg: '#151922', surface: '#1d222e', surface2: '#252c3b',
    border: '#313a4e', borderStrong: '#465370', text: '#e8edf7', muted: '#93a2bd',
    sidebarBg: '#10141c', sidebarText: '#cbd5e8', accent2: '#38bdf8',
  },
  'cyber-noir': {
    dark: true, bg: '#090c12', surface: '#111622', surface2: '#171e2e',
    border: '#243049', borderStrong: '#36496e', text: '#eef4ff', muted: '#8598bc',
    sidebarBg: '#06080d', sidebarText: '#c8d6f0', accent2: '#f43f5e',
  },
  'swiss-mono': {
    dark: false, bg: '#f4f4f2', surface: '#ffffff', surface2: '#eaeae6',
    border: '#d5d5cf', borderStrong: '#a6a69e', text: '#121210', muted: '#595952',
    sidebarBg: '#171715', sidebarText: '#f0f0ec', accent2: '#dc2626',
  },
  'industrial-steel': {
    dark: true, bg: '#181b1e', surface: '#22262b', surface2: '#2b3037',
    border: '#3b424c', borderStrong: '#525b68', text: '#f1f3f5', muted: '#9aa3ae',
    sidebarBg: '#121417', sidebarText: '#d6dce2', accent2: '#f59e0b',
  },
  'retail-coral': {
    dark: false, bg: '#fdf4f2', surface: '#ffffff', surface2: '#fce7e3',
    border: '#f2cbc4', borderStrong: '#e39e92', text: '#261210', muted: '#7a524c',
    sidebarBg: '#8c2318', sidebarText: '#fff2f0', accent2: '#ea580c',
  },
  'agro-forest': {
    dark: false, bg: '#f1f6f1', surface: '#ffffff', surface2: '#e3efe3',
    border: '#c3d9c3', borderStrong: '#90b890', text: '#112214', muted: '#4c6650',
    sidebarBg: '#144225', sidebarText: '#eaf7ec', accent2: '#ca8a04',
  },
  'sharia-sand': {
    dark: false, bg: '#f8f5ec', surface: '#ffffff', surface2: '#f1ead7',
    border: '#dfd3b6', borderStrong: '#c1ae82', text: '#241e12', muted: '#6b5e44',
    sidebarBg: '#114232', sidebarText: '#f5efe0', accent2: '#b45309',
  },
  'bloomberg-obsidian': {
    dark: true, bg: '#0b0b0c', surface: '#141517', surface2: '#1d1f23',
    border: '#2b2e35', borderStrong: '#434853', text: '#f5f5f7', muted: '#9298a5',
    sidebarBg: '#070708', sidebarText: '#d9dde6', accent2: '#f59e0b',
  },
  'sovereign-indigo': {
    dark: true, bg: '#131326', surface: '#1b1c36', surface2: '#242647',
    border: '#343766', borderStrong: '#4e528f', text: '#eef0ff', muted: '#9ba1d1',
    sidebarBg: '#0d0d1c', sidebarText: '#d8dcff', accent2: '#a855f7',
  },
  'maritime-navy': {
    dark: false, bg: '#edf2f7', surface: '#ffffff', surface2: '#dfe9f3',
    border: '#bdd0e3', borderStrong: '#89a9c9', text: '#0b1e33', muted: '#46617d',
    sidebarBg: '#0c2b4d', sidebarText: '#e6f1fc', accent2: '#0284c7',
  },
  'coffee-roast': {
    dark: false, bg: '#f7f2ec', surface: '#fffcf8', surface2: '#efe5d8',
    border: '#dccab6', borderStrong: '#bda386', text: '#2b1b12', muted: '#6e5241',
    sidebarBg: '#3c2415', sidebarText: '#f7ece1', accent2: '#d97706',
  },
  'bali-linen': {
    dark: false, bg: '#faf6f0', surface: '#ffffff', surface2: '#f2e8dc',
    border: '#e0cfbc', borderStrong: '#c4ab8e', text: '#292018', muted: '#756250',
    sidebarBg: '#6b4226', sidebarText: '#fbf3ea', accent2: '#0d9488',
  },
  'civic-crimson': {
    dark: false, bg: '#f8f3f3', surface: '#ffffff', surface2: '#f1e5e5',
    border: '#dec7c7', borderStrong: '#be9898', text: '#241212', muted: '#6e4e4e',
    sidebarBg: '#7f1d1d', sidebarText: '#fceaea', accent2: '#1d4ed8',
  },
  'mining-ochre': {
    dark: true, bg: '#1a1713', surface: '#24201a', surface2: '#2f2a22',
    border: '#443c30', borderStrong: '#615644', text: '#f7f3eb', muted: '#b3a58f',
    sidebarBg: '#12100d', sidebarText: '#e8dec9', accent2: '#eab308',
  },
  'studio-daylight': {
    dark: false, bg: '#f3f5f8', surface: '#ffffff', surface2: '#e9eef4',
    border: '#d0dae5', borderStrong: '#a7b8cb', text: '#111c2b', muted: '#52657d',
    sidebarBg: '#1c2b3d', sidebarText: '#edf3f9', accent2: '#2563eb',
  },
  // 6 NEW ULTRA-DISTINCT DESIGN WORLDS
  'teenage-hardware': {
    dark: false, bg: '#e8e7e3', surface: '#f7f6f2', surface2: '#dedcd6',
    border: '#c5c2b9', borderStrong: '#8f8b80', text: '#161614', muted: '#5b5952',
    sidebarBg: '#22211e', sidebarText: '#f4f2ec', accent2: '#ff4f00',
  },
  'kyoto-matcha': {
    dark: false, bg: '#f4f6f0', surface: '#fbfcf8', surface2: '#e7ede0',
    border: '#cbd6be', borderStrong: '#9cb089', text: '#1b2416', muted: '#56684c',
    sidebarBg: '#293b21', sidebarText: '#eef4e8', accent2: '#c2410c',
  },
  'stockbit-cyan': {
    dark: true, bg: '#0c151c', surface: '#12202b', surface2: '#192b3a',
    border: '#243d52', borderStrong: '#375c7a', text: '#e6f4ff', muted: '#85a9c4',
    sidebarBg: '#081016', sidebarText: '#cbe6fa', accent2: '#00d09c',
  },
  'lavender-saas': {
    dark: false, bg: '#f4f2fb', surface: '#ffffff', surface2: '#ebe6f9',
    border: '#d6ccf0', borderStrong: '#b09ee0', text: '#1b1433', muted: '#5e5285',
    sidebarBg: '#2e1d5c', sidebarText: '#f2eeff', accent2: '#7c3aed',
  },
  'gaming-neon': {
    dark: true, bg: '#0f0b1a', surface: '#19132b', surface2: '#231b3d',
    border: '#382b61', borderStrong: '#574394', text: '#f4f0ff', muted: '#a394cf',
    sidebarBg: '#0a0712', sidebarText: '#e1d7ff', accent2: '#ec4899',
  },
  'solar-terracotta': {
    dark: false, bg: '#fbf3eb', surface: '#ffffff', surface2: '#f5e4d3',
    border: '#e6c8ab', borderStrong: '#cc9c70', text: '#2b1a0e', muted: '#7a583d',
    sidebarBg: '#7c2d12', sidebarText: '#fff3e8', accent2: '#0f766e',
  },
};

export const FONTS = {
  'swiss-geometric': {
    heading: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    body: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    mono: '"Cascadia Mono", Consolas, monospace',
  },
  'editorial-serif': {
    heading: 'Georgia, Cambria, "Times New Roman", serif',
    body: '"Segoe UI", Calibri, sans-serif',
    mono: '"Cascadia Mono", Consolas, monospace',
  },
  'industrial-condensed': {
    heading: 'Bahnschrift, "Arial Narrow", "Segoe UI", sans-serif',
    body: '"Segoe UI", Tahoma, sans-serif',
    mono: '"Cascadia Mono", Consolas, monospace',
  },
  'technical-mono': {
    heading: '"Cascadia Mono", Consolas, "Courier New", monospace',
    body: '"Segoe UI", system-ui, sans-serif',
    mono: '"Cascadia Mono", Consolas, monospace',
  },
  'humanist-friendly': {
    heading: '"Trebuchet MS", "Segoe UI", sans-serif',
    body: 'Verdana, "Segoe UI", sans-serif',
    mono: 'Consolas, monospace',
  },
  'brutalist-grotesk': {
    heading: '"Arial Black", Impact, "Segoe UI", sans-serif',
    body: 'Arial, "Helvetica Neue", sans-serif',
    mono: '"Cascadia Mono", Consolas, monospace',
  },
};
