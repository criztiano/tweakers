// src/move-lively.ts
var LIVELY_PRESS = { type: "spring", visualDuration: 0.15, bounce: 0.15 };
var LIVELY_UI = { type: "spring", visualDuration: 0.28, bounce: 0.15 };
var LIVELY_SURFACE = { type: "spring", visualDuration: 0.36, bounce: 0.08 };
var LIVELY_EXIT = { type: "tween", duration: 0.12, ease: [0.4, 0, 1, 1] };
var LIVELY_PRESS_SCALE = 0.97;
var LIVELY_STAGGER = 0.035;
var LIVELY_STAGGER_MAX = 0.2;
function livelyStagger(index, count) {
  if (count <= 1 || index <= 0) return 0;
  const step = Math.min(LIVELY_STAGGER, LIVELY_STAGGER_MAX / (count - 1));
  return Math.min(index, count - 1) * step;
}
var LIVELY_CSS = {
  press: {
    duration: "300ms",
    easing: "linear(0, 0.3505, 0.7432, 0.9336, 0.9951, 1.0062, 1.0045, 1.0019, 1.0005, 1)"
  },
  ui: {
    duration: "550ms",
    easing: "linear(0, 0.1298, 0.3693, 0.5949, 0.7654, 0.8784, 0.9458, 0.9819, 0.9988, 1.0052, 1.0063, 1.0053, 1.0037, 1.0024, 1.0014, 1.0007, 1, 1)"
  },
  surface: {
    duration: "550ms",
    easing: "linear(0, 0.0832, 0.2515, 0.4312, 0.5896, 0.7159, 0.8104, 0.8777, 0.9238, 0.9543, 0.9738, 0.9858, 0.9929, 0.9969, 0.9991, 1.0001, 1, 1)"
  },
  exit: { duration: "120ms", easing: "cubic-bezier(0.4, 0, 1, 1)" }
};
export {
  LIVELY_CSS,
  LIVELY_EXIT,
  LIVELY_PRESS,
  LIVELY_PRESS_SCALE,
  LIVELY_STAGGER,
  LIVELY_STAGGER_MAX,
  LIVELY_SURFACE,
  LIVELY_UI,
  livelyStagger
};
//# sourceMappingURL=move-lively.js.map