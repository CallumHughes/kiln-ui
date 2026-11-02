// Tooltips are hover affordances, and touch browsers emulate hover with the
// first tap: on iOS the tap that should press a button instead shows its
// tooltip, so every button needs tapping twice. Render them only where a
// pointer can actually hover.
export const can_hover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
