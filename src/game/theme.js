// Git Quest — visual identity
// Direction: a serene dusk over impossible architecture. Soft, chalky pastels,
// flat-shaded geometry, long gentle shadows. Warmth (sand/terracotta) against
// cool depth (plum/periwinkle), with a single gold light as the objective.

export const PALETTE = {
  // sky gradient (top -> bottom)
  skyTop: "#F6C9B8",
  skyMid: "#C9A6D6",
  skyBottom: "#7E72B8",

  // architecture
  sand: "#F3E2D0",
  sandWarm: "#ECCDB2",
  sandShadow: "#D8B79A",
  terracotta: "#E08763",
  teal: "#5FB7B3",
  plum: "#6E5B92",
  deepPlum: "#4A3B6B",

  // light + ink
  gold: "#F4C95D",
  goldSoft: "#F7DD9A",
  cream: "#FBF3E9",
  ink: "#3A2F52",
};

// three-friendly numeric versions where needed
export const HEX = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, v])
);

// rank titles unlocked as you clear islands (mirrors the original badges)
export const RANKS = [
  "Wanderer", "Time Traveler", "Repo Founder", "Committer", "Historian",
  "Brancher", "Merge Master", "Cloud Engineer", "Collaborator", "Curator",
  "Time Mender", "Quartermaster", "Release Manager", "History Architect", "Git Sage",
];
