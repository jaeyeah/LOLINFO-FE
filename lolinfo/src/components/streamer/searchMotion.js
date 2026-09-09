export const getSearchDropdownMotion = (reducedMotion) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : -4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -4, pointerEvents: "none" },
    transition: { type: "tween", duration: reducedMotion ? 0.08 : 0.15 },
});

export const getSearchResultMotion = (index, reducedMotion) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 4 },
    animate: { opacity: 1, y: 0 },
    transition: {
        type: "tween",
        duration: reducedMotion ? 0.08 : 0.15,
        delay: reducedMotion ? 0 : Math.min(index * 0.02, 0.1),
    },
});
