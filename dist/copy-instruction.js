// src/copy-instruction.ts
import { TAB_PATH } from "tweakers/store";
function buildCopyInstruction(hookName, panelName, values) {
  const { [TAB_PATH]: _activeTab, ...parameters } = values;
  const jsonStr = JSON.stringify(parameters, null, 2);
  if (hookName === "useTweakTimeline" || hookName === "createTweakTimeline") {
    return `Update the ${hookName} configuration for "${panelName}" with these values:

\`\`\`json
${jsonStr}
\`\`\`

Apply these values as the new defaults in the ${hookName} call. Keep the existing \`clip.current\` bindings while this timeline is being authored; do not convert the animation or remove Tweakers yet.

Add this comment immediately above the ${hookName} call as a production handoff note:

\`\`\`tsx
// TODO(production): Tweakers's clip.current values are the scrubbable authoring preview.
// Replace them with equivalent real Motion animations using the tuned timeline
// timings and transitions, then remove ${hookName} and <TweakTimeline />.
\`\`\``;
  }
  return `Update the ${hookName} configuration for "${panelName}" with these values:

\`\`\`json
${jsonStr}
\`\`\`

Apply these values as the new defaults in the ${hookName} call.`;
}
export {
  buildCopyInstruction
};
//# sourceMappingURL=copy-instruction.js.map