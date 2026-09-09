export const getRankingTransition = (reducedMotion) => ({
  initial: { opacity: 0, x: reducedMotion ? 0 : 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: reducedMotion ? 0 : -8 },
  transition: { type: "tween", duration: reducedMotion ? 0.08 : 0.15 },
});

export const getRankingRowMotion = (index, reducedMotion) => ({
  layout: reducedMotion ? false : "position",
  initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
  animate: { opacity: 1, y: 0 },
  whileHover: !reducedMotion && typeof window !== "undefined"
    && window.matchMedia("(hover: hover) and (pointer: fine)").matches ? { x: 3 } : undefined,
  transition: {
    type: "tween",
    layout: { type: "tween", duration: 0.25 },
    opacity: { duration: reducedMotion ? 0.08 : 0.2, delay: reducedMotion ? 0 : index * 0.025 },
    y: { duration: 0.2, delay: reducedMotion ? 0 : index * 0.025 },
    x: { duration: 0.15 },
  },
});
