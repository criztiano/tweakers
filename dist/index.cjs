"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ADSR_DEF: () => ADSR_DEF,
  ADSR_STAGE_MAX: () => ADSR_STAGE_MAX,
  ANGLE_DEAD_ZONE_PX: () => ANGLE_DEAD_ZONE_PX,
  AUDIO_DEF: () => AUDIO_DEF,
  COLOR_FORMATS: () => COLOR_FORMATS,
  CURVE_CYCLE: () => CURVE_CYCLE,
  CURVE_DEF: () => CURVE_DEF,
  CURVE_DEFAULT_HEIGHT: () => CURVE_DEFAULT_HEIGHT,
  CURVE_FIT_PADDING: () => CURVE_FIT_PADDING,
  CURVE_LABELS: () => CURVE_LABELS,
  CURVE_MAX_CLIPS: () => CURVE_MAX_CLIPS,
  CURVE_MAX_DURATION: () => CURVE_MAX_DURATION,
  CURVE_MAX_HEIGHT: () => CURVE_MAX_HEIGHT,
  CURVE_MIN_DURATION: () => CURVE_MIN_DURATION,
  CURVE_MIN_HEIGHT: () => CURVE_MIN_HEIGHT,
  CURVE_SAMPLE_COUNT: () => CURVE_SAMPLE_COUNT,
  CurveComposer: () => CurveComposer,
  DEFAULT_GRADIENT: () => DEFAULT_GRADIENT,
  DEFAULT_TRANSFER: () => DEFAULT_TRANSFER,
  DEFAULT_TRIGGER_STEPS: () => DEFAULT_TRIGGER_STEPS,
  ENV_BEND_STAGES: () => ENV_BEND_STAGES,
  ENV_SUSTAIN_WAVE_BEATS: () => ENV_SUSTAIN_WAVE_BEATS,
  ENV_WAVE_STAGES: () => ENV_WAVE_STAGES,
  FILTER_DB_CEIL: () => FILTER_DB_CEIL,
  FILTER_DB_FLOOR: () => FILTER_DB_FLOOR,
  ICON_MOVE_CAPTURE: () => ICON_MOVE_CAPTURE,
  ICON_MOVE_ENTER: () => ICON_MOVE_ENTER,
  LFO_DEF: () => LFO_DEF,
  LFO_SYNC_DIVISIONS: () => LFO_SYNC_DIVISIONS,
  ListScreen: () => ListScreen,
  MIN_STOPS: () => MIN_STOPS,
  MOD_COLORS: () => MOD_COLORS,
  MOD_PAGE_DIALS: () => MOD_PAGE_DIALS,
  MOD_RING_CIRCUMFERENCE: () => MOD_RING_CIRCUMFERENCE,
  MOD_RING_RADIUS: () => MOD_RING_RADIUS,
  MOD_SETTINGS_PANEL: () => MOD_SETTINGS_PANEL,
  MOD_SLOTS: () => MOD_SLOTS,
  MOD_TOUCH_GRACE_MS: () => import_ModulationStore5.MOD_TOUCH_GRACE_MS,
  MOVE_BAND_H: () => MOVE_BAND_H,
  MOVE_BAND_W: () => MOVE_BAND_W,
  MOVE_CHIP_BUTTONS: () => MOVE_CHIP_BUTTONS,
  MOVE_COLOR_HUES: () => MOVE_COLOR_HUES,
  MOVE_COLOR_PALETTES: () => MOVE_COLOR_PALETTES,
  MOVE_COLOR_STEPS: () => MOVE_COLOR_STEPS,
  MOVE_COLOR_WHEEL: () => MOVE_COLOR_WHEEL,
  MOVE_CONNECTION_ASK_EVENT: () => MOVE_CONNECTION_ASK_EVENT,
  MOVE_CONNECTION_EVENT: () => MOVE_CONNECTION_EVENT,
  MOVE_DECK_MAX: () => MOVE_DECK_MAX,
  MOVE_DIALS: () => MOVE_DIALS,
  MOVE_FLOAT_SELECTOR: () => MOVE_FLOAT_SELECTOR,
  MOVE_FUNCTION_BUTTONS: () => MOVE_FUNCTION_BUTTONS,
  MOVE_FUNCTION_ICONS: () => MOVE_FUNCTION_ICONS,
  MOVE_FUNCTION_MANIFEST: () => MOVE_FUNCTION_MANIFEST,
  MOVE_GATE_GRID: () => MOVE_GATE_GRID,
  MOVE_GAUGE: () => MOVE_GAUGE,
  MOVE_GRADIENT_STOPS: () => MOVE_GRADIENT_STOPS,
  MOVE_JOG_CLICK_EVENT: () => MOVE_JOG_CLICK_EVENT,
  MOVE_JOG_EVENT: () => MOVE_JOG_EVENT,
  MOVE_LATCH_EVENT: () => MOVE_LATCH_EVENT,
  MOVE_MULTIBAND_GRID: () => MOVE_MULTIBAND_GRID,
  MOVE_MUTE_EVENT: () => MOVE_MUTE_EVENT,
  MOVE_NOTIFY_GAP: () => MOVE_NOTIFY_GAP,
  MOVE_NOTIFY_KINDS: () => MOVE_NOTIFY_KINDS,
  MOVE_OPACITY_PADS: () => MOVE_OPACITY_PADS,
  MOVE_OVERRIDE_EVENT: () => MOVE_OVERRIDE_EVENT,
  MOVE_PADS: () => MOVE_PADS,
  MOVE_PAD_LIBRARY: () => MOVE_PAD_LIBRARY,
  MOVE_PAGE_EVENT: () => MOVE_PAGE_EVENT,
  MOVE_PAGE_SELECT_EVENT: () => MOVE_PAGE_SELECT_EVENT,
  MOVE_PALETTE: () => MOVE_PALETTE,
  MOVE_SEARCH_EVENT: () => MOVE_SEARCH_EVENT,
  MOVE_SETTINGS_EVENT: () => MOVE_SETTINGS_EVENT,
  MOVE_SLOT_LIBRARY: () => MOVE_SLOT_LIBRARY,
  MOVE_SPECIAL_BUTTONS: () => MOVE_SPECIAL_BUTTONS,
  MOVE_STAGE: () => MOVE_STAGE,
  MOVE_STEP_FUNCTIONS: () => MOVE_STEP_FUNCTIONS,
  MOVE_STRIP_EVENT: () => MOVE_STRIP_EVENT,
  MOVE_TIMELINE_MAX_ZOOM: () => MOVE_TIMELINE_MAX_ZOOM,
  MOVE_TOUCH_EVENT: () => MOVE_TOUCH_EVENT,
  MOVE_TRACKS: () => MOVE_TRACKS,
  MOVE_TRACK_COLORS: () => MOVE_TRACK_COLORS,
  MOVE_VIEW_MOTIONS: () => MOVE_VIEW_MOTIONS,
  MOVE_VIEW_PRESENTATION: () => MOVE_VIEW_PRESENTATION,
  MOVE_VIEW_WAIT: () => MOVE_VIEW_WAIT,
  MOVE_VOLUME_EVENT: () => MOVE_VOLUME_EVENT,
  MOVE_VOLUME_TAP_EVENT: () => MOVE_VOLUME_TAP_EVENT,
  MOVE_WAVEFORM_DEMO_SECONDS: () => MOVE_WAVEFORM_DEMO_SECONDS,
  MOVE_WAVEFORM_PADS: () => MOVE_WAVEFORM_PADS,
  MOVE_WAVEFORM_PANEL: () => MOVE_WAVEFORM_PANEL,
  MOVE_WAVEFORM_PIXEL_RANGE: () => MOVE_WAVEFORM_PIXEL_RANGE,
  MOVE_WAVEFORM_STEPS: () => MOVE_WAVEFORM_STEPS,
  MOVE_WAVE_FRAME: () => MOVE_WAVE_FRAME,
  MOVE_WAVE_MAX_DISPLAY: () => MOVE_WAVE_MAX_DISPLAY,
  MOVE_WAVE_MAX_HEIGHT: () => MOVE_WAVE_MAX_HEIGHT,
  MOVE_WAVE_MAX_WIDTH: () => MOVE_WAVE_MAX_WIDTH,
  ModRing: () => ModRing,
  ModulationStore: () => import_ModulationStore5.ModulationStore,
  MoveActionButton: () => MoveActionButton,
  MoveActionDeck: () => MoveActionDeck,
  MoveColorStore: () => MoveColorStore,
  MoveConnection: () => MoveConnection,
  MoveConnectionDot: () => MoveConnectionDot,
  MoveFunctionChips: () => MoveFunctionChips,
  MoveFunctions: () => MoveFunctions,
  MoveGateDisplay: () => MoveGateDisplay,
  MoveGateMeter: () => MoveGateMeter,
  MoveMultibandDisplay: () => MoveMultibandDisplay,
  MoveMultibandMeter: () => MoveMultibandMeter,
  MoveNotifications: () => MoveNotifications,
  MovePadActionBody: () => MovePadActionBody,
  MovePadAppBody: () => MovePadAppBody,
  MovePadBandBody: () => MovePadBandBody,
  MovePadColorBody: () => MovePadColorBody,
  MovePadFadeBody: () => MovePadFadeBody,
  MovePadIconBody: () => MovePadIconBody,
  MovePadIconLabelBody: () => MovePadIconLabelBody,
  MovePadListBody: () => MovePadListBody,
  MovePadListStore: () => MovePadListStore,
  MovePadLoopBody: () => MovePadLoopBody,
  MovePadTabsBody: () => MovePadTabsBody,
  MovePadToggleBody: () => MovePadToggleBody,
  MovePadValueBody: () => MovePadValueBody,
  MovePadWaveBody: () => MovePadWaveBody,
  MovePanel: () => MovePanel,
  MovePresetStore: () => MovePresetStore,
  MoveSearchStore: () => MoveSearchStore,
  MoveSettingsView: () => MoveSettingsView,
  MoveSlot: () => MoveSlot,
  MoveSlotChannelBody: () => MoveSlotChannelBody,
  MoveSlotColorBody: () => MoveSlotColorBody,
  MoveSlotDefaultBody: () => MoveSlotDefaultBody,
  MoveSlotDialBody: () => MoveSlotDialBody,
  MoveSlotEnumBody: () => MoveSlotEnumBody,
  MoveSlotEnvBody: () => MoveSlotEnvBody,
  MoveSlotFilterBody: () => MoveSlotFilterBody,
  MoveSlotGateBody: () => MoveSlotGateBody,
  MoveSlotGlyph: () => MoveSlotGlyph,
  MoveSlotMetronomeBody: () => MoveSlotMetronomeBody,
  MoveSlotMultibandBody: () => MoveSlotMultibandBody,
  MoveSlotNumericBody: () => MoveSlotNumericBody,
  MoveSlotOffsetBody: () => MoveSlotOffsetBody,
  MoveSlotPlaybackDrawing: () => MoveSlotPlaybackDrawing,
  MoveSlotRampBody: () => MoveSlotRampBody,
  MoveSlotRangeBody: () => MoveSlotRangeBody,
  MoveSlotReadout: () => MoveSlotReadout,
  MoveSlotScopeBody: () => MoveSlotScopeBody,
  MoveSlotShape: () => MoveSlotShape,
  MoveSlotToggleBody: () => MoveSlotToggleBody,
  MoveSlotTransferBody: () => MoveSlotTransferBody,
  MoveSlotTrimSpanBody: () => MoveSlotTrimSpanBody,
  MoveSlotVectorBody: () => MoveSlotVectorBody,
  MoveSlotXYBody: () => MoveSlotXYBody,
  MoveSurfaceStore: () => MoveSurfaceStore,
  MoveTimeline: () => MoveTimeline,
  MoveTimelineClock: () => MoveTimelineClock,
  MoveTimelineStore: () => MoveTimelineStore,
  MoveTimelineZoom: () => MoveTimelineZoom,
  MoveViewStage: () => MoveViewStage,
  MoveViews: () => MoveViews,
  MoveVolumeDisplay: () => MoveVolumeDisplay,
  MoveWaveform: () => MoveWaveform,
  MoveWaveformStore: () => MoveWaveformStore,
  PresetExplorationStore: () => PresetExplorationStore,
  SH_DEF: () => SH_DEF,
  TAB_PATH: () => import_TweakStore19.TAB_PATH,
  TRANSFER_MAX_POINTS: () => TRANSFER_MAX_POINTS,
  TRANSFER_MIN_GAP: () => TRANSFER_MIN_GAP,
  TimelineStore: () => TimelineStore,
  TweakStore: () => import_TweakStore19.TweakStore,
  WAVEFORM_BASE_BUCKET: () => WAVEFORM_BASE_BUCKET,
  WAVEFORM_MAX_ZOOM: () => WAVEFORM_MAX_ZOOM,
  WAVEFORM_MODES: () => WAVEFORM_MODES,
  WAVEFORM_SMOOTH_POINTS: () => WAVEFORM_SMOOTH_POINTS,
  WaveformVisualization: () => WaveformVisualization,
  XY_DEFAULT_STEP: () => XY_DEFAULT_STEP,
  XY_DETENT_PX: () => XY_DETENT_PX,
  addDriver: () => addDriver,
  addStop: () => addStop,
  angleFromPointer: () => angleFromPointer,
  applyDetentAxis: () => applyDetentAxis,
  applyModulation: () => applyModulation,
  arcPath: () => arcPath,
  audioModLevel: () => audioModLevel,
  bearingToValue: () => bearingToValue,
  breedDNA: () => breedDNA,
  buildModMovePage: () => buildModMovePage,
  buildMovePages: () => buildMovePages,
  buildMoveStrip: () => buildMoveStrip,
  buildSamplers: () => buildSamplers,
  buildWaveformLevels: () => buildWaveformLevels,
  centerValue: () => centerValue,
  chooseParents: () => chooseParents,
  clamp: () => clamp2,
  clampCurveHeight: () => clampCurveHeight,
  clampOklchToSrgb: () => clampOklchToSrgb,
  clampRange: () => clampRange,
  clampStripOffset: () => clampStripOffset,
  cloneDNA: () => cloneDNA,
  collectGenes: () => collectGenes,
  colorAtPosition: () => colorAtPosition,
  createMoveMeter: () => createMoveMeter,
  curveComposition: () => curveComposition,
  curveDuration: () => curveDuration,
  curvePathData: () => curvePathData,
  curveY: () => curveY,
  cycleDriverType: () => cycleDriverType,
  cycleSegmentType: () => cycleSegmentType,
  defaultComposition: () => defaultComposition,
  defaultFilterResponse: () => defaultFilterResponse,
  defaultListItemParams: () => import_TweakStore19.defaultListItemParams,
  denormalizeEnumDial: () => denormalizeEnumDial,
  denormalizeFilterDial: () => denormalizeFilterDial,
  denormalizeRangeDial: () => denormalizeRangeDial,
  denormalizeToggleDial: () => denormalizeToggleDial,
  dialOrigin: () => dialOrigin,
  dialSpan: () => dialSpan,
  displayHex: () => displayHex,
  drawMoveGate: () => drawMoveGate,
  drawMoveMultiband: () => drawMoveMultiband,
  enumOptionIcon: () => enumOptionIcon,
  envCurveParam: () => envCurveParam,
  envStageWave: () => envStageWave,
  envWaveFlipParam: () => envWaveFlipParam,
  envWaveParam: () => envWaveParam,
  envelopeJoints: () => envelopeJoints,
  envelopePoints: () => envelopePoints,
  fillRangePeaks: () => fillRangePeaks,
  filterHand01: () => filterHand01,
  filterHandValue: () => filterHandValue,
  filterResponsePath: () => filterResponsePath,
  filterShapePath: () => filterShapePath,
  filterShapeResponse: () => filterShapeResponse,
  flipDriver: () => flipDriver,
  flipDriverX: () => flipDriverX,
  flipDriverY: () => flipDriverY,
  flipSegment: () => flipSegment,
  flipSegmentX: () => flipSegmentX,
  flipSegmentY: () => flipSegmentY,
  followWindow: () => followWindow,
  formatClock: () => formatClock,
  formatHex: () => formatHex,
  formatTimelineTick: () => formatTimelineTick,
  geneBounds: () => geneBounds,
  getAudioModBuffer: () => getAudioModBuffer,
  getAudioModVersion: () => getAudioModVersion,
  getAudioModWindow: () => getAudioModWindow,
  getModType: () => getModType,
  gradientFillBox: () => gradientFillBox,
  gradientToCss: () => gradientToCss,
  gradientToTransform: () => gradientToTransform,
  groupListFields: () => import_TweakStore19.groupListFields,
  handleLeftStyles: () => handleLeftStyles,
  hintDomId: () => import_TweakStore19.hintDomId,
  hslToRgb: () => hslToRgb,
  hsvToRgb: () => hsvToRgb,
  insertPoint: () => insertPoint,
  invertY: () => invertY,
  isIdentityTransfer: () => isIdentityTransfer,
  isMoveDial: () => isMoveDial,
  isMoveTabs: () => isMoveTabs,
  isNamedTabs: () => isNamedTabs,
  isOutsideSpan: () => isOutsideSpan,
  isPadSpanContinuation: () => isPadSpanContinuation,
  isSpanContinuation: () => isSpanContinuation,
  isStripSlot: () => isStripSlot,
  isToggleDial: () => isToggleDial,
  lfoSyncedHz: () => lfoSyncedHz,
  listModTypes: () => listModTypes,
  loopFromStep: () => loopFromStep,
  loopSteps: () => loopSteps,
  modColor: () => modColor,
  modKey: () => modKey,
  modPageLayout: () => modPageLayout,
  modPageWidth: () => modPageWidth,
  modRingArc: () => modRingArc,
  morphDNA: () => morphDNA,
  moveAppPadRow: () => moveAppPadRow,
  moveBandCell: () => moveBandCell,
  moveBandCuts: () => moveBandCuts,
  moveChannelPosition: () => moveChannelPosition,
  moveEdgesCell: () => moveEdgesCell,
  moveGateDemoReading: () => moveGateDemoReading,
  moveGateSpan: () => moveGateSpan,
  moveGaugeBearing: () => moveGaugeBearing,
  moveKitOptions: () => moveKitOptions,
  moveMultibandDemoReading: () => moveMultibandDemoReading,
  moveMultibandRole: () => moveMultibandRole,
  moveMultibandSpan: () => moveMultibandSpan,
  moveNotify: () => moveNotify,
  moveNumericDrawing: () => moveNumericDrawing,
  movePadRows: () => movePadRows,
  movePlaybackMode: () => movePlaybackMode,
  movePoint: () => movePoint,
  moveScreenChecked: () => moveScreenChecked,
  moveScreenRowLabel: () => moveScreenRowLabel,
  moveScreenRowSearchText: () => moveScreenRowSearchText,
  moveSearchFilter: () => moveSearchFilter,
  moveSearchMatch: () => moveSearchMatch,
  moveSlotKind: () => moveSlotKind,
  moveStop: () => moveStop,
  moveTabCell: () => moveTabCell,
  moveTrimSpan: () => moveTrimSpan,
  moveVectorAxes: () => moveVectorAxes,
  moveVectorStage: () => moveVectorStage,
  moveViewChoreography: () => moveViewChoreography,
  moveVisualReading: () => moveVisualReading,
  moveWaveformDefaultStyle: () => defaultStyle,
  moveWaveformDefaultView: () => defaultView,
  moveWaveformDemoSample: () => moveWaveformDemoSample,
  moveWaveformStyleFromValues: () => styleFromValues,
  moveWheelSlot: () => moveWheelSlot,
  nearestHandle: () => nearestHandle,
  nearestPoint: () => nearestPoint,
  newDNAId: () => newDNAId,
  normToValue: () => normToValue,
  normalizeAngle: () => normalizeAngle,
  normalizeCurveMarkers: () => normalizeCurveMarkers,
  normalizeDeck: () => normalizeDeck,
  normalizeDial: () => normalizeDial,
  normalizeEnumDial: () => normalizeEnumDial,
  normalizeFilterDial: () => normalizeFilterDial,
  normalizeFilterValue: () => normalizeFilterValue,
  normalizeGradient: () => normalizeGradient,
  normalizeHex: () => normalizeHex,
  normalizeListItems: () => import_TweakStore19.normalizeListItems,
  normalizeRangeDial: () => normalizeRangeDial,
  normalizeToggleDial: () => normalizeToggleDial,
  normalizeTransfer: () => normalizeTransfer,
  normalizeValue: () => normalizeValue,
  normalizeXYDial: () => normalizeXYDial,
  notifyDockBottom: () => notifyDockBottom,
  nudge: () => nudge,
  nudgeAngle: () => nudgeAngle,
  oklchToRgb: () => oklchToRgb,
  opacityPercent: () => opacityPercent,
  orderRange: () => orderRange,
  packTimelineRows: () => packTimelineRows,
  padPosition: () => padPosition,
  padSection: () => padSection,
  padSpan: () => padSpan,
  pageStripOffset: () => pageStripOffset,
  parseHex: () => parseHex,
  parseListItemSchema: () => import_TweakStore19.parseListItemSchema,
  percentToValue: () => percentToValue,
  pickDragTarget: () => pickDragTarget,
  plotCurve: () => plotCurve,
  pointFromValue: () => pointFromValue,
  presetFlowerSeed: () => presetFlowerSeed,
  presetFlowerSvg: () => presetFlowerSvg,
  rampCss: () => rampCss,
  rangesDuration: () => rangesDuration,
  readComposition: () => readComposition,
  reconcileDNA: () => reconcileDNA,
  redistributeWeight: () => redistributeWeight,
  registerModType: () => registerModType,
  removeDriver: () => removeDriver,
  removePoint: () => removePoint,
  removeSegment: () => removeSegment,
  removeStop: () => removeStop,
  resolveAxis: () => resolveAxis,
  resolveFilterAxis: () => resolveFilterAxis,
  rgbToHsl: () => rgbToHsl,
  rgbToHsv: () => rgbToHsv,
  rgbToOklch: () => rgbToOklch,
  sampleTransfer: () => sampleTransfer,
  scrubBy: () => scrubBy,
  seedDNA: () => seedDNA,
  setAudioModBuffer: () => setAudioModBuffer,
  setAudioModWindowSource: () => setAudioModWindowSource,
  setDriverAnticipate: () => setDriverAnticipate,
  setDriverCurvature: () => setDriverCurvature,
  setDriverOvershoot: () => setDriverOvershoot,
  setDriverSteepness: () => setDriverSteepness,
  setGradientAngle: () => setGradientAngle,
  setGradientCenter: () => setGradientCenter,
  setGradientRotation: () => setGradientRotation,
  setGradientScale: () => setGradientScale,
  setGradientSquash: () => setGradientSquash,
  setGradientType: () => setGradientType,
  setHigh: () => setHigh,
  setLow: () => setLow,
  setSegmentAnticipate: () => setSegmentAnticipate,
  setSegmentCurvature: () => setSegmentCurvature,
  setSegmentOvershoot: () => setSegmentOvershoot,
  setSegmentSteepness: () => setSegmentSteepness,
  setStopColor: () => setStopColor,
  shiftSpan: () => shiftSpan,
  slotGroups: () => slotGroups,
  snapAngle: () => snapAngle,
  snapToStep: () => snapToStep,
  splitSegment: () => splitSegment,
  springify: () => springify,
  stepPosition: () => stepPosition,
  stepStripOffset: () => stepStripOffset,
  stripDialColumns: () => stripDialColumns,
  stripDialSlots: () => stripDialSlots,
  stripOffsets: () => stripOffsets,
  stripSlotCount: () => stripSlotCount,
  stripSlotIndex: () => stripSlotIndex,
  stripStarts: () => stripStarts,
  stripWindowPads: () => stripWindowPads,
  subscribeAudioMod: () => subscribeAudioMod,
  timelineClock: () => timelineClock,
  timelineRowHeight: () => timelineRowHeight,
  timelineTicks: () => timelineTicks,
  timelineWindow: () => timelineWindow,
  toAudioBuffer: () => toAudioBuffer,
  transferLut: () => transferLut,
  triggerLevels: () => triggerLevels,
  triggersCrossed: () => triggersCrossed,
  useMoveTimeline: () => useMoveTimeline,
  valueFromPoint: () => valueFromPoint,
  valueToBearing: () => valueToBearing,
  valueToNorm: () => valueToNorm,
  valueToPercent: () => valueToPercent,
  visibleColumns: () => visibleColumns,
  visibleModControls: () => visibleModControls,
  visibleWindow: () => visibleWindow,
  waveformAsset: () => waveformAsset,
  waveformAssetFromBuffer: () => waveformAssetFromBuffer,
  zoomBy: () => zoomBy,
  zoomWindow: () => zoomWindow
});
module.exports = __toCommonJS(index_exports);

// src/move-palette.ts
var MOVE_PALETTE = {
  /* the hues, in the order a colour wheel runs */
  red: "#fd3c57",
  // hardware 2
  orange: "#fd6b59",
  // hardware 4
  yellow: "#f2cf43",
  // hardware 29
  lime: "#a3f243",
  // hardware 31
  emerald: "#00ed95",
  // hardware 32
  blue: "#698eff",
  // hardware 125
  indigo: "#8660c3",
  // hardware 19
  pink: "#fe92d5",
  // hardware 25
  /* the neutrals, which the hardware has no use for — its unlit state is
     darkness, and its dimmed colours are the hues' own twins */
  white: "#ffffff",
  grayLight: "#cac5cc",
  gray: "#555162",
  black: "#0e0e16",
  brown: "#856643"
};
var MOVE_TRACK_COLORS = [
  MOVE_PALETTE.blue,
  MOVE_PALETTE.pink,
  MOVE_PALETTE.orange,
  MOVE_PALETTE.lime
];

// src/move-functions.ts
var import_TweakStore = require("tweakers/store");
var MOVE_FUNCTION_MANIFEST = [
  { name: "play" },
  { name: "rec" },
  { name: "mute" },
  { name: "undo" },
  { name: "copy" },
  { name: "delete" },
  { name: "up" },
  { name: "down" },
  { name: "left" },
  { name: "right" },
  { name: "sample", special: true },
  { name: "loop", special: true },
  { name: "capture", special: true },
  { name: "menu", special: true },
  { name: "back", special: true },
  { name: "jog_click", special: true },
  /* The Shift layer of the step row: the sixteen labels printed under the
     step buttons, in step order (`step` is the index). Four steps carry no
     print and are named by position. Holding Shift on the hardware lights
     the label icon under each one the app carries; a press arrives with
     `step` set. `host` marks the two schwung keeps for itself (Settings on
     Shift+Step 2, Tools on Shift+Step 13): attachable, never delivered. */
  { name: "set_overview", step: 0 },
  { name: "setup", step: 1, host: true },
  { name: "workflow", step: 2 },
  { name: "step4", step: 3 },
  { name: "tempo", step: 4 },
  { name: "metronome", step: 5 },
  { name: "groove", step: 6 },
  { name: "pitches_16", step: 7 },
  { name: "scale", step: 8 },
  { name: "full_velocity", step: 9 },
  { name: "repeat", step: 10 },
  { name: "step12", step: 11 },
  { name: "step13", step: 12, host: true },
  { name: "step14", step: 13 },
  { name: "double_loop", step: 14 },
  { name: "quantize", step: 15 }
];
var MOVE_FUNCTION_BUTTONS = MOVE_FUNCTION_MANIFEST.map((b) => b.name);
var MOVE_STEP_FUNCTIONS = MOVE_FUNCTION_MANIFEST.filter((b) => "step" in b).map((b) => b.name);
var MOVE_SPECIAL_BUTTONS = MOVE_FUNCTION_MANIFEST.filter((b) => "special" in b && b.special).map((b) => b.name);
var MOVE_CHIP_BUTTONS = ["sample", "capture", "mute", "loop"];
var MoveFunctionsClass = class {
  constructor() {
    this.handlers = /* @__PURE__ */ new Map();
    this.overlays = /* @__PURE__ */ new Map();
    this.options = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.runListeners = /* @__PURE__ */ new Set();
    /** One set per standing `suspend`: the attachments it put to sleep —
     *  attached, but not in the view that took the surface. Views stack (a
     *  wait over the settings room), so a button sleeps while any of them
     *  holds it, and each lets go on its own. */
    this.holds = [];
  }
  handler(name) {
    const entries = this.overlays.get(name);
    return entries?.[entries.length - 1]?.handler ?? this.handlers.get(name);
  }
  option(name) {
    const entries = this.overlays.get(name);
    const overlay = entries?.[entries.length - 1];
    return overlay ? overlay.options : this.options.get(name);
  }
  isDormant(name) {
    return this.holds.some((hold) => hold.sealed ? !hold.keep.includes(name) : hold.asleep.has(name));
  }
  /** An attachment made while views are suspended belongs to the view in
   *  front — live under every hold that is not sealed. */
  wake(name) {
    for (const hold of this.holds) hold.asleep.delete(name);
  }
  /**
   * Attach an action to a function button; returns a detach function.
   * One action per button — attaching again replaces the previous one.
   */
  attach(name, handler, options) {
    if (!MOVE_FUNCTION_BUTTONS.includes(name)) {
      console.warn(`[tweakers] "${name}" is not a Move function button; expected one of: ${MOVE_FUNCTION_BUTTONS.join(", ")}`);
      return () => {
      };
    }
    import_TweakStore.TweakStore.noteMoveKitUse("functions");
    this.handlers.set(name, handler);
    if (options) this.options.set(name, options);
    else this.options.delete(name);
    this.wake(name);
    this.notify();
    return () => {
      if (this.handlers.get(name) === handler) {
        this.handlers.delete(name);
        this.options.delete(name);
        this.notify();
      }
    };
  }
  /** The attached button names — what the kit claims on the hardware. */
  list() {
    return [.../* @__PURE__ */ new Set([...this.handlers.keys(), ...this.overlays.keys()])].filter((name) => !this.isDormant(name));
  }
  /**
   * Another view takes the surface — the settings room — and the app's
   * buttons do not belong in it: a key that does nothing there must be
   * dark there. Everything attached goes dormant except `keep`; whatever is
   * attached or pushed while the view is up is the view's own and stays
   * live. The kit reads `list`, so the keys go dark on the hardware and
   * the chips leave the header, with no second bookkeeping. The returned
   * release wakes what this suspend put to sleep. Suspends stack — a wait
   * can stand over the settings room — and release in any order: a button
   * sleeps while any standing suspend still holds it.
   *
   * `sealed` is a wait's suspend: nothing wakes under it but `keep`. The
   * view behind a wait stays mounted and goes on attaching as its state
   * moves, and none of that may light a key while the app works.
   */
  suspend(keep = [], options = {}) {
    const attached = [.../* @__PURE__ */ new Set([...this.handlers.keys(), ...this.overlays.keys()])];
    const hold = { asleep: new Set(attached.filter((name) => !keep.includes(name))), sealed: !!options.sealed, keep: [...keep] };
    this.holds.push(hold);
    this.notify();
    return () => {
      const at2 = this.holds.indexOf(hold);
      if (at2 < 0) return;
      this.holds.splice(at2, 1);
      this.notify();
    };
  }
  /**
   * The attachments the panel's chip row shows, in manifest order. A chip
   * renders only for a MOVE_CHIP_BUTTONS key, only while a handler is
   * attached, and only with a `label` — a chip says what the button does in
   * this app, so an attachment that names nothing shows nothing (the key
   * still lights). `chip: false` hides one outright. A push overlay
   * replaces the underlying chip while it holds the button — the chip
   * always says what a press runs right now.
   */
  chips() {
    return MOVE_FUNCTION_MANIFEST.filter((b) => MOVE_CHIP_BUTTONS.includes(b.name) && this.handler(b.name) && !this.isDormant(b.name)).map((b) => ({ name: b.name, options: this.option(b.name) })).filter(({ options }) => options?.chip !== false && !!options?.label).map(({ name, options }) => ({
      name,
      label: options.label,
      ...typeof options.chip === "object" && options.chip.variant ? { variant: options.chip.variant } : {},
      ...typeof options.chip === "object" && options.chip.color != null && options.chip.color in MOVE_PALETTE ? { color: options.chip.color } : {}
    }));
  }
  /**
   * Attach on top of whatever is there; the returned release puts the
   * latest app attachment back, including reattachments while it was open. For overlays that borrow a button while they
   * are open — the preset navigator takes Back, and hands it back on close.
   */
  push(name, handler, options) {
    const entry = { handler, options };
    const stack = this.overlays.get(name) ?? [];
    stack.push(entry);
    this.overlays.set(name, stack);
    this.wake(name);
    import_TweakStore.TweakStore.noteMoveKitUse("functions");
    this.notify();
    return () => {
      const entries = this.overlays.get(name);
      if (!entries?.includes(entry)) return;
      const remaining = entries.filter((item) => item !== entry);
      if (remaining.length) this.overlays.set(name, remaining);
      else this.overlays.delete(name);
      this.notify();
    };
  }
  /** The screen name an attachment carries, if any. */
  label(name) {
    return this.option(name)?.label;
  }
  /** Run the action attached to a button, if any. Called by the kit per press. */
  run(name, press) {
    const full = { name, shift: !!press?.shift, hold: !!press?.hold, ...typeof press?.step === "number" ? { step: press.step } : {} };
    if (this.isDormant(name)) return;
    this.handler(name)?.(full);
    for (const l of this.runListeners) l(name, full);
  }
  /** Notified when attachments change, so the kit can reconfigure the Move. */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /** Notified on every run — the MovePanel flashes its pills on hardware presses. */
  subscribeRuns(listener) {
    this.runListeners.add(listener);
    return () => this.runListeners.delete(listener);
  }
  notify() {
    for (const l of this.listeners) l();
  }
};
var MoveFunctions = new MoveFunctionsClass();

// src/move-pad-list.ts
var import_TweakStore2 = require("tweakers/store");
var MovePadListStoreClass = class {
  constructor() {
    this.attachments = /* @__PURE__ */ new Map();
    this.view = null;
    this.listeners = /* @__PURE__ */ new Set();
    this.version = 0;
    this.releases = [];
    this.subscribe = (listener) => {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    };
    this.getVersion = () => this.version;
    this.getView = () => this.view;
  }
  key(panelId, path) {
    return JSON.stringify([panelId, path]);
  }
  notify() {
    this.version++;
    for (const listener of this.listeners) listener();
  }
  has(panelId, path) {
    return this.attachments.has(this.key(panelId, path));
  }
  selected(panelId, path) {
    return [...this.attachments.get(this.key(panelId, path))?.selected ?? []];
  }
  /** A single list's current choice — what its closed pad shows. Null for a checked
   *  list, for a list that keeps its own name, or before anything is chosen. */
  choice(panelId, path) {
    const attachment = this.attachments.get(this.key(panelId, path));
    if (!attachment?.config.single || attachment.config.keepLabel) return null;
    return attachment.config.options.find((option) => option.value === attachment.selected[0]) ?? null;
  }
  attach(panelId, path, config) {
    import_TweakStore2.TweakStore.noteMoveKitUse("padList");
    const key = this.key(panelId, path);
    const previous = this.attachments.get(key);
    const valid2 = new Set(config.options.map((option) => option.value));
    const kept = config.single ? config.selected ?? previous?.selected : previous?.selected ?? config.selected;
    const attachment = { config, selected: [...new Set(kept ?? [])].filter((value) => valid2.has(value)).slice(0, config.single ? 1 : void 0), cursor: previous?.cursor ?? 0, submission: previous?.submission ?? { pending: false } };
    this.attachments.set(key, attachment);
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    this.notify();
    return () => {
      if (this.attachments.get(key) !== attachment) return;
      if (this.view?.panelId === panelId && this.view.path === path) this.close();
      this.attachments.delete(key);
      this.notify();
    };
  }
  open(panelId, path) {
    const attachment = this.attachments.get(this.key(panelId, path));
    if (!attachment || import_TweakStore2.TweakStore.isDisabled(panelId, path)) return;
    this.close();
    const { config } = attachment;
    const single = config.single === true;
    const chosen = single ? config.options.findIndex((option) => option.value === attachment.selected[0]) : -1;
    const cursor = chosen >= 0 ? chosen : Math.min(attachment.cursor, Math.max(0, config.options.length - 1));
    this.view = { panelId, path, label: config.label ?? path, submitLabel: config.submitLabel, options: config.options, selected: [...attachment.selected], cursor, pending: attachment.submission.pending, error: null, single };
    this.releases = [
      MoveFunctions.push("back", () => this.close(), { label: "close list" }),
      MoveFunctions.push("sample", () => this.toggleCursor(), { label: "select" }),
      MoveFunctions.push("up", () => this.move(-1)),
      MoveFunctions.push("down", () => this.move(1)),
      MoveFunctions.push("jog_click", () => this.toggleCursor(), { label: "select", chip: false }),
      MoveFunctions.push("capture", () => {
        if (single) this.toggleCursor();
        else void this.submit();
      }, { label: config.submitLabel ?? config.label ?? "run selected", chip: false })
    ];
    this.notify();
  }
  /** The same pad opens its list, then becomes its submission action. */
  activate(panelId, path) {
    if (this.view?.panelId === panelId && this.view.path === path) {
      if (this.view.single) return this.toggleCursor();
      return this.submit();
    }
    this.open(panelId, path);
  }
  toggle(panelId, path) {
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    else this.open(panelId, path);
  }
  close() {
    if (!this.view) return;
    this.view = null;
    for (const release of this.releases.splice(0).reverse()) release();
    this.notify();
  }
  setCursor(index) {
    if (!this.view || this.view.pending || !Number.isFinite(index)) return;
    const cursor = Math.max(0, Math.min(this.view.options.length - 1, Math.round(index)));
    if (cursor === this.view.cursor) return;
    this.view = { ...this.view, cursor };
    this.save();
    this.notify();
  }
  move(delta) {
    if (this.view) this.setCursor(this.view.cursor + Math.sign(delta));
  }
  toggleCursor() {
    const view = this.view;
    const option = view?.options[view.cursor];
    if (!view || view.pending || !option) return;
    if (view.single) {
      this.view = { ...view, selected: [option.value], error: null };
      this.save();
      return this.submit();
    }
    const selected = view.selected.includes(option.value) ? view.selected.filter((value) => value !== option.value) : [...view.selected, option.value];
    this.view = { ...view, selected, error: null };
    this.save();
    this.notify();
  }
  save() {
    const view = this.view;
    if (!view) return;
    const attachment = this.attachments.get(this.key(view.panelId, view.path));
    if (attachment) {
      attachment.selected = [...view.selected];
      attachment.cursor = view.cursor;
    }
  }
  async submit() {
    const view = this.view;
    if (!view || view.pending) return;
    if (!view.selected.length) {
      this.view = { ...view, error: "Select at least one item, then tap the pad again." };
      this.notify();
      return;
    }
    const attachment = this.attachments.get(this.key(view.panelId, view.path));
    if (!attachment || attachment.submission.pending) return;
    attachment.submission.pending = true;
    const pending = { ...view, pending: true, error: null };
    this.view = pending;
    this.notify();
    try {
      await attachment.config.onSubmit([...view.selected]);
      attachment.submission.pending = false;
      if (this.attachments.get(this.key(view.panelId, view.path))?.submission === attachment.submission && this.view?.panelId === view.panelId && this.view.path === view.path) this.close();
    } catch (error) {
      attachment.submission.pending = false;
      if (this.attachments.get(this.key(view.panelId, view.path))?.submission !== attachment.submission || this.view?.panelId !== view.panelId || this.view.path !== view.path) return;
      this.view = { ...this.view, pending: false, error: error instanceof Error ? error.message : "Could not start. Tap the pad again to retry." };
      this.notify();
    }
  }
};
var MovePadListStore = new MovePadListStoreClass();

// src/components/MovePadList.tsx
var import_react3 = require("react");

// src/components/move-slots.tsx
var import_react2 = require("react");

// src/move-visual-core.ts
var clamp01 = (value) => Math.max(0, Math.min(1, value));
var between = (value, min, max) => value >= min && value <= max;
function moveNumericDrawing(meta, value) {
  const visual = meta.moveVisual;
  const { min, max } = meta;
  if (meta.type !== "slider" || !visual || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  const lo = min;
  const hi = max;
  const v = Math.max(lo, Math.min(hi, value));
  switch (visual.kind) {
    case "opacity": {
      const opaque = visual.opaqueValue ?? 1;
      if (!Number.isFinite(opaque) || opaque <= 0 || lo < 0 || hi > opaque) return null;
      return { kind: "opacity", alpha: v / opaque };
    }
    case "blur":
      return lo >= 0 ? { kind: "blur", radius: v } : null;
    case "pan": {
      const left = visual.left ?? -1;
      const center = visual.center ?? 0;
      const right = visual.right ?? 1;
      if (![left, center, right].every(Number.isFinite) || left >= center || center >= right || lo < left || hi > right) return null;
      const position = v <= center ? (v - left) / (center - left) / 2 : 0.5 + (v - center) / (right - center) / 2;
      return { kind: "pan", position: clamp01(position) };
    }
    case "stereo-width": {
      const mono = visual.mono ?? 0;
      const unity = visual.unity ?? 1;
      if (![mono, unity].every(Number.isFinite) || unity <= mono || lo < mono || hi <= mono) return null;
      return {
        kind: "stereo-width",
        separation: (v - mono) / (hi - mono),
        unity: between(unity, lo, hi) ? (unity - mono) / (hi - mono) : null
      };
    }
    case "pitch":
      if (visual.unit !== void 0 && visual.unit !== "semitones" && visual.unit !== "cents") return null;
      return { kind: "pitch", position: (v - lo) / (hi - lo), zero: between(0, lo, hi) ? -lo / (hi - lo) : null };
    case "trim":
      if (visual.edge !== "start" && visual.edge !== "end") return null;
      return { kind: "trim", edge: visual.edge, position: clamp01((v - lo) / (hi - lo)) };
    case "offset": {
      const origin = visual.origin;
      if (!Number.isFinite(origin) || origin < 0 || origin > 1) return null;
      return {
        kind: "offset",
        origin,
        position: clamp01(origin + v / (hi - lo)),
        back: lo < 0 && origin > 0,
        forward: hi > 0 && origin < 1
      };
    }
    default:
      return null;
  }
}
function moveTrimSpan(start, startValue, end, endValue) {
  const a = moveNumericDrawing(start, startValue);
  const b = moveNumericDrawing(end, endValue);
  if (a?.kind !== "trim" || a.edge !== "start" || b?.kind !== "trim" || b.edge !== "end") return null;
  return { start: a.position, end: b.position };
}
function moveGateSpan(dials) {
  const roles = ["threshold", "lookahead", "release"];
  if (dials.length !== 3) return null;
  const at2 = dials.map(([meta, value], i) => {
    const { min, max } = meta;
    const visual = meta.moveVisual;
    if (meta.type !== "slider" || visual?.kind !== "gate" || visual.role !== roles[i] || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
    return clamp01((value - min) / (max - min));
  });
  if (at2.some((p) => p === null)) return null;
  return { threshold: at2[0], lookahead: at2[1], release: at2[2] };
}
function moveVectorAxes(dials) {
  if (dials.length !== 3) return null;
  const axes = ["x", "y", "z"];
  const at2 = dials.map(([meta, value], i) => {
    const visual = meta.moveVisual;
    if (visual?.kind !== "axis" || visual.axis !== axes[i]) return null;
    return sliderPosition(meta, value);
  });
  if (at2.some((p) => p === null)) return null;
  const y = dials[1][0].moveVisual;
  return { x: at2[0], y: at2[1], z: at2[2], down: y?.kind === "axis" && y.down === true };
}
var MOVE_STAGE = { width: 240, height: 48 };
var STAGE_FLOOR = { near: 44, far: 16, half: 114, farScale: 0.44 };
var STAGE_MARK = { near: 5.5, far: 2.5 };
function moveVectorStage(x01, y01, z01, down = false) {
  const cx = MOVE_STAGE.width / 2;
  const x = clamp01(x01);
  const t = clamp01(z01);
  const lift = down ? 1 - clamp01(y01) : clamp01(y01);
  const lerp2 = (a, b, k) => a + (b - a) * k;
  const floorY = (k) => lerp2(STAGE_FLOOR.near, STAGE_FLOOR.far, k);
  const halfAt = (k) => STAGE_FLOOR.half * lerp2(1, STAGE_FLOOR.farScale, k);
  const across = (u, k) => cx + (u * 2 - 1) * halfAt(k);
  const r2 = (n) => Math.round(n * 100) / 100;
  const floor = `M${r2(across(0, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 0))} ${STAGE_FLOOR.near}L${r2(across(1, 1))} ${STAGE_FLOOR.far}L${r2(across(0, 1))} ${STAGE_FLOOR.far}Z`;
  const rules = [
    ...[0.25, 0.5, 0.75].map((k) => `M${r2(across(0, k))} ${r2(floorY(k))}L${r2(across(1, k))} ${r2(floorY(k))}`),
    ...[0.25, 0.5, 0.75].map((u) => `M${r2(across(u, 0))} ${STAGE_FLOOR.near}L${r2(across(u, 1))} ${STAGE_FLOOR.far}`)
  ].join("");
  const footX = across(x, t);
  const footY = floorY(t);
  const r = lerp2(STAGE_MARK.near, STAGE_MARK.far, t);
  const headroom = (footY - r - 2) * 0.9;
  const markY = footY - lift * headroom;
  return {
    floor,
    rules,
    foot: { x: r2(footX), y: r2(footY), rx: r2(r * 1.3), ry: r2(r * 0.45) },
    stalk: { x: r2(footX), y1: r2(footY), y2: r2(markY) },
    mark: { x: r2(footX), y: r2(markY), r: r2(r) },
    depth: `M${r2(across(0, t))} ${r2(footY)}L${r2(across(1, t))} ${r2(footY)}`
  };
}
function sliderPosition(meta, value) {
  const { min, max } = meta;
  if (meta.type !== "slider" || typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  return clamp01((value - min) / (max - min));
}
function moveChannelPosition(meta, value) {
  return meta?.moveVisual?.kind === "channel" ? sliderPosition(meta, value) : null;
}
function moveMultibandRole(meta) {
  const visual = meta?.moveVisual;
  return meta?.type === "slider" && visual?.kind === "multiband" ? visual.role : null;
}
function moveMultibandSpan(dials, bands) {
  const roles = dials.map(([meta]) => moveMultibandRole(meta));
  if (dials.length < 3 || roles[0] !== "amount" || roles[1] !== "speed" || roles.slice(2).some((r) => r !== "band")) return null;
  const amount = sliderPosition(...dials[0]);
  const speed = sliderPosition(...dials[1]);
  if (amount === null || speed === null) return null;
  const drawn = [];
  for (const [meta, value] of bands) {
    const visual = meta.moveVisual;
    const position = sliderPosition(meta, value);
    if (visual?.kind !== "multiband" || visual.role !== "band" || position === null || !Number.isFinite(visual.band)) return null;
    drawn.push({ meta, position, band: visual.band });
  }
  drawn.sort((a, b) => a.band - b.band);
  return { amount, speed, bands: drawn.map(({ meta, position }) => ({ meta, position })) };
}
function movePlaybackMode(meta, value) {
  if (meta.type !== "select" || meta.moveVisual?.kind !== "playback" || typeof value !== "string") return null;
  if (!meta.options?.some((option) => (typeof option === "string" ? option : option.value) === value)) return null;
  const modes = meta.moveVisual.modes;
  if (modes !== void 0 && (typeof modes !== "object" || modes === null || Array.isArray(modes))) return null;
  const mode = modes ? Object.prototype.hasOwnProperty.call(modes, value) ? modes[value] : void 0 : value;
  return mode === "forward" || mode === "reverse" || mode === "ping-pong" || mode === "scissors" ? mode : null;
}
function moveVisualReading(meta, value) {
  if (meta.formatValue) return meta.formatValue(value);
  const number = Number(value.toFixed(2)).toString();
  if (meta.unit) return `${number}${meta.unit}`;
  if (!moveNumericDrawing(meta, value)) return number;
  const visual = meta.moveVisual;
  switch (visual.kind) {
    case "opacity":
      return `${Number((value / (visual.opaqueValue ?? 1) * 100).toFixed(1))}%`;
    case "blur":
      return `${number} px`;
    case "pan": {
      const center = visual.center ?? 0;
      if (value === center) return "C";
      const extent = value < center ? center - (visual.left ?? -1) : (visual.right ?? 1) - center;
      return `${value < center ? "L" : "R"} ${Number((Math.abs(value - center) / extent * 100).toFixed(1))}%`;
    }
    case "stereo-width":
      return value === (visual.mono ?? 0) ? "Mono" : `${Number(((value - (visual.mono ?? 0)) / ((visual.unity ?? 1) - (visual.mono ?? 0))).toFixed(2))}\xD7`;
    case "pitch":
      return `${value > 0 ? "+" : ""}${number} ${visual.unit === "cents" ? "ct" : "st"}`;
    case "trim":
      return `${number} s`;
    default:
      return number;
  }
}
function moveKeyboardValue(meta, value, key, fine = false) {
  const direction = key === "ArrowRight" || key === "ArrowUp" || key === "PageUp" ? 1 : key === "ArrowLeft" || key === "ArrowDown" || key === "PageDown" ? -1 : 0;
  if (!direction && key !== "Home" && key !== "End") return null;
  if (meta.type === "select") {
    const options = meta.options ?? [];
    if (!options.length) return null;
    const optionValue2 = (option) => typeof option === "string" ? option : option.value;
    const index = Math.max(0, options.findIndex((option) => optionValue2(option) === value));
    const next2 = key === "Home" ? 0 : key === "End" ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + direction));
    return optionValue2(options[next2]);
  }
  const { min, max } = meta;
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  if (key === "Home") return min;
  if (key === "End") return max;
  const range = max - min;
  if (meta.step === 0) {
    const delta = range / (fine ? 1e3 : key.startsWith("Page") ? 10 : 100);
    return Math.max(min, Math.min(max, Number((value + direction * delta).toPrecision(12))));
  }
  const step = meta.step && Number.isFinite(meta.step) && meta.step > 0 ? meta.step : range / 100;
  const coarseSteps = Math.max(1, Math.round(range / 100 / step));
  const multiplier = fine ? 1 : key.startsWith("Page") ? coarseSteps * 10 : coarseSteps;
  const next = Math.round((value + direction * step * multiplier) / step) * step;
  return Math.max(min, Math.min(max, Number(next.toPrecision(12))));
}
var MOVE_BAND_W = 79;
var MOVE_BAND_H = 39;
var BAND_SLANT = 4;
var BAND_SHOULDER = 8;
function moveBandCuts(low, high) {
  const W = MOVE_BAND_W;
  const H = MOVE_BAND_H;
  const xl = clamp01(low) * W;
  const xh = Math.max(xl, clamp01(high) * W);
  let topL = xl + BAND_SLANT;
  let topR = xh - BAND_SLANT;
  if (topL > topR) topL = topR = (topL + topR) / 2;
  const k = Math.min(BAND_SHOULDER, (topR - topL) / 2);
  const dx = BAND_SLANT * k / H;
  const n = (v) => Number(v.toFixed(2));
  return {
    low: `M 0 0 L ${n(topL + k)} 0 Q ${n(topL)} 0 ${n(topL - dx)} ${n(k)} L ${n(xl)} ${H} L 0 ${H} Z`,
    high: `M ${W} 0 L ${n(topR - k)} 0 Q ${n(topR)} 0 ${n(topR + dx)} ${n(k)} L ${n(xh)} ${H} L ${W} ${H} Z`
  };
}

// src/icons.ts
var ICON_CHEVRON_RIGHT = "M9.5 6L15.5 12L9.5 18";
var ICON_CHEVRON_LEFT = "M14.5 6L8.5 12L14.5 18";
var ICON_ELLIPSIS = [
  { cx: "5.5", cy: "12" },
  { cx: "12", cy: "12" },
  { cx: "18.5", cy: "12" }
];
var ICON_CHECK = "M5 12.75L10 19L19 5";
var ICON_SEARCH = "M10.5 4.5C7.18629 4.5 4.5 7.18629 4.5 10.5C4.5 13.8137 7.18629 16.5 10.5 16.5C13.8137 16.5 16.5 13.8137 16.5 10.5C16.5 7.18629 13.8137 4.5 10.5 4.5ZM15 15L20 20";
var ICON_PLAY = "M9.24394 2.36758C7.41419 1.18362 5 2.49701 5 4.67639V19.3238C5 21.5032 7.41419 22.8166 9.24394 21.6326L20.5624 14.3089C22.2371 13.2253 22.2372 10.775 20.5624 9.69129L9.24394 2.36758Z";
var ICON_LOOP = [
  "M17 2L21 6L17 10",
  "M3 11V9C3 7.34315 4.34315 6 6 6H21",
  "M7 22L3 18L7 14",
  "M21 13V15C21 16.6569 19.6569 18 18 18H3"
];
var ICON_CLOSE = "M6 6L18 18M6 18L18 6";
var ICON_MOVE_CAPTURE = {
  viewBox: "0 0 14 14",
  path: "M1 0H5V2H2V5H0V0H1ZM2 10V12H5V14H0V9H2V10ZM10 0H14V5H12V2H9V0H10ZM14 10V14H9V12H12V9H14V10Z"
};
var ICON_MOVE_ENTER = {
  viewBox: "0 0 12 12",
  circle: { cx: "6", cy: "6", r: "6" }
};
var ICON_MOVE_LOOP = {
  viewBox: "0 0 14 14",
  paths: ["M10 1L12.5 3.5L10 6", "M1.5 7.5V6C1.5 4.61929 2.61929 3.5 4 3.5H12", "M4 13L1.5 10.5L4 8", "M12.5 6.5V8C12.5 9.38071 11.3807 10.5 10 10.5H2"]
};
var ICON_MOVE_COPY = {
  viewBox: "0 0 14 14",
  paths: [
    "M5.5 5.5H12.5V12.5H5.5V5.5Z",
    "M3.5 8.5H2.5C1.94772 8.5 1.5 8.05228 1.5 7.5V2.5C1.5 1.94772 1.94772 1.5 2.5 1.5H7.5C8.05228 1.5 8.5 1.94772 8.5 2.5V3.5"
  ]
};
var MOVE_GLYPH_TEXT_FONT = "Helvetica, 'Helvetica Neue', Arial, system-ui, sans-serif";
var MOVE_GLYPH_DOT = {
  viewBox: ICON_MOVE_ENTER.viewBox,
  size: 12,
  circles: [ICON_MOVE_ENTER.circle]
};
var MOVE_GLYPH_STEP = {
  viewBox: "0 0 14 14",
  size: 14,
  paths: ["M3 1.5H11V9.5H3V1.5Z", "M4.5 12.5H9.5"]
};
var MOVE_FUNCTION_ICONS = {
  play: { viewBox: "0 0 14 14", size: 14, paths: ["M4 2.5L11.5 7L4 11.5V2.5Z"] },
  rec: {
    viewBox: "0 0 14 14",
    size: 14,
    paths: ["M7 2.5A4.5 4.5 0 1 0 7 11.5A4.5 4.5 0 1 0 7 2.5Z"],
    circles: [{ cx: "7", cy: "7", r: "2" }]
  },
  /* Mute is a letter, not a drawing: the "M", set in Helvetica on the same
     14px grid as the drawn marks. */
  mute: { viewBox: "0 0 14 14", size: 14, text: "M" },
  undo: {
    viewBox: "0 0 14 14",
    size: 14,
    paths: ["M5.5 2.5L3 5L5.5 7.5", "M3 5H8.5C10.7091 5 12.5 6.79086 12.5 9V9C12.5 11.2091 10.7091 13 8.5 13H5.5"]
  },
  copy: { viewBox: ICON_MOVE_COPY.viewBox, size: 14, paths: [...ICON_MOVE_COPY.paths] },
  delete: { viewBox: "0 0 14 14", size: 14, paths: ["M3.25 3.25L10.75 10.75", "M10.75 3.25L3.25 10.75"] },
  up: { viewBox: "0 0 14 14", size: 14, paths: ["M3.5 8.75L7 5.25L10.5 8.75"] },
  down: { viewBox: "0 0 14 14", size: 14, paths: ["M3.5 5.25L7 8.75L10.5 5.25"] },
  left: { viewBox: "0 0 14 14", size: 14, paths: ["M8.75 3.5L5.25 7L8.75 10.5"] },
  right: { viewBox: "0 0 14 14", size: 14, paths: ["M5.25 3.5L8.75 7L5.25 10.5"] },
  /* Sampling wears the enter dot — the surface's second confirm. */
  sample: MOVE_GLYPH_DOT,
  loop: { viewBox: ICON_MOVE_LOOP.viewBox, size: 14, paths: [...ICON_MOVE_LOOP.paths] },
  capture: { viewBox: ICON_MOVE_CAPTURE.viewBox, size: 14, fills: [ICON_MOVE_CAPTURE.path] },
  menu: { viewBox: "0 0 14 14", size: 14, paths: ["M2.5 3.5H11.5", "M2.5 7H11.5", "M2.5 10.5H11.5"] },
  back: { viewBox: "0 0 14 14", size: 14, paths: ["M5.5 3L2.5 6L5.5 9", "M2.5 6H9.5C11.1569 6 12.5 7.34315 12.5 9V11.5"] },
  jog_click: MOVE_GLYPH_DOT,
  /* The Shift layer — one stand-in mark for now (see MOVE_GLYPH_STEP). */
  set_overview: MOVE_GLYPH_STEP,
  setup: MOVE_GLYPH_STEP,
  workflow: MOVE_GLYPH_STEP,
  step4: MOVE_GLYPH_STEP,
  tempo: MOVE_GLYPH_STEP,
  metronome: MOVE_GLYPH_STEP,
  groove: MOVE_GLYPH_STEP,
  pitches_16: MOVE_GLYPH_STEP,
  scale: MOVE_GLYPH_STEP,
  full_velocity: MOVE_GLYPH_STEP,
  repeat: MOVE_GLYPH_STEP,
  step12: MOVE_GLYPH_STEP,
  step13: MOVE_GLYPH_STEP,
  step14: MOVE_GLYPH_STEP,
  double_loop: MOVE_GLYPH_STEP,
  quantize: MOVE_GLYPH_STEP
};
var LUCIDE_ICONS = {
  /* directions and traversal */
  "arrow-right": ["M5 12h14", "m12 5 7 7-7 7"],
  "arrow-left": ["M19 12H5", "m12 19-7-7 7-7"],
  "arrow-left-right": ["M8 3 4 7l4 4", "M4 7h16", "m16 21 4-4-4-4", "M20 17H4"],
  "fold-horizontal": [
    "M2 12h6",
    "M22 12h-6",
    "M12 2v2",
    "M12 8v2",
    "M12 14v2",
    "M12 20v2",
    "m19 9-3 3 3 3",
    "m5 15 3-3-3-3"
  ],
  scissors: [
    "M20 4 8.12 15.88",
    "M14.47 14.48 20 20",
    "M8.12 8.12 12 12",
    "M6 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
    "M6 15a3 3 0 1 0 0 6 3 3 0 1 0 0-6"
  ],
  /* signal character */
  "grid-2x2": ["M12 3v18", "M3 12h18", "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  waves: [
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
  ],
  "audio-lines": ["M2 10v3", "M6 6v11", "M10 3v18", "M14 8v7", "M18 5v13", "M22 10v3"],
  /* switches — what a boolean is about, drawn */
  repeat: ["m17 2 4 4-4 4", "M3 11v-1a4 4 0 0 1 4-4h14", "m7 22-4-4 4-4", "M21 13v1a4 4 0 0 1-4 4H3"],
  timer: ["M10 2h4", "M12 14l3-3", "M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"],
  /* actions — what a button does, drawn beside its name */
  x: ["M18 6 6 18", "m6 6 12 12"],
  "brush-cleaning": [
    "m16 22-1-4",
    "M19 13.99a1 1 0 0 0 1-1V12a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v.99a1 1 0 0 0 1 1",
    "M5 14h14l1.973 6.767A1 1 0 0 1 20 22H4a1 1 0 0 1-.973-1.233z",
    "m8 22 1-4"
  ],
  sparkles: [
    "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
    "M20 3v4",
    "M22 5h-4",
    "M4 17v2",
    "M5 18H3"
  ],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  download: ["M12 15V3", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "m7 10 5 5 5-5"],
  wrench: ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"],
  headphones: ["M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"],
  /* restoration — the polish page's five switches */
  "broom-sparkles": [
    "M11 2v2",
    "M12 3h-2",
    "M13.5 10.5 22 2",
    "M14.734 13.841a2 2 0 00-.314-2.42L12.58 9.58a2 2 0 00-2.421-.314l-7.657 4.461A1 1 0 002.3 15.3l6.403 6.403a1 1 0 001.571-.204z",
    "M20 15v4",
    "M22 17h-4",
    "M4 4v4",
    "m5 18 2-2",
    "M6 6H2",
    "m7.699 10.7 5.602 5.601"
  ],
  stethoscope: [
    "M11 2v2",
    "M5 2v2",
    "M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1",
    "M8 15a6 6 0 0 0 12 0v-3",
    "M20 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4"
  ],
  "file-volume": [
    "M4 11.55V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-1.95",
    "M14 2v5a1 1 0 0 0 1 1h5",
    "M12 15a5 5 0 0 1 0 6",
    "M8 14.502a.5.5 0 0 0-.826-.381l-1.893 1.631a1 1 0 0 1-.651.243H3.5a.5.5 0 0 0-.5.501v3.006a.5.5 0 0 0 .5.501h1.129a1 1 0 0 1 .652.243l1.893 1.633a.5.5 0 0 0 .826-.38z"
  ],
  "cassette-tape": [
    "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "M8 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
    "M8 12h8",
    "M16 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
    "m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1l.7 3"
  ],
  "audio-lines-x": [
    "M2 10v3",
    "M6 6v11",
    "M10 3v18",
    "M14 8v7",
    "M18 5v6",
    "M22 10v3",
    "m16 17 5 5",
    "m21 17-5 5"
  ],
  "disc-3": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z",
    "M6 12c0-1.7.7-3.2 1.8-4.2",
    "M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4z",
    "M18 12c0 1.7-.7 3.2-1.8 4.2"
  ],
  "boom-box": [
    "M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4",
    "M8 8v1",
    "M12 8v1",
    "M16 8v1",
    "M4 9h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z",
    "M8 13a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
    "M16 13a2 2 0 1 0 0 4 2 2 0 1 0 0-4"
  ]
};
var ICON_BADGE_OFF = "M17.203 19.3594L4.6875 6.7969C3.6094 8.25 3 10.0781 3 12C3 16.9688 7.031 21 12 21C13.969 21 15.75 20.3906 17.203 19.3594ZM19.359 17.2031C20.391 15.75 21 13.9219 21 12C21 7.0312 16.969 3 12 3C10.078 3 8.25 3.6094 6.797 4.6875L19.359 17.2031ZM0 12C0 5.3906 5.391 0 12 0C18.609 0 24 5.3906 24 12C24 18.6094 18.609 24 12 24C5.391 24 0 18.6094 0 12Z";
var ICON_BADGE_ON = "M12 24C5.391 24 0 18.6094 0 12C0 5.3906 5.391 0 12 0C18.609 0 24 5.3906 24 12C24 18.6094 18.609 24 12 24ZM17.531 6.8438C17.016 6.4688 16.313 6.5625 15.984 7.0781L10.359 14.7656L7.922 12.3281C7.5 11.9062 6.75 11.9062 6.328 12.3281C5.906 12.7969 5.906 13.5 6.328 13.9219L9.703 17.2969C9.937 17.5312 10.266 17.6719 10.594 17.625C10.922 17.625 11.203 17.4375 11.391 17.1562L17.766 8.3906C18.141 7.9219 18.047 7.2188 17.531 6.8438Z";

// src/components/move-visuals.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function MoveSlotNumericBody({ label, value, drawing }) {
  if (drawing.kind === "offset") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      MoveSlotOffsetBody,
      {
        label,
        value,
        origin: drawing.origin,
        position: drawing.position,
        back: drawing.back,
        forward: drawing.forward
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-dial-tag", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "tweakers-move-visual", viewBox: "0 0 100 60", "aria-hidden": "true", children: [
      drawing.kind === "opacity" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "tweakers-move-visual-guide", cx: "40", cy: "30", r: "18" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "tweakers-move-visual-guide", cx: "60", cy: "30", r: "18" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "tweakers-move-visual-solid", cx: "60", cy: "30", r: "18", opacity: drawing.alpha })
      ] }),
      drawing.kind === "blur" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "circle",
        {
          className: "tweakers-move-visual-solid",
          cx: "50",
          cy: "30",
          r: "14",
          style: { filter: `blur(${drawing.radius}px)` }
        }
      ),
      drawing.kind === "pan" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-guide", d: "M16 30H84M50 12V48" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-line", d: `M50 30H${16 + drawing.position * 68}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "circle",
          {
            className: "tweakers-move-visual-point",
            "data-offset": Math.abs(drawing.position - 0.5) > 1e-9 || void 0,
            cx: 16 + drawing.position * 68,
            cy: "30",
            r: "5"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "5", y: "30", dominantBaseline: "central", children: "L" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "95", y: "30", dominantBaseline: "central", children: "R" })
      ] }),
      drawing.kind === "stereo-width" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-guide", d: "M50 13V47" }),
        drawing.unity !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "tweakers-move-visual-reference", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: 50 - drawing.unity * 28, cy: "30", rx: "12", ry: "17" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: 50 + drawing.unity * 28, cy: "30", rx: "12", ry: "17" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "tweakers-move-visual-lobes", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: 50 - drawing.separation * 28, cy: "30", rx: "12", ry: "17" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: 50 + drawing.separation * 28, cy: "30", rx: "12", ry: "17" })
        ] })
      ] }),
      drawing.kind === "trim" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-guide", d: "M8 30H92" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            className: "tweakers-move-visual-line",
            d: drawing.edge === "start" ? `M${8 + drawing.position * 84} 30H92` : `M8 30H${8 + drawing.position * 84}`
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            className: "tweakers-move-visual-pitch-marker",
            "data-offset": (drawing.edge === "start" ? drawing.position > 1e-9 : drawing.position < 1 - 1e-9) || void 0,
            d: `M${8 + drawing.position * 84} 22l-5 -7h10z`
          }
        )
      ] }),
      drawing.kind === "pitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-guide", d: "M8 30H92M8 25V35M29 27V33M50 25V35M71 27V33M92 25V35" }),
        drawing.zero !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-reference", d: `M${8 + drawing.zero * 84} 12V48` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-visual-line", d: `M${8 + (drawing.zero ?? 0) * 84} 30H${8 + drawing.position * 84}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            className: "tweakers-move-visual-pitch-marker",
            "data-offset": drawing.zero === null || Math.abs(drawing.position - drawing.zero) > 1e-9 || void 0,
            d: `M${8 + drawing.position * 84} 22l-5 -7h10z`
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-dial-option tweakers-move-visual-value", children: value })
  ] });
}
var OFFSET_PIN = "M7.5 0C11.6406 0 15 3.28125 15 7.38281C15 12.0312 10.3125 17.6172 8.35938 19.7266C7.89062 20.2344 7.10938 20.2344 6.64062 19.7266C4.6875 17.6172 0 12.0312 0 7.38281C0 3.28125 3.35938 0 7.5 0ZM11.5 7.38281A4 4 0 1 0 3.5 7.38281A4 4 0 1 0 11.5 7.38281Z";
var OFFSET_WAY_NEAR = "M13.4277 11.4969C13.1168 11.8078 12.6126 11.8077 12.3015 11.4969L7.23278 6.42815C6.92176 6.11712 6.92176 5.61296 7.23278 5.30193L12.3015 0.233194C12.6126 -0.0775985 13.1168 -0.0777559 13.4277 0.233194C13.7387 0.544144 13.7385 1.04836 13.4277 1.35941L9.71854 5.0686L9.71854 6.66148L13.4277 10.3707C13.7385 10.6817 13.7387 11.1859 13.4277 11.4969Z";
var OFFSET_WAY_FAR = "M6.42822 11.4968C6.11727 11.8078 5.61306 11.8076 5.30201 11.4968L0.23327 6.42811C-0.0777563 6.11708 -0.0777563 5.61292 0.233271 5.30189L5.30201 0.233154C5.61306 -0.0776386 6.11728 -0.077796 6.42822 0.233154C6.73917 0.544104 6.73902 1.04832 6.42822 1.35937L2.71903 5.06856L2.71903 6.66144L6.42822 10.3706C6.73902 10.6817 6.73917 11.1859 6.42822 11.4968Z";
var OFFSET_WAY_BOX = { w: 13.6609, h: 11.73 };
var place = (position) => Math.max(0, Math.min(1, position));
var at = (position) => `${place(position) * 100}%`;
function MoveSlotOffsetBody({ label, value, origin, position, back, forward }) {
  const moved = Math.abs(position - origin) > 1e-9;
  const ways = moved ? [position < origin ? "back" : "forward"] : ["back", "forward"].filter((way) => way === "back" ? back : forward);
  const from = Math.min(place(origin), place(position));
  const to = Math.max(place(origin), place(position));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-dial-tag", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tweakers-move-offset", "data-moved": moved || void 0, "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: "tweakers-move-offset-span",
          style: { clipPath: `inset(0 ${(1 - to) * 100}% 0 ${from * 100}%)` }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-offset-origin", style: { left: at(origin) } }),
      ways.map((way) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "svg",
        {
          className: "tweakers-move-offset-way",
          "data-way": way,
          style: { "--move-offset-at": at(position) },
          viewBox: `0 0 ${OFFSET_WAY_BOX.w} ${OFFSET_WAY_BOX.h}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { transform: way === "forward" ? `translate(${OFFSET_WAY_BOX.w} 0) scale(-1 1)` : void 0, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: OFFSET_WAY_NEAR }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { className: "tweakers-move-offset-trail", d: OFFSET_WAY_FAR })
          ] })
        },
        way
      )),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-offset-pin", style: { left: at(position) }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { className: "tweakers-move-offset-head", viewBox: "0 0 15 20.1074", fillRule: "evenodd", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: OFFSET_PIN }) }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tweakers-move-dial-option tweakers-move-visual-value", children: value })
  ] });
}
function MoveSlotPlaybackDrawing({ mode }) {
  const icon = mode === "scissors" ? "scissors" : mode === "ping-pong" ? "arrow-left-right" : "arrow-right";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      className: "tweakers-move-dial-icon",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { transform: mode === "reverse" ? "translate(24 0) scale(-1 1)" : void 0, children: LUCIDE_ICONS[icon].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d }, d)) })
    }
  );
}

// src/xy-pad-core.ts
var XY_DETENT_PX = 6;
var XY_DEFAULT_STEP = 0.01;
function decimalsForStep(step) {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}
function roundToStep(val, step) {
  return parseFloat(val.toFixed(decimalsForStep(step)));
}
function resolveAxis(axis) {
  const min = axis?.min ?? 0;
  const max = axis?.max ?? 1;
  const step = axis?.step ?? XY_DEFAULT_STEP;
  const bipolar = axis?.bipolar ?? false;
  const origin = axis?.origin ?? (bipolar ? (min + max) / 2 : min);
  return { min, max, step, origin, bipolar };
}
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
function snapToStep(v, step, min) {
  if (step <= 0) return v;
  const snapped = min + Math.round((v - min) / step) * step;
  return roundToStep(snapped, step);
}
function valueToNorm(v, axis) {
  if (axis.max === axis.min) return 0;
  return clamp((v - axis.min) / (axis.max - axis.min), 0, 1);
}
function normToValue(n, axis) {
  const t = clamp(n, 0, 1);
  return axis.min + t * (axis.max - axis.min);
}
function invertY(n) {
  return 1 - n;
}
function valueFromPoint(point, xAxis, yAxis, snap2 = false) {
  let x = clamp(normToValue(point.x, xAxis), xAxis.min, xAxis.max);
  let y = clamp(normToValue(invertY(point.y), yAxis), yAxis.min, yAxis.max);
  if (snap2) {
    x = snapToStep(x, xAxis.step, xAxis.min);
    y = snapToStep(y, yAxis.step, yAxis.min);
  }
  return { x, y };
}
function pointFromValue(value, xAxis, yAxis) {
  return {
    x: valueToNorm(value.x, xAxis),
    y: invertY(valueToNorm(value.y, yAxis))
  };
}
function applyDetentAxis(value, axis, pxFromOrigin) {
  if (axis.bipolar && pxFromOrigin <= XY_DETENT_PX) return axis.origin;
  return value;
}
function effectiveStep(axis, mode) {
  const range = axis.max - axis.min;
  if (mode === "fine") return range * 0.01;
  if (mode === "coarse") return range * 0.1;
  return axis.step;
}
function nudge(value, axis, direction, xAxis, yAxis, mode = "normal") {
  const spec = axis === "x" ? xAxis : yAxis;
  const step = effectiveStep(spec, mode);
  const next = roundToStep(clamp(value[axis] + direction * step, spec.min, spec.max), step);
  return axis === "x" ? { x: next, y: value.y } : { x: value.x, y: next };
}
function centerValue(xAxis, yAxis) {
  return { x: xAxis.origin, y: yAxis.origin };
}
function coerceComponent(v, axis) {
  return typeof v === "number" && Number.isFinite(v) ? v : axis.origin;
}
function normalizeValue(value, xAxis, yAxis, snap2 = false) {
  const resolve = (raw, axis) => {
    let v = clamp(coerceComponent(raw, axis), axis.min, axis.max);
    if (snap2) v = snapToStep(v, axis.step, axis.min);
    return v + 0;
  };
  return {
    x: resolve(value?.x, xAxis),
    y: resolve(value?.y, yAxis)
  };
}

// src/curve-preview-core.ts
var CURVE_SAMPLE_COUNT = 160;
var CURVE_MIN_HEIGHT = 32;
var CURVE_MAX_HEIGHT = 160;
var CURVE_DEFAULT_HEIGHT = 64;
var CURVE_FIT_PADDING = 0.05;
function clampCurveHeight(height) {
  if (typeof height !== "number" || !Number.isFinite(height)) return CURVE_DEFAULT_HEIGHT;
  return Math.min(CURVE_MAX_HEIGHT, Math.max(CURVE_MIN_HEIGHT, height));
}
function plotCurve(sample, options = {}) {
  const count = Math.max(2, Math.floor(options.count ?? CURVE_SAMPLE_COUNT));
  const ys = new Array(count);
  for (let i = 0; i < count; i++) {
    let y;
    try {
      y = sample(i / (count - 1));
    } catch {
      y = NaN;
    }
    ys[i] = typeof y === "number" ? y : NaN;
  }
  let domain;
  const explicit = options.domain;
  if (explicit && Number.isFinite(explicit[0]) && Number.isFinite(explicit[1]) && explicit[0] < explicit[1]) {
    domain = [explicit[0], explicit[1]];
  } else {
    const finite2 = ys.filter((y) => Number.isFinite(y));
    if (finite2.length === 0) {
      domain = [0, 1];
    } else {
      let lo2 = Math.min(...finite2);
      let hi2 = Math.max(...finite2);
      if (lo2 === hi2) {
        lo2 -= 0.5;
        hi2 += 0.5;
      }
      const pad = (hi2 - lo2) * CURVE_FIT_PADDING;
      domain = [lo2 - pad, hi2 + pad];
    }
  }
  const [lo, hi] = domain;
  const span = hi - lo;
  const segments = [];
  let current = null;
  for (let i = 0; i < count; i++) {
    if (!Number.isFinite(ys[i])) {
      current = null;
      continue;
    }
    if (!current) {
      current = [];
      segments.push(current);
    }
    current.push({ t: i / (count - 1), v: (ys[i] - lo) / span });
  }
  const baseline = lo < 0 && hi > 0 ? (0 - lo) / span : null;
  return { segments, domain, baseline };
}
function normalizeCurveMarkers(markers) {
  if (!markers) return [];
  return markers.filter((m) => typeof m === "number" && Number.isFinite(m) && m >= 0 && m <= 1);
}
function curveY(v, height, pad = 0) {
  return pad + (1 - v) * (height - pad * 2);
}
function curvePathData(segments, width, height, pad = 0) {
  return segments.map(
    (segment) => segment.map((p, i) => `${i === 0 ? "M" : "L"} ${round(p.t * width)} ${round(curveY(p.v, height, pad))}`).join(" ")
  ).join(" ");
}
function round(value) {
  return Math.round(value * 100) / 100;
}

// src/range-slider-core.ts
function clamp2(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function valueToPercent(v, min, max) {
  if (max === min) return 0;
  return (v - min) / (max - min) * 100;
}
function percentToValue(pct01, min, max) {
  return min + clamp2(pct01, 0, 1) * (max - min);
}
function orderRange(v) {
  return v.min <= v.max ? v : { min: v.max, max: v.min };
}
function clampRange(v, min, max) {
  return orderRange({ min: clamp2(v.min, min, max), max: clamp2(v.max, min, max) });
}
function setLow(nextLow, current, min) {
  return { min: clamp2(nextLow, min, current.max), max: current.max };
}
function setHigh(nextHigh, current, max) {
  return { min: current.min, max: clamp2(nextHigh, current.min, max) };
}
function shiftSpan(deltaValue, current, min, max) {
  const width = current.max - current.min;
  const desiredMin = clamp2(current.min + deltaValue, min, max - width);
  return { min: desiredMin, max: desiredMin + width };
}
function nearestHandle(atValue, current) {
  const dMin = Math.abs(atValue - current.min);
  const dMax = Math.abs(atValue - current.max);
  if (dMin < dMax) return "min";
  if (dMax < dMin) return "max";
  return atValue < current.min ? "min" : "max";
}
function pickDragTarget(atValue, current, hitValue) {
  const nearLow = Math.abs(atValue - current.min) <= hitValue;
  const nearHigh = Math.abs(atValue - current.max) <= hitValue;
  if (nearLow && nearHigh) return nearestHandle(atValue, current);
  if (nearLow) return "min";
  if (nearHigh) return "max";
  if (atValue > current.min && atValue < current.max) return "span";
  return nearestHandle(atValue, current);
}
function isOutsideSpan(atValue, current) {
  return atValue <= current.min || atValue >= current.max;
}
function handleLeftStyles(lowPercent, highPercent) {
  const gap = `(${highPercent}% - ${lowPercent}%)`;
  const ramp = `clamp(0px, calc(6px - ${gap}), 2px)`;
  return {
    low: `max(0px, min(calc(100% - 2px), calc(${lowPercent}% - 1px - ${ramp})))`,
    high: `min(calc(100% - 2px), max(0px, calc(${highPercent}% - 1px + ${ramp})))`
  };
}

// src/filter-core.ts
var FILTER_AXIS_DEFAULTS = {
  cutoff: { min: 0, max: 1, step: 0, label: "Freq" },
  resonance: { min: 0, max: 1, step: 0, label: "Res" }
};
function resolveFilterAxis(axis, hand) {
  const base = FILTER_AXIS_DEFAULTS[hand];
  return {
    min: axis?.min ?? base.min,
    max: axis?.max ?? base.max,
    step: axis?.step ?? base.step,
    label: axis?.label ?? base.label,
    formatValue: axis?.formatValue
  };
}
var clamp3 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var snap = (v, axis) => {
  let out = clamp3(Number.isFinite(v) ? v : axis.min, axis.min, axis.max);
  if (axis.step > 0) out = clamp3(axis.min + Math.round((out - axis.min) / axis.step) * axis.step, axis.min, axis.max);
  return Number(out.toFixed(6));
};
function normalizeFilterValue(value, cutoffAxis, resonanceAxis) {
  const v = typeof value === "object" && value !== null ? value : {};
  return {
    cutoff: snap(typeof v.cutoff === "number" ? v.cutoff : cutoffAxis.max, cutoffAxis),
    resonance: snap(typeof v.resonance === "number" ? v.resonance : resonanceAxis.min, resonanceAxis)
  };
}
var filterHand01 = (v, axis) => {
  const n = (v - axis.min) / (axis.max - axis.min || 1);
  return clamp3(Number.isFinite(n) ? n : 0, 0, 1);
};
var filterHandValue = (v01, axis) => snap(axis.min + clamp3(v01, 0, 1) * (axis.max - axis.min), axis);
function filterShapeResponse(type, cutoff01, resonance01) {
  const fc = Math.pow(10, -3 + 3 * clamp3(cutoff01, 0, 1));
  const q = 0.707 * Math.pow(14, clamp3(resonance01, 0, 1));
  const a = Math.pow(10, clamp3(resonance01, 0, 1) * 18 / 40);
  return (t) => {
    const f = Math.pow(10, -3 + 3 * clamp3(t, 0, 1));
    const w = f / fc;
    const w2 = w * w;
    const den = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / q, 2));
    let mag;
    switch (type) {
      case "highpass":
        mag = w2 / den;
        break;
      case "bandpass":
        mag = w / q / den;
        break;
      case "notch":
        mag = Math.abs(1 - w2) / den;
        break;
      case "peak":
        mag = Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w * a / q, 2)) / Math.sqrt(Math.pow(1 - w2, 2) + Math.pow(w / (a * q), 2));
        break;
      default:
        mag = 1 / den;
    }
    return Math.min((20 * Math.log10(Math.max(mag, 1e-6)) + FILTER_DB_FLOOR) / (FILTER_DB_FLOOR + FILTER_DB_CEIL), 1);
  };
}
function defaultFilterResponse(cutoff01, resonance01) {
  return filterShapeResponse("lowpass", cutoff01, resonance01);
}
var FILTER_DB_FLOOR = 36;
var FILTER_DB_CEIL = 24;
var FILTER_SHAPE_SAMPLES = 96;
function filterResponsePath(response, samples = FILTER_SHAPE_SAMPLES) {
  const pts = [];
  for (let i = 0; i < samples; i++) {
    let y;
    try {
      y = response(i / (samples - 1));
    } catch {
      return null;
    }
    if (!Number.isFinite(y)) return null;
    pts.push(Math.min(1, Math.max(-1, y)));
  }
  return pts.map((y, i) => `${i ? "L" : "M"} ${(i / (samples - 1) * 100).toFixed(2)} ${((1 - y) * 100).toFixed(2)}`).join(" ");
}

// src/move-layout.ts
var MOVE_TRACKS = 4;
var MOVE_DIALS = 8;
var MOVE_PADS = 8;
var flat = (controls, out = []) => {
  for (const c of controls) {
    if (c.children) flat(c.children, out);
    else out.push(c);
  }
  return out;
};
var isEnumDial = (c) => c.type === "select" && Array.isArray(c.options) && c.options.length > 1;
var isMoveTabs = (c) => !!c.moveTabs && isEnumDial(c);
var isNamedTabs = (c) => c.moveTabs === "named";
var padSpan = (c) => c && isMoveTabs(c) ? c.options.length + (isNamedTabs(c) ? 1 : 0) : 1;
var isPadSpanContinuation = (row, i) => i > 0 && row[i] !== void 0 && row[i] === row[i - 1];
function moveTabCell(row, i) {
  const meta = row[i];
  if (!meta || !isMoveTabs(meta)) return null;
  let start = i;
  while (start > 0 && row[start - 1] === meta) start--;
  const offset = i - start;
  if (isNamedTabs(meta) && offset === 0) {
    return { meta, head: true, option: null, label: meta.label };
  }
  const opt = meta.options[offset - (isNamedTabs(meta) ? 1 : 0)];
  if (opt === void 0) return null;
  return {
    meta,
    head: false,
    option: enumOptionValue(opt),
    label: enumOptionLabel(opt)
  };
}
var isToggleDial = (c) => c.type === "toggle" && c.moveSlot === true;
var isMoveDial = (c) => isToggleDial(c) || c.type === "slider" || c.type === "color" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || c.type === "balance" || isEnumDial(c) && !isMoveTabs(c) || c.type === "number" && c.min != null && c.max != null;
var isDial = isMoveDial;
var noChip = (c) => isToggleDial(c) || c.type === "color" || c.type === "xy" || c.type === "range" || c.type === "filter" || c.type === "transfer" || c.type === "gradient" || c.type === "balance" || isEnumDial(c);
var dialSpan = (c) => c?.type === "filter" || c?.type === "select" && c.moveSpan === 2 && !isMoveTabs(c) ? 2 : 1;
var isSpanContinuation = (page, i) => i > 0 && page.dials[i] !== void 0 && page.dials[i] === page.dials[i - 1];
function buildModMovePage(panel, layout) {
  const controls = flat(panel.controls);
  if (layout) {
    const at2 = (slot) => slot ? controls.find((c) => c.path === slot.path) : void 0;
    return {
      panel,
      dials: layout.dials.slice(0, MOVE_DIALS).map(at2).filter((c) => !!c),
      toggles: layout.toggles.slice(0, MOVE_PADS).map(at2),
      values: layout.values.slice(0, MOVE_PADS).map(at2),
      actions: []
    };
  }
  const dials = [];
  const toggles = [];
  for (const c of controls) {
    if (c.type === "toggle" && !isToggleDial(c)) toggles[Math.max(0, dials.length - 1)] = c;
    else if (c.type === "toggle" || c.type === "select" || isDial(c)) dials.push(c);
  }
  return { panel, dials: dials.slice(0, MOVE_DIALS), toggles: toggles.slice(0, MOVE_PADS), values: [], actions: [] };
}
var warnedIssues = /* @__PURE__ */ new Set();
var issueReporter = null;
function reportMoveLayoutIssue(code, message) {
  if (issueReporter) {
    issueReporter(code, message);
    return;
  }
  if (warnedIssues.has(message)) return;
  warnedIssues.add(message);
  console.warn(`Move layout: ${message}`);
}
var padColumn = (panel, c) => {
  const col = panel.movePads?.[c.path];
  if (col === void 0) return null;
  if (typeof col === "number" && Number.isInteger(col) && col >= 0 && col < MOVE_PADS) return col;
  reportMoveLayoutIssue(
    "pad-column-invalid",
    `panel '${panel.id}': control '${c.path}': movePads column ${JSON.stringify(col)} is off the ${MOVE_PADS}-wide grid \u2014 ignored`
  );
  return null;
};
function buildMovePages(panels) {
  const plain = panels.filter((p) => p.kind === void 0 || p.kind === "kit");
  for (const p of plain.slice(MOVE_TRACKS)) {
    reportMoveLayoutIssue(
      "panel-dropped",
      `panel '${p.id}' dropped \u2014 hardware has ${MOVE_TRACKS} tracks`
    );
  }
  return plain.slice(0, MOVE_TRACKS).map((panel) => {
    const controls = flat(panel.controls);
    const padCols = new Map(controls.map((c) => [c, padColumn(panel, c)]));
    const balanceRefs = /* @__PURE__ */ new Map();
    for (const c of controls) {
      if (c.type !== "balance") continue;
      for (const path of [c.balanceA, c.balanceB]) {
        const ref = controls.find((x) => x.path === path && x.type === "color");
        if (ref && !balanceRefs.has(ref)) balanceRefs.set(ref, c);
      }
    }
    const isPadColor = (c) => c.type === "color" && padCols.get(c) != null;
    const dials = [];
    let nextCol = 0;
    for (const c of controls) {
      if (!isDial(c) || isPadColor(c) || balanceRefs.has(c)) continue;
      const span = dialSpan(c);
      if (nextCol + span > MOVE_DIALS) {
        if (nextCol >= MOVE_DIALS) break;
        continue;
      }
      for (let s = 0; s < span; s++) dials[nextCol + s] = c;
      nextCol += span;
    }
    const toggles = [];
    const values = [];
    const actions = [];
    const topValues = [];
    const valueActions = [];
    const topAt = (i) => toggles[i] ?? topValues[i];
    const cellAt = (row, i) => row === toggles ? topAt(i) : row === values ? values[i] ?? valueActions[i] : row[i];
    const place3 = (row, rowName, c, col) => {
      if (col !== null && cellAt(row, col) === void 0) {
        row[col] = c;
        return;
      }
      for (let i = 0; i < MOVE_PADS; i++) {
        if (cellAt(row, i) === void 0) {
          if (col !== null) {
            reportMoveLayoutIssue(
              "pad-column-taken",
              `panel '${panel.id}': control '${c.path}': ${rowName} column ${col} already occupied by '${cellAt(row, col).path}' \u2014 moved to column ${i}`
            );
          }
          row[i] = c;
          return;
        }
      }
      reportMoveLayoutIssue(
        "pad-row-full",
        `panel '${panel.id}': control '${c.path}': the ${rowName} row's ${MOVE_PADS} pads are all taken \u2014 dropped`
      );
    };
    const placeTabs = (c, col) => {
      const span = padSpan(c);
      if (span > MOVE_PADS) {
        reportMoveLayoutIssue(
          "tabs-oversized",
          `panel '${panel.id}': control '${c.path}': a ${span}-pad tabs strip is wider than the ${MOVE_PADS}-wide grid \u2014 dropped`
        );
        return;
      }
      const fits = (start2) => start2 >= 0 && start2 + span <= MOVE_PADS && Array.from({ length: span }, (_, k) => topAt(start2 + k)).every((p) => p === void 0);
      let start = col !== null && fits(col) ? col : -1;
      if (start < 0) {
        for (let i = 0; i + span <= MOVE_PADS; i++) {
          if (fits(i)) {
            start = i;
            break;
          }
        }
        if (start >= 0 && col !== null) {
          reportMoveLayoutIssue(
            "pad-column-taken",
            `panel '${panel.id}': control '${c.path}': tabs column ${col} has no run of ${span} free pads \u2014 moved to column ${start}`
          );
        }
      }
      if (start < 0) {
        reportMoveLayoutIssue(
          "tabs-no-room",
          `panel '${panel.id}': control '${c.path}': the toggle row has no run of ${span} free pads \u2014 dropped`
        );
        return;
      }
      for (let k = 0; k < span; k++) toggles[start + k] = c;
    };
    for (const [ref, bal] of balanceRefs) {
      const at2 = dials.indexOf(bal);
      if (at2 < 0) continue;
      const first = ref.path === bal.balanceA;
      const col = padCols.get(ref) ?? null;
      if (col !== null) {
        reportMoveLayoutIssue(
          "balance-color-placed",
          `panel '${panel.id}': control '${ref.path}' is placed by its balance \u2014 movePads column ${col} ignored; a balance seats its own colours`
        );
      }
      if (first) topValues[at2] = ref;
      else values[at2] = ref;
    }
    const seated = (c) => topValues.includes(c) || values.includes(c);
    for (const c of controls) {
      const col = padCols.get(c) ?? null;
      if (isMoveTabs(c)) placeTabs(c, col);
      else if (c.type === "toggle" && !isToggleDial(c)) place3(toggles, "toggle", c, col);
    }
    const lift = panel.moveTopRow ?? [];
    const chipFits = (c) => isDial(c) && !noChip(c) && !dials.includes(c) && !balanceRefs.has(c) && !isPadColor(c);
    const liftFits = (c) => chipFits(c) || isPadColor(c) && !balanceRefs.has(c);
    for (const c of controls) {
      if (!lift.includes(c.path) || c.type !== "action" && !liftFits(c)) continue;
      const col = padCols.get(c) ?? null;
      if (col === null) {
        reportMoveLayoutIssue(
          "top-row-no-column",
          `panel '${panel.id}': control '${c.path}' is named in moveTopRow but has no movePads column \u2014 the chip keeps the value row`
        );
      } else if (topAt(col) !== void 0) {
        reportMoveLayoutIssue(
          "top-row-taken",
          `panel '${panel.id}': control '${c.path}': top-row column ${col} holds '${topAt(col).path}' \u2014 the chip keeps the value row`
        );
      } else {
        topValues[col] = c;
      }
    }
    const sink = panel.moveActionRow ?? [];
    const actionValues = [];
    for (const c of controls) {
      if (!sink.includes(c.path) || !chipFits(c) || topValues.includes(c)) continue;
      const col = padCols.get(c) ?? null;
      if (col === null) {
        reportMoveLayoutIssue(
          "action-row-no-column",
          `panel '${panel.id}': control '${c.path}' is named in moveActionRow but has no movePads column \u2014 the chip keeps the value row`
        );
      } else if (actionValues[col] !== void 0) {
        reportMoveLayoutIssue(
          "action-row-taken",
          `panel '${panel.id}': control '${c.path}': action-row column ${col} holds '${actionValues[col].path}' \u2014 the chip keeps the value row`
        );
      } else {
        actionValues[col] = c;
      }
    }
    const raise = panel.moveValueRow ?? [];
    for (const c of controls) {
      if (!raise.includes(c.path) || c.type !== "action" || topValues.includes(c)) continue;
      const col = padCols.get(c) ?? null;
      if (col === null) {
        reportMoveLayoutIssue(
          "value-row-no-column",
          `panel '${panel.id}': action '${c.path}' is named in moveValueRow but has no movePads column \u2014 it keeps the action row`
        );
      } else if (cellAt(values, col) !== void 0) {
        reportMoveLayoutIssue(
          "value-row-taken",
          `panel '${panel.id}': action '${c.path}': value-row column ${col} holds '${cellAt(values, col).path}' \u2014 it keeps the action row`
        );
      } else {
        valueActions[col] = c;
      }
    }
    for (const c of controls) {
      const col = padCols.get(c) ?? null;
      if (isMoveTabs(c) || c.type === "toggle" && !isToggleDial(c)) continue;
      if (seated(c) || actionValues.includes(c) || valueActions.includes(c)) continue;
      if (c.type === "action") {
        if (col !== null && actionValues[col] !== void 0) {
          reportMoveLayoutIssue("action-row-taken", `panel '${panel.id}': action '${c.path}': column ${col} holds the chip '${actionValues[col].path}' \u2014 the action moves along`);
          place3(actions, "action", c, null);
        } else if (col !== null) place3(actions, "action", c, col);
      } else if (balanceRefs.has(c)) place3(values, "value", c, col);
      else if (isPadColor(c)) {
        if (!topValues.includes(c)) place3(values, "value", c, col);
      } else if (dials.includes(c)) {
        if (col !== null) {
          reportMoveLayoutIssue(
            "pad-column-on-dial",
            `panel '${panel.id}': control '${c.path}' holds a dial slot \u2014 movePads column ${col} ignored; pads never mirror dials`
          );
        }
      } else if (isDial(c) && !noChip(c)) place3(values, "value", c, col);
      else if (isDial(c) && noChip(c)) {
        reportMoveLayoutIssue(
          "dial-dropped",
          `panel '${panel.id}': control '${c.path}' (${c.type}) needs a dial column and none is left \u2014 dropped`
        );
      }
    }
    const page = {
      panel,
      dials,
      toggles: toggles.slice(0, MOVE_PADS),
      values: values.slice(0, MOVE_PADS),
      actions: actions.slice(0, MOVE_PADS),
      ...topValues.length ? { topValues: topValues.slice(0, MOVE_PADS) } : {},
      ...actionValues.length ? { actionValues: actionValues.slice(0, MOVE_PADS) } : {},
      ...valueActions.length ? { valueActions: valueActions.slice(0, MOVE_PADS) } : {}
    };
    const rows = movePadRows(page, 0);
    for (const band of panel.moveBands ?? []) {
      const on = [band.high, band.low].filter((path) => rows.some((r) => r.some((m) => m?.path === path)));
      if (on.length < 2) continue;
      const stacked = rows.some((r, row) => r.some((m, col) => m?.path === band.high && moveBandCell(page, rows, row, col)));
      if (!stacked) {
        reportMoveLayoutIssue(
          "band-apart",
          `panel '${panel.id}': band '${band.high}' / '${band.low}' is not two chips stacked in one column \u2014 drawn as its two chips`
        );
      }
    }
    for (const edges of panel.moveEdges ?? []) {
      const on = [edges.start, edges.end].filter((path) => rows.some((r) => r.some((m) => m?.path === path)));
      if (on.length < 2) continue;
      const paired = rows.some((r, row) => r.some((m, col) => m?.path === edges.start && moveEdgesCell(page, rows, row, col)));
      if (!paired) {
        reportMoveLayoutIssue(
          "edges-apart",
          `panel '${panel.id}': ${edges.kind} '${edges.start}' / '${edges.end}' is not two chips side by side in one row, start first \u2014 drawn as its two chips`
        );
      }
    }
    return page;
  });
}
function movePadRows(page, claimedRows) {
  let top = page.toggles;
  let values = page.values;
  if (page.valueActions?.some(Boolean)) {
    values = [];
    for (let i = 0; i < Math.max(page.values.length, page.valueActions.length); i++) {
      const cell = page.values[i] ?? page.valueActions[i];
      if (cell) values[i] = cell;
    }
  }
  if (page.topValues?.some(Boolean)) {
    top = [];
    for (let i = 0; i < Math.max(page.toggles.length, page.topValues.length); i++) {
      const cell = page.toggles[i] ?? page.topValues[i];
      if (cell) top[i] = cell;
    }
  }
  let actions = page.actions;
  if (page.actionValues?.some(Boolean)) {
    actions = [];
    for (let i = 0; i < Math.max(page.actions.length, page.actionValues.length); i++) {
      const cell = page.actions[i] ?? page.actionValues[i];
      if (cell) actions[i] = cell;
    }
  }
  if (claimedRows >= 2) return [top, values, [], []];
  return [top, values, actions, []];
}
function moveBandCell(page, rows, row, col) {
  const meta = rows[row]?.[col];
  if (!meta || !page.panel.moveBands?.length) return null;
  const chip = (m) => !!m && isDial(m) && !noChip(m) && !page.dials.includes(m);
  for (const band of page.panel.moveBands) {
    if (meta.path !== band.high && meta.path !== band.low) continue;
    const partner = meta.path === band.high ? band.low : band.high;
    const below = rows[row + 1]?.[col];
    const above = rows[row - 1]?.[col];
    const tail = above?.path === partner;
    const other = tail ? above : below?.path === partner ? below : void 0;
    if (!chip(meta) || !chip(other)) return null;
    const high = meta.path === band.high ? meta : other;
    const low = meta.path === band.low ? meta : other;
    const top = tail ? other : meta;
    return { high, low, upper: top === high ? "high" : "low", tail };
  }
  return null;
}
function moveEdgesCell(page, rows, row, col) {
  const meta = rows[row]?.[col];
  if (!meta || !page.panel.moveEdges?.length) return null;
  const chip = (m) => !!m && isDial(m) && !noChip(m) && !page.dials.includes(m);
  for (const edges of page.panel.moveEdges) {
    if (meta.path !== edges.start && meta.path !== edges.end) continue;
    const tail = meta.path === edges.end;
    const other = rows[row]?.[tail ? col - 1 : col + 1];
    if (other?.path !== (tail ? edges.start : edges.end) || !chip(meta) || !chip(other)) return null;
    return { kind: edges.kind, start: tail ? other : meta, end: tail ? meta : other, tail };
  }
  return null;
}
function moveAppPadRow(row, claimedRows) {
  if (claimedRows >= 2) return row === 2 ? 1 : row === 3 ? 0 : null;
  return claimedRows === 1 && row === 3 ? 0 : null;
}
function slotGroups(page, cols = visibleColumns(page)) {
  const out = [];
  for (const group of page.panel.moveSlotGroups ?? []) {
    const paths = Array.isArray(group) ? group : group.slots;
    const label = Array.isArray(group) ? void 0 : group.label;
    const at2 = cols.flatMap((col, position) => {
      const dial = page.dials[col];
      return dial && paths.includes(dial.path) ? [position] : [];
    });
    if (at2.length < 2) continue;
    const start = at2[0];
    const span = at2[at2.length - 1] - start + 1;
    if (span !== at2.length) {
      reportMoveLayoutIssue("slot-group-apart", `panel '${page.panel.id}': slot group [${paths.join(", ")}] is not side by side on the page \u2014 not drawn`);
      continue;
    }
    out.push({ start, span, ...label ? { label } : {} });
  }
  return out;
}
function visibleColumns(page) {
  const cols = [];
  for (let i = 0; i < MOVE_DIALS; i++) {
    if (page.dials[i] || page.toggles[i] || page.topValues?.[i] || page.values[i] || page.actions[i] || page.actionValues?.[i] || page.valueActions?.[i]) cols.push(i);
  }
  return cols;
}
var normalizeToggleDial = (value) => value === true ? 1 : 0;
var denormalizeToggleDial = (v01) => Number.isFinite(v01) && v01 >= 0.5;
function denormalizeDial(meta, v01) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (meta.step) v = Math.round(v / meta.step) * meta.step;
  return Number(v.toFixed(6));
}
function normalizeDial(meta, value) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = (Number(value) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}
var norm01 = (v, min, max) => {
  const n = (Number(v) - min) / (max - min || 1);
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
};
var denorm01 = (v01, min, max, step) => {
  let v = min + Math.min(1, Math.max(0, v01)) * (max - min);
  if (step) v = Math.round(v / step) * step;
  return Number(v.toFixed(6));
};
function normalizeXYDial(meta, value) {
  const xAxis = resolveAxis(meta.xAxis);
  const yAxis = resolveAxis(meta.yAxis);
  const v = value ?? {};
  return { x: norm01(v.x, xAxis.min, xAxis.max), y: norm01(v.y, yAxis.min, yAxis.max) };
}
var enumOptionValue = (o) => typeof o === "string" ? o : o.value;
var enumOptionLabel = (o) => typeof o === "string" ? o : o.label ?? o.value;
var enumOptionIcon = (o) => typeof o === "string" ? null : o.icon ?? null;
var enumOptionPicture = (o) => typeof o === "string" ? null : o.picture ?? null;
var ENUM_SHAPE_SAMPLES = 64;
function enumShapePath(meta, value) {
  if (!meta.preview) return null;
  let sample;
  try {
    sample = meta.preview(String(value ?? ""));
  } catch {
    return null;
  }
  if (typeof sample !== "function") return null;
  const segments = plotCurve(sample, { count: ENUM_SHAPE_SAMPLES }).segments;
  let lo = Infinity;
  let hi = -Infinity;
  for (const seg of segments) {
    for (const pt of seg) {
      if (pt.v < lo) lo = pt.v;
      if (pt.v > hi) hi = pt.v;
    }
  }
  if (lo > hi) return null;
  const span = hi - lo;
  const fill = (v) => span > 0 ? (v - lo) / span : 0.5;
  const d = segments.map((seg) => seg.map((pt, i) => `${i ? "L" : "M"} ${(pt.t * 100).toFixed(2)} ${((1 - fill(pt.v)) * 100).toFixed(2)}`).join(" ")).join(" ");
  return d || null;
}
function enumIndex(meta, value) {
  const i = (meta.options ?? []).findIndex((o) => enumOptionValue(o) === value);
  return Math.max(0, i);
}
function normalizeRangeDial(meta, value) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const v = value ?? {};
  return { lo: norm01(v.min, min, max), hi: norm01(v.max, min, max) };
}
function denormalizeRangeDial(meta, lo01, hi01) {
  const min = meta.min ?? 0;
  const max = meta.max ?? 1;
  const step = meta.step ?? 0;
  return clampRange(
    { min: denorm01(lo01, min, max, step), max: denorm01(hi01, min, max, step) },
    min,
    max
  );
}
function normalizeEnumDial(meta, value) {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o));
  if (opts.length < 2) return 0;
  const i = opts.indexOf(String(value));
  return i <= 0 ? 0 : i / (opts.length - 1);
}
function denormalizeEnumDial(meta, v01) {
  const opts = (meta.options ?? []).map((o) => enumOptionValue(o));
  if (opts.length === 0) return "";
  const i = Math.round(Math.min(1, Math.max(0, v01)) * (opts.length - 1));
  return opts[i];
}
function normalizeFilterDial(meta, value) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  const v = normalizeFilterValue(value, ca, ra);
  return { cutoff: filterHand01(v.cutoff, ca), resonance: filterHand01(v.resonance, ra) };
}
function denormalizeFilterDial(meta, cutoff01, resonance01) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  return { cutoff: filterHandValue(cutoff01, ca), resonance: filterHandValue(resonance01, ra) };
}
function filterShapePath(meta, value) {
  const pos = normalizeFilterDial(meta, value);
  let response;
  try {
    response = (meta.response ?? defaultFilterResponse)(pos.cutoff, pos.resonance);
  } catch {
    return null;
  }
  if (typeof response !== "function") return null;
  return filterResponsePath(response);
}
function dialOrigin(meta) {
  const origin = meta.origin ?? (meta.bipolar ? 0 : void 0);
  return origin === void 0 ? 0 : normalizeDial(meta, origin);
}

// src/angle-core.ts
var ANGLE_DEAD_ZONE_PX = 4;
function decimalsForStep2(step) {
  const s = String(step);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}
function snapAngle(value, min, step) {
  if (!(step > 0)) return value;
  return parseFloat((min + Math.round((value - min) / step) * step).toFixed(decimalsForStep2(step)));
}
function normalizeAngle(value, min, max, wrap) {
  const span = max - min;
  if (!wrap || span <= 0) return Math.min(max, Math.max(min, value));
  const t = ((value - min) % span + span) % span;
  return min + t;
}
function valueToBearing(value, min, max) {
  const span = max - min || 1;
  return (value - min) / span * 360;
}
function bearingToValue(bearing, min, max) {
  const span = max - min || 1;
  return min + (bearing % 360 + 360) % 360 / 360 * span;
}
function angleFromPointer(dx, dy, current, min, max, step, wrap) {
  if (Math.hypot(dx, dy) < ANGLE_DEAD_ZONE_PX) return null;
  const bearing = Math.atan2(dx, -dy) * 180 / Math.PI;
  let value = bearingToValue(bearing, min, max);
  if (wrap) {
    const span = max - min;
    while (value - current > span / 2) value -= span;
    while (current - value > span / 2) value += span;
  }
  return normalizeAngle(snapAngle(value, min, step), min, max, wrap);
}
function nudgeAngle(value, delta, min, max, step, wrap) {
  return normalizeAngle(snapAngle(value + delta * (step || 1), min, step), min, max, wrap);
}
function arcPath(from, to, radius, cx = 0, cy = 0) {
  const point = (deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return `${(cx + radius * Math.cos(rad)).toFixed(3)} ${(cy + radius * Math.sin(rad)).toFixed(3)}`;
  };
  const delta = to - from;
  if (Math.abs(delta) < 0.01) return "";
  if (Math.abs(delta) >= 359.99) {
    return `M ${point(from)} A ${radius} ${radius} 0 0 1 ${point(from + 180)} A ${radius} ${radius} 0 0 1 ${point(from + 359.99)}`;
  }
  return `M ${point(from)} A ${radius} ${radius} 0 ${Math.abs(delta) > 180 ? 1 : 0} ${delta > 0 ? 1 : 0} ${point(to)}`;
}

// src/color-core.ts
var COLOR_FORMATS = ["hex", "rgb", "hsl", "oklch"];
var LONG_PRESS_MS = 500;
var HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
var clamp4 = (n, min, max) => Math.min(max, Math.max(min, n));
var clamp012 = (n) => clamp4(n, 0, 1);
var byte = (n) => clamp4(Math.round(n), 0, 255);
function parseHex(input) {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s.startsWith("#")) s = `#${s}`;
  if (!HEX_COLOR_REGEX.test(s)) return null;
  let h = s.slice(1);
  if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}
function formatHex(rgba, alphaEnabled) {
  const hx = (n) => byte(n).toString(16).padStart(2, "0");
  const base = `#${hx(rgba.r)}${hx(rgba.g)}${hx(rgba.b)}`;
  return alphaEnabled ? `${base}${hx(clamp012(rgba.a) * 255)}` : base;
}
function normalizeHex(input, alphaEnabled) {
  const rgba = parseHex(input);
  return rgba ? formatHex(rgba, alphaEnabled) : null;
}
function displayHex(value) {
  const rgba = parseHex(value);
  if (!rgba) return (value ?? "").toUpperCase();
  return formatHex(rgba, false).toUpperCase();
}
function opacityPercent(rgba) {
  return Math.round(clamp012(rgba.a) * 100);
}
function rgbToHsv(rgba) {
  const r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a: rgba.a };
}
function hsvToRgb(hsva) {
  const h = (hsva.h % 360 + 360) % 360;
  const s = clamp012(hsva.s), v = clamp012(hsva.v);
  const c = v * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: byte((r + m) * 255), g: byte((g + m) * 255), b: byte((b + m) * 255), a: hsva.a };
}
function rgbToHsl(rgba) {
  const { h, s, v, a } = rgbToHsv(rgba);
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}
function hslToRgb(hsla) {
  const l = clamp012(hsla.l), s = clamp012(hsla.s);
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return hsvToRgb({ h: hsla.h, s: sv, v, a: hsla.a });
}
var srgbToLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
var linearToSrgb = (c) => c <= 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
function rgbToOklab(rgba) {
  const r = srgbToLinear(rgba.r / 255);
  const g = srgbToLinear(rgba.g / 255);
  const b = srgbToLinear(rgba.b / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  };
}
function oklabToLinearRgb(L, A, B) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2307590544 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  };
}
function rgbToOklch(rgba) {
  const { L, A, B } = rgbToOklab(rgba);
  const c = Math.sqrt(A * A + B * B);
  let h = Math.atan2(B, A) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-6 ? 0 : h, a: rgba.a };
}
var GAMUT_EPS = 1e-4;
function inSrgbGamut(l, c, h) {
  const rad = h * Math.PI / 180;
  const { r, g, b } = oklabToLinearRgb(l, c * Math.cos(rad), c * Math.sin(rad));
  return r >= -GAMUT_EPS && r <= 1 + GAMUT_EPS && g >= -GAMUT_EPS && g <= 1 + GAMUT_EPS && b >= -GAMUT_EPS && b <= 1 + GAMUT_EPS;
}
function clampOklchToSrgb(oklch) {
  const l = clamp012(oklch.l);
  const h = (oklch.h % 360 + 360) % 360;
  const c = Math.max(0, oklch.c);
  if (inSrgbGamut(l, c, h)) return { l, c, h, a: clamp012(oklch.a) };
  let lo = 0, hi = c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return { l, c: lo, h, a: clamp012(oklch.a) };
}
function oklchToRgb(oklch) {
  const { l, c, h, a } = clampOklchToSrgb(oklch);
  const rad = h * Math.PI / 180;
  const lin = oklabToLinearRgb(l, c * Math.cos(rad), c * Math.sin(rad));
  return {
    r: byte(linearToSrgb(clamp012(lin.r)) * 255),
    g: byte(linearToSrgb(clamp012(lin.g)) * 255),
    b: byte(linearToSrgb(clamp012(lin.b)) * 255),
    a: clamp012(a)
  };
}

// src/components/ListScreen.tsx
var import_react = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function itemValue(item) {
  return typeof item === "string" ? item : item.value;
}
function itemLabel(item) {
  return typeof item === "string" ? item : item.label ?? item.value;
}
function itemTag(item) {
  return typeof item === "string" ? void 0 : item.tag;
}
function itemMuted(item) {
  return typeof item === "string" ? false : Boolean(item.muted);
}
function itemDetail(item) {
  return typeof item === "string" ? void 0 : item.detail;
}
function itemChecked(item) {
  return typeof item === "string" ? void 0 : item.checked;
}
function itemIcon(item) {
  return typeof item === "string" ? void 0 : item.icon;
}
function ListScreenMark({ detail, checked }) {
  const stroke = { stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tweakers-list-screen-mark", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", children: detail === "page" || detail === "back" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: detail === "back" ? ICON_CHEVRON_LEFT : ICON_CHEVRON_RIGHT, strokeWidth: "2", ...stroke }) : detail === "dialog" ? ICON_ELLIPSIS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: c.cx, cy: c.cy, r: "1.75", fill: "currentColor" }, c.cx)) : checked ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: ICON_CHECK, strokeWidth: "2.5", ...stroke }) : null }) });
}
function ListScreen({
  items,
  label,
  disabled,
  multiselect,
  onFocusItem,
  value,
  onSelect,
  wide,
  follow = "nearest",
  back,
  onBack,
  className,
  style
}) {
  const rootRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const root = rootRef.current;
    if (!root) return;
    const syncEdges = () => {
      const end = root.scrollHeight - root.clientHeight;
      root.toggleAttribute?.("data-over-top", root.scrollTop > 1);
      root.toggleAttribute?.("data-over-bottom", root.scrollTop < end - 1);
    };
    const sync = () => {
      const selected = root.querySelector("[data-selected]");
      if (selected) {
        const row = selected.getBoundingClientRect();
        const box = root.getBoundingClientRect();
        const top = row.top - box.top + root.scrollTop;
        const bottom = top + row.height;
        const next = follow === "center" ? top - (root.clientHeight - row.height) / 2 : top < root.scrollTop ? top : bottom > root.scrollTop + root.clientHeight ? bottom - root.clientHeight : root.scrollTop;
        root.scrollTop = Math.max(0, Math.min(next, root.scrollHeight - root.clientHeight));
      }
      syncEdges();
    };
    sync();
    root.addEventListener("scroll", syncEdges, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sync);
    observer?.observe(root);
    return () => {
      observer?.disconnect();
      root.removeEventListener("scroll", syncEdges);
    };
  }, [value, follow, items.length]);
  const rootClassName = ["tweakers-list-screen", className].filter(Boolean).join(" ");
  const onKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const rows = Array.from(
      event.currentTarget.querySelectorAll(".tweakers-list-screen-row")
    );
    if (!rows.length) return;
    const active = document.activeElement;
    const at2 = active ? rows.indexOf(active) : -1;
    const fallback = rows.findIndex((row) => row.hasAttribute("data-selected"));
    const from = at2 !== -1 ? at2 : fallback;
    const next = rows[(from === -1 ? event.key === "ArrowDown" ? -1 : rows.length : from) + (event.key === "ArrowDown" ? 1 : -1)];
    if (!next) return;
    event.preventDefault();
    next.focus();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    back && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        type: "button",
        className: "tweakers-list-screen-back",
        "aria-label": `Back to ${back}`,
        disabled: !onBack,
        onClick: onBack,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: ICON_CHEVRON_LEFT, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tweakers-list-screen-back-label", children: back })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        ref: rootRef,
        className: rootClassName,
        style,
        "data-wide": wide || void 0,
        role: "listbox",
        "aria-label": label,
        "aria-multiselectable": multiselect || void 0,
        onKeyDown,
        "data-back": back ? true : void 0,
        children: items.map((item) => {
          const rowValue = itemValue(item);
          const selected = rowValue === value;
          const tag = itemTag(item);
          const detail = itemDetail(item);
          const checked = itemChecked(item);
          const icon = itemIcon(item);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "button",
            {
              type: "button",
              disabled,
              role: "option",
              "aria-selected": multiselect ? checked : selected,
              className: "tweakers-list-screen-row",
              "data-selected": selected || void 0,
              "data-tagged": tag ? true : void 0,
              "data-detail": detail,
              "data-checked": checked,
              "aria-checked": checked,
              "data-muted": itemMuted(item) || void 0,
              "data-icon": icon ? true : void 0,
              onFocus: () => onFocusItem?.(rowValue),
              onClick: () => onSelect?.(rowValue),
              children: [
                icon && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { className: "tweakers-list-screen-icon", src: icon, alt: "", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tweakers-list-screen-label", children: itemLabel(item) }),
                tag && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tweakers-list-screen-tag", children: tag }),
                (detail || checked) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ListScreenMark, { detail, checked })
              ]
            },
            rowValue
          );
        })
      }
    )
  ] });
}

// src/components/move-slots.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function moveSlotKind(meta, opts = {}) {
  if (meta.type === "color") return "color";
  if (meta.type === "filter") return "filter";
  if (opts.stage) return "env";
  if (meta.type === "toggle" && meta.moveVisual?.kind === "metronome") return "metronome";
  if (meta.type === "toggle") return meta.icon ? "toggle-icon" : "toggle";
  if (meta.type === "transfer") return "transfer";
  if (meta.type === "gradient") return "ramp";
  if (meta.type === "balance") return "balance";
  if (meta.type === "slider" && meta.display === "dial") return "dial";
  if (meta.type === "xy") return "xy";
  if (meta.type === "range") return "range";
  const drawing = moveNumericDrawing(meta, opts.value ?? meta.min);
  if (drawing) return drawing.kind;
  if (movePlaybackMode(meta, opts.value)) return "playback";
  if (opts.enum) {
    if (opts.shape) return "curve";
    if (opts.picture) return "picture";
    if (opts.glyph) return "icon";
    return "enum";
  }
  return opts.valueFirst ? "value" : "default";
}
function MoveSlotGlyph({ name, className }) {
  const paths = LUCIDE_ICONS[name];
  if (!paths) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: paths.map((d) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d }, d))
    }
  );
}
function splitReadoutUnit(value) {
  const m = /^(.*\d)\s*([^\d\s][^\d]*)$/.exec(value.trim());
  const unit = m ? m[2].trim() : "";
  return m && unit.length > 1 ? { num: m[1], unit } : { num: value, unit: null };
}
function MoveSlotReadout({ label, value }) {
  const split = typeof value === "string" ? splitReadoutUnit(value) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-dial-readout", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-label", "data-long": label.length > 9 || void 0, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-value", children: split?.unit ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-number", children: split.num }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-unit", children: split.unit })
    ] }) : value })
  ] });
}
function MoveSlotShape({ d, className = "tweakers-move-dial-shape" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className, viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d }) });
}
function MoveSlotDefaultBody({
  label,
  value,
  pct,
  originPct,
  atOrigin
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-dial-bar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          className: "tweakers-move-dial-fill",
          "data-zero": atOrigin || void 0,
          style: originPct != null ? { marginLeft: `${Math.min(pct, originPct)}%`, width: `${Math.abs(pct - originPct)}%` } : { width: `${pct}%` }
        }
      ),
      atOrigin && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-zero", style: { left: `calc(2px + (100% - 4px) * ${(originPct ?? 0) / 100})` } })
    ] })
  ] });
}
var MOVE_LIST_ROWS = 5;
function MoveSlotEnumBody({
  label,
  optionLabel,
  options,
  activeIdx,
  shape,
  glyph,
  picture = null,
  playback,
  scoped
}) {
  const selected = options[activeIdx];
  if (playback || shape || glyph || picture || scoped) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      !playback && picture && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotPicture, { src: picture }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-tag", children: label }),
      playback && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotPlaybackDrawing, { mode: playback }),
      !playback && shape && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotShape, { d: shape }),
      !playback && !picture && glyph && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotGlyph, { name: glyph, className: "tweakers-move-dial-icon" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-option", children: optionLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-dial-enum", children: options.map((opt, j) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "tweakers-move-dial-enum-cell",
          "data-on": j === activeIdx || void 0
        },
        enumOptionValue(opt)
      )) }) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "tweakers-move-dial-screen",
      "data-grow": options.length > MOVE_LIST_ROWS || void 0,
      style: { "--move-list-count": options.length },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-head", children: label }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          ListScreen,
          {
            className: "tweakers-move-dial-list",
            items: options.map((opt) => ({
              value: enumOptionValue(opt),
              label: enumOptionLabel(opt)
            })),
            value: selected ? enumOptionValue(selected) : void 0,
            follow: "center"
          }
        )
      ]
    }
  );
}
function MoveSlotXYBody({ label, value, position, gridN, shape = null }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-xy", children: shape !== null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotShape, { d: shape, className: "tweakers-move-xy-curve" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      gridN > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-xy-grid", style: {
        "--tweak-xy-grid-step-x": `${100 / gridN}%`,
        "--tweak-xy-grid-step-y": `${100 / gridN}%`
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-xy-line", "data-axis": "x", style: { top: `${position.y * 100}%` } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-xy-line", "data-axis": "y", style: { left: `${position.x * 100}%` } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-xy-dot", style: { left: `${position.x * 100}%`, top: `${position.y * 100}%` } })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotReadout, { label, value })
  ] });
}
function MoveSlotDisplay({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-slot-display", children });
}
function MoveSlotDisplayFoot({ label, value }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-slot-foot", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-slot-foot-label", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-slot-foot-value", children: value })
  ] });
}
function MoveSlotTransferBody({ label, value, shape, point }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(MoveSlotDisplay, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotShape, { d: shape, className: "tweakers-move-slot-shape" }),
      point && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "tweakers-move-slot-dot",
          style: { left: `${point.x * 100}%`, top: `${point.y * 100}%` }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotRampBody({ label, value, css, stop, stops }) {
  const tickLeft = (p) => `calc(${p * 100}% + ${(0.5 - p) * 4}px)`;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(MoveSlotDisplay, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-slot-ramp", style: { background: css } }),
      (stops ?? []).map((p, i) => p === stop ? null : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-slot-tick", "data-quiet": true, style: { left: tickLeft(p) } }, i)),
      stop !== null && // The only thing saying which stop the knob is holding.
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "tweakers-move-slot-tick",
          style: { left: tickLeft(stop) }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotDialBody({ label, value, bearing, origin }) {
  const rad = (bearing - 90) * Math.PI / 180;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotDisplay, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { className: "tweakers-move-slot-needle", viewBox: "-12 -12 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { className: "tweakers-move-needle-face", cx: "0", cy: "0", r: "8.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-needle-sweep", d: arcPath(origin, bearing, 8.5) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "line",
        {
          className: "tweakers-move-needle-hand",
          x1: "0",
          y1: "0",
          x2: (8.5 * Math.cos(rad)).toFixed(3),
          y2: (8.5 * Math.sin(rad)).toFixed(3)
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotDisplayFoot, { label, value })
  ] });
}
function MoveSlotRangeBody({
  label,
  value,
  lo,
  hi
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-dial-range", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          className: "tweakers-move-dial-span",
          style: { left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-handle", style: { left: `${lo * 100}%` } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-handle", style: { left: `${hi * 100}%` } })
    ] }) })
  ] });
}
function MoveSlotFilterBody({
  meta,
  value,
  shape
}) {
  const ca = resolveFilterAxis(meta.cutoffAxis, "cutoff");
  const ra = resolveFilterAxis(meta.resonanceAxis, "resonance");
  const fmt = (v, f) => f ? f(v) : Math.abs(v) >= 100 ? Math.round(v).toString() : Number(v.toFixed(2)).toString();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-filter-display", children: shape && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotShape, { d: shape, className: "tweakers-move-filter-shape" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-filter-readout", "data-side": "cutoff", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-label", children: ca.label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-value", children: fmt(value.cutoff, ca.formatValue) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-filter-readout", "data-side": "resonance", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-label", children: ra.label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-value", children: fmt(value.resonance, ra.formatValue) })
    ] })
  ] });
}
function MoveSlotTrimSpanBody({ start, end }) {
  const at2 = (position) => `${Math.max(0, Math.min(1, position)) * 100}%`;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-tag", "data-side": "start", children: start.label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-tag", "data-side": "end", children: end.label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-trim-span-track", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-guide" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-kept", style: { left: at2(start.position), right: `calc(100% - ${at2(Math.max(start.position, end.position))})` } }),
      [["start", start], ["end", end]].map(([edge, e]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "svg",
        {
          className: "tweakers-move-trim-span-flag",
          "data-edge": edge,
          "data-offset": e.moved || void 0,
          style: { left: at2(e.position) },
          viewBox: "0 0 12 22",
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: edge === "start" ? "M0 0h2v22H0zM2 0l10 6L2 12z" : "M10 0h2v22h-2zM10 0L0 6l10 6z" })
        },
        edge
      ))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-value", "data-side": "start", children: start.value }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-trim-span-value", "data-side": "end", children: end.value })
  ] });
}
var MOVE_GATE_GRID = { columns: 14, rows: 4 };
var MOVE_MULTIBAND_GRID = { columnsPerSlot: 7, rows: 4 };
var place2 = (position) => Math.max(0, Math.min(1, position));
function MoveFaceBar({ role, dial }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "span",
    {
      className: "tweakers-move-face-bar",
      "data-role": role,
      "data-track": role,
      "data-active": dial.active || void 0,
      style: { "--move-face-at": place2(dial.position) },
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "tweakers-move-face-bar-lit" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "tweakers-move-face-bar-marker" })
      ]
    }
  );
}
function MoveFaceGrid({ columns, rows, children }) {
  const corners = { 0: "tl", [columns - 1]: "tr", [columns * (rows - 1)]: "bl", [columns * rows - 1]: "br" };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "tweakers-move-face-grid",
      "data-track": "grid",
      "aria-hidden": "true",
      style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` },
      children: [
        Array.from({ length: columns * rows }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { "data-corner": corners[i] }, i)),
        children && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-face-display", children })
      ]
    }
  );
}
function MoveFaceName({ col, dial }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-face-name", "data-active": dial.active || void 0, style: { "--move-face-col": col }, children: dial.active ? dial.value : dial.label });
}
function MoveSlotGateBody({
  threshold,
  lookahead,
  release,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-face", style: { "--move-face-span": 3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceBar, { role: "threshold", dial: threshold }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceGrid, { columns: MOVE_GATE_GRID.columns, rows: MOVE_GATE_GRID.rows, children }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceBar, { role: "release", dial: release }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 0, dial: threshold }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-gate-look", "data-active": lookahead.active || void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-gate-look-name", children: lookahead.active ? lookahead.value : lookahead.label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-gate-look-line", "data-track": "lookahead", style: { "--move-face-at": place2(lookahead.position) }, "aria-hidden": "true", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "tweakers-move-gate-look-lit" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", { className: "tweakers-move-gate-look-dot" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "tweakers-move-gate-look-arrow", viewBox: "0 0 8 12", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M1 1l6 5-6 5" }) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 2, dial: release })
  ] });
}
function MoveSlotVectorBody({ x, y, z, down = false }) {
  const stage = moveVectorStage(x.position, y.position, z.position, down);
  const { width: w, height: h } = MOVE_STAGE;
  const at2 = (px, py) => ({ "--move-vector-x": `${px / w * 100}%`, "--move-vector-y": `${py / h * 100}%` });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-face", style: { "--move-face-span": 3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-vector-stage", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-vector-floor", d: stage.floor }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-vector-rules", d: stage.rules }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-vector-depth", "data-active": z.active || void 0, d: stage.depth }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "line",
          {
            className: "tweakers-move-vector-rail",
            "data-active": x.active || void 0,
            x1: 0,
            x2: w,
            y1: stage.foot.y,
            y2: stage.foot.y
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "i",
        {
          className: "tweakers-move-vector-foot",
          style: { ...at2(stage.foot.x, stage.foot.y), "--move-vector-size": `${stage.foot.ry * 2 / h * 100}%` }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "i",
        {
          className: "tweakers-move-vector-stalk",
          "data-active": y.active || void 0,
          style: { ...at2(stage.stalk.x, stage.stalk.y2), "--move-vector-size": `${(stage.stalk.y1 - stage.stalk.y2) / h * 100}%` }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "i",
        {
          className: "tweakers-move-vector-mark",
          "data-active": x.active || y.active || z.active || void 0,
          style: { ...at2(stage.mark.x, stage.mark.y), "--move-vector-size": `${stage.mark.r * 2 / h * 100}%` }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-vector-track", "data-track": "axis-x" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-vector-track", "data-track": "axis-y" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-vector-track", "data-track": "axis-z" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 0, dial: x }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 1, dial: y }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 2, dial: z })
  ] });
}
function MoveSlotChannelBody({ channels }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-face", style: { "--move-face-span": channels.length }, children: channels.map((channel, k) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: "tweakers-move-channel",
      "data-active": channel.active || void 0,
      style: { "--move-face-col": k, "--move-channel-tone": channel.tone ? `var(--move-${channel.tone})` : void 0 },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-channel-head", children: [
          channel.icon && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon: channel.icon, className: "tweakers-move-channel-icon" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-channel-name", children: channel.active ? channel.value : channel.label })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-channel-well", "data-track": `channel-${k}`, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "i",
          {
            className: "tweakers-move-channel-fill",
            "data-empty": channel.position <= 0 || void 0,
            style: { "--move-face-at": place2(channel.position) }
          }
        ) })
      ]
    },
    k
  )) });
}
var MOVE_GAUGE = { r: 36, base: 18, half: 43, top: 37, height: 56, sweep: 110, ticks: 11 };
var moveGaugeBearing = (position) => (place2(position) * 2 - 1) * MOVE_GAUGE.sweep;
function MoveGauge({ position }) {
  const { r, base, half, top, height, sweep, ticks } = MOVE_GAUGE;
  const foot = Math.sqrt(r * r - base * base);
  const point = (bearing, radius) => {
    const rad = bearing * Math.PI / 180;
    return [radius * Math.sin(rad), -radius * Math.cos(rad)];
  };
  const needle = point(moveGaugeBearing(position), r * 0.62);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { className: "tweakers-move-multiband-gauge", "data-track": "speed", viewBox: `${-half} ${-top} ${half * 2} ${height}`, "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-multiband-gauge-dome", d: `M${-foot} ${base}A${r} ${r} 0 1 1 ${foot} ${base}Z` }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { className: "tweakers-move-multiband-gauge-base", x1: -half + 1, y1: base, x2: half - 1, y2: base }),
    Array.from({ length: ticks }, (_, k) => {
      const at2 = k / (ticks - 1);
      const major = k % 5 === 0;
      const [x1, y1] = point(-sweep + at2 * sweep * 2, r - 4);
      const [x2, y2] = point(-sweep + at2 * sweep * 2, r - (major ? 10 : 7));
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "line",
        {
          className: "tweakers-move-multiband-gauge-tick",
          "data-major": major || void 0,
          "data-lit": at2 <= place2(position) + 1e-9 || void 0,
          x1,
          y1,
          x2,
          y2
        },
        k
      );
    }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { className: "tweakers-move-multiband-gauge-needle", x1: "0", y1: "0", x2: needle[0], y2: needle[1] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { className: "tweakers-move-multiband-gauge-pivot", cx: "0", cy: "0", r: "2.5" })
  ] });
}
function MoveSlotMultibandBody({
  amount,
  speed,
  bands,
  icon,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-face", style: { "--move-face-span": 2 + bands.length }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceBar, { role: "amount", dial: amount }),
    icon && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon, className: "tweakers-move-multiband-icon" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveGauge, { position: speed.position }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceGrid, { columns: MOVE_MULTIBAND_GRID.columnsPerSlot * bands.length, rows: MOVE_MULTIBAND_GRID.rows, children }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 0, dial: amount }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 1, dial: speed }),
    bands.map((band, k) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveFaceName, { col: 2 + k, dial: band }, k))
  ] });
}
function MoveSlotColorBody({ label, color }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-color-swatch", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { background: color } }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-head", "data-ink": colorInk(color), children: label })
  ] });
}
function colorInk(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return "light";
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  return luminance * (rgb.a ?? 1) > 0.42 ? "dark" : "light";
}
function MoveSlotEnvBody({
  points,
  stages: stages2,
  joints = []
}) {
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i / (points.length - 1) * 100} ${100 - v * 100}`).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-env-display", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotShape, { d, className: "tweakers-move-env-shape" }),
      joints.map((j) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "tweakers-move-env-handle",
          "data-held": j.held || void 0,
          style: {
            left: `${j.x * 100}%`,
            top: `calc(6px + (100% - 12px) * ${(1 - j.y).toFixed(4)})`
          }
        },
        j.stage
      ))
    ] }),
    stages2.map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-env-readout", "data-stage": s.stage, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-label", children: s.label }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-value", children: s.value })
    ] }, s.stage))
  ] });
}
function MoveSlotScopeBody({
  label,
  value,
  pct,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-scope-display", children }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotReadout, { label, value }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-dial-bar", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-dial-fill", style: { width: `${pct}%` } }) })
  ] });
}
function MoveSlotToggleBody({ label, checked, icon, onIcon, offIcon }) {
  const badge = checked ? onIcon : offIcon;
  if (!icon) {
    const split = /\d/.test(label[0] ?? "") ? splitReadoutUnit(label) : null;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-toggle-indicator", "data-on": checked || void 0 }),
      split?.unit ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-dial-toggle-label", "data-value": true, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-number", children: split.num }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-unit", children: split.unit })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-toggle-label", children: label })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-toggle-picture", "aria-hidden": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon, className: "tweakers-move-toggle-icon" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-toggle-badge", children: badge ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon: badge, className: "tweakers-move-toggle-state-icon" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotBadge, { on: checked }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-toggle-label", children: label })
  ] });
}
var METRONOME_VIEWBOX = "-23 -31 46 36";
var METRONOME_BODY = "M -3.07 -30 H 3.07 L 12.11 4 H -12.11 Z";
var METRONOME_ARM = 30;
var METRONOME_WEIGHT_AT = 21;
var METRONOME_WEIGHT_R = 4.5;
var METRONOME_STROKE = 2;
var METRONOME_CUT = 2;
var METRONOME_SWING_DEG = 45;
function MoveSlotMetronomeBody({ label, checked, swing }) {
  const arm = (0, import_react2.useRef)(null);
  const read2 = (0, import_react2.useRef)(swing);
  read2.current = swing;
  const swings = checked && !!swing;
  (0, import_react2.useEffect)(() => {
    const g = arm.current;
    if (!g) return;
    const lean = (deg) => g.setAttribute("transform", `rotate(${deg.toFixed(2)})`);
    const still = typeof window === "undefined" || typeof window.requestAnimationFrame !== "function" || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!swings || still) {
      lean(0);
      return;
    }
    let frame = 0;
    const tick = () => {
      const at2 = read2.current?.();
      lean(typeof at2 === "number" && Number.isFinite(at2) ? Math.max(-1, Math.min(1, at2)) * METRONOME_SWING_DEG : 0);
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.cancelAnimationFrame(frame);
      lean(0);
    };
  }, [swings]);
  const split = /\d/.test(label[0] ?? "") ? splitReadoutUnit(label) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    split?.unit ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-metronome-readout", "data-value": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-number", children: split.num }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-dial-unit", children: split.unit })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-metronome-readout", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-metronome-picture", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "svg",
      {
        className: "tweakers-move-metronome",
        "data-on": checked || void 0,
        viewBox: METRONOME_VIEWBOX,
        fill: "none",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "path",
            {
              className: "tweakers-move-metronome-body",
              d: METRONOME_BODY,
              strokeWidth: METRONOME_STROKE,
              strokeLinejoin: "round"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("g", { ref: arm, transform: "rotate(0)", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("g", { className: "tweakers-move-metronome-cut", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "line",
                {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: -METRONOME_ARM,
                  strokeWidth: METRONOME_STROKE + 2 * METRONOME_CUT,
                  strokeLinecap: "round"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: 0, cy: -METRONOME_WEIGHT_AT, r: METRONOME_WEIGHT_R + METRONOME_CUT })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "line",
              {
                className: "tweakers-move-metronome-arm",
                x1: 0,
                y1: 0,
                x2: 0,
                y2: -METRONOME_ARM,
                strokeWidth: METRONOME_STROKE,
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "circle",
              {
                className: "tweakers-move-metronome-weight",
                cx: 0,
                cy: -METRONOME_WEIGHT_AT,
                r: METRONOME_WEIGHT_R
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
function MoveSlotPicture({ src }) {
  const mask = `url(${JSON.stringify(src)})`;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "span",
    {
      className: "tweakers-move-dial-picture",
      "aria-hidden": "true",
      style: { maskImage: mask, WebkitMaskImage: mask }
    }
  );
}
function MoveSlotIcon({ icon, className }) {
  if (LUCIDE_ICONS[icon]) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotGlyph, { name: icon, className });
  const mask = `url(${JSON.stringify(icon)})`;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "span",
    {
      className,
      "data-asset": true,
      "aria-hidden": "true",
      style: { maskImage: mask, WebkitMaskImage: mask }
    }
  );
}
function MoveSlotBadge({ on }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "svg",
    {
      className: "tweakers-move-toggle-state-icon",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: on ? ICON_BADGE_ON : ICON_BADGE_OFF })
    }
  );
}
function MovePadToggleBody({ label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-indicator" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label })
  ] });
}
function MovePadIconBody({ icon }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon, className: "tweakers-move-pad-icon" });
}
function MovePadValueBody({ label, value, unit, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    children,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-pad-reading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-number", children: value }),
      unit && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: unit })
    ] })
  ] });
}
function MovePadWaveBody({ label, percent }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-indicator" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-pad-reading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-number", children: percent }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "%" })
    ] })
  ] });
}
function MovePadActionBody({ label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label });
}
function MovePadIconLabelBody({ icon, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "tweakers-move-pad-icon-label", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotIcon, { icon, className: "tweakers-move-pad-icon" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label })
  ] });
}
function MovePadColorBody({ label, color }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-swatch", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { background: color } }) })
  ] });
}
function MovePadTabsBody({ name, options, activeIdx }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    name != null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-tabs-head", children: name }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-tabs-run", children: options.map((opt, i) => {
      const glyph = enumOptionIcon(opt);
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "span",
        {
          className: "tweakers-move-tab",
          "data-on": i === activeIdx || void 0,
          children: glyph ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveSlotGlyph, { name: glyph, className: "tweakers-move-tab-icon" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-tab-title", children: enumOptionLabel(opt) })
        },
        enumOptionValue(opt)
      );
    }) })
  ] });
}
var BAND_CAPTIONS = { high: "Hi", low: "Lo" };
function MovePadBandBody({ low, high, upper = "high" }) {
  const cuts = moveBandCuts(low.at, high.at);
  const hands = { low, high };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-band-screen", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-band-cells", "aria-hidden": "true", children: Array.from({ length: 32 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("i", {}, i)) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-band-plot", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "svg",
        {
          className: "tweakers-move-band-drawing",
          viewBox: `0 0 ${MOVE_BAND_W} ${MOVE_BAND_H}`,
          preserveAspectRatio: "none",
          "aria-hidden": "true",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-band-cut", "data-cut": low.cut || void 0, d: cuts.low }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { className: "tweakers-move-band-cut", "data-cut": high.cut || void 0, d: cuts.high })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-band-handle", style: { left: `${low.at * 100}%` } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-band-handle", style: { left: `${high.at * 100}%` } })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-band-captions", children: [upper, upper === "high" ? "low" : "high"].map((hand) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "span",
      {
        className: "tweakers-move-band-caption",
        "data-held": hands[hand].held || void 0,
        "data-latched": hands[hand].latched || void 0,
        children: BAND_CAPTIONS[hand]
      },
      hand
    )) })
  ] });
}
var edgeAt = (at2) => Math.max(0, Math.min(1, at2)) * 100;
function MovePadFadeBody({ fadeIn, fadeOut }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-edges-track", "aria-hidden": "true", children: [["in", fadeIn], ["out", fadeOut]].map(([edge, hand]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "span",
    {
      className: "tweakers-move-fade",
      "data-edge": edge,
      "data-moved": hand.moved || void 0,
      style: { "--move-edge-at": `${edgeAt(hand.at)}%` },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-fade-ramp" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-fade-handle" })
      ]
    },
    edge
  )) });
}
function MovePadLoopBody({ start, end }) {
  const a = edgeAt(start.at);
  const b = edgeAt(end.at);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-edges-track", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-loop-outside", style: { left: 0, width: `${a}%` } }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-loop-outside", style: { right: 0, width: `${100 - b}%` } }),
    [["start", start, a], ["end", end, b]].map(([edge, hand, at2]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "svg",
      {
        className: "tweakers-move-loop-marker",
        "data-edge": edge,
        "data-moved": hand.moved || void 0,
        style: { left: `${at2}%` },
        viewBox: "0 0 8 16",
        preserveAspectRatio: "none",
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: edge === "start" ? "M0 0L8 8L0 16Z" : "M8 0L0 8L8 16Z" })
      },
      edge
    ))
  ] });
}
function MovePadAppBody({ label, color }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "span",
      {
        className: "tweakers-move-pad-indicator",
        style: color ? { background: color } : void 0
      }
    ),
    label && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tweakers-move-pad-title", children: label })
  ] });
}
function MovePadListBody({ view, onCursor, onToggle }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "tweakers-move-pad-list-body", "aria-busy": view.pending || void 0, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      ListScreen,
      {
        className: "tweakers-move-dial-list",
        follow: "center",
        label: view.label,
        disabled: view.pending,
        multiselect: !view.single,
        items: view.options.map((option) => ({ ...option, checked: view.selected.includes(option.value) })),
        value: view.options[view.cursor]?.value,
        onFocusItem: (value) => onCursor(view.options.findIndex((option) => option.value === value)),
        onSelect: (value) => {
          onCursor(view.options.findIndex((option) => option.value === value));
          onToggle();
        }
      }
    ),
    (view.error || view.pending || !view.options.length) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "tweakers-move-pad-list-status", role: "status", "aria-live": "polite", children: view.error ?? (view.pending ? "Starting\u2026" : "No options available.") })
  ] });
}
var MOVE_PAD_LIBRARY = {
  toggle: { description: "a switch; the pad inverts when it is on", component: MovePadToggleBody },
  icon: { description: "a switch drawn as its picture alone \u2014 no name, the pad inverts when it is on", component: MovePadIconBody },
  value: { description: "a value the dial above can borrow \u2014 hold to peek, tap to latch", component: MovePadValueBody },
  list: { description: "a checked list above a small pad; its dial walks, Sample selects, a second pad press runs \u2014 or, single, a picker: Sample takes the row and the pad names it", component: MovePadListBody },
  action: { description: "a button: a press runs the app\u2019s action", component: MovePadActionBody },
  "icon-label": { description: "a button wearing its picture beside its name \u2014 a press runs the app\u2019s action", component: MovePadIconLabelBody },
  app: { description: "a cell the app paints itself \u2014 a track, a slice, a step", component: MovePadAppBody },
  bend: { description: "hold and drag to bend the envelope ramp above it", component: MovePadToggleBody },
  wave: { description: "hold and drag for the stage\u2019s own sine, tap to flip it", component: MovePadWaveBody },
  tabs: { description: "2 to 8 pads: the page\u2019s modes side by side, the current one lit \u2014 a name pad optional", component: MovePadTabsBody },
  color: { description: "a single colour in a small slot \u2014 tap latches it onto the dial above, hold peeks; that dial edits and opens it", component: MovePadColorBody },
  band: { description: "2 pads in one column: a high cut over a low cut, drawn as one band on a small screen \u2014 each half its own chip", component: MovePadBandBody },
  fade: { description: "2 pads in one row: a fade in and a fade out, each a ramp from its own end of one line \u2014 each half its own chip", component: MovePadFadeBody },
  loop: { description: "2 pads in one row: a loop\u2019s start and end, a marker for each on one line \u2014 each half its own chip", component: MovePadLoopBody }
};
var MOVE_SLOT_LIBRARY = {
  color: { description: "selected color; hue on the dial, luminosity on volume, tap to edit", component: MoveSlotColorBody },
  opacity: { description: "overlapping circles showing transparency", component: MoveSlotNumericBody },
  blur: { description: "pixel blur on a single filled circle", component: MoveSlotNumericBody },
  pan: { description: "position between L, C and R references", component: MoveSlotNumericBody },
  "stereo-width": { description: "stereo separation with a unity reference", component: MoveSlotNumericBody },
  pitch: { description: "signed pitch ruler with a zero reference", component: MoveSlotNumericBody },
  trim: { description: "one edge of a take \u2014 the kept part filled from the far end, the value beneath", component: MoveSlotNumericBody },
  offset: { description: "a signed nudge \u2014 the room it can move in, a pin where it is now, a chevron for each way left", component: MoveSlotOffsetBody },
  "trim-span": { description: "2 slots: a take\u2019s start and end on one line, a flag per edge", component: MoveSlotTrimSpanBody },
  gate: { description: "3 slots: threshold and release as bars, look-ahead as a line, the gate live on a grid between", component: MoveSlotGateBody },
  vector: { description: "3 slots: x, y and a depth z as one stage \u2014 the mark on a ruled floor, its height a stalk from its shadow, its distance its size", component: MoveSlotVectorBody },
  channel: { description: "a slot per channel: icon and name in its tone over a fader filled to its level", component: MoveSlotChannelBody },
  multiband: { description: "a slot per dial: amount as a bar, speed as a gauge, the bands as a live curve on a grid", component: MoveSlotMultibandBody },
  playback: { description: "explicit playback traversal with a named mode", component: MoveSlotEnumBody },
  default: { description: "name centred, value on touch, fill bar", component: MoveSlotDefaultBody },
  value: { description: "value-first: the value is the headline, the name a tag on top", component: MoveSlotDefaultBody },
  icon: { description: "option picker showing the current option as a glyph", component: MoveSlotEnumBody },
  picture: { description: "option picker whose current option fills the slot as a picture, its name over it", component: MoveSlotEnumBody },
  curve: { description: "option picker drawing the current option\u2019s shape \u2014 curve selection", component: MoveSlotEnumBody },
  enum: { description: "stepped option picker showing every option on a list screen", component: MoveSlotEnumBody },
  xy: { description: "two axes in one gesture field, or a live shape preview", component: MoveSlotXYBody },
  range: { description: "two handles on one bar; volume knob is the second hand", component: MoveSlotRangeBody },
  filter: { description: "2 slots: cutoff + resonance as one response picture", component: MoveSlotFilterBody },
  env: { description: "4 slots: the whole ADSR as one shape, a caption per stage", component: MoveSlotEnvBody },
  scope: { description: "a dial with the live signal filling it behind the readout", component: MoveSlotScopeBody },
  toggle: { description: "a switch in a big slot \u2014 the pad\u2019s language at slot size", component: MoveSlotToggleBody },
  "toggle-icon": { description: "a switch drawn as its own picture \u2014 the glyph takes a ban while it is off", component: MoveSlotToggleBody },
  metronome: { description: "a switch drawn as a metronome \u2014 the arm swings to the beat while it is on", component: MoveSlotMetronomeBody },
  transfer: { description: "a response curve, one knob holding one of its points", component: MoveSlotTransferBody },
  ramp: { description: "a colour ramp, one knob holding one of its stops \u2014 tap to edit its colours", component: MoveSlotRampBody },
  balance: { description: "the mix between two colour params \u2014 the blend fills the slot, the tick is the dial", component: MoveSlotRampBody },
  dial: { description: "a needle, for values whose two ends are the same place", component: MoveSlotDialBody }
};

// src/components/MovePadList.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function MovePadList({ panelId, path, label, icon, view, disabled }) {
  const root = (0, import_react3.useRef)(null);
  const open2 = view?.panelId === panelId && view.path === path;
  const shown = open2 ? view.submitLabel ?? label : MovePadListStore.choice(panelId, path)?.label ?? label;
  (0, import_react3.useEffect)(() => () => {
    const current = MovePadListStore.getView();
    if (current?.panelId === panelId && current.path === path) MovePadListStore.close();
  }, [panelId, path]);
  (0, import_react3.useEffect)(() => {
    if (!open2) return;
    const key = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))) return;
      if (["Enter", " "].includes(event.key) && event.target === root.current?.querySelector("button")) return;
      if (!["Escape", "Enter", " ", "ArrowUp", "ArrowDown", "x", "X"].includes(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.repeat && ["Enter", " "].includes(event.key)) return;
      if (event.key.toLowerCase() === "x") void MovePadListStore.submit();
      else if (event.key === "Escape") {
        MovePadListStore.close();
        root.current?.querySelector("button")?.focus();
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") MovePadListStore.move(event.key === "ArrowUp" ? -1 : 1);
      else MovePadListStore.toggleCursor();
    };
    const outside = (event) => {
      if (!event.target.closest?.('.tweakers-move-chip[data-name="capture"], .tweakers-move-chip[data-name="sample"], [data-pad-list-dial]') && !root.current?.contains(event.target)) MovePadListStore.close();
    };
    const jogClick = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      MovePadListStore.toggleCursor();
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("pointerdown", outside);
    window.addEventListener("move-tweakers:jog-click", jogClick, true);
    return () => {
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("move-tweakers:jog-click", jogClick, true);
    };
  }, [open2]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "tweakers-move-pad-list-anchor", ref: root, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-pad",
        "data-kind": "list",
        "data-confirm": open2 || void 0,
        "data-pending": open2 && view.pending || void 0,
        "aria-expanded": open2,
        "aria-haspopup": "listbox",
        "aria-busy": open2 && view.pending || void 0,
        disabled: disabled || open2 && view.pending,
        onClick: () => {
          void MovePadListStore.activate(panelId, path);
        },
        children: icon ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MovePadIconLabelBody, { icon, label: shown }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MovePadActionBody, { label: shown })
      }
    ),
    open2 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "tweakers-move-dial-screen tweakers-move-pad-list-overlay", onWheel: (event) => {
      event.stopPropagation();
      MovePadListStore.move(event.deltaY);
    }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(MovePadListBody, { view, onCursor: (index) => MovePadListStore.setCursor(index), onToggle: () => MovePadListStore.toggleCursor() }) })
  ] });
}

// src/components/PresetExploration.tsx
var import_react4 = require("react");
var import_react5 = require("motion/react");

// src/preset-exploration.ts
var import_TweakStore3 = require("tweakers/store");

// src/preset-genetics.ts
var cloneDNA = (value) => structuredClone(value);
var clamp5 = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
var newDNAId = () => `dna-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
function collectGenes(controls, group = "") {
  return controls.flatMap((c) => {
    if (c.type === "folder") return collectGenes(c.children ?? [], group ? `${group} / ${c.label}` : c.label);
    if (c.tabBar || c.path === "_tab") return [];
    const trouble = c.path.endsWith("_enabled") || /^(device on|bypass)$/i.test(c.label);
    const base = { id: c.path, path: c.path, label: c.label, group, trouble, enabled: !trouble };
    const number = (component, min, max, step) => Number.isFinite(min) && Number.isFinite(max) && max > min ? [{
      ...base,
      id: component ? `${c.path}:${component}` : c.path,
      label: component ? `${c.label} \xB7 ${component}` : c.label,
      component,
      kind: "number",
      min,
      max,
      low: min,
      high: max,
      step
    }] : [];
    if (c.type === "slider" || c.type === "number") return number(void 0, c.min, c.max, c.stepInferred ? void 0 : c.step);
    if (c.type === "toggle") return [{ ...base, kind: "category", options: [false, true] }];
    if (c.type === "select") return [{ ...base, kind: "category", options: (c.options ?? []).map((o) => typeof o === "string" ? o : o.value) }];
    if (c.type === "xy") return ["x", "y"].flatMap((k) => {
      const a = k === "x" ? c.xAxis : c.yAxis;
      return number(k, a?.min ?? 0, a?.max ?? 1, c.snap ? a?.step ?? 0.01 : void 0);
    });
    if (c.type === "range") return ["min", "max"].flatMap((k) => number(k, c.min ?? 0, c.max ?? 1, c.step));
    if (c.type === "filter") return ["cutoff", "resonance"].flatMap((k) => {
      const a = k === "cutoff" ? c.cutoffAxis : c.resonanceAxis;
      return number(k, a?.min ?? 0, a?.max ?? 1, a?.step);
    });
    return [];
  });
}
function read(dna, p) {
  const value = dna[p.path];
  return p.component && value && typeof value === "object" ? value[p.component] : value;
}
function write(dna, p, value) {
  if (p.component) dna[p.path] = { ...dna[p.path], [p.component]: value };
  else dna[p.path] = value;
}
function geneBounds(p) {
  let lo = p.low ?? p.min ?? 0, hi = p.high ?? p.max ?? 1;
  if (p.step && p.step > 0) {
    const origin = p.min ?? 0;
    lo = origin + Math.ceil((lo - origin) / p.step - 1e-10) * p.step;
    hi = origin + Math.floor((hi - origin) / p.step + 1e-10) * p.step;
  }
  if (lo > hi) throw new Error(`${p.label}: the range must contain a valid step.`);
  return [lo, hi];
}
function numeric(value, p) {
  const [lo, hi] = geneBounds(p);
  const clipped = clamp5(value, lo, hi);
  return p.step && p.step > 0 ? clamp5((p.min ?? 0) + Math.round((clipped - (p.min ?? 0)) / p.step) * p.step, lo, hi) : clipped;
}
function valid(value, p) {
  return p.kind === "number" ? typeof value === "number" && Number.isFinite(value) : !!p.options?.includes(value);
}
function randomGene(p, random) {
  return p.kind === "number" ? numeric((p.low ?? p.min ?? 0) + random() * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p) : p.options?.[Math.floor(random() * p.options.length)];
}
function repairRanges(dna, parameters) {
  for (const p of parameters) if (p.component === "min") {
    const v = dna[p.path];
    if (v && v.min > v.max) {
      const high = parameters.find((g) => g.path === p.path && g.component === "max");
      if (p.enabled && high?.enabled) {
        const [lo] = geneBounds(p), [, hi] = geneBounds(high);
        if (lo > hi) throw new Error(`${p.label}: endpoint ranges do not overlap in a valid order.`);
        v.min = numeric(Math.max(lo, Math.min(v.min, v.max)), p);
        v.max = numeric(Math.max(v.max, v.min), high);
      } else if (p.enabled) {
        v.min = numeric(v.max, { ...p, high: Math.min(p.high ?? p.max, v.max) });
      } else if (high?.enabled) {
        v.max = numeric(v.min, { ...high, low: Math.max(high.low ?? high.min, v.min) });
      }
    }
  }
  return dna;
}
function reconcileDNA(source, baseline, parameters) {
  const result = cloneDNA(baseline);
  for (const p of parameters) {
    const value = read(source, p);
    if (p.enabled && Object.prototype.hasOwnProperty.call(baseline, p.path) && valid(value, p)) write(result, p, p.kind === "number" ? numeric(value, p) : value);
  }
  return repairRanges(result, parameters);
}
function seedDNA(baseline, parameters, settings2, random = Math.random) {
  const result = cloneDNA(baseline);
  for (const p of parameters.filter((p2) => p2.enabled)) {
    const current = read(baseline, p);
    if (settings2.seedMode === "random" || !valid(current, p)) write(result, p, randomGene(p, random));
    else if (settings2.spread > 0) write(result, p, p.kind === "number" ? numeric(current + (random() * 2 - 1) * settings2.spread * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p) : random() < settings2.spread ? randomGene(p, random) : current);
  }
  return repairRanges(result, parameters);
}
function breedDNA(a, b, baseline, parameters, settings2, random = Math.random) {
  const inherited = cloneDNA(baseline);
  const genes = parameters.filter((p) => p.enabled);
  for (const p of genes) {
    const first = random() < 0.5 ? a : b, second = first === a ? b : a;
    const value = valid(read(first, p), p) ? read(first, p) : read(second, p);
    if (valid(value, p)) write(inherited, p, value);
  }
  const result = reconcileDNA(inherited, baseline, parameters);
  for (let i = 0; i < genes.length; i++) {
    const p = genes[i];
    if (random() >= settings2.mutation) continue;
    if (settings2.mutationMode === "random") write(result, p, randomGene(p, random));
    else {
      const adjacent = [genes[i - 1], genes[i + 1]].filter((q) => q && q.kind === p.kind && valid(read(inherited, q), q) && (p.kind === "number" || valid(read(inherited, q), p)));
      const neighbor = adjacent[Math.floor(random() * adjacent.length)];
      if (!neighbor) continue;
      const value = read(inherited, neighbor);
      write(result, p, p.kind === "number" ? numeric((p.low ?? p.min ?? 0) + clamp5((value - neighbor.min) / (neighbor.max - neighbor.min)) * ((p.high ?? p.max ?? 1) - (p.low ?? p.min ?? 0)), p) : value);
    }
  }
  return repairRanges(result, parameters);
}
function chooseParents(pool, random = Math.random) {
  if (pool.length < 2) throw new Error("Mark at least two parents in the breeding window.");
  const pick = (list) => {
    let ticket = random() * list.reduce((n, p) => n + clamp5(p.rating, 1, 5), 0);
    return list.find((p) => (ticket -= clamp5(p.rating, 1, 5)) < 0) ?? list[list.length - 1];
  };
  const a = pick(pool);
  return [a, pick(pool.filter((p) => p.id !== a.id))];
}
function morphDNA(children, morph, baseline, parameters) {
  const quad = (x, y) => [(1 - x) * (1 - y), x * (1 - y), (1 - x) * y, x * y];
  const groups = [quad(morph.ax, morph.ay), quad(morph.bx, morph.by)].map((weights, g) => {
    const entries = weights.map((weight, i) => ({ weight, child: children.find((c) => c.id === morph.corners[g * 4 + i]) })).filter((e) => e.child);
    const total = entries.reduce((s, e) => s + e.weight, 0);
    return entries.map((e) => ({ child: e.child, weight: total ? e.weight / total : 1 / entries.length }));
  });
  const weighted = groups.flatMap((entries, g) => entries.map((e) => ({ ...e, weight: e.weight * (groups[1 - g].length ? g ? morph.blend : 1 - morph.blend : 1) })));
  const result = cloneDNA(baseline);
  for (const p of parameters.filter((p2) => p2.enabled)) {
    const entries = weighted.filter((e) => e.weight > 0 && valid(read(e.child.values, p), p));
    const total = entries.reduce((s, e) => s + e.weight, 0);
    if (!total) continue;
    write(result, p, p.kind === "number" ? numeric(entries.reduce((s, e) => s + read(e.child.values, p) * e.weight, 0) / total, p) : read(entries.reduce((a, b) => a.weight >= b.weight ? a : b).child.values, p));
  }
  return repairRanges(result, parameters);
}

// src/preset-exploration.ts
var settings = { mutation: 0.05, mutationMode: "random", breedWindow: 0, seedMode: "current", spread: 0.2, seedCount: 1 };
var emptyMorph = () => ({ corners: Array(8).fill(null), ax: 0.5, ay: 0.5, bx: 0.5, by: 0.5, blend: 0.5, corner: 0 });
var tree = (n) => ({ id: newDNAId(), name: `Tree ${n}`, generations: [{ id: newDNAId(), children: [] }] });
var child = (values, parents = []) => ({ id: newDNAId(), values, parents, rating: 3, marked: false });
var views = ["evolution", "morph", "parameters"];
var ExplorationStore = class {
  constructor() {
    this.state = null;
    this.version = 0;
    this.listeners = /* @__PURE__ */ new Set();
    this.original = null;
    this.live = null;
    this.activePreset = null;
    this.hostOwned = false;
    this.history = [];
    this.cache = /* @__PURE__ */ new Map();
    this.tail = Promise.resolve();
    this.previewRevision = 0;
    this.closing = false;
    this.operation = Promise.resolve();
    this.unsubscribePanel = null;
    this.releaseButtons = [];
    this.parameterIndex = 0;
    this.storageKey = null;
    this.storageName = "localStorage";
    this.getState = () => this.state;
    this.getVersion = () => this.version;
    this.subscribe = (fn) => {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    };
  }
  get adapter() {
    if (!this.hostOwned) return void 0;
    const adapter = this.state ? import_TweakStore3.TweakStore.getPresetProvider(this.state.panelId)?.exploration : this.initialAdapter;
    return adapter ?? this.initialAdapter;
  }
  reportError(message) {
    if (this.state && this.state.error !== message) {
      this.state.error = message;
      this.notify(false);
    }
  }
  notify(persist = true) {
    this.version++;
    if (persist && this.state) {
      this.cache.set(this.state.panelId, cloneDNA(this.state));
      if (this.storageKey && typeof window !== "undefined") try {
        window[this.storageName].setItem(this.storageKey, JSON.stringify({ version: 1, state: this.state }));
      } catch {
        this.state.persistent = false;
        this.state.message = "History is available for this session only.";
      }
    }
    for (const fn of this.listeners) fn();
  }
  async run(action) {
    const s = this.state;
    if (!s || s.busy || this.closing) return;
    let finish;
    this.operation = new Promise((resolve) => {
      finish = resolve;
    });
    s.busy = true;
    s.error = null;
    this.notify(false);
    try {
      await this.tail;
      await action();
    } catch (e) {
      s.error = e instanceof Error ? e.message : String(e);
    } finally {
      finish();
      if (this.state === s) {
        s.busy = this.closing;
        this.notify();
      }
    }
  }
  currentTree() {
    return this.state.trees.find((t) => t.id === this.state.treeId);
  }
  allChildren() {
    return this.currentTree().generations.flatMap((g) => g.children);
  }
  active() {
    return this.state ? this.allChildren().find((c) => c.id === this.state.activeId) : void 0;
  }
  checkpoint() {
    this.history.push(cloneDNA(this.state.trees));
    if (this.history.length > 32) this.history.shift();
  }
  baseline() {
    return cloneDNA(this.adapter ? this.live ?? this.original ?? {} : import_TweakStore3.TweakStore.getValues(this.state.panelId));
  }
  async capture() {
    return cloneDNA(this.adapter ? await this.adapter.capture() : this.baseline());
  }
  preview(values) {
    const revision = ++this.previewRevision, s = this.state;
    this.tail = this.tail.then(async () => {
      if (!s || this.state !== s || revision !== this.previewRevision || this.closing) return;
      try {
        if (this.adapter) await this.adapter.preview(cloneDNA(values));
        else import_TweakStore3.TweakStore.previewValues(s.panelId, cloneDNA(values));
        this.live = cloneDNA(values);
      } catch (e) {
        s.error = `Preview failed: ${e instanceof Error ? e.message : e}`;
        this.notify(false);
      }
    });
  }
  async open(panelId) {
    if (this.state) return;
    const provider = import_TweakStore3.TweakStore.getPresetProvider(panelId);
    this.initialAdapter = provider?.exploration;
    this.hostOwned = !!provider;
    const first = tree(1);
    const parameters = cloneDNA(this.adapter?.parameters ?? collectGenes(import_TweakStore3.TweakStore.getPanel(panelId)?.controls ?? []));
    const target = import_TweakStore3.TweakStore.getPresetPersistenceTarget(panelId);
    this.storageKey = target ? `${target.key}:exploration:v1` : null;
    this.storageName = target?.storage ?? "localStorage";
    let previous = this.cache.get(panelId);
    if (!previous && this.storageKey && typeof window !== "undefined") try {
      const saved = JSON.parse(window[this.storageName].getItem(this.storageKey) ?? "null");
      if (saved?.version === 1 && this.validSaved(saved.state)) previous = saved.state;
    } catch {
    }
    this.state = {
      panelId,
      view: "evolution",
      treeView: false,
      trees: [first],
      treeId: first.id,
      generation: 0,
      activeId: null,
      parameters,
      settings: { ...settings },
      morph: emptyMorph(),
      busy: false,
      error: null,
      omitTrouble: true,
      message: target ? null : "History is available for this session only.",
      saving: false,
      assigning: false,
      persistent: !!target
    };
    if (previous) {
      this.state.trees = cloneDNA(previous.trees);
      this.state.treeId = previous.trees.some((t) => t.id === previous.treeId) ? previous.treeId : previous.trees[0].id;
      this.state.omitTrouble = previous.omitTrouble ?? true;
      this.state.settings = { ...settings, ...previous.settings };
      this.state.morph = { ...emptyMorph(), ...previous.morph };
      for (const p of parameters) {
        const old = previous.parameters.find((q) => q.id === p.id && q.kind === p.kind);
        if (old) {
          p.enabled = old.enabled;
          if (p.kind === "number") {
            p.low = clamp5(old.low ?? p.min, p.min, p.max);
            p.high = clamp5(old.high ?? p.max, p.low, p.max);
          }
        }
      }
    }
    this.history = [];
    this.parameterIndex = 0;
    this.closing = false;
    this.original = null;
    this.live = null;
    this.activePreset = provider?.activeId ?? import_TweakStore3.TweakStore.getActivePresetId(panelId);
    this.bindButtons();
    this.unsubscribePanel = import_TweakStore3.TweakStore.subscribeGlobal(() => {
      if (!import_TweakStore3.TweakStore.getPanel(panelId)) {
        this.cancelSave();
        void this.close();
      } else this.refreshParameters();
    });
    this.notify(false);
    await this.run(async () => {
      if (provider && !this.adapter) throw new Error("This host must provide an exploration adapter before presets can be explored.");
      if (this.adapter && !["capture", "preview", "restore", "save"].every((k) => typeof this.adapter[k] === "function")) throw new Error("The host exploration adapter is incomplete.");
      this.original = await this.capture();
      this.live = cloneDNA(this.original);
      import_TweakStore3.TweakStore.beginPresetPreview(panelId);
      const s = this.state;
      if (!s.trees.some((t) => t.generations.some((g) => g.children.length))) {
        const seeds = [child(cloneDNA(this.original)), ...Array.from({ length: 31 }, () => child(seedDNA(this.original, s.parameters, { ...s.settings, seedMode: "current", spread: 0.2 })))];
        this.currentTree().generations[0].children = seeds;
        s.activeId = seeds[0].id;
        s.message = "Pad 1 is your original sound. Audition the variations and mark two parents.";
      }
    });
  }
  validSaved(s) {
    if (!s || typeof s !== "object") return false;
    const v = s;
    return Array.isArray(v.parameters) && v.parameters.every((p) => p && typeof p.id === "string" && typeof p.path === "string" && ["number", "category"].includes(p.kind) && (p.kind !== "number" || [p.min, p.max, p.low ?? p.min, p.high ?? p.max].every(Number.isFinite))) && Array.isArray(v.trees) && v.trees.length > 0 && v.trees.every((t) => typeof t.id === "string" && Array.isArray(t.generations) && t.generations.length > 0 && t.generations.every((g) => Array.isArray(g.children) && g.children.length <= 32 && g.children.every((c) => typeof c.id === "string" && c.values && typeof c.values === "object" && Array.isArray(c.parents) && Number.isFinite(c.rating)))) && !!v.settings && [v.settings.mutation, v.settings.spread, v.settings.seedCount, v.settings.breedWindow].every(Number.isFinite) && ["random", "copy-error"].includes(v.settings.mutationMode) && ["current", "random"].includes(v.settings.seedMode) && !!v.morph && ["ax", "ay", "bx", "by", "blend", "corner"].every((k) => Number.isFinite(v.morph[k])) && Array.isArray(v.morph.corners) && v.morph.corners.length === 8 && v.morph.corners.every((c) => c === null || typeof c === "string");
  }
  async close() {
    const s = this.state;
    if (!s || this.closing) return;
    if (s.saving) {
      this.cancelSave();
      return;
    }
    this.closing = true;
    ++this.previewRevision;
    s.busy = true;
    this.notify(false);
    await this.operation;
    await this.tail;
    try {
      if (this.original && this.adapter) await this.adapter.restore(cloneDNA(this.original), this.activePreset);
      import_TweakStore3.TweakStore.endPresetPreview(s.panelId);
    } catch (e) {
      s.busy = false;
      s.error = `Could not restore the original sound: ${e instanceof Error ? e.message : e}. Press Back to retry.`;
      this.closing = false;
      this.notify(false);
      return;
    }
    this.notify();
    this.state = null;
    this.original = null;
    this.initialAdapter = void 0;
    this.hostOwned = false;
    for (const release of this.releaseButtons.reverse()) release();
    this.releaseButtons = [];
    this.unsubscribePanel?.();
    this.unsubscribePanel = null;
    this.closing = false;
    this.notify(false);
  }
  bindButtons() {
    const bind = (name, label, fn) => this.releaseButtons.push(MoveFunctions.push(name, fn, { label }));
    bind("back", "Exit exploration", () => {
      void this.close();
    });
    bind("menu", "Tree / save", ({ shift }) => shift ? this.beginSave() : this.toggleTree());
    bind("sample", "Mark parent", () => this.state?.view === "morph" ? this.beginAssign() : this.toggleParent());
    bind("loop", "Generate", () => this.generate());
    bind("capture", "Add / randomize seeds", ({ shift }) => {
      void (shift ? this.randomizeSeeds() : this.addSeeds());
    });
    bind("copy", "Remix / overwrite", ({ shift }) => shift ? void this.overwrite() : this.remix());
    bind("undo", "Undo", () => this.undo());
    bind("left", "Previous generation", () => this.setGeneration((this.state?.generation ?? 0) - 1));
    bind("right", "Next generation", () => this.setGeneration((this.state?.generation ?? 0) + 1));
    for (const [name, step] of [["up", -1], ["down", 1]]) bind(name, "Change view", () => this.setView(views[(views.indexOf(this.state.view) + step + 3) % 3]));
    bind("jog_click", "Mark parent", () => this.toggleParent());
  }
  refreshParameters() {
    if (!this.state) return;
    const fresh = cloneDNA(this.adapter?.parameters ?? collectGenes(import_TweakStore3.TweakStore.getPanel(this.state.panelId)?.controls ?? []));
    for (const p of fresh) {
      const old = this.state.parameters.find((q) => q.id === p.id && q.kind === p.kind);
      if (old) {
        p.enabled = old.enabled;
        if (p.kind === "number") {
          p.low = clamp5(old.low ?? p.min, p.min, p.max);
          p.high = clamp5(old.high ?? p.max, p.low, p.max);
          try {
            geneBounds(p);
          } catch {
            p.low = p.min;
            p.high = p.max;
          }
        }
      }
    }
    if (JSON.stringify(fresh) !== JSON.stringify(this.state.parameters)) this.state.parameters = fresh;
  }
  ready() {
    this.refreshParameters();
    return !!this.state && !!this.original && !this.state.busy && !this.closing;
  }
  setView(view) {
    if (!this.state) return;
    this.state.view = view;
    this.state.treeView = false;
    this.state.assigning = false;
    this.notify();
  }
  toggleTree() {
    if (!this.state) return;
    this.state.view = "evolution";
    this.state.treeView = !this.state.treeView;
    this.notify();
  }
  setGeneration(index) {
    if (!this.state) return;
    this.state.generation = clamp5(Math.round(index), 0, this.currentTree().generations.length - 1);
    this.notify();
  }
  selectTree(id) {
    if (!this.ready() || !this.state.trees.some((t) => t.id === id)) return;
    this.state.treeId = id;
    this.state.generation = 0;
    this.state.activeId = null;
    this.state.morph = emptyMorph();
    this.history = [];
    this.notify();
  }
  select(id) {
    if (!this.ready()) return;
    const s = this.state, c = this.allChildren().find((c2) => c2.id === id);
    if (!c) return;
    s.activeId = id;
    if (s.assigning) {
      s.morph.corners[s.morph.corner] = id;
      s.assigning = false;
      s.view = "morph";
      this.setMorph({});
      return;
    }
    try {
      this.preview(reconcileDNA(c.values, this.baseline(), s.parameters));
    } catch (e) {
      s.error = e instanceof Error ? e.message : String(e);
    }
    this.notify();
  }
  pressPad(x, y) {
    if (!this.state || x < 0 || x > 7 || y < 0 || y > 3) return;
    const c = this.currentTree().generations[this.state.generation].children[(3 - y) * 8 + x];
    if (c) this.select(c.id);
  }
  jog(delta) {
    if (!this.ready()) return;
    if (this.state.view === "parameters") {
      this.parameterIndex = clamp5(this.parameterIndex + Math.sign(delta), 0, this.state.parameters.length - 1);
      this.notify(false);
      return;
    }
    const children = this.currentTree().generations[this.state.generation].children;
    const index = children.findIndex((c2) => c2.id === this.state.activeId);
    const c = children[clamp5(index + Math.sign(delta), 0, children.length - 1)];
    if (c) this.select(c.id);
  }
  toggleParent() {
    if (!this.ready()) return;
    const c = this.active();
    if (c) {
      c.marked = !c.marked;
      this.notify();
    }
  }
  rate(rating) {
    if (!this.ready()) return;
    const c = this.active();
    if (c) {
      c.rating = clamp5(Math.round(rating), 1, 5);
      this.notify();
    }
  }
  setSettings(patch2) {
    if (!this.state) return;
    const s = this.state.settings;
    Object.assign(s, patch2);
    if (!Number.isFinite(s.mutation)) s.mutation = 0.05;
    if (!Number.isFinite(s.spread)) s.spread = 0;
    if (!Number.isFinite(s.seedCount)) s.seedCount = 1;
    if (!Number.isFinite(s.breedWindow)) s.breedWindow = 0;
    s.mutation = clamp5(s.mutation);
    s.spread = clamp5(s.spread);
    s.seedCount = clamp5(Math.round(s.seedCount), 1, 32);
    s.breedWindow = Math.max(0, Math.round(s.breedWindow));
    this.notify();
  }
  generate() {
    if (!this.ready()) return;
    const s = this.state, t = this.currentTree();
    if (!s.parameters.some((p) => p.enabled)) {
      s.error = "Enable at least one parameter.";
      this.notify(false);
      return;
    }
    const pool = (s.settings.breedWindow ? t.generations.slice(-s.settings.breedWindow) : t.generations).flatMap((g) => g.children).filter((c) => c.marked);
    if (pool.length < 2) {
      s.error = "Mark at least two parents in the breeding window.";
      this.notify(false);
      return;
    }
    this.checkpoint();
    const baseline = this.baseline();
    t.generations.push({ id: newDNAId(), children: Array.from({ length: 32 }, () => {
      const [a, b] = chooseParents(pool);
      return child(breedDNA(a.values, b.values, baseline, s.parameters, s.settings), [a.id, b.id]);
    }) });
    s.generation = t.generations.length - 1;
    s.treeView = false;
    s.activeId = null;
    s.error = null;
    this.notify();
  }
  async randomizeSeeds() {
    if (!this.ready()) return;
    await this.run(async () => {
      const s = this.state;
      if (!s.parameters.some((p) => p.enabled)) throw new Error("Enable at least one parameter.");
      const baseline = await this.capture();
      const t = tree(s.trees.length + 1);
      t.generations[0].children = Array.from({ length: 32 }, () => child(seedDNA(baseline, s.parameters, { ...s.settings, seedMode: "random" })));
      s.trees.push(t);
      s.treeId = t.id;
      s.generation = 0;
      s.activeId = null;
      s.view = "evolution";
      s.treeView = false;
      s.assigning = false;
      s.morph = emptyMorph();
      this.history = [];
      s.message = "32 randomized seeds. Audition them and mark two parents. Previous trees are kept.";
    });
  }
  async addSeeds() {
    if (!this.ready()) return;
    await this.run(async () => {
      const s = this.state, seeds = this.currentTree().generations[0].children;
      if (seeds.length >= 32) throw new Error("This seed generation is full. Start a new tree from marked presets.");
      const baseline = await this.capture();
      this.checkpoint();
      for (let i = 0, n = Math.min(s.settings.seedCount, 32 - seeds.length); i < n; i++) seeds.push(child(seedDNA(baseline, s.parameters, s.settings)));
      s.generation = 0;
      s.view = "evolution";
      s.treeView = false;
    });
  }
  getPresetItems() {
    if (!this.state) return [];
    const provider = import_TweakStore3.TweakStore.getPresetProvider(this.state.panelId);
    return provider ? this.adapter?.readPreset ? provider.presets.map((p) => ({ id: p.id, label: p.label })) : [] : import_TweakStore3.TweakStore.getPresets(this.state.panelId).map((p) => ({ id: p.id, label: p.name }));
  }
  async addPresetSeed(id) {
    if (!this.ready()) return;
    await this.run(async () => {
      const s = this.state, seeds = this.currentTree().generations[0].children;
      if (seeds.length >= 32) throw new Error("This seed generation is full.");
      const dna = this.adapter ? await this.adapter.readPreset?.(id) : import_TweakStore3.TweakStore.getPresets(s.panelId).find((p) => p.id === id)?.values;
      if (!dna) throw new Error("This preset is unavailable.");
      this.checkpoint();
      seeds.push(child(reconcileDNA(dna, await this.capture(), s.parameters)));
      s.generation = 0;
    });
  }
  remix() {
    if (!this.ready()) return;
    const c = this.active();
    if (!c) return;
    const s = this.state, parents = c.parents.map((id) => this.allChildren().find((p) => p.id === id));
    this.checkpoint();
    c.values = parents.length === 2 && parents.every(Boolean) ? breedDNA(parents[0].values, parents[1].values, this.baseline(), s.parameters, s.settings) : seedDNA(this.baseline(), s.parameters, s.settings);
    this.select(c.id);
  }
  async overwrite() {
    if (!this.ready() || !this.active()) return;
    await this.run(async () => {
      const values = await this.capture();
      this.checkpoint();
      this.active().values = values;
      this.state.message = "DNA updated. Undo restores the previous version.";
    });
  }
  undo() {
    if (!this.ready() || !this.history.length) return;
    this.state.trees = this.history.pop();
    this.state.generation = Math.min(this.state.generation, this.currentTree().generations.length - 1);
    const available = new Set(this.allChildren().map((c) => c.id));
    this.state.morph.corners = this.state.morph.corners.map((id) => id && available.has(id) ? id : null);
    const active = this.active();
    if (active) this.select(active.id);
    else {
      this.state.activeId = null;
      this.preview(cloneDNA(this.original));
    }
    this.notify();
  }
  newTree() {
    if (!this.ready()) return;
    const seeds = this.allChildren().filter((c) => c.marked).map((c) => child(cloneDNA(c.values)));
    if (!seeds.length || seeds.length > 32) {
      this.state.error = "Mark between 1 and 32 presets for the new tree.";
      this.notify(false);
      return;
    }
    const t = tree(this.state.trees.length + 1);
    t.generations[0].children = seeds;
    this.state.trees.push(t);
    this.selectTree(t.id);
  }
  beginSave() {
    if (!this.ready()) return;
    this.state.saving = true;
    this.notify(false);
  }
  cancelSave() {
    if (!this.state) return;
    this.state.saving = false;
    this.notify(false);
  }
  async save(name) {
    if (!this.ready()) return;
    await this.run(async () => {
      const s = this.state, values = await this.capture(), label = name.trim() || "Exploration preset";
      if (this.adapter) await this.adapter.save(label, values);
      else import_TweakStore3.TweakStore.savePresetSnapshot(s.panelId, label, values);
      s.saving = false;
      s.message = `Saved \u201C${label}\u201D. Keep exploring.`;
    });
  }
  setParameter(id, patch2) {
    if (!this.ready()) return;
    const p = this.state.parameters.find((p2) => p2.id === id);
    if (!p) return;
    if (p.kind === "number" && (patch2.low !== void 0 && !Number.isFinite(patch2.low) || patch2.high !== void 0 && !Number.isFinite(patch2.high))) return;
    const candidate = { ...p };
    if (typeof patch2.enabled === "boolean") candidate.enabled = patch2.enabled;
    if (p.kind === "number") {
      candidate.low = clamp5(patch2.low ?? p.low ?? p.min, p.min, p.max);
      candidate.high = clamp5(patch2.high ?? p.high ?? p.max, candidate.low, p.max);
      try {
        const [lo, hi] = geneBounds(candidate);
        const other = this.state.parameters.find((q) => q.path === p.path && q.id !== p.id && ["min", "max"].includes(q.component ?? ""));
        if (other) {
          const value = this.baseline()[p.path];
          if (p.component === "min" && lo > (other.enabled ? geneBounds(other)[1] : value.max)) throw new Error("Minimum range must allow a value below the maximum endpoint.");
          if (p.component === "max" && hi < (other.enabled ? geneBounds(other)[0] : value.min)) throw new Error("Maximum range must allow a value above the minimum endpoint.");
        }
      } catch (e) {
        this.state.error = e instanceof Error ? e.message : String(e);
        this.notify(false);
        return;
      }
    }
    Object.assign(p, candidate);
    this.state.error = null;
    if (p.trouble && p.enabled) this.state.omitTrouble = false;
    this.notify();
  }
  setOmitTrouble(on) {
    if (!this.ready()) return;
    this.state.omitTrouble = on;
    for (const p of this.state.parameters) if (p.trouble) p.enabled = !on;
    this.notify();
  }
  setAllParameters(enabled, group) {
    if (!this.ready()) return;
    for (const p of this.state.parameters) if (group === void 0 || p.group === group) p.enabled = enabled && !(this.state.omitTrouble && p.trouble);
    this.notify();
  }
  setMorph(patch2) {
    if (!this.ready()) return;
    const s = this.state;
    Object.assign(s.morph, patch2);
    for (const key of ["ax", "ay", "bx", "by", "blend"]) s.morph[key] = Number.isFinite(s.morph[key]) ? clamp5(s.morph[key]) : 0.5;
    s.morph.corner = clamp5(Math.round(s.morph.corner), 0, 7);
    this.preview(morphDNA(this.allChildren(), s.morph, this.baseline(), s.parameters));
    this.notify();
  }
  beginAssign() {
    if (!this.ready()) return;
    this.state.assigning = true;
    this.state.view = "evolution";
    this.state.treeView = false;
    this.notify(false);
  }
  slots() {
    const s = this.state;
    if (!s) return [];
    const slot = (label, value, min, max, step = 1, display = String(value)) => ({ label, value, min, max, step, display });
    if (s.view === "morph") return [...["ax", "ay", "bx", "by", "blend"].map((k, i) => slot(["A \xB7 X", "A \xB7 Y", "B \xB7 X", "B \xB7 Y", "Blend"][i], s.morph[k], 0, 1, 0.01)), slot("Corner", s.morph.corner, 0, 7, 1, String(s.morph.corner + 1))];
    if (s.view === "parameters") {
      const p = s.parameters[this.parameterIndex];
      return [slot("Parameter", this.parameterIndex, 0, Math.max(0, s.parameters.length - 1), 1, p?.label ?? "None"), slot("Included", p?.enabled ? 1 : 0, 0, 1), slot("Minimum", p?.low ?? 0, p?.min ?? 0, p?.max ?? 1, p?.step ?? 0.01), slot("Maximum", p?.high ?? 1, p?.min ?? 0, p?.max ?? 1, p?.step ?? 0.01), slot("Omit enable/bypass", s.omitTrouble ? 1 : 0, 0, 1)];
    }
    return [slot("Generation", s.generation, 0, this.currentTree().generations.length - 1, 1, String(s.generation + 1)), slot("Rating", this.active()?.rating ?? 3, 1, 5), slot("Mutation", s.settings.mutation, 0, 1, 0.01), slot("Mutation mode", s.settings.mutationMode === "random" ? 0 : 1, 0, 1, 1, s.settings.mutationMode), slot("Breed window", s.settings.breedWindow, 0, this.currentTree().generations.length, 1, s.settings.breedWindow ? `Last ${s.settings.breedWindow}` : "All"), slot("Seed mode", s.settings.seedMode === "current" ? 0 : 1, 0, 1, 1, s.settings.seedMode), slot("Spread", s.settings.spread, 0, 1, 0.01), slot("Seed count", s.settings.seedCount, 1, 32)];
  }
  turnSlot(index, value) {
    if (!this.ready()) return;
    const s = this.state, slot = this.slots()[index];
    if (!slot || !Number.isFinite(value)) return;
    value = clamp5(value, slot.min, slot.max);
    if (slot.step === 1) value = Math.round(value);
    if (s.view === "morph") {
      const key = ["ax", "ay", "bx", "by", "blend", "corner"][index];
      if (key) this.setMorph({ [key]: value });
      return;
    }
    if (s.view === "parameters") {
      if (index === 4) {
        this.setOmitTrouble(!!value);
        return;
      }
      const p = s.parameters[this.parameterIndex];
      if (!index) {
        this.parameterIndex = Math.round(value);
        this.notify(false);
      } else if (p) this.setParameter(p.id, index === 1 ? { enabled: !!value } : index === 2 ? { low: value } : { high: value });
      return;
    }
    if (index === 0) this.setGeneration(value);
    else if (index === 1) this.rate(value);
    else this.setSettings(index === 2 ? { mutation: value } : index === 3 ? { mutationMode: value ? "copy-error" : "random" } : index === 4 ? { breedWindow: value } : index === 5 ? { seedMode: value ? "random" : "current" } : index === 6 ? { spread: value } : { seedCount: value });
  }
};
var PresetExplorationStore = new ExplorationStore();

// src/preset-flower.ts
var FLOWER_PALETTES = [{
  id: "kit",
  name: "Kit",
  background: MOVE_PALETTE.white,
  colors: [
    MOVE_PALETTE.red,
    MOVE_PALETTE.orange,
    MOVE_PALETTE.yellow,
    MOVE_PALETTE.lime,
    MOVE_PALETTE.emerald,
    MOVE_PALETTE.blue,
    MOVE_PALETTE.indigo,
    MOVE_PALETTE.pink
  ]
}];
var FLOWER_PATTERNS = [
  { id: "wild", name: "Wildflower", description: "Uneven petals, lobed clusters and scattered buds." },
  { id: "spiral", name: "Spiral", description: "Overlapping petals following a golden-angle spiral." },
  { id: "pompon", name: "Pompon", description: "Dense rings of rounded, bubble-like petals." },
  { id: "ribbon", name: "Ribbons", description: "Long, curling petals swept around the center." },
  { id: "coral", name: "Coral", description: "Branching stems with swollen buds and forked growth." }
];
var DEFAULT_FLOWER_SETTINGS = {
  petals: 16,
  layers: 2,
  petalLength: 60,
  petalWidth: 20,
  roundness: 0.5,
  irregularity: 1,
  twist: -90,
  spread: 0,
  chaos: 1,
  centerSize: 2.75,
  palette: "kit",
  pattern: "wild"
};
var bounded = (n, min, max, fallback) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
function randomFor(seed) {
  let state4 = 2166136261;
  for (let i = 0; i < seed.length; i++) state4 = Math.imul(state4 ^ seed.charCodeAt(i), 16777619);
  return () => {
    state4 += 1831565813;
    let n = Math.imul(state4 ^ state4 >>> 15, 1 | state4);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
var fixed = (n) => n.toFixed(2);
function outline(points, smooth) {
  let path = `M${points[0].map(fixed).join(",")}`;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length], b = points[i];
    const c = points[(i + 1) % points.length], d = points[(i + 2) % points.length];
    path += `C${fixed(b[0] + (c[0] - a[0]) * smooth)},${fixed(b[1] + (c[1] - a[1]) * smooth)} ${fixed(c[0] - (d[0] - b[0]) * smooth)},${fixed(c[1] - (d[1] - b[1]) * smooth)} ${c.map(fixed).join(",")}`;
  }
  return path + "Z";
}
function flowerSvg(seed, input, options = {}) {
  const defaults = DEFAULT_FLOWER_SETTINGS;
  const petals = Math.round(bounded(input.petals, 3, 16, defaults.petals));
  const layers = Math.round(bounded(input.layers, 1, 5, defaults.layers));
  const length = bounded(input.petalLength, 60, 180, defaults.petalLength);
  const width = bounded(input.petalWidth, 20, 100, defaults.petalWidth);
  const roundness = bounded(input.roundness, 0, 1, defaults.roundness);
  const irregularity = bounded(input.irregularity, 0, 1, defaults.irregularity);
  const twist = bounded(input.twist, -90, 90, defaults.twist);
  const spread = bounded(input.spread, 0, 1, defaults.spread);
  const sourcePalette = FLOWER_PALETTES.find((p) => p.id === input.palette) ?? FLOWER_PALETTES[0];
  const colorRandom = randomFor(`${seed}:colors`);
  const colors = [...sourcePalette.colors];
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(colorRandom() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  const palette = { ...sourcePalette, colors: colors.slice(0, 4) };
  const pattern = FLOWER_PATTERNS.some((p) => p.id === input.pattern) ? input.pattern : defaults.pattern;
  const centerSize = bounded(input.centerSize, 0.5, 3.5, defaults.centerSize);
  const chaos = bounded(input.chaos, 0, 1, defaults.chaos);
  const random = randomFor(seed);
  const signed = () => random() * 2 - 1;
  const phase = random() * Math.PI * 2;
  const colorOffset = Math.floor(random() * palette.colors.length);
  const habit = { lean: signed(), stretch: signed(), curl: signed(), lobes: 2 + Math.floor(random() * 4), clustering: random() };
  const anchors = Array.from({ length: 3 }, () => [signed() * 85 * chaos, signed() * 85 * chaos]);
  const shapes = [];
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  function include(p) {
    bounds.minX = Math.min(bounds.minX, p[0]);
    bounds.maxX = Math.max(bounds.maxX, p[0]);
    bounds.minY = Math.min(bounds.minY, p[1]);
    bounds.maxY = Math.max(bounds.maxY, p[1]);
  }
  function addBlob(points, color) {
    const smooth = 0.11 + roundness * 0.08;
    for (let i = 0; i < points.length; i++) {
      const a = points[(i + points.length - 1) % points.length], b = points[i];
      const c = points[(i + 1) % points.length], d = points[(i + 2) % points.length];
      include(b);
      include([b[0] + (c[0] - a[0]) * smooth, b[1] + (c[1] - a[1]) * smooth]);
      include([c[0] - (d[0] - b[0]) * smooth, c[1] - (d[1] - b[1]) * smooth]);
    }
    shapes.push(`<path d="${outline(points, smooth)}" fill="${color}"/>`);
  }
  if (pattern === "coral") {
    const branch = (origin, angle, reach, girth, depth, key) => {
      const r = randomFor(`${seed}:branch:${key}`);
      const bend = (r() - 0.5) * reach * (0.3 + chaos);
      const tip = [
        origin[0] + Math.cos(angle) * reach - Math.sin(angle) * bend,
        origin[1] + Math.sin(angle) * reach + Math.cos(angle) * bend
      ];
      const points = Array.from({ length: 20 }, (_, i) => {
        const t = i * Math.PI / 10;
        const x = reach * (0.5 + 0.55 * Math.cos(t));
        const y = Math.sin(t) * girth * (1 + 0.2 * Math.cos(t * 3)) + bend * (x / reach);
        return [
          origin[0] + Math.cos(angle) * x - Math.sin(angle) * y,
          origin[1] + Math.sin(angle) * x + Math.cos(angle) * y
        ];
      });
      addBlob(points, palette.colors[(colorOffset + depth) % 4]);
      if (depth > 0) {
        for (let fork = 0; fork < 2; fork++) branch(
          tip,
          angle + (fork ? 1 : -1) * (0.35 + r() * 0.6) + twist * 6e-3,
          reach * (0.52 + r() * 0.17),
          girth * 0.66,
          depth - 1,
          `${key}.${fork}`
        );
      } else {
        const size = girth * (1.6 + roundness);
        addBlob(Array.from({ length: 16 }, (_, i) => {
          const t = i * Math.PI / 8, radius = size * (1 + Math.sin(t * 3) * irregularity * 0.25);
          return [tip[0] + Math.cos(t) * radius, tip[1] + Math.sin(t) * radius];
        }), palette.colors[(colorOffset + 2) % 4]);
      }
    };
    for (let arm = 0; arm < petals; arm++) branch(
      [0, 0],
      phase + arm * Math.PI * 2 / petals,
      length * (0.4 + spread * 0.3),
      width * 0.14,
      Math.min(3, layers - 1),
      String(arm)
    );
  }
  for (let layer = 0; pattern !== "coral" && layer < layers; layer++) {
    const rng = randomFor(`${seed}:layer:${layer}`);
    const count = Math.max(3, Math.round(petals * (1 + (rng() - 0.5) * chaos)));
    const scale = Math.pow(0.72 + habit.stretch * chaos * 0.1, layer);
    const anchor = anchors[Math.floor(rng() * anchors.length)];
    for (let petal = 0; petal < count; petal++) {
      const r = randomFor(`${seed}:layer:${layer}:petal:${petal}`);
      const jitter = () => r() * 2 - 1;
      let angle = phase + layer * twist * Math.PI / 180 + petal * Math.PI * 2 / count + jitter() * (0.12 * irregularity + chaos * 0.85);
      let reach = length * scale * Math.exp(jitter() * (0.16 * irregularity + chaos * 0.75));
      let breadth = width * scale * Math.exp(jitter() * (0.22 * irregularity + chaos * 0.8));
      let offset = (12 + spread * 42) * scale + chaos * jitter() * 40;
      let bend = jitter() * reach * chaos * 0.6;
      const lobePhase = r() * Math.PI * 2;
      const lobeCount = habit.lobes + Math.floor(r() * 3);
      const lobeAmount = chaos * (0.12 + r() * 0.22) + irregularity * 0.08;
      const skew = jitter() * chaos * 0.6;
      let origin = anchor;
      if (pattern === "spiral") {
        const index = layer * petals + petal;
        const theta = phase + index * Math.PI * (3 - Math.sqrt(5)) + twist * 6e-3;
        const radius = (18 + Math.sqrt(index + 1) * (17 + spread * 15)) * (1 + chaos * jitter() * 0.12);
        origin = [Math.cos(theta) * radius, Math.sin(theta) * radius];
        angle = theta + Math.PI / 2;
        reach *= 0.48;
        breadth *= 0.75;
        offset = 0;
        bend *= 0.3;
      } else if (pattern === "pompon") {
        const radius = (length * 0.75 + spread * 35) * scale;
        origin = [Math.cos(angle) * radius, Math.sin(angle) * radius];
        reach = width * scale * (0.6 + roundness * 0.3);
        breadth = reach * 1.1;
        offset = -reach * 0.4;
        bend *= 0.1;
      } else if (pattern === "ribbon") {
        origin = [anchor[0] * 0.25, anchor[1] * 0.25];
        reach *= 1.35;
        breadth *= 0.35;
        bend = reach * (0.4 + twist / 180 + habit.curl * chaos * 0.3);
        offset *= 0.4;
      }
      const points = Array.from({ length: 24 }, (_, i) => {
        const t = i * Math.PI * 2 / 24;
        const wave = 1 + Math.sin(t * lobeCount + lobePhase) * lobeAmount + Math.cos(t * 3 - lobePhase) * irregularity * 0.07;
        const x = offset + reach * 0.4 + Math.cos(t) * reach * 0.62 * wave;
        const y = Math.sin(t) * breadth * (0.5 + roundness * 0.2) * wave * (1 + skew * Math.cos(t)) + bend * Math.pow((Math.cos(t) + 1) / 2, 2);
        return [
          origin[0] + x * Math.cos(angle) - y * Math.sin(angle) + habit.lean * chaos * y * 0.45,
          origin[1] + x * Math.sin(angle) + y * Math.cos(angle)
        ];
      });
      const color = palette.colors[(colorOffset + layer + Math.floor(r() * (1 + chaos * 3))) % palette.colors.length];
      addBlob(points, color);
      if (r() < chaos * 0.48 && pattern === "wild") {
        const theta = angle + habit.curl * 0.7;
        const distance = offset + reach * (0.7 + r() * 0.6);
        const cx2 = anchor[0] + Math.cos(theta) * distance, cy2 = anchor[1] + Math.sin(theta) * distance;
        const size = (5 + r() * 19) * scale;
        addBlob(Array.from({ length: 12 }, (_, i) => {
          const t = i * Math.PI / 6, radius = size * (1 + 0.24 * Math.sin(t * 3 + lobePhase));
          return [cx2 + Math.cos(t) * radius, cy2 + Math.sin(t) * radius * (1 + habit.stretch * 0.4)];
        }), palette.colors[(colorOffset + layer + 2) % palette.colors.length]);
      }
    }
  }
  const centers = 1 + Math.floor(chaos * habit.clustering * 4);
  for (let k = 0; k < centers; k++) {
    const top = k === centers - 1;
    const radius = (14 + width * 0.16) * (1 + signed() * chaos * 0.3) * (top ? centerSize : 1);
    const drift = top ? 18 : 55;
    const cx2 = signed() * chaos * drift, cy2 = signed() * chaos * drift;
    const points = Array.from({ length: 18 }, (_, i) => {
      const t = i * Math.PI / 9;
      const r = radius * (1 + Math.sin(t * habit.lobes + phase) * chaos * 0.28);
      return [cx2 + Math.cos(t) * r, cy2 + Math.sin(t) * r];
    });
    addBlob(points, palette.colors[(colorOffset + layers + k + 1) % palette.colors.length]);
  }
  const fit = 492 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1);
  const cx = (bounds.minX + bounds.maxX) / 2, cy = (bounds.minY + bounds.maxY) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${options.background === false ? "" : `<rect width="600" height="600" fill="${palette.background}"/>`}<g transform="translate(300 300) scale(${fixed(fit)}) translate(${fixed(-cx)} ${fixed(-cy)})">${shapes.join("")}</g></svg>`;
}
function presetFlowerSeed(values) {
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value !== null && typeof value === "object") return Object.fromEntries(
      Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)])
    );
    return value;
  };
  return JSON.stringify(canonical(values));
}
function presetFlowerSvg(values) {
  return flowerSvg(presetFlowerSeed(values), DEFAULT_FLOWER_SETTINGS);
}

// src/components/PresetExploration.tsx
var import_TweakStore4 = require("tweakers/store");
var import_jsx_runtime5 = require("react/jsx-runtime");
var SHELL_MOTION = { duration: 0.15, ease: [0.2, 0, 0, 1] };
var clamp6 = (value) => Math.max(0, Math.min(1, value));
var useBrowserLayoutEffect = typeof window === "undefined" ? import_react4.useEffect : import_react4.useLayoutEffect;
function PresetArtwork({ values }) {
  const seed = presetFlowerSeed(values);
  const src = (0, import_react4.useMemo)(() => `data:image/svg+xml,${encodeURIComponent(flowerSvg(seed, DEFAULT_FLOWER_SETTINGS, { background: false }))}`, [seed]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { className: "tweakers-exploration-artwork", src, alt: "", "aria-hidden": "true", draggable: false });
}
function PresetExploration() {
  (0, import_react4.useSyncExternalStore)(PresetExplorationStore.subscribe, PresetExplorationStore.getVersion, () => 0);
  const state4 = PresetExplorationStore.getState();
  const reducedMotion3 = (0, import_react5.useReducedMotion)();
  const shell = (0, import_react4.useRef)(null);
  const [availableHeight, setAvailableHeight] = (0, import_react4.useState)(null);
  useBrowserLayoutEffect(() => {
    const anchor = shell.current?.closest(".tweakers-move");
    if (!state4 || !anchor) return;
    const measure = () => setAvailableHeight(Math.max(160, anchor.getBoundingClientRect().top - 20));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [state4?.panelId]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_react5.AnimatePresence, { children: state4 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_react5.motion.section,
    {
      className: "tweakers-exploration",
      style: availableHeight == null ? void 0 : { "--explore-available-height": `${availableHeight}px` },
      "aria-label": "Preset exploration",
      initial: { opacity: 0, y: reducedMotion3 ? 0 : 12, x: "-50%" },
      animate: { opacity: 1, y: 0, x: "-50%" },
      exit: { opacity: 0, y: reducedMotion3 ? 0 : 6, x: "-50%" },
      transition: reducedMotion3 ? { duration: 0 } : SHELL_MOTION,
      onKeyDown: (event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          PresetExplorationStore.close();
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ExplorationContent, { state: state4, anchorRef: shell })
    },
    state4.panelId
  ) });
}
function PresetExplorationSlots() {
  (0, import_react4.useSyncExternalStore)(PresetExplorationStore.subscribe, PresetExplorationStore.getVersion, () => 0);
  const state4 = PresetExplorationStore.getState();
  if (!state4) return null;
  const slots = PresetExplorationStore.slots();
  const unsupported = !!import_TweakStore4.TweakStore.getPresetProvider(state4.panelId) && !import_TweakStore4.TweakStore.getPresetProvider(state4.panelId)?.exploration;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-move-grid tweakers-exploration-dock", role: "group", "aria-label": "Eight Move encoder properties", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-move-dials", children: Array.from({ length: 8 }, (_, index) => {
    const slot = slots[index];
    if (!slot) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-move-dial", "data-empty": true, "aria-hidden": "true" }, index);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "label",
      {
        className: "tweakers-move-dial tweakers-exploration-dock-slot",
        title: `${slot.label}: ${slot.display}`,
        "data-disabled": state4.busy || unsupported || slot.min === slot.max || void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(MoveSlotDefaultBody, { label: slot.label, value: slot.display, pct: slot.max > slot.min ? (slot.value - slot.min) / (slot.max - slot.min) * 100 : 0, originPct: null }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "range",
              "aria-label": slot.label,
              "aria-valuetext": slot.display,
              min: slot.min,
              max: slot.max,
              step: slot.step,
              value: slot.value,
              disabled: state4.busy || unsupported || slot.min === slot.max,
              onChange: (event) => PresetExplorationStore.turnSlot(index, Number(event.target.value))
            }
          )
        ]
      },
      index
    );
  }) }) });
}
function ExplorationContent({ state: state4, anchorRef }) {
  const [name, setName] = (0, import_react4.useState)("");
  const [seedId, setSeedId] = (0, import_react4.useState)("");
  (0, import_react4.useEffect)(() => {
    if (state4.saving) setName("");
  }, [state4.saving]);
  const [parameterGroup, setParameterGroup] = (0, import_react4.useState)("*");
  const provider = import_TweakStore4.TweakStore.getPresetProvider(state4.panelId);
  const unsupported = !!provider && !provider.exploration;
  const blocked = state4.busy || unsupported;
  const tree2 = state4.trees.find((item) => item.id === state4.treeId);
  const generation = tree2?.generations[state4.generation];
  const allChildren = tree2?.generations.flatMap((gen) => gen.children) ?? [];
  const active = allChildren.find((child2) => child2.id === state4.activeId);
  const presets = PresetExplorationStore.getPresetItems();
  const enabledCount = state4.parameters.filter((parameter) => parameter.enabled).length;
  const parents = (state4.settings.breedWindow ? tree2?.generations.slice(-state4.settings.breedWindow) : tree2?.generations)?.flatMap((gen) => gen.children).filter((child2) => child2.marked) ?? [];
  const childLabel = (id) => {
    for (const candidate of state4.trees) {
      for (let gen = 0; gen < candidate.generations.length; gen++) {
        const index = candidate.generations[gen].children.findIndex((child2) => child2.id === id);
        if (index >= 0) return `${candidate.id === state4.treeId ? "" : `${candidate.name} \xB7 `}G${gen + 1} / ${String(index + 1).padStart(2, "0")}`;
      }
    }
    return "Unknown child";
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { ref: anchorRef, className: "tweakers-exploration-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: "Preset exploration" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tweakers-exploration-caption", children: state4.persistent ? "Family tree" : "Session tree" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("nav", { className: "tweakers-exploration-nav", "aria-label": "Exploration views", children: ["evolution", "morph", "parameters"].map((view) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "button",
        {
          type: "button",
          disabled: blocked,
          "aria-pressed": state4.view === view,
          onClick: () => PresetExplorationStore.setView(view),
          children: view === "evolution" ? "Evolve" : view === "morph" ? "Morph" : "Parameters"
        },
        view
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.close(), title: state4.saving ? "Cancel naming and return to exploration" : "Exit and restore the original sound", children: "Back \u21A9" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("fieldset", { className: "tweakers-exploration-workspace", disabled: blocked, children: [
        state4.view === "evolution" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-toolbar", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-inline", children: [
              "Tree ",
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { "aria-label": "Family tree", value: state4.treeId, onChange: (event) => PresetExplorationStore.selectTree(event.target.value), children: state4.trees.map((item) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: item.id, children: item.name }, item.id)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-generation", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", "aria-label": "Previous generation", disabled: state4.generation === 0, onClick: () => PresetExplorationStore.setGeneration(state4.generation - 1), children: "\u2190" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
                "Generation ",
                state4.generation + 1,
                " / ",
                tree2?.generations.length ?? 0
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", "aria-label": "Next generation", disabled: state4.generation >= (tree2?.generations.length ?? 0) - 1, onClick: () => PresetExplorationStore.setGeneration(state4.generation + 1), children: "\u2192" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", "aria-pressed": state4.treeView, onClick: () => PresetExplorationStore.toggleTree(), children: "Family tree" })
          ] }),
          state4.treeView && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-exploration-tree", "aria-label": "Generation history", children: tree2?.generations.map((gen, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
            "button",
            {
              type: "button",
              "aria-pressed": index === state4.generation,
              onClick: () => PresetExplorationStore.setGeneration(index),
              children: [
                "G",
                index + 1,
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
                  gen.children.length,
                  " children \xB7 ",
                  gen.children.filter((child2) => child2.marked).length,
                  " parents"
                ] })
              ]
            },
            gen.id
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-exploration-pads", role: "group", "aria-label": "Generation presets, four rows of eight pads", children: Array.from({ length: 32 }, (_, index) => {
            const child2 = generation?.children[index];
            return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
              "button",
              {
                type: "button",
                className: "tweakers-exploration-pad",
                disabled: !child2 || state4.busy,
                "aria-pressed": !!child2 && state4.activeId === child2.id,
                "data-parent": child2?.marked || void 0,
                "aria-label": child2 ? `Preset ${index + 1}, rating ${child2.rating}${child2.marked ? ", marked parent" : ""}` : `Empty pad ${index + 1}`,
                onClick: () => child2 && PresetExplorationStore.select(child2.id),
                onKeyDown: (event) => {
                  const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[event.key];
                  if (offset === void 0) return;
                  event.preventDefault();
                  const next = event.currentTarget.parentElement?.children[index + offset];
                  if (next instanceof HTMLButtonElement && !next.disabled) next.focus();
                },
                children: [
                  child2 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PresetArtwork, { values: child2.values }),
                  child2?.marked && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tweakers-exploration-parent", "aria-hidden": "true", children: "\u25C6" })
                ]
              },
              child2?.id ?? index
            );
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-toolbar tweakers-exploration-generation-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tweakers-exploration-caption", id: "exploration-generation-hint", children: enabledCount === 0 ? "Enable parameters first." : parents.length < 2 ? "Mark two parents to breed." : `${parents.length} parents \xB7 \u2605 biases breeding` }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: blocked || enabledCount === 0, title: "Start a new tree with 32 random seeds; keep previous trees", onClick: () => void PresetExplorationStore.randomizeSeeds(), children: "Randomize seeds" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "button",
              {
                type: "button",
                className: "tweakers-exploration-primary",
                disabled: state4.busy || parents.length < 2 || enabledCount === 0,
                "aria-describedby": "exploration-generation-hint",
                onClick: () => PresetExplorationStore.generate(),
                children: "Generate 32 children"
              }
            )
          ] })
        ] }),
        state4.view === "morph" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-morph", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "tweakers-exploration-hint", children: "Choose a corner, then assign a child. Drag either surface to blend its four presets." }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-exploration-morph-pair", children: ["A", "B"].map((label, quadrant) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              XYSurface,
              {
                label,
                x: quadrant === 0 ? state4.morph.ax : state4.morph.bx,
                y: quadrant === 0 ? state4.morph.ay : state4.morph.by,
                disabled: !state4.morph.corners.slice(quadrant * 4, quadrant * 4 + 4).some(Boolean),
                onChange: (x, y) => PresetExplorationStore.setMorph(quadrant === 0 ? { ax: x, ay: y } : { bx: x, by: y })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "tweakers-exploration-corners", role: "group", "aria-label": `Quadrant ${label} presets`, children: state4.morph.corners.slice(quadrant * 4, quadrant * 4 + 4).map((id, corner) => {
              const index = quadrant * 4 + corner;
              const assigned = allChildren.find((child2) => child2.id === id);
              return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
                "button",
                {
                  type: "button",
                  "aria-pressed": state4.morph.corner === index,
                  onClick: () => PresetExplorationStore.setMorph({ corner: index }),
                  title: id ? childLabel(id) : "Unassigned corner",
                  children: [
                    assigned && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PresetArtwork, { values: assigned.values }),
                    label,
                    corner + 1,
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: id ? childLabel(id) : "Empty" })
                  ]
                },
                index
              );
            }) })
          ] }, label)) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-blend", children: [
            "A ",
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                type: "range",
                "aria-label": "Blend between quadrants A and B",
                min: 0,
                max: 1,
                step: 0.01,
                value: state4.morph.blend,
                disabled: !state4.morph.corners.some(Boolean),
                onChange: (event) => PresetExplorationStore.setMorph({ blend: Number(event.target.value) })
              }
            ),
            " B",
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("output", { children: [
              Math.round(state4.morph.blend * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.beginAssign(), children: state4.assigning ? "Choose a child in Evolve" : "Assign child to selected corner" })
        ] }),
        state4.view === "parameters" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-parameters", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-toolbar", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-inline", children: [
              "Group ",
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { value: parameterGroup, onChange: (event) => setParameterGroup(event.target.value), children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "*", children: "All groups" }),
                [...new Set(state4.parameters.map((parameter) => parameter.group ?? ""))].map((group) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: group, children: group || "Parameters" }, group))
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "checkbox", checked: state4.omitTrouble, onChange: (event) => PresetExplorationStore.setOmitTrouble(event.target.checked) }),
              "Omit enable / bypass"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
              enabledCount,
              " / ",
              state4.parameters.length,
              " parameters included"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.setAllParameters(true), children: "Select all" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.setAllParameters(false), children: "Deselect all" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "tweakers-exploration-hint", children: "Included parameters evolve and morph within their chosen range. Other values stay unchanged." }),
          [...new Set(state4.parameters.map((parameter) => parameter.group ?? ""))].filter((group) => parameterGroup === "*" || parameterGroup === group).map((group) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("fieldset", { className: "tweakers-exploration-parameter-group", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("legend", { children: group || "Parameters" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-group-actions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.setAllParameters(true, group), children: "Select group" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => PresetExplorationStore.setAllParameters(false, group), children: "Deselect group" })
            ] }),
            state4.parameters.filter((parameter) => (parameter.group ?? "") === group).map((parameter) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-parameter", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { title: parameter.path, children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "checkbox", checked: parameter.enabled, onChange: (event) => PresetExplorationStore.setParameter(parameter.id, { enabled: event.target.checked }) }),
                parameter.label
              ] }),
              parameter.kind === "number" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-range", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                  "Min ",
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                    "input",
                    {
                      type: "number",
                      "aria-label": `${parameter.label} minimum`,
                      value: parameter.low ?? parameter.min ?? 0,
                      min: parameter.min,
                      max: parameter.high ?? parameter.max,
                      step: parameter.step ?? "any",
                      disabled: !parameter.enabled,
                      onChange: (event) => {
                        if (Number.isFinite(event.target.valueAsNumber)) PresetExplorationStore.setParameter(parameter.id, { low: event.target.valueAsNumber });
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                  "Max ",
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                    "input",
                    {
                      type: "number",
                      "aria-label": `${parameter.label} maximum`,
                      value: parameter.high ?? parameter.max ?? 1,
                      min: parameter.low ?? parameter.min,
                      max: parameter.max,
                      step: parameter.step ?? "any",
                      disabled: !parameter.enabled,
                      onChange: (event) => {
                        if (Number.isFinite(event.target.valueAsNumber)) PresetExplorationStore.setParameter(parameter.id, { high: event.target.valueAsNumber });
                      }
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "tweakers-exploration-caption", title: parameter.options?.join(", "), children: [
                parameter.options?.length ?? 0,
                " choices"
              ] })
            ] }, parameter.id))
          ] }, group))
        ] }),
        state4.view !== "parameters" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "tweakers-exploration-advanced", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("summary", { children: [
            active ? childLabel(active.id) : "Child actions",
            " \xB7 mark, rate, save & seed settings"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-active", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
              active ? childLabel(active.id) : "Select a child",
              active?.parents.length ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("small", { children: [
                "From ",
                active.parents.map(childLabel).join(" + ")
              ] }) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-actions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: !active, "aria-pressed": active?.marked ?? false, onClick: () => PresetExplorationStore.toggleParent(), children: active?.marked ? "\u25C6 Parent marked" : "Mark Parent" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-inline", children: [
                "Rating ",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { "aria-label": "Active child rating", disabled: !active, value: active?.rating ?? 3, onChange: (event) => PresetExplorationStore.rate(Number(event.target.value)), children: [1, 2, 3, 4, 5].map((rating) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: rating, children: rating }, rating)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: !active || state4.busy, onClick: () => PresetExplorationStore.remix(), children: "Remix" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: !active || state4.busy, onClick: () => PresetExplorationStore.overwrite(), children: "Overwrite DNA" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: blocked || !active && !(state4.view === "morph" && state4.morph.corners.some(Boolean)), onClick: () => PresetExplorationStore.beginSave(), children: "Save Preset" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "tweakers-exploration-seeds", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("summary", { children: "Seeds & breeding" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-settings", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                "Seed source",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { value: state4.settings.seedMode, onChange: (event) => PresetExplorationStore.setSettings({ seedMode: event.target.value }), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "current", children: "Current sound" }),
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "random", children: "Randomized" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                "Seed count",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "number", min: 1, max: 32, value: state4.settings.seedCount, onChange: (event) => PresetExplorationStore.setSettings({ seedCount: Number(event.target.value) }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                "Spread",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "range", min: 0, max: 1, step: 0.01, value: state4.settings.spread, onChange: (event) => PresetExplorationStore.setSettings({ spread: Number(event.target.value) }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                "Mutation mode",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { value: state4.settings.mutationMode, onChange: (event) => PresetExplorationStore.setSettings({ mutationMode: event.target.value }), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "random", children: "Random replacement" }),
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "copy-error", children: "Copy error" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
                "Breeding window (0 = all)",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "number", min: 0, max: tree2?.generations.length ?? 1, value: state4.settings.breedWindow, onChange: (event) => PresetExplorationStore.setSettings({ breedWindow: Number(event.target.value) }) })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-actions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: state4.busy || enabledCount === 0 || (tree2?.generations[0].children.length ?? 0) >= 32, onClick: () => PresetExplorationStore.addSeeds(), children: "Add Seeds" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: !allChildren.some((child2) => child2.marked) || state4.busy, onClick: () => PresetExplorationStore.newTree(), children: "New Tree from Parents" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "tweakers-exploration-inline", children: [
                "Preset seed ",
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { value: seedId, onChange: (event) => setSeedId(event.target.value), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: "Choose preset\u2026" }),
                  presets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: preset.id, children: preset.label }, preset.id))
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: !seedId || state4.busy, onClick: () => PresetExplorationStore.addPresetSeed(seedId), children: "Add Preset Seed" })
            ] })
          ] })
        ] })
      ] }),
      state4.saving && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("form", { className: "tweakers-exploration-save", onSubmit: (event) => {
        event.preventDefault();
        if (name.trim()) void PresetExplorationStore.save(name.trim());
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
          "Preset name",
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "text", value: name, maxLength: 120, placeholder: "Name this sound", onChange: (event) => setName(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "submit", disabled: !name.trim() || state4.busy, children: "Save" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: state4.busy, onClick: () => PresetExplorationStore.cancelSave(), children: "Cancel" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("footer", { className: "tweakers-exploration-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { role: "status", children: state4.message ?? (state4.assigning ? "Select a child to assign it to the morph corner." : "Back restores your original sound.") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: blocked, onClick: () => PresetExplorationStore.undo(), children: "Undo" }),
        state4.busy && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { role: "status", children: "Working\u2026" })
      ] }),
      state4.error && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "alert", className: "tweakers-exploration-error", children: state4.error })
    ] })
  ] });
}
function XYSurface({ label, x, y, disabled, onChange }) {
  const pointer = (0, import_react4.useRef)(null);
  const update = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange(clamp6((event.clientX - rect.left) / Math.max(1, rect.width)), clamp6((event.clientY - rect.top) / Math.max(1, rect.height)));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { role: "group", "aria-label": `Morph quadrant ${label}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "div",
      {
        className: "tweakers-exploration-xy",
        "data-disabled": disabled || void 0,
        "aria-hidden": "true",
        onPointerDown: (event) => {
          if (disabled || event.button !== 0) return;
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event);
        },
        onPointerMove: (event) => {
          if (pointer.current === event.pointerId) update(event);
        },
        onPointerUp: (event) => {
          if (pointer.current !== event.pointerId) return;
          pointer.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        },
        onPointerCancel: () => {
          pointer.current = null;
        },
        onLostPointerCapture: () => {
          pointer.current = null;
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tweakers-exploration-xy-label", children: label }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "tweakers-exploration-xy-point", style: { left: `${x * 100}%`, top: `${y * 100}%` } })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "tweakers-exploration-xy-controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
        "X ",
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "range", "aria-label": `Quadrant ${label} X`, min: 0, max: 1, step: 0.01, disabled, value: x, onChange: (event) => onChange(Number(event.target.value), y) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { children: [
        "Y ",
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "range", "aria-label": `Quadrant ${label} Y`, min: 0, max: 1, step: 0.01, disabled, value: y, onChange: (event) => onChange(x, Number(event.target.value)) })
      ] })
    ] })
  ] });
}

// src/components/MovePanel.tsx
var import_react16 = require("react");
var import_react_dom5 = require("react-dom");
var import_TweakStore16 = require("tweakers/store");
var import_ModulationStore2 = require("tweakers/modulation-store");

// src/curve-composer-core.ts
var CURVE_CYCLE = ["linear", "easeIn", "easeOut", "easeInOut", "spring"];
var easingPresets = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1]
};
var DRAG_THRESHOLD = 3;
var EDGE_HIT = 6;
var CURVE_MIN_WEIGHT_FRAC = 0.06;
var lerp = (a, b, t) => a + (b - a) * t;
var clamp013 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
var clampBipolar = (v) => v < -1 ? -1 : v > 1 ? 1 : v;
var SKEW_MAX = 0.45;
var BACK_MAX = 0.8;
var easingExtremes = {
  linear: [0, 0, 1, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.87, 0, 0.13, 1]
};
var lerp4 = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
  lerp(a[3], b[3], t)
];
function deriveEase(type, curvature, steepness = 0, overshoot = 0, anticipate = 0) {
  const key = type === "spring" ? "linear" : type;
  const base = easingPresets[key];
  const s = clampBipolar(steepness);
  const pts = s >= 0 ? lerp4(base, easingExtremes[key], s) : lerp4(easingPresets.linear, base, s + 1);
  let [x1, y1, x2, y2] = pts;
  const shift = clampBipolar(curvature) * SKEW_MAX;
  x1 = clamp013(x1 + shift);
  x2 = clamp013(x2 + shift);
  y2 += clamp013(overshoot) * BACK_MAX;
  y1 -= clamp013(anticipate) * BACK_MAX;
  return [x1, y1, x2, y2];
}
function bezierAxis(p1, p2, s) {
  const u = 1 - s;
  return 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s;
}
function bezierAxisDeriv(p1, p2, s) {
  const u = 1 - s;
  return 3 * u * u * p1 + 6 * u * s * (p2 - p1) + 3 * s * s * (1 - p2);
}
function bezierY(ease, x) {
  const tx = clamp013(x);
  let s = tx;
  for (let i = 0; i < 6; i++) {
    const xs = bezierAxis(ease[0], ease[2], s) - tx;
    if (Math.abs(xs) < 1e-5) break;
    const d = bezierAxisDeriv(ease[0], ease[2], s);
    if (Math.abs(d) < 1e-6) break;
    s = clamp013(s - xs / d);
  }
  return bezierAxis(ease[1], ease[3], s);
}
var SPRING_SAMPLES = 72;
function sampleSpringTargets(sample, steps) {
  const targets = [];
  let target = sample(0);
  if (!Number.isFinite(target)) target = 0;
  targets.push(target);
  for (let i = 1; i <= steps; i++) {
    const nextTarget = sample(i / steps);
    if (Number.isFinite(nextTarget)) target = nextTarget;
    targets.push(target);
  }
  return targets;
}
function integrateSpringTrace(targets, stiffness, damping, mass, initial, collect = true) {
  const points = collect ? [initial.position] : [];
  const steps = Math.max(1, targets.length - 1);
  const dt = 1 / steps;
  let { position, velocity } = initial;
  for (let i = 1; i <= steps; i++) {
    const target = targets[i] ?? targets[targets.length - 1] ?? 0;
    const acceleration = (-stiffness * (position - target) - damping * velocity) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
    if (collect) points.push(position);
  }
  return { points, state: { position, velocity } };
}
function springPoints(curvature, steepness = 0) {
  const visualDuration = 1;
  const bounce = clamp013((clampBipolar(curvature) + 1) / 2) * 0.6;
  const mass = 1;
  let stiffness = 2 * Math.PI / visualDuration;
  stiffness = stiffness * stiffness;
  stiffness *= Math.max(0.2, 1 + clampBipolar(steepness) * 0.9);
  const dampingRatio = 1 - bounce;
  const damping = 2 * dampingRatio * Math.sqrt(stiffness * mass);
  return integrateSpringTrace(new Array(SPRING_SAMPLES + 1).fill(1), stiffness, damping, mass, {
    position: 0,
    velocity: 0
  }).points;
}
function interp(points, t) {
  const x = clamp013(t) * (points.length - 1);
  const i = Math.floor(x);
  if (i >= points.length - 1) return points[points.length - 1];
  return lerp(points[i], points[i + 1], x - i);
}
var SPRINGIFY_DEFAULTS = { stiffness: 100, damping: 10, mass: 1 };
var SPRINGIFY_SAMPLES = 1200;
function finiteInRange(value, fallback, min, max) {
  return value !== void 0 && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function periodicSpringState(targets, stiffness, damping, mass) {
  const advance = (initial) => integrateSpringTrace(targets, stiffness, damping, mass, initial, false).state;
  const offset = advance({ position: 0, velocity: 0 });
  const fromPosition = advance({ position: 1, velocity: 0 });
  const fromVelocity = advance({ position: 0, velocity: 1 });
  const a00 = fromPosition.position - offset.position;
  const a10 = fromPosition.velocity - offset.velocity;
  const a01 = fromVelocity.position - offset.position;
  const a11 = fromVelocity.velocity - offset.velocity;
  const m00 = 1 - a00;
  const m01 = -a01;
  const m10 = -a10;
  const m11 = 1 - a11;
  const determinant = m00 * m11 - m01 * m10;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-9) return null;
  return {
    position: (offset.position * m11 - m01 * offset.velocity) / determinant,
    velocity: (m00 * offset.velocity - offset.position * m10) / determinant
  };
}
function normalizeFollowerTrace(points) {
  let min = points[0] ?? 0;
  let max = min;
  for (const value of points) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  if (min >= 0 && max <= 1) return points;
  const range = max - min;
  if (range <= Number.EPSILON) return points.map(() => 0);
  return points.map((value) => (value - min) / range);
}
function springify(sample, options = {}) {
  const stiffness = finiteInRange(options.stiffness, SPRINGIFY_DEFAULTS.stiffness, 1, 1e3);
  const damping = finiteInRange(options.damping, SPRINGIFY_DEFAULTS.damping, 0, 100);
  const mass = finiteInRange(options.mass, SPRINGIFY_DEFAULTS.mass, 0.1, 10);
  const targets = sampleSpringTargets(sample, SPRINGIFY_SAMPLES);
  const atRest = { position: targets[0], velocity: 0 };
  const initial = options.loop ? periodicSpringState(targets, stiffness, damping, mass) ?? atRest : atRest;
  const raw = integrateSpringTrace(
    targets,
    stiffness,
    damping,
    mass,
    initial
  ).points;
  const points = options.normalize ? normalizeFollowerTrace(raw) : raw;
  return (t) => interp(points, t);
}
function buildSampler(curve) {
  let base;
  if (curve.type === "spring") {
    const pts = springPoints(curve.curvature, curve.steepness);
    base = (t) => interp(pts, t);
  } else {
    const ease = deriveEase(curve.type, curve.curvature, curve.steepness, curve.overshoot, curve.anticipate);
    base = (t) => bezierY(ease, t);
  }
  const { flipX, flipY } = curve;
  if (!flipX && !flipY) return base;
  return (t) => {
    const v = base(flipX ? 1 - t : t);
    return flipY ? 1 - v : v;
  };
}
function totalWeight(segments) {
  let t = 0;
  for (const s of segments) t += Math.max(0, s.weight);
  return t || 1;
}
function timelineSlots(segments, gap = 0) {
  const n = segments.length;
  const g = n > 1 ? clamp013(gap) : 0;
  const total = totalWeight(segments);
  const content = 1 - g;
  const gapW = n > 1 ? g / (n - 1) : 0;
  const slots = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const sw = Math.max(0, segments[i].weight) / total * content;
    slots.push({ kind: "segment", index: i, a: acc, b: acc + sw });
    acc += sw;
    if (i < n - 1) {
      slots.push({ kind: "gap", index: i, a: acc, b: acc + gapW });
      acc += gapW;
    }
  }
  return slots;
}
function boundaries(segments, gap = 0) {
  if (gap > 0 && segments.length > 1) return [];
  const total = totalWeight(segments);
  const out = [];
  let acc = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    acc += segments[i].weight;
    out.push(acc / total);
  }
  return out;
}
function segmentSpan(segments, index, gap = 0) {
  if (gap > 0) {
    const slot = timelineSlots(segments, gap).find((s) => s.kind === "segment" && s.index === index);
    if (slot) return [slot.a, slot.b];
  }
  const total = totalWeight(segments);
  let acc = 0;
  for (let i = 0; i < index; i++) acc += segments[i].weight;
  return [acc / total, (acc + segments[index].weight) / total];
}
function segmentIndexAt(xNorm, segments, gap = 0) {
  if (gap > 0) {
    const x2 = clamp013(xNorm);
    const slots = timelineSlots(segments, gap);
    for (const s of slots) if (x2 < s.b) return s.index;
    return segments.length - 1;
  }
  const total = totalWeight(segments);
  const x = clamp013(xNorm) * total;
  let acc = 0;
  for (let i = 0; i < segments.length; i++) {
    acc += segments[i].weight;
    if (x <= acc) return i;
  }
  return segments.length - 1;
}
function boundaryAt(xNorm, segments, edgeHitNorm, gap = 0) {
  if (segments.length < 2) return null;
  const bs = boundaries(segments, gap);
  let best = null;
  let bestDist = edgeHitNorm;
  for (let i = 0; i < bs.length; i++) {
    const d = Math.abs(xNorm - bs[i]);
    if (d <= bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
function smootherstep(t) {
  const x = clamp013(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function cloneSegments(comp, segments) {
  return { ...comp, segments };
}
function splitSegment(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next.splice(index + 1, 0, { ...src });
  return cloneSegments(comp, next.map((s) => ({ ...s, weight: 1 })));
}
function removeSegment(comp, index) {
  if (comp.segments.length <= 1) return comp;
  return cloneSegments(comp, comp.segments.filter((_, i) => i !== index));
}
function cycleSegmentType(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const type = CURVE_CYCLE[(CURVE_CYCLE.indexOf(src.type) + 1) % CURVE_CYCLE.length];
  const next = comp.segments.slice();
  next[index] = { ...src, type, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 };
  return cloneSegments(comp, next);
}
function flipCurve(c) {
  const type = c.type === "easeIn" ? "easeOut" : c.type === "easeOut" ? "easeIn" : c.type;
  return { ...c, type, curvature: -c.curvature, overshoot: c.anticipate ?? 0, anticipate: c.overshoot ?? 0 };
}
function flipSegment(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = flipCurve(src);
  return cloneSegments(comp, next);
}
function flipDriver(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: flipCurve(comp.driver) };
}
function flipSegmentX(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, flipX: !src.flipX };
  return cloneSegments(comp, next);
}
function flipSegmentY(comp, index) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, flipY: !src.flipY };
  return cloneSegments(comp, next);
}
function flipDriverX(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, flipX: !comp.driver.flipX } };
}
function flipDriverY(comp) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, flipY: !comp.driver.flipY } };
}
function setSegmentCurvature(comp, index, curvature) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, curvature: clampBipolar(curvature) };
  return cloneSegments(comp, next);
}
function setSegmentSteepness(comp, index, steepness) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, steepness: clampBipolar(steepness) };
  return cloneSegments(comp, next);
}
function setSegmentOvershoot(comp, index, overshoot) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, overshoot: clamp013(overshoot) };
  return cloneSegments(comp, next);
}
function setSegmentAnticipate(comp, index, anticipate) {
  const src = comp.segments[index];
  if (!src) return comp;
  const next = comp.segments.slice();
  next[index] = { ...src, anticipate: clamp013(anticipate) };
  return cloneSegments(comp, next);
}
function redistributeWeight(comp, boundaryIndex, deltaFrac) {
  const segs = comp.segments;
  const i = boundaryIndex;
  if (i < 0 || i >= segs.length - 1) return comp;
  const total = totalWeight(segs);
  const span = segs[i].weight + segs[i + 1].weight;
  const minW = CURVE_MIN_WEIGHT_FRAC * total;
  let wi = segs[i].weight + deltaFrac * total;
  wi = Math.max(minW, Math.min(span - minW, wi));
  const next = segs.slice();
  next[i] = { ...segs[i], weight: wi };
  next[i + 1] = { ...segs[i + 1], weight: span - wi };
  return cloneSegments(comp, next);
}
function addDriver(comp) {
  if (comp.driver) return comp;
  return { ...comp, driver: { type: "easeInOut", curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 } };
}
function removeDriver(comp) {
  return { ...comp, driver: null };
}
function cycleDriverType(comp) {
  if (!comp.driver) return comp;
  const type = CURVE_CYCLE[(CURVE_CYCLE.indexOf(comp.driver.type) + 1) % CURVE_CYCLE.length];
  return { ...comp, driver: { ...comp.driver, type, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 } };
}
function setDriverCurvature(comp, curvature) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, curvature: clampBipolar(curvature) } };
}
function setDriverSteepness(comp, steepness) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, steepness: clampBipolar(steepness) } };
}
function setDriverOvershoot(comp, overshoot) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, overshoot: clamp013(overshoot) } };
}
function setDriverAnticipate(comp, anticipate) {
  if (!comp.driver) return comp;
  return { ...comp, driver: { ...comp.driver, anticipate: clamp013(anticipate) } };
}
var DRAG_ENERGY_GAIN = 0.6;
var DRAG_STEEP_GAIN = 0.6;
var COMPOSER_HEADER_H = 16;
function headerHit(xN, py, segments, layout) {
  if (py >= 0 && py < COMPOSER_HEADER_H) return segmentIndexAt(xN, segments, layout.gap ?? 0);
  if (layout.driverY != null && py >= layout.driverY && py < layout.driverY + COMPOSER_HEADER_H) return "driver";
  return null;
}
function toLocalCoords(clientX, clientY, rect, totalH) {
  const xN = clamp013((clientX - rect.left) / (rect.width || 1));
  const py = (clientY - rect.top) / (rect.height || 1) * totalH;
  return { xN, py };
}
function pointerTarget(xN, py, segments, layout, edgeHitNorm) {
  const gap = layout.gap ?? 0;
  if (layout.driverY != null && py >= layout.driverY) return { kind: "driver" };
  const b = boundaryAt(xN, segments, edgeHitNorm, gap);
  if (b != null) return { kind: "boundary", index: b };
  return { kind: "segment", index: segmentIndexAt(xN, segments, gap) };
}
function applySegmentBodyDrag(comp, index, baseCurvature, baseSteepness, dxFrac, dyFrac) {
  const next = setSegmentCurvature(comp, index, baseCurvature + dxFrac / DRAG_ENERGY_GAIN);
  return setSegmentSteepness(next, index, baseSteepness - dyFrac / DRAG_STEEP_GAIN);
}
function applyDriverBodyDrag(comp, baseCurvature, baseSteepness, dxFrac, dyFrac) {
  const next = setDriverCurvature(comp, baseCurvature + dxFrac / DRAG_ENERGY_GAIN);
  return setDriverSteepness(next, baseSteepness - dyFrac / DRAG_STEEP_GAIN);
}
function buildSamplers(comp) {
  return {
    segments: comp.segments.map(buildSampler),
    driver: comp.driver ? buildSampler(comp.driver) : null
  };
}
function directionPhase(u, dir) {
  const x = clamp013(u);
  if (dir === "reverse") return 1 - x;
  if (dir === "mirror") return 1 - Math.abs(1 - 2 * x);
  return x;
}
function readComposition(comp, u, s) {
  const inputPhase = directionPhase(u, comp.direction);
  const warpedPhase = s.driver ? clamp013(s.driver(inputPhase)) : inputPhase;
  const gap = comp.gap ?? 0;
  if (gap > 0 && comp.segments.length > 1) {
    const slots = timelineSlots(comp.segments, gap);
    const slot = slots.find((sl) => warpedPhase < sl.b) ?? slots[slots.length - 1];
    const localT2 = slot.b > slot.a ? (warpedPhase - slot.a) / (slot.b - slot.a) : 0;
    if (slot.kind === "segment") {
      const value3 = s.segments[slot.index] ? s.segments[slot.index](localT2) : 0;
      return { inputPhase, warpedPhase, value: value3, segIndex: slot.index, localT: localT2 };
    }
    const n = comp.segments.length;
    const endVal = s.segments[slot.index] ? s.segments[slot.index](1) : 0;
    const startVal = s.segments[(slot.index + 1) % n] ? s.segments[(slot.index + 1) % n](0) : 0;
    const value2 = lerp(endVal, startVal, smootherstep(localT2));
    return { inputPhase, warpedPhase, value: value2, segIndex: slot.index, localT: localT2 };
  }
  const segIndex = segmentIndexAt(warpedPhase, comp.segments);
  const [a, b] = segmentSpan(comp.segments, segIndex);
  const localT = b > a ? (warpedPhase - a) / (b - a) : 0;
  const value = s.segments[segIndex] ? s.segments[segIndex](localT) : 0;
  return { inputPhase, warpedPhase, value, segIndex, localT };
}
var COMPOSER_GAP = 10;
var COMPOSER_PAD_FRAC = 0.18;
var COMPOSER_DRIVER_FRAC = 0.55;
function composerLayout(width, height, hasDriver) {
  const driverH = hasDriver ? Math.round(height * COMPOSER_DRIVER_FRAC) : 0;
  const totalH = height + (hasDriver ? COMPOSER_GAP + driverH : 0);
  return {
    W: width,
    totalH,
    mainRect: { x: 0, y: 0, w: width, h: height },
    driverRect: hasDriver ? { x: 0, y: height + COMPOSER_GAP, w: width, h: driverH } : null
  };
}
function mapY(rect, ny) {
  const pad = rect.h * COMPOSER_PAD_FRAC;
  const top = rect.y + pad;
  const bot = rect.y + rect.h - pad;
  return bot - ny * (bot - top);
}
function spanX(span, nx, W) {
  return (span[0] + nx * (span[1] - span[0])) * W;
}
function curvePath(curve, rect, span, W, samples = 40) {
  const x = (nx) => spanX(span, nx, W);
  const y = (ny) => mapY(rect, ny);
  if (curve.type === "spring") {
    const sampler = buildSampler(curve);
    let d = `M ${x(0)} ${y(sampler(0))}`;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      d += ` L ${x(t)} ${y(sampler(t))}`;
    }
    return d;
  }
  const e = deriveEase(curve.type, curve.curvature, curve.steepness, curve.overshoot, curve.anticipate);
  let pts = [
    [0, 0],
    [e[0], e[1]],
    [e[2], e[3]],
    [1, 1]
  ];
  if (curve.flipX) pts = pts.map(([px, py]) => [1 - px, py]).reverse();
  if (curve.flipY) pts = pts.map(([px, py]) => [px, 1 - py]);
  return `M ${x(pts[0][0])} ${y(pts[0][1])} C ${x(pts[1][0])} ${y(pts[1][1])}, ${x(pts[2][0])} ${y(pts[2][1])}, ${x(pts[3][0])} ${y(pts[3][1])}`;
}
function connectorPath(slot, samplers, segCount, rect, W, samples = 24) {
  const endVal = samplers.segments[slot.index] ? samplers.segments[slot.index](1) : 0;
  const next = (slot.index + 1) % segCount;
  const startVal = samplers.segments[next] ? samplers.segments[next](0) : 0;
  let d = `M ${slot.a * W} ${mapY(rect, endVal)}`;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const v = lerp(endVal, startVal, smootherstep(t));
    d += ` L ${(slot.a + (slot.b - slot.a) * t) * W} ${mapY(rect, v)}`;
  }
  return d;
}
function diagonalLine(rect, span, W) {
  return { x1: span[0] * W, y1: mapY(rect, 0), x2: span[1] * W, y2: mapY(rect, 1) };
}
function playheadGeometry(read2, layout) {
  const seriesX = read2.warpedPhase * layout.W;
  return {
    seriesX,
    dotX: seriesX,
    dotY: mapY(layout.mainRect, read2.value),
    driverX: read2.inputPhase * layout.W
  };
}
var DEFAULT_TRIGGER_STEPS = 5;
function triggerLevels(steps) {
  const n = Math.max(2, Math.floor(steps));
  const out = [];
  for (let k = 0; k < n; k++) out.push(k / (n - 1));
  return out;
}
var TRIGGER_FLYBACK = 0.5;
function triggersCrossed(prevValue, curValue, steps) {
  const n = Math.max(2, Math.floor(steps));
  const seg = 1 / (n - 1);
  const p = clamp013(prevValue);
  const c = clamp013(curValue);
  const delta = c - p;
  const fired = [];
  if (Math.abs(delta) > TRIGGER_FLYBACK) {
    fired.push(delta < 0 ? n - 1 : 0);
  } else if (delta > 0) {
    for (let k = 1; k <= n - 2; k++) {
      const level = k * seg;
      if (p < level && level <= c) fired.push(k);
    }
  } else if (delta < 0) {
    for (let k = n - 2; k >= 1; k--) {
      const level = k * seg;
      if (c <= level && level < p) fired.push(k);
    }
  }
  return fired;
}
function defaultComposition() {
  return {
    segments: [
      { type: "easeOut", weight: 1, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 },
      { type: "easeInOut", weight: 1, curvature: 0, steepness: 0, overshoot: 0, anticipate: 0 }
    ],
    driver: null,
    direction: "forward"
  };
}

// src/waveform-dsp.ts
function mixToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}
function fillPeaks(data, cols, min, max) {
  const step = data.length / cols;
  for (let x = 0; x < cols; x++) {
    const start = Math.floor(x * step);
    const end = Math.max(start + 1, Math.min(data.length, Math.floor((x + 1) * step)));
    let mn = 1;
    let mx = -1;
    for (let i = start; i < end; i++) {
      const v = data[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    min[x] = mn;
    max[x] = mx;
  }
}
function barPeaks(p, cols, pitch) {
  const step = Math.max(1, Math.round(pitch));
  const out = [];
  for (let x = 0; x < cols; x += step) {
    let mn = 1;
    let mx = -1;
    for (let i = x; i < x + step && i < cols; i++) {
      if (p.min[i] < mn) mn = p.min[i];
      if (p.max[i] > mx) mx = p.max[i];
    }
    out.push({ x, min: mn, max: mx });
  }
  return out;
}
function envelope(p, cols, n) {
  const out = new Array(n);
  const seg = cols / n;
  for (let k = 0; k < n; k++) {
    const start = Math.floor(k * seg);
    const end = Math.max(start + 1, Math.min(cols, Math.floor((k + 1) * seg)));
    let a = 0;
    for (let x = start; x < end; x++) {
      const m = Math.max(Math.abs(p.min[x]), Math.abs(p.max[x]));
      if (m > a) a = m;
    }
    out[k] = a;
  }
  return out;
}

// src/modulation-core.ts
var MOD_SLOTS = 16;
var MOD_COLORS = [
  "#ff5f45",
  // 0  coral
  "#ff8a2b",
  // 1  orange
  "#ffb61e",
  // 2  amber
  "#f4d942",
  // 3  yellow
  "#b8e03c",
  // 4  lime
  "#6fd435",
  // 5  green
  "#3bcf6d",
  // 6  emerald
  "#2ed3ab",
  // 7  teal
  "#33c6e8",
  // 8  cyan
  "#3d9bff",
  // 9  azure
  "#5f7bff",
  // 10 blue
  "#8a6bff",
  // 11 violet
  "#b45cff",
  // 12 purple
  "#e04ef0",
  // 13 magenta
  "#ff4fb0",
  // 14 pink
  "#ff4f6e"
  // 15 rose
];
var modColor = (index) => MOD_COLORS[(index % MOD_SLOTS + MOD_SLOTS) % MOD_SLOTS];
var MOD_PAGE_DIALS = 8;
var isModDial = (c) => !c.chip && (c.scope || c.type === "toggle" && c.moveSlot || c.type === "select" || c.type === "slider" || c.type === "xy" || c.type === "range" || c.type === "number" && c.min != null && c.max != null);
var slotOf = (c) => ({
  path: c.path,
  ...c.drawsPreview ? { preview: true } : {},
  ...c.envStage ? { stage: c.envStage } : {},
  ...c.scope ? { scope: true } : {},
  ...c.cycle ? { cycle: true } : {}
});
function modPageLayout(controls, params = {}) {
  const dials = [];
  const toggles = [];
  const values = [];
  for (const c of controls) {
    if (c.when && !c.when(params)) continue;
    if (isModDial(c)) {
      if (dials.length < MOD_PAGE_DIALS) dials.push(slotOf(c));
      continue;
    }
    const col = Math.max(0, dials.length - 1);
    const row = c.type === "toggle" && !toggles[col] ? toggles : values;
    if (!row[col]) row[col] = slotOf(c);
  }
  const pad = (row) => Array.from({ length: row.length }, (_, i) => row[i] ?? null);
  return { dials, toggles: pad(toggles), values: pad(values) };
}
var visibleModControls = (def, params) => def.controls.filter((c) => !c.when || c.when(params));
var registry = /* @__PURE__ */ new Map();
function registerModType(def) {
  registry.set(def.type, def);
}
var getModType = (type) => registry.get(type);
var listModTypes = () => [...registry.values()];
var modPageWidth = () => Math.min(
  MOD_PAGE_DIALS,
  1 + listModTypes().reduce(
    (w, def) => Math.max(w, modPageLayout(def.controls, def.defaults).dials.length),
    0
  )
);
var MOD_SETTINGS_PANEL = "mod-settings";
var modKey = (panelId, path) => `${panelId}\0${path}`;
var clamp7 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var clamp014 = (v) => clamp7(Number(v) || 0, 0, 1);
var clampSigned = (v) => clamp7(Number(v) || 0, -1, 1);
function applyModulation(base, signal, amount, min, max) {
  const offset = clamp7(signal, -1, 1) * clamp014(amount) * (max - min) / 2;
  return clamp7(base + offset, min, max);
}
var MOD_RING_RADIUS = 6;
var MOD_RING_CIRCUMFERENCE = 2 * Math.PI * MOD_RING_RADIUS;
var RING_SWEEP_START = 135 / 360;
var RING_SWEEP_LEN = 270 / 360;
function modRingArc(from01, to01) {
  const a = RING_SWEEP_START + clamp014(from01) * RING_SWEEP_LEN;
  const b = RING_SWEEP_START + clamp014(to01) * RING_SWEEP_LEN;
  return {
    length: Math.abs(b - a) * MOD_RING_CIRCUMFERENCE,
    offset: -Math.min(a, b) * MOD_RING_CIRCUMFERENCE
  };
}
var LFO_SYNC_DIVISIONS = [
  { label: "4", beats: 16 },
  { label: "2", beats: 8 },
  { label: "1", beats: 4 },
  { label: "1/2", beats: 2 },
  { label: "1/4", beats: 1 },
  { label: "1/8", beats: 0.5 },
  { label: "1/16", beats: 0.25 },
  { label: "1/32", beats: 0.125 }
];
var LFO_SYNC_OPTIONS = LFO_SYNC_DIVISIONS.map((d) => d.label);
var LFO_SYNC_DEFAULT = "1/4";
function lfoDivisionBeats(division) {
  const named = LFO_SYNC_DIVISIONS.find((d) => d.label === division);
  if (named) return named.beats;
  if (typeof division !== "number" || !Number.isFinite(division)) {
    return LFO_SYNC_DIVISIONS.find((d) => d.label === LFO_SYNC_DEFAULT).beats;
  }
  return LFO_SYNC_DIVISIONS[clamp7(Math.round(division), 0, LFO_SYNC_DIVISIONS.length - 1)].beats;
}
function lfoSyncedHz(division, bpm) {
  return (Number(bpm) || 120) / 60 / lfoDivisionBeats(division);
}
var previewNoise = (i, salt = 0) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
function previewSlew(values, smooth) {
  const s = clamp014(smooth);
  if (s <= 0 || values.length < 2) return values;
  const k = 1 - Math.exp(-(1 / values.length) / (s * s * 0.4 + 1e-6));
  let out = values[0];
  return values.map((v, i) => i === 0 ? out : out = out + (v - out) * k);
}
var LFO_DEF = {
  type: "lfo",
  label: "LFO",
  defaults: { rate: 1, division: LFO_SYNC_DEFAULT, phase: 0, width: 0.5, jitter: 0, smooth: 0, sync: false },
  controls: [
    /* One slot for how fast, wearing whichever control the moment calls for:
       free-running it is a rate in Hz, synced it is a division of the bar.
       Either way the scope runs behind it — you turn the wave you watch. */
    { type: "slider", path: "rate", label: "Rate", min: 0.02, max: 20, step: 0.01, unit: "Hz", scope: true, when: (p) => !p.sync },
    { type: "select", path: "division", label: "Division", options: LFO_SYNC_OPTIONS, scope: true, when: (p) => !!p.sync },
    { type: "toggle", path: "sync", label: "Sync", moveSlot: true, icon: "timer" },
    /* Phase's two ends are the same place, so it draws a needle, not a bar. */
    { type: "slider", path: "phase", label: "Phase", min: 0, max: 1, step: 0.01, display: "dial", wrap: true },
    { type: "slider", path: "width", label: "Width", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "jitter", label: "Jitter", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "smooth", label: "Smooth", min: 0, max: 1, step: 0.01 }
  ],
  createState: () => ({ phase: 0, drift: 0, driftTarget: 0, out: null }),
  tick(state4, params, dt, bpm) {
    const s = state4;
    const hz = params.sync ? lfoSyncedHz(params.division, bpm) : Math.max(0, Number(params.rate) || 0);
    const before = s.phase;
    s.phase = (s.phase + dt * hz) % 1;
    if (s.phase < before) s.driftTarget = (Math.random() * 2 - 1) * clamp014(params.jitter);
    if (!clamp014(params.jitter)) {
      s.drift = 0;
      s.driftTarget = 0;
    } else s.drift += (s.driftTarget - s.drift) * Math.min(1, dt * hz * 4);
    const w = clamp7(Number(params.width) || 0, 0.01, 0.99);
    const ph = (s.phase + clamp014(params.phase)) % 1;
    const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
    let v = clamp7(tri * 2 - 1 + s.drift, -1, 1);
    const smooth = clamp014(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
  /**
   * Two cycles of the wave the params describe: the width skew, the jitter
   * as a slow deterministic wobble, and the slew rounding it all. The
   * on-screen scope draws the live engine signal instead; this is the
   * scope's caption (the wave's name) and the small screens' drawing.
   */
  preview(params, count) {
    const n = Math.max(2, count);
    const w = clamp7(Number(params.width) || 0, 0.01, 0.99);
    const jitter = clamp014(params.jitter);
    const wobble = Math.max(2, Math.round(n / 8));
    const raw = Array.from({ length: n }, (_, i) => {
      const ph = (i / (n - 1) * 2 + clamp014(params.phase)) % 1;
      const tri = ph < w ? ph / w : 1 - (ph - w) / (1 - w);
      const drift = previewNoise(Math.floor(i / wobble)) * jitter * 0.5;
      return clamp7(tri * 2 - 1 + drift, -1, 1);
    });
    const shape = clamp014(params.smooth) > 0.55 ? "Sine" : w <= 0.25 ? "Saw" : w >= 0.75 ? "Ramp" : "Tri";
    return {
      points: previewSlew(raw, clamp014(params.smooth)).map((v) => (v + 1) / 2),
      label: jitter > 0.4 ? `${shape} \xB7 Jitter` : shape
    };
  }
};
registerModType(LFO_DEF);
var SH_DEF = {
  type: "sh",
  label: "S&H",
  defaults: { rate: 4, depth: 1, offset: 0, jitter: 0, smooth: 0 },
  controls: [
    { type: "slider", path: "rate", label: "Rate", min: 0.1, max: 30, step: 0.01, unit: "Hz", scope: true },
    { type: "slider", path: "depth", label: "Depth", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "offset", label: "Offset", min: -1, max: 1, step: 0.01, bipolar: true },
    { type: "slider", path: "jitter", label: "Jitter", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "smooth", label: "Smooth", min: 0, max: 1, step: 0.01 }
  ],
  createState: () => ({ wait: 0, held: 0, out: null }),
  tick(state4, params, dt) {
    const s = state4;
    s.wait -= dt;
    if (s.out === null || s.wait <= 0) {
      s.held = Math.random() * 2 - 1;
      const hz = Math.max(0.01, Number(params.rate) || 0);
      const len = 1 / hz * (1 + (Math.random() * 2 - 1) * clamp014(params.jitter) * 0.9);
      s.wait = Math.max(5e-3, len);
    }
    const offset = clamp7(Number(params.offset) || 0, -1, 1);
    let v = clamp7(s.held * clamp014(params.depth) + offset, -1, 1);
    const smooth = clamp014(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
  /**
   * A run of held values, deterministic so the picture holds still while
   * you shape it: depth scales the throw, offset lifts the whole run,
   * jitter stretches and shrinks the holds (the drunken clock), and the
   * slew turns the steps into a drift.
   */
  preview(params, count) {
    const n = Math.max(2, count);
    const depth = clamp014(params.depth);
    const offset = clamp7(Number(params.offset) || 0, -1, 1);
    const jitter = clamp014(params.jitter);
    const steps = 8;
    const lens = Array.from({ length: steps }, (_, i) => 1 + previewNoise(i, 1) * jitter * 0.9);
    const total = lens.reduce((a, b) => a + b, 0);
    const edges = [];
    let acc = 0;
    for (const len of lens) edges.push(acc += len / total);
    const raw = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const step = edges.findIndex((e) => t <= e);
      return clamp7(previewNoise(step < 0 ? steps - 1 : step) * depth + offset, -1, 1);
    });
    return {
      points: previewSlew(raw, clamp014(params.smooth)).map((v) => (v + 1) / 2),
      label: clamp014(params.smooth) > 0.55 ? "Drift" : "Steps"
    };
  }
};
registerModType(SH_DEF);
var secs = (ms) => Math.max(0, Number(ms) || 0) / 1e3;
var ADSR_STAGE_MAX = { attack: 2e3, decay: 2e3, release: 4e3 };
var ENV_BEND_STAGES = ["attack", "decay", "release"];
var envCurveParam = (stage) => `${stage}Curve`;
var ENV_WAVE_STAGES = ["attack", "decay", "sustain", "release"];
var envWaveParam = (stage) => `${stage}Wave`;
var envWaveFlipParam = (stage) => `${stage}WaveFlip`;
var ENV_SUSTAIN_WAVE_BEATS = 1;
var ENV_SUSTAIN_WAVE_CYCLES = 2;
function envStageWave(stage, phase, level, params) {
  const amount = clamp014(params[envWaveParam(stage)]);
  if (amount <= 0) return level;
  const w = amount * (1 - Math.cos(2 * Math.PI * phase)) / 2;
  return params[envWaveFlipParam(stage)] ? level + (1 - level) * w : level * (1 - w);
}
var adsrShape = (p, curve) => {
  const c = clamp7(Number(curve) || 0, -1, 1);
  return 1 - Math.pow(1 - p, Math.pow(4, c));
};
function envelopePoints(params, count) {
  const n = Math.max(2, count);
  const sustain = clamp014(params.sustain);
  const share = (key) => 0.04 + 0.24 * Math.min(1, secs(params[key]) * 1e3 / ADSR_STAGE_MAX[key]);
  const wA = share("attack");
  const wD = share("decay");
  const wR = share("release");
  const at2 = (t) => {
    if (t < wA) {
      const p2 = t / wA;
      return envStageWave("attack", p2, adsrShape(p2, params.attackCurve), params);
    }
    if (t < wA + wD) {
      const p2 = (t - wA) / wD;
      return envStageWave("decay", p2, 1 - (1 - sustain) * adsrShape(p2, params.decayCurve), params);
    }
    if (t < 1 - wR) {
      const p2 = (t - wA - wD) / (1 - wR - wA - wD);
      return envStageWave("sustain", p2 * ENV_SUSTAIN_WAVE_CYCLES % 1, sustain, params);
    }
    const p = (t - (1 - wR)) / wR;
    return envStageWave("release", p, sustain * (1 - adsrShape(p, params.releaseCurve)), params);
  };
  return Array.from({ length: n }, (_, i) => at2(i / (n - 1)));
}
function envelopeJoints(params) {
  const sustain = clamp014(params.sustain);
  const share = (key) => 0.04 + 0.24 * Math.min(1, secs(params[key]) * 1e3 / ADSR_STAGE_MAX[key]);
  const wA = share("attack");
  return [
    { stage: "attack", x: wA, y: 1 },
    { stage: "decay", x: wA + share("decay"), y: sustain },
    { stage: "release", x: 1 - share("release"), y: sustain }
  ];
}
function adsrStageLength(stage, params) {
  if (stage === "attack") return secs(params.attack);
  if (stage === "decay") return secs(params.decay);
  if (stage === "release") return secs(params.release);
  return Infinity;
}
var ADSR_DEF = {
  type: "adsr",
  label: "ADSR",
  defaults: {
    attack: 10,
    decay: 300,
    sustain: 0.6,
    release: 600,
    loop: false,
    // The attack keeps its analog leap; decay and release start straight,
    // as the design draws them — every ramp bendable from its pad.
    attackCurve: 0.5,
    decayCurve: 0,
    releaseCurve: 0,
    // Every stage's wave rests at zero: the envelope ships as itself, and
    // the second dimension arrives only when a pad asks for it.
    attackWave: 0,
    decayWave: 0,
    sustainWave: 0,
    releaseWave: 0,
    attackWaveFlip: false,
    decayWaveFlip: false,
    sustainWaveFlip: false,
    releaseWaveFlip: false
  },
  controls: [
    { type: "slider", path: "attack", label: "Attack", min: 0, max: ADSR_STAGE_MAX.attack, step: 1, unit: "ms", envStage: "attack" },
    { type: "slider", path: "decay", label: "Decay", min: 0, max: ADSR_STAGE_MAX.decay, step: 1, unit: "ms", envStage: "decay" },
    { type: "slider", path: "sustain", label: "Sustain", min: 0, max: 1, step: 0.01, envStage: "sustain" },
    { type: "slider", path: "release", label: "Release", min: 0, max: ADSR_STAGE_MAX.release, step: 1, unit: "ms", envStage: "release" },
    /* A big slot of its own, beside the envelope — the pad row under the
       ramps belongs to the hold-to-bend gesture. */
    { type: "toggle", path: "loop", label: "Loop", moveSlot: true, icon: "repeat" }
  ],
  createState: () => ({ stage: "idle", t: 0, from: 0, env: 0, gate: false }),
  gate(state4, on) {
    const s = state4;
    s.gate = on;
    if (on) {
      s.stage = "attack";
      s.t = 0;
      s.from = s.env;
    } else if (s.stage !== "idle") {
      s.stage = "release";
      s.t = 0;
      s.from = s.env;
    }
  },
  tick(state4, params, dt, bpm) {
    const s = state4;
    const loop = !!params.loop;
    const sustain = clamp014(params.sustain);
    if (s.stage === "idle") {
      if (!loop) return s.env = 0;
      s.stage = "attack";
      s.t = 0;
      s.from = 0;
    }
    s.t += dt;
    for (let guard = 0; guard < 4; guard++) {
      const len2 = adsrStageLength(s.stage, params);
      if (s.t < len2) break;
      s.t -= len2;
      if (s.stage === "attack") {
        s.stage = "decay";
        s.from = 1;
      } else if (s.stage === "decay") {
        s.stage = s.gate ? "sustain" : "release";
        s.from = sustain;
      } else {
        s.stage = loop ? "attack" : "idle";
        s.from = 0;
      }
    }
    const len = adsrStageLength(s.stage, params);
    const p = len > 0 && Number.isFinite(len) ? Math.min(1, s.t / len) : 1;
    if (s.stage === "attack") s.env = s.from + (1 - s.from) * adsrShape(p, params.attackCurve);
    else if (s.stage === "decay") s.env = s.from + (sustain - s.from) * adsrShape(p, params.decayCurve);
    else if (s.stage === "sustain") s.env = sustain;
    else if (s.stage === "release") s.env = s.from * (1 - adsrShape(p, params.releaseCurve));
    else s.env = 0;
    if (s.stage !== "idle") {
      const beat = 60 / (Number(bpm) || 120) * ENV_SUSTAIN_WAVE_BEATS;
      const wp = s.stage === "sustain" ? s.t / beat % 1 : p;
      s.env = envStageWave(s.stage, wp, s.env, params);
    }
    return clamp014(s.env);
  }
};
registerModType(ADSR_DEF);
var CURVE_MAX_CLIPS = 8;
var CURVE_MIN_DURATION = 0.05;
var CURVE_MAX_DURATION = 60;
var CURVE_PULSE_DECAY = 0.04;
var CURVE_PREVIEW_BAND = { lo: -0.25, hi: 1.25 };
var DIRECTIONS = ["forward", "mirror", "reverse"];
var CURVE_LABELS = {
  linear: "Linear",
  easeIn: "Ease In",
  easeOut: "Ease Out",
  easeInOut: "Ease InOut",
  spring: "Spring"
};
var SHAPE_PARAMS = ["curvature", "steepness", "anticipate", "overshoot"];
var newClip = () => ({
  type: "easeInOut",
  weight: 1,
  curvature: 0,
  steepness: 0,
  overshoot: 0,
  anticipate: 0
});
function readClips(params) {
  const raw = Array.isArray(params.clips) ? params.clips : [];
  const list = raw.filter((c) => c && typeof c === "object").map((c) => ({ ...newClip(), ...c }));
  return list.length ? list.slice(0, CURVE_MAX_CLIPS) : [newClip()];
}
var writeClips = (list) => list;
var selectedClip = (params, count) => clamp7(Math.round(Number(params.selected) || 0), 0, Math.max(0, count - 1));
function curveComposition(params) {
  const i = DIRECTIONS.indexOf(params.direction);
  return {
    segments: readClips(params),
    driver: null,
    direction: DIRECTIONS[i < 0 ? 0 : i],
    gap: clamp014(params.gap)
  };
}
function curveDuration(params, bpm) {
  if (!params.sync) return clamp7(Number(params.duration) || 0, CURVE_MIN_DURATION, CURVE_MAX_DURATION);
  const beat = 60 / (Number(bpm) || 120);
  return Math.max(CURVE_MIN_DURATION, lfoDivisionBeats(params.division) * beat);
}
var CURVE_DEF = {
  type: "curve",
  label: "Curve",
  defaults: {
    duration: 2,
    sync: false,
    division: LFO_SYNC_DEFAULT,
    signal: "continuous",
    triggers: DEFAULT_TRIGGER_STEPS,
    direction: "forward",
    flip: false,
    gap: 0,
    segments: 1,
    selected: 0,
    curvature: 0,
    steepness: 0,
    anticipate: 0,
    overshoot: 0,
    clips: writeClips([newClip()])
  },
  controls: [
    /* The selected clip's shape: the knob leans its energy one way or the
       other, the volume knob makes the ease gentle or explosive — the same
       two-axis drag the composer answers to on screen. A knob tap cycles
       the clip through the curve vocabulary. */
    {
      type: "xy",
      path: "curve",
      label: "Curve",
      xParam: "curvature",
      yParam: "steepness",
      xAxis: { min: -1, max: 1, bipolar: true, label: "Energy" },
      yAxis: { min: -1, max: 1, bipolar: true, label: "Steep" },
      drawsPreview: true,
      cycle: (params) => {
        const comp = curveComposition(params);
        const i = selectedClip(params, comp.segments.length);
        return { clips: writeClips(cycleSegmentType(comp, i).segments) };
      }
    },
    /* How long a pass lasts: seconds free-running, a division of the bar
       when synced — the same swap the LFO's rate slot makes. */
    { type: "slider", path: "duration", label: "Duration", min: CURVE_MIN_DURATION, max: CURVE_MAX_DURATION, step: 0.01, unit: "s", when: (p) => !p.sync },
    { type: "select", path: "division", label: "Division", options: LFO_SYNC_OPTIONS, when: (p) => !!p.sync },
    { type: "toggle", path: "sync", label: "Sync" },
    /* Continuous or triggering: a running wave against a row of pulses. */
    {
      type: "select",
      path: "signal",
      label: "Signal",
      chip: true,
      options: [
        { value: "continuous", label: "Cont", icon: "waves" },
        { value: "trigger", label: "Trig", icon: "audio-lines" }
      ]
    },
    /* The direction reads as a picture — an arrow says which way the pass
       runs faster than a word does. */
    {
      type: "select",
      path: "direction",
      label: "Direction",
      options: [
        { value: "forward", label: "Forward", icon: "arrow-right" },
        { value: "mirror", label: "Mirror", icon: "arrow-left-right" },
        { value: "reverse", label: "Reverse", icon: "arrow-left" }
      ]
    },
    { type: "toggle", path: "flip", label: "Flip" },
    /* The trigger count only means anything in trigger mode, so the chip
       only appears there — the column stays clear the rest of the time. */
    {
      type: "slider",
      path: "triggers",
      label: "Triggers",
      chip: true,
      min: 2,
      max: 16,
      step: 1,
      when: (params) => params.signal === "trigger"
    },
    { type: "slider", path: "gap", label: "Gap", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "anticipate", label: "Anticipate", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "overshoot", label: "Overshoot", min: 0, max: 1, step: 0.01 },
    { type: "slider", path: "segments", label: "Segments", min: 1, max: CURVE_MAX_CLIPS, step: 1 }
  ],
  createState: () => ({ phase: 0, signature: "", samplers: null, prev: null, pulse: 0 }),
  tick(state4, params, dt, bpm) {
    const s = state4;
    const comp = curveComposition(params);
    const signature = JSON.stringify(comp.segments) + `|${comp.gap}`;
    if (signature !== s.signature || !s.samplers) {
      s.signature = signature;
      s.samplers = buildSamplers(comp);
    }
    s.phase = (s.phase + dt / curveDuration(params, bpm)) % 1;
    let v = clamp014(readComposition(comp, s.phase, s.samplers).value);
    if (params.flip) v = 1 - v;
    if (params.signal !== "trigger") {
      s.prev = v;
      return v * 2 - 1;
    }
    const fired = triggersCrossed(s.prev ?? v, v, Number(params.triggers) || DEFAULT_TRIGGER_STEPS);
    s.prev = v;
    if (fired.length) s.pulse = 1;
    else s.pulse *= Math.exp(-dt / CURVE_PULSE_DECAY);
    return s.pulse;
  },
  /**
   * Keep the projection and the series in step. A shape dial writes into the
   * selected clip; anything else — a new selection, a deleted clip, a cycled
   * curve — reads that clip's shape back out, so the dials always show the
   * clip the composer is highlighting.
   */
  normalize(current, patch2) {
    const next = { ...current, ...patch2 };
    const changed = (key) => key in patch2 && patch2[key] !== current[key];
    let list = "clips" in patch2 ? readClips(patch2) : readClips(current);
    if (!("clips" in patch2) && changed("segments")) {
      const want = clamp7(Math.round(Number(patch2.segments) || 1), 1, CURVE_MAX_CLIPS);
      while (list.length > want) list.pop();
      while (list.length < want) list.push(newClip());
      list = list.map((c) => ({ ...c, weight: 1 }));
    }
    const sel = selectedClip(next, list.length);
    if (SHAPE_PARAMS.some(changed)) {
      list[sel] = {
        ...list[sel],
        curvature: clampSigned(next.curvature),
        steepness: clampSigned(next.steepness),
        anticipate: clamp014(next.anticipate),
        overshoot: clamp014(next.overshoot)
      };
    } else {
      const clip = list[sel];
      next.curvature = clip.curvature;
      next.steepness = clip.steepness;
      next.anticipate = clip.anticipate ?? 0;
      next.overshoot = clip.overshoot ?? 0;
    }
    next.selected = sel;
    next.segments = list.length;
    next.clips = writeClips(list);
    return next;
  },
  buttons: {
    /* The arrows walk the clips (wrapping), Delete drops the selected one —
       the last clip stays, since a pass with nothing in it plays nothing. */
    left: (params) => {
      const n = readClips(params).length;
      return { selected: (selectedClip(params, n) + n - 1) % n };
    },
    right: (params) => {
      const n = readClips(params).length;
      return { selected: (selectedClip(params, n) + 1) % n };
    },
    delete: (params) => {
      const list = readClips(params);
      if (list.length <= 1) return;
      const sel = selectedClip(params, list.length);
      list.splice(sel, 1);
      return { clips: writeClips(list), selected: Math.min(sel, list.length - 1) };
    }
  },
  phase: (state4) => state4.phase,
  preview(params, count) {
    const list = readClips(params);
    const sel = selectedClip(params, list.length);
    const sampler = buildSampler(list[sel]);
    const span = CURVE_PREVIEW_BAND.hi - CURVE_PREVIEW_BAND.lo;
    const n = Math.max(2, count);
    return {
      points: Array.from({ length: n }, (_, i) => clamp014((sampler(i / (n - 1)) - CURVE_PREVIEW_BAND.lo) / span)),
      label: `${CURVE_LABELS[list[sel].type]} ${sel + 1}/${list.length}`
    };
  }
};
registerModType(CURVE_DEF);
var AUDIO_ENV_COLS = 2048;
var AUDIO_ENV_SEGMENTS = 512;
var audioModBuffer = null;
var audioModEnv = null;
var audioModDuration = 1;
var audioModVersion = 0;
var audioModListeners = /* @__PURE__ */ new Set();
function setAudioModBuffer(buffer) {
  audioModBuffer = buffer;
  if (!buffer || !buffer.length) {
    audioModEnv = null;
    audioModDuration = 1;
  } else {
    const mono = mixToMono(buffer);
    const cols = Math.min(AUDIO_ENV_COLS, mono.length);
    const min = new Float32Array(cols);
    const max = new Float32Array(cols);
    fillPeaks(mono, cols, min, max);
    audioModEnv = envelope({ min, max }, cols, Math.min(AUDIO_ENV_SEGMENTS, cols));
    audioModDuration = Math.max(0.05, buffer.duration || mono.length / 44100);
  }
  audioModVersion += 1;
  for (const fn of audioModListeners) fn();
}
function subscribeAudioMod(fn) {
  audioModListeners.add(fn);
  return () => {
    audioModListeners.delete(fn);
  };
}
var getAudioModVersion = () => audioModVersion;
var getAudioModBuffer = () => audioModBuffer;
var audioModWindow = null;
function setAudioModWindowSource(fn) {
  audioModWindow = fn;
}
function getAudioModWindow() {
  const win = audioModWindow?.();
  if (!win || !(win.span > 0) || win.span >= 1) return { start: 0, span: 1 };
  return { start: clamp014(win.start), span: Math.min(win.span, 1 - clamp014(win.start)) };
}
function audioModLevel(position) {
  if (!audioModEnv) return 0;
  const i = Math.floor(clamp014(position) * audioModEnv.length);
  return audioModEnv[Math.min(audioModEnv.length - 1, i)];
}
function audioLoop(params) {
  const start = clamp014(params.loopStart);
  const end = clamp014(params.loopEnd);
  if (end - start < 1e-3 || start === 0 && end === 1) return null;
  return { start, end };
}
var AUDIO_DEF = {
  type: "audio",
  label: "Audio",
  defaults: {
    speed: 1,
    depth: 1,
    smooth: 0,
    playing: true,
    loopOn: true,
    loopStart: 0,
    loopEnd: 1,
    position: 0
  },
  controls: [
    /* The main audio dial: it draws the sample itself, and its settings page
       floats the full waveform above the panel. Play and loop take no slots
       — they belong to the hardware's own buttons, and the editor's clock
       wears their state. */
    { type: "slider", path: "speed", label: "Speed", min: 0.1, max: 4, step: 0.01, unit: "x", drawsPreview: true },
    { type: "slider", path: "depth", label: "Depth", min: 0, max: 1, step: 0.01, scope: true },
    { type: "slider", path: "smooth", label: "Smooth", min: 0, max: 1, step: 0.01 }
  ],
  createState: () => ({ pos: 0, out: null, seek: null }),
  tick(state4, params, dt) {
    const s = state4;
    const seek = clamp014(params.position);
    if (s.seek !== seek) {
      s.seek = seek;
      s.pos = seek;
    }
    if (params.playing) {
      const speed = clamp7(Number(params.speed) || 1, 0.05, 16);
      s.pos += dt * speed / audioModDuration;
      const loop = params.loopOn ? audioLoop(params) : null;
      if (loop) {
        const span = loop.end - loop.start;
        if (s.pos >= loop.end) s.pos = loop.start + (s.pos - loop.start) % span;
        else if (s.pos < loop.start) s.pos = loop.start;
      } else if (s.pos >= 1) {
        s.pos = params.loopOn ? s.pos % 1 : 1;
      }
    }
    let v = audioModEnv === null ? 0 : (audioModLevel(s.pos) * 2 - 1) * clamp014(params.depth);
    const smooth = clamp014(params.smooth);
    if (smooth > 0 && s.out !== null) {
      const k = 1 - Math.exp(-dt / (smooth * smooth * 0.4 + 1e-6));
      v = s.out + (v - s.out) * k;
    }
    s.out = v;
    return v;
  },
  /* Delete, while the page is open, drops the loop brackets. */
  buttons: {
    delete: () => ({ loopStart: 0, loopEnd: 1 })
  },
  /**
   * The sample's envelope — the small screens' waveform drawing. Over the
   * whole sample, or over the editor's shown window while it is zoomed in.
   */
  preview(_params, count) {
    const n = Math.max(2, count);
    if (!audioModEnv) {
      return { points: Array.from({ length: n }, () => 0), label: "No sample" };
    }
    const { start, span } = getAudioModWindow();
    return {
      points: Array.from({ length: n }, (_, i) => clamp014(audioModLevel(start + i / (n - 1) * span))),
      label: "Audio"
    };
  },
  phase(state4) {
    return state4.pos;
  },
  /** Note on rewinds to the last seek — the sample retriggers like a pad. */
  gate(state4, on) {
    const s = state4;
    if (on) s.pos = s.seek ?? 0;
  }
};
registerModType(AUDIO_DEF);

// src/components/MoveWaveform.tsx
var import_react7 = require("react");
var import_react_dom = require("react-dom");

// src/components/WaveformVisualization.tsx
var import_react6 = require("react");

// src/waveform-asset.ts
var WAVEFORM_BASE_BUCKET = 64;
function buildWaveformLevels(channels, base = WAVEFORM_BASE_BUCKET) {
  const length = channels[0]?.length ?? 0;
  const n = Math.max(1, Math.ceil(length / base));
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  const count = channels.length;
  for (let b = 0; b < n; b++) {
    const s0 = b * base;
    const s1 = Math.min(length, s0 + base);
    let mn = 1;
    let mx = -1;
    for (let i = s0; i < s1; i++) {
      let v = 0;
      for (let c = 0; c < count; c++) v += channels[c][i];
      v /= count;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    if (s1 <= s0) mn = mx = 0;
    min[b] = mn;
    max[b] = mx;
  }
  const levels = [{ bucket: base, min, max }];
  for (let prev = levels[0]; prev.min.length > 1; ) {
    const m = Math.ceil(prev.min.length / 2);
    const next = { bucket: prev.bucket * 2, min: new Float32Array(m), max: new Float32Array(m) };
    for (let i = 0; i < m; i++) {
      const j = 2 * i + 1 < prev.min.length ? 2 * i + 1 : 2 * i;
      next.min[i] = Math.min(prev.min[2 * i], prev.min[j]);
      next.max[i] = Math.max(prev.max[2 * i], prev.max[j]);
    }
    levels.push(next);
    prev = next;
  }
  return levels;
}
function mixRange(channels, start, end) {
  const out = new Float32Array(Math.max(0, end - start));
  for (const channel of channels) {
    for (let i = 0; i < out.length; i++) out[i] += channel[start + i] / channels.length;
  }
  return out;
}
function waveformAssetFromBuffer(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  return waveformAsset(buildWaveformLevels(channels), buffer.sampleRate, buffer.length, channels);
}
function waveformAsset(levels, sampleRate, length, channels) {
  return {
    sampleRate,
    length,
    duration: length / sampleRate,
    levels,
    samples: channels?.length ? (start, end) => {
      const s0 = Math.max(0, Math.min(length, Math.floor(start)));
      const s1 = Math.max(s0, Math.min(length, Math.ceil(end)));
      return channels.length === 1 ? channels[0].subarray(s0, s1) : mixRange(channels, s0, s1);
    } : void 0
  };
}
function rangesDuration(ranges) {
  let total = 0;
  for (const r of ranges) total += Math.max(0, r.end - r.start);
  return total;
}
function playedRanges(asset, ranges) {
  return ranges ?? [{ start: 0, end: asset.duration }];
}
function spanPeak(asset, s0, s1, out) {
  const span = s1 - s0;
  if (span <= 0) return;
  const levels = asset.levels;
  if (span < levels[0].bucket && asset.samples) {
    const data = asset.samples(s0, s1);
    if (data) {
      let mn2 = out[0];
      let mx2 = out[1];
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v < mn2) mn2 = v;
        if (v > mx2) mx2 = v;
      }
      out[0] = mn2;
      out[1] = mx2;
      return;
    }
  }
  let k = 0;
  while (k + 1 < levels.length && levels[k + 1].bucket * 4 <= span) k++;
  const level = levels[k];
  const b0 = Math.floor(s0 / level.bucket);
  const b1 = Math.min(level.min.length, Math.max(b0 + 1, Math.ceil(s1 / level.bucket)));
  let mn = out[0];
  let mx = out[1];
  for (let b = b0; b < b1; b++) {
    if (level.min[b] < mn) mn = level.min[b];
    if (level.max[b] > mx) mx = level.max[b];
  }
  out[0] = mn;
  out[1] = mx;
}
var FRAME_EPSILON = 1e-6;
function fillRangePeaks(asset, ranges, t0, t1, cols, min, max) {
  const sr = asset.sampleRate;
  const step = (t1 - t0) / Math.max(1, cols);
  const out = [1, -1];
  let r = 0;
  let base = 0;
  for (let x = 0; x < cols; x++) {
    const c0 = t0 + x * step;
    const c1 = c0 + step;
    while (r < ranges.length && base + (ranges[r].end - ranges[r].start) <= c0) {
      base += ranges[r].end - ranges[r].start;
      r++;
    }
    out[0] = 1;
    out[1] = -1;
    let at2 = base;
    for (let i = r; i < ranges.length && at2 < c1; i++) {
      const len = ranges[i].end - ranges[i].start;
      const a = Math.max(c0, at2);
      const b = Math.min(c1, at2 + len);
      if (b > a) {
        const s0 = Math.floor((ranges[i].start + (a - at2)) * sr + FRAME_EPSILON);
        const s1 = Math.min(asset.length, Math.max(s0 + 1, Math.ceil((ranges[i].start + (b - at2)) * sr - FRAME_EPSILON)));
        if (s0 < asset.length) spanPeak(asset, s0, s1, out);
      }
      at2 += len;
    }
    if (out[0] > out[1]) out[0] = out[1] = 0;
    min[x] = out[0];
    max[x] = out[1];
  }
}
function rangeEnvelope(asset, ranges, t0, t1, seg) {
  const played = rangesDuration(ranges);
  if (!(seg > 0) || played <= 0) return [];
  const k0 = Math.max(0, Math.floor(t0 / seg));
  const k1 = Math.min(Math.ceil(played / seg), Math.ceil(t1 / seg));
  const n = k1 - k0 + 1;
  if (n < 1) return [];
  const min = new Float32Array(n);
  const max = new Float32Array(n);
  fillRangePeaks(asset, ranges, (k0 - 0.5) * seg, (k1 + 0.5) * seg, n, min, max);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ t: Math.min(played, (k0 + i) * seg), amp: Math.max(Math.abs(min[i]), Math.abs(max[i])) });
  }
  return out;
}

// src/waveform-engine.ts
var WAVEFORM_MODES = ["smooth", "pixelated", "striped"];
var WAVEFORM_STRIPE_STRETCH = 2;
var WAVEFORM_MAX_ZOOM = 1024;
var BANDS = [
  { type: "lowpass", freq: 250 },
  { type: "bandpass", freq: 1100, q: 0.6 },
  { type: "highpass", freq: 4200 }
];
var BAND_COLORS = ["#a855f7", "#22d3ee", "#a3e635"];
var WAVEFORM_SMOOTH_POINTS = 46;
var BORDER_FILL_ALPHA = 0.2;
var DRAG_THRESHOLD2 = 3;
var EDGE_HIT2 = 6;
var MIN_LOOP = 1e-3;
var WAVEFORM_GAP = 8;
var WAVEFORM_GAP_RADIUS = 6;
function smoothThrough(ctx, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y
    );
  }
}
async function filterBuffer(buffer, band) {
  const off = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const src = off.createBufferSource();
  src.buffer = buffer;
  const filter = off.createBiquadFilter();
  filter.type = band.type;
  filter.frequency.value = band.freq;
  if (band.q != null) filter.Q.value = band.q;
  src.connect(filter);
  filter.connect(off.destination);
  src.start();
  return off.startRendering();
}
var bufferAssets = /* @__PURE__ */ new WeakMap();
var assetFor = (buffer) => {
  let asset = bufferAssets.get(buffer);
  if (!asset) bufferAssets.set(buffer, asset = waveformAssetFromBuffer(buffer));
  return asset;
};
var bandAssets = /* @__PURE__ */ new WeakMap();
var bandQueue = Promise.resolve();
var bandsFor = (asset, source) => {
  let bands = bandAssets.get(asset);
  if (!bands) {
    bands = (async () => {
      const out = [];
      for (const band of BANDS) {
        const render = bandQueue.then(() => filterBuffer(source, band));
        bandQueue = render.catch(() => {
        });
        const filtered = await render;
        out.push(waveformAsset(buildWaveformLevels([filtered.getChannelData(0)]), filtered.sampleRate, filtered.length));
      }
      return out;
    })();
    bands.catch(() => bandAssets.delete(asset));
    bandAssets.set(asset, bands);
  }
  return bands;
};
var ids = /* @__PURE__ */ new WeakMap();
var nextId = 1;
var idOf = (o) => {
  if (!o) return 0;
  let id = ids.get(o);
  if (!id) ids.set(o, id = nextId++);
  return id;
};
var listKey = (list) => list ? list.map((v) => typeof v === "number" ? v : `${v.start}:${v.end}`).join(",") : "";
function createWaveformEngine(canvas, get) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {
  } };
  const readDpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
  let dpr = readDpr();
  let W = 0;
  let H = 0;
  let cy = 0;
  let amp = 0;
  let pk = { min: new Float32Array(1), max: new Float32Array(1) };
  let lastInset = 0;
  const syncSize = (width, height, inset = 0) => {
    dpr = readDpr();
    const nw = Math.round(width * dpr);
    const nh = Math.round(height * dpr);
    if (nw === W && nh === H && inset === lastInset) return;
    W = canvas.width = nw;
    H = canvas.height = nh;
    lastInset = inset;
    cy = H / 2;
    amp = Math.max(0, H / 2 - inset * dpr) * 0.84;
    pk = { min: new Float32Array(W), max: new Float32Array(W) };
  };
  let drawn = [];
  let drawnToken = 0;
  let lastAsset;
  let lastBands = false;
  const syncAssets = (asset, bands, source) => {
    if (asset === lastAsset && bands === lastBands) return;
    lastAsset = asset;
    lastBands = bands;
    const token = ++drawnToken;
    drawn = asset ? [asset] : [];
    if (!asset || !bands || !source || typeof OfflineAudioContext === "undefined") return;
    bandsFor(asset, source).then(
      (split) => {
        if (token === drawnToken) drawn = split;
      },
      // Offline render failed (e.g. memory pressure) — keep the plain wave.
      () => {
      }
    );
  };
  const columnWidth = (pixelSize) => Math.max(1, Math.round(dpr) * Math.max(1, Math.round(pixelSize)));
  const windowState = { start: 0, win: 1 };
  let pieces = [{ a: 0, b: 1, x0: 0, x1: 0 }];
  let gapPx = 0;
  const layoutPieces = (start, win, cuts, gap) => {
    const end = start + win;
    const inside = (cuts ?? []).filter((c) => c > start && c < end).sort((x, y) => x - y);
    gapPx = inside.length ? Math.round(gap * dpr) : 0;
    let waveW = W - inside.length * gapPx;
    if (waveW < inside.length + 1) {
      inside.length = 0;
      gapPx = 0;
      waveW = W;
    }
    const bounds = [start, ...inside, end];
    pieces = [];
    for (let i = 0; i + 1 < bounds.length; i++) {
      const a = bounds[i];
      const b = bounds[i + 1];
      pieces.push({
        a,
        b,
        x0: (a - start) / win * waveW + i * gapPx,
        x1: (b - start) / win * waveW + i * gapPx
      });
    }
  };
  const xOfPos = (p) => {
    let piece = pieces[0];
    for (const it of pieces) if (p >= it.a) piece = it;
    const span = piece.b - piece.a;
    return piece.x0 + (span > 0 ? (p - piece.a) / span * (piece.x1 - piece.x0) : 0);
  };
  let dc = ctx;
  let drag = null;
  const drawColumns = (p, cols, x0, color, pixelSize, striped) => {
    const colW = columnWidth(pixelSize);
    dc.fillStyle = color;
    dc.globalAlpha = 1;
    const stretch = striped ? WAVEFORM_STRIPE_STRETCH : 1;
    for (const bar of barPeaks(p, Math.floor(cols / stretch), colW)) {
      const yTop = Math.round(cy - bar.max * amp);
      const yBot = Math.round(cy - bar.min * amp);
      dc.fillRect(x0 + bar.x * stretch, yTop, colW, Math.max(1, yBot - yTop));
    }
  };
  const drawSimplified = (env, x0, x1, color, outline2) => {
    const n = env.length;
    if (n < 2) return;
    const top = env.map((p) => ({ x: p.x, y: cy - p.amp * amp }));
    const bot = [];
    for (let k = n - 1; k >= 0; k--) bot.push({ x: env[k].x, y: cy + env[k].amp * amp });
    dc.save();
    dc.beginPath();
    dc.rect(x0, 0, x1 - x0, H);
    dc.clip();
    dc.beginPath();
    dc.moveTo(top[0].x, top[0].y);
    smoothThrough(dc, top);
    dc.lineTo(bot[0].x, bot[0].y);
    smoothThrough(dc, bot);
    dc.closePath();
    dc.fillStyle = color;
    if (outline2) {
      dc.globalAlpha = BORDER_FILL_ALPHA;
      dc.fill();
      dc.globalAlpha = 1;
      dc.strokeStyle = color;
      dc.lineWidth = 1.6 * dpr;
      dc.lineJoin = "round";
      dc.stroke();
    } else {
      dc.globalAlpha = 1;
      dc.fill();
    }
    dc.restore();
  };
  const drawGaps = (color, radius) => {
    if (!gapPx || pieces.length < 2) return;
    const r = Math.min(radius * dpr, gapPx * 2, H / 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    const corner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y);
      ctx.arc(x + dx, y + dy, r, dy > 0 ? -Math.PI / 2 : Math.PI / 2, dx > 0 ? Math.PI : 0, dx > 0 === dy > 0);
      ctx.lineTo(x, y + dy);
      ctx.closePath();
      ctx.fill();
    };
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (i > 0) {
        corner(piece.x0, 0, r, r);
        corner(piece.x0, H, r, -r);
      }
      if (i + 1 < pieces.length) {
        ctx.fillRect(piece.x1, 0, gapPx, H);
        corner(piece.x1, 0, -r, r);
        corner(piece.x1, H, -r, -r);
      }
    }
  };
  const drawGrid = (base, subs) => {
    const n = Math.max(1, Math.round(subs));
    dc.strokeStyle = base;
    dc.globalAlpha = 0.1;
    dc.lineWidth = dpr;
    dc.beginPath();
    for (let i = 1; i < n; i++) {
      const x = Math.round(i / n * W) + 0.5;
      dc.moveTo(x, 0);
      dc.lineTo(x, H);
    }
    dc.stroke();
    dc.globalAlpha = 1;
  };
  const drawRegion = (a, b, color) => {
    const { start, win } = windowState;
    const x0 = a <= start ? -1 : a >= start + win ? W + 1 : xOfPos(a);
    const x1 = b <= start ? -1 : b >= start + win ? W + 1 : xOfPos(b);
    const cx0 = Math.max(0, x0);
    const cx1 = Math.min(W, x1);
    if (cx1 <= cx0) return;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(cx0, 0, cx1 - cx0, H);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = dpr;
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (x0 >= 0 && x0 <= W) {
      const xe = Math.round(x0) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    if (x1 >= 0 && x1 <= W) {
      const xe = Math.round(x1) + 0.5;
      ctx.moveTo(xe, 0);
      ctx.lineTo(xe, H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const drawWave = (g, rt, base, wave, ranges, played) => {
    dc = g;
    g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = rt.mode === "smooth";
    if (rt.grid) drawGrid(base, rt.gridSubdivisions);
    if (rt.baseline) {
      g.strokeStyle = base;
      g.globalAlpha = 0.15;
      g.lineWidth = dpr;
      g.beginPath();
      g.moveTo(0, Math.round(cy) + 0.5);
      g.lineTo(W, Math.round(cy) + 0.5);
      g.stroke();
      g.globalAlpha = 1;
    }
    const count = drawn.length;
    const striped = rt.mode === "striped";
    for (let i = 0; i < count; i++) {
      const color = count === 3 ? BAND_COLORS[i] : wave;
      for (const piece of pieces) {
        const cols = Math.max(1, Math.round(piece.x1) - Math.round(piece.x0));
        const x0 = Math.round(piece.x0);
        if (rt.mode === "smooth") {
          const seg = windowState.win * played / (rt.smoothPoints || WAVEFORM_SMOOTH_POINTS);
          const t0 = piece.a * played;
          const span = Math.max(1e-9, piece.b * played - t0);
          const env = rangeEnvelope(drawn[i], ranges, t0, piece.b * played, seg).map((p) => ({
            x: x0 + (p.t - t0) / span * cols,
            amp: p.amp
          }));
          drawSimplified(env, x0, x0 + cols, color, rt.border);
          continue;
        }
        const pmin = pk.min.subarray(0, cols);
        const pmax = pk.max.subarray(0, cols);
        const read2 = striped ? Math.max(1, Math.floor(cols / WAVEFORM_STRIPE_STRETCH)) : cols;
        fillRangePeaks(drawn[i], ranges, piece.a * played, piece.b * played, read2, pmin, pmax);
        drawColumns({ min: pmin, max: pmax }, cols, x0, color, rt.pixelSize, striped);
      }
    }
    g.globalAlpha = 1;
    dc = ctx;
  };
  const layer = document.createElement("canvas");
  const lctx = layer.getContext("2d");
  let waveKey = "";
  let frameKey = "";
  let rangesRef;
  let rangesSig = "";
  let cutsRef;
  let cutsSig = "";
  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const rt = get();
    syncSize(rt.width, rt.height, Math.max(0, rt.waveInset || 0));
    const asset = rt.asset ?? (rt.buffer ? assetFor(rt.buffer) : null);
    syncAssets(asset, rt.bands, rt.bandSource ?? rt.buffer);
    const ranges = asset ? playedRanges(asset, rt.ranges) : [];
    const played = rangesDuration(ranges);
    if (rt.ranges !== rangesRef) {
      rangesRef = rt.ranges;
      rangesSig = listKey(rt.ranges);
    }
    if (rt.cuts !== cutsRef) {
      cutsRef = rt.cuts;
      cutsSig = listKey(rt.cuts);
    }
    const base = getComputedStyle(canvas).color || "rgb(255,255,255)";
    const wave = rt.waveColor || base;
    const ph = rt.playheadColor || base;
    const prog = Math.max(0, Math.min(1, (rt.getProgress ? rt.getProgress() : rt.progress) || 0));
    let win;
    let start;
    const activeLoop = rt.autoZoomOnLoop ? rt.loop : null;
    if (activeLoop) {
      const span = Math.max(1e-4, activeLoop.end - activeLoop.start);
      win = Math.min(1, Math.max(1 / WAVEFORM_MAX_ZOOM, span * 1.2));
      start = (activeLoop.start + activeLoop.end) / 2 - win / 2;
    } else {
      win = 1 / Math.max(1, rt.zoom) / (rt.mode === "striped" ? WAVEFORM_STRIPE_STRETCH : 1);
      start = prog - win / 2;
    }
    if (start < 0) start = 0;
    else if (start > 1 - win) start = 1 - win;
    windowState.start = start;
    windowState.win = win;
    const nextWaveKey = [
      W,
      H,
      dpr,
      lastInset,
      drawn.map(idOf).join("."),
      rangesSig,
      cutsSig,
      rt.gap ?? WAVEFORM_GAP,
      rt.mode,
      rt.pixelSize,
      rt.border,
      rt.grid,
      rt.gridSubdivisions,
      rt.baseline,
      rt.smoothPoints,
      base,
      wave,
      start,
      win
    ].join("|");
    const region = drag && drag.moved ? [Math.min(drag.anchor, drag.curProg), Math.max(drag.anchor, drag.curProg)] : rt.loop ? [rt.loop.start, rt.loop.end] : null;
    if (nextWaveKey !== waveKey) layoutPieces(start, win, rt.cuts, rt.gap ?? WAVEFORM_GAP);
    const playX = drawn.length ? Math.round(Math.max(0, Math.min(W, xOfPos(prog)))) : -1;
    const nextFrameKey = [nextWaveKey, region?.join(":"), ph, rt.gapColor, rt.gapRadius, playX].join("|");
    if (nextFrameKey === frameKey) return;
    frameKey = nextFrameKey;
    if (nextWaveKey !== waveKey && lctx) {
      waveKey = nextWaveKey;
      if (layer.width !== W || layer.height !== H) {
        layer.width = W;
        layer.height = H;
      }
      drawWave(lctx, rt, base, wave, ranges, played);
    }
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (W > 0 && H > 0) ctx.drawImage(layer, 0, 0);
    if (region) drawRegion(region[0], region[1], ph);
    drawGaps(rt.gapColor || "#1e1e1e", rt.gapRadius ?? WAVEFORM_GAP_RADIUS);
    if (playX >= 0) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ph;
      ctx.lineWidth = 1.5 * dpr;
      const cxp = playX + 0.5;
      ctx.beginPath();
      ctx.moveTo(cxp, 0);
      ctx.lineTo(cxp, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  const xToProgress = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const x = fx * W;
    const { start, win } = windowState;
    let piece = pieces[pieces.length - 1];
    for (const it of pieces) {
      if (x <= it.x1) {
        piece = it;
        break;
      }
    }
    const span = piece.x1 - piece.x0;
    const t = span > 0 ? Math.min(1, Math.max(0, (x - piece.x0) / span)) : 0;
    return Math.min(1, Math.max(0, Math.min(start + win, piece.a + t * (piece.b - piece.a))));
  };
  const edgeAt2 = (clientX) => {
    const rt = get();
    const loop = rt.loop;
    if (!loop || !rt.onLoopChange) return null;
    const rect = canvas.getBoundingClientRect();
    const xOf = (t) => xOfPos(t) / Math.max(1, W) * rect.width;
    const px = clientX - rect.left;
    const sx = xOf(loop.start);
    const ex = xOf(loop.end);
    const dS = Math.abs(px - sx);
    const dE = Math.abs(px - ex);
    if (dS <= EDGE_HIT2 && dS <= dE && sx >= 0 && sx <= rect.width) return "start";
    if (dE <= EDGE_HIT2 && ex >= 0 && ex <= rect.width) return "end";
    return null;
  };
  const setCursor = (c) => {
    canvas.style.cursor = c;
  };
  const onPointerDown = (e) => {
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
    }
    const p = xToProgress(e.clientX);
    const edge = edgeAt2(e.clientX);
    if (edge && rt.loop) {
      const anchor = edge === "start" ? rt.loop.end : rt.loop.start;
      drag = { mode: "resize", anchor, curProg: p, startX: e.clientX, moved: false };
      setCursor("ew-resize");
    } else {
      drag = { mode: "create", anchor: p, curProg: p, startX: e.clientX, moved: false };
    }
  };
  const onPointerMove = (e) => {
    if (drag) {
      drag.curProg = xToProgress(e.clientX);
      if (Math.abs(e.clientX - drag.startX) > DRAG_THRESHOLD2) drag.moved = true;
      return;
    }
    const rt = get();
    if (!rt.onSeek && !rt.onLoopChange) return;
    setCursor(edgeAt2(e.clientX) ? "ew-resize" : "crosshair");
  };
  const onPointerUp = (e) => {
    const d = drag;
    drag = null;
    if (!d) return;
    try {
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    } catch {
    }
    setCursor("crosshair");
    const rt = get();
    const a = Math.min(d.anchor, d.curProg);
    const b = Math.max(d.anchor, d.curProg);
    const wide = b - a >= MIN_LOOP;
    if (d.mode === "resize") {
      if (d.moved && wide) rt.onLoopChange?.({ start: a, end: b });
    } else if (d.moved && wide) {
      if (rt.onLoopChange) rt.onLoopChange({ start: a, end: b });
      else rt.onSeek?.(d.curProg);
    } else {
      rt.onSeek?.(d.anchor);
      if (rt.loop && rt.onLoopChange) rt.onLoopChange(null);
    }
  };
  const onPointerCancel = () => {
    drag = null;
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("lostpointercapture", onPointerCancel);
  const rt0 = get();
  if (rt0.onSeek || rt0.onLoopChange) {
    canvas.style.cursor = "crosshair";
    canvas.style.touchAction = "none";
  }
  frame();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      drawnToken++;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("lostpointercapture", onPointerCancel);
    }
  };
}

// src/components/WaveformVisualization.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function WaveformVisualization({
  buffer = null,
  asset = null,
  ranges = null,
  progress = 0,
  getProgress,
  mode = "smooth",
  border = false,
  bands = false,
  pixelSize = 1,
  grid = false,
  gridSubdivisions = 8,
  onSeek,
  loop = null,
  cuts,
  gapColor,
  gap,
  gapRadius,
  onLoopChange,
  waveColor,
  playheadColor,
  baseline = true,
  smoothPoints = WAVEFORM_SMOOTH_POINTS,
  waveInset = 0,
  autoZoomOnLoop = false,
  zoom: zoomProp,
  width = 256,
  height = 140
}) {
  const canvasRef = (0, import_react6.useRef)(null);
  const [ownZoom, setOwnZoom] = (0, import_react6.useState)(1);
  const controlled = zoomProp !== void 0;
  const zoom = controlled ? Math.max(1, zoomProp) : ownZoom;
  const setZoom = setOwnZoom;
  const runtimeRef = (0, import_react6.useRef)(null);
  runtimeRef.current = {
    buffer: asset ? null : buffer,
    asset,
    ranges,
    bandSource: buffer,
    progress,
    getProgress,
    mode,
    border,
    bands,
    pixelSize,
    grid,
    gridSubdivisions,
    waveColor,
    playheadColor,
    baseline,
    smoothPoints,
    waveInset,
    autoZoomOnLoop,
    loop,
    cuts,
    gapColor,
    gap,
    gapRadius,
    zoom,
    width,
    height,
    onSeek,
    onLoopChange
  };
  (0, import_react6.useEffect)(() => {
    if (!canvasRef.current) return;
    const engine = createWaveformEngine(canvasRef.current, () => runtimeRef.current);
    return () => engine.destroy();
  }, []);
  const atMaxZoom = zoom >= WAVEFORM_MAX_ZOOM;
  const framingLoop = autoZoomOnLoop && !!loop || controlled;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "tweakers-waveform-viz-wrap", style: { width }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("canvas", { ref: canvasRef, className: "tweakers-waveform-viz", style: { width, height } }),
    !framingLoop && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "tweakers-waveform-zoom", children: [
      zoom > 1 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", "aria-label": "Zoom out", onClick: () => setZoom((z) => Math.max(1, z / 2)), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M3.5 8h9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          "aria-label": "Zoom in",
          disabled: atMaxZoom,
          onClick: () => setZoom((z) => Math.min(WAVEFORM_MAX_ZOOM, z * 2)),
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M8 3.5v9M3.5 8h9", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) })
        }
      )
    ] })
  ] });
}

// src/move-surface-store.ts
var import_TweakStore5 = require("tweakers/store");
var moveScreenRowLabel = (row) => typeof row === "string" ? row : row.label;
var moveScreenRowSearchText = (row) => typeof row === "string" || !row.keywords ? moveScreenRowLabel(row) : `${row.label} ${row.keywords}`;
var moveScreenChecked = (rows) => rows.flatMap((row, i) => typeof row !== "string" && row.checked ? [i] : []);
var EMPTY = { rows: 0, pads: [], padsLabel: null, steps: null, screen: null, search: null, wait: null };
var state = EMPTY;
var listeners = /* @__PURE__ */ new Set();
var pressListeners = /* @__PURE__ */ new Set();
var screenSelectListeners = /* @__PURE__ */ new Set();
var stepListeners = /* @__PURE__ */ new Set();
var emit = () => {
  for (const fn of listeners) fn();
};
function patch(key, value) {
  if (JSON.stringify(state[key]) === JSON.stringify(value)) return;
  state = { ...state, [key]: value };
  emit();
}
var used = () => import_TweakStore5.TweakStore.noteMoveKitUse("surface");
var validPads = (pads) => pads.filter((p) => p.x >= 0 && p.x < 8 && (p.y === 0 || p.y === 1));
function patchPadRows(rows, pads, label) {
  const nextPads = validPads(pads);
  const nextLabel = label === void 0 ? state.padsLabel : label;
  if (state.rows === rows && state.padsLabel === nextLabel && JSON.stringify(state.pads) === JSON.stringify(nextPads)) return;
  state = { ...state, rows, pads: nextPads, padsLabel: nextLabel };
  emit();
}
var MoveSurfaceStore = {
  getState: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** How many bottom pad rows the app took (matches `claims.pads` on the wire). */
  claimRows(rows) {
    if (rows > 0) used();
    patch("rows", rows);
  },
  setPads(pads) {
    if (pads.length) used();
    patch("pads", validPads(pads));
  },
  /** Publish the claimed row count and its cells as one renderable state.
   *  `label` says what the row does here — pass it whenever the meaning
   *  changes, so the panel never captions the pads with a stale phrase. */
  setPadRows(rows, pads, label) {
    if (rows > 0) used();
    patchPadRows(rows, pads, label);
  },
  /** What the claimed rows control in this view. */
  setPadsLabel(label) {
    patch("padsLabel", label);
  },
  setSteps(steps) {
    if (steps) used();
    patch("steps", steps === null ? null : steps.filter((s) => s.step >= 0 && s.step < 16));
  },
  setScreen(screen) {
    if (screen) used();
    patch("screen", screen);
  },
  /** The wait over the view — MoveViews's to write. */
  setWait(wait) {
    if (wait) used();
    patch("wait", wait);
  },
  /** The search narrowing the wheel list — MoveSearchStore's to write. */
  setSearch(search) {
    patch("search", search);
  },
  /** Selection intent from the panel's wheel screen; the host owns the value,
   *  exactly as it owns what a hardware wheel turn means. */
  onScreenSelect(fn) {
    screenSelectListeners.add(fn);
    return () => screenSelectListeners.delete(fn);
  },
  selectScreen(index) {
    if (!state.screen || !Number.isInteger(index) || index < 0 || index >= state.screen.items.length) return;
    for (const fn of screenSelectListeners) fn(index);
  },
  /** A tap on an on-screen pad, for the host to treat like a hardware press. */
  onPress(fn) {
    pressListeners.add(fn);
    return () => pressListeners.delete(fn);
  },
  press(x, y, shift = false) {
    for (const fn of pressListeners) fn({ x, y, shift });
  },
  /** The sixteen step buttons, taken by the app for as long as a listener is
   *  attached: a press arrives here instead of reaching the modulation slots
   *  or the waveform's loop, and `setSteps` is what they show — the lit cell
   *  bright, the others it names dim. Detaching the last listener hands the
   *  row back. */
  onStep(fn) {
    used();
    stepListeners.add(fn);
    if (stepListeners.size === 1) emit();
    return () => {
      if (!stepListeners.delete(fn)) return;
      if (!stepListeners.size) emit();
    };
  },
  /** Whether the app holds the step row right now. */
  ownsSteps: () => stepListeners.size > 0,
  /** A step press — from the hardware or an on-screen circle — for the app
   *  that holds the row. */
  pressStep(index, shift = false) {
    if (!Number.isInteger(index) || index < 0 || index > 15) return;
    for (const fn of stepListeners) fn({ index, shift });
  },
  /** Hand the whole surface back — the panel returns to its plain layout. */
  reset() {
    if (state === EMPTY) return;
    state = EMPTY;
    emit();
  }
};

// src/move-volume.ts
var import_TweakStore6 = require("tweakers/store");
var MoveVolumeDisplayClass = class {
  constructor() {
    this.state = null;
    this.listeners = /* @__PURE__ */ new Set();
  }
  /** Show the pill with this readout — replaces any previous one. */
  set(state4) {
    import_TweakStore6.TweakStore.noteMoveKitUse("volume");
    this.state = state4;
    this.notify();
  }
  /** Hide the pill. */
  clear() {
    this.state = null;
    this.notify();
  }
  /** The current readout, or null when the pill is hidden. */
  get() {
    return this.state;
  }
  /** Notified when the readout is set or cleared. */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notify() {
    for (const l of this.listeners) l();
  }
};
var MoveVolumeDisplay = new MoveVolumeDisplayClass();

// src/move-waveform.ts
var import_TweakStore7 = require("tweakers/store");
var MOVE_WAVE_FRAME = 12;
var MOVE_WAVE_MAX_WIDTH = 1200;
var MOVE_WAVE_MAX_HEIGHT = 176;
var MOVE_WAVE_MAX_DISPLAY = MOVE_WAVE_MAX_HEIGHT - 2 * MOVE_WAVE_FRAME;
var MOVE_WAVEFORM_PANEL = "move-waveform";
var MOVE_WAVEFORM_PIXEL_RANGE = [1, 6];
var MODE_LABELS = { smooth: "Smooth", pixelated: "Pixel", striped: "Striped" };
var clampPixelSize = (v) => Math.min(MOVE_WAVEFORM_PIXEL_RANGE[1], Math.max(MOVE_WAVEFORM_PIXEL_RANGE[0], Math.round(v)));
function defaultStyle() {
  return { mode: "pixelated", pixelSize: 2, grid: false, bands: false, baseline: true };
}
function styleFromValues(values, base) {
  if (!values) return base;
  const mode = WAVEFORM_MODES.find((m) => m === values.style) ?? base.mode;
  const size = typeof values.resolution === "number" && Number.isFinite(values.resolution) ? clampPixelSize(values.resolution) : base.pixelSize;
  const flag = (v, fallback) => typeof v === "boolean" ? v : fallback;
  return {
    mode,
    pixelSize: size,
    grid: flag(values.grid, base.grid),
    bands: flag(values.bands, base.bands),
    baseline: flag(values.baseline, base.baseline)
  };
}
var MOVE_WAVEFORM_STEPS = 16;
var MOVE_WAVEFORM_PADS = 8;
var SCRUB_PER_DETENT = 25e-5;
var SCRUB_FINE = 5e-5;
var SCRUB_ACCEL = 1.2;
var SCRUB_MAX_BATCH = 24;
var SCRUB_MIN_MS = 25;
var SCRUB_FINE_MIN_MS = 5;
var SCRUB_CHAIN_MS = 250;
var ZOOM_PER_DETENT = 0.08;
var clamp015 = (v) => Math.min(1, Math.max(0, v));
function defaultView() {
  return { position: 0, zoom: 1, loop: null, loopAnchor: null };
}
function scrubBy(position, delta, fine = false, zoom = 1, durationSec) {
  const detents = Math.min(SCRUB_MAX_BATCH, Math.abs(delta));
  const magnitude = fine ? detents : Math.pow(detents, SCRUB_ACCEL);
  const share = fine ? SCRUB_FINE : SCRUB_PER_DETENT;
  const floor = durationSec && durationSec > 0 ? (fine ? SCRUB_FINE_MIN_MS : SCRUB_MIN_MS) / 1e3 / durationSec : 0;
  const step = Math.max(share, floor) / Math.max(1, zoom);
  const next = clamp015(position + Math.sign(delta) * magnitude * step);
  return Number(next.toFixed(6));
}
function zoomBy(zoom, delta) {
  const next = zoom * Math.pow(1 + ZOOM_PER_DETENT, delta);
  return Number(Math.min(WAVEFORM_MAX_ZOOM, Math.max(1, next)).toFixed(6));
}
var stepPosition = (index, steps = MOVE_WAVEFORM_STEPS) => Math.min(1, Math.max(0, index / Math.max(1, steps)));
function loopFromStep(view, index, steps = MOVE_WAVEFORM_STEPS) {
  if (view.loopAnchor === null || view.loop) {
    return { loop: null, loopAnchor: index };
  }
  if (index === view.loopAnchor) {
    return { loop: null, loopAnchor: null };
  }
  const a = Math.min(view.loopAnchor, index);
  const b = Math.max(view.loopAnchor, index);
  return {
    loop: { start: stepPosition(a, steps), end: stepPosition(b + 1, steps) },
    loopAnchor: null
  };
}
function visibleWindow(position, zoom) {
  const span = 1 / Math.max(1, zoom);
  let start = clamp015(position) - span / 2;
  if (start < 0) start = 0;
  else if (start > 1 - span) start = 1 - span;
  return { start, span };
}
var padPosition = (window2, index, pads = MOVE_WAVEFORM_PADS) => clamp015(window2.start + Math.min(pads - 1, Math.max(0, index)) / pads * window2.span);
function padSection(window2, index, pads = MOVE_WAVEFORM_PADS) {
  const start = padPosition(window2, index, pads);
  return { start, end: clamp015(start + window2.span / pads) };
}
function loopSteps(view, steps = MOVE_WAVEFORM_STEPS) {
  if (view.loop) {
    const from = Math.floor(view.loop.start * steps);
    const to = Math.ceil(view.loop.end * steps) - 1;
    const lit = [];
    for (let i = Math.max(0, from); i <= Math.min(steps - 1, to); i++) lit.push(i);
    return lit;
  }
  return view.loopAnchor === null ? [] : [view.loopAnchor];
}
var MoveWaveformStoreClass = class {
  constructor() {
    this.view = defaultView();
    /** Live claims — the app's display and the room's preview can both be up. */
    this.claims = 0;
    this.buffer = null;
    this.editor = false;
    this.progressSource = null;
    this.duration = null;
    this.transport = null;
    this.lastScrubAt = 0;
    this.listeners = /* @__PURE__ */ new Set();
    this.version = 0;
  }
  /**
   * Claim the wheel, the volume knob and the step row. Returns the release.
   * The first claim also puts the kit's Waveform page in the settings room,
   * seeded with the app's own look (`style`); the page stays once it is
   * there — a room does not lose a page because the display it dresses is
   * off screen for a moment — and its saved values win over the seed.
   */
  register(style) {
    import_TweakStore7.TweakStore.noteMoveKitUse("waveform");
    this.claims += 1;
    if (this.claims === 1) this.lastScrubAt = 0;
    this.ensureSettings(style);
    if (this.claims === 1) MoveVolumeDisplay.set({ label: "time", getValue: () => this.readout() });
    this.notify();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.claims -= 1;
      if (this.claims > 0) {
        this.notify();
        return;
      }
      this.editor = false;
      this.progressSource = null;
      this.duration = null;
      this.transport = null;
      this.buffer = null;
      this.view = defaultView();
      MoveVolumeDisplay.clear();
      this.notify();
    };
  }
  /** The host's transport, for the clock to wear; null when it runs none. */
  setTransport(transport) {
    if (transport?.playing === this.transport?.playing && transport?.loopOn === this.transport?.loopOn && transport === null === (this.transport === null)) return;
    this.transport = transport;
    this.notify();
  }
  getTransport() {
    return this.transport;
  }
  /** A turn of the knob in progress: its last detent landed within the chain window. */
  isScrubbing(now = Date.now()) {
    return now - this.lastScrubAt < SCRUB_CHAIN_MS;
  }
  /** Where the playhead is right now, 0..1: the knob's landing while a turn
   *  is in progress (the engine is a beat behind it, and drawing the lag is
   *  what makes a scrub look like it stutters), else the engine's while one
   *  reports, else the last scrub. */
  playhead(now = Date.now()) {
    if (this.isScrubbing(now)) return clamp015(this.view.position);
    return clamp015(this.progressSource ? this.progressSource() : this.view.position);
  }
  /** The clock the panel shows for the knob: m:ss:cc of the playhead. */
  clock() {
    const t = this.playhead() * (this.duration ?? 0);
    const cc = Math.floor(t % 1 * 100);
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(cc).padStart(2, "0")}`;
  }
  isRegistered() {
    return this.claims > 0;
  }
  /** The sample on the surface right now — what the room's preview shows. */
  setBuffer(buffer) {
    this.buffer = buffer;
    this.setDuration(buffer?.duration ?? null);
  }
  getBuffer() {
    return this.buffer;
  }
  /**
   * The kit's Waveform settings page: how the sample is drawn — the style,
   * the bar width, the grid, the EQ bands and the centre line. One hidden
   * `kit` panel that `MovePanel` shows in the settings room and the bridge
   * kit syncs like any page, so the look is set from the hardware too.
   * Idempotent: the panel puts it there at mount, a claiming waveform
   * seeds it if it gets there first, and saved values win over any seed.
   */
  ensureSettings(style) {
    if (import_TweakStore7.TweakStore.getPanel(MOVE_WAVEFORM_PANEL)) return;
    const seed = { ...defaultStyle(), ...style };
    import_TweakStore7.TweakStore.registerPanel(
      MOVE_WAVEFORM_PANEL,
      "Waveform",
      {
        style: {
          type: "select",
          default: seed.mode,
          options: WAVEFORM_MODES.map((m) => ({ value: m, label: MODE_LABELS[m] }))
        },
        // The bar width as the headline value — "2×" — the way the old
        // resolution slider read.
        resolution: {
          type: "slider",
          default: clampPixelSize(seed.pixelSize),
          min: MOVE_WAVEFORM_PIXEL_RANGE[0],
          max: MOVE_WAVEFORM_PIXEL_RANGE[1],
          step: 1,
          formatValue: (v) => `${Math.round(v)}\xD7`
        },
        // The three overlays as pictures with a state badge — what each
        // switch is about, and whether it is on.
        grid: { type: "toggle", default: seed.grid, moveSlot: true, icon: "grid-2x2" },
        bands: { type: "toggle", default: seed.bands, moveSlot: true, label: "EQ bands", icon: "audio-lines" },
        baseline: { type: "toggle", default: seed.baseline, moveSlot: true, label: "Centre line", icon: "activity" }
      },
      void 0,
      { kind: "kit", persist: true }
    );
    const saved = import_TweakStore7.TweakStore.getValues(MOVE_WAVEFORM_PANEL);
    if (typeof saved.resolution !== "number") import_TweakStore7.TweakStore.updateValue(MOVE_WAVEFORM_PANEL, "resolution", clampPixelSize(seed.pixelSize));
  }
  /**
   * The zoom the display is really at: striped bars stretch the wave, so
   * the shown window is that much narrower than the view's zoom says. The
   * pads and the small screens frame by this, so they show what the card
   * shows.
   */
  shownZoom() {
    return this.view.zoom * (this.getStyle().mode === "striped" ? WAVEFORM_STRIPE_STRETCH : 1);
  }
  /** The look the settings page holds right now (the defaults until one is registered). */
  getStyle() {
    return styleFromValues(import_TweakStore7.TweakStore.getPanel(MOVE_WAVEFORM_PANEL) && import_TweakStore7.TweakStore.getValues(MOVE_WAVEFORM_PANEL), defaultStyle());
  }
  /** The settings page's values, a stable snapshot per change — for `useSyncExternalStore`. */
  getStyleSnapshot() {
    return import_TweakStore7.TweakStore.getValues(MOVE_WAVEFORM_PANEL);
  }
  subscribeStyle(fn) {
    return import_TweakStore7.TweakStore.subscribe(MOVE_WAVEFORM_PANEL, fn);
  }
  /**
   * Editor mode — the floating waveform is up and owns the whole surface:
   * every step is the loop bar (a slot's own step included), and the bottom
   * pad row addresses the shown window. Off, the waveform keeps its polite
   * claims: the wheel, the knob, and only the steps nobody else holds.
   */
  setEditor(on) {
    if (this.editor === on) return;
    this.editor = on;
    this.notify();
  }
  /** The kit routes every step press here while the editor is up. */
  wantsSteps() {
    return this.claims > 0 && this.editor;
  }
  /** The kit claims and routes the bottom pad row while the editor is up. */
  wantsPads() {
    return this.claims > 0 && this.editor;
  }
  /**
   * Where the playhead actually is, for framing — during playback the shown
   * window follows the engine's position, not the last scrub. The editor
   * mount provides it; without one the scrub position stands in.
   */
  setProgressSource(fn) {
    this.progressSource = fn;
  }
  /**
   * How long the sample is, in seconds. With it the volume readout counts
   * real time; without it the same readout is a percentage of the sample,
   * which is still true — a position always reads as something.
   */
  setDuration(seconds) {
    this.duration = seconds != null && seconds > 0 && Number.isFinite(seconds) ? seconds : null;
  }
  /** What the volume knob is editing right now, ready to print. */
  readout() {
    const at2 = this.playhead();
    if (this.duration === null) return `${Math.round(at2 * 100)}%`;
    const total = at2 * this.duration;
    const minutes = Math.floor(total / 60);
    const seconds = total - minutes * 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(1)}`;
  }
  getView() {
    return this.view;
  }
  getVersion() {
    return this.version;
  }
  /** Patch the view. A patch that changes nothing notifies nobody. */
  setView(patch2) {
    const next = { ...this.view, ...patch2 };
    if (next.position === this.view.position && next.zoom === this.view.zoom && next.loopAnchor === this.view.loopAnchor && next.loop?.start === this.view.loop?.start && next.loop?.end === this.view.loop?.end) {
      return;
    }
    this.view = next;
    this.notify();
  }
  /** A detent moves the playhead from where it is — the engine's position
   *  while one reports, so a scrub mid-play carries on from the play, never
   *  from the spot an earlier scrub left. Within a turn the detents chain
   *  from each other: the engine's seek lands a beat later than the knob
   *  turns, and a turn read against it would lose every detent but the first. */
  scrub(delta, fine = false, now = Date.now()) {
    const from = this.playhead(now);
    this.lastScrubAt = now;
    this.setView({ position: scrubBy(from, delta, fine, this.view.zoom, this.duration ?? void 0) });
  }
  zoom(delta) {
    this.setView({ zoom: zoomBy(this.view.zoom, delta) });
  }
  /** A step press marks the loop — unless an app holds the step row
   *  (MoveSurfaceStore.onStep), in which case the press is the app's. Routing
   *  it here too means a kit that predates app-owned steps, which sends every
   *  step to the waveform, still reaches the app. */
  pressStep(index) {
    if (MoveSurfaceStore.ownsSteps()) {
      MoveSurfaceStore.pressStep(index);
      return;
    }
    this.setView(loopFromStep(this.view, index));
  }
  /** A held step lets the loop go — the remove gesture, from any step. */
  holdStep(index) {
    if (MoveSurfaceStore.ownsSteps()) {
      MoveSurfaceStore.pressStep(index);
      return;
    }
    this.clearLoop();
  }
  /**
   * The bottom pad row, over the shown window: a tap jumps the playhead to
   * that subdivision (preview it), a hold selects it as the loop.
   */
  pressPad(index, hold = false) {
    const at2 = this.progressSource ? clamp015(this.progressSource()) : this.view.position;
    const window2 = visibleWindow(at2, this.shownZoom());
    if (hold) this.setView({ loop: padSection(window2, index), loopAnchor: null });
    else this.setView({ position: padPosition(window2, index) });
  }
  clearLoop() {
    this.setView({ loop: null, loopAnchor: null });
  }
  /** The steps the loop covers — what the hardware lights. While an app
   *  holds the row, its lit steps instead. */
  loopSteps() {
    if (MoveSurfaceStore.ownsSteps()) return (MoveSurfaceStore.getState().steps ?? []).flatMap((cell) => cell.lit ? [cell.step] : []);
    return loopSteps(this.view);
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  notify() {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
};
var MoveWaveformStore = new MoveWaveformStoreClass();
var MOVE_WAVEFORM_DEMO_SECONDS = 4;
var demoSample = null;
function moveWaveformDemoSample() {
  if (demoSample) return demoSample;
  const rate = 44100;
  const data = new Float32Array(rate * MOVE_WAVEFORM_DEMO_SECONDS);
  let seed = 7;
  const noise = () => {
    seed = seed * 1103515245 + 12345 & 2147483647;
    return seed / 2147483647 * 2 - 1;
  };
  const beat = rate / 2;
  for (let n = 0; n < 8; n++) {
    const at2 = n * beat;
    for (let i = 0; i < rate * 0.3 && at2 + i < data.length; i++) {
      const t = i / rate;
      const f = 45 + 75 * Math.exp(-t * 30);
      data[at2 + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.9;
    }
    if (n % 2 === 1) {
      for (let i = 0; i < rate * 0.18 && at2 + i < data.length; i++) {
        const t = i / rate;
        data[at2 + i] += (noise() * 0.6 + Math.sin(2 * Math.PI * 190 * t) * 0.3) * Math.exp(-t * 22);
      }
    }
    const off = at2 + beat / 2;
    for (let i = 0; i < rate * 0.05 && off + i < data.length; i++) {
      data[off + i] += noise() * 0.25 * Math.exp(-(i / rate) * 90);
    }
  }
  demoSample = toAudioBuffer(data, rate);
  return demoSample;
}
function toAudioBuffer(data, sampleRate) {
  if (typeof AudioBuffer !== "undefined") {
    try {
      const buffer = new AudioBuffer({ length: data.length, sampleRate, numberOfChannels: 1 });
      buffer.copyToChannel(data, 0);
      return buffer;
    } catch {
    }
  }
  return {
    numberOfChannels: 1,
    length: data.length,
    duration: data.length / sampleRate,
    sampleRate,
    getChannelData: () => data
  };
}

// src/env.ts
var import_meta = {};
var isDevDefault = typeof process !== "undefined" && process?.env?.NODE_ENV ? process.env.NODE_ENV !== "production" : typeof import_meta !== "undefined" && import_meta.env?.MODE ? import_meta.env.MODE !== "production" : true;

// src/components/MoveWaveform.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var SLOT_HEIGHT = 140;
var DISPLAY_HEIGHT = 128;
var WAVE_INK = "#1e1e1e";
var DEFAULT_ACCENT = "#3d9bff";
var SLOT_ZOOM = 4;
var DOCK_GAP = 14;
function MoveWaveform({
  buffer = null,
  asset = null,
  ranges = null,
  variant = "page",
  getProgress,
  progress,
  onSeek,
  onLoopChange,
  transport,
  accent = DEFAULT_ACCENT,
  cuts,
  mode = "smooth",
  pixelSize = 2,
  grid = false,
  bands = false,
  waveColor = WAVE_INK,
  playheadColor,
  baseline = false,
  smoothPoints = 200,
  waveInset,
  height,
  children,
  theme = "system",
  productionEnabled = isDevDefault,
  className
}) {
  const hostRef = (0, import_react7.useRef)(null);
  const [width, setWidth] = (0, import_react7.useState)(0);
  const [dockBottom, setDockBottom] = (0, import_react7.useState)(0);
  const [mounted, setMounted] = (0, import_react7.useState)(false);
  const seekRef = (0, import_react7.useRef)(onSeek);
  seekRef.current = onSeek;
  const loopRef = (0, import_react7.useRef)(onLoopChange);
  loopRef.current = onLoopChange;
  const seedRef = (0, import_react7.useRef)({ mode, pixelSize, grid, bands, baseline });
  (0, import_react7.useEffect)(() => {
    if (!productionEnabled) return;
    setMounted(true);
    return MoveWaveformStore.register(seedRef.current);
  }, [productionEnabled]);
  (0, import_react7.useEffect)(() => {
    if (!productionEnabled) return;
    const onJogClick = (event) => {
      if (!MoveWaveformStore.isRegistered()) return;
      event.preventDefault();
      MoveWaveformStore.setView({ zoom: 1 });
    };
    window.addEventListener("move-tweakers:jog-click", onJogClick);
    return () => window.removeEventListener("move-tweakers:jog-click", onJogClick);
  }, [productionEnabled]);
  const transportRef = (0, import_react7.useRef)(transport);
  transportRef.current = transport;
  const hasTransport = !!transport;
  (0, import_react7.useEffect)(() => {
    if (!productionEnabled || !hasTransport) return;
    const releases = [
      MoveFunctions.push("play", () => transportRef.current?.onPlay(), { label: "Play", chip: false }),
      MoveFunctions.push("loop", () => transportRef.current?.onLoop(), { label: "Loop", chip: false })
    ];
    return () => releases.forEach((release) => release());
  }, [productionEnabled, hasTransport]);
  const playing2 = transport?.playing ?? false;
  const loopOn = transport?.loopOn ?? false;
  (0, import_react7.useEffect)(() => {
    if (!productionEnabled) return;
    MoveWaveformStore.setTransport(hasTransport ? { playing: playing2, loopOn } : null);
  }, [productionEnabled, hasTransport, playing2, loopOn]);
  (0, import_react7.useEffect)(() => {
    if (!productionEnabled) return;
    const prev = MoveSurfaceStore.getState().steps;
    const paint = () => {
      if (MoveSurfaceStore.ownsSteps()) return;
      const lit = new Set(MoveWaveformStore.loopSteps());
      MoveSurfaceStore.setSteps(
        Array.from({ length: MOVE_WAVEFORM_STEPS }, (_, step) => ({ step, color: accent, lit: lit.has(step) }))
      );
    };
    paint();
    const off = MoveWaveformStore.subscribe(paint);
    return () => {
      off();
      if (!MoveSurfaceStore.ownsSteps()) MoveSurfaceStore.setSteps(prev);
    };
  }, [productionEnabled, accent]);
  const styleValues = (0, import_react7.useSyncExternalStore)(
    (0, import_react7.useCallback)((cb) => MoveWaveformStore.subscribeStyle(cb), []),
    () => MoveWaveformStore.getStyleSnapshot(),
    () => MoveWaveformStore.getStyleSnapshot()
  );
  const look = styleFromValues(styleValues, { mode, pixelSize, grid, bands, baseline });
  const playedSeconds = asset ? ranges ? rangesDuration(ranges) : asset.duration : null;
  (0, import_react7.useEffect)(() => {
    MoveWaveformStore.setBuffer(buffer);
    if (playedSeconds !== null) MoveWaveformStore.setDuration(playedSeconds);
  }, [buffer, playedSeconds]);
  const view = (0, import_react7.useSyncExternalStore)(
    (0, import_react7.useCallback)((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  const state4 = MoveWaveformStore.getView();
  const lastSent = (0, import_react7.useRef)({ position: state4.position, loop: state4.loop });
  (0, import_react7.useEffect)(() => {
    if (state4.position !== lastSent.current.position) {
      lastSent.current.position = state4.position;
      seekRef.current?.(state4.position);
    }
    if (state4.loop !== lastSent.current.loop) {
      lastSent.current.loop = state4.loop;
      loopRef.current?.(state4.loop);
    }
  }, [view, state4.position, state4.loop]);
  (0, import_react7.useEffect)(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      setWidth((prev) => prev === w ? prev : w);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [mounted, variant]);
  (0, import_react7.useEffect)(() => {
    if (variant !== "dock" || typeof window === "undefined") return;
    const measure = () => {
      const panel2 = document.querySelector(".tweakers-move-root .tweakers-move");
      const h = panel2 ? panel2.getBoundingClientRect().height : 0;
      setDockBottom(h > 0 ? h + DOCK_GAP : DOCK_GAP);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const panel = document.querySelector(".tweakers-move-root .tweakers-move");
    if (panel) ro.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [variant, mounted]);
  if (!productionEnabled) return null;
  const boxHeight = Math.min(MOVE_WAVE_MAX_DISPLAY, height ?? (variant === "slot" ? SLOT_HEIGHT : DISPLAY_HEIGHT));
  const wave = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    WaveformVisualization,
    {
      buffer,
      asset,
      ranges,
      ...getProgress ? { getProgress: () => MoveWaveformStore.isScrubbing() ? MoveWaveformStore.getView().position : getProgress() } : { progress: progress ?? state4.position },
      mode: look.mode,
      pixelSize: look.pixelSize,
      grid: look.grid,
      bands: look.bands,
      waveColor,
      playheadColor: playheadColor ?? accent,
      baseline: look.baseline,
      ...smoothPoints != null ? { smoothPoints } : {},
      ...waveInset != null ? { waveInset } : {},
      loop: state4.loop,
      cuts,
      gapColor: WAVE_INK,
      zoom: variant === "slot" ? Math.max(SLOT_ZOOM, state4.zoom) : state4.zoom,
      onSeek: (p) => MoveWaveformStore.setView({ position: p }),
      onLoopChange: (l) => MoveWaveformStore.setView({ loop: l, loopAnchor: null }),
      width: Math.max(1, width),
      height: boxHeight
    }
  );
  const body = /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      ref: hostRef,
      className: `tweakers-move-wave${className ? ` ${className}` : ""}`,
      "data-variant": variant,
      style: variant === "dock" ? { bottom: `${dockBottom}px` } : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "tweakers-move-wave-canvas", style: { height: `${boxHeight}px` }, children: [
        width > 0 && wave,
        children
      ] })
    }
  );
  if (variant !== "dock") return body;
  if (!mounted || typeof document === "undefined") return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tweakers-root tweakers-move-root", "data-theme": theme, "data-wave-dock": "true", children: body }),
    document.body
  );
}

// src/components/CurveComposer.tsx
var import_react8 = require("react");
var import_jsx_runtime8 = require("react/jsx-runtime");
function CurveComposer({
  segments,
  driver = null,
  direction = "forward",
  onSegmentsChange,
  onDriverChange,
  getPhase,
  phase = 0,
  mode = "continuous",
  triggerSteps = DEFAULT_TRIGGER_STEPS,
  onTrigger,
  selectedIndex = null,
  onSelect,
  gap = 0,
  curveColor,
  playheadColor,
  grid = false,
  gridSubdivisions = 8,
  width = 256,
  height = 140
}) {
  const layout = composerLayout(width, height, driver != null);
  const { W, totalH, mainRect, driverRect } = layout;
  const composition = (0, import_react8.useMemo)(
    () => ({ segments, driver, direction, gap }),
    [segments, driver, direction, gap]
  );
  const samplers = (0, import_react8.useMemo)(() => buildSamplers(composition), [composition]);
  const liveRef = (0, import_react8.useRef)({ composition, samplers, getPhase, phase, mode, triggerSteps });
  liveRef.current = { composition, samplers, getPhase, phase, mode, triggerSteps };
  const onTriggerRef = (0, import_react8.useRef)(onTrigger);
  onTriggerRef.current = onTrigger;
  const svgRef = (0, import_react8.useRef)(null);
  const seriesPlayheadRef = (0, import_react8.useRef)(null);
  const seriesDotRef = (0, import_react8.useRef)(null);
  const driverPlayheadRef = (0, import_react8.useRef)(null);
  const prevTrigValue = (0, import_react8.useRef)(Number.NaN);
  const [drag, setDrag] = (0, import_react8.useState)(null);
  const [hover, setHover] = (0, import_react8.useState)(null);
  const dragRef = (0, import_react8.useRef)(null);
  dragRef.current = drag;
  (0, import_react8.useEffect)(() => {
    let raf = 0;
    prevTrigValue.current = Number.NaN;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { composition: c, samplers: s, getPhase: gp, phase: p, mode: md, triggerSteps: ts } = liveRef.current;
      const u = gp ? gp() : p;
      const read2 = readComposition(c, u, s);
      const geo = playheadGeometry(read2, layout);
      if (seriesPlayheadRef.current) {
        seriesPlayheadRef.current.setAttribute("x1", String(geo.seriesX));
        seriesPlayheadRef.current.setAttribute("x2", String(geo.seriesX));
      }
      if (seriesDotRef.current) {
        seriesDotRef.current.setAttribute("cx", String(geo.dotX));
        seriesDotRef.current.setAttribute("cy", String(geo.dotY));
      }
      if (driverPlayheadRef.current) {
        driverPlayheadRef.current.setAttribute("x1", String(geo.driverX));
        driverPlayheadRef.current.setAttribute("x2", String(geo.driverX));
      }
      if (md === "trigger") {
        const prev = prevTrigValue.current;
        if (!Number.isNaN(prev)) {
          for (const idx of triggersCrossed(prev, read2.value, ts)) onTriggerRef.current?.(idx);
        }
        prevTrigValue.current = read2.value;
      } else {
        prevTrigValue.current = Number.NaN;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [W, totalH]);
  const hitLayout = () => ({ totalH, driverY: driverRect ? driverRect.y : null, gap });
  const localCoords = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { ...toLocalCoords(clientX, clientY, rect, totalH), rectW: rect.width };
  };
  const onPointerDown = (e) => {
    const { xN, py, rectW } = localCoords(e.clientX, e.clientY);
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
    }
    const header = headerHit(xN, py, segments, hitLayout());
    if (typeof header === "number") {
      setDrag({ kind: "select", index: header, startX: e.clientX, startY: e.clientY, moved: false });
      return;
    }
    const target = pointerTarget(xN, py, segments, hitLayout(), EDGE_HIT / rectW);
    if (target.kind === "driver") {
      setDrag({
        kind: "driver",
        startX: e.clientX,
        startY: e.clientY,
        baseCurvature: driver.curvature,
        baseSteepness: driver.steepness,
        moved: false
      });
    } else if (target.kind === "boundary") {
      setDrag({ kind: "boundary", index: target.index, startX: e.clientX, startY: e.clientY, base: composition, moved: false });
    } else {
      const seg = segments[target.index];
      setDrag({
        kind: "segment",
        index: target.index,
        startX: e.clientX,
        startY: e.clientY,
        baseCurvature: seg?.curvature ?? 0,
        baseSteepness: seg?.steepness ?? 0,
        moved: false
      });
    }
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) {
      const { xN, py, rectW: rectW2 } = localCoords(e.clientX, e.clientY);
      if (typeof headerHit(xN, py, segments, hitLayout()) === "number") {
        setHover({ kind: "header", index: 0 });
        return;
      }
      const t = pointerTarget(xN, py, segments, hitLayout(), EDGE_HIT / rectW2);
      setHover(t.kind === "driver" ? { kind: "driver", index: 0 } : { kind: t.kind, index: t.index });
      return;
    }
    const svgRect = svgRef.current.getBoundingClientRect();
    const rectW = svgRect.width;
    const rectH = svgRect.height;
    const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD;
    if (!moved) return;
    if (d.kind === "boundary") {
      const deltaFrac = (e.clientX - d.startX) / rectW;
      const next = redistributeWeight(d.base, d.index, deltaFrac);
      onSegmentsChange?.(next.segments);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else if (d.kind === "segment") {
      const dxFrac = (e.clientX - d.startX) / rectW;
      const dyFrac = (e.clientY - d.startY) / rectH;
      const next = applySegmentBodyDrag(composition, d.index, d.baseCurvature, d.baseSteepness, dxFrac, dyFrac);
      onSegmentsChange?.(next.segments);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else if (d.kind === "driver") {
      const dxFrac = (e.clientX - d.startX) / rectW;
      const dyFrac = (e.clientY - d.startY) / rectH;
      const next = applyDriverBodyDrag(composition, d.baseCurvature, d.baseSteepness, dxFrac, dyFrac);
      if (next.driver) onDriverChange?.(next.driver);
      if (!d.moved) setDrag({ ...d, moved: true });
    } else {
      if (!d.moved) setDrag({ ...d, moved: true });
    }
  };
  const onPointerUp = (e) => {
    const d = dragRef.current;
    setDrag(null);
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
    }
    if (!d || d.moved) return;
    if (d.kind === "select") {
      onSelect?.(d.index);
    } else if (d.kind === "driver") {
      const next = cycleDriverType(composition);
      if (next.driver) onDriverChange?.(next.driver);
    } else if (d.kind === "segment") {
      onSegmentsChange?.(cycleSegmentType(composition, d.index).segments);
    }
  };
  const onPointerCancel = (e) => {
    setDrag(null);
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
    }
  };
  const onDoubleClick = (e) => {
    const { xN, py } = localCoords(e.clientX, e.clientY);
    if (driverRect && py >= driverRect.y) return;
    onSegmentsChange?.(splitSegment(composition, segmentIndexAt(xN, segments, gap)).segments);
  };
  const activeKind = drag?.kind ?? hover?.kind;
  const cursor = activeKind === "boundary" ? "ew-resize" : activeKind === "segment" || activeKind === "driver" ? "move" : activeKind === "select" || activeKind === "header" ? "pointer" : "default";
  const interior = boundaries(segments, gap);
  const renderLaneGrid = (rect) => {
    if (!grid) return null;
    const n = Math.max(1, Math.round(gridSubdivisions));
    const lines = [];
    for (let i = 1; i < n; i++) {
      const gx = i / n * W;
      lines.push(
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("line", { x1: gx, y1: rect.y, x2: gx, y2: rect.y + rect.h, className: "tweakers-cc-grid" }, `g-${rect.y}-${i}`)
      );
    }
    return lines;
  };
  const renderLaneBg = (rect, key) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { className: "tweakers-cc-lane", x: rect.x, y: rect.y, width: rect.w, height: rect.h, rx: 8 }, key);
  const diagonal = (rect, span, key) => {
    const d = diagonalLine(rect, span, W);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("line", { className: "tweakers-cc-diagonal", x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2 }, key);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tweakers-cc-wrap", style: { width: W }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    "svg",
    {
      ref: svgRef,
      className: "tweakers-cc",
      viewBox: `0 0 ${W} ${totalH}`,
      width: W,
      height: totalH,
      style: { width: W, height: totalH, cursor, color: curveColor },
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave: () => !dragRef.current && setHover(null),
      onDoubleClick,
      children: [
        renderLaneBg(mainRect, "main-bg"),
        renderLaneGrid(mainRect),
        selectedIndex != null && selectedIndex >= 0 && selectedIndex < segments.length && (() => {
          const span = segmentSpan(segments, selectedIndex, gap);
          return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "rect",
            {
              className: "tweakers-cc-seg-selected",
              x: span[0] * W,
              y: mainRect.y,
              width: (span[1] - span[0]) * W,
              height: mainRect.h,
              rx: 8
            }
          );
        })(),
        hover?.kind === "segment" && !drag && (() => {
          const span = segmentSpan(segments, hover.index, gap);
          return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "rect",
            {
              className: "tweakers-cc-seg-hover",
              x: span[0] * W,
              y: mainRect.y,
              width: (span[1] - span[0]) * W,
              height: mainRect.h,
              rx: 8
            }
          );
        })(),
        segments.map((seg, i) => {
          const span = segmentSpan(segments, i, gap);
          return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("g", { children: [
            diagonal(mainRect, span, `diag-${i}`),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { className: "tweakers-cc-curve", d: curvePath(seg, mainRect, span, W) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", { className: "tweakers-cc-label", x: (span[0] + span[1]) * 0.5 * W, y: mainRect.y + 13, children: seg.type })
          ] }, `seg-${i}`);
        }),
        gap > 0 && timelineSlots(segments, gap).filter((slot) => slot.kind === "gap" && slot.b > slot.a).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "path",
          {
            className: "tweakers-cc-connector",
            d: connectorPath(slot, samplers, segments.length, mainRect, W)
          },
          `conn-${slot.index}`
        )),
        interior.map((bx, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "line",
          {
            className: "tweakers-cc-boundary",
            "data-active": String(
              hover?.kind === "boundary" && hover.index === i || drag?.kind === "boundary" && drag.index === i
            ),
            x1: bx * W,
            y1: mainRect.y,
            x2: bx * W,
            y2: mainRect.y + mainRect.h
          },
          `b-${i}`
        )),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("line", { ref: seriesPlayheadRef, className: "tweakers-cc-playhead", x1: 0, y1: mainRect.y, x2: 0, y2: mainRect.y + mainRect.h, style: { stroke: playheadColor } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { ref: seriesDotRef, className: "tweakers-cc-dot", cx: 0, cy: mapY(mainRect, 0), r: 3, style: { fill: playheadColor } }),
        driverRect && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
          renderLaneBg(driverRect, "driver-bg"),
          renderLaneGrid(driverRect),
          hover?.kind === "driver" && !drag && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { className: "tweakers-cc-seg-hover", x: 0, y: driverRect.y, width: W, height: driverRect.h, rx: 8 }),
          diagonal(driverRect, [0, 1], "driver-diag"),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { className: "tweakers-cc-curve tweakers-cc-curve-driver", d: curvePath(driver, driverRect, [0, 1], W) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("text", { className: "tweakers-cc-label", x: W * 0.5, y: driverRect.y + 13, children: [
            "driver \xB7 ",
            driver.type
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("line", { ref: driverPlayheadRef, className: "tweakers-cc-playhead", x1: 0, y1: driverRect.y, x2: 0, y2: driverRect.y + driverRect.h, style: { stroke: playheadColor } })
        ] })
      ]
    }
  ) });
}

// src/move-strip.ts
var flat2 = (controls, out = []) => {
  for (const c of controls) {
    if (c.children) flat2(c.children, out);
    else out.push(c);
  }
  return out;
};
var isStripSlot = (c) => isMoveDial(c) || c.type === "toggle";
function buildMoveStrip(panel) {
  const controls = flat2(panel.controls);
  const column = (c) => {
    const n = panel.movePads?.[c.path];
    return typeof n === "number" && Number.isInteger(n) && n >= 0 ? n : null;
  };
  const balanceRefs = /* @__PURE__ */ new Map();
  for (const c of controls) {
    if (c.type !== "balance") continue;
    for (const path of [c.balanceA, c.balanceB]) {
      const ref = controls.find((x) => x.path === path && x.type === "color");
      if (ref && !balanceRefs.has(ref)) balanceRefs.set(ref, c);
    }
  }
  const dials = [];
  for (const c of controls) {
    if (!isStripSlot(c) || column(c) !== null || balanceRefs.has(c)) continue;
    for (let s = 0; s < dialSpan(c); s++) dials.push(c);
  }
  const toggles = [];
  const topValues = [];
  const values = [];
  const actions = [];
  const topAt = (i) => toggles[i] ?? topValues[i];
  for (const [ref, bal] of balanceRefs) {
    const col = dials.indexOf(bal);
    if (col < 0) continue;
    if (ref.path === bal.balanceA) topValues[col] = ref;
    else values[col] = ref;
  }
  const placeRun = (c, col) => {
    const span = padSpan(c);
    const fits = (start2) => Array.from({ length: span }, (_, k) => topAt(start2 + k)).every((p) => p === void 0);
    let start = col !== null && fits(col) ? col : -1;
    for (let i = 0; start < 0; i++) {
      if (fits(i)) start = i;
    }
    for (let k = 0; k < span; k++) toggles[start + k] = c;
  };
  for (const c of controls) {
    if (isMoveTabs(c)) {
      placeRun(c, column(c));
      continue;
    }
    if (balanceRefs.has(c)) continue;
    const col = column(c);
    if (col === null) continue;
    if (c.type === "toggle") {
      if (topAt(col) === void 0) toggles[col] = c;
      continue;
    }
    const row = c.type === "action" ? actions : values;
    if (row[col] === void 0) row[col] = c;
  }
  return { panel, dials, toggles, values, actions, ...topValues.length ? { topValues } : {} };
}
function stripStarts(page) {
  const starts = [];
  for (let i = 0; i < page.dials.length; i++) {
    if (i === 0 || page.dials[i] !== page.dials[i - 1]) starts.push(i);
  }
  return starts;
}
function stripOffsets(page, cols = MOVE_DIALS) {
  const len = page.dials.length;
  const offsets = [];
  for (const start of stripStarts(page)) {
    offsets.push(start);
    if (start + cols >= len) break;
  }
  return offsets.length ? offsets : [0];
}
function clampStripOffset(page, offset, cols = MOVE_DIALS) {
  const offsets = stripOffsets(page, cols);
  let best = offsets[0];
  for (const o of offsets) {
    if (Math.abs(o - offset) < Math.abs(best - offset)) best = o;
  }
  return best;
}
function stepStripOffset(page, offset, delta, cols = MOVE_DIALS) {
  const offsets = stripOffsets(page, cols);
  const from = offsets.indexOf(clampStripOffset(page, offset, cols));
  return offsets[Math.min(offsets.length - 1, Math.max(0, from + delta))];
}
function pageStripOffset(page, offset, dir, cols = MOVE_DIALS) {
  if (!dir) return clampStripOffset(page, offset, cols);
  const offsets = stripOffsets(page, cols);
  const target = clampStripOffset(page, offset, cols) + Math.sign(dir) * cols;
  const candidates = dir > 0 ? offsets.filter((o) => o >= target) : offsets.filter((o) => o <= target);
  if (candidates.length) return dir > 0 ? candidates[0] : candidates[candidates.length - 1];
  return dir > 0 ? offsets[offsets.length - 1] : offsets[0];
}
function stripDialColumns(page, offset, cols = MOVE_DIALS) {
  return Array.from({ length: cols }, (_, i) => {
    const col = offset + i;
    return col < page.dials.length ? col : -1;
  });
}
function stripDialSlots(page, offset, cols = MOVE_DIALS) {
  return stripDialColumns(page, offset, cols).map((col) => col < 0 ? void 0 : page.dials[col]);
}
function stripWindowPads(page, offset, cols = MOVE_DIALS) {
  const row = (cells) => Array.from({ length: cols }, (_, i) => cells[offset + i]);
  const top = page.toggles.slice();
  page.topValues?.forEach((m, i) => {
    if (m && top[i] === void 0) top[i] = m;
  });
  return { toggles: row(top), values: row(page.values), actions: row(page.actions) };
}
var stripSlotCount = (page) => stripStarts(page).length;
var stripSlotIndex = (page, offset) => stripStarts(page).filter((start) => start < offset).length;

// src/gradient-core.ts
var MIN_STOPS = 2;
var DEFAULT_GRADIENT = {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#6366f1ff", position: 0 },
    { color: "#ec4899ff", position: 1 }
  ]
};
var clamp016 = (n) => Math.min(1, Math.max(0, n));
var clampPct = (n) => Math.min(100, Math.max(0, n));
var clampScale = (n) => Math.min(200, Math.max(10, n));
var clampSquash = (n) => Math.min(200, Math.max(1, n));
var wrapAngle = (a) => (a % 360 + 360) % 360;
var round2 = (n, p) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};
var cloneDefaultStops = () => DEFAULT_GRADIENT.stops.map((s) => ({ ...s }));
var cloneDefault = () => ({
  type: DEFAULT_GRADIENT.type,
  angle: DEFAULT_GRADIENT.angle,
  stops: cloneDefaultStops()
});
var sortedStops = (stops) => [...stops].sort((a, b) => a.position - b.position);
var stopString = (stops) => sortedStops(stops).map((s) => `${s.color} ${round2(clamp016(s.position) * 100, 2)}%`).join(", ");
var normColor = (color) => {
  const rgba = parseHex(color);
  return rgba ? formatHex(rgba, true) : "#000000ff";
};
function rampCss(stops) {
  return gradientToCss({ type: "linear", angle: 90, stops });
}
function gradientToCss(value) {
  const stopStr = stopString(value.stops);
  const angle = round2(wrapAngle(value.angle), 2);
  const cx = round2(clampPct(value.centerX ?? 50), 2);
  const cy = round2(clampPct(value.centerY ?? 50), 2);
  switch (value.type) {
    case "radial": {
      const rx = clampScale(value.scale ?? 100);
      const ry = value.squash === void 0 ? rx : clampSquash(value.squash);
      if (rx === 100 && ry === 100) {
        return `radial-gradient(circle at ${cx}% ${cy}%, ${stopStr})`;
      }
      return `radial-gradient(${round2(rx, 2)}% ${round2(ry, 2)}% at ${cx}% ${cy}%, ${stopStr})`;
    }
    case "conic":
      return `conic-gradient(from ${angle}deg at ${cx}% ${cy}%, ${stopStr})`;
    case "linear":
    default:
      return `linear-gradient(${angle}deg, ${stopStr})`;
  }
}
function gradientToTransform(value) {
  const cx = round2(clampPct(value.centerX ?? 50), 2);
  const cy = round2(clampPct(value.centerY ?? 50), 2);
  const rotation = wrapAngle(value.rotation ?? 0);
  const rx = clampScale(value.scale ?? 100);
  const ry = value.squash === void 0 ? rx : clampSquash(value.squash);
  if (value.type !== "radial" || rotation === 0 || rx === ry) {
    return { transform: "none", transformOrigin: "50% 50%" };
  }
  return { transform: `rotate(${round2(rotation, 2)}deg)`, transformOrigin: `${cx}% ${cy}%` };
}
function gradientFillBox(value, boxW, boxH) {
  if (value.type !== "radial" || boxW <= 0 || boxH <= 0) {
    return {
      background: gradientToCss(value),
      transform: "none",
      transformOrigin: "50% 50%",
      left: 0,
      top: 0,
      width: boxW,
      height: boxH
    };
  }
  const cxPx = clampPct(value.centerX ?? 50) / 100 * boxW;
  const cyPx = clampPct(value.centerY ?? 50) / 100 * boxH;
  const scaleX = clampScale(value.scale ?? 100) / 100;
  const scaleY = (value.squash === void 0 ? clampScale(value.scale ?? 100) : clampSquash(value.squash)) / 100;
  const rx = round2(scaleX * boxW, 2);
  const ry = round2(scaleY * boxH, 2);
  const side = round2(2 * Math.hypot(boxW, boxH), 2);
  const rotation = wrapAngle(value.rotation ?? 0);
  return {
    background: `radial-gradient(${rx}px ${ry}px at 50% 50%, ${stopString(value.stops)})`,
    transform: rotation === 0 ? "none" : `rotate(${round2(rotation, 2)}deg)`,
    transformOrigin: "50% 50%",
    left: round2(cxPx - side / 2, 2),
    top: round2(cyPx - side / 2, 2),
    width: side,
    height: side
  };
}
function lerpPremult(a, b, t) {
  const pa = a.a + (b.a - a.a) * t;
  if (pa === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const mix = (ca, aa, cb, ba) => (ca * aa + (cb * ba - ca * aa) * t) / pa;
  return {
    r: mix(a.r, a.a, b.r, b.a),
    g: mix(a.g, a.a, b.g, b.a),
    b: mix(a.b, a.a, b.b, b.a),
    a: pa
  };
}
function colorAtPosition(value, position) {
  const stops = sortedStops(value.stops);
  if (stops.length === 0) return "#000000ff";
  const p = clamp016(position);
  if (p <= stops[0].position) return normColor(stops[0].color);
  const last = stops[stops.length - 1];
  if (p >= last.position) return normColor(last.color);
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].position <= p) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const span = b.position - a.position;
  const t = span === 0 ? 0 : (p - a.position) / span;
  const ca = parseHex(a.color) ?? { r: 0, g: 0, b: 0, a: 1 };
  const cb = parseHex(b.color) ?? { r: 0, g: 0, b: 0, a: 1 };
  return formatHex(lerpPremult(ca, cb, t), true);
}
function normalizeGradient(input) {
  if (!input || typeof input !== "object") return cloneDefault();
  const obj = input;
  if (!Array.isArray(obj.stops)) return cloneDefault();
  const type = obj.type === "radial" || obj.type === "conic" ? obj.type : "linear";
  const rawAngle = Number(obj.angle);
  const angle = Number.isFinite(rawAngle) ? wrapAngle(rawAngle) : DEFAULT_GRADIENT.angle;
  const extras = {};
  const cx = Number(obj.centerX);
  if (Number.isFinite(cx)) extras.centerX = clampPct(cx);
  const cy = Number(obj.centerY);
  if (Number.isFinite(cy)) extras.centerY = clampPct(cy);
  const scale = Number(obj.scale);
  if (Number.isFinite(scale)) extras.scale = clampScale(scale);
  const squash = Number(obj.squash);
  if (Number.isFinite(squash)) extras.squash = clampSquash(squash);
  const rotation = Number(obj.rotation);
  if (Number.isFinite(rotation)) extras.rotation = wrapAngle(rotation);
  const stops = [];
  for (const raw of obj.stops) {
    if (!raw || typeof raw !== "object") continue;
    const s = raw;
    const rgba = typeof s.color === "string" ? parseHex(s.color) : null;
    const pos = Number(s.position);
    if (!rgba || !Number.isFinite(pos)) continue;
    stops.push({ color: formatHex(rgba, true), position: clamp016(pos) });
  }
  if (stops.length < MIN_STOPS) return { type, angle, stops: cloneDefaultStops(), ...extras };
  stops.sort((a, b) => a.position - b.position);
  return { type, angle, stops, ...extras };
}
function addStop(value, position) {
  const stop = { color: colorAtPosition(value, position), position: clamp016(position) };
  const stops = [...value.stops, stop].sort((a, b) => a.position - b.position);
  return { value: { ...value, stops }, index: stops.indexOf(stop) };
}
function moveStop(value, index, position) {
  if (index < 0 || index >= value.stops.length) return { value, index };
  const moved = { ...value.stops[index], position: clamp016(position) };
  const stops = value.stops.map((s, i) => i === index ? moved : s);
  stops.sort((a, b) => a.position - b.position);
  return { value: { ...value, stops }, index: stops.indexOf(moved) };
}
function removeStop(value, index) {
  if (value.stops.length <= MIN_STOPS || index < 0 || index >= value.stops.length) return value;
  return { ...value, stops: value.stops.filter((_, i) => i !== index) };
}
function setStopColor(value, index, hex) {
  if (index < 0 || index >= value.stops.length) return value;
  const rgba = parseHex(hex);
  if (!rgba) return value;
  const color = formatHex(rgba, true);
  return { ...value, stops: value.stops.map((s, i) => i === index ? { ...s, color } : s) };
}
function setGradientType(value, type) {
  return { ...value, type };
}
function setGradientAngle(value, angle) {
  return { ...value, angle: wrapAngle(angle) };
}
function setGradientCenter(value, centerX, centerY) {
  return { ...value, centerX: clampPct(centerX), centerY: clampPct(centerY) };
}
function setGradientScale(value, scale) {
  return { ...value, scale: clampScale(scale) };
}
function setGradientSquash(value, squash) {
  return { ...value, squash: clampSquash(squash) };
}
function setGradientRotation(value, rotation) {
  return { ...value, rotation: wrapAngle(rotation) };
}

// src/transfer-core.ts
var DEFAULT_TRANSFER = { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] };
var TRANSFER_MIN_GAP = 0.02;
var TRANSFER_MAX_POINTS = 12;
var clamp017 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
var finite = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
function normalizeTransfer(value) {
  const raw = value?.points;
  if (!Array.isArray(raw) || raw.length < 2) return { points: DEFAULT_TRANSFER.points.map((p) => ({ ...p })) };
  const points = raw.map((p) => ({ x: clamp017(finite(p?.x, 0)), y: clamp017(finite(p?.y, 0)) })).sort((a, b) => a.x - b.x);
  points[0].x = 0;
  points[points.length - 1].x = 1;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (points[i].x - out[out.length - 1].x < TRANSFER_MIN_GAP) continue;
    if (1 - points[i].x < TRANSFER_MIN_GAP) continue;
    out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return { points: out.slice(0, TRANSFER_MAX_POINTS) };
}
function tangents(points) {
  const n = points.length;
  const secant = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    secant[i] = dx > 0 ? (points[i + 1].y - points[i].y) / dx : 0;
  }
  const m = new Array(n);
  m[0] = secant[0];
  m[n - 1] = secant[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = secant[i - 1] * secant[i] <= 0 ? 0 : (secant[i - 1] + secant[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (secant[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / secant[i];
    const b = m[i + 1] / secant[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      m[i] = 3 / h * a * secant[i];
      m[i + 1] = 3 / h * b * secant[i];
    }
  }
  return m;
}
function sampleTransfer(points, x) {
  if (!points.length) return clamp017(x);
  if (points.length === 1) return points[0].y;
  const t = clamp017(finite(x, 0));
  if (t <= points[0].x) return points[0].y;
  const last = points[points.length - 1];
  if (t >= last.x) return last.y;
  let i = 0;
  while (i < points.length - 2 && points[i + 1].x < t) i++;
  const p0 = points[i], p1 = points[i + 1];
  const h = p1.x - p0.x;
  if (h <= 0) return p1.y;
  const m = tangents(points);
  const s = (t - p0.x) / h;
  const s2 = s * s, s3 = s2 * s;
  return clamp017(
    (2 * s3 - 3 * s2 + 1) * p0.y + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * p1.y + (s3 - s2) * h * m[i + 1]
  );
}
function transferLut(points, size = 256) {
  const out = new Float32Array(size);
  for (let i = 0; i < size; i++) out[i] = sampleTransfer(points, size === 1 ? 0 : i / (size - 1));
  return out;
}
function insertPoint(points, x, y) {
  const next = normalizeTransfer({ points: [...points, { x: clamp017(x), y: clamp017(y) }] }).points;
  const index = next.findIndex((p) => Math.abs(p.x - clamp017(x)) < 1e-9);
  return { points: next, index: index < 0 ? 0 : index };
}
function removePoint(points, index) {
  if (index <= 0 || index >= points.length - 1) return points;
  return points.filter((_, i) => i !== index);
}
function movePoint(points, index, x, y) {
  if (index < 0 || index >= points.length) return points;
  const out = points.map((p) => ({ ...p }));
  const ny = clamp017(finite(y, 0));
  if (index === 0 || index === points.length - 1) {
    out[index].y = ny;
    return out;
  }
  const lo = out[index - 1].x + TRANSFER_MIN_GAP;
  const hi = out[index + 1].x - TRANSFER_MIN_GAP;
  out[index] = { x: hi < lo ? out[index].x : Math.min(hi, Math.max(lo, clamp017(finite(x, 0)))), y: ny };
  return out;
}
function nearestPoint(points, x, y, tolerance) {
  let best = -1, bestD = tolerance;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - x, points[i].y - y);
    if (d <= bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}
function isIdentityTransfer(points) {
  return points.length === 2 && points[0].x === 0 && points[0].y === 0 && points[1].x === 1 && points[1].y === 1;
}

// src/shortcut-utils.ts
var import_TweakStore8 = require("tweakers/store");
function fineDragValue(opts) {
  const { startValue, startPos, pos, extentPx, min, max, factor = 0.1 } = opts;
  const delta = (pos - startPos) / (extentPx || 1) * (max - min) * factor;
  return Math.max(min, Math.min(max, startValue + delta));
}

// src/move-slot-core.ts
var MOVE_DIAL_TRACK_INSET = 10;
var MOVE_XY_INSET = { left: 8, top: 8, right: 9, bottom: 8 };
var MOVE_XY_GRID_DEFAULT = 5;
var MOVE_TAP_SLOP = 3;
var clamp018 = (v) => Math.min(1, Math.max(0, v));
function moveFineAnchor(fine, e, snapshot) {
  if (e.shiftKey ? !fine.current?.shift : fine.current?.shift) {
    fine.current = { shift: e.shiftKey, x: e.clientX, y: e.clientY, v: snapshot() };
  }
  return fine.current;
}
function moveDialKey(meta, value, e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return null;
  return moveKeyboardValue(meta, value, e.key, e.shiftKey);
}
function moveRangeValue(meta, value, e, box, handle, fine, down) {
  const span = box.width - MOVE_DIAL_TRACK_INSET * 2;
  const cur = normalizeRangeDial(meta, value);
  let p01 = clamp018((e.clientX - box.left - MOVE_DIAL_TRACK_INSET) / (span || 1));
  if (down) handle.current = nearestHandle(p01, { min: cur.lo, max: cur.hi });
  const anchor = moveFineAnchor(fine, e, () => cur);
  if (anchor) {
    const a = anchor.v;
    p01 = fineDragValue({
      startValue: handle.current === "min" ? a.lo : a.hi,
      startPos: anchor.x,
      pos: e.clientX,
      extentPx: span || 1,
      min: 0,
      max: 1,
      factor: anchor.shift ? 0.1 : 1
    });
  }
  const next = handle.current === "min" ? { lo: Math.min(p01, cur.hi), hi: cur.hi } : { lo: cur.lo, hi: Math.max(p01, cur.lo) };
  return denormalizeRangeDial(meta, next.lo, next.hi);
}
function moveFilterValue(meta, value, e, box, hand, fine, down) {
  const half = box.width / 2;
  if (down) hand.current = e.clientX - box.left < half ? "cutoff" : "resonance";
  const left = hand.current === "cutoff" ? box.left + MOVE_DIAL_TRACK_INSET : box.left + half;
  const span = half - MOVE_DIAL_TRACK_INSET;
  const cur = normalizeFilterDial(meta, value);
  const anchor = moveFineAnchor(fine, e, () => cur);
  const v01 = anchor ? fineDragValue({
    startValue: hand.current === "cutoff" ? anchor.v.cutoff : anchor.v.resonance,
    startPos: anchor.x,
    pos: e.clientX,
    extentPx: span || 1,
    min: 0,
    max: 1,
    factor: anchor.shift ? 0.1 : 1
  }) : clamp018((e.clientX - left) / (span || 1));
  return hand.current === "cutoff" ? denormalizeFilterDial(meta, v01, cur.resonance) : denormalizeFilterDial(meta, cur.cutoff, v01);
}
function moveXYValue(meta, value, e, box, fine) {
  const w = box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right;
  const h = box.height - MOVE_XY_INSET.top - MOVE_XY_INSET.bottom;
  const xa = resolveAxis(meta.xAxis);
  const ya = resolveAxis(meta.yAxis);
  const anchor = moveFineAnchor(fine, e, () => pointFromValue(normalizeValue(value, xa, ya), xa, ya));
  let px, py;
  if (anchor) {
    const a = anchor.v;
    const factor = anchor.shift ? 0.1 : 1;
    px = fineDragValue({ startValue: a.x, startPos: anchor.x, pos: e.clientX, extentPx: w || 1, min: 0, max: 1, factor });
    py = fineDragValue({ startValue: a.y, startPos: anchor.y, pos: e.clientY, extentPx: h || 1, min: 0, max: 1, factor });
  } else {
    px = clamp018((e.clientX - box.left - MOVE_XY_INSET.left) / (w || 1));
    py = clamp018((e.clientY - box.top - MOVE_XY_INSET.top) / (h || 1));
  }
  const raw = valueFromPoint({ x: px, y: py }, xa, ya, !!meta.snap);
  const origin = pointFromValue(centerValue(xa, ya), xa, ya);
  return {
    x: applyDetentAxis(raw.x, xa, Math.abs(px - origin.x) * (w || 1)),
    y: applyDetentAxis(raw.y, ya, Math.abs(py - origin.y) * (h || 1))
  };
}
function moveXYRest(meta) {
  if (!meta.returnToCenter) return null;
  const xa = resolveAxis(meta.xAxis);
  const ya = resolveAxis(meta.yAxis);
  return normalizeValue(centerValue(xa, ya), xa, ya, !!meta.snap);
}
function moveNeedleValue(meta, value, e, box) {
  const min = meta.min ?? 0, max = meta.max ?? 1;
  const wraps = meta.wrap ?? Math.abs(max - min) >= 360;
  return angleFromPointer(
    e.clientX - (box.left + box.width / 2),
    e.clientY - (box.top + box.height / 2),
    Number(value ?? min),
    min,
    max,
    meta.step ?? 1,
    wraps
  );
}
function moveTransferValue(value, e, box, held, down) {
  const w = box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right;
  const h = box.height - MOVE_XY_INSET.top - MOVE_XY_INSET.bottom;
  const x = clamp018((e.clientX - box.left - MOVE_XY_INSET.left) / (w || 1));
  const y = 1 - clamp018((e.clientY - box.top - MOVE_XY_INSET.top) / (h || 1));
  const points = normalizeTransfer(value).points;
  let index = held;
  if (down) {
    const hit = nearestPoint(points, x, y, 0.18);
    if (hit >= 0) index = hit;
  }
  index = Math.min(index, points.length - 1);
  return { held: index, value: { points: movePoint(points, index, x, y) } };
}
var rampPlace = (e, box) => clamp018((e.clientX - box.left - MOVE_XY_INSET.left) / (box.width - MOVE_XY_INSET.left - MOVE_XY_INSET.right || 1));
function moveRampStop(value, e, box) {
  const x = rampPlace(e, box);
  const { stops } = normalizeGradient(value);
  let best = 0;
  stops.forEach((st, i) => {
    if (Math.abs(st.position - x) < Math.abs(stops[best].position - x)) best = i;
  });
  return best;
}
function moveRampValue(value, e, box, index) {
  const x = rampPlace(e, box);
  const g = normalizeGradient(value);
  const lo = index > 0 ? g.stops[index - 1].position : 0;
  const hi = index < g.stops.length - 1 ? g.stops[index + 1].position : 1;
  return { ...g, stops: g.stops.map((st, i) => i === index ? { ...st, position: Math.min(hi, Math.max(lo, x)) } : st) };
}
var MOVE_OPTION_DETENT = 24;
var MOVE_LIST_ROW_TRAVEL = 16;
var movePressStart = (path, e, v) => ({ path, x: e.clientX, y: e.clientY, moved: false, shift: e.shiftKey, ax: e.clientX, ay: e.clientY, v });
function movePressTravel(press, path, e, snapshot) {
  const p = press.current;
  if (!p || p.path !== path) return null;
  if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < MOVE_TAP_SLOP) return null;
  p.moved = true;
  if (p.shift !== e.shiftKey) Object.assign(p, { shift: e.shiftKey, ax: e.clientX, ay: e.clientY, v: snapshot() });
  return p;
}
function movePressEnd(press, path) {
  const p = press.current;
  press.current = null;
  return !!p && p.path === path && !p.moved;
}
function moveTurnValue(meta, p, e, extent) {
  const travel = e.clientX - p.ax - (e.clientY - p.ay);
  return denormalizeDial(meta, clamp018(p.v + travel / (extent || 1) * (p.shift ? 0.1 : 1)));
}
var moveTurnExtent = (box) => Math.max(1, box.width - MOVE_DIAL_TRACK_INSET * 2);
var optionValue = (meta, i) => {
  const option = (meta.options ?? [])[i];
  return option === void 0 ? void 0 : typeof option === "string" ? option : option.value;
};
function moveOptionStep(meta, value, p, e) {
  const last = (meta.options ?? []).length - 1;
  const steps = Math.trunc((e.clientX - p.ax + (e.clientY - p.ay)) / MOVE_OPTION_DETENT);
  const next = Math.max(0, Math.min(last, p.v + steps));
  return next === enumIndex(meta, value) ? void 0 : optionValue(meta, next);
}
function moveNextOption(meta, value) {
  const count = (meta.options ?? []).length;
  return count ? optionValue(meta, (enumIndex(meta, value) + 1) % count) : void 0;
}
var moveDialPercent = (meta, value) => Math.round(normalizeDial(meta, value) * 100);
var plainNumber = (n) => Math.abs(n) >= 100 ? Math.round(n).toString() : Number(n.toFixed(2)).toString();
function moveDialReading(meta, value) {
  const n = Number(value);
  const bipolar = dialOrigin(meta) > 0;
  if (!bipolar && !meta.formatValue && !meta.unit) return `${moveDialPercent(meta, value)}%`;
  if (!Number.isFinite(n)) return "";
  if (meta.formatValue) return meta.formatValue(n);
  const num = plainNumber(n);
  if (!bipolar) return `${num}${meta.unit ?? ""}`;
  return n > 0 ? `+${num}` : num;
}
function moveRangeReading(meta, value) {
  const v = value ?? {};
  const fmt = (n) => n == null || !Number.isFinite(n) ? "" : meta.formatValue ? meta.formatValue(n) : plainNumber(n);
  return `${fmt(v.min)}\u2013${fmt(v.max)}`;
}
function moveChipValue(meta, value) {
  if (isEnumDial(meta)) {
    return { num: String(enumOptionLabel((meta.options ?? [])[enumIndex(meta, value)])) };
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return { num: "" };
  if (meta.formatValue) return { num: meta.formatValue(n) };
  return { num: plainNumber(n), unit: meta.unit };
}
function moveXYGrid(meta) {
  const base = meta.grid === false ? 0 : typeof meta.grid === "number" ? meta.grid : MOVE_XY_GRID_DEFAULT;
  return base > 0 ? Math.round(base * Math.max(0, meta.density ?? 1)) : 0;
}
function moveShapePath(points) {
  if (points.length < 2) return "";
  return points.map((v, i) => `${i ? "L" : "M"} ${(i / (points.length - 1) * 100).toFixed(2)} ${((1 - v) * 100).toFixed(2)}`).join(" ");
}

// src/move-keys.ts
function moveKeyButton(event) {
  const mod = event.metaKey || event.ctrlKey;
  if (event.altKey) return null;
  const key = event.key.toLowerCase();
  if (mod && key === "z") return "undo";
  if (mod && key === "c") return "copy";
  if (!mod && (event.key === "Backspace" || event.key === "Delete")) return "delete";
  return null;
}
var typing = (target) => {
  if (typeof Element === "undefined" || !(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true;
  return false;
};
var onKey = (event) => {
  if (event.defaultPrevented || typing(event.target)) return;
  const name = moveKeyButton(event);
  if (!name || !MoveFunctions.list().includes(name)) return;
  if (name === "copy" && String(window.getSelection?.() ?? "").length > 0) return;
  event.preventDefault();
  MoveFunctions.run(name, { shift: event.shiftKey });
};
var holders = 0;
function attachMoveKeys() {
  if (typeof window === "undefined") return () => {
  };
  if (holders++ === 0) window.addEventListener("keydown", onKey);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holders === 0) window.removeEventListener("keydown", onKey);
  };
}

// src/components/MoveMenuButton.tsx
var import_react10 = require("react");
var import_react_dom2 = require("react-dom");

// src/components/MoveFunctionChips.tsx
var import_react9 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime");
var PRESS_FLASH_MS = 160;
function MoveFunctionGlyphIcon({ glyph, className = "tweakers-move-chip-icon" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("svg", { className, width: glyph.size, height: glyph.size, viewBox: glyph.viewBox, fill: "none", children: [
    glyph.paths?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d, stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, d)),
    glyph.fills?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("path", { d, fill: "currentColor" }, d)),
    glyph.circles?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("circle", { ...c, fill: "currentColor" }, `${c.cx},${c.cy}`)),
    glyph.text && // A letter mark (mute's "M"): Helvetica, centred on the same grid
    // the drawn marks share, weighted to read like their 1.5px stroke.
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "text",
      {
        x: "7",
        y: "7.5",
        textAnchor: "middle",
        dominantBaseline: "central",
        fontFamily: MOVE_GLYPH_TEXT_FONT,
        fontSize: "12",
        fontWeight: "bold",
        fill: "currentColor",
        children: glyph.text
      }
    )
  ] });
}
function MoveFunctionChipButton({ chip, disabled }) {
  const [pressed, setPressed] = (0, import_react9.useState)(false);
  const flashTimer = (0, import_react9.useRef)(void 0);
  (0, import_react9.useEffect)(() => {
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran !== chip.name) return;
      setPressed(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [chip.name]);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "button",
    {
      type: "button",
      className: "tweakers-move-chip",
      disabled,
      "data-name": chip.name,
      "data-variant": chip.variant,
      "data-color": chip.color,
      "data-pressed": pressed || void 0,
      style: chip.color ? { background: MOVE_PALETTE[chip.color] } : void 0,
      onClick: () => MoveFunctions.run(chip.name, { shift: false }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoveFunctionGlyphIcon, { glyph: MOVE_FUNCTION_ICONS[chip.name] }),
        chip.label
      ]
    }
  );
}
function MoveFunctionChips({ className }) {
  const [chips, setChips] = (0, import_react9.useState)(() => MoveFunctions.chips());
  (0, import_react9.useEffect)(() => {
    setChips(MoveFunctions.chips());
    return MoveFunctions.subscribe(() => setChips(MoveFunctions.chips()));
  }, []);
  if (!chips.length) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: className ? `tweakers-move-chips ${className}` : "tweakers-move-chips", children: chips.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoveFunctionChipButton, { chip }, chip.name)) });
}

// src/components/MoveMenuButton.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var MOVE_MENU_HOLD_MS = 450;
function MoveMenuButton({ theme, open: open2, label }) {
  const attached = (0, import_react10.useSyncExternalStore)((fn) => MoveFunctions.subscribe(fn), () => MoveFunctions.list().includes("menu"), () => false);
  const timer = (0, import_react10.useRef)(null);
  const [mounted, setMounted] = (0, import_react10.useState)(false);
  (0, import_react10.useEffect)(() => setMounted(true), []);
  (0, import_react10.useEffect)(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  if (!mounted || !attached || typeof document === "undefined") return null;
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return (0, import_react_dom2.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "tweakers-root tweakers-move-surface tweakers-move-menu", "data-theme": theme, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-menu-button",
        "aria-label": label,
        "aria-expanded": open2,
        title: label,
        "data-open": open2 || void 0,
        onPointerDown: (e) => {
          if (e.button > 0) return;
          cancel();
          timer.current = setTimeout(() => {
            timer.current = null;
            MoveFunctions.run("menu", { hold: true });
          }, MOVE_MENU_HOLD_MS);
        },
        onPointerUp: (e) => {
          if (!timer.current) return;
          cancel();
          MoveFunctions.run("menu", { shift: e.shiftKey });
        },
        onPointerLeave: cancel,
        onPointerCancel: cancel,
        onClick: (e) => {
          if (e.detail === 0) MoveFunctions.run("menu", { shift: e.shiftKey });
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MoveFunctionGlyphIcon, { glyph: MOVE_FUNCTION_ICONS.menu, className: "tweakers-move-menu-icon" })
      }
    ) }),
    document.body
  );
}

// src/move-meter.ts
function createMoveMeter() {
  const readers = /* @__PURE__ */ new Map();
  return {
    attach(panelId, read2) {
      readers.set(panelId, read2);
      return () => {
        if (readers.get(panelId) === read2) readers.delete(panelId);
      };
    },
    read(panelId) {
      return readers.get(panelId)?.() ?? null;
    }
  };
}

// src/move-gate.ts
var MoveGateMeter = createMoveMeter();
function drawMoveGate(g, w, h, dpr, reading, threshold, colours, pad = 0) {
  g.clearRect(0, 0, w, h);
  const top = pad;
  const tall = h - pad * 2;
  const y = (v) => top + (1 - Math.max(0, Math.min(1, v))) * tall;
  const mid = w / 2;
  const thresholdLine = () => {
    const at2 = Math.round(y(threshold)) + 0.5;
    g.globalAlpha = 1;
    g.strokeStyle = colours.threshold;
    g.lineWidth = dpr;
    g.setLineDash([4 * dpr, 3 * dpr]);
    g.beginPath();
    g.moveTo(0, at2);
    g.lineTo(w, at2);
    g.stroke();
    g.setLineDash([]);
  };
  const levels = reading?.levels;
  const n = levels?.length ?? 0;
  if (reading && levels && n > 1) {
    const x = (i) => i / (n - 1) * w;
    const open2 = reading.open;
    if (reading.ahead && reading.ahead > 0) {
      g.globalAlpha = 0.18;
      g.fillStyle = colours.lookahead;
      g.fillRect(mid, 0, Math.min(w - mid, reading.ahead * w), h);
      g.globalAlpha = 1;
    }
    const sample = (curve, px) => {
      const at2 = px / w * (n - 1);
      const i = Math.min(n - 2, Math.floor(at2));
      return curve[i] + (curve[i + 1] - curve[i]) * (at2 - i);
    };
    g.fillStyle = colours.text;
    for (let px = 0; px < w; px++) {
      const through = open2 ? Math.max(0, Math.min(1, sample(open2, px))) : 1;
      g.globalAlpha = 0.05 + 0.15 * through;
      const at2 = y(sample(levels, px));
      g.fillRect(px, at2, 1, top + tall - at2);
    }
    thresholdLine();
    g.strokeStyle = colours.text;
    g.lineWidth = dpr;
    g.lineJoin = "round";
    g.beginPath();
    for (let i = 0; i < n; i++) i ? g.lineTo(x(i), y(levels[i])) : g.moveTo(0, y(levels[i]));
    g.stroke();
    if (open2 && open2.length === n) {
      g.globalAlpha = 0.9;
      g.strokeStyle = colours.release;
      g.lineWidth = 1.5 * dpr;
      g.beginPath();
      for (let i = 0; i < n; i++) i ? g.lineTo(x(i), y(open2[i])) : g.moveTo(0, y(open2[i]));
      g.stroke();
    }
    g.globalAlpha = 1;
  } else {
    thresholdLine();
  }
  g.globalAlpha = 0.7;
  g.fillStyle = colours.text;
  g.fillRect(Math.round(mid - dpr / 2), 0, dpr, h);
  g.globalAlpha = 1;
}
function moveGateDemoReading(steps = 96, phase = 0) {
  const levels = new Float32Array(steps);
  const open2 = new Float32Array(steps);
  let gate = 0;
  for (let i = 0; i < steps; i++) {
    const t = (i + phase) % 24;
    const hit = Math.exp(-t / 5) * (0.9 - 0.15 * (((i + phase) / 24 | 0) % 2));
    levels[i] = Math.max(0.12 + 0.05 * Math.sin(i * 1.7), hit);
  }
  for (let i = 0; i < steps; i++) {
    const wanted = levels[Math.min(steps - 1, i + 2)] > 0.45 ? 1 : 0;
    gate += (wanted - gate) * (wanted > gate ? 0.8 : 0.2);
    open2[i] = gate;
  }
  return { levels, open: open2, ahead: 2 / steps };
}

// src/components/MoveLiveCanvas.tsx
var import_react11 = require("react");
var import_jsx_runtime11 = require("react/jsx-runtime");
function MoveLiveCanvas({ className, paint, still = false, deps = [] }) {
  const canvasRef = (0, import_react11.useRef)(null);
  const paintRef = (0, import_react11.useRef)(paint);
  paintRef.current = paint;
  (0, import_react11.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const g = canvas.getContext("2d");
      const box = canvas.getBoundingClientRect();
      if (!g || !box.width || !box.height) return;
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(box.width * dpr);
      const h = Math.round(box.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const css = getComputedStyle(canvas);
      paintRef.current(g, w, h, dpr, (name) => css.getPropertyValue(name).trim());
    };
    if (still) {
      draw();
      return;
    }
    let frame = requestAnimationFrame(function tick() {
      draw();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [still, ...deps]);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("canvas", { ref: canvasRef, className });
}

// src/components/MoveGateDisplay.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var GATE_TRACE_PAD = 1;
function MoveGateDisplay({ panelId, threshold, reading }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    MoveLiveCanvas,
    {
      className: "tweakers-move-gate-canvas",
      still: reading !== void 0,
      deps: [panelId, reading, threshold],
      paint: (g, w, h, dpr, token) => drawMoveGate(g, w, h, dpr, reading ?? (panelId ? MoveGateMeter.read(panelId) : null), threshold, {
        text: token("--move-text"),
        threshold: token("--move-gate-threshold"),
        lookahead: token("--move-gate-lookahead"),
        release: token("--move-gate-release")
      }, GATE_TRACE_PAD * dpr)
    }
  );
}

// src/move-multiband.ts
var MoveMultibandMeter = createMoveMeter();
function drawMoveMultiband(g, w, h, dpr, reading, bands, colours, pad = 0) {
  g.clearRect(0, 0, w, h);
  const n = bands.length;
  if (!n) return;
  const tall = h - pad * 2;
  const y = (v) => pad + (1 - Math.max(0, Math.min(1, v))) * tall;
  const slice = w / n;
  const x = (k) => (k + 0.5) * slice;
  if (reading) {
    g.fillStyle = colours.text;
    const gap = Math.min(slice / 4, 3 * dpr);
    for (let k = 0; k < n && k < reading.levels.length; k++) {
      const through = reading.open ? Math.max(0, Math.min(1, reading.open[k])) : 1;
      g.globalAlpha = 0.05 + 0.15 * through;
      const top = y(reading.levels[k]);
      g.fillRect(k * slice + gap, top, slice - gap * 2, pad + tall - top);
    }
    g.globalAlpha = 1;
  }
  const pts = bands.map((b, k) => [x(k), y(b.position)]);
  const slopes = pts.map((_, k) => {
    if (k === 0 || k === n - 1) return 0;
    const before = (pts[k][1] - pts[k - 1][1]) / slice;
    const after = (pts[k + 1][1] - pts[k][1]) / slice;
    return before * after <= 0 ? 0 : 2 * before * after / (before + after);
  });
  const curve = () => {
    g.moveTo(0, pts[0][1]);
    g.lineTo(pts[0][0], pts[0][1]);
    for (let k = 0; k < n - 1; k++) {
      const [x1, y1] = pts[k];
      const [x2, y2] = pts[k + 1];
      g.bezierCurveTo(x1 + slice / 3, y1 + slopes[k] * slice / 3, x2 - slice / 3, y2 - slopes[k + 1] * slice / 3, x2, y2);
    }
    g.lineTo(w, pts[n - 1][1]);
  };
  g.beginPath();
  curve();
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.closePath();
  g.globalAlpha = 0.14;
  g.fillStyle = colours.amount;
  g.fill();
  g.globalAlpha = 1;
  g.beginPath();
  curve();
  g.strokeStyle = colours.amount;
  g.lineWidth = 1.5 * dpr;
  g.lineJoin = "round";
  g.stroke();
  bands.forEach((b, k) => {
    g.beginPath();
    g.arc(pts[k][0], pts[k][1], (b.active ? 4 : 2.5) * dpr, 0, Math.PI * 2);
    g.fillStyle = b.active ? colours.text : colours.amount;
    g.fill();
  });
}
function moveMultibandDemoReading(t = 0) {
  const levels = [0.35, 0.5, 0.7, 0.6, 0.45, 0.3].map((v, k) => Math.max(0, Math.min(1, v + 0.12 * Math.sin(t * 4e-3 + k * 1.3))));
  return { levels, open: levels.map((v) => v > 0.4 ? 1 : 0.2) };
}

// src/components/MoveMultibandDisplay.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function MoveMultibandDisplay({ panelId, bands, reading }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    MoveLiveCanvas,
    {
      className: "tweakers-move-multiband-canvas",
      still: reading !== void 0,
      deps: [panelId, reading, JSON.stringify(bands)],
      paint: (g, w, h, dpr, token) => drawMoveMultiband(g, w, h, dpr, reading ?? (panelId ? MoveMultibandMeter.read(panelId) : null), bands, {
        text: token("--move-text"),
        amount: token("--move-multiband-amount")
      }, 3 * dpr)
    }
  );
}

// src/components/ModRing.tsx
var import_react12 = require("react");
var import_TweakStore9 = require("tweakers/store");
var import_ModulationStore = require("tweakers/modulation-store");
var import_jsx_runtime14 = require("react/jsx-runtime");
function ModRing({
  panelId,
  path,
  assignment,
  className
}) {
  const arcRef = (0, import_react12.useRef)(null);
  const color = modColor(assignment.slot);
  (0, import_react12.useEffect)(() => {
    const el = arcRef.current;
    if (!el) return;
    const draw = (from, to) => {
      const { length, offset } = modRingArc(from, to);
      el.setAttribute("stroke-dasharray", `${length.toFixed(2)} ${MOD_RING_CIRCUMFERENCE.toFixed(2)}`);
      el.setAttribute("stroke-dashoffset", offset.toFixed(2));
    };
    const bounds = import_ModulationStore.ModulationStore.getBounds(panelId, path);
    const span = bounds ? bounds.max - bounds.min : 0;
    const base01 = () => span ? (Number(import_TweakStore9.TweakStore.getValue(panelId, path)) - bounds.min) / span : 0;
    if (!span) return;
    const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      const reach = assignment.amount / 2;
      const drawReach = () => draw(base01() - reach, base01() + reach);
      drawReach();
      return import_TweakStore9.TweakStore.subscribe(panelId, drawReach);
    }
    return import_ModulationStore.ModulationStore.subscribeFrames(() => {
      const b = base01();
      draw(b, b + import_ModulationStore.ModulationStore.getOffset(panelId, path) / span);
    });
  }, [panelId, path, assignment.slot, assignment.amount]);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
    "svg",
    {
      className: ["tweakers-mod-ring", className].filter(Boolean).join(" "),
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("circle", { className: "tweakers-mod-ring-track", cx: "8", cy: "8", r: MOD_RING_RADIUS }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          "circle",
          {
            ref: arcRef,
            className: "tweakers-mod-ring-arc",
            cx: "8",
            cy: "8",
            r: MOD_RING_RADIUS,
            stroke: color,
            strokeDasharray: `0 ${MOD_RING_CIRCUMFERENCE}`
          }
        )
      ]
    }
  );
}
function MoveModRing({ panelId, path, pad }) {
  const assignment = import_ModulationStore.ModulationStore.getAssignment(panelId, path);
  if (!assignment || !import_ModulationStore.ModulationStore.getSlot(assignment.slot)) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    ModRing,
    {
      panelId,
      path,
      assignment,
      className: pad ? "tweakers-move-pad-mod" : "tweakers-move-dial-mod"
    }
  );
}

// src/move-color.ts
var import_TweakStore10 = require("tweakers/store");
var MOVE_GRADIENT_STOPS = 4;
var MOVE_COLOR_PALETTES = [
  { id: "move", name: "Move 16", colors: [
    "#ff4d07",
    "#ff9d00",
    "#ffd500",
    "#a8e000",
    "#52bd06",
    "#00c78b",
    "#00c2d1",
    "#4274f4",
    "#2f5cc4",
    "#8a5cf5",
    "#b04cff",
    "#d83dff",
    "#ff3d9a",
    "#ff5d5d",
    "#c96f4a",
    "#9e9e88"
  ] },
  { id: "ember", name: "Ember", colors: [
    "#fff3c4",
    "#ffe28a",
    "#ffd166",
    "#ffb703",
    "#fb8500",
    "#f77f00",
    "#f4623a",
    "#ef476f",
    "#e63946",
    "#d62828",
    "#b5171e",
    "#9d0208",
    "#7f1d1d",
    "#6a040f",
    "#4a0404",
    "#2b0000"
  ] },
  { id: "ocean", name: "Ocean", colors: [
    "#e0fbfc",
    "#bee9e8",
    "#98f5e1",
    "#62d9c4",
    "#2ec4b6",
    "#06d6a0",
    "#00b4d8",
    "#48cae4",
    "#4cc9f0",
    "#4895ef",
    "#4361ee",
    "#3a0ca3",
    "#264653",
    "#1d3557",
    "#14213d",
    "#0b132b"
  ] },
  { id: "meadow", name: "Meadow", colors: [
    "#f7ffe0",
    "#e9f5db",
    "#d8f3a3",
    "#ccff33",
    "#9ef01a",
    "#70e000",
    "#52bd06",
    "#38b000",
    "#2d6a4f",
    "#40916c",
    "#52b788",
    "#74c69d",
    "#95d5b2",
    "#606c38",
    "#3a5a40",
    "#283618"
  ] },
  { id: "neon", name: "Neon", colors: [
    "#f5f5f5",
    "#eaff00",
    "#c8ff00",
    "#39ff14",
    "#00ffab",
    "#00fff7",
    "#00d0ff",
    "#3d5aff",
    "#7b2bff",
    "#b026ff",
    "#e600ff",
    "#ff00c8",
    "#ff2079",
    "#ff3131",
    "#ff5f1f",
    "#ff9e00"
  ] }
];
var MOVE_COLOR_WHEEL = [4, 18, 45, 78, 95, 120, 141, 158, 186, 204, 233, 244, 254, 271, 312, 351];
var MOVE_COLOR_HUES = MOVE_COLOR_WHEEL.length;
var MOVE_COLOR_STEPS = 16;
var MOVE_OPACITY_PADS = 8;
var clamp8 = (n) => Math.max(0, Math.min(1, n));
var hue = (n) => (n % 360 + 360) % 360;
var moveWheelSlot = (h) => {
  const target = hue(h);
  let best = 0, bestGap = Infinity;
  MOVE_COLOR_WHEEL.forEach((wheelHue, index) => {
    const gap = Math.min(Math.abs(wheelHue - target), 360 - Math.abs(wheelHue - target));
    if (gap < bestGap) {
      bestGap = gap;
      best = index;
    }
  });
  return best;
};
var paletteCoords = /* @__PURE__ */ new Map();
var paletteHsl = (palette) => {
  const key = `${palette.id}:${palette.colors.join()}`;
  const cached = paletteCoords.get(key);
  if (cached) return cached;
  const coords = palette.colors.map((hex) => rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }));
  paletteCoords.set(key, coords);
  return coords;
};
var paletteSlot = (palette, h) => {
  const target = hue(h);
  let best = 0, bestGap = Infinity;
  paletteHsl(palette).forEach((color, index) => {
    const gap = Math.min(Math.abs(color.h - target), 360 - Math.abs(color.h - target));
    if (gap < bestGap) {
      bestGap = gap;
      best = index;
    }
  });
  return best;
};
var paletteAt = (palette, h) => Math.min(palette.colors.length - 1, Math.floor(hue(h) / 360 * palette.colors.length));
var paletteCenter = (palette, index) => (index + 0.5) * 360 / palette.colors.length;
var MoveColorStoreClass = class {
  constructor() {
    this.view = null;
    this.version = 0;
    this.listeners = /* @__PURE__ */ new Set();
    // Remember hue/saturation at black and white, where RGB cannot retain them.
    this.coordinates = /* @__PURE__ */ new Map();
    /** The palette the dial is locked to — null is the whole wheel. */
    this.paletteId = null;
    /** The app's own palette, holding EVERY colour control to its colours —
     *  open or not. It outranks the editor's navigator, which it closes. */
    this.lock = null;
    /** The app's own palettes, when it has a set of its own: the navigator lists
     *  these instead of the built-in ones. */
    this.hostPalettes = null;
    this.onPickPalette = null;
    /** The palette navigator behind Menu while the editor is open. */
    this.picker = false;
    this.pickerCursor = 0;
    /** The gradient stop the editor is on — meaningless for a plain colour. */
    this.stop = 0;
    this.getView = () => this.view;
    this.getVersion = () => this.version;
    this.subscribe = (fn) => {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    };
    this.getStop = () => this.stop;
    /* ---- the palette lock and its navigator ---- */
    this.getPaletteId = () => this.lock?.id ?? this.paletteId;
    this.getPalette = () => this.lock ?? (this.paletteId ? this.palettes().find((p) => p.id === this.paletteId) ?? null : null);
    /** The palettes the navigator lists — the app's when it has some. */
    this.palettes = () => this.hostPalettes ?? MOVE_COLOR_PALETTES;
    this.getLock = () => this.lock;
    this.isPickerOpen = () => this.picker && (!!this.view || !!this.hostPalettes);
    this.getPickerCursor = () => this.pickerCursor;
  }
  notify() {
    this.version++;
    for (const fn of this.listeners) fn();
  }
  open(panelId, path) {
    if (this.view?.panelId === panelId && this.view.path === path) return;
    this.view = { panelId, path };
    this.stop = 0;
    this.notify();
  }
  close() {
    if (this.view || this.picker) {
      this.view = null;
      this.picker = false;
      this.notify();
    }
  }
  toggle(panelId, path) {
    if (this.view?.panelId === panelId && this.view.path === path) this.close();
    else this.open(panelId, path);
  }
  /* ---- the gradient shape under a control, when it has one ---- */
  /** The control's gradient value, or null when it holds a plain colour. */
  gradient(panelId, path) {
    const v = import_TweakStore10.TweakStore.getValue(panelId, path);
    return v && typeof v === "object" && Array.isArray(v.stops) && v.stops.length >= 2 ? v : null;
  }
  /** How many stops the editor can hold — 0 for a plain colour. */
  stopCount(panelId, path) {
    return Math.min(this.gradient(panelId, path)?.stops.length ?? 0, MOVE_GRADIENT_STOPS);
  }
  /** Land the editor on a stop — the track buttons' gesture. */
  selectStop(index) {
    if (!this.view) return;
    const count = this.stopCount(this.view.panelId, this.view.path);
    const next = Math.max(0, Math.min(Math.max(0, count - 1), Math.round(index)));
    if (next === this.stop) return;
    this.stop = next;
    this.notify();
  }
  /** A stop's position along the ramp, 0..1 — 0 when out of range. */
  stopPosition(panelId, path, index) {
    return Number(this.gradient(panelId, path)?.stops[index]?.position) || 0;
  }
  /** Slide a stop, clamped between its neighbours so the held stop never
   *  changes identity under the hand moving it — the ramp slot's own rule. */
  moveStop(panelId, path, index, position) {
    const g = this.gradient(panelId, path);
    if (!g || import_TweakStore10.TweakStore.isDisabled(panelId, path) || !Number.isFinite(position)) return;
    if (index < 0 || index >= g.stops.length) return;
    const lo = index > 0 ? g.stops[index - 1].position : 0;
    const hi = index < g.stops.length - 1 ? g.stops[index + 1].position : 1;
    const next = Math.min(hi, Math.max(lo, position));
    if (next === g.stops[index].position) return;
    import_TweakStore10.TweakStore.updateValue(panelId, path, {
      ...g,
      stops: g.stops.map((s, i) => i === index ? { ...s, position: next } : s)
    });
    this.notify();
  }
  /** Slide the selected stop by wheel/dial detents — the hold-a-track gesture. */
  turnStop(panelId, path, delta, fine = false) {
    this.moveStop(
      panelId,
      path,
      this.stop,
      this.stopPosition(panelId, path, this.stop) + delta * (fine ? 1e-3 : 0.01)
    );
  }
  /** Where a control's colour lives: the hex itself, or the stop's colour. */
  hexAt(panelId, path, stop) {
    const g = stop === null ? null : this.gradient(panelId, path);
    if (g && stop !== null) return String(g.stops[Math.min(stop, g.stops.length - 1)]?.color ?? "#ff0000ff");
    return String(import_TweakStore10.TweakStore.getValue(panelId, path) ?? "#ff0000");
  }
  /** The selected coordinate target: the stop the editor is on, when the
   *  control is a gradient; the control itself otherwise. */
  targetStop(panelId, path) {
    return this.gradient(panelId, path) ? Math.min(this.stop, this.stopCount(panelId, path) - 1) : null;
  }
  read(panelId, path) {
    return this.readStop(panelId, path, this.targetStop(panelId, path));
  }
  /** The colour under the editor as hex — the selected stop's for a gradient. */
  hex(panelId, path) {
    return this.hexAt(panelId, path, this.targetStop(panelId, path));
  }
  /** A specific stop's coordinates (null = the plain colour) — what the stop
   *  row and the hardware's track lights paint. */
  readStop(panelId, path, stop) {
    const hex = this.hexAt(panelId, path, stop);
    const cached = this.coordinates.get(JSON.stringify([panelId, path, stop]));
    if (cached?.hex === hex) return { ...cached.color };
    const color = rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 });
    if (color.s === 0) {
      color.h = cached?.color.h ?? 0;
      if (color.l === 0 || color.l === 1) color.s = cached?.color.s ?? 1;
    }
    return color;
  }
  update(panelId, path, patch2) {
    this.updateStop(panelId, path, this.targetStop(panelId, path), patch2);
  }
  updateStop(panelId, path, stop, patch2) {
    if (!import_TweakStore10.TweakStore.getPanel(panelId) || import_TweakStore10.TweakStore.isDisabled(panelId, path) || Object.values(patch2).some((n) => !Number.isFinite(n))) return;
    const color = { ...this.readStop(panelId, path, stop), ...patch2 };
    color.h = hue(color.h);
    color.s = clamp8(color.s);
    color.l = clamp8(color.l);
    color.a = clamp8(color.a);
    const palette = this.lockFor(panelId, path);
    const snapped = palette ? paletteHsl(palette)[paletteAt(palette, color.h)] : null;
    const painted = snapped ? { ...color, h: snapped.h, s: snapped.s, l: snapped.l } : color;
    const g = stop === null ? null : this.gradient(panelId, path);
    const current = this.hexAt(panelId, path, stop);
    const hex = formatHex(hslToRgb(painted), !!g || painted.a < 1 || current.length === 9 || current.length === 5);
    this.coordinates.set(JSON.stringify([panelId, path, stop]), { hex, color });
    if (g && stop !== null) import_TweakStore10.TweakStore.updateValue(panelId, path, setStopColor(g, stop, hex));
    else import_TweakStore10.TweakStore.updateValue(panelId, path, hex);
    this.notify();
  }
  setHue(h) {
    if (this.view) this.update(this.view.panelId, this.view.path, { h, s: 1 });
  }
  setLuminosity(l) {
    if (this.view) this.update(this.view.panelId, this.view.path, { l });
  }
  setOpacity(a) {
    if (this.view) this.update(this.view.panelId, this.view.path, { a });
  }
  turn(panelId, path, delta, fine = false) {
    const palette = this.lockFor(panelId, path);
    if (palette && delta) {
      const at2 = this.paletteAtValue(palette, panelId, path);
      const next = (at2 + Math.sign(delta) + palette.colors.length) % palette.colors.length;
      this.update(panelId, path, { h: paletteCenter(palette, next) });
      return;
    }
    this.update(panelId, path, { h: this.read(panelId, path).h + delta * (fine ? 0.1 : 1) });
  }
  turnLuminosity(panelId, path, delta, fine = false) {
    this.update(panelId, path, { l: this.read(panelId, path).l + delta * (fine ? 2e-3 : 0.02) });
  }
  /**
   * The app's own palettes, in the navigator the instrument already has: the rows
   * list these instead of the built-in ones, the first row ("All colors") still
   * means no palette, and a choice goes back through `onPick` — the app owns what
   * a palette means, and answers by locking one (`lockPalette`). With a set
   * installed the navigator opens on its own, with no colour editor up, so a
   * palette can be an app-wide setting rather than one control's.
   *
   * `null` gives the navigator the built-in palettes back.
   */
  setPalettes(palettes, onPick) {
    const next = palettes && palettes.length > 0 ? palettes.map((p) => ({ ...p, colors: [...p.colors] })) : null;
    this.onPickPalette = next ? onPick ?? null : null;
    const same = JSON.stringify(next) === JSON.stringify(this.hostPalettes);
    if (same) return;
    this.hostPalettes = next;
    this.picker = false;
    this.pickerCursor = 0;
    this.notify();
  }
  /** The palette a control's edits snap to: the app's lock on every control,
   *  else the navigator's choice on the one the editor has open. */
  lockFor(panelId, path) {
    if (this.lock) return this.lock;
    return this.view?.panelId === panelId && this.view.path === path ? this.getPalette() : null;
  }
  /**
   * Hold every colour control in the app to one palette — an app-wide
   * setting, not the editor's: a turn steps through its colours, a drag or a
   * write through the editor lands on the nearest segment, on screen and on
   * the hardware, open editor or not. The navigator behind Menu stands down
   * while the lock holds, since the palette is the app's to choose. `null`
   * hands every control back its whole wheel. Values the app writes itself
   * are the app's to keep on the palette.
   */
  lockPalette(palette) {
    const next = palette && palette.colors.length > 0 ? { ...palette, colors: [...palette.colors] } : null;
    const same = next?.id === this.lock?.id && next?.colors.join() === this.lock?.colors.join();
    if (same) return;
    this.lock = next;
    this.picker = false;
    this.notify();
  }
  /** Which palette colour the open control sits on — null off-palette. */
  paletteIndex(panelId, path) {
    const palette = this.getPalette();
    return palette ? this.paletteAtValue(palette, panelId, path) : null;
  }
  /** Which palette colour a control holds: the colour it IS, when it is one of
   *  them — a value the app wrote carries no position on the segmented wheel —
   *  else the segment its hue sits in. */
  paletteAtValue(palette, panelId, path) {
    const hex = this.hex(panelId, path).slice(0, 7).toLowerCase();
    const exact = palette.colors.findIndex((color) => color.slice(0, 7).toLowerCase() === hex);
    return exact >= 0 ? exact : paletteAt(palette, this.read(panelId, path).h);
  }
  /** Lock the open editor to a palette (null = back to all colours), and
   *  bring its colour onto the palette right away — the nearest of its hues,
   *  then that segment's centre so a turn steps cleanly from there. */
  setPalette(id) {
    if (this.lock) return;
    this.paletteId = id && this.palettes().some((p) => p.id === id) ? id : null;
    this.picker = false;
    const palette = this.getPalette();
    if (palette && this.view) {
      const nearest = paletteSlot(palette, this.read(this.view.panelId, this.view.path).h);
      this.update(this.view.panelId, this.view.path, { h: paletteCenter(palette, nearest) });
    }
    this.notify();
  }
  /** Jump straight to one of the locked palette's colours. */
  setPaletteColor(index) {
    const palette = this.getPalette();
    if (palette && this.view) this.update(this.view.panelId, this.view.path, { h: paletteCenter(palette, index) });
  }
  openPicker() {
    if (this.picker || !this.hostPalettes && (!this.view || this.lock)) return;
    const at2 = this.palettes().findIndex((p) => p.id === this.getPaletteId());
    this.pickerCursor = at2 < 0 ? 0 : at2 + 1;
    this.picker = true;
    this.notify();
  }
  closePicker() {
    if (this.picker) {
      this.picker = false;
      this.notify();
    }
  }
  togglePicker() {
    if (this.picker) this.closePicker();
    else this.openPicker();
  }
  /** Walk the navigator's cursor by wheel detents. */
  movePickerCursor(delta) {
    if (!this.isPickerOpen() || !delta) return;
    const step = Math.round(delta) || Math.sign(delta);
    const next = Math.max(0, Math.min(this.palettes().length, this.pickerCursor + step));
    if (next === this.pickerCursor) return;
    this.pickerCursor = next;
    this.notify();
  }
  /** Rest the cursor on a row — a search landing the wheel on the next match. */
  setPickerCursor(cursor) {
    if (!this.isPickerOpen()) return;
    const next = Math.max(0, Math.min(this.palettes().length, cursor));
    if (next === this.pickerCursor) return;
    this.pickerCursor = next;
    this.notify();
  }
  /** Keep the cursor's row: the palette locks in and the navigator dismisses. */
  confirmPicker() {
    if (!this.isPickerOpen()) return;
    const id = this.pickerCursor === 0 ? null : this.palettes()[this.pickerCursor - 1]?.id ?? null;
    if (this.onPickPalette) {
      this.picker = false;
      this.notify();
      this.onPickPalette(id);
      return;
    }
    this.setPalette(id);
  }
  /** A clicked row: cursor and confirm in one. */
  choosePicker(cursor) {
    if (!this.isPickerOpen()) return;
    this.pickerCursor = Math.max(0, Math.min(this.palettes().length, cursor));
    this.confirmPicker();
  }
};
var MoveColorStore = new MoveColorStoreClass();

// src/move-search.ts
function moveSearchMatch(label, query) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = label.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}
function moveSearchFilter(labels, query) {
  return labels.flatMap((label, i) => moveSearchMatch(label, query) ? [i] : []);
}
var MoveSearchStoreClass = class {
  constructor() {
    this.view = null;
    this.version = 0;
    this.listeners = /* @__PURE__ */ new Set();
    this.getView = () => this.view;
    this.isOpen = () => !!this.view;
    this.getVersion = () => this.version;
    this.subscribe = (fn) => {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    };
  }
  set(next) {
    this.view = next;
    MoveSurfaceStore.setSearch(next?.target === "screen" ? { query: next.query, index: next.cursor } : null);
    this.version++;
    for (const fn of this.listeners) fn();
  }
  /** Open on a list, with an empty query. Already open: nothing changes. */
  open(target, cursor = 0) {
    if (this.view) return;
    this.set({ target, query: "", cursor });
  }
  close() {
    if (this.view) this.set(null);
  }
  setQuery(query) {
    if (!this.view || this.view.query === query) return;
    this.set({ ...this.view, query });
  }
  /** The `screen` target's resting row, an index into the app's full list. */
  setCursor(cursor) {
    if (!this.view || this.view.cursor === cursor) return;
    this.set({ ...this.view, cursor });
  }
};
var MoveSearchStore = new MoveSearchStoreClass();

// src/components/MoveColor.tsx
var import_react13 = require("react");
var import_react_dom3 = require("react-dom");
var import_TweakStore11 = require("tweakers/store");
var import_jsx_runtime15 = require("react/jsx-runtime");
function MoveColorSlot({ panelId, meta, active, open: open2, latched = false, className, style }) {
  const gesture = (0, import_react13.useRef)(null);
  const suppressClick = (0, import_react13.useRef)(false);
  const disabled = import_TweakStore11.TweakStore.isDisabled(panelId, meta.path);
  const color = MoveColorStore.read(panelId, meta.path);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    "button",
    {
      type: "button",
      className: className ? `tweakers-move-dial ${className}` : "tweakers-move-dial",
      style,
      "data-kind": "color",
      "data-active": active || open2 || void 0,
      "data-latched": latched || void 0,
      "data-disabled": disabled || void 0,
      "aria-label": `${meta.label}, hue ${Math.round(color.h)} degrees. Open color editor`,
      "aria-expanded": open2,
      "aria-haspopup": "dialog",
      disabled,
      onClick: (e) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        const first = import_TweakStore11.TweakStore.getDefault(panelId, meta.path);
        if (e.shiftKey && typeof first === "string") import_TweakStore11.TweakStore.updateValue(panelId, meta.path, first);
        else MoveColorStore.toggle(panelId, meta.path);
      },
      onKeyDown: (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || disabled) return;
        const direction = ["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowDown"].includes(e.key) ? -1 : 0;
        if (!direction && e.key !== "Home" && e.key !== "End") return;
        e.preventDefault();
        e.stopPropagation();
        if (direction) MoveColorStore.turn(panelId, meta.path, direction, e.shiftKey);
        else MoveColorStore.update(panelId, meta.path, { h: e.key === "Home" ? 0 : 359 });
      },
      onPointerDown: (e) => {
        if (disabled || e.button > 0) return;
        suppressClick.current = false;
        gesture.current = { x: e.clientX, y: e.clientY, moved: false };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
        }
      },
      onPointerMove: (e) => {
        const g = gesture.current;
        if (!g || disabled) return;
        if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 3) return;
        g.moved = true;
        const width = e.currentTarget.getBoundingClientRect().width || 1;
        const fine = e.shiftKey ? 0.1 : 1;
        const now = MoveColorStore.read(panelId, meta.path);
        MoveColorStore.update(panelId, meta.path, {
          h: now.h + (e.clientX - g.x) / width * 360 * fine,
          l: now.l - (e.clientY - g.y) / width * fine
        });
        g.x = e.clientX;
        g.y = e.clientY;
      },
      onPointerUp: () => {
        suppressClick.current = !!gesture.current?.moved;
        gesture.current = null;
      },
      onPointerCancel: () => {
        suppressClick.current = true;
        gesture.current = null;
      },
      onLostPointerCapture: () => {
        gesture.current = null;
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveSlotColorBody, { label: meta.label, color: String(import_TweakStore11.TweakStore.getValue(panelId, meta.path)) })
    }
  );
}
function MoveOpacityPads({ color, disabled = false }) {
  const level = Math.round(color.a * (MOVE_OPACITY_PADS - 1));
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tweakers-move-pads", role: "group", "aria-label": "Opacity pads", "data-opacity": true, children: Array.from({ length: MOVE_OPACITY_PADS }, (_, pad) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    "button",
    {
      type: "button",
      className: "tweakers-move-pad",
      "data-kind": "opacity",
      "data-on": pad <= level || void 0,
      "aria-label": `Opacity ${Math.round(pad / (MOVE_OPACITY_PADS - 1) * 100)}%`,
      "aria-pressed": pad === level,
      disabled,
      onClick: () => MoveColorStore.setOpacity(pad / (MOVE_OPACITY_PADS - 1))
    },
    pad
  )) });
}
function MoveColorSteps({ color, disabled = false }) {
  const selected = Math.round(color.a * (MOVE_COLOR_STEPS - 1));
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tweakers-move-color-steps", role: "group", "aria-label": "Color opacity sequencer", children: Array.from({ length: MOVE_COLOR_STEPS }, (_, step) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    "button",
    {
      type: "button",
      className: "tweakers-move-color-step",
      "aria-label": `Opacity ${Math.round(step / (MOVE_COLOR_STEPS - 1) * 100)}%`,
      "aria-pressed": step === selected,
      disabled,
      onClick: () => MoveColorStore.setOpacity(step / (MOVE_COLOR_STEPS - 1)),
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { style: { opacity: 0.15 + step / (MOVE_COLOR_STEPS - 1) * 0.85 } })
    },
    step
  )) });
}
var readingHsl = (c) => `${Math.round(c.h)} ${Math.round(c.s * 100)} ${Math.round(c.l * 100)}`;
var copyHsl = (c) => `hsl(${Math.round(c.h)} ${Math.round(c.s * 100)}% ${Math.round(c.l * 100)}%${c.a < 1 ? ` / ${Math.round(c.a * 100)}%` : ""})`;
var copyHslOfHex = (hex) => copyHsl(rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }));
var readingOklch = (hex) => {
  const rgba = parseHex(hex);
  if (!rgba) return "0 0 0";
  const ok = rgbToOklch(rgba);
  return `${Math.round(ok.l * 100)} ${ok.c.toFixed(2)} ${Math.round(ok.h)}`;
};
var copyOklch = (hex) => {
  const rgba = parseHex(hex);
  if (!rgba) return "oklch(0% 0 0)";
  const ok = rgbToOklch(rgba);
  return `oklch(${Math.round(ok.l * 100)}% ${ok.c.toFixed(3)} ${Math.round(ok.h)}${ok.a < 1 ? ` / ${Math.round(ok.a * 100)}%` : ""})`;
};
function MoveColorCopy({ label, reading, copy }) {
  const [copied, setCopied] = (0, import_react13.useState)(false);
  const timer = (0, import_react13.useRef)(null);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "button",
    {
      type: "button",
      className: "tweakers-move-color-copy",
      "aria-label": `Copy ${label} value`,
      onClick: () => {
        void navigator.clipboard?.writeText(copy);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1e3);
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "tweakers-move-color-copy-label", children: [
          label,
          ":"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-color-copy-value", children: reading }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "svg",
          {
            viewBox: ICON_MOVE_COPY.viewBox,
            "aria-hidden": "true",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.25",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: copied ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d: "M2.5 7.5L6 11L11.5 3.5", strokeWidth: "1.75" }) : ICON_MOVE_COPY.paths.map((d) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("path", { d }, d))
          }
        )
      ]
    }
  );
}
function MoveColorPaletteStrip({ palette, selected, disabled }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tweakers-move-color-palette", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-name", children: palette.name }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tweakers-move-palette-strip", role: "group", "aria-label": `${palette.name} colors`, children: palette.colors.map((hex, index) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-palette-color",
        style: { background: hex },
        disabled,
        "aria-label": `Color ${hex}`,
        "aria-pressed": index === selected,
        "data-selected": index === selected || void 0,
        onClick: () => MoveColorStore.setPaletteColor(index)
      },
      index
    )) })
  ] });
}
function MoveGradientRamp({ panelId, path, gradient, disabled }) {
  const drag = (0, import_react13.useRef)(null);
  const selected = Math.min(MoveColorStore.getStop(), gradient.stops.length - 1);
  const positionFrom = (e) => {
    const rect = (e.currentTarget.closest(".tweakers-move-color-ramp") ?? e.currentTarget).getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / (rect.width || 1)));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    "div",
    {
      className: "tweakers-move-color-ramp",
      role: "group",
      "aria-label": "Gradient stops",
      style: { background: rampCss(gradient.stops) },
      children: gradient.stops.map((stop, index) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "button",
        {
          type: "button",
          className: "tweakers-move-color-stop",
          disabled,
          "data-selected": index === selected || void 0,
          "aria-label": `Stop ${index + 1}, ${Math.round(stop.position * 100)}%`,
          "aria-pressed": index === selected,
          style: { left: `${stop.position * 100}%`, background: stop.color },
          onPointerDown: (e) => {
            if (disabled || e.button > 0) return;
            MoveColorStore.selectStop(index);
            drag.current = { index };
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
            }
          },
          onPointerMove: (e) => {
            if (!drag.current || disabled) return;
            MoveColorStore.moveStop(panelId, path, drag.current.index, positionFrom(e));
          },
          onPointerUp: () => {
            drag.current = null;
          },
          onPointerCancel: () => {
            drag.current = null;
          }
        },
        index
      ))
    }
  );
}
function MoveColorDisplay({ panelId, meta, anchor, theme }) {
  const display = (0, import_react13.useRef)(null);
  const [position, setPosition] = (0, import_react13.useState)({ left: 0, top: 0 });
  const color = MoveColorStore.read(panelId, meta.path);
  const disabled = import_TweakStore11.TweakStore.isDisabled(panelId, meta.path);
  const close = () => {
    if (display.current?.contains(document.activeElement)) {
      anchor.current?.querySelector('[data-kind][aria-expanded="true"]')?.focus();
    }
    MoveColorStore.close();
  };
  (0, import_react13.useLayoutEffect)(() => {
    const place3 = () => {
      if (!anchor.current || !display.current) return;
      const rect = anchor.current.getBoundingClientRect();
      const popup = display.current.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(display.current).getPropertyValue("--move-color-gap")) || 8;
      setPosition({
        left: Math.max(gap, Math.min(window.innerWidth - popup.width - gap, rect.left + (rect.width - popup.width) / 2)),
        top: Math.max(gap, rect.top - popup.height - gap)
      });
    };
    place3();
    window.addEventListener("resize", place3);
    window.addEventListener("scroll", place3, true);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place3) : null;
    if (anchor.current) observer?.observe(anchor.current);
    if (display.current) observer?.observe(display.current);
    const dismiss = (e) => {
      const target = e.target;
      if (!display.current?.contains(target) && !anchor.current?.contains(target)) MoveColorStore.close();
    };
    const escape = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close();
    };
    window.addEventListener("pointerdown", dismiss);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("resize", place3);
      window.removeEventListener("scroll", place3, true);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", escape);
      observer?.disconnect();
    };
  }, [anchor]);
  const gradient = MoveColorStore.gradient(panelId, meta.path);
  const hex = MoveColorStore.hex(panelId, meta.path);
  const palette = MoveColorStore.getPalette();
  const shown = palette ? rgbToHsl(parseHex(hex) ?? { r: 255, g: 0, b: 0, a: 1 }) : color;
  const content = /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "div",
    {
      ref: display,
      className: "tweakers-root tweakers-move tweakers-move-color-display",
      "data-theme": theme,
      role: "dialog",
      "aria-label": `${meta.label} color editor`,
      style: position,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "tweakers-move-color-copies", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveColorCopy, { label: "HSL", reading: readingHsl(shown), copy: copyHsl(shown) }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveColorCopy, { label: "HEX", reading: displayHex(hex), copy: hex }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveColorCopy, { label: "OKLCH", reading: readingOklch(hex), copy: copyOklch(hex) })
        ] }),
        gradient && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveGradientRamp, { panelId, path: meta.path, gradient, disabled }),
        palette ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(MoveColorPaletteStrip, { palette, selected: MoveColorStore.paletteIndex(panelId, meta.path), disabled }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tweakers-move-color-slider", "data-kind": "hue", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "input",
            {
              type: "range",
              min: "0",
              max: "360",
              step: "1",
              value: Math.round(color.h) % 360,
              disabled,
              "aria-label": "Hue",
              "aria-valuetext": `${Math.round(color.h)} degrees`,
              style: { "--move-slider-thumb": `hsl(${Math.round(color.h)} 100% 50%)` },
              onChange: (e) => MoveColorStore.setHue(Number(e.target.value))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "tweakers-move-color-slider", "data-kind": "lightness", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "input",
            {
              type: "range",
              min: "0",
              max: "1",
              step: "0.01",
              value: color.l,
              disabled,
              "aria-label": "Lightness",
              "aria-valuetext": `${Math.round(color.l * 100)}%`,
              style: { "--move-slider-thumb": `hsl(0 0% ${Math.round(color.l * 100)}%)` },
              onChange: (e) => MoveColorStore.setLuminosity(Number(e.target.value))
            }
          ) })
        ] })
      ]
    }
  );
  return typeof document === "undefined" ? content : (0, import_react_dom3.createPortal)(content, document.body);
}
function MovePaletteScreen({ kept = null, children }) {
  const root = (0, import_react13.useRef)(null);
  const cursor = MoveColorStore.getPickerCursor();
  const rows = [
    { name: "All colors", colors: null, index: 0 },
    ...MoveColorStore.palettes().map((p, i) => ({ name: p.name, colors: p.colors, index: i + 1 }))
  ].filter((row) => !kept || kept.includes(row.index));
  (0, import_react13.useEffect)(() => {
    const el = root.current;
    const selected = el?.querySelector("[data-selected]");
    if (!el || !selected) return;
    const row = selected.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const top = row.top - box.top + el.scrollTop;
    const bottom = top + row.height;
    const next = top < el.scrollTop ? top : bottom > el.scrollTop + el.clientHeight ? bottom - el.clientHeight : el.scrollTop;
    el.scrollTop = Math.max(0, Math.min(next, el.scrollHeight - el.clientHeight));
  }, [cursor]);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "div",
    {
      ref: root,
      className: "tweakers-move-preset-screen tweakers-move-palette-screen",
      "data-open": true,
      "data-search": kept ? true : void 0,
      role: "listbox",
      "aria-label": "Color palettes",
      onWheel: (e) => {
        e.preventDefault();
        if (!kept) MoveColorStore.movePickerCursor(e.deltaY > 0 ? 1 : -1);
      },
      children: [
        children,
        kept && !rows.length && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-empty", children: "No matches" }),
        rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
          "button",
          {
            type: "button",
            role: "option",
            className: "tweakers-move-palette-row",
            "aria-selected": row.index === cursor,
            "data-selected": row.index === cursor || void 0,
            onClick: () => MoveColorStore.choosePicker(row.index),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-name", children: row.name }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-strip", "aria-hidden": "true", children: row.colors ? row.colors.map((hex, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-color", style: { background: hex } }, i)) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "tweakers-move-palette-color", "data-gradient": true }) })
            ]
          },
          row.name
        ))
      ]
    }
  );
}

// src/components/MoveTimeline.tsx
var import_react14 = require("react");
var import_react_dom4 = require("react-dom");
var import_TweakStore15 = require("tweakers/store");

// src/store/persist.ts
var STORAGE_VERSION = "v1";
function resolvePersistTarget(kind, id, persist) {
  if (!persist) return null;
  const config = persist === true ? {} : persist;
  const base = config.key ?? id;
  if (!base) return null;
  return {
    key: `tweakers:${STORAGE_VERSION}:${kind}:${base}`,
    storage: config.storage ?? "localStorage"
  };
}
function getStorage(name) {
  try {
    if (typeof window === "undefined") return null;
    return name === "sessionStorage" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}
function loadPersisted(target) {
  if (!target) return null;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return null;
    const raw = storage.getItem(target.key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function savePersisted(target, value) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.setItem(target.key, JSON.stringify(value));
  } catch {
  }
}
function clearPersisted(target) {
  if (!target) return;
  try {
    const storage = getStorage(target.storage);
    if (!storage) return;
    storage.removeItem(target.key);
  } catch {
  }
}

// src/store/TimelineStore.ts
var MIN_LOOP_REGION = 0.02;
function loopSpan(duration, loopStart, loopEnd) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (!Number.isFinite(loopStart)) loopStart = 0;
  const end = Number.isFinite(loopEnd) ? Math.min(Math.max(0, loopEnd), duration) : duration;
  const start = Math.min(Math.max(0, loopStart), duration);
  const span = end - start;
  return span > 0 ? span : duration;
}
function foldLoopTime(time, duration, loopStart = 0, loopEnd) {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) {
    return { time: 0, wraps: 0 };
  }
  const end = Number.isFinite(loopEnd) ? Math.min(Math.max(0, loopEnd), duration) : duration;
  if (time < end) return { time, wraps: 0 };
  const span = loopSpan(duration, loopStart, end);
  const base = end - span;
  const over = time - base;
  return { time: base + over % span, wraps: Math.floor(over / span) };
}
var TIMELINE_CLIP_COLORS = [
  "#E8E8E8"
  // neutral white — slightly off-white so the pure-white selection ring still reads
];
var EMPTY_TRANSPORT = Object.freeze({ time: 0, playing: false, duration: 0, wraps: 0 });
var TimelineStoreClass = class {
  constructor() {
    this.timelines = /* @__PURE__ */ new Map();
    this.transports = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.globalListeners = /* @__PURE__ */ new Set();
    this.registrationCounts = /* @__PURE__ */ new Map();
    // User-defined loop windows. Absent = loop the whole timeline. The stored
    // object reference is stable until set/clear so useSyncExternalStore readers
    // don't churn.
    this.loopRegions = /* @__PURE__ */ new Map();
    // Timelines that play once and stop at the end. Absent = looping, the
    // preview tool's default. Kept across re-registration: a player that
    // switched looping off keeps it off through a remount.
    this.playsOnce = /* @__PURE__ */ new Set();
    this.persistTargets = /* @__PURE__ */ new Map();
    this.listCache = null;
    this.rafId = null;
    this.lastTick = 0;
    this.tick = (now) => {
      const dt = Math.max(0, (now - this.lastTick) / 1e3);
      this.lastTick = now;
      let anyPlaying = false;
      for (const [id, transport] of this.transports) {
        if (!transport.playing) continue;
        const meta = this.timelines.get(id);
        const duration = meta?.duration ?? transport.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          this.transports.set(id, { time: 0, playing: false, duration: 0, wraps: 0 });
          this.notify(id);
          continue;
        }
        let time = transport.time + dt;
        let wraps = transport.wraps;
        if (!this.isLooping(id)) {
          if (time >= duration) {
            this.transports.set(id, { time: duration, playing: false, duration, wraps });
            this.notify(id);
            continue;
          }
          this.transports.set(id, { time, playing: true, duration, wraps });
          anyPlaying = true;
          this.notify(id);
          continue;
        }
        const region = this.effectiveRegion(id, duration);
        if (time >= region.end) {
          const folded = foldLoopTime(time, duration, region.start, region.end);
          time = folded.time;
          wraps += folded.wraps;
        }
        this.transports.set(id, { time, playing: true, duration, wraps });
        anyPlaying = true;
        this.notify(id);
      }
      this.rafId = anyPlaying ? window.requestAnimationFrame(this.tick) : null;
    };
  }
  register(meta, options) {
    const existing = this.timelines.get(meta.id);
    if (existing && existing.name !== meta.name) {
      console.warn(
        `[tweakers] Timeline id "${meta.id}" is already registered by "${existing.name}"; "${meta.name}" will share and overwrite that transport.`
      );
    }
    const firstRegistration = !this.registrationCounts.has(meta.id);
    this.registrationCounts.set(meta.id, (this.registrationCounts.get(meta.id) ?? 0) + 1);
    if (firstRegistration) {
      this.persistTargets.set(meta.id, resolvePersistTarget("timeline-loop", meta.id, options.persist));
      this.hydrateLoopRegion(meta);
    }
    this.applyMeta(meta, options.autoplay);
  }
  update(meta) {
    if (!this.timelines.has(meta.id)) return;
    this.applyMeta(meta, false);
  }
  unregister(id) {
    const nextCount = (this.registrationCounts.get(id) ?? 1) - 1;
    if (nextCount > 0) {
      this.registrationCounts.set(id, nextCount);
      return;
    }
    this.registrationCounts.delete(id);
    this.timelines.delete(id);
    this.transports.delete(id);
    this.loopRegions.delete(id);
    this.persistTargets.delete(id);
    if (this.listeners.get(id)?.size === 0) this.listeners.delete(id);
    this.listCache = null;
    this.notifyGlobal();
  }
  /** Restore a persisted loop region, or seed one from a code-defined
   * `options.loop`. No region at all = loop the whole timeline (the default). */
  hydrateLoopRegion(meta) {
    const duration = Number.isFinite(meta.duration) ? Math.max(0, meta.duration) : 0;
    const persisted = loadPersisted(this.persistTargets.get(meta.id) ?? null);
    if (persisted && Number.isFinite(persisted.start) && Number.isFinite(persisted.end)) {
      const region = this.normalizeRegion(persisted.start, persisted.end, duration);
      if (region) this.loopRegions.set(meta.id, region);
      return;
    }
    if (meta.loop) {
      const region = this.normalizeRegion(meta.loopStart, duration, duration);
      if (region) this.loopRegions.set(meta.id, region);
    }
  }
  /** Clamp to [0,duration], order min/max, and reject degenerate widths. */
  normalizeRegion(start, end, duration) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || duration <= 0) return null;
    const lo = Math.min(Math.max(0, Math.min(start, end)), duration);
    const hi = Math.min(Math.max(0, Math.max(start, end)), duration);
    if (hi - lo < MIN_LOOP_REGION) return null;
    return { start: lo, end: hi };
  }
  setLoopRegion(id, start, end) {
    const transport = this.transports.get(id);
    const duration = transport?.duration ?? this.timelines.get(id)?.duration ?? 0;
    const region = this.normalizeRegion(start, end, duration);
    if (!region) return;
    this.loopRegions.set(id, region);
    savePersisted(this.persistTargets.get(id) ?? null, region);
    this.notify(id);
  }
  clearLoopRegion(id) {
    if (!this.loopRegions.has(id)) return;
    this.loopRegions.delete(id);
    clearPersisted(this.persistTargets.get(id) ?? null);
    this.notify(id);
  }
  /** The raw user/code region, or undefined when looping the whole timeline.
   * The reference is stable between changes (safe for useSyncExternalStore). */
  getLoopRegion(id) {
    return this.loopRegions.get(id);
  }
  /** The region the clock actually loops within: the user/code region, or the
   * whole timeline `[0, duration]` when none is set. Playback always wraps. */
  effectiveRegion(id, duration) {
    const region = this.loopRegions.get(id);
    if (region) return region;
    return { start: 0, end: Math.max(0, duration) };
  }
  /** Looping on: the playhead wraps within the loop region (or the whole
   * timeline). Off: it plays to the end once and stops there. */
  setLooping(id, looping) {
    if (looping === this.isLooping(id)) return;
    if (looping) this.playsOnce.delete(id);
    else this.playsOnce.add(id);
    this.notify(id);
  }
  isLooping(id) {
    return !this.playsOnce.has(id);
  }
  play(id) {
    const transport = this.transports.get(id);
    if (!transport || transport.duration <= 0 || transport.playing) return;
    const region = this.isLooping(id) ? this.effectiveRegion(id, transport.duration) : { start: 0, end: transport.duration };
    const restart = transport.time >= region.end;
    this.transports.set(id, {
      ...transport,
      time: restart ? region.start : transport.time,
      wraps: restart ? 0 : transport.wraps,
      playing: true
    });
    this.notify(id);
    this.ensureLoop();
  }
  pause(id) {
    const transport = this.transports.get(id);
    if (!transport || !transport.playing) return;
    this.transports.set(id, { ...transport, playing: false });
    this.notify(id);
  }
  replay(id) {
    const transport = this.transports.get(id);
    if (!transport || transport.duration <= 0) return;
    const region = this.isLooping(id) ? this.effectiveRegion(id, transport.duration) : { start: 0, end: transport.duration };
    this.transports.set(id, { ...transport, time: region.start, wraps: 0, playing: true });
    this.notify(id);
    this.ensureLoop();
  }
  seek(id, time) {
    const transport = this.transports.get(id);
    if (!transport || !Number.isFinite(time)) return;
    const clamped = Math.min(transport.duration, Math.max(0, time));
    this.transports.set(id, { ...transport, time: clamped, wraps: 0 });
    this.notify(id);
  }
  getTransport(id) {
    return this.transports.get(id) ?? EMPTY_TRANSPORT;
  }
  getTimeline(id) {
    return this.timelines.get(id);
  }
  getTimelines() {
    if (!this.listCache) {
      this.listCache = Array.from(this.timelines.values());
    }
    return this.listCache;
  }
  subscribe(id, listener) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, /* @__PURE__ */ new Set());
    }
    this.listeners.get(id).add(listener);
    return () => {
      const listeners5 = this.listeners.get(id);
      listeners5?.delete(listener);
      if (listeners5?.size === 0 && !this.timelines.has(id)) {
        this.listeners.delete(id);
      }
    };
  }
  subscribeGlobal(listener) {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }
  applyMeta(meta, autoplay) {
    const duration = Number.isFinite(meta.duration) ? Math.max(0, meta.duration) : 0;
    const loopStart = Number.isFinite(meta.loopStart) ? Math.min(duration, Math.max(0, meta.loopStart)) : 0;
    const safeMeta = { ...meta, duration, loopStart };
    this.timelines.set(meta.id, safeMeta);
    const region = this.loopRegions.get(meta.id);
    if (region) {
      const reclamped = this.normalizeRegion(region.start, region.end, duration);
      if (reclamped) this.loopRegions.set(meta.id, reclamped);
      else this.loopRegions.delete(meta.id);
    }
    const existing = this.transports.get(meta.id);
    if (existing) {
      this.transports.set(meta.id, {
        time: Math.min(existing.time, duration),
        playing: duration > 0 && existing.playing,
        duration,
        wraps: existing.wraps
      });
    } else {
      const playing2 = duration > 0 && autoplay;
      this.transports.set(meta.id, { time: 0, playing: playing2, duration, wraps: 0 });
      if (playing2) this.ensureLoop();
    }
    this.listCache = null;
    this.notify(meta.id);
    this.notifyGlobal();
  }
  ensureLoop() {
    if (this.rafId !== null || typeof window === "undefined") return;
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.tick);
  }
  notify(id) {
    this.listeners.get(id)?.forEach((fn) => fn());
  }
  notifyGlobal() {
    this.globalListeners.forEach((fn) => fn());
  }
};
var TimelineStore = /* @__PURE__ */ new TimelineStoreClass();

// src/timeline-core.ts
var import_TweakStore13 = require("tweakers/store");

// src/transition-math.ts
var import_TweakStore12 = require("tweakers/store");
function round22(value) {
  return Math.round(value * 100) / 100;
}
function clamp9(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function isTransitionConfig(value) {
  return (0, import_TweakStore12.isSpringConfigValue)(value) || (0, import_TweakStore12.isEasingConfigValue)(value);
}
function isPhysicsSpring(transition) {
  return transition.type === "spring" && (transition.stiffness !== void 0 || transition.damping !== void 0 || transition.mass !== void 0);
}
function springParams(spring) {
  if (isPhysicsSpring(spring)) {
    return { stiffness: spring.stiffness ?? 200, damping: spring.damping ?? 25, mass: spring.mass ?? 1 };
  }
  const visualDuration = Math.max(0.05, spring.visualDuration ?? 0.3);
  const bounce = spring.bounce ?? 0.3;
  const root = 2 * Math.PI / (visualDuration * 1.2);
  const stiffness = root * root;
  const damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness);
  return { stiffness, damping, mass: 1 };
}
function springProgress(t, { stiffness, damping, mass }) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 0.9999) {
    const wd2 = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd2 * t) + zeta * w0 / wd2 * Math.sin(wd2 * t));
  }
  if (zeta < 1.0001) {
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  const wd = w0 * Math.sqrt(zeta * zeta - 1);
  const r1 = -zeta * w0 + wd;
  const r2 = -zeta * w0 - wd;
  return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2);
}
function springSettleDuration(params) {
  const w0 = Math.sqrt(params.stiffness / params.mass);
  const zeta = params.damping / (2 * Math.sqrt(params.stiffness * params.mass));
  const decay = zeta >= 1 ? zeta * w0 - w0 * Math.sqrt(Math.max(0, zeta * zeta - 1)) : zeta * w0;
  const duration = Math.log(200) / Math.max(decay, 1e-6);
  return round22(clamp9(duration, 0.05, 10));
}
function cubicBezierProgress(p, [x1, y1, x2, y2]) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const sampleX = (t2) => bezierAxis2(t2, x1, x2);
  const sampleY = (t2) => bezierAxis2(t2, y1, y2);
  let t = p;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(t) - p;
    if (Math.abs(x) < 1e-5) return sampleY(t);
    const dx = bezierAxisDerivative(t, x1, x2);
    if (Math.abs(dx) < 1e-6) break;
    t -= x / dx;
  }
  let lo = 0;
  let hi = 1;
  t = p;
  while (hi - lo > 1e-5) {
    if (sampleX(t) < p) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return sampleY(t);
}
function bezierAxis2(t, a1, a2) {
  return (1 - 3 * a2 + 3 * a1) * t * t * t + (3 * a2 - 6 * a1) * t * t + 3 * a1 * t;
}
function bezierAxisDerivative(t, a1, a2) {
  return 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;
}
function resolveClipTransition(raw, clipDuration) {
  const safeDuration = Math.max(0.05, clipDuration);
  if (raw.type === "easing") {
    return {
      transition: { ...raw, duration: safeDuration },
      duration: safeDuration,
      isPhysics: false
    };
  }
  if (isPhysicsSpring(raw)) {
    return {
      transition: raw,
      duration: springSettleDuration(springParams(raw)),
      isPhysics: true
    };
  }
  return {
    transition: { type: "spring", bounce: raw.bounce ?? 0.2, visualDuration: safeDuration },
    duration: safeDuration,
    isPhysics: false
  };
}

// src/timeline-core.ts
var CLIP_VALUE_STEP = 0.01;
var TIMELINE_MIN_CLIP_DURATION = 0.05;
var DEFAULT_STEP_DURATION = 0.3;
var DEFAULT_CLIP_TRANSITION = { type: "spring", bounce: 0.2 };
var RESERVED_KEYS = /* @__PURE__ */ new Set(["time", "playing", "duration", "play", "pause", "replay", "seek"]);
function isClipConfig(value) {
  return isPlainObject(value) && Number.isFinite(value.at);
}
function isGroupConfig(value) {
  if (!isPlainObject(value) || "at" in value) return false;
  const entries = Object.values(value);
  return entries.length > 0 && entries.some(isClipConfig);
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function nonNegativeFinite(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}
function animatedDuration(value, fallback = DEFAULT_STEP_DURATION) {
  return Math.max(TIMELINE_MIN_CLIP_DURATION, nonNegativeFinite(value, fallback));
}
function transitionDefaultDuration(transition) {
  if (transition.type === "easing") return animatedDuration(transition.duration);
  if (isPhysicsSpring(transition)) {
    return animatedDuration(springSettleDuration(springParams(transition)));
  }
  if (transition.visualDuration !== void 0) return animatedDuration(transition.visualDuration);
  return animatedDuration(springSettleDuration(springParams(transition)));
}
function defaultStepDuration(step, inheritedTransition) {
  const curve = step.transition ?? inheritedTransition;
  if (curve && isPhysicsSpring(curve)) return transitionDefaultDuration(curve);
  if (step.duration !== void 0) return animatedDuration(step.duration);
  if (step.transition) return transitionDefaultDuration(step.transition);
  return DEFAULT_STEP_DURATION;
}
function defaultTrackDuration(track, inheritedTransition) {
  const curve = track.transition ?? inheritedTransition;
  if (track.steps?.length) {
    return track.steps.reduce((sum, step) => sum + defaultStepDuration(step, curve), 0);
  }
  if (curve && isPhysicsSpring(curve)) return transitionDefaultDuration(curve);
  if (track.duration !== void 0) return animatedDuration(track.duration);
  if (track.transition) return transitionDefaultDuration(track.transition);
  return DEFAULT_STEP_DURATION;
}
function defaultClipDuration(clip) {
  const defaultCurve = isTransitionConfig(clip.transition) ? clip.transition : DEFAULT_CLIP_TRANSITION;
  if (clip.props) {
    return Object.values(clip.props).reduce(
      (max, track) => Math.max(
        max,
        nonNegativeFinite(track.delay) + defaultTrackDuration(track, defaultCurve)
      ),
      0
    );
  }
  if (clip.steps?.length) {
    return clip.steps.reduce((sum, step) => sum + defaultStepDuration(step, defaultCurve), 0);
  }
  const animating = Boolean(clip.transition || clip.from || clip.to);
  if (!animating) return nonNegativeFinite(clip.duration);
  if (isPhysicsSpring(defaultCurve)) return transitionDefaultDuration(defaultCurve);
  if (clip.duration !== void 0) return animatedDuration(clip.duration);
  if (isTransitionConfig(clip.transition)) return transitionDefaultDuration(clip.transition);
  return clip.from || clip.to ? transitionDefaultDuration(DEFAULT_CLIP_TRANSITION) : 0;
}
function normalizeLoopMode(value) {
  if (value === true || value === "mirror" || value === "repeat") return "repeat";
  return "off";
}
function normalizeStoredTransition(transition, clipDuration) {
  if (transition.type === "easing") {
    return { ...transition, duration: clipDuration };
  }
  if (isPhysicsSpring(transition)) {
    return transition;
  }
  return { type: "spring", bounce: transition.bounce ?? 0.2 };
}
function collectClipEntries(config) {
  const entries = [];
  for (const [key, value] of Object.entries(config)) {
    if (key === "duration") continue;
    if (RESERVED_KEYS.has(key)) {
      console.warn(`[tweakers] Timeline key "${key}" collides with a reserved key and was skipped.`);
      continue;
    }
    if (isClipConfig(value)) {
      entries.push({ path: key, childKey: key, clip: value });
    } else if (isGroupConfig(value)) {
      for (const [childKey, childClip] of Object.entries(value)) {
        if (isClipConfig(childClip)) {
          entries.push({ path: `${key}.${childKey}`, childKey, group: key, clip: childClip });
        } else {
          console.warn(
            `[tweakers] Timeline clip "${key}.${childKey}" is missing a numeric "at" and was skipped.`
          );
        }
      }
    } else {
      console.warn(
        `[tweakers] Timeline entry "${key}" is neither a clip (needs a numeric "at") nor a group of clips and was skipped.`
      );
    }
  }
  return entries;
}
function definedValues(values) {
  if (!values) return void 0;
  const result = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== void 0) result[key] = value;
  }
  return result;
}
function setTweakPath(tweakConfig, path, value) {
  const segments = path.split(".");
  let node = tweakConfig;
  for (const segment of segments.slice(0, -1)) {
    node = node[segment] ?? (node[segment] = {});
  }
  node[segments[segments.length - 1]] = value;
}
function parseTimelineConfig(config) {
  const entries = collectClipEntries(config);
  let maxEnd = 0;
  for (const { clip } of entries) {
    maxEnd = Math.max(maxEnd, nonNegativeFinite(clip.at) + defaultClipDuration(clip));
  }
  const duration = typeof config.duration === "number" && Number.isFinite(config.duration) && config.duration > 0 ? config.duration : maxEnd > 0 ? Math.ceil(maxEnd * 100 - 1e-4) / 100 : 1;
  const tweakConfig = {};
  const clips = [];
  entries.forEach(({ path, childKey, group, clip }, index) => {
    const raw = clip;
    if (raw.props && (raw.steps?.length || raw.from || raw.to)) {
      console.warn(
        `[tweakers] Timeline clip "${path}": "props" is mutually exclusive with from/to/steps \u2014 using "props".`
      );
    } else if (raw.steps?.length && raw.to) {
      console.warn(
        `[tweakers] Timeline clip "${path}": "to" is ignored when "steps" is present \u2014 each leg's "to" defines its targets.`
      );
    }
    const hasSteps = Boolean(clip.steps?.length) && !clip.props;
    const hasProps = Boolean(clip.props);
    const single = isTransitionConfig(clip.transition) ? clip.transition : void 0;
    const total = defaultClipDuration(clip);
    const defaultCurve = single ?? DEFAULT_CLIP_TRANSITION;
    const clipAt = nonNegativeFinite(clip.at);
    const clipTweak = {
      at: [clipAt, 0, duration, CLIP_VALUE_STEP]
    };
    if (!hasSteps && !hasProps) {
      clipTweak.duration = [total, 0, duration, CLIP_VALUE_STEP];
    }
    if (!hasSteps && !hasProps && (clip.transition || clip.from || clip.to)) {
      clipTweak.transition = normalizeStoredTransition(defaultCurve, total);
    }
    let tracks;
    if (clip.props) {
      tracks = [];
      for (const [prop, track] of Object.entries(clip.props)) {
        if (TRACK_RESERVED.has(prop) || /^step\d+$/.test(prop)) {
          console.warn(`[tweakers] Timeline property "${prop}" collides with a clip field and was skipped.`);
          continue;
        }
        const trackDuration = defaultTrackDuration(track, defaultCurve);
        const trackCurve = track.transition ?? defaultCurve;
        const hasTrackSteps = Boolean(track.steps?.length);
        const trackTweak = {
          delay: [nonNegativeFinite(track.delay), 0, duration, CLIP_VALUE_STEP]
        };
        if (!hasTrackSteps) {
          trackTweak.duration = [trackDuration, 0, duration, CLIP_VALUE_STEP];
          trackTweak.transition = normalizeStoredTransition(trackCurve, trackDuration);
        }
        const fromValue = track.from ?? (hasTrackSteps ? void 0 : track.to);
        if (hasTrackSteps && fromValue === void 0) {
          console.warn(
            `[tweakers] Timeline clip "${path}": track "${prop}" has steps but no "from" \u2014 declare its starting value.`
          );
        }
        if (fromValue !== void 0) {
          trackTweak.from = scalarTweak(prop, fromValue, hasTrackSteps ? track.steps[0]?.to : track.to);
        }
        if (!hasTrackSteps && track.to !== void 0) {
          trackTweak.to = scalarTweak(prop, track.to, fromValue);
        }
        let trackStepKeys;
        if (hasTrackSteps) {
          trackStepKeys = [];
          let previous = fromValue;
          track.steps.forEach((step, stepIndex) => {
            const stepKey = `step${stepIndex + 1}`;
            trackStepKeys.push(stepKey);
            const stepDuration = defaultStepDuration(step, trackCurve);
            const stepTweak = {
              duration: [stepDuration, 0, duration, CLIP_VALUE_STEP],
              transition: normalizeStoredTransition(step.transition ?? trackCurve, stepDuration)
            };
            if (step.to !== void 0) {
              stepTweak.to = scalarTweak(prop, step.to, previous);
              previous = step.to;
            }
            trackTweak[stepKey] = stepTweak;
          });
        }
        clipTweak[prop] = trackTweak;
        tracks.push({ prop, stepKeys: trackStepKeys });
      }
    }
    if (clip.from && !hasProps) {
      clipTweak.from = withFromToRanges(
        clip.from,
        hasSteps ? definedValues(clip.steps[0]?.to) : clip.to
      );
    }
    if (!hasSteps && !hasProps && clip.to) {
      clipTweak.to = withFromToRanges(clip.to, clip.from);
    }
    let stepKeys;
    if (hasSteps) {
      stepKeys = [];
      let running2 = clip.from;
      clip.steps.forEach((step, stepIndex) => {
        const stepKey = `step${stepIndex + 1}`;
        stepKeys.push(stepKey);
        const stepDuration = defaultStepDuration(step, defaultCurve);
        const stepTweak = {
          duration: [stepDuration, 0, duration, CLIP_VALUE_STEP],
          transition: normalizeStoredTransition(step.transition ?? defaultCurve, stepDuration)
        };
        const stepTo = definedValues(step.to);
        if (stepTo) {
          for (const prop of Object.keys(stepTo)) {
            if (!running2 || !(prop in running2)) {
              console.warn(
                `[tweakers] Timeline clip "${path}": property "${prop}" first animates in step ${stepIndex + 1} with no starting value \u2014 declare it in "from".`
              );
            }
          }
          stepTweak.to = withFromToRanges(stepTo, running2);
        }
        clipTweak[stepKey] = stepTweak;
        running2 = { ...running2 ?? {}, ...stepTo ?? {} };
      });
    }
    setTweakPath(tweakConfig, path, clipTweak);
    clips.push({
      key: path,
      label: (0, import_TweakStore13.formatLabel)(childKey),
      color: TIMELINE_CLIP_COLORS[index % TIMELINE_CLIP_COLORS.length],
      loop: normalizeLoopMode(clip.loop),
      group,
      stepKeys,
      tracks
    });
  });
  return { duration, tweakConfig, clips };
}
var TRACK_RESERVED = /* @__PURE__ */ new Set(["at", "duration", "loop", "from", "to", "transition", "delay"]);
function scalarTweak(prop, value, counterpart) {
  const record = withFromToRanges(
    { [prop]: value },
    counterpart === void 0 ? void 0 : { [prop]: counterpart }
  );
  return record[prop];
}
var FROM_TO_RANGE_PRESETS = [
  [/^(x|y|z|tx|ty|offsetx|offsety|translatex|translatey)$/i, { min: -100, max: 100, step: 1 }],
  [/rotat|angle|skew/i, { min: -180, max: 180, step: 1 }],
  [/^scale/i, { min: 0, max: 2, step: 0.01 }],
  [/opacity|alpha/i, { min: 0, max: 1, step: 0.01 }],
  [/blur|radius|spread/i, { min: 0, max: 100, step: 1 }]
];
function inferFromToRange(key, value, counterpart) {
  const lo = Math.min(value, counterpart ?? value);
  const hi = Math.max(value, counterpart ?? value);
  const preset = FROM_TO_RANGE_PRESETS.find(([pattern]) => pattern.test(key))?.[1];
  if (preset) {
    return [value, Math.min(preset.min, lo), Math.max(preset.max, hi), preset.step];
  }
  if (lo >= 0 && hi <= 1) {
    return [value, 0, 1, 0.01];
  }
  const extent = Math.max(Math.abs(lo), Math.abs(hi), 1);
  const min = lo < 0 ? -extent * 2 : 0;
  const max = Math.max(extent * 2, hi);
  return [value, min, max, (0, import_TweakStore13.inferStep)(min, max)];
}
function withFromToRanges(config, counterpart) {
  const result = {};
  for (const [key, value] of Object.entries(config)) {
    const other = counterpart?.[key];
    if (typeof value === "number") {
      result[key] = inferFromToRange(key, value, typeof other === "number" ? other : void 0);
    } else if (isPlainObject(value) && !("type" in value)) {
      result[key] = withFromToRanges(
        value,
        isPlainObject(other) && !("type" in other) ? other : void 0
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}
function curveStatic(transition, duration) {
  if (!transition) return { duration };
  if (transition.type === "easing") return { duration, ease: transition.ease };
  const spring = springParams(transition);
  return { duration, spring, settle: springSettleDuration(spring) };
}
function sampleCurve(curve, elapsed) {
  if (elapsed <= 0) return 0;
  if (curve.spring) {
    if (curve.settle !== void 0 && elapsed >= curve.settle) return 1;
    return springProgress(elapsed, curve.spring);
  }
  if (curve.ease) {
    return cubicBezierProgress(clamp9(curve.duration > 0 ? elapsed / curve.duration : 1, 0, 1), curve.ease);
  }
  return curve.duration > 0 ? Math.min(1, elapsed / curve.duration) : 1;
}
function resolvedAtPath(resolved, path) {
  let node = resolved;
  for (const segment of path.split(".")) {
    node = isPlainObject(node) ? node[segment] : void 0;
  }
  return isPlainObject(node) ? node : {};
}
function computeStaticClips(parsed, flatValues) {
  const resolved = (0, import_TweakStore13.resolveTweakValues)(parsed.tweakConfig, flatValues);
  return parsed.clips.map(
    (clip) => buildClipStatic(resolvedAtPath(resolved, clip.key), clip, parsed.duration)
  );
}
function computeStaticTimeline(parsed, flatValues) {
  let clips = computeStaticClips(parsed, flatValues);
  const maxEnd = clips.reduce(
    (end, clip) => Math.max(end, clip.at + clip.duration),
    parsed.duration
  );
  const duration = maxEnd > parsed.duration ? Math.ceil(maxEnd * 100 - 1e-4) / 100 : parsed.duration;
  if (duration !== parsed.duration) {
    clips = clips.map(
      (clip) => clip.loop === "repeat" ? { ...clip, end: duration } : clip
    );
  }
  return { duration, clips };
}
function computeClipStaticFromValues(values, clip, timelineDuration) {
  return buildClipStatic(unflattenClipValues(values, clip.key), clip, timelineDuration);
}
function buildClipStatic(clipResolved, clip, timelineDuration) {
  {
    const at2 = typeof clipResolved.at === "number" ? clipResolved.at : 0;
    const from = isPlainObject(clipResolved.from) ? clipResolved.from : void 0;
    const single = isTransitionConfig(clipResolved.transition) ? clipResolved.transition : void 0;
    const staticClip = {
      key: clip.key,
      childKey: clip.group ? clip.key.slice(clip.group.length + 1) : clip.key,
      group: clip.group,
      at: at2,
      duration: 0,
      loop: "off",
      end: 0,
      isPhysics: false,
      from,
      tracks: [],
      explicitSteps: Boolean(clip.stepKeys?.length)
    };
    if (clip.tracks?.length) {
      const tracks = clip.tracks.map(({ prop, stepKeys }) => {
        const trackResolved = isPlainObject(clipResolved[prop]) ? clipResolved[prop] : {};
        const delay = typeof trackResolved.delay === "number" ? trackResolved.delay : 0;
        const fromValue = trackResolved.from;
        let steps;
        let trackDuration = 0;
        if (stepKeys?.length) {
          let running2 = fromValue;
          steps = stepKeys.map((stepKey) => {
            const stepResolved = isPlainObject(trackResolved[stepKey]) ? trackResolved[stepKey] : {};
            const storedDuration = typeof stepResolved.duration === "number" ? stepResolved.duration : 0;
            const raw = isTransitionConfig(stepResolved.transition) ? stepResolved.transition : void 0;
            const effective = raw ? resolveClipTransition(raw, storedDuration) : { transition: void 0, duration: storedDuration, isPhysics: false };
            const toValue = stepResolved.to;
            const step = {
              key: stepKey,
              offset: trackDuration,
              duration: effective.duration,
              isPhysics: effective.isPhysics,
              start: running2 === void 0 ? {} : { [prop]: running2 },
              to: toValue === void 0 ? {} : { [prop]: toValue },
              curve: curveStatic(effective.transition, effective.duration)
            };
            if (toValue !== void 0) running2 = toValue;
            trackDuration += effective.duration;
            return step;
          });
        } else {
          const storedDuration = typeof trackResolved.duration === "number" ? trackResolved.duration : 0;
          const raw = isTransitionConfig(trackResolved.transition) ? trackResolved.transition : void 0;
          const effective = raw ? resolveClipTransition(raw, storedDuration) : { transition: void 0, duration: storedDuration, isPhysics: false };
          const toValue = trackResolved.to;
          trackDuration = effective.duration;
          steps = [
            {
              key: null,
              offset: 0,
              duration: effective.duration,
              isPhysics: effective.isPhysics,
              start: fromValue === void 0 ? {} : { [prop]: fromValue },
              to: toValue === void 0 ? {} : { [prop]: toValue },
              curve: curveStatic(effective.transition, effective.duration)
            }
          ];
        }
        return { prop, delay, duration: trackDuration, steps };
      });
      staticClip.tracks = tracks;
      staticClip.props = tracks.map((track) => track.prop);
      staticClip.duration = tracks.reduce((max, track) => Math.max(max, track.delay + track.duration), 0);
      staticClip.from = Object.fromEntries(
        tracks.map((track) => [track.prop, track.steps[0].start[track.prop]])
      );
      staticClip.to = Object.fromEntries(
        tracks.map((track) => {
          const last = track.steps[track.steps.length - 1];
          return [track.prop, last.to[track.prop] ?? last.start[track.prop]];
        })
      );
      staticClip.loop = staticClip.duration > 0 ? clip.loop : "off";
      staticClip.end = staticClip.loop === "off" ? staticClip.at + staticClip.duration : timelineDuration;
      return staticClip;
    }
    if (clip.stepKeys?.length) {
      let running2 = { ...from ?? {} };
      let offset = 0;
      const steps = clip.stepKeys.map((stepKey) => {
        const stepResolved = isPlainObject(clipResolved[stepKey]) ? clipResolved[stepKey] : {};
        const storedDuration = typeof stepResolved.duration === "number" ? stepResolved.duration : 0;
        const raw = isTransitionConfig(stepResolved.transition) ? stepResolved.transition : void 0;
        const effective = raw ? resolveClipTransition(raw, storedDuration) : { transition: void 0, duration: storedDuration, isPhysics: false };
        const to = isPlainObject(stepResolved.to) ? stepResolved.to : {};
        const step = {
          key: stepKey,
          offset,
          duration: effective.duration,
          isPhysics: effective.isPhysics,
          start: running2,
          to,
          curve: curveStatic(effective.transition, effective.duration)
        };
        running2 = { ...running2, ...to };
        offset += effective.duration;
        return step;
      });
      staticClip.tracks = [{ delay: 0, duration: offset, steps }];
      staticClip.duration = offset;
      staticClip.to = running2;
    } else {
      const storedDuration = typeof clipResolved.duration === "number" ? clipResolved.duration : 0;
      const to = isPlainObject(clipResolved.to) ? clipResolved.to : void 0;
      if (single) {
        const effective = resolveClipTransition(single, storedDuration);
        staticClip.duration = effective.duration;
        staticClip.isPhysics = effective.isPhysics;
        staticClip.transition = effective.transition;
        staticClip.css = transitionToCss(effective.transition);
        staticClip.to = to;
        if (from && to) {
          staticClip.tracks = [
            {
              delay: 0,
              duration: effective.duration,
              steps: [
                {
                  key: null,
                  offset: 0,
                  duration: effective.duration,
                  isPhysics: effective.isPhysics,
                  start: from,
                  to,
                  curve: curveStatic(effective.transition, effective.duration)
                }
              ]
            }
          ];
        }
      } else {
        staticClip.duration = storedDuration;
        staticClip.to = to;
        if (from && to) {
          const base = resolveClipTransition(DEFAULT_CLIP_TRANSITION, storedDuration);
          staticClip.duration = base.duration;
          staticClip.tracks = [
            {
              delay: 0,
              duration: base.duration,
              steps: [
                {
                  key: null,
                  offset: 0,
                  duration: base.duration,
                  isPhysics: false,
                  start: from,
                  to,
                  curve: curveStatic(base.transition, base.duration)
                }
              ]
            }
          ];
        }
      }
    }
    if (staticClip.tracks.length) {
      const props = new Set(Object.keys(from ?? {}));
      for (const track of staticClip.tracks) {
        for (const step of track.steps) {
          for (const prop of Object.keys(step.to)) props.add(prop);
        }
      }
      staticClip.props = Array.from(props);
    }
    staticClip.loop = staticClip.duration > 0 ? clip.loop : "off";
    staticClip.end = staticClip.loop === "off" ? staticClip.at + staticClip.duration : timelineDuration;
    return staticClip;
  }
}
function stepAtPosition(steps, pos) {
  for (const step of steps) {
    if (pos < step.offset + step.duration) return step;
  }
  return steps[steps.length - 1];
}
function evalPropAtPos(steps, prop, pos) {
  const step = stepAtPosition(steps, pos);
  const within = Math.max(0, pos - step.offset);
  if (prop in step.to) {
    const eased = sampleCurve(step.curve, within);
    return interpolateResolved(step.start[prop], step.to[prop], eased);
  }
  return step.start[prop];
}
function computeClipState(clip, time, cycleTime = time) {
  const total = clip.duration;
  const looping = clip.loop === "repeat" && total > 0;
  const started = time >= clip.at || looping && cycleTime > time;
  const done = time >= clip.end;
  const elapsed = time - clip.at;
  const phaseElapsed = looping ? cycleTime - clip.at : elapsed;
  const fold = (e) => looping ? e % total : e;
  const basePos = started ? fold(Math.max(0, phaseElapsed)) : 0;
  const progress = total > 0 ? clamp9(basePos / total, 0, 1) : started ? 1 : 0;
  let current;
  let stepIndex = 0;
  if (clip.tracks.length && clip.props?.length) {
    current = {};
    for (const track of clip.tracks) {
      const props = track.prop !== void 0 ? [track.prop] : clip.props;
      for (const prop of props) {
        const startValue = track.steps[0]?.start[prop];
        if (!started) {
          if (startValue !== void 0) current[prop] = startValue;
          continue;
        }
        const phase = phaseElapsed - track.delay;
        if (phase <= 0) {
          if (startValue !== void 0) current[prop] = startValue;
          continue;
        }
        const pos = looping && track.duration > 0 ? phase % track.duration : phase;
        const value = evalPropAtPos(track.steps, prop, pos);
        if (value !== void 0) current[prop] = value;
      }
    }
    const shared = clip.tracks[0];
    if (started && clip.explicitSteps && shared.prop === void 0) {
      stepIndex = shared.steps.indexOf(stepAtPosition(shared.steps, basePos));
    }
  }
  return {
    at: clip.at,
    duration: clip.duration,
    loop: clip.loop,
    started,
    active: started && !done,
    done,
    progress,
    step: clip.explicitSteps ? stepIndex : void 0,
    from: clip.from,
    to: clip.to,
    animate: started ? clip.to : clip.from,
    transition: clip.transition,
    css: clip.css,
    current
  };
}
function interpolateResolved(from, to, p) {
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * p;
  }
  if (typeof from === "string" && typeof to === "string") {
    const mixed = mixHexColors(from, to, p);
    if (mixed) return mixed;
  }
  if (isPlainObject(from) && isPlainObject(to)) {
    const result = {};
    for (const key of Object.keys(from)) {
      result[key] = key in to ? interpolateResolved(from[key], to[key], p) : from[key];
    }
    for (const key of Object.keys(to)) {
      if (!(key in from)) result[key] = to[key];
    }
    return result;
  }
  return p < 0.5 ? from : to;
}
function parseHex2(hex) {
  if (!(0, import_TweakStore13.isHexColor)(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255
  ];
}
function mixHexColors(a, b, p) {
  const ca = parseHex2(a);
  const cb = parseHex2(b);
  if (!ca || !cb) return null;
  const t = clamp9(p, 0, 1);
  const mixed = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  const hex = (n) => n.toString(16).padStart(2, "0");
  const rgb = `#${hex(mixed[0])}${hex(mixed[1])}${hex(mixed[2])}`;
  return mixed[3] === 255 ? rgb : `${rgb}${hex(mixed[3])}`;
}
function transitionToCss(transition) {
  if (!transition) return void 0;
  if (transition.type === "easing") {
    return {
      transitionDuration: `${round22(transition.duration)}s`,
      transitionTimingFunction: `cubic-bezier(${transition.ease.map((v) => round22(v)).join(", ")})`
    };
  }
  const params = springParams(transition);
  const dampingRatio = params.damping / (2 * Math.sqrt(params.stiffness * params.mass));
  const duration = transition.visualDuration ?? springSettleDuration(params);
  const bounce = transition.bounce ?? Math.max(0, round22(1 - dampingRatio));
  return {
    transitionDuration: `${round22(duration)}s`,
    transitionTimingFunction: bounce > 0.05 ? `cubic-bezier(0.34, ${round22(1.2 + bounce)}, 0.64, 1)` : "cubic-bezier(0.25, 0.6, 0.35, 1)"
  };
}
function unflattenClipValues(values, clipKey) {
  const prefix = `${clipKey}.`;
  const result = {};
  const entries = Object.entries(values).filter(([path]) => path.startsWith(prefix)).map(([path, value]) => ({ segments: path.slice(prefix.length).split("."), value })).sort((a, b) => a.segments.length - b.segments.length);
  for (const { segments, value } of entries) {
    let node = result;
    for (let i = 0; i < segments.length - 1; i++) {
      const existing = node[segments[i]];
      node = isPlainObject(existing) ? existing : node[segments[i]] = {};
    }
    node[segments[segments.length - 1]] = cloneTimelineValue(value);
  }
  return result;
}
function cloneTimelineValue(value) {
  if (Array.isArray(value)) return value.map(cloneTimelineValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, cloneTimelineValue(nested)])
  );
}
function clampClipMove(at2, duration, timelineDuration) {
  return clamp9(round22(at2), 0, Math.max(0, timelineDuration - duration));
}
function clampClipResizeEnd(duration, at2, timelineDuration) {
  return clamp9(round22(duration), TIMELINE_MIN_CLIP_DURATION, timelineDuration - at2);
}
function clampClipResizeStart(newAt, at2, duration) {
  const clampedAt = clamp9(round22(newAt), 0, at2 + duration - TIMELINE_MIN_CLIP_DURATION);
  return { at: clampedAt, duration: round22(at2 + duration - clampedAt) };
}
function clampStepResize(duration, at2, otherStepsTotal, timelineDuration) {
  const max = Math.max(TIMELINE_MIN_CLIP_DURATION, timelineDuration - at2 - otherStepsTotal);
  return clamp9(round22(duration), TIMELINE_MIN_CLIP_DURATION, max);
}
function formatClock(time, tenths = false) {
  const safe = Math.max(0, time);
  const minutes = Math.floor(safe / 60);
  const seconds = safe - minutes * 60;
  const secondsText = tenths ? seconds.toFixed(1).padStart(4, "0") : String(Math.floor(seconds)).padStart(2, "0");
  return `${String(minutes).padStart(2, "0")}:${secondsText}`;
}
function formatSeconds(value) {
  return `${round22(value)}s`;
}

// src/move-presets.ts
var import_TweakStore14 = require("tweakers/store");
var CHOSEN_LINGER_MS = 800;
var CLOSE_ANIM_MS = 450;
var ENTER_MS = 20;
var MovePresetStoreClass = class {
  constructor() {
    this.view = null;
    this.saving = null;
    /** The panel's values (and active preset) as they were at open — the
     *  state Back restores and the compare hold plays. Null in provider mode. */
    this.original = null;
    this.previewEnabled = true;
    this.version = 0;
    this.listeners = /* @__PURE__ */ new Set();
    this.timers = /* @__PURE__ */ new Set();
    this.getView = () => this.view;
    this.getSaving = () => this.saving;
    this.getVersion = () => this.version;
    this.subscribe = (fn) => {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    };
  }
  notify() {
    this.version++;
    for (const fn of this.listeners) fn();
  }
  later(ms, fn) {
    const t = setTimeout(() => {
      this.timers.delete(t);
      fn();
    }, ms);
    this.timers.add(t);
  }
  clearTimers() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
  }
  /** Turn the browse-time live preview off (and back on) for heavy hosts. */
  setPreviewEnabled(on) {
    this.previewEnabled = on;
  }
  isPreviewEnabled() {
    return this.previewEnabled;
  }
  /** The panel's presets as screen rows — provider list when one is set. */
  items(panelId) {
    const provider = import_TweakStore14.TweakStore.getPresetProvider(panelId);
    if (provider) return provider.presets.map((p) => ({ id: p.id, label: p.label }));
    return import_TweakStore14.TweakStore.getPresets(panelId).map((p) => ({ id: p.id, label: p.name }));
  }
  /** Play a row's values without recording them — the browsing preview. */
  applyPreview(id) {
    const view = this.view;
    if (!view || !id || !this.previewEnabled || !this.original) return;
    const preset = import_TweakStore14.TweakStore.getPresets(view.panelId).find((p) => p.id === id);
    if (preset) import_TweakStore14.TweakStore.previewValues(view.panelId, preset.values);
  }
  open(panelId) {
    this.clearTimers();
    const active = import_TweakStore14.TweakStore.getActivePresetId(panelId);
    const items = this.items(panelId);
    const cursor = (active && items.some((i) => i.id === active) ? active : items[0]?.id) ?? null;
    this.original = import_TweakStore14.TweakStore.getPresetProvider(panelId) ? null : { ...import_TweakStore14.TweakStore.getValues(panelId) };
    this.view = { panelId, phase: "enter", cursor, chosen: null, comparing: false };
    this.notify();
    this.later(ENTER_MS, () => {
      if (this.view?.phase === "enter") {
        this.view = { ...this.view, phase: "open" };
        this.notify();
      }
    });
  }
  close() {
    if (!this.view || this.view.phase === "closing") return;
    this.clearTimers();
    this.view = { ...this.view, phase: "closing" };
    this.notify();
    this.later(CLOSE_ANIM_MS, () => {
      if (this.view?.phase === "closing") {
        this.view = null;
        this.original = null;
        this.notify();
      }
    });
  }
  /**
   * Put everything back and dismiss: the pre-navigator values return, the
   * previewed ones evaporate. Back's action, and a Menu tap on an open
   * screen. After a confirm there is nothing to take back — it's a no-op.
   */
  cancel() {
    const view = this.view;
    if (!view || view.phase === "closing" || view.chosen) return;
    if (this.original) import_TweakStore14.TweakStore.previewValues(view.panelId, this.original);
    this.view = { ...view, comparing: false };
    this.close();
  }
  toggle(panelId) {
    if (this.view && this.view.panelId === panelId && this.view.phase !== "closing") this.cancel();
    else this.open(panelId);
  }
  /** Walk the cursor by wheel detents — each rest is previewed live. */
  scroll(delta) {
    const view = this.view;
    if (!view || view.phase === "closing" || view.chosen) return;
    const items = this.items(view.panelId);
    if (!items.length) return;
    const step = Math.round(delta) || Math.sign(delta);
    const index = items.findIndex((i) => i.id === view.cursor);
    const next = Math.max(0, Math.min(items.length - 1, (index < 0 ? 0 : index) + step));
    if (items[next].id === view.cursor && !view.comparing) return;
    this.view = { ...view, cursor: items[next].id, comparing: false };
    this.applyPreview(items[next].id);
    this.notify();
  }
  /** Rest the cursor on a row by id — a search landing the wheel on the next
   *  match, previewed live exactly as a wheel turn is. */
  rest(id) {
    const view = this.view;
    if (!view || view.phase === "closing" || view.chosen) return;
    if (!this.items(view.panelId).some((i) => i.id === id)) return;
    if (id === view.cursor && !view.comparing) return;
    this.view = { ...view, cursor: id, comparing: false };
    this.applyPreview(id);
    this.notify();
  }
  /** Menu held down: play the pre-navigator sound for as long as it's held. */
  compareStart() {
    const view = this.view;
    if (!view || view.phase !== "open" || view.chosen || view.comparing) return;
    if (!this.previewEnabled || !this.original) return;
    this.view = { ...view, comparing: true };
    import_TweakStore14.TweakStore.previewValues(view.panelId, this.original);
    this.notify();
  }
  /** Menu released: back to the previewed row. */
  compareEnd() {
    const view = this.view;
    if (!view || !view.comparing) return;
    this.view = { ...view, comparing: false };
    this.applyPreview(view.cursor);
    this.notify();
  }
  /**
   * Confirm a row and keep it: the preset loads for real (active preset,
   * persistence), the row reads green for a beat, then the screen dismisses.
   */
  choose(id) {
    const view = this.view;
    if (!view || view.phase !== "open" || view.chosen) return;
    if (!this.items(view.panelId).some((i) => i.id === id)) return;
    const provider = import_TweakStore14.TweakStore.getPresetProvider(view.panelId);
    if (provider) void provider.onSelect(id);
    else import_TweakStore14.TweakStore.loadPreset(view.panelId, id);
    this.view = { ...view, cursor: id, chosen: id, comparing: false };
    this.notify();
    this.later(CHOSEN_LINGER_MS, () => this.close());
  }
  /** Confirm the cursor's row — the jog-click path. */
  confirm() {
    if (this.view?.cursor) this.choose(this.view.cursor);
  }
  beginSave(panelId) {
    this.saving = { panelId, suggested: `Preset ${this.items(panelId).length + 1}` };
    this.notify();
  }
  cancelSave() {
    if (this.saving) {
      this.saving = null;
      this.notify();
    }
  }
  commitSave(name) {
    const saving = this.saving;
    if (!saving) return;
    const label = name.trim() || saving.suggested;
    const provider = import_TweakStore14.TweakStore.getPresetProvider(saving.panelId);
    if (provider) void provider.onCreate(label);
    else import_TweakStore14.TweakStore.savePreset(saving.panelId, label);
    this.saving = null;
    this.notify();
  }
};
var MovePresetStore = new MovePresetStoreClass();

// src/move-timeline.ts
var MOVE_TIMELINE_MAX_ZOOM = 256;
var PAGE_LEAD = 0.25;
var clamp10 = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function timelineWindow(duration, zoom, start) {
  const whole = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const span = whole / Math.max(1, zoom);
  return { start: clamp10(Number.isFinite(start) ? start : 0, 0, Math.max(0, whole - span)), span };
}
function followWindow(time, duration, zoom, start) {
  const w = timelineWindow(duration, zoom, start);
  if (w.span <= 0 || time >= w.start && time <= w.start + w.span) return w.start;
  const lead = time < w.start ? w.span * (1 - PAGE_LEAD) : w.span * PAGE_LEAD;
  return timelineWindow(duration, zoom, time - lead).start;
}
function zoomWindow(anchor, duration, zoom, start, nextZoom) {
  const next = clamp10(nextZoom, 1, MOVE_TIMELINE_MAX_ZOOM);
  const w = timelineWindow(duration, zoom, start);
  const onScreen = w.span > 0 && anchor >= w.start && anchor <= w.start + w.span;
  const at2 = onScreen ? anchor : w.start + w.span / 2;
  const ratio = w.span > 0 ? (at2 - w.start) / w.span : 0;
  const nextSpan = timelineWindow(duration, next, 0).span;
  return { zoom: next, start: timelineWindow(duration, next, at2 - ratio * nextSpan).start };
}
var TICK_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
function timelineTicks(start, span, width, spacing = 96) {
  if (!(span > 0) || !(width > 0)) return { step: 1, major: [], minor: [] };
  const wanted = spacing / width * span;
  const step = TICK_STEPS.find((s) => s >= wanted) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const leading = Number(String(step).replace(/[0.]/g, "")[0]);
  const parts = step === 15 ? 3 : leading === 2 ? 4 : 5;
  const minorStep = step / parts;
  const major = [];
  const minor = [];
  const first = Math.ceil((start - 1e-9) / minorStep);
  const last = Math.floor((start + span + 1e-9) / minorStep);
  for (let i = first; i <= last; i++) {
    const t = Number((i * minorStep).toFixed(6));
    (i % parts === 0 ? major : minor).push(t);
  }
  return { step, major, minor };
}
function formatTimelineTick(time, step) {
  if (step >= 1) return `${Math.floor(time / 60)}:${String(Math.round(time % 60)).padStart(2, "0")}`;
  const decimals = step >= 0.1 ? 1 : 2;
  return `${time.toFixed(decimals)}s`;
}
function packTimelineRows(spans) {
  const rowEnds = [];
  const rows = new Array(spans.length);
  const order = spans.map((_, i) => i).sort((a, b) => spans[a].at - spans[b].at || a - b);
  for (const i of order) {
    const { at: at2, end } = spans[i];
    let row = rowEnds.findIndex((rowEnd) => rowEnd <= at2 + 1e-9);
    if (row < 0) row = rowEnds.push(end) - 1;
    else rowEnds[row] = end;
    rows[i] = row;
  }
  return rows;
}
function timelineRowHeight(rows, compact = false) {
  if (compact) return 4;
  if (rows >= 8) return 10;
  if (rows >= 6) return 14;
  return 18;
}
function timelineClock(time) {
  const t = Math.max(0, Number.isFinite(time) ? time : 0);
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(Math.floor(t % 1 * 100)).padStart(2, "0")}`;
}
function timelineReadout(time) {
  const t = Math.max(0, time);
  const minutes = Math.floor(t / 60);
  const seconds = t - minutes * 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(1)}`;
}
var wheelTaken = () => {
  const presets = MovePresetStore.getView();
  return MoveSearchStore.isOpen() || !!presets && presets.phase !== "closing" || !!MoveColorStore.getView() || !!PresetExplorationStore.getState() || !!MoveSurfaceStore.getState().screen || MoveWaveformStore.wantsSteps();
};
var VOLUME_EVENT = "move-tweakers:volume";
var JOG_EVENT = "move-tweakers:jog";
var JOG_CLICK_EVENT = "move-tweakers:jog-click";
var MoveTimelineStoreClass = class {
  constructor() {
    this.claims = [];
    this.zoom = 1;
    this.start = 0;
    this.recording = false;
    this.recordFrom = 0;
    this.teardown = null;
    this.listeners = /* @__PURE__ */ new Set();
    this.version = 0;
  }
  /**
   * Put a timeline on the surface: the knob, the wheel and the transport keys
   * are its until the returned release. The knob names itself as the
   * timeline's time, on the panel and on the Move's screen.
   */
  register(id, options = {}) {
    const claim = { id, options };
    this.claims.push(claim);
    this.hold(claim);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const front = this.front() === claim;
      this.claims = this.claims.filter((c) => c !== claim);
      if (!front) return;
      const next = this.front();
      if (next) this.hold(next);
      else this.letGo();
    };
  }
  /** The timeline holding the surface, or null. */
  activeId() {
    return this.front()?.id ?? null;
  }
  isRegistered() {
    return this.claims.length > 0;
  }
  /** True while a timeline holds the volume knob — read by the kit's claims. */
  claimsKnob() {
    return this.claims.length > 0;
  }
  /** Whether the timeline in front records — the clock's Rec button follows. */
  canRecord() {
    return !!this.front()?.options.onRecord;
  }
  isRecording() {
    return this.recording;
  }
  /** Where the take in progress started, in seconds. */
  recordingFrom() {
    return this.recordFrom;
  }
  getZoom() {
    return this.zoom;
  }
  /** The window on screen for the timeline in front. */
  getWindow() {
    const id = this.activeId();
    return timelineWindow(id ? TimelineStore.getTransport(id).duration : 0, this.zoom, this.start);
  }
  /** The clock the panel shows: m:ss:cc of the playhead. */
  clock() {
    const id = this.activeId();
    return timelineClock(id ? TimelineStore.getTransport(id).time : 0);
  }
  // ── the transport, as the keys and the clock run it ──
  togglePlay() {
    const id = this.activeId();
    if (!id) return;
    if (TimelineStore.getTransport(id).playing) TimelineStore.pause(id);
    else TimelineStore.play(id);
  }
  toggleLoop() {
    const id = this.activeId();
    if (id) TimelineStore.setLooping(id, !TimelineStore.isLooping(id));
  }
  /** Let the loop region go — looping, if on, runs the whole timeline again. */
  clearLoopRegion() {
    const id = this.activeId();
    if (id) TimelineStore.clearLoopRegion(id);
  }
  /** Start a take (rolling the transport if it stands still), or end the one running. */
  toggleRecord() {
    const claim = this.front();
    if (!claim?.options.onRecord) return;
    if (this.recording) {
      this.stopRecording();
      return;
    }
    const transport = TimelineStore.getTransport(claim.id);
    this.recording = true;
    this.recordFrom = transport.time >= transport.duration ? 0 : transport.time;
    this.notify();
    claim.options.onRecord(true);
    if (!transport.playing) TimelineStore.play(claim.id);
  }
  // ── the hands ──
  /** The volume knob: the waveform's scrub — its feel, over the shown window. */
  scrub(delta, fine = false) {
    const id = this.activeId();
    if (!id || !delta) return;
    const { time, duration } = TimelineStore.getTransport(id);
    if (duration <= 0) return;
    const at2 = scrubBy(time / duration, delta, fine, this.zoom, duration) * duration;
    TimelineStore.seek(id, at2);
  }
  /** The wheel: proportional zoom, around the playhead. */
  zoomBy(delta) {
    const id = this.activeId();
    if (!id || !delta) return;
    const { time } = TimelineStore.getTransport(id);
    this.zoomTo(zoomBy(this.zoom, delta), time);
  }
  /** Zoom to a level around `anchor` seconds — the playhead, or a pointer. */
  zoomTo(zoom, anchor) {
    const id = this.activeId();
    if (!id) return;
    const { duration } = TimelineStore.getTransport(id);
    const next = zoomWindow(anchor, duration, this.zoom, this.start, zoom);
    this.setView(next.zoom, next.start);
  }
  /** Slide the window to start at `start` seconds, keeping the zoom. */
  panTo(start) {
    this.setView(this.zoom, start);
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  getVersion() {
    return this.version;
  }
  // ── internals ──
  front() {
    return this.claims[this.claims.length - 1];
  }
  setView(zoom, start) {
    const id = this.activeId();
    const duration = id ? TimelineStore.getTransport(id).duration : 0;
    const nextZoom = clamp10(zoom, 1, MOVE_TIMELINE_MAX_ZOOM);
    const nextStart = timelineWindow(duration, nextZoom, start).start;
    if (nextZoom === this.zoom && nextStart === this.start) return;
    this.zoom = nextZoom;
    this.start = nextStart;
    this.notify();
  }
  stopRecording() {
    if (!this.recording) return;
    this.recording = false;
    this.notify();
    this.front()?.options.onRecord?.(false);
  }
  /** Wire the hardware to `claim`, replacing whatever held it. */
  hold(claim) {
    this.letGo(claim);
    const { id } = claim;
    const readout = {
      label: "time",
      getValue: () => timelineReadout(TimelineStore.getTransport(id).time)
    };
    MoveVolumeDisplay.set(readout);
    const keys = [
      MoveFunctions.push("play", () => this.togglePlay(), { label: "Play", chip: false }),
      MoveFunctions.push("loop", ({ shift }) => shift ? this.clearLoopRegion() : this.toggleLoop(), { label: "Loop", chip: false }),
      ...claim.options.onRecord ? [MoveFunctions.push("rec", () => this.toggleRecord(), { label: "Record", chip: false })] : []
    ];
    const onVolume = (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      const detail = event.detail ?? {};
      this.scrub(Number(detail.delta) || 0, !!detail.shift);
    };
    const unclaimed = (event, act) => {
      if (event.defaultPrevented || wheelTaken()) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented && !wheelTaken() && this.activeId() === id) act();
      });
    };
    const onJog = (event) => unclaimed(event, () => this.zoomBy(Number(event.detail?.delta) || 0));
    const onJogClick = (event) => unclaimed(event, () => this.setView(1, 0));
    const win = typeof window !== "undefined" ? window : null;
    win?.addEventListener(VOLUME_EVENT, onVolume);
    win?.addEventListener(JOG_EVENT, onJog);
    win?.addEventListener(JOG_CLICK_EVENT, onJogClick);
    const offTransport = TimelineStore.subscribe(id, () => {
      const transport = TimelineStore.getTransport(id);
      if (this.recording && !transport.playing) this.stopRecording();
      const start = followWindow(transport.time, transport.duration, this.zoom, this.start);
      if (start !== this.start) this.setView(this.zoom, start);
    });
    this.zoom = 1;
    this.start = 0;
    this.teardown = () => {
      offTransport();
      win?.removeEventListener(VOLUME_EVENT, onVolume);
      win?.removeEventListener(JOG_EVENT, onJog);
      win?.removeEventListener(JOG_CLICK_EVENT, onJogClick);
      if (this.recording) {
        this.recording = false;
        claim.options.onRecord?.(false);
      }
      for (const release of keys) release();
      if (MoveVolumeDisplay.get() === readout) MoveVolumeDisplay.clear();
    };
    this.notify();
  }
  /** Hand the hardware back. `next` is the claim about to take it, if any. */
  letGo(next) {
    const teardown = this.teardown;
    this.teardown = null;
    teardown?.();
    if (!next) this.notify();
  }
  notify() {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
};
var MoveTimelineStore = new MoveTimelineStoreClass();

// src/components/MoveTimeline.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var DOCK_GAP2 = 14;
var DRAG_PX = 4;
var MIN_CLIP_PX = 6;
var LABEL_CLIP_PX = 48;
var LABEL_EDGE_PX = 28;
var PINCH_GAIN = 0.01;
function MoveTimeline({
  id,
  onRecord,
  variant = "dock",
  accent,
  theme = "system",
  productionEnabled = isDevDefault,
  className
}) {
  const [mounted, setMounted] = (0, import_react14.useState)(false);
  (0, import_react14.useEffect)(() => setMounted(true), []);
  const recordRef = (0, import_react14.useRef)(onRecord);
  recordRef.current = onRecord;
  const records = !!onRecord;
  (0, import_react14.useEffect)(() => {
    if (!productionEnabled) return;
    return MoveTimelineStore.register(id, records ? { onRecord: (on) => recordRef.current?.(on) } : {});
  }, [productionEnabled, id, records]);
  const meta = (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((cb) => TimelineStore.subscribeGlobal(cb), []),
    () => TimelineStore.getTimeline(id),
    () => TimelineStore.getTimeline(id)
  );
  const values = (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((cb) => import_TweakStore15.TweakStore.subscribe(id, cb), [id]),
    () => import_TweakStore15.TweakStore.getValues(id),
    () => import_TweakStore15.TweakStore.getValues(id)
  );
  (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  const subscribeTransport = (0, import_react14.useCallback)((cb) => TimelineStore.subscribe(id, cb), [id]);
  const region = (0, import_react14.useSyncExternalStore)(subscribeTransport, () => TimelineStore.getLoopRegion(id), () => void 0);
  const looping = (0, import_react14.useSyncExternalStore)(subscribeTransport, () => TimelineStore.isLooping(id), () => true);
  const inFront = MoveTimelineStore.activeId() === id;
  const recording = inFront && MoveTimelineStore.isRecording();
  const duration = meta?.duration ?? 0;
  const view = inFront ? MoveTimelineStore.getWindow() : timelineWindow(duration, 1, 0);
  const rulerRef = (0, import_react14.useRef)(null);
  const [width, setWidth] = (0, import_react14.useState)(0);
  (0, import_react14.useLayoutEffect)(() => {
    const ruler = rulerRef.current;
    if (!ruler) return;
    const measure = () => setWidth(Math.round(ruler.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ruler);
    return () => ro.disconnect();
  }, [mounted, meta !== void 0]);
  const pxPerSecond = view.span > 0 && width > 0 ? width / view.span : 0;
  const x = (t) => (t - view.start) * pxPerSecond;
  const timeAt = (clientX) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return Math.min(duration, Math.max(0, view.start + (clientX - rect.left) / rect.width * view.span));
  };
  const heldRows = (0, import_react14.useRef)(null);
  const [holding, setHolding] = (0, import_react14.useState)(false);
  const liveRows = (0, import_react14.useMemo)(() => buildRows(meta?.clips ?? [], values, duration), [meta, values, duration]);
  const rows = holding && heldRows.current ? refreshRows(heldRows.current, values, duration) : liveRows;
  const [compact, setCompact] = (0, import_react14.useState)(false);
  const rowHeight = timelineRowHeight(rows.length, compact);
  const playheadRef = (0, import_react14.useRef)(null);
  const takeRef = (0, import_react14.useRef)(null);
  const frame = (0, import_react14.useRef)({ start: view.start, pxPerSecond, width });
  frame.current = { start: view.start, pxPerSecond, width };
  (0, import_react14.useEffect)(() => {
    const paint = () => {
      const { start, pxPerSecond: pps, width: w } = frame.current;
      const { time } = TimelineStore.getTransport(id);
      const at2 = (time - start) * pps;
      const head = playheadRef.current;
      if (head) {
        head.style.transform = `translateX(${at2}px)`;
        head.style.visibility = pps > 0 && at2 >= -1 && at2 <= w + 1 ? "visible" : "hidden";
      }
      const take = takeRef.current;
      if (take) {
        const from = Math.max(0, (MoveTimelineStore.recordingFrom() - start) * pps);
        take.style.left = `${from}px`;
        take.style.width = `${Math.max(0, Math.min(w, at2) - from)}px`;
      }
    };
    paint();
    return TimelineStore.subscribe(id, paint);
  }, [id, view.start, pxPerSecond, width, recording]);
  const [loopDraft, setLoopDraft] = (0, import_react14.useState)(null);
  const rulerDrag = (0, import_react14.useRef)(null);
  const onRulerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    rulerDrag.current = { x: e.clientX, from: timeAt(e.clientX), moved: false };
  };
  const onRulerMove = (e) => {
    const drag = rulerDrag.current;
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) <= DRAG_PX) return;
    drag.moved = true;
    const to = timeAt(e.clientX);
    setLoopDraft({ start: Math.min(drag.from, to), end: Math.max(drag.from, to) });
  };
  const onRulerUp = () => {
    const drag = rulerDrag.current;
    rulerDrag.current = null;
    if (!drag) return;
    if (drag.moved && loopDraft) {
      TimelineStore.setLoopRegion(id, loopDraft.start, loopDraft.end);
      TimelineStore.setLooping(id, true);
    } else if (!drag.moved) {
      TimelineStore.seek(id, drag.from);
    }
    setLoopDraft(null);
  };
  const onRulerCancel = () => {
    rulerDrag.current = null;
    setLoopDraft(null);
  };
  const scrub = (0, import_react14.useRef)(null);
  const onLanesDown = (e) => {
    if (e.button !== 0 || e.target.closest(".tweakers-move-timeline-clip")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scrub.current = { wasPlaying: TimelineStore.getTransport(id).playing };
    TimelineStore.pause(id);
    TimelineStore.seek(id, timeAt(e.clientX));
  };
  const onLanesMove = (e) => {
    if (scrub.current) TimelineStore.seek(id, timeAt(e.clientX));
  };
  const onLanesUp = () => {
    if (scrub.current?.wasPlaying) TimelineStore.play(id);
    scrub.current = null;
  };
  const displayRef = (0, import_react14.useRef)(null);
  (0, import_react14.useEffect)(() => {
    const el = displayRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (MoveTimelineStore.activeId() !== id) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        MoveTimelineStore.zoomTo(MoveTimelineStore.getZoom() * Math.exp(-e.deltaY * PINCH_GAIN), timeAtRef.current(e.clientX));
        return;
      }
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!sideways || MoveTimelineStore.getZoom() <= 1) return;
      e.preventDefault();
      const w = MoveTimelineStore.getWindow();
      const pps = frame.current.pxPerSecond;
      if (pps > 0) MoveTimelineStore.panTo(w.start + sideways / pps);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [id, mounted, meta !== void 0]);
  const timeAtRef = (0, import_react14.useRef)(timeAt);
  timeAtRef.current = timeAt;
  const [dockBottom, setDockBottom] = (0, import_react14.useState)(DOCK_GAP2);
  (0, import_react14.useEffect)(() => {
    if (variant !== "dock" || typeof window === "undefined") return;
    const panel = () => document.querySelector(".tweakers-move-root .tweakers-move");
    const measure = () => {
      const h = panel()?.getBoundingClientRect().height ?? 0;
      setDockBottom(h > 0 ? h + DOCK_GAP2 : DOCK_GAP2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const el = panel();
    if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [variant, mounted]);
  if (!productionEnabled || !meta) return null;
  const ticks = timelineTicks(view.start, view.span, width);
  const shownLoop = loopDraft ?? region ?? null;
  const card = /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
    "div",
    {
      className: `tweakers-move-surface tweakers-move-timeline${className ? ` ${className}` : ""}`,
      "data-variant": variant,
      "data-recording": recording || void 0,
      "data-rows": rowHeight,
      style: {
        ...accent ? { "--move-timeline-accent": accent } : {},
        ...variant === "dock" ? { bottom: `${dockBottom}px` } : {}
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { ref: displayRef, className: "tweakers-move-timeline-display", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-move-timeline-corner", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-title", children: meta.name }) }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            type: "button",
            className: "tweakers-move-timeline-compact",
            "aria-pressed": compact,
            "aria-label": compact ? "Show rows with names" : "Squeeze rows",
            title: compact ? "Show rows with names" : "Squeeze rows",
            onClick: () => setCompact((on) => !on),
            children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { viewBox: "0 0 12 12", "aria-hidden": "true", children: compact ? [2.5, 6, 9.5].map((y) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: `M2 ${y}H10` }, y)) : [4.5, 6, 7.5].map((y) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: `M2 ${y}H10` }, y)) })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
          "div",
          {
            ref: rulerRef,
            className: "tweakers-move-timeline-ruler",
            onPointerDown: onRulerDown,
            onPointerMove: onRulerMove,
            onPointerUp: onRulerUp,
            onPointerCancel: onRulerCancel,
            onDoubleClick: () => TimelineStore.clearLoopRegion(id),
            title: "Click to jump \xB7 drag to loop \xB7 double-click to let the loop go",
            children: [
              shownLoop && pxPerSecond > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "div",
                {
                  className: "tweakers-move-timeline-loop",
                  "data-on": looping || loopDraft ? true : void 0,
                  style: { left: `${x(shownLoop.start)}px`, width: `${Math.max(1, (shownLoop.end - shownLoop.start) * pxPerSecond)}px` }
                }
              ),
              recording && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { ref: takeRef, className: "tweakers-move-timeline-take" }),
              ticks.minor.map((t) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-tick", style: { left: `${x(t)}px` } }, `m${t}`)),
              ticks.major.map((t) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-tick", "data-major": true, style: { left: `${x(t)}px` }, children: x(t) < width - LABEL_EDGE_PX && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-tick-label", children: formatTimelineTick(t, ticks.step) }) }, `M${t}`))
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-move-timeline-names", children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-move-timeline-name", title: row.label, children: row.label }, row.key)) }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
          "div",
          {
            className: "tweakers-move-timeline-lanes",
            onPointerDown: onLanesDown,
            onPointerMove: onLanesMove,
            onPointerUp: onLanesUp,
            onPointerCancel: onLanesUp,
            children: [
              shownLoop && looping && pxPerSecond > 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                "div",
                {
                  className: "tweakers-move-timeline-loop-lanes",
                  style: { left: `${x(shownLoop.start)}px`, width: `${Math.max(1, (shownLoop.end - shownLoop.start) * pxPerSecond)}px` }
                }
              ),
              rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-move-timeline-lane", children: row.clips.map(({ meta: clip, stat }) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                TimelineClipBar,
                {
                  timelineId: id,
                  clip,
                  stat,
                  duration,
                  viewStart: view.start,
                  viewEnd: view.start + view.span,
                  pxPerSecond,
                  onHold: (on) => {
                    heldRows.current = on ? liveRows : null;
                    setHolding(on);
                  }
                },
                clip.key
              )) }, row.key))
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-move-timeline-heads", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { ref: playheadRef, className: "tweakers-move-timeline-playhead" }) })
      ] })
    }
  );
  if (variant !== "dock") return card;
  if (!mounted || typeof document === "undefined") return null;
  return (0, import_react_dom4.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "tweakers-root tweakers-move-root", "data-theme": theme, "data-timeline-dock": "true", children: card }),
    document.body
  );
}
function buildRows(clips, values, duration) {
  const rows = [];
  const layers = /* @__PURE__ */ new Map();
  for (const clip of clips) {
    if (!clip.group) {
      rows.push({ key: clip.key, label: clip.label, clips: [{ meta: clip, stat: computeClipStaticFromValues(values, clip, duration) }] });
      continue;
    }
    let layer = layers.get(clip.group);
    if (!layer) {
      layer = [];
      layers.set(clip.group, layer);
      rows.push({ key: `layer:${clip.group}`, label: (0, import_TweakStore15.formatLabel)(clip.group), clips: [] });
    }
    layer.push(clip);
  }
  return rows.flatMap((row) => {
    if (!row.key.startsWith("layer:")) return [row];
    const group = row.key.slice("layer:".length);
    const members = (layers.get(group) ?? []).map((clip) => ({ meta: clip, stat: computeClipStaticFromValues(values, clip, duration) }));
    const packed = packTimelineRows(members.map(({ stat }) => ({ at: stat.at, end: stat.loop === "repeat" ? duration : stat.at + stat.duration })));
    const count = members.length ? Math.max(...packed) + 1 : 1;
    return Array.from({ length: count }, (_, i) => ({
      key: `${row.key}:${i}`,
      label: i === 0 ? row.label : "",
      clips: members.filter((_2, m) => packed[m] === i)
    }));
  });
}
function refreshRows(rows, values, duration) {
  return rows.map((row) => ({
    ...row,
    clips: row.clips.map(({ meta }) => ({ meta, stat: computeClipStaticFromValues(values, meta, duration) }))
  }));
}
function TimelineClipBar({
  timelineId,
  clip,
  stat,
  duration,
  viewStart,
  viewEnd,
  pxPerSecond,
  onHold
}) {
  const drag = (0, import_react14.useRef)(null);
  const [dragging, setDragging] = (0, import_react14.useState)(false);
  const legs = stat.explicitSteps ? stat.tracks[0]?.steps ?? [] : [];
  const composite = !!clip.tracks?.length;
  const fixed2 = composite || (legs.length ? false : stat.isPhysics);
  const resizable = !fixed2 && stat.duration > 0;
  const onDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const target = e.target;
    const join = target.dataset.join;
    const edge = target.dataset.edge;
    drag.current = {
      mode: join !== void 0 ? "join" : edge && resizable ? edge : "move",
      join: join !== void 0 ? Number(join) : void 0,
      x: e.clientX,
      at: stat.at,
      duration: stat.duration,
      legs: legs.map((leg) => leg.duration),
      moved: false
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    onHold(true);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d || pxPerSecond <= 0) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) <= DRAG_PX) return;
      d.moved = true;
      setDragging(true);
    }
    const dt = dx / pxPerSecond;
    if (d.mode === "join" && d.legs && d.join !== void 0) {
      const others = d.legs.reduce((sum, leg, i) => i === d.join ? sum : sum + leg, 0);
      import_TweakStore15.TweakStore.updateValue(timelineId, `${clip.key}.${legs[d.join].key ?? ""}.duration`, clampStepResize(d.legs[d.join] + dt, d.at, others, duration));
    } else if (d.mode === "move") {
      import_TweakStore15.TweakStore.updateValue(timelineId, `${clip.key}.at`, clampClipMove(d.at + dt, d.duration, duration));
    } else if (d.mode === "end") {
      import_TweakStore15.TweakStore.updateValue(timelineId, `${clip.key}.duration`, clampClipResizeEnd(d.duration + dt, d.at, duration));
    } else if (d.legs?.length) {
      const next = clampClipResizeStart(Math.max(0, d.at + dt), d.at, d.legs[0]);
      import_TweakStore15.TweakStore.updateValues(timelineId, { [`${clip.key}.at`]: next.at, [`${clip.key}.${legs[0].key ?? ""}.duration`]: next.duration });
    } else {
      const next = clampClipResizeStart(Math.max(0, d.at + dt), d.at, d.duration);
      import_TweakStore15.TweakStore.updateValues(timelineId, { [`${clip.key}.at`]: next.at, [`${clip.key}.duration`]: next.duration });
    }
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    onHold(false);
    if (d && !d.moved) TimelineStore.seek(timelineId, d.at);
  };
  const onCancel = () => {
    drag.current = null;
    setDragging(false);
    onHold(false);
  };
  if (pxPerSecond <= 0) return null;
  const left = (stat.at - viewStart) * pxPerSecond;
  const width = Math.max(MIN_CLIP_PX, stat.duration * pxPerSecond);
  const repeats = stat.loop === "repeat" && stat.duration > 0;
  const ghosts = [];
  if (repeats) {
    const first = Math.max(1, Math.floor((viewStart - stat.at) / stat.duration));
    for (let i = first; i < first + 512; i++) {
      const start = stat.at + stat.duration * i;
      if (start >= Math.min(duration, viewEnd) - 1e-6) break;
      ghosts.push(start);
    }
  }
  const joins = [];
  let run = 0;
  for (const leg of legs) {
    run += leg.duration;
    joins.push(run);
  }
  const length = `${fixed2 && !composite ? "~" : ""}${formatSeconds(stat.duration)}`;
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
    ghosts.map((start) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "div",
      {
        className: "tweakers-move-timeline-ghost",
        "aria-hidden": "true",
        style: { left: `${(start - viewStart) * pxPerSecond}px`, width: `${Math.max(1, Math.min(stat.duration, duration - start) * pxPerSecond - 2)}px` }
      },
      start
    )),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
      "div",
      {
        className: "tweakers-move-timeline-clip",
        "data-composite": composite || void 0,
        "data-dragging": dragging || void 0,
        "data-marker": !stat.tracks.length || void 0,
        style: { left: `${left}px`, width: `${width}px` },
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onCancel,
        title: `${clip.label} \u2014 ${formatSeconds(stat.at)} for ${length}${repeats ? ", repeating" : ""}`,
        children: [
          legs.length > 1 && joins.slice(0, -1).map((at2, i) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-join", "data-join": i, style: { left: `${at2 * pxPerSecond}px` } }, `j${i}`)),
          width > LABEL_CLIP_PX && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-clip-length", children: length }),
          resizable && !legs.length && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-edge", "data-edge": "start" }),
          resizable && !legs.length && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-edge", "data-edge": "end" }),
          legs.length > 0 && !legs[legs.length - 1].isPhysics && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-timeline-edge", "data-edge": "end", "data-join": legs.length - 1 })
        ]
      }
    )
  ] });
}
function MoveTimelineZoom() {
  (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "tweakers-move-wave-zoom", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "tweakers-move-wave-zoom-dot" }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "tweakers-move-wave-zoom-label", children: [
      parseFloat(MoveTimelineStore.getZoom().toFixed(1)),
      "x"
    ] })
  ] });
}
function MoveTimelineClock() {
  (0, import_react14.useSyncExternalStore)(
    (0, import_react14.useCallback)((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.getVersion(),
    () => 0
  );
  const id = MoveTimelineStore.activeId() ?? "";
  const subscribe = (0, import_react14.useCallback)((cb) => TimelineStore.subscribe(id, cb), [id]);
  const playing2 = (0, import_react14.useSyncExternalStore)(subscribe, () => TimelineStore.getTransport(id).playing, () => false);
  const looping = (0, import_react14.useSyncExternalStore)(subscribe, () => TimelineStore.isLooping(id), () => true);
  const recording = MoveTimelineStore.isRecording();
  const canRecord = MoveTimelineStore.canRecord();
  const clockRef = (0, import_react14.useRef)(null);
  (0, import_react14.useEffect)(() => {
    let raf = requestAnimationFrame(function tick() {
      const text = MoveTimelineStore.clock();
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "tweakers-move-volume tweakers-move-timeline-clock", "data-record": canRecord || void 0, children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-timeline-key",
        "data-on": playing2 || void 0,
        "aria-label": playing2 ? "Pause" : "Play",
        "aria-pressed": playing2,
        onClick: (e) => MoveFunctions.run("play", { shift: e.shiftKey }),
        children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d: ICON_PLAY, fill: "currentColor" }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { ref: clockRef, className: "tweakers-move-volume-value", children: MoveTimelineStore.clock() }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-timeline-key",
        "data-on": looping || void 0,
        "aria-label": "Loop",
        "aria-pressed": looping,
        title: "Loop \xB7 Shift-click lets the loop region go",
        onClick: (e) => MoveFunctions.run("loop", { shift: e.shiftKey }),
        children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: ICON_LOOP.map((d) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", { d, fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }, d)) })
      }
    ),
    canRecord && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "button",
      {
        type: "button",
        className: "tweakers-move-timeline-key",
        "data-name": "rec",
        "data-on": recording || void 0,
        "aria-label": "Record",
        "aria-pressed": recording,
        onClick: (e) => MoveFunctions.run("rec", { shift: e.shiftKey }),
        children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("circle", { cx: "12", cy: "12", r: "8", fill: "currentColor" }) })
      }
    )
  ] });
}

// src/move-settings.ts
var open = false;
var listeners2 = /* @__PURE__ */ new Set();
var set = (next) => {
  if (open === next) return;
  open = next;
  for (const fn of listeners2) fn();
};
var MoveSettingsView = {
  isOpen: () => open,
  open: () => set(true),
  close: () => set(false),
  toggle: () => set(!open),
  subscribe(fn) {
    listeners2.add(fn);
    return () => listeners2.delete(fn);
  }
};

// src/components/MovePanelMotion.tsx
var import_react15 = require("react");

// src/move-view-core.ts
var MOVE_VIEW_MOTIONS = ["forward", "back", "open", "close", "swap"];
var MOVE_VIEW_PRESENTATION = {
  /** ms, both layers, start to settle */
  duration: 1e3,
  /** where the arriving view grows up from */
  enterScale: 0.95,
  /** where the leaving view grows out to */
  exitScale: 1.05,
  /** the arriving view's light below which a swap goes unseen */
  quietLight: 0.1
};
var MOVE_VIEW_REDUCED = { duration: 180 };
var MOVE_PANEL_PRESENTATION = { duration: 350, reduced: 120 };
var MOVE_VIEW_WAIT = {
  /** Work that lands inside this never shows a wait — under a fifth of a
   *  second still reads as the press answering. */
  delay: 200,
  /** A wait that came into sight stays this long after it has arrived, so
   *  it is read rather than glimpsed. */
  hold: 500,
  /** One step of the wait's eight-light sweep; eight of them are one pass. */
  sweepStep: 70
};
function expoInOut(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2;
}
function linearEasing(curve, samples = 96) {
  const points = [];
  for (let i = 0; i <= samples; i++) points.push(String(Math.round(curve(i / samples) * 1e4) / 1e4));
  return `linear(${points.join(", ")})`;
}
var MOVE_VIEW_EXPO_BEZIER = "cubic-bezier(0.87, 0, 0.13, 1)";
function reaches(curve, light) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (curve(mid) < light) lo = mid;
    else hi = mid;
  }
  return hi;
}
var EXPO_EASING = linearEasing(expoInOut);
var EXPO_QUIET_SHARE = reaches(expoInOut, MOVE_VIEW_PRESENTATION.quietLight);
function zoomThrough(duration, reduced) {
  if (reduced !== null) {
    const tween2 = (from, to) => ({ from, to, duration: reduced, delay: 0, easing: "linear" });
    return {
      leaving: { fade: tween2(1, 0) },
      arriving: { fade: tween2(0, 1) },
      duration: reduced,
      quiet: Math.round(reduced * MOVE_VIEW_PRESENTATION.quietLight)
    };
  }
  const { enterScale, exitScale } = MOVE_VIEW_PRESENTATION;
  const tween = (from, to) => ({ from, to, duration, delay: 0, easing: EXPO_EASING });
  return {
    leaving: { fade: tween(1, 0), move: tween("scale(1)", `scale(${exitScale})`) },
    arriving: { fade: tween(0, 1), move: tween(`scale(${enterScale})`, "scale(1)") },
    duration,
    quiet: Math.round(EXPO_QUIET_SHARE * duration)
  };
}
function moveViewChoreography(_change, reduced = false) {
  return zoomThrough(MOVE_VIEW_PRESENTATION.duration, reduced ? MOVE_VIEW_REDUCED.duration : null);
}
function movePanelChoreography(reduced = false) {
  return zoomThrough(MOVE_PANEL_PRESENTATION.duration, reduced ? MOVE_PANEL_PRESENTATION.reduced : null);
}
var MOVE_PANEL_ARRIVE_EASING = linearEasing((x) => {
  const e = expoInOut(x);
  return 1 - (1 - e) * (1 - e);
});
function moveViewHoldRemaining(shownAt, now, choreography, hold = MOVE_VIEW_WAIT.hold) {
  if (shownAt === null || now - shownAt < choreography.quiet) return 0;
  return Math.max(0, shownAt + choreography.duration + hold - now);
}

// src/move-panel-motion.ts
var TARGET = {
  controls: ".tweakers-move-controls",
  inside: ".tweakers-move-inner"
};
var FLOATS = '.tweakers-move-wave[data-variant="dock"], .tweakers-move-curve, .tweakers-move-preset-save, [data-move-float]';
var FLOAT_LATE_MS = 200;
var GHOST_ATTR = "data-move-panel-ghost";
var MOVE_PANEL_MOTION_ATTR = "data-move-panel-motion";
var ANIMATION_ID = "tweakers-move-panel-motion";
var HEIGHT_ID = "tweakers-move-panel-height";
var WIDTH_ID = "tweakers-move-panel-width";
var SURFACE_COLS = "--move-surface-cols";
var POSITIONED_ATTR = "data-move-panel-positioned";
var INNER = ".tweakers-move-inner";
var compose = (base, scale) => base === "none" ? scale : `${base} ${scale}`;
function copyCanvases(source, copy) {
  const canvases = source.querySelectorAll("canvas");
  copy.querySelectorAll("canvas").forEach((target, i) => {
    const from = canvases[i];
    if (!from?.width || !from.height) return;
    try {
      target.getContext("2d")?.drawImage(from, 0, 0);
    } catch {
    }
  });
}
var liveFloats = () => Array.from(document.querySelectorAll(FLOATS)).filter((el) => !el.closest(`[${GHOST_ATTR}]`));
function pictureFloats(panel) {
  return liveFloats().flatMap((el) => {
    let box = el;
    while (box.parentElement && box.parentElement !== document.body && box.parentElement !== panel) box = box.parentElement;
    const parent = box.parentElement;
    if (!parent) return [];
    const path = [];
    for (let node = el; node !== box; node = node.parentElement) path.unshift(Array.prototype.indexOf.call(node.parentElement.children, node));
    const copy = box.cloneNode(true);
    copyCanvases(box, copy);
    let float = copy;
    for (const index of path) float = float.children[index];
    return [{ el, parent, copy, float, transform: getComputedStyle(el).transform }];
  });
}
var reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function takePanelPicture(panel, scope) {
  if (!panel || typeof panel.animate !== "function") return null;
  const inner = panel.querySelector(`${INNER}:not([${GHOST_ATTR}])`);
  const innerHeight = inner?.offsetHeight ?? 0;
  const surfaceCols = inner ? parseFloat(getComputedStyle(inner).getPropertyValue(SURFACE_COLS)) || 0 : 0;
  if (scope === "inside" && getComputedStyle(panel).position === "static") {
    panel.style.position = "relative";
    panel.setAttribute(POSITIONED_ATTR, "");
  }
  const target = panel.querySelector(`${TARGET[scope]}:not([${GHOST_ATTR}])`);
  const box = target?.offsetParent;
  if (!target || !box) {
    settle(panel);
    return null;
  }
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    settle(panel);
    return null;
  }
  const boxRect = box.getBoundingClientRect();
  const look = getComputedStyle(target);
  const ghost = target.cloneNode(true);
  ghost.setAttribute(GHOST_ATTR, "");
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  copyCanvases(target, ghost);
  if (scope === "inside") {
    const vars = getComputedStyle(panel);
    for (let i = 0; i < vars.length; i++) {
      const name = vars[i];
      if (name.startsWith("--move-")) ghost.style.setProperty(name, vars.getPropertyValue(name));
    }
  }
  const scrolls = [];
  const copies = ghost.querySelectorAll("*");
  target.querySelectorAll("*").forEach((el, index) => {
    if (el.scrollTop || el.scrollLeft) scrolls.push({ el: copies[index], top: el.scrollTop, left: el.scrollLeft });
  });
  ghost.querySelectorAll(`[${GHOST_ATTR}]`).forEach((stale) => stale.remove());
  panel.setAttribute(MOVE_PANEL_MOTION_ATTR, "");
  return {
    scope,
    panel,
    ghost,
    left: rect.left - boxRect.left - box.clientLeft + box.scrollLeft,
    top: rect.top - boxRect.top - box.clientTop + box.scrollTop,
    width: rect.width,
    height: rect.height,
    innerHeight,
    surfaceCols,
    opacity: Number(look.opacity) || 0,
    transform: look.transform === "none" ? "scale(1)" : look.transform,
    scrolls,
    floats: pictureFloats(panel)
  };
}
function animate(el, frames, duration, easing, fallback, fill) {
  const timing = { duration, fill, id: ANIMATION_ID };
  try {
    return el.animate(frames, { ...timing, easing });
  } catch {
    return el.animate(frames, { ...timing, easing: fallback });
  }
}
var settleTimers = /* @__PURE__ */ new WeakMap();
function playPanelChange(picture) {
  const { panel, ghost, scope } = picture;
  const live = panel.querySelector(`${TARGET[scope]}:not([${GHOST_ATTR}])`);
  const parent = live?.parentElement;
  if (!live || !parent || !panel.isConnected) {
    settle(panel);
    return;
  }
  const plan = movePanelChoreography(reducedMotion());
  const older = Array.from(parent.querySelectorAll(`:scope > [${GHOST_ATTR}]`));
  for (const stale of older.slice(0, -1)) stale.remove();
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${picture.left}px`,
    top: `${picture.top}px`,
    width: `${picture.width}px`,
    height: `${picture.height}px`,
    margin: "0",
    pointerEvents: "none",
    transformOrigin: "50% 50%",
    zIndex: "1"
  });
  parent.appendChild(ghost);
  for (const { el, top, left } of picture.scrolls) {
    el.scrollTop = top;
    el.scrollLeft = left;
  }
  const { leaving, arriving } = plan;
  playFloats(picture, plan);
  const out = animate(
    ghost,
    leaving.move ? [{ opacity: picture.opacity, transform: picture.transform }, { opacity: 0, transform: leaving.move.to }] : [{ opacity: picture.opacity }, { opacity: 0 }],
    leaving.fade.duration,
    leaving.fade.easing,
    MOVE_VIEW_EXPO_BEZIER,
    "forwards"
  );
  out.finished.then(() => ghost.remove(), () => ghost.remove());
  for (const running2 of live.getAnimations()) if (running2.id === ANIMATION_ID) running2.cancel();
  if (arriving.move) {
    animate(live, [{ transform: arriving.move.from }, { transform: arriving.move.to }], arriving.move.duration, arriving.move.easing, MOVE_VIEW_EXPO_BEZIER, "none");
    animate(live, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, MOVE_PANEL_ARRIVE_EASING, MOVE_VIEW_EXPO_BEZIER, "none");
  } else {
    animate(live, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, "linear", "linear", "none");
  }
  easeHeight(picture, plan);
  easeWidth(picture, plan);
  clearTimeout(settleTimers.get(panel));
  settleTimers.set(panel, setTimeout(() => settle(panel), plan.duration));
}
function easeHeight(picture, plan) {
  const inner = picture.panel.querySelector(`${INNER}:not([${GHOST_ATTR}])`);
  if (!inner || !picture.innerHeight) return;
  for (const running2 of inner.getAnimations()) if (running2.id === HEIGHT_ID) running2.cancel();
  let to = naturalHeight(inner);
  if (Math.abs(to - picture.innerHeight) < 1) {
    inner.style.removeProperty("overflow-y");
    inner.style.removeProperty("overflow-clip-margin");
    return;
  }
  inner.style.overflowY = "clip";
  inner.style.setProperty("overflow-clip-margin", "12px");
  const frames = (end) => [{ height: `${picture.innerHeight}px` }, { height: `${end}px` }];
  const easing = plan.arriving.move?.easing ?? "linear";
  const timing = { duration: plan.duration, fill: "none", id: HEIGHT_ID };
  let grow;
  try {
    grow = inner.animate(frames(to), { ...timing, easing });
  } catch {
    grow = inner.animate(frames(to), { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
  }
  const follow = () => {
    if (grow.playState !== "running") return;
    const now = naturalHeight(inner);
    if (Math.abs(now - to) >= 1) {
      to = now;
      grow.effect?.setKeyframes(frames(to));
    }
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}
function easeWidth(picture, plan) {
  const inner = picture.panel.querySelector(`${INNER}:not([${GHOST_ATTR}])`);
  if (!inner || !picture.surfaceCols) return;
  for (const running2 of inner.getAnimations()) if (running2.id === WIDTH_ID) running2.cancel();
  const to = parseFloat(inner.style.getPropertyValue(SURFACE_COLS));
  if (!to || Math.abs(to - picture.surfaceCols) < 0.01) return;
  const frames = [{ [SURFACE_COLS]: String(picture.surfaceCols) }, { [SURFACE_COLS]: String(to) }];
  const timing = { duration: plan.duration, fill: "none", id: WIDTH_ID };
  try {
    inner.animate(frames, { ...timing, easing: plan.arriving.move?.easing ?? "linear" });
  } catch {
    inner.animate(frames, { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
  }
}
function naturalHeight(inner) {
  let bottom = 0;
  for (const child2 of Array.from(inner.children)) {
    if (child2.hasAttribute(GHOST_ATTR)) continue;
    const { position, marginBottom } = getComputedStyle(child2);
    if (position === "absolute" || position === "fixed") continue;
    bottom = Math.max(bottom, child2.offsetTop + child2.offsetHeight + (parseFloat(marginBottom) || 0));
  }
  const { paddingBottom, borderBottomWidth } = getComputedStyle(inner);
  return bottom + (parseFloat(paddingBottom) || 0) + (parseFloat(borderBottomWidth) || 0);
}
function settle(panel) {
  panel.removeAttribute(MOVE_PANEL_MOTION_ATTR);
  if (panel.hasAttribute(POSITIONED_ATTR)) {
    panel.style.removeProperty("position");
    panel.removeAttribute(POSITIONED_ATTR);
  }
  const inner = panel.querySelector(`${INNER}:not([${GHOST_ATTR}])`);
  inner?.style.removeProperty("overflow-y");
  inner?.style.removeProperty("overflow-clip-margin");
}
function playFloats(picture, plan) {
  const { leaving, arriving } = plan;
  for (const gone of picture.floats) {
    if (gone.el.isConnected || !gone.parent.isConnected) continue;
    gone.copy.setAttribute(GHOST_ATTR, "");
    gone.copy.setAttribute("aria-hidden", "true");
    gone.copy.inert = true;
    gone.copy.style.pointerEvents = "none";
    gone.parent.appendChild(gone.copy);
    const frames = leaving.move ? [{ opacity: 1, transform: compose(gone.transform, "scale(1)") }, { opacity: 0, transform: compose(gone.transform, leaving.move.to) }] : [{ opacity: 1 }, { opacity: 0 }];
    const out = animate(gone.float, frames, leaving.fade.duration, leaving.fade.easing, MOVE_VIEW_EXPO_BEZIER, "forwards");
    out.finished.then(() => gone.copy.remove(), () => gone.copy.remove());
  }
  const known = new Set(picture.floats.map((f) => f.el));
  const started = performance.now();
  const arrive = () => {
    const elapsed = performance.now() - started;
    for (const el of liveFloats()) {
      if (known.has(el) || !(el instanceof HTMLElement)) continue;
      known.add(el);
      const base = getComputedStyle(el).transform;
      const zoom = arriving.move ? animate(el, [{ transform: compose(base, arriving.move.from) }, { transform: base }], arriving.move.duration, arriving.move.easing, MOVE_VIEW_EXPO_BEZIER, "none") : null;
      const fade = animate(el, [{ opacity: 0 }, { opacity: 1 }], arriving.fade.duration, arriving.move ? MOVE_PANEL_ARRIVE_EASING : "linear", MOVE_VIEW_EXPO_BEZIER, "none");
      if (zoom) zoom.currentTime = elapsed;
      fade.currentTime = elapsed;
    }
    if (elapsed < FLOAT_LATE_MS) requestAnimationFrame(arrive);
  };
  arrive();
}

// src/components/MovePanelMotion.tsx
var MovePanelMotion = class extends import_react15.Component {
  getSnapshotBeforeUpdate(previous) {
    const { surface, page, panel } = this.props;
    if (previous.surface === surface && previous.page === page) return null;
    const scope = previous.surface === surface ? "controls" : "inside";
    return takePanelPicture(panel.current, scope);
  }
  componentDidUpdate(_previous, _state, picture) {
    if (picture) playPanelChange(picture);
  }
  render() {
    return this.props.children;
  }
};

// src/components/MovePanel.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
var PAD_ROWS = 4;
var MIN_PAD_COLUMNS = 4;
var EDGES_TRACK_INSET = 12;
var TAP_MS = 300;
var WHEEL_SLOT_PX = 60;
var STRIP_REANNOUNCE_MS = 1e3;
var presetNavigatorOpen = () => {
  const view = MovePresetStore.getView();
  return !!view && view.phase !== "closing";
};
var palettePickerOpen = () => MoveColorStore.isPickerOpen();
function searchRows(view) {
  if (view.target === "screen") {
    const screen = MoveSurfaceStore.getState().screen;
    if (!screen) return null;
    return {
      labels: screen.items.map(moveScreenRowSearchText),
      cursor: view.cursor,
      rest: (index) => MoveSearchStore.setCursor(index),
      take: (index) => {
        MoveSearchStore.close();
        MoveSurfaceStore.selectScreen(index);
      }
    };
  }
  if (view.target === "presets") {
    const preset = MovePresetStore.getView();
    if (!preset || preset.phase === "closing") return null;
    const items = MovePresetStore.items(preset.panelId);
    return {
      labels: items.map((i) => i.label),
      cursor: items.findIndex((i) => i.id === preset.cursor),
      rest: (index) => MovePresetStore.rest(items[index].id),
      take: (index) => {
        MoveSearchStore.close();
        MovePresetStore.choose(items[index].id);
      }
    };
  }
  if (!palettePickerOpen()) return null;
  return {
    labels: ["All colors", ...MoveColorStore.palettes().map((p) => p.name)],
    cursor: MoveColorStore.getPickerCursor(),
    rest: (index) => MoveColorStore.setPickerCursor(index),
    take: (index) => {
      MoveSearchStore.close();
      MoveColorStore.choosePicker(index);
    }
  };
}
var searchKept = (rows, view) => moveSearchFilter(rows.labels, view.query);
function searchStep(view, delta) {
  const rows = searchRows(view);
  if (!rows || !delta) return;
  const kept = searchKept(rows, view);
  if (!kept.length) return;
  const at2 = kept.indexOf(rows.cursor);
  const next = kept[Math.max(0, Math.min(kept.length - 1, (at2 < 0 ? 0 : at2) + delta))];
  if (next !== rows.cursor) rows.rest(next);
}
function searchTake(view) {
  const rows = searchRows(view);
  if (rows && searchKept(rows, view).includes(rows.cursor)) rows.take(rows.cursor);
}
function searchType(query) {
  MoveSearchStore.setQuery(query);
  const view = MoveSearchStore.getView();
  const rows = view && searchRows(view);
  if (!view || !rows) return;
  const kept = searchKept(rows, view);
  if (kept.length && !kept.includes(rows.cursor)) rows.rest(kept[0]);
}
function holdPad(panelId, path) {
  const set2 = (on) => {
    if (import_TweakStore16.TweakStore.getValue(panelId, path) !== on) import_TweakStore16.TweakStore.updateValue(panelId, path, on);
  };
  return {
    onPointerDown: (e) => {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      set2(true);
    },
    onPointerUp: () => set2(false),
    onPointerCancel: () => set2(false),
    onLostPointerCapture: () => set2(false),
    onKeyDown: (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!e.repeat) set2(true);
      }
    },
    onKeyUp: (e) => {
      if (e.key === " " || e.key === "Enter") set2(false);
    },
    onBlur: () => set2(false)
  };
}
function boldColons(text) {
  if (!text.includes(":")) return text;
  return text.split(":").flatMap(
    (part, i) => i === 0 ? [part] : [/* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-volume-sep", children: ":" }, `sep-${i}`), part]
  );
}
var MOVE_TOUCH_EVENT = "move-tweakers:touch";
var MOVE_OVERRIDE_EVENT = "move-tweakers:override";
var MOVE_LATCH_EVENT = "move-tweakers:latch";
var MOVE_PAGE_EVENT = "move-tweakers:page";
var MOVE_PAGE_SELECT_EVENT = "move-tweakers:page-select";
var MOVE_JOG_EVENT = "move-tweakers:jog";
var MOVE_JOG_CLICK_EVENT = "move-tweakers:jog-click";
var MOVE_VOLUME_EVENT = "move-tweakers:volume";
var MOVE_VOLUME_TAP_EVENT = "move-tweakers:volume-tap";
var MOVE_MUTE_EVENT = "move-tweakers:mute";
var MOVE_SEARCH_EVENT = "move-tweakers:search";
var MOVE_STRIP_EVENT = "move-tweakers:strip";
var MOVE_SETTINGS_EVENT = "move-tweakers:settings";
function MovePanel({ theme = "system", productionEnabled = isDevDefault, panels: only, dock = "viewport", scroll = false, focused = false, headerStart, headerEnd, settings: settings2, functionChips = "clock" }) {
  if (!productionEnabled) return null;
  const [panels, setPanels] = (0, import_react16.useState)([]);
  const [track, setTrack] = (0, import_react16.useState)(0);
  const [dragPath, setDragPath] = (0, import_react16.useState)(null);
  const [bendHeld, setBendHeld] = (0, import_react16.useState)(null);
  const bendRef = (0, import_react16.useRef)(null);
  const [waveHeld, setWaveHeld] = (0, import_react16.useState)(null);
  const waveRef = (0, import_react16.useRef)(null);
  const [handTouch, setHandTouch] = (0, import_react16.useState)({});
  const [curvePoint, setCurvePoint] = (0, import_react16.useState)({});
  const [rampStop, setRampStop] = (0, import_react16.useState)({});
  const rampGesture = (0, import_react16.useRef)(null);
  const [hwHeld, setHwHeld] = (0, import_react16.useState)({});
  const [hwLatched, setHwLatched] = (0, import_react16.useState)({});
  const [appHeld, setAppHeld] = (0, import_react16.useState)(null);
  const [held, setHeld] = (0, import_react16.useState)(null);
  const [latched, setLatched] = (0, import_react16.useState)({});
  const holdStart = (0, import_react16.useRef)(0);
  const [mounted, setMounted] = (0, import_react16.useState)(false);
  const pageTabsId = (0, import_react16.useId)();
  const panelRef = (0, import_react16.useRef)(null);
  const [dotDrag, setDotDrag] = (0, import_react16.useState)(null);
  const fineRef = (0, import_react16.useRef)(null);
  const faceDrag = (0, import_react16.useRef)(null);
  const pressRef = (0, import_react16.useRef)(null);
  const rangeHandleRef = (0, import_react16.useRef)("min");
  const filterHandRef = (0, import_react16.useRef)("cutoff");
  const [volume, setVolume] = (0, import_react16.useState)(() => MoveVolumeDisplay.get());
  const waveClaimed = (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.isRegistered(),
    () => false
  );
  const timelineClaimed = (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveTimelineStore.subscribe(cb), []),
    () => MoveTimelineStore.isRegistered(),
    () => false
  );
  const [liveValue, setLiveValue] = (0, import_react16.useState)(null);
  (0, import_react16.useEffect)(() => {
    setVolume(MoveVolumeDisplay.get());
    return MoveVolumeDisplay.subscribe(() => setVolume(MoveVolumeDisplay.get()));
  }, []);
  (0, import_react16.useEffect)(() => {
    const poll = volume?.getValue;
    if (!poll) {
      setLiveValue(null);
      return;
    }
    let raf = requestAnimationFrame(function tick() {
      setLiveValue(poll());
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [volume]);
  const onlyKey = only === void 0 ? void 0 : JSON.stringify(Array.isArray(only) ? only : [only]);
  const read2 = (0, import_react16.useCallback)(() => {
    if (onlyKey === void 0) return import_TweakStore16.TweakStore.selectPanels();
    const requested = JSON.parse(onlyKey);
    const registered = import_TweakStore16.TweakStore.getPanels("panel");
    return requested.map((key) => registered.find((panel) => panel.id === key || panel.name === key)).filter((panel) => panel !== void 0);
  }, [onlyKey]);
  (0, import_react16.useEffect)(() => {
    setMounted(true);
    MoveWaveformStore.ensureSettings();
    setPanels(read2());
    return import_TweakStore16.TweakStore.subscribeGlobal(() => setPanels(read2()));
  }, [read2]);
  const settingsKey = settings2 === void 0 ? void 0 : JSON.stringify(Array.isArray(settings2) ? settings2 : [settings2]);
  const namedRooms = settingsKey === void 0 ? [] : JSON.parse(settingsKey).map((key) => import_TweakStore16.TweakStore.getPanels("panel").find((p) => p.id === key || p.name === key)).filter((p) => p !== void 0);
  const waveRoom = import_TweakStore16.TweakStore.getPanel(MOVE_WAVEFORM_PANEL);
  const settingsRooms = waveRoom ? [...namedRooms, waveRoom] : namedRooms;
  const roomIds = settingsRooms.map((p) => p.id);
  const settingsOpen = (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveSettingsView.subscribe(cb), []),
    () => MoveSettingsView.isOpen(),
    () => false
  ) && settingsRooms.length > 0;
  const pagePanels = roomIds.length ? panels.filter((p) => !roomIds.includes(p.id)) : panels;
  const pages = scroll ? pagePanels.filter((p) => p.kind === void 0).slice(0, MOVE_TRACKS).map(buildMoveStrip) : buildMovePages(pagePanels);
  const underModSettings = import_ModulationStore2.ModulationStore.getSettings();
  const modSettings = settingsOpen ? null : underModSettings;
  const settingsPanel = modSettings ? import_TweakStore16.TweakStore.getPanel(modSettings.panelId) : void 0;
  const modLayout = settingsPanel ? import_ModulationStore2.ModulationStore.getSettingsLayout() : null;
  const [roomTrack, setRoomTrack] = (0, import_react16.useState)(0);
  const roomPages = settingsOpen ? scroll ? settingsRooms.slice(0, MOVE_TRACKS).map(buildMoveStrip) : buildMovePages(settingsRooms) : [];
  const roomPage = roomPages[Math.min(roomTrack, Math.max(0, roomPages.length - 1))];
  const page = settingsPanel ? buildModMovePage(settingsPanel, modLayout) : roomPage ?? pages[Math.min(track, Math.max(0, pages.length - 1))];
  const pageId = page?.panel.id;
  const motionSurface = settingsPanel ? "mod" : settingsOpen ? "room" : "app";
  const motionPage = settingsPanel ? settingsPanel.id : settingsOpen ? String(roomTrack) : String(track);
  (0, import_react16.useSyncExternalStore)(MovePadListStore.subscribe, MovePadListStore.getVersion, () => 0);
  const padListView = MovePadListStore.getView();
  (0, import_react16.useEffect)(() => {
    if (padListView && padListView.panelId !== pageId) MovePadListStore.close();
  }, [pageId, padListView]);
  const roomKey = roomIds.join("\0");
  (0, import_react16.useEffect)(() => {
    if (!roomKey) return;
    const detach = MoveFunctions.attach("set_overview", () => MoveSettingsView.toggle(), { label: "Settings" });
    return () => {
      detach();
      MoveSettingsView.close();
    };
  }, [roomKey]);
  (0, import_react16.useLayoutEffect)(() => {
    if (!settingsOpen) return;
    const wake = MoveFunctions.suspend(["set_overview"]);
    const releaseBack = MoveFunctions.push("back", () => MoveSettingsView.close(), { label: "Close", chip: false });
    return () => {
      releaseBack();
      wake();
    };
  }, [settingsOpen]);
  const regularPageId = underModSettings?.panelId ?? pages[Math.min(track, Math.max(0, pages.length - 1))]?.panel.id;
  const roomPageId = roomPage?.panel.id;
  (0, import_react16.useEffect)(() => {
    if (!roomKey || typeof window === "undefined") return;
    const ids2 = roomKey.split("\0");
    const announce = () => window.dispatchEvent(new CustomEvent(MOVE_SETTINGS_EVENT, {
      detail: { panelIds: ids2, open: settingsOpen, pageId: regularPageId, roomPageId }
    }));
    announce();
    const timer = setInterval(announce, STRIP_REANNOUNCE_MS);
    return () => clearInterval(timer);
  }, [roomKey, settingsOpen, regularPageId, roomPageId]);
  const stripMode = scroll && !settingsPanel && !!page;
  const [offset, setOffset] = (0, import_react16.useState)(0);
  const stripOffset = stripMode ? clampStripOffset(page, offset) : 0;
  const stripRef = (0, import_react16.useRef)({
    page: void 0,
    offset: 0,
    on: false
  });
  stripRef.current = { page, offset: stripOffset, on: stripMode };
  const scrollSlots = (0, import_react16.useCallback)((delta) => {
    const { page: pg, offset: cur, on } = stripRef.current;
    if (!on || !pg || !delta) return;
    const next = stepStripOffset(pg, cur, delta);
    if (next !== cur) setOffset(next);
  }, []);
  const scrollPage = (0, import_react16.useCallback)((dir) => {
    const { page: pg, offset: cur, on } = stripRef.current;
    if (!on || !pg || !dir) return;
    const next = pageStripOffset(pg, cur, dir);
    if (next !== cur) setOffset(next);
  }, []);
  (0, import_react16.useEffect)(() => setOffset(0), [pageId]);
  (0, import_react16.useEffect)(() => {
    const onJog = (e) => {
      if (PresetExplorationStore.getState()) {
        e.preventDefault();
        PresetExplorationStore.jog(Number(e.detail?.delta) || 0);
        return;
      }
      if (e.defaultPrevented || MoveSearchStore.isOpen() || presetNavigatorOpen() || MoveColorStore.getView() || !stripRef.current.on) return;
      if (MoveWaveformStore.wantsSteps()) return;
      e.preventDefault();
      scrollSlots(Math.round(Number(e.detail?.delta) || 0));
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    return () => window.removeEventListener(MOVE_JOG_EVENT, onJog);
  }, [scrollSlots]);
  (0, import_react16.useEffect)(() => {
    if (!stripMode) return;
    const free = ["left", "right"].filter((name) => !MoveFunctions.list().includes(name));
    const off = free.map(
      (name) => MoveFunctions.attach(name, () => scrollPage(name === "right" ? 1 : -1), { label: name === "right" ? "Next 8" : "Prev 8", chip: false })
    );
    return () => {
      for (const detach of off) detach();
    };
  }, [stripMode, scrollPage]);
  const wheelRest = (0, import_react16.useRef)(0);
  (0, import_react16.useEffect)(() => {
    const el = panelRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.target instanceof Element && e.target.closest(".tweakers-exploration")) return;
      const exploring = !!PresetExplorationStore.getState();
      const searching = MoveSearchStore.getView();
      const browsing = presetNavigatorOpen();
      const picking = palettePickerOpen();
      const editing = MoveWaveformStore.wantsSteps();
      if (!exploring && !searching && !browsing && !picking && !editing && !stripRef.current.on) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      wheelRest.current += d;
      const steps = Math.trunc(wheelRest.current / WHEEL_SLOT_PX);
      if (!steps) return;
      wheelRest.current -= steps * WHEEL_SLOT_PX;
      if (exploring) PresetExplorationStore.jog(steps);
      else if (searching) searchStep(searching, steps);
      else if (browsing) MovePresetStore.scroll(steps);
      else if (picking) MoveColorStore.movePickerCursor(steps);
      else if (editing) MoveWaveformStore.zoom(-steps);
      else scrollSlots(steps);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollSlots, mounted, stripMode]);
  const announceStrip = (0, import_react16.useCallback)(() => {
    const { page: pg, offset: at2, on } = stripRef.current;
    if (!on || !pg) return;
    const pads = stripWindowPads(pg, at2);
    const row = (cells) => cells.map((meta) => meta?.path ?? null);
    const switchRow = pads.toggles.map((meta, i) => {
      if (!meta) return null;
      const tab = moveTabCell(pg.toggles, at2 + i);
      if (!tab) return meta.path;
      return tab.head ? { path: tab.meta.path, tab: true, head: true, label: tab.label } : { path: tab.meta.path, tab: true, option: tab.option, label: tab.label };
    });
    window.dispatchEvent(new CustomEvent(MOVE_STRIP_EVENT, {
      detail: {
        pageId: pg.panel.id,
        offset: at2,
        columns: stripDialColumns(pg, at2),
        paths: stripDialSlots(pg, at2).map((meta) => meta?.path ?? null),
        // The small slots under that window, in hardware columns — without
        // them the pads under a scrolling page stay dark and dead.
        pads: { toggles: switchRow, values: row(pads.values), actions: row(pads.actions) }
      }
    }));
  }, []);
  (0, import_react16.useEffect)(() => {
    announceStrip();
  }, [announceStrip, stripMode, pageId, stripOffset]);
  (0, import_react16.useEffect)(() => {
    let last = 0;
    const onPage = () => {
      const now = Date.now();
      if (now - last < STRIP_REANNOUNCE_MS) return;
      last = now;
      announceStrip();
    };
    window.addEventListener(MOVE_PAGE_EVENT, onPage);
    return () => window.removeEventListener(MOVE_PAGE_EVENT, onPage);
  }, [announceStrip]);
  (0, import_react16.useSyncExternalStore)(MoveColorStore.subscribe, MoveColorStore.getVersion, () => 0);
  const colorView = MoveColorStore.getView();
  const gradientEditable = (meta) => meta.type === "gradient" && pageId !== void 0 && (MoveColorStore.gradient(pageId, meta.path)?.stops.length ?? 0) <= MOVE_GRADIENT_STOPS;
  const colorMeta = colorView?.panelId === pageId && page ? [...page.dials, ...page.topValues ?? [], ...page.values, ...page.actionValues ?? []].find((meta) => meta && meta.path === colorView.path && (meta.type === "color" || gradientEditable(meta))) : void 0;
  const color = colorMeta && pageId ? MoveColorStore.read(pageId, colorMeta.path) : null;
  const gradientMeta = colorMeta?.type === "gradient" ? colorMeta : null;
  const gradientValue = gradientMeta && pageId ? MoveColorStore.gradient(pageId, gradientMeta.path) : null;
  (0, import_react16.useEffect)(() => () => {
    if (MoveColorStore.getView()?.panelId === pageId) MoveColorStore.close();
  }, [pageId]);
  const colorOpenPanel = colorMeta && colorView ? colorView.panelId : null;
  (0, import_react16.useEffect)(() => {
    if (!colorOpenPanel) return;
    return MoveFunctions.push("menu", () => MoveColorStore.togglePicker(), { label: "palettes", chip: false });
  }, [colorOpenPanel]);
  (0, import_react16.useEffect)(() => {
    if (!colorOpenPanel) return;
    return MoveFunctions.push("copy", ({ shift, hold }) => {
      const view = MoveColorStore.getView();
      if (!view) return;
      const hex = MoveColorStore.hex(view.panelId, view.path);
      const text = hold ? copyOklch(hex) : shift ? copyHslOfHex(hex) : hex;
      navigator.clipboard?.writeText(text).catch(() => {
      });
    }, { label: "copy color", chip: false });
  }, [colorOpenPanel]);
  const paletteScreen = MoveColorStore.isPickerOpen();
  (0, import_react16.useEffect)(() => {
    if (!paletteScreen) return;
    return MoveFunctions.push("back", () => MoveColorStore.closePicker(), { label: "back", chip: false });
  }, [paletteScreen]);
  (0, import_react16.useEffect)(() => {
    const onJog = (e) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !palettePickerOpen()) return;
      e.preventDefault();
      MoveColorStore.movePickerCursor(Number(e.detail?.delta) || 0);
    };
    const onJogClick = (e) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !palettePickerOpen()) return;
      e.preventDefault();
      MoveColorStore.confirmPicker();
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog);
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    };
  }, []);
  (0, import_react16.useSyncExternalStore)(MovePresetStore.subscribe, MovePresetStore.getVersion, () => 0);
  (0, import_react16.useSyncExternalStore)(PresetExplorationStore.subscribe, PresetExplorationStore.getVersion, () => 0);
  const explorationOpen = PresetExplorationStore.getState()?.panelId === pageId;
  const presetView = MovePresetStore.getView();
  const presetSaving = MovePresetStore.getSaving();
  const presetScreen = presetView?.panelId === pageId ? presetView : null;
  const presetSave = presetSaving?.panelId === pageId ? presetSaving : null;
  (0, import_react16.useEffect)(() => {
    if (!pageId) return;
    return MoveFunctions.attach("menu", ({ shift, hold }) => {
      if (shift) MovePresetStore.beginSave(pageId);
      else if (hold) {
        MovePresetStore.cancel();
        void PresetExplorationStore.open(pageId);
      } else MovePresetStore.toggle(pageId);
    }, { label: "presets", chip: false });
  }, [pageId]);
  (0, import_react16.useEffect)(() => attachMoveKeys(), []);
  (0, import_react16.useEffect)(() => () => {
    if (MovePresetStore.getView()?.panelId === pageId) MovePresetStore.cancel();
    if (MovePresetStore.getSaving()?.panelId === pageId) MovePresetStore.cancelSave();
    if (PresetExplorationStore.getState()?.panelId === pageId) {
      PresetExplorationStore.cancelSave();
      void PresetExplorationStore.close();
    }
  }, [pageId]);
  const presetOpenPanel = presetScreen && presetScreen.phase !== "closing" ? presetScreen.panelId : null;
  (0, import_react16.useEffect)(() => {
    if (!presetOpenPanel) return;
    return MoveFunctions.push("back", () => MovePresetStore.cancel(), { label: "revert", chip: false });
  }, [presetOpenPanel]);
  (0, import_react16.useEffect)(() => {
    const openView = () => {
      const view = MovePresetStore.getView();
      return view && view.phase !== "closing" ? view : null;
    };
    const onJog = (e) => {
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !openView()) return;
      e.preventDefault();
      MovePresetStore.scroll(Number(e.detail?.delta) || 0);
    };
    const onJogClick = (e) => {
      if (PresetExplorationStore.getState()) {
        e.preventDefault();
        PresetExplorationStore.toggleParent();
        return;
      }
      if (e.defaultPrevented || MoveSearchStore.isOpen() || !openView()) return;
      e.preventDefault();
      MovePresetStore.confirm();
    };
    let muteTaken = false;
    const onMute = (e) => {
      if (e.detail?.pressed) {
        if (!openView() || MovePresetStore.getSaving()) return;
        e.preventDefault();
        muteTaken = true;
        MovePresetStore.compareStart();
      } else {
        if (!muteTaken) return;
        e.preventDefault();
        muteTaken = false;
        MovePresetStore.compareEnd();
      }
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog);
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
    window.addEventListener(MOVE_MUTE_EVENT, onMute);
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog);
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick);
      window.removeEventListener(MOVE_MUTE_EVENT, onMute);
    };
  }, []);
  (0, import_react16.useSyncExternalStore)(MoveSearchStore.subscribe, MoveSearchStore.getVersion, () => 0);
  const search = MoveSearchStore.getView();
  const screenShown = (0, import_react16.useRef)(false);
  (0, import_react16.useEffect)(() => {
    const onSearch = (e) => {
      if (e.defaultPrevented) return;
      if (MoveSearchStore.isOpen()) {
        e.preventDefault();
        MoveSearchStore.close();
        return;
      }
      const target = palettePickerOpen() ? "palette" : presetNavigatorOpen() ? "presets" : screenShown.current ? "screen" : null;
      if (!target) return;
      e.preventDefault();
      MoveSearchStore.open(target, target === "screen" ? MoveSurfaceStore.getState().screen?.index ?? 0 : 0);
    };
    window.addEventListener(MOVE_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(MOVE_SEARCH_EVENT, onSearch);
  }, []);
  (0, import_react16.useEffect)(() => {
    const onKey2 = (e) => {
      const find = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "f";
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!find && !slash) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        if (find && t.classList.contains("tweakers-move-search-input")) e.preventDefault();
        return;
      }
      if (MoveSearchStore.isOpen()) {
        const field = document.querySelector(".tweakers-move-search-input");
        if (!field) return;
        e.preventDefault();
        field.focus();
        return;
      }
      const ask = new CustomEvent(MOVE_SEARCH_EVENT, { detail: { shift: false }, cancelable: true });
      window.dispatchEvent(ask);
      if (ask.defaultPrevented) e.preventDefault();
    };
    window.addEventListener("keydown", onKey2);
    return () => window.removeEventListener("keydown", onKey2);
  }, []);
  (0, import_react16.useEffect)(() => {
    const onJog = (e) => {
      const view = MoveSearchStore.getView();
      if (!view) return;
      e.preventDefault();
      searchStep(view, Math.round(Number(e.detail?.delta) || 0));
    };
    const onJogClick = (e) => {
      const view = MoveSearchStore.getView();
      if (!view) return;
      e.preventDefault();
      searchTake(view);
    };
    window.addEventListener(MOVE_JOG_EVENT, onJog, { capture: true });
    window.addEventListener(MOVE_JOG_CLICK_EVENT, onJogClick, { capture: true });
    return () => {
      window.removeEventListener(MOVE_JOG_EVENT, onJog, { capture: true });
      window.removeEventListener(MOVE_JOG_CLICK_EVENT, onJogClick, { capture: true });
    };
  }, []);
  const searchOpen = !!search;
  (0, import_react16.useEffect)(() => {
    if (!searchOpen) return;
    return MoveFunctions.push("back", () => MoveSearchStore.close(), { label: "end search", chip: false });
  }, [searchOpen]);
  const modSlot = modSettings ? import_ModulationStore2.ModulationStore.getSlot(modSettings.index) : null;
  const composition = modSlot?.type === "curve" ? curveComposition(modSlot.params) : null;
  const audioWave = modSlot?.type === "audio" && modSettings ? modSettings.index : null;
  const roomWave = settingsOpen && page?.panel.id === MOVE_WAVEFORM_PANEL;
  const clipIndex = composition ? Math.min(composition.segments.length - 1, Math.max(0, Math.round(Number(modSlot.params.selected) || 0))) : 0;
  const previewPath = modLayout?.dials.find((d) => d.preview)?.path ?? null;
  const values = (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => pageId ? import_TweakStore16.TweakStore.subscribe(pageId, cb) : () => {
    }, [pageId]),
    () => pageId ? import_TweakStore16.TweakStore.getValues(pageId) : void 0,
    () => void 0
  );
  const [, bumpControlState] = (0, import_react16.useState)(0);
  (0, import_react16.useEffect)(
    () => pageId ? import_TweakStore16.TweakStore.subscribeControlState(pageId, () => bumpControlState((n) => n + 1)) : void 0,
    [pageId]
  );
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => import_ModulationStore2.ModulationStore.subscribe(cb), []),
    () => import_ModulationStore2.ModulationStore.getVersion(),
    () => 0
  );
  const surface = (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveSurfaceStore.subscribe(cb), []),
    () => MoveSurfaceStore.getState(),
    () => MoveSurfaceStore.getState()
  );
  (0, import_react16.useEffect)(() => {
    const forPage = (detail, map) => detail && detail.pageId === pageId ? map ?? {} : {};
    const onTouch = (e) => {
      const d = e.detail;
      setHandTouch(forPage(d, d?.touched));
    };
    const onOverride = (e) => {
      const d = e.detail;
      setHwHeld(forPage(d, d?.held));
      setHwLatched(forPage(d, d?.latched));
    };
    window.addEventListener(MOVE_TOUCH_EVENT, onTouch);
    window.addEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    return () => {
      window.removeEventListener(MOVE_TOUCH_EVENT, onTouch);
      window.removeEventListener(MOVE_OVERRIDE_EVENT, onOverride);
    };
  }, [pageId]);
  const pagesRef = (0, import_react16.useRef)(pages);
  pagesRef.current = pages;
  const roomIdsRef = (0, import_react16.useRef)(roomIds);
  roomIdsRef.current = roomIds;
  const sawSettings = (0, import_react16.useRef)(false);
  const sawRoom = (0, import_react16.useRef)(false);
  (0, import_react16.useEffect)(() => {
    const onPage = (e) => {
      const id = e.detail?.pageId;
      if (id === MOD_SETTINGS_PANEL) {
        sawSettings.current = true;
        return;
      }
      const roomIndex = id === void 0 ? -1 : roomIdsRef.current.indexOf(id);
      if (roomIndex >= 0) {
        if (MoveSettingsView.isOpen()) {
          sawRoom.current = true;
          setRoomTrack(roomIndex);
        }
        return;
      }
      if (sawSettings.current) {
        sawSettings.current = false;
        import_ModulationStore2.ModulationStore.closeSettings();
      }
      if (sawRoom.current) {
        sawRoom.current = false;
        MoveSettingsView.close();
      }
      const i = pagesRef.current.findIndex((pg) => pg.panel.id === id);
      if (i >= 0) setTrack(i);
    };
    window.addEventListener(MOVE_PAGE_EVENT, onPage);
    return () => window.removeEventListener(MOVE_PAGE_EVENT, onPage);
  }, []);
  (0, import_react16.useEffect)(() => {
    setHeld(null);
    setLatched({});
  }, [pageId]);
  const screen = settingsPanel || settingsOpen || explorationOpen ? null : surface.screen;
  const searchTarget = search?.target ?? null;
  const screenSearch = searchTarget === "screen" && screen ? search : null;
  const presetSearch = searchTarget === "presets" && presetOpenPanel ? search : null;
  const paletteSearch = searchTarget === "palette" && paletteScreen ? search : null;
  (0, import_react16.useEffect)(() => {
    screenShown.current = !!screen;
    if (searchTarget && !screenSearch && !presetSearch && !paletteSearch) MoveSearchStore.close();
  });
  if (!mounted || typeof window === "undefined" || pages.length === 0 || !page || !values) return null;
  const dialPercent = (meta) => moveDialPercent(meta, values[meta.path]);
  const chipValue = (meta) => moveChipValue(meta, values[meta.path]);
  const dialReading = (meta) => moveDialReading(meta, values[meta.path]);
  const rangeReading = (meta) => moveRangeReading(meta, values[meta.path]);
  const write2 = (meta, next) => import_TweakStore16.TweakStore.updateValue(page.panel.id, meta.path, next);
  const dialFromKeyboard = (e, meta) => {
    if (import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) return;
    const next = moveDialKey(meta, values[meta.path], e);
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    armMod(meta.path);
    write2(meta, next);
  };
  const beginPress = (e, path, v) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    fineRef.current = null;
    pressRef.current = movePressStart(path, e, v);
    setDragPath(path);
    armMod(path);
  };
  const endPress = (path) => {
    const tapped = movePressEnd(pressRef, path);
    setDragPath(null);
    fineRef.current = null;
    return tapped;
  };
  const resetValue = (meta) => {
    const value = import_TweakStore16.TweakStore.getDefault(page.panel.id, meta.path);
    if (value !== void 0 && !import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) write2(meta, value);
  };
  const dialDrag = (meta) => ({
    onPointerDown: (e) => {
      if (e.button > 0 || import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) return;
      beginPress(e, meta.path, normalizeDial(meta, values[meta.path]));
    },
    onPointerMove: (e) => {
      const p = movePressTravel(pressRef, meta.path, e, () => normalizeDial(meta, values[meta.path]));
      if (p && !import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) write2(meta, moveTurnValue(meta, p, e, moveTurnExtent(e.currentTarget.getBoundingClientRect())));
    },
    onPointerUp: (e) => {
      if (endPress(meta.path) && e.shiftKey) resetValue(meta);
    },
    onPointerCancel: () => {
      endPress(meta.path);
    }
  });
  const optionDrag = (meta) => ({
    onPointerDown: (e) => {
      if (e.button > 0 || import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) return;
      beginPress(e, meta.path, enumIndex(meta, values[meta.path]));
    },
    onPointerMove: (e) => {
      const p = movePressTravel(pressRef, meta.path, e, () => enumIndex(meta, values[meta.path]));
      const next = p && !import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path) ? moveOptionStep(meta, values[meta.path], p, e) : void 0;
      if (next !== void 0) write2(meta, next);
    },
    onPointerUp: (e) => {
      if (!endPress(meta.path) || import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) return;
      if (e.shiftKey) resetValue(meta);
      else {
        const next = moveNextOption(meta, values[meta.path]);
        if (next !== void 0) write2(meta, next);
      }
    },
    onPointerCancel: () => {
      endPress(meta.path);
    }
  });
  const xyFromPointer = (e, meta) => write2(meta, moveXYValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), fineRef));
  const transferFromPointer = (e, meta, down) => {
    const next = moveTransferValue(values[meta.path], e, e.currentTarget.getBoundingClientRect(), curvePoint[meta.path] ?? 0, down);
    if (down) setCurvePoint((prev) => ({ ...prev, [meta.path]: next.held }));
    write2(meta, next.value);
  };
  const needleFromPointer = (e, meta) => {
    const next = moveNeedleValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect());
    if (next !== null) write2(meta, next);
  };
  const rampFromPointer = (e, meta, down) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const open2 = colorMeta?.path === meta.path;
    if (down) {
      const index2 = moveRampStop(values[meta.path], e, rect);
      setRampStop((prev) => ({ ...prev, [meta.path]: index2 }));
      if (open2) MoveColorStore.selectStop(index2);
      return;
    }
    const stops = normalizeGradient(values[meta.path]).stops.length;
    const index = Math.min(open2 ? MoveColorStore.getStop() : rampStop[meta.path] ?? 0, stops - 1);
    write2(meta, moveRampValue(values[meta.path], e, rect, index));
  };
  const xyRelease = (meta) => {
    setDragPath(null);
    fineRef.current = null;
    const rest = moveXYRest(meta);
    if (rest) write2(meta, rest);
  };
  const rangeFromPointer = (e, meta, down) => write2(meta, moveRangeValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), rangeHandleRef, fineRef, down));
  const filterFromPointer = (e, meta, down) => write2(meta, moveFilterValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), filterHandRef, fineRef, down));
  const chipLatched = (col, meta) => latched[col]?.path === meta.path || !!hwLatched[meta.path];
  const armMod = (path) => import_ModulationStore2.ModulationStore.noteTouch(page.panel.id, path);
  const chipsAt = (col) => [page.topValues?.[col], page.values[col], page.actionValues?.[col]].filter((m) => !!m);
  const dialAt = (col) => {
    if (held && held.col === col) return held.meta;
    const chips = chipsAt(col);
    const hwHeldChip = chips.find((m) => hwHeld[m.path]);
    if (hwHeldChip) return hwHeldChip;
    if (latched[col]) return latched[col];
    return chips.find((m) => hwLatched[m.path]) ?? page.dials[col];
  };
  const edgesFromPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const span = rect.width - EDGES_TRACK_INSET * 2;
    return Math.min(1, Math.max(0, (e.clientX - rect.left - EDGES_TRACK_INSET) / (span || 1)));
  };
  const dragEdge = (kind, isStart, meta, x) => {
    const v01 = kind === "loop" ? x : Math.min(1, (isStart ? x : 1 - x) * 2);
    import_TweakStore16.TweakStore.updateValue(page.panel.id, meta.path, denormalizeDial(meta, v01));
  };
  const trimSpanAt = (col) => {
    const start = dialAt(col);
    const end = dialAt(col + 1);
    if (!start || !end || start === page.dials[col] !== (end === page.dials[col + 1])) return null;
    const at2 = moveTrimSpan(start, values[start.path], end, values[end.path]);
    return at2 && { start, end, at: at2 };
  };
  const gateAt = (col) => {
    const metas = [dialAt(col), dialAt(col + 1), dialAt(col + 2)];
    if (metas.some((m) => !m) || !visibleCols.includes(col + 1) || !visibleCols.includes(col + 2)) return null;
    const own = metas.map((m, k) => m === page.dials[col + k]);
    if (own.some((o) => o !== own[0])) return null;
    const at2 = moveGateSpan(metas.map((m) => [m, values[m.path]]));
    if (!at2) return null;
    return { kind: "gate", col, span: 3, dials: ["threshold", "lookahead", "release"].map((role, k) => ({ role, col: col + k, meta: metas[k], position: at2[role] })) };
  };
  const vectorAt = (col) => {
    const metas = [dialAt(col), dialAt(col + 1), dialAt(col + 2)];
    if (metas.some((m) => !m) || !visibleCols.includes(col + 1) || !visibleCols.includes(col + 2)) return null;
    const own = metas.map((m, k) => m === page.dials[col + k]);
    if (own.some((o) => o !== own[0])) return null;
    const at2 = moveVectorAxes(metas.map((m) => [m, values[m.path]]));
    if (!at2) return null;
    return {
      kind: "vector",
      col,
      span: 3,
      down: at2.down,
      dials: ["x", "y", "z"].map((axis, k) => ({ role: `axis-${axis}`, col: col + k, meta: metas[k], position: at2[axis] }))
    };
  };
  const multibandAt = (col) => {
    if (moveMultibandRole(page.dials[col]) !== "amount" || !visibleCols.includes(col + 1)) return null;
    const cols = [col, col + 1];
    for (let k = col + 2; k < page.dials.length && visibleCols.includes(k) && moveMultibandRole(page.dials[k]) === "band"; k++) cols.push(k);
    if (cols.length < 3 || dialAt(col) !== page.dials[col] || dialAt(col + 1) !== page.dials[col + 1]) return null;
    const metas = cols.map((c) => dialAt(c));
    if (metas.slice(2).some((m) => moveMultibandRole(m) !== "band")) return null;
    const bands = cols.slice(2).flatMap((c) => [page.dials[c], ...chipsAt(c)]).filter((m) => moveMultibandRole(m) === "band");
    const at2 = moveMultibandSpan(cols.map((c) => [page.dials[c], values[page.dials[c].path]]), bands.map((m) => [m, values[m.path]]));
    if (!at2) return null;
    const visual = page.dials[col].moveVisual;
    return {
      kind: "multiband",
      col,
      span: cols.length,
      curve: at2.bands,
      icon: visual?.kind === "multiband" && visual.role === "amount" ? visual.icon : void 0,
      dials: cols.map((c, k) => ({
        role: k === 0 ? "amount" : k === 1 ? "speed" : "band",
        col: c,
        meta: metas[k],
        position: k === 0 ? at2.amount : k === 1 ? at2.speed : at2.bands.find((b) => b.meta === metas[k]).position
      }))
    };
  };
  const channelCol = (col) => visibleCols.includes(col) && dialAt(col) === page.dials[col] && moveChannelPosition(page.dials[col], values[page.dials[col]?.path]) !== null;
  const channelAt = (col) => {
    if (!channelCol(col) || channelCol(col - 1)) return null;
    const dials = [];
    for (let k = col; channelCol(k); k++) {
      const meta = page.dials[k];
      dials.push({ role: "channel", col: k, meta, position: moveChannelPosition(meta, values[meta.path]), track: `channel-${k - col}` });
    }
    return { kind: "channel", col, span: dials.length, dials };
  };
  const faceAt = (col) => stripMode ? null : gateAt(col) ?? vectorAt(col) ?? multibandAt(col) ?? channelAt(col);
  const underFace = (col) => {
    for (let j = col - 1; j >= 0 && j >= col - MOVE_DIALS; j--) {
      if (!visibleCols.includes(j)) continue;
      const face = faceAt(j);
      if (face && j + face.span > col) return true;
    }
    return false;
  };
  const pressChip = (e, col, meta) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    holdStart.current = Date.now();
    armMod(meta.path);
    setHeld({ col, meta });
  };
  const releaseChip = (col, meta) => {
    setHeld(null);
    if (Date.now() - holdStart.current >= TAP_MS) return;
    const wasLatched = chipLatched(col, meta);
    setLatched((prev) => ({ ...prev, [col]: wasLatched ? void 0 : meta }));
    window.dispatchEvent(new CustomEvent(MOVE_LATCH_EVENT, {
      detail: { pageId: page.panel.id, path: meta.path, latched: !wasLatched }
    }));
  };
  const appRows = settingsOpen || explorationOpen ? 0 : surface.rows;
  const padRows = movePadRows(page, appRows);
  const appRowAt = (row) => moveAppPadRow(row, appRows);
  const padAt = (x, y) => surface.pads.find((p) => p.x === x && p.y === y);
  const shownPadRows = Array.from({ length: PAD_ROWS }, (_, row) => row).filter((row) => appRowAt(row) !== null || (settingsPanel ? padRows.slice(row).some((r) => r.length > 0) : padRows[row].some(Boolean)));
  const firstAppScreenRow = shownPadRows.find((row) => appRowAt(row) !== null) ?? -1;
  const visibleCols = stripMode ? page.dials.map((_, i) => i) : settingsPanel ? Array.from({ length: modPageWidth() }, (_, i) => i) : color ? Array.from({ length: MOVE_PADS }, (_, i) => i) : visibleColumns(page);
  const clusterCols = explorationOpen ? MOVE_DIALS : stripMode ? Math.min(MOVE_DIALS, visibleCols.length) || MOVE_DIALS : visibleCols.length;
  const kitPadCols = Math.max(0, ...padRows.map((row) => row.length));
  const appPadCols = Math.max(0, ...surface.pads.filter((cell) => !cell.empty).map((cell) => cell.x + 1));
  const padGridCols = shownPadRows.length === 0 ? 0 : appRows > 0 ? Math.min(MOVE_PADS, Math.max(1, clusterCols, appPadCols)) : Math.min(MOVE_PADS, Math.max(focused ? 1 : MIN_PAD_COLUMNS, clusterCols, kitPadCols));
  const surfaceCols = Math.max(clusterCols, padGridCols);
  const panelIdForTabs = `${pageTabsId}-panel`;
  const pageTabIndex = pages.indexOf(page);
  const selectPage = (index) => {
    const next = pages[index];
    if (!next) return;
    import_ModulationStore2.ModulationStore.closeSettings();
    MoveSettingsView.close();
    setTrack(index);
    window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: next.panel.id } }));
  };
  const stripStops = stripMode ? stripOffsets(page) : [];
  const stripTotal = stripMode ? Math.max(1, stripSlotCount(page)) : 1;
  const stripFrom = stripMode ? stripSlotIndex(page, stripOffset) : 0;
  const stripTo = stripMode ? stripSlotIndex(page, stripOffset + MOVE_DIALS) : 0;
  const volumeReading = liveValue ?? volume?.value;
  const headerCluster = (timelineClaimed || waveClaimed || volume || headerEnd || functionChips === "clock") && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-actions", children: [
    functionChips === "clock" && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveFunctionChips, {}),
    timelineClaimed ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveTimelineClock, {}) : waveClaimed ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveWaveClock, {}) : volume && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-volume", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-volume-tick", style: { background: MOVE_TRACK_COLORS[0] } }),
      volume.label && volumeReading != null && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-volume-label", children: volume.label }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-volume-value", children: boldColons(volumeReading ?? volume.label ?? "") })
    ] }),
    headerEnd
  ] });
  const content = /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-root tweakers-move-root", "data-theme": theme, "data-dock": dock, children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
      MoveMenuButton,
      {
        theme,
        open: !!presetScreen || paletteScreen,
        label: paletteScreen || colorOpenPanel ? "Palettes" : "Presets"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { ref: panelRef, className: "tweakers-move", "data-dock": dock, "data-settings": settingsOpen || void 0, "data-move-motion-key": `${motionSurface}:${motionPage}|${pages.map((pg) => pg.panel.id).join(" ")}`, "data-overlay": padListView || explorationOpen || composition || audioWave != null || roomWave || color || presetSave ? true : void 0, children: [
      !explorationOpen && colorMeta && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveColorDisplay, { panelId: page.panel.id, meta: colorMeta, anchor: panelRef, theme }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(PresetExploration, {}),
      presetSave && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePresetSaveInput, { suggested: presetSave.suggested }),
      !explorationOpen && composition && modSettings && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        MoveCurveComposer,
        {
          index: modSettings.index,
          segments: composition.segments,
          direction: composition.direction,
          gap: composition.gap ?? 0,
          selected: clipIndex
        }
      ),
      !explorationOpen && audioWave != null && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveAudioWave, { index: audioWave, theme }),
      !explorationOpen && roomWave && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveRoomWave, { theme }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        "div",
        {
          className: "tweakers-move-inner",
          style: {
            "--move-cols": clusterCols,
            "--move-surface-cols": surfaceCols,
            // The header row spans exactly what the controls row shows: the
            // dial cluster plus, when a wheel screen stands beside it, the
            // screen and its gap — so the page name sits on the top-left
            // corner of the first real object and follows every resize.
            "--move-screen-w": screen ? "calc(var(--move-wheel-width) + 2 * var(--move-gap))" : "0px"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-tracks", children: [
              audioWave != null ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveAudioZoom, {}) : /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-tracks-lead", children: [
                timelineClaimed ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveTimelineZoom, {}) : waveClaimed && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveAudioZoom, {}),
                headerStart && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-header-start", children: headerStart }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-tracks-group", children: [
                  settingsOpen && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-settings-title", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-settings-blink" }),
                    roomPages.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-pages", role: "tablist", "aria-label": "Settings pages", children: roomPages.map((pg, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                      "button",
                      {
                        type: "button",
                        role: "tab",
                        className: "tweakers-move-track",
                        "data-active": pg === page,
                        "aria-selected": pg === page,
                        tabIndex: pg === page ? 0 : -1,
                        onClick: () => {
                          setRoomTrack(i);
                          window.dispatchEvent(new CustomEvent(MOVE_PAGE_SELECT_EVENT, { detail: { pageId: pg.panel.id } }));
                        },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-marker", style: { background: MOVE_TRACK_COLORS[i] } }),
                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-label", children: pg.panel.name })
                        ]
                      },
                      pg.panel.id
                    )) }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-label", children: page.panel.name })
                  ] }),
                  !settingsOpen && gradientMeta && gradientValue && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-pages", role: "tablist", "aria-label": `${gradientMeta.label} stops`, "data-stops": true, children: gradientValue.stops.slice(0, MOVE_GRADIENT_STOPS).map((stop, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                    "button",
                    {
                      type: "button",
                      role: "tab",
                      className: "tweakers-move-track",
                      "data-active": i === Math.min(MoveColorStore.getStop(), gradientValue.stops.length - 1),
                      "aria-selected": i === Math.min(MoveColorStore.getStop(), gradientValue.stops.length - 1),
                      tabIndex: i === MoveColorStore.getStop() ? 0 : -1,
                      onClick: () => MoveColorStore.selectStop(i),
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-marker", style: { background: stop.color } }),
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "tweakers-move-track-label", children: [
                          "Stop ",
                          i + 1
                        ] })
                      ]
                    },
                    i
                  )) }),
                  !settingsOpen && !gradientMeta && pages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-pages", role: "tablist", "aria-label": "Move pages", children: pages.map((pg, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                    "button",
                    {
                      id: `${pageTabsId}-tab-${i}`,
                      type: "button",
                      role: "tab",
                      className: "tweakers-move-track",
                      "data-active": pg === page,
                      "aria-selected": pg === page,
                      "aria-controls": panelIdForTabs,
                      tabIndex: pg === page ? 0 : -1,
                      onClick: () => selectPage(i),
                      onKeyDown: (event) => {
                        const last = pages.length - 1;
                        const next = event.key === "ArrowRight" ? (i + 1) % pages.length : event.key === "ArrowLeft" ? (i - 1 + pages.length) % pages.length : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
                        if (next < 0) return;
                        event.preventDefault();
                        selectPage(next);
                        event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[next]?.focus();
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-marker", style: { background: MOVE_TRACK_COLORS[i] } }),
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-track-label", children: pg.panel.name })
                      ]
                    },
                    pg.panel.id
                  )) }),
                  functionChips === "tracks" && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveFunctionChips, {})
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-mods", children: settingsOpen ? roomWave ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveAudioZoom, {}) : null : color && colorMeta ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveColorSteps, { color, disabled: import_TweakStore16.TweakStore.isDisabled(page.panel.id, colorMeta.path) }) : surface.steps === null ? import_ModulationStore2.ModulationStore.getSlots().map((slot) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModCircle, { slot }, slot.index)) : null }),
              audioWave != null ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveAudioTransport, { index: audioWave }) : roomWave ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveRoomTransport, {}) : headerCluster
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "div",
              {
                id: pages.length > 1 && pageTabIndex >= 0 ? panelIdForTabs : void 0,
                className: "tweakers-move-controls",
                role: pages.length > 1 && pageTabIndex >= 0 ? "tabpanel" : void 0,
                "aria-labelledby": pages.length > 1 && pageTabIndex >= 0 ? `${pageTabsId}-tab-${pageTabIndex}` : void 0,
                children: [
                  screen && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-wheel-screen", role: "group", "aria-label": screen.title ?? "Wheel selection", "data-search": screenSearch ? true : void 0, children: [
                    screenSearch ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSearchBar, { view: screenSearch }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSearchDoor, { onOpen: () => MoveSearchStore.open("screen", screen.index) }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                      ListScreen,
                      {
                        items: searchedRows(
                          screen.items.map((row, index) => ({
                            value: String(index),
                            label: moveScreenRowLabel(row),
                            ...typeof row === "string" ? {} : {
                              ...row.detail ? { detail: row.detail } : {},
                              ...row.checked === void 0 ? {} : { checked: row.checked },
                              ...row.tag ? { tag: row.tag } : {}
                            }
                          })),
                          screenSearch,
                          screen.items.map(moveScreenRowSearchText)
                        ),
                        value: String(screenSearch ? screenSearch.cursor : screen.index),
                        follow: "center",
                        back: screenSearch ? void 0 : screen.back,
                        onBack: () => MoveFunctions.run("back"),
                        onSelect: (value) => {
                          if (!value) return;
                          if (screenSearch) MoveSearchStore.close();
                          MoveSurfaceStore.selectScreen(Number(value));
                        }
                      }
                    )
                  ] }),
                  explorationOpen && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(PresetExplorationSlots, {}),
                  (visibleCols.length > 0 || shownPadRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                    "div",
                    {
                      style: explorationOpen ? { display: "none" } : void 0,
                      className: "tweakers-move-grid",
                      "data-presets": presetScreen?.phase === "open" || paletteScreen || void 0,
                      "data-pad-columns": padGridCols || void 0,
                      children: [
                        presetScreen && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePresetScreen, { view: presetScreen, search: presetSearch }),
                        paletteScreen && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePaletteScreen, { kept: paletteSearch ? moveSearchFilter(["All colors", ...MoveColorStore.palettes().map((p) => p.name)], paletteSearch.query) : null, children: paletteSearch && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSearchBar, { view: paletteSearch }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-viewport", "data-scroll": stripMode || void 0, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                          "div",
                          {
                            className: "tweakers-move-strip",
                            "data-scroll": stripMode || void 0,
                            style: stripMode ? { "--move-strip-len": page.dials.length, "--move-offset": stripOffset } : void 0,
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-dials", "data-scroll": stripMode || void 0, children: [
                                !stripMode && !settingsPanel && !color && slotGroups(page, visibleCols).map(({ start, span, label }) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                  "div",
                                  {
                                    className: "tweakers-move-slot-group",
                                    "aria-hidden": "true",
                                    "data-labelled": label ? "true" : void 0,
                                    style: { gridColumn: `${start + 1} / span ${span}`, gridRow: 1, "--move-group-span": span },
                                    children: [
                                      label && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-slot-group-head", children: label }),
                                      Array.from({ length: span - 1 }, (_, k) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("i", { className: "tweakers-move-slot-group-divider", style: { "--move-group-divider-at": k + 1 } }, k))
                                    ]
                                  },
                                  `group-${start}`
                                )),
                                visibleCols.map((i) => {
                                  if (isSpanContinuation(page, i)) return null;
                                  if (!stripMode && visibleCols.includes(i - 1) && trimSpanAt(i - 1)) return null;
                                  if (underFace(i)) return null;
                                  const meta = dialSpan(page.dials[i]) > 1 ? page.dials[i] : dialAt(i);
                                  if (!meta) return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-dial", "data-empty": "true" }, `empty-${i}`);
                                  const disabled = import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path);
                                  const active = dragPath === meta.path || !!handTouch[meta.path] || !!hwHeld[meta.path] || held !== null && held.col === i;
                                  const valueFirst = meta.display === "value" || (focused || !!settingsPanel || page.panel.kind === "kit") && !(meta.min === 0 && meta.max === 1);
                                  const scopeSlot = settingsPanel ? modLayout?.dials.find((d) => d.path === meta.path)?.scope : void 0;
                                  const waveSlot = settingsPanel && meta.type !== "xy" ? modLayout?.dials.find((d) => d.path === meta.path)?.preview : void 0;
                                  const scope = scopeSlot && modSettings ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveScope, { index: modSettings.index }) : waveSlot && modSettings ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveWavePreview, { index: modSettings.index }) : null;
                                  if (padListView?.panelId === page.panel.id && (page.actions[i] ?? page.valueActions?.[i])?.path === padListView.path) {
                                    const listPath = `${padListView.panelId}:${padListView.path}`;
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-active": "true",
                                        "data-latched": "true",
                                        "data-pad-list-dial": "true",
                                        role: "slider",
                                        tabIndex: 0,
                                        "aria-label": `${padListView.label} list dial`,
                                        "aria-valuemin": 0,
                                        "aria-valuemax": Math.max(0, padListView.options.length - 1),
                                        "aria-valuenow": padListView.cursor,
                                        "aria-valuetext": padListView.options[padListView.cursor]?.label ?? "No items",
                                        "aria-disabled": padListView.pending || void 0,
                                        "aria-orientation": "vertical",
                                        onKeyDown: (event) => {
                                          const step = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : 0;
                                          if (!step) return;
                                          event.preventDefault();
                                          MovePadListStore.move(step);
                                        },
                                        onPointerDown: (event) => {
                                          if (event.button <= 0) beginPress(event, listPath, padListView.cursor);
                                        },
                                        onPointerMove: (event) => {
                                          const p = movePressTravel(pressRef, listPath, event, () => MovePadListStore.getView()?.cursor ?? 0);
                                          if (!p) return;
                                          const want = Math.max(0, Math.min(padListView.options.length - 1, p.v + Math.trunc((event.clientY - p.ay) / MOVE_LIST_ROW_TRAVEL)));
                                          if (want !== padListView.cursor) MovePadListStore.setCursor(want);
                                        },
                                        onPointerUp: () => {
                                          endPress(listPath);
                                        },
                                        onPointerCancel: () => {
                                          endPress(listPath);
                                        },
                                        onWheel: (event) => {
                                          event.stopPropagation();
                                          MovePadListStore.move(event.deltaY);
                                        },
                                        children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotDefaultBody, { label: padListView.label, value: padListView.options[padListView.cursor]?.label ?? "No items", pct: 100 * padListView.cursor / Math.max(1, padListView.options.length - 1), originPct: null })
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "color") return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveColorSlot, { panelId: page.panel.id, meta, active, open: colorMeta?.path === meta.path, latched: meta !== page.dials[i] && chipLatched(i, meta) }, meta.path);
                                  if (meta.type === "filter") {
                                    const fv = normalizeFilterValue(
                                      values[meta.path],
                                      resolveFilterAxis(meta.cutoffAxis, "cutoff"),
                                      resolveFilterAxis(meta.resonanceAxis, "resonance")
                                    );
                                    const shape = filterShapePath(meta, values[meta.path]);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "filter",
                                        "data-active": active || void 0,
                                        "data-disabled": meta.filterEnabled === false || void 0,
                                        onPointerDown: (e) => {
                                          try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                          } catch {
                                          }
                                          fineRef.current = null;
                                          setDragPath(meta.path);
                                          armMod(meta.path);
                                          filterFromPointer(e, meta, true);
                                        },
                                        onPointerMove: (e) => {
                                          if (dragPath === meta.path) filterFromPointer(e, meta, false);
                                        },
                                        onPointerUp: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        onPointerCancel: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotFilterBody, { meta, value: fv, shape })
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "gradient") {
                                    const g = normalizeGradient(values[meta.path]);
                                    const open2 = colorMeta?.path === meta.path;
                                    const editable = g.stops.length <= MOVE_GRADIENT_STOPS;
                                    const index = open2 ? Math.min(MoveColorStore.getStop(), g.stops.length - 1) : Math.min(rampStop[meta.path] ?? 0, g.stops.length - 1);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "ramp",
                                        "data-active": active || open2 || void 0,
                                        role: editable ? "button" : void 0,
                                        "aria-expanded": editable ? open2 : void 0,
                                        "aria-haspopup": editable ? "dialog" : void 0,
                                        onPointerDown: (e) => {
                                          try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                          } catch {
                                          }
                                          fineRef.current = null;
                                          rampGesture.current = { path: meta.path, x: e.clientX, y: e.clientY, moved: false };
                                          setDragPath(meta.path);
                                          armMod(meta.path);
                                          rampFromPointer(e, meta, true);
                                        },
                                        onPointerMove: (e) => {
                                          const gesture = rampGesture.current;
                                          if (dragPath !== meta.path || gesture?.path !== meta.path) return;
                                          if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < MOVE_TAP_SLOP) return;
                                          gesture.moved = true;
                                          rampFromPointer(e, meta, false);
                                        },
                                        onPointerUp: () => {
                                          const tapped = rampGesture.current?.path === meta.path && !rampGesture.current.moved;
                                          rampGesture.current = null;
                                          setDragPath(null);
                                          fineRef.current = null;
                                          if (tapped && editable && !import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) {
                                            MoveColorStore.toggle(page.panel.id, meta.path);
                                          }
                                        },
                                        onPointerCancel: () => {
                                          rampGesture.current = null;
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotRampBody,
                                            {
                                              label: meta.label,
                                              value: `${index + 1}/${g.stops.length}`,
                                              css: rampCss(g.stops),
                                              stop: g.stops[index]?.position ?? null,
                                              stops: open2 ? g.stops.map((s) => s.position) : void 0
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "balance") {
                                    const a = String(values[meta.balanceA ?? ""] ?? "#000000");
                                    const b = String(values[meta.balanceB ?? ""] ?? "#ffffff");
                                    const v = Math.min(1, Math.max(0, Number(values[meta.path] ?? 0.5)));
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "balance",
                                        "data-active": active || void 0,
                                        ...dialDrag(meta),
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotRampBody,
                                            {
                                              label: meta.label,
                                              value: `${Math.round(v * 100)}%`,
                                              css: rampCss([
                                                { color: a, position: 0 },
                                                { color: b, position: 1 }
                                              ]),
                                              stop: v
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "slider" && meta.display === "dial") {
                                    const min = meta.min ?? 0, max = meta.max ?? 1;
                                    const v = Number(values[meta.path] ?? min);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "dial",
                                        "data-active": active || void 0,
                                        onPointerDown: (e) => {
                                          try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                          } catch {
                                          }
                                          fineRef.current = null;
                                          setDragPath(meta.path);
                                          armMod(meta.path);
                                          needleFromPointer(e, meta);
                                        },
                                        onPointerMove: (e) => {
                                          if (dragPath === meta.path) needleFromPointer(e, meta);
                                        },
                                        onPointerUp: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        onPointerCancel: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotDialBody,
                                            {
                                              label: meta.label,
                                              value: `${Number(v.toFixed(2))}${meta.unit ?? (Math.abs(max - min) >= 180 ? "\xB0" : "")}`,
                                              bearing: valueToBearing(v, min, max),
                                              origin: valueToBearing(meta.origin ?? min, min, max)
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "transfer") {
                                    const points = normalizeTransfer(values[meta.path]).points;
                                    const index = Math.min(curvePoint[meta.path] ?? 0, points.length - 1);
                                    const held2 = points[index];
                                    const samples = Array.from({ length: 48 }, (_, k) => sampleTransfer(points, k / 47));
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "transfer",
                                        "data-active": active || void 0,
                                        onPointerDown: (e) => {
                                          try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                          } catch {
                                          }
                                          fineRef.current = null;
                                          setDragPath(meta.path);
                                          armMod(meta.path);
                                          transferFromPointer(e, meta, true);
                                        },
                                        onPointerMove: (e) => {
                                          if (dragPath === meta.path) transferFromPointer(e, meta, false);
                                        },
                                        onPointerUp: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        onPointerCancel: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotTransferBody,
                                            {
                                              label: meta.label,
                                              value: `${index + 1}/${points.length}`,
                                              shape: moveShapePath(samples),
                                              point: { x: held2.x, y: 1 - held2.y }
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "xy") {
                                    const xa = resolveAxis(meta.xAxis);
                                    const ya = resolveAxis(meta.yAxis);
                                    const pos = pointFromValue(
                                      normalizeValue(values[meta.path], xa, ya),
                                      xa,
                                      ya
                                    );
                                    const preview = meta.path === previewPath ? import_ModulationStore2.ModulationStore.getSettingsPreview() : null;
                                    const gridN = moveXYGrid(meta);
                                    const cycles = !!settingsPanel && !!modLayout?.dials.find((d) => d.path === meta.path)?.cycle;
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "xy",
                                        "data-preview": preview ? true : void 0,
                                        "data-sub": valueFirst || void 0,
                                        "data-active": active || void 0,
                                        onPointerDown: (e) => {
                                          if (e.button > 0) return;
                                          beginPress(e, meta.path, 0);
                                          if (!cycles) xyFromPointer(e, meta);
                                        },
                                        onPointerMove: (e) => {
                                          const p = movePressTravel(pressRef, meta.path, e, () => 0);
                                          if (p || !cycles && dragPath === meta.path) xyFromPointer(e, meta);
                                        },
                                        onPointerUp: (e) => {
                                          const tapped = endPress(meta.path);
                                          xyRelease(meta);
                                          if (!tapped) return;
                                          if (e.shiftKey) resetValue(meta);
                                          else if (cycles) import_ModulationStore2.ModulationStore.tapSettingsControl(meta.path);
                                        },
                                        onPointerCancel: () => {
                                          endPress(meta.path);
                                          xyRelease(meta);
                                        },
                                        children: [
                                          valueFirst && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-dial-sub", children: meta.label }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotXYBody,
                                            {
                                              label: meta.label,
                                              value: preview ? preview.label : `${Math.round(pos.x * 100)}\xB7${Math.round((1 - pos.y) * 100)}`,
                                              position: pos,
                                              gridN,
                                              shape: preview ? moveShapePath(preview.points) : null
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.type === "range") {
                                    const pos = normalizeRangeDial(meta, values[meta.path]);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "range",
                                        "data-active": active || void 0,
                                        onPointerDown: (e) => {
                                          try {
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                          } catch {
                                          }
                                          fineRef.current = null;
                                          setDragPath(meta.path);
                                          armMod(meta.path);
                                          rangeFromPointer(e, meta, true);
                                        },
                                        onPointerMove: (e) => {
                                          if (dragPath === meta.path) rangeFromPointer(e, meta, false);
                                        },
                                        onPointerUp: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        onPointerCancel: () => {
                                          setDragPath(null);
                                          fineRef.current = null;
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotRangeBody, { label: meta.label, value: rangeReading(meta), lo: pos.lo, hi: pos.hi })
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (isEnumDial(meta)) {
                                    const options = meta.options ?? [];
                                    const activeIdx = enumIndex(meta, values[meta.path]);
                                    const option = options[activeIdx];
                                    const optionLabel = enumOptionLabel(option);
                                    const shape = enumShapePath(meta, values[meta.path]);
                                    const glyph = enumOptionIcon(option);
                                    const picture = enumOptionPicture(option);
                                    const playback = movePlaybackMode(meta, values[meta.path]);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "enum",
                                        style: dialSpan(meta) > 1 ? { gridColumn: `span ${dialSpan(meta)}` } : void 0,
                                        "data-scope": scope ? true : void 0,
                                        "data-visual": playback ? "playback" : void 0,
                                        role: "slider",
                                        tabIndex: disabled ? -1 : 0,
                                        "aria-label": meta.label,
                                        "aria-valuemin": 0,
                                        "aria-valuemax": Math.max(0, options.length - 1),
                                        "aria-valuenow": activeIdx,
                                        "aria-valuetext": optionLabel,
                                        "aria-orientation": "horizontal",
                                        "aria-disabled": disabled || void 0,
                                        "data-disabled": disabled || void 0,
                                        onKeyDown: (e) => dialFromKeyboard(e, meta),
                                        "data-shape": shape ? true : void 0,
                                        "data-active": active || void 0,
                                        ...optionDrag(meta),
                                        children: [
                                          scope,
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotEnumBody,
                                            {
                                              label: meta.label,
                                              optionLabel,
                                              options,
                                              activeIdx,
                                              shape,
                                              glyph,
                                              picture,
                                              playback,
                                              scoped: !!scope
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (meta.moveBlank) {
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-dial", "data-kind": "blank", "aria-hidden": "true" }, meta.path);
                                  }
                                  if (meta.type === "toggle") {
                                    const checked = values[meta.path] === true;
                                    const kind = moveSlotKind(meta);
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "button",
                                      {
                                        type: "button",
                                        className: "tweakers-move-dial",
                                        "data-kind": kind,
                                        "data-on": checked || void 0,
                                        "data-active": active || void 0,
                                        role: "switch",
                                        "aria-label": meta.label,
                                        "aria-checked": checked,
                                        disabled,
                                        onClick: () => {
                                          if (!import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path)) {
                                            import_TweakStore16.TweakStore.updateValue(page.panel.id, meta.path, !checked);
                                          }
                                        },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          kind === "metronome" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotMetronomeBody,
                                            {
                                              label: meta.label,
                                              checked,
                                              swing: meta.moveVisual?.kind === "metronome" ? meta.moveVisual.swing : void 0
                                            }
                                          ) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotToggleBody,
                                            {
                                              label: meta.label,
                                              checked,
                                              icon: meta.icon,
                                              onIcon: meta.onIcon,
                                              offIcon: meta.offIcon
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  if (scope) {
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "scope",
                                        "data-active": active || void 0,
                                        ...dialDrag(meta),
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotScopeBody,
                                            {
                                              label: meta.label,
                                              value: chipValue(meta).num + (meta.unit ? ` ${meta.unit}` : ""),
                                              pct: dialPercent(meta),
                                              children: scope
                                            }
                                          )
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  const envStage = settingsPanel ? modLayout?.dials.find((d) => d.path === meta.path)?.stage : void 0;
                                  if (envStage) {
                                    const stageDials = (modLayout?.dials ?? []).filter((d) => d.stage).flatMap((d) => {
                                      const m = page.dials.find((x) => x?.path === d.path);
                                      return m ? [{ stage: d.stage, meta: m }] : [];
                                    });
                                    if (stageDials[0]?.meta.path !== meta.path) return null;
                                    const envParams = {
                                      attack: Number(values.attack) || 0,
                                      decay: Number(values.decay) || 0,
                                      sustain: Number(values.sustain) || 0,
                                      release: Number(values.release) || 0,
                                      attackCurve: Number(modSlot?.params.attackCurve) || 0,
                                      decayCurve: Number(modSlot?.params.decayCurve) || 0,
                                      releaseCurve: Number(modSlot?.params.releaseCurve) || 0,
                                      ...Object.fromEntries(ENV_WAVE_STAGES.flatMap((s) => [
                                        [envWaveParam(s), Number(modSlot?.params[envWaveParam(s)]) || 0],
                                        [envWaveFlipParam(s), !!modSlot?.params[envWaveFlipParam(s)]]
                                      ]))
                                    };
                                    const envActive = waveHeld !== null || stageDials.some(
                                      (s) => dragPath === s.meta.path || !!handTouch[s.meta.path] || !!hwHeld[s.meta.path]
                                    );
                                    const reading = (m) => {
                                      const v = chipValue(m);
                                      return `${v.num}${v.unit ? ` ${v.unit}` : ""}`;
                                    };
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "env",
                                        "data-active": envActive || void 0,
                                        style: { gridColumn: `span ${stageDials.length}` },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MoveSlotEnvBody,
                                            {
                                              points: envelopePoints(envParams, 129),
                                              stages: stageDials.map((s) => ({ stage: s.stage, label: s.meta.label, value: reading(s.meta) })),
                                              joints: envelopeJoints(envParams).map((j) => ({ ...j, held: bendHeld === j.stage }))
                                            }
                                          ),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-env-zones", children: stageDials.map(({ meta: m }) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            "div",
                                            {
                                              className: "tweakers-move-env-zone",
                                              ...dialDrag(m),
                                              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: m.path })
                                            },
                                            m.path
                                          )) })
                                        ]
                                      },
                                      meta.path
                                    );
                                  }
                                  const face = faceAt(i);
                                  if (face) {
                                    const dials = face.dials.map((d) => ({
                                      ...d,
                                      active: dragPath === d.meta.path || !!handTouch[d.meta.path] || !!hwHeld[d.meta.path] || held !== null && held.col === d.col
                                    }));
                                    const shown = (d) => ({
                                      label: d.meta.label,
                                      value: moveVisualReading(d.meta, Number(values[d.meta.path])),
                                      position: d.position,
                                      active: d.active
                                    });
                                    const body = face.kind === "channel" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotChannelBody, { channels: dials.map((d) => {
                                      const visual = d.meta.moveVisual;
                                      return { ...shown(d), ...visual?.kind === "channel" ? { icon: visual.icon, tone: visual.tone } : {} };
                                    }) }) : face.kind === "vector" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotVectorBody, { x: shown(dials[0]), y: shown(dials[1]), z: shown(dials[2]), down: face.down }) : face.kind === "gate" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotGateBody, { threshold: shown(dials[0]), lookahead: shown(dials[1]), release: shown(dials[2]), children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveGateDisplay, { panelId: page.panel.id, threshold: dials[0].position }) }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotMultibandBody, { amount: shown(dials[0]), speed: shown(dials[1]), bands: dials.slice(2).map(shown), icon: face.icon, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                      MoveMultibandDisplay,
                                      {
                                        panelId: page.panel.id,
                                        bands: face.curve.map((b) => ({ position: b.position, active: dragPath === b.meta.path || dials.some((d) => d.active && d.meta === b.meta) }))
                                      }
                                    ) });
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": face.kind,
                                        "data-active": dials.some((d) => d.active) || void 0,
                                        "data-latched": dials.every((d) => d.meta !== page.dials[d.col] && chipLatched(d.col, d.meta)) || void 0,
                                        style: { gridColumn: `span ${face.span}` },
                                        children: [
                                          body,
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-face-zones", children: dials.map((d) => {
                                            const off = import_TweakStore16.TweakStore.isDisabled(page.panel.id, d.meta.path);
                                            return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                              "div",
                                              {
                                                className: "tweakers-move-face-zone",
                                                "data-role": d.role,
                                                role: "slider",
                                                tabIndex: off ? -1 : 0,
                                                "aria-label": d.meta.label,
                                                "aria-valuemin": d.meta.min ?? 0,
                                                "aria-valuemax": d.meta.max ?? 1,
                                                "aria-valuenow": Number(values[d.meta.path]),
                                                "aria-valuetext": moveVisualReading(d.meta, Number(values[d.meta.path])),
                                                "aria-orientation": d.role === "lookahead" || d.role === "axis-x" ? "horizontal" : "vertical",
                                                "aria-disabled": off || void 0,
                                                "data-disabled": off || void 0,
                                                onKeyDown: (k) => dialFromKeyboard(k, d.meta),
                                                onPointerDown: (p) => {
                                                  let meta2 = d.meta;
                                                  if (d.role === "band" && face.curve) {
                                                    const grid = p.currentTarget.closest?.(".tweakers-move-dial")?.querySelector('[data-track="grid"]')?.getBoundingClientRect();
                                                    if (grid?.width) {
                                                      const k = Math.floor((p.clientX - grid.left) / grid.width * face.curve.length);
                                                      meta2 = face.curve[Math.max(0, Math.min(face.curve.length - 1, k))].meta;
                                                    }
                                                  }
                                                  faceDrag.current = meta2;
                                                  dialDrag(meta2).onPointerDown(p);
                                                },
                                                onPointerMove: (p) => {
                                                  if (faceDrag.current) dialDrag(faceDrag.current).onPointerMove(p);
                                                },
                                                onPointerUp: (p) => {
                                                  if (faceDrag.current) dialDrag(faceDrag.current).onPointerUp(p);
                                                  faceDrag.current = null;
                                                },
                                                onPointerCancel: () => {
                                                  if (faceDrag.current) dialDrag(faceDrag.current).onPointerCancel();
                                                  faceDrag.current = null;
                                                },
                                                children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: d.meta.path })
                                              },
                                              d.col
                                            );
                                          }) })
                                        ]
                                      },
                                      dials[0].meta.path
                                    );
                                  }
                                  const trimSpan = !stripMode && visibleCols.includes(i + 1) ? trimSpanAt(i) : null;
                                  if (trimSpan) {
                                    const edges = [
                                      { edge: "start", col: i, meta: trimSpan.start, position: trimSpan.at.start },
                                      { edge: "end", col: i + 1, meta: trimSpan.end, position: trimSpan.at.end }
                                    ];
                                    const edgeActive = (e) => dragPath === e.meta.path || !!handTouch[e.meta.path] || !!hwHeld[e.meta.path] || held !== null && held.col === e.col;
                                    const side = (e) => ({
                                      label: e.meta.label,
                                      value: moveVisualReading(e.meta, Number(values[e.meta.path])),
                                      position: e.position,
                                      moved: e.edge === "start" ? e.position > 1e-9 : e.position < 1 - 1e-9
                                    });
                                    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                      "div",
                                      {
                                        className: "tweakers-move-dial",
                                        "data-kind": "trim-span",
                                        "data-active": edges.some(edgeActive) || void 0,
                                        "data-latched": edges.every((e) => e.meta !== page.dials[e.col] && chipLatched(e.col, e.meta)) || void 0,
                                        style: { gridColumn: "span 2" },
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotTrimSpanBody, { start: side(edges[0]), end: side(edges[1]) }),
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-trim-span-zones", children: edges.map((e) => {
                                            const off = import_TweakStore16.TweakStore.isDisabled(page.panel.id, e.meta.path);
                                            return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                              "div",
                                              {
                                                className: "tweakers-move-trim-span-zone",
                                                role: "slider",
                                                tabIndex: off ? -1 : 0,
                                                "aria-label": e.meta.label,
                                                "aria-valuemin": e.meta.min ?? 0,
                                                "aria-valuemax": e.meta.max ?? 1,
                                                "aria-valuenow": Number(values[e.meta.path]),
                                                "aria-valuetext": moveVisualReading(e.meta, Number(values[e.meta.path])),
                                                "aria-orientation": "horizontal",
                                                "aria-disabled": off || void 0,
                                                "data-disabled": off || void 0,
                                                onKeyDown: (k) => dialFromKeyboard(k, e.meta),
                                                ...dialDrag(e.meta),
                                                children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: e.meta.path })
                                              },
                                              e.meta.path
                                            );
                                          }) })
                                        ]
                                      },
                                      trimSpan.start.path
                                    );
                                  }
                                  const latchedHere = meta !== page.dials[i] && chipLatched(i, meta);
                                  const origin01 = dialOrigin(meta);
                                  const originPct = origin01 > 0 ? origin01 * 100 : null;
                                  const pct = dialPercent(meta);
                                  const atOrigin = originPct != null && Math.abs(normalizeDial(meta, values[meta.path]) - origin01) < 1e-6;
                                  const drawing = moveNumericDrawing(meta, values[meta.path]);
                                  const subbed = meta !== page.dials[i];
                                  const subValue = subbed || valueFirst ? chipValue(meta) : null;
                                  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                    "div",
                                    {
                                      className: "tweakers-move-dial",
                                      "data-active": active || void 0,
                                      "data-latched": latchedHere || void 0,
                                      "data-sub": !drawing && (subbed || valueFirst) || void 0,
                                      "data-visual": drawing?.kind,
                                      role: "slider",
                                      tabIndex: disabled ? -1 : 0,
                                      "aria-label": meta.label,
                                      "aria-valuemin": meta.min ?? 0,
                                      "aria-valuemax": meta.max ?? 1,
                                      "aria-valuenow": Number(values[meta.path]),
                                      "aria-valuetext": moveVisualReading(meta, Number(values[meta.path])),
                                      "aria-orientation": "horizontal",
                                      "aria-disabled": disabled || void 0,
                                      "data-disabled": disabled || void 0,
                                      onKeyDown: (e) => dialFromKeyboard(e, meta),
                                      ...dialDrag(meta),
                                      children: [
                                        !drawing && (subbed || valueFirst) && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-dial-sub", children: meta.label }),
                                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path }),
                                        drawing ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSlotNumericBody, { label: meta.label, value: moveVisualReading(meta, Number(values[meta.path])), drawing }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          MoveSlotDefaultBody,
                                          {
                                            label: meta.label,
                                            value: subValue ? `${subValue.num}${subValue.unit ? ` ${subValue.unit}` : ""}` : dialReading(meta),
                                            pct,
                                            originPct,
                                            atOrigin
                                          }
                                        )
                                      ]
                                    },
                                    meta.path
                                  );
                                })
                              ] }),
                              color && colorMeta ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveOpacityPads, { color, disabled: import_TweakStore16.TweakStore.isDisabled(page.panel.id, colorMeta.path) }) : shownPadRows.map((row) => {
                                if (appRowAt(row) !== null && !surface.pads.length) {
                                  if (row > firstAppScreenRow) return null;
                                  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                    "div",
                                    {
                                      className: "tweakers-move-app-row",
                                      "data-rows": appRows,
                                      onPointerDown: (e) => {
                                        try {
                                          e.currentTarget.setPointerCapture(e.pointerId);
                                        } catch {
                                        }
                                      },
                                      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-app-row-label", children: surface.padsLabel ?? "the app\u2019s pads" })
                                    },
                                    "app-rows"
                                  );
                                }
                                return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                  "div",
                                  {
                                    className: "tweakers-move-pads",
                                    "data-pad-row": row,
                                    "data-pad-columns": stripMode ? page.dials.length : padGridCols,
                                    style: { "--move-pad-cols": stripMode ? page.dials.length : padGridCols },
                                    children: (stripMode ? visibleCols : Array.from({ length: padGridCols }, (_, i) => i)).map((col) => {
                                      const appRow = appRowAt(row);
                                      if (appRow !== null) {
                                        const cell = padAt(col, appRow);
                                        if (!cell || cell.empty) {
                                          return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-pad", "data-empty": "true" }, `app-${col}`);
                                        }
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          "button",
                                          {
                                            type: "button",
                                            className: "tweakers-move-pad",
                                            "data-kind": "app",
                                            title: surface.padsLabel ?? void 0,
                                            "data-on": cell.lit || appHeld === `${appRow}:${col}` || void 0,
                                            "data-held": appHeld === `${appRow}:${col}` || void 0,
                                            onPointerDown: (e) => {
                                              try {
                                                e.currentTarget.setPointerCapture(e.pointerId);
                                              } catch {
                                              }
                                              setAppHeld(`${appRow}:${col}`);
                                            },
                                            onPointerUp: () => setAppHeld(null),
                                            onPointerCancel: () => setAppHeld(null),
                                            onClick: (e) => MoveSurfaceStore.press(col, appRow, e.shiftKey),
                                            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadAppBody, { label: cell.label, color: cell.color })
                                          },
                                          `app-${col}`
                                        );
                                      }
                                      const meta = padRows[row][col];
                                      if (meta && isMoveTabs(meta)) {
                                        if (isPadSpanContinuation(padRows[row], col)) return null;
                                        const span = padSpan(meta);
                                        const named = isNamedTabs(meta);
                                        const options = meta.options ?? [];
                                        const active = enumIndex(meta, values[meta.path]);
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                          "div",
                                          {
                                            className: "tweakers-move-tabs",
                                            "data-kind": "tabs",
                                            style: { gridColumn: `span ${span}`, "--move-tabs-cols": span },
                                            children: [
                                              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                                MovePadTabsBody,
                                                {
                                                  name: named ? meta.label : null,
                                                  options,
                                                  activeIdx: active
                                                }
                                              ),
                                              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-tab-zones", role: "tablist", "aria-label": meta.label, children: options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                                "button",
                                                {
                                                  type: "button",
                                                  role: "tab",
                                                  className: "tweakers-move-tab-zone",
                                                  style: { gridColumnStart: (named ? 2 : 1) + i },
                                                  "aria-selected": i === active,
                                                  disabled: import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path),
                                                  onClick: () => import_TweakStore16.TweakStore.updateValue(
                                                    page.panel.id,
                                                    meta.path,
                                                    enumOptionValue(opt)
                                                  ),
                                                  children: enumOptionLabel(opt)
                                                },
                                                enumOptionValue(opt)
                                              )) })
                                            ]
                                          },
                                          meta.path
                                        );
                                      }
                                      const bendStage = !meta && settingsPanel && padRows[row] === page.toggles && modSettings ? modLayout?.dials[col]?.stage : void 0;
                                      if (bendStage && ENV_BEND_STAGES.includes(bendStage)) {
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          "button",
                                          {
                                            className: "tweakers-move-pad",
                                            "data-kind": "bend",
                                            "data-on": bendHeld === bendStage || void 0,
                                            onPointerDown: (e) => {
                                              try {
                                                e.currentTarget.setPointerCapture(e.pointerId);
                                              } catch {
                                              }
                                              setBendHeld(bendStage);
                                              bendRef.current = {
                                                y: e.clientY,
                                                curve: Number(modSlot?.params[envCurveParam(bendStage)]) || 0
                                              };
                                            },
                                            onPointerMove: (e) => {
                                              if (bendHeld !== bendStage || !bendRef.current) return;
                                              const v = Math.min(1, Math.max(
                                                -1,
                                                bendRef.current.curve + (bendRef.current.y - e.clientY) / 60
                                              ));
                                              import_ModulationStore2.ModulationStore.updateSlotParams(modSettings.index, { [envCurveParam(bendStage)]: v });
                                            },
                                            onPointerUp: () => {
                                              setBendHeld(null);
                                              bendRef.current = null;
                                            },
                                            onPointerCancel: () => {
                                              setBendHeld(null);
                                              bendRef.current = null;
                                            },
                                            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadToggleBody, { label: "Curve" })
                                          },
                                          `bend-${bendStage}`
                                        );
                                      }
                                      const waveStage = !meta && settingsPanel && padRows[row] === page.values && modSettings ? modLayout?.dials[col]?.stage : void 0;
                                      if (waveStage && ENV_WAVE_STAGES.includes(waveStage)) {
                                        const amount = Number(modSlot?.params[envWaveParam(waveStage)]) || 0;
                                        const flipped = !!modSlot?.params[envWaveFlipParam(waveStage)];
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          "button",
                                          {
                                            className: "tweakers-move-pad",
                                            "data-kind": "wave",
                                            "data-on": amount > 0 || void 0,
                                            "data-held": waveHeld === waveStage || void 0,
                                            onPointerDown: (e) => {
                                              try {
                                                e.currentTarget.setPointerCapture(e.pointerId);
                                              } catch {
                                              }
                                              setWaveHeld(waveStage);
                                              waveRef.current = { y: e.clientY, amount, moved: false };
                                            },
                                            onPointerMove: (e) => {
                                              if (waveHeld !== waveStage || !waveRef.current) return;
                                              const dy = waveRef.current.y - e.clientY;
                                              if (!waveRef.current.moved && Math.abs(dy) < 3) return;
                                              waveRef.current.moved = true;
                                              const v = Math.min(1, Math.max(0, waveRef.current.amount + dy / 100));
                                              import_ModulationStore2.ModulationStore.updateSlotParams(modSettings.index, { [envWaveParam(waveStage)]: v });
                                            },
                                            onPointerUp: () => {
                                              if (waveHeld === waveStage && waveRef.current && !waveRef.current.moved) {
                                                import_ModulationStore2.ModulationStore.updateSlotParams(modSettings.index, {
                                                  [envWaveFlipParam(waveStage)]: !flipped
                                                });
                                              }
                                              setWaveHeld(null);
                                              waveRef.current = null;
                                            },
                                            onPointerCancel: () => {
                                              setWaveHeld(null);
                                              waveRef.current = null;
                                            },
                                            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadWaveBody, { label: flipped ? "Swell" : "Dip", percent: Math.round(amount * 100) })
                                          },
                                          `wave-${waveStage}`
                                        );
                                      }
                                      if (!meta) return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-pad", "data-empty": "true" }, `empty-${col}`);
                                      const edges = stripMode ? null : moveEdgesCell(page, padRows, row, col);
                                      if (edges?.tail) return null;
                                      if (edges) {
                                        const chipHeld = (m) => held !== null && held.meta.path === m.path || !!hwHeld[m.path];
                                        const hand = (m, open2) => ({
                                          at: normalizeDial(m, values[m.path]),
                                          moved: Math.abs(Number(values[m.path]) - open2) >= Math.max((m.step ?? 0) / 2, 1e-9)
                                        });
                                        const start = hand(edges.start, edges.start.min ?? 0);
                                        const end = hand(edges.end, edges.kind === "loop" ? edges.end.max ?? 1 : edges.end.min ?? 0);
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                                          "div",
                                          {
                                            className: "tweakers-move-edges",
                                            "data-kind": edges.kind,
                                            style: { gridColumn: "span 2" },
                                            onPointerDown: (e) => {
                                              const x = edgesFromPointer(e);
                                              const takeStart = edges.kind === "fade" ? x < 0.5 : Math.abs(x - start.at) < Math.abs(x - end.at) || start.at >= end.at && x <= start.at;
                                              const m = takeStart ? edges.start : edges.end;
                                              if (import_TweakStore16.TweakStore.isDisabled(page.panel.id, m.path)) return;
                                              try {
                                                e.currentTarget.setPointerCapture(e.pointerId);
                                              } catch {
                                              }
                                              setDragPath(m.path);
                                              armMod(m.path);
                                              dragEdge(edges.kind, takeStart, m, x);
                                            },
                                            onPointerMove: (e) => {
                                              const m = dragPath === edges.start.path ? edges.start : dragPath === edges.end.path ? edges.end : null;
                                              if (m && !import_TweakStore16.TweakStore.isDisabled(page.panel.id, m.path)) dragEdge(edges.kind, m === edges.start, m, edgesFromPointer(e));
                                            },
                                            onPointerUp: () => setDragPath(null),
                                            onPointerCancel: () => setDragPath(null),
                                            children: [
                                              edges.kind === "fade" ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadFadeBody, { fadeIn: start, fadeOut: end }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadLoopBody, { start, end }),
                                              [[edges.start, col], [edges.end, col + 1]].map(([m, at2]) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                                "div",
                                                {
                                                  className: "tweakers-move-edges-zone",
                                                  role: "slider",
                                                  tabIndex: import_TweakStore16.TweakStore.isDisabled(page.panel.id, m.path) ? -1 : 0,
                                                  "aria-label": m.label,
                                                  "aria-valuemin": m.min ?? 0,
                                                  "aria-valuemax": m.max ?? 1,
                                                  "aria-valuenow": Number(values[m.path]),
                                                  "aria-valuetext": moveVisualReading(m, Number(values[m.path])),
                                                  "aria-orientation": "horizontal",
                                                  "data-held": chipHeld(m) || void 0,
                                                  "data-latched": chipLatched(at2, m) || void 0,
                                                  onKeyDown: (k) => dialFromKeyboard(k, m),
                                                  children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: m.path, pad: true })
                                                },
                                                m.path
                                              ))
                                            ]
                                          },
                                          `edges-${col}`
                                        );
                                      }
                                      const band = moveBandCell(page, padRows, row, col);
                                      if (band?.tail) return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-band", "data-tail": true, "aria-hidden": "true" }, `band-${col}`);
                                      if (band) {
                                        const lower = band.upper === "high" ? band.low : band.high;
                                        const chipHeld = (m) => held !== null && held.meta.path === m.path || !!hwHeld[m.path];
                                        const hand = (m, open2) => ({
                                          at: normalizeDial(m, values[m.path]),
                                          cut: Number(values[m.path]) !== open2,
                                          held: chipHeld(m),
                                          latched: chipLatched(col, m)
                                        });
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-band", "data-kind": "band", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-band-face", children: [
                                          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            MovePadBandBody,
                                            {
                                              low: hand(band.low, band.low.min ?? 0),
                                              high: hand(band.high, band.high.max ?? 1),
                                              upper: band.upper
                                            }
                                          ),
                                          [meta, lower].map((m) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                            "button",
                                            {
                                              type: "button",
                                              className: "tweakers-move-band-zone",
                                              "aria-label": m.label,
                                              "data-held": chipHeld(m) || void 0,
                                              "data-latched": chipLatched(col, m) || void 0,
                                              onPointerDown: (e) => pressChip(e, col, m),
                                              onPointerUp: () => releaseChip(col, m),
                                              onPointerCancel: () => setHeld(null),
                                              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: m.path, pad: true })
                                            },
                                            m.path
                                          ))
                                        ] }) }, `band-${col}`);
                                      }
                                      if (page.toggles[col] === meta) {
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          "button",
                                          {
                                            className: "tweakers-move-pad",
                                            "data-kind": meta.icon ? "icon" : "toggle",
                                            "data-on": !!values[meta.path],
                                            "aria-label": meta.icon ? meta.label : void 0,
                                            title: meta.icon ? meta.label : void 0,
                                            ...meta.moveHold ? holdPad(page.panel.id, meta.path) : {
                                              onClick: () => import_TweakStore16.TweakStore.updateValue(page.panel.id, meta.path, !values[meta.path])
                                            },
                                            children: meta.icon ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadIconBody, { icon: meta.icon }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadToggleBody, { label: meta.label })
                                          },
                                          meta.path
                                        );
                                      }
                                      if (meta.type === "action") {
                                        if (MovePadListStore.has(page.panel.id, meta.path)) return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadList, { panelId: page.panel.id, path: meta.path, label: meta.label, icon: meta.icon, view: padListView, disabled: import_TweakStore16.TweakStore.isDisabled(page.panel.id, meta.path) }, meta.path);
                                        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                          "button",
                                          {
                                            className: "tweakers-move-pad",
                                            "data-kind": "action",
                                            onClick: () => import_TweakStore16.TweakStore.triggerAction(page.panel.id, meta.path),
                                            children: meta.icon ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadIconLabelBody, { icon: meta.icon, label: meta.label }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadActionBody, { label: meta.label })
                                          },
                                          meta.path
                                        );
                                      }
                                      const isColor = meta.type === "color";
                                      const value = isColor ? null : chipValue(meta);
                                      return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                                        "button",
                                        {
                                          className: "tweakers-move-pad",
                                          "data-kind": isColor ? "color" : "value",
                                          "data-held": held !== null && held.meta.path === meta.path || hwHeld[meta.path] || void 0,
                                          "data-latched": chipLatched(col, meta) || void 0,
                                          "aria-label": isColor ? meta.label : void 0,
                                          onPointerDown: (e) => pressChip(e, col, meta),
                                          onPointerUp: () => releaseChip(col, meta),
                                          onPointerCancel: () => setHeld(null),
                                          children: isColor ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadColorBody, { label: meta.label, color: String(values[meta.path]) }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePadValueBody, { label: meta.label, value: value.num, unit: value.unit, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveModRing, { panelId: page.panel.id, path: meta.path, pad: true }) })
                                        },
                                        meta.path
                                      );
                                    })
                                  },
                                  row
                                );
                              })
                            ]
                          }
                        ) }),
                        !settingsOpen && surface.steps && MoveSurfaceStore.ownsSteps() && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-app-steps", children: stepRuns(surface.steps).map((run) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-step-group", children: run.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                          "button",
                          {
                            type: "button",
                            className: "tweakers-move-mod",
                            "data-lit": cell.lit || void 0,
                            title: `Step ${cell.step + 1}`,
                            "aria-pressed": !!cell.lit,
                            onClick: (event) => MoveSurfaceStore.pressStep(cell.step, event.shiftKey),
                            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-mod-dot", style: { background: cell.lit ? cell.color ?? "var(--move-text)" : "transparent", boxShadow: cell.lit ? void 0 : "inset 0 0 0 1.5px var(--move-text)" } })
                          },
                          cell.step
                        )) }, run[0].step)) }),
                        stripMode && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                          "div",
                          {
                            className: "tweakers-move-rail",
                            role: "slider",
                            tabIndex: 0,
                            "aria-label": `Slots ${stripFrom + 1}\u2013${stripTo} of ${stripTotal}`,
                            "aria-valuemin": 0,
                            "aria-valuemax": Math.max(0, stripStops.length - 1),
                            "aria-valuenow": Math.max(0, stripStops.indexOf(stripOffset)),
                            "aria-orientation": "horizontal",
                            "data-scrolling": dotDrag !== null || void 0,
                            onKeyDown: (e) => {
                              const dir = e.key === "ArrowRight" || e.key === "PageDown" ? 1 : e.key === "ArrowLeft" || e.key === "PageUp" ? -1 : 0;
                              const paged = e.shiftKey || e.key === "PageUp" || e.key === "PageDown";
                              if (dir && paged) {
                                e.preventDefault();
                                scrollPage(dir);
                                return;
                              }
                              const step = dir || (e.key === "Home" ? -stripStops.length : e.key === "End" ? stripStops.length : 0);
                              if (!step) return;
                              e.preventDefault();
                              scrollSlots(step);
                            },
                            onPointerDown: (e) => {
                              try {
                                e.currentTarget.setPointerCapture(e.pointerId);
                              } catch {
                              }
                              setDotDrag({ x: e.clientX, stop: Math.max(0, stripStops.indexOf(stripOffset)) });
                            },
                            onPointerMove: (e) => {
                              if (!dotDrag) return;
                              const slotWidth = e.currentTarget.getBoundingClientRect().width / MOVE_DIALS || 1;
                              const want = dotDrag.stop + Math.round((e.clientX - dotDrag.x) / slotWidth);
                              setOffset(stripStops[Math.min(stripStops.length - 1, Math.max(0, want))]);
                            },
                            onPointerUp: () => setDotDrag(null),
                            onPointerCancel: () => setDotDrag(null),
                            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                              "span",
                              {
                                className: "tweakers-move-rail-window",
                                style: {
                                  left: `${stripFrom / stripTotal * 100}%`,
                                  width: `${(stripTo - stripFrom) / stripTotal * 100}%`
                                }
                              }
                            )
                          }
                        )
                      ]
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    ] })
  ] });
  const moving = /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MovePanelMotion, { surface: motionSurface, page: motionPage, panel: panelRef, children: content });
  return dock === "flow" ? moving : (0, import_react_dom5.createPortal)(moving, document.body);
}
var MOVE_CURVE_WIDTH = 320;
var MOVE_CURVE_HEIGHT = 84;
function MoveCurveComposer({
  index,
  segments,
  direction,
  gap,
  selected
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-curve", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    CurveComposer,
    {
      segments,
      direction,
      gap,
      selectedIndex: selected,
      getPhase: () => import_ModulationStore2.ModulationStore.getSlotPhase(index),
      onSelect: (i) => import_ModulationStore2.ModulationStore.updateSlotParams(index, { selected: i }),
      onSegmentsChange: (next) => import_ModulationStore2.ModulationStore.updateSlotParams(index, { clips: next }),
      width: MOVE_CURVE_WIDTH,
      height: MOVE_CURVE_HEIGHT
    }
  ) });
}
var clampWave01 = (v) => Math.min(1, Math.max(0, Number(v) || 0));
function MoveAudioWave({ index, theme }) {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => subscribeAudioMod(cb), []),
    () => getAudioModVersion(),
    () => 0
  );
  (0, import_react16.useEffect)(() => {
    const params = import_ModulationStore2.ModulationStore.getSlot(index)?.params ?? {};
    const start = clampWave01(params.loopStart);
    const end = clampWave01(params.loopEnd ?? 1);
    MoveWaveformStore.setView({
      position: clampWave01(params.position),
      loop: end - start > 1e-3 && !(start === 0 && end === 1) ? { start, end } : null,
      loopAnchor: null
    });
    MoveWaveformStore.setProgressSource(() => import_ModulationStore2.ModulationStore.getSlotPhase(index));
    MoveWaveformStore.setEditor(true);
    setAudioModWindowSource(() => visibleWindow(import_ModulationStore2.ModulationStore.getSlotPhase(index), MoveWaveformStore.shownZoom()));
    return () => {
      setAudioModWindowSource(null);
      MoveWaveformStore.setEditor(false);
      MoveWaveformStore.setProgressSource(null);
    };
  }, [index]);
  (0, import_react16.useEffect)(() => {
    const toggle = (path) => () => {
      const slot = import_ModulationStore2.ModulationStore.getSlot(index);
      if (slot) import_ModulationStore2.ModulationStore.updateSlotParams(index, { [path]: !slot.params[path] });
    };
    const releases = [
      MoveFunctions.push("play", toggle("playing"), { label: "Play", chip: false }),
      MoveFunctions.push("loop", toggle("loopOn"), { label: "Loop", chip: false }),
      MoveFunctions.push("back", () => import_ModulationStore2.ModulationStore.closeSettings(), { label: "Close", chip: false })
    ];
    return () => releases.forEach((release) => release());
  }, [index]);
  (0, import_react16.useEffect)(() => {
    const prev = MoveSurfaceStore.getState();
    MoveSurfaceStore.setPadRows(
      1,
      Array.from({ length: MOVE_WAVEFORM_PADS }, (_, x) => ({
        x,
        y: 0,
        label: `${x + 1}`,
        color: modColor(index)
      })),
      "tap to jump the playhead \xB7 hold to loop that part"
    );
    const offPress = MoveSurfaceStore.onPress(({ x, y }) => {
      if (y === 0) MoveWaveformStore.pressPad(x);
    });
    return () => {
      offPress();
      MoveSurfaceStore.setPadRows(prev.rows, prev.pads, prev.padsLabel);
    };
  }, [index]);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    MoveWaveform,
    {
      variant: "dock",
      theme,
      buffer: getAudioModBuffer(),
      getProgress: () => import_ModulationStore2.ModulationStore.getSlotPhase(index),
      onSeek: (p) => import_ModulationStore2.ModulationStore.updateSlotParams(index, { position: p }),
      onLoopChange: (loop) => import_ModulationStore2.ModulationStore.updateSlotParams(index, loop ? { loopStart: loop.start, loopEnd: loop.end, loopOn: true } : { loopStart: 0, loopEnd: 1 }),
      mode: "smooth",
      smoothPoints: 200,
      baseline: false,
      height: MOVE_WAVE_DISPLAY_HEIGHT,
      waveColor: "#1e1e1e",
      playheadColor: modColor(index),
      accent: modColor(index)
    }
  );
}
var MOVE_WAVE_DISPLAY_HEIGHT = 128;
function MoveRoomWave({ theme }) {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => subscribeAudioMod(cb), []),
    () => getAudioModVersion(),
    () => 0
  );
  const buffer = MoveWaveformStore.getBuffer() ?? getAudioModBuffer() ?? moveWaveformDemoSample();
  roomClock.duration = buffer.duration || 1;
  (0, import_react16.useEffect)(() => {
    let last = null;
    let raf = requestAnimationFrame(function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!roomClock.playing) {
        last = null;
        return;
      }
      if (last != null) roomClock.advance((now - last) / 1e3, MoveWaveformStore.getView().loop);
      last = now;
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  (0, import_react16.useEffect)(() => {
    MoveWaveformStore.setProgressSource(() => roomClock.pos);
    const releases = [
      MoveFunctions.push("play", () => roomClock.toggle("playing"), { label: "Play", chip: false }),
      MoveFunctions.push("loop", () => roomClock.toggle("loopOn"), { label: "Loop", chip: false })
    ];
    return () => {
      releases.forEach((release) => release());
      MoveWaveformStore.setProgressSource(null);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    MoveWaveform,
    {
      variant: "dock",
      theme,
      buffer,
      getProgress: () => roomClock.pos,
      onSeek: (p) => roomClock.seek(p),
      onLoopChange: () => {
      },
      height: MOVE_WAVE_DISPLAY_HEIGHT,
      waveColor: "#1e1e1e"
    }
  );
}
var roomClock = {
  playing: true,
  loopOn: true,
  pos: 0,
  duration: 1,
  version: 0,
  listeners: /* @__PURE__ */ new Set(),
  subscribe(fn) {
    roomClock.listeners.add(fn);
    return () => {
      roomClock.listeners.delete(fn);
    };
  },
  notify() {
    roomClock.version += 1;
    for (const fn of roomClock.listeners) fn();
  },
  toggle(key) {
    roomClock[key] = !roomClock[key];
    if (key === "playing" && roomClock.playing && roomClock.pos >= 1) roomClock.pos = 0;
    roomClock.notify();
  },
  seek(p) {
    roomClock.pos = Math.min(1, Math.max(0, p));
  },
  advance(dt, loop) {
    let pos = roomClock.pos + dt / roomClock.duration;
    if (roomClock.loopOn) {
      const start = loop ? loop.start : 0;
      const end = loop ? loop.end : 1;
      const span = Math.max(1e-4, end - start);
      if (pos >= end) pos = start + (pos - start) % span;
      else if (pos < start) pos = start;
    } else if (pos >= 1) {
      pos = 1;
    }
    roomClock.pos = pos;
  }
};
function MoveAudioZoom() {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-wave-zoom", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-wave-zoom-dot" }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "tweakers-move-wave-zoom-label", children: [
      parseFloat(MoveWaveformStore.getView().zoom.toFixed(1)),
      "x"
    ] })
  ] });
}
function MoveWaveClock() {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => MoveWaveformStore.subscribe(cb), []),
    () => MoveWaveformStore.getVersion(),
    () => 0
  );
  const transport = MoveWaveformStore.getTransport();
  const clockRef = (0, import_react16.useRef)(null);
  (0, import_react16.useEffect)(() => {
    let raf = requestAnimationFrame(function tick() {
      const text = MoveWaveformStore.clock();
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-volume tweakers-move-wave-time", "data-transport": transport ? true : void 0, children: [
    transport && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { className: "tweakers-move-wave-state", "data-on": transport.playing || void 0, viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d: ICON_PLAY, fill: "currentColor" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { ref: clockRef, className: "tweakers-move-volume-value", children: MoveWaveformStore.clock() }),
    transport && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { className: "tweakers-move-wave-state", "data-on": transport.loopOn || void 0, viewBox: "0 0 24 24", "aria-hidden": "true", children: ICON_LOOP.map((d) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d, fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }, d)) })
  ] });
}
function MoveAudioTransport({ index }) {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => import_ModulationStore2.ModulationStore.subscribe(cb), []),
    () => import_ModulationStore2.ModulationStore.getVersion(),
    () => 0
  );
  const params = import_ModulationStore2.ModulationStore.getSlot(index)?.params ?? {};
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    MoveWaveTransport,
    {
      playing: !!params.playing,
      loopOn: !!params.loopOn,
      getSeconds: () => import_ModulationStore2.ModulationStore.getSlotPhase(index) * (getAudioModBuffer()?.duration ?? 0),
      onLoaded: () => import_ModulationStore2.ModulationStore.updateSlotParams(index, { position: 0 })
    }
  );
}
function MoveRoomTransport() {
  (0, import_react16.useSyncExternalStore)(
    (0, import_react16.useCallback)((cb) => roomClock.subscribe(cb), []),
    () => roomClock.version,
    () => 0
  );
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    MoveWaveTransport,
    {
      playing: roomClock.playing,
      loopOn: roomClock.loopOn,
      getSeconds: () => roomClock.pos * roomClock.duration,
      onLoaded: () => roomClock.seek(0)
    }
  );
}
function MoveWaveTransport({ playing: playing2, loopOn, getSeconds, onLoaded }) {
  const params = { playing: playing2, loopOn };
  const clockRef = (0, import_react16.useRef)(null);
  const secondsRef = (0, import_react16.useRef)(getSeconds);
  secondsRef.current = getSeconds;
  (0, import_react16.useEffect)(() => {
    let raf = requestAnimationFrame(function tick() {
      const t = secondsRef.current();
      const text = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(Math.floor(t % 1 * 100)).padStart(2, "0")}`;
      if (clockRef.current && clockRef.current.textContent !== text) clockRef.current.textContent = text;
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const fileRef = (0, import_react16.useRef)(null);
  const loadFile = async (file) => {
    const bytes = await file.arrayBuffer();
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    try {
      setAudioModBuffer(await ctx.decodeAudioData(bytes));
      onLoaded?.();
    } catch {
    } finally {
      void ctx.close();
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-actions", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
      "button",
      {
        type: "button",
        className: "tweakers-move-wave-load",
        title: "Load an audio file",
        onClick: () => fileRef.current?.click(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "tweakers-move-wave-load-dot" }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: "Load" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-volume tweakers-move-wave-time", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "svg",
        {
          className: "tweakers-move-wave-state",
          "data-on": params.playing ? true : void 0,
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d: ICON_PLAY, fill: "currentColor" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { ref: clockRef, className: "tweakers-move-volume-value", children: "0:00:00" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "svg",
        {
          className: "tweakers-move-wave-state",
          "data-on": params.loopOn ? true : void 0,
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          children: ICON_LOOP.map((d) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d, fill: "none", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }, d))
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: "audio/*",
        hidden: true,
        onChange: (e) => {
          const file = e.currentTarget.files?.[0];
          e.currentTarget.value = "";
          if (file) void loadFile(file);
        }
      }
    )
  ] });
}
function MovePresetScreen({ view, search }) {
  const items = MovePresetStore.items(view.panelId);
  const rows = items.length ? searchedRows(items.map((i) => ({ value: i.id, label: i.label })), search) : [{ value: "", label: "No presets", muted: true }];
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "div",
    {
      className: "tweakers-move-preset-screen",
      "data-open": view.phase === "open" || void 0,
      "data-chosen": view.chosen ? true : void 0,
      "data-comparing": view.comparing || void 0,
      "data-search": search ? true : void 0,
      onWheel: (e) => {
        e.preventDefault();
        if (!search) MovePresetStore.scroll(e.deltaY > 0 ? 1 : -1);
      },
      children: [
        search ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSearchBar, { view: search }) : items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(MoveSearchDoor, { onOpen: () => MoveSearchStore.open("presets") }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          ListScreen,
          {
            items: rows,
            value: view.chosen ?? view.cursor ?? void 0,
            onSelect: (id) => {
              if (!id) return;
              if (search) MoveSearchStore.close();
              MovePresetStore.choose(id);
            }
          }
        )
      ]
    }
  );
}
function searchedRows(rows, search, hay) {
  if (!search) return rows;
  const kept = moveSearchFilter(hay ?? rows.map((r) => r.label), search.query);
  return kept.length ? kept.map((i) => rows[i]) : [{ value: "", label: "No matches", muted: true }];
}
function MoveSearchDoor({ onOpen }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("button", { type: "button", className: "tweakers-move-search-door", "aria-label": "Search the list", title: "Search ( / )", onClick: onOpen, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d: ICON_SEARCH, stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) });
}
function MoveSearchBar({ view }) {
  const inputRef = (0, import_react16.useRef)(null);
  (0, import_react16.useEffect)(() => {
    inputRef.current?.focus();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "tweakers-move-search", role: "search", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("svg", { className: "tweakers-move-search-icon", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { d: ICON_SEARCH, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
      "input",
      {
        ref: inputRef,
        className: "tweakers-move-search-input",
        type: "text",
        value: view.query,
        placeholder: "Search",
        "aria-label": "Search the list",
        spellCheck: false,
        autoComplete: "off",
        onChange: (e) => searchType(e.currentTarget.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") searchTake(view);
          else if (e.key === "Escape") MoveSearchStore.close();
          else if (e.key === "ArrowDown") searchStep(view, 1);
          else if (e.key === "ArrowUp") searchStep(view, -1);
          else return;
          e.preventDefault();
          e.stopPropagation();
        }
      }
    )
  ] });
}
function MovePresetSaveInput({ suggested }) {
  const inputRef = (0, import_react16.useRef)(null);
  (0, import_react16.useEffect)(() => {
    inputRef.current?.select();
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "tweakers-move-preset-save", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    "input",
    {
      ref: inputRef,
      className: "tweakers-move-preset-save-input",
      defaultValue: suggested,
      autoFocus: true,
      spellCheck: false,
      onKeyDown: (e) => {
        if (e.key === "Enter") MovePresetStore.commitSave(e.currentTarget.value);
        else if (e.key === "Escape") MovePresetStore.cancelSave();
      },
      onBlur: () => MovePresetStore.cancelSave()
    }
  ) });
}
var SCOPE_SAMPLES = 120;
function MoveScope({ index }) {
  const ref = (0, import_react16.useRef)(null);
  (0, import_react16.useEffect)(() => {
    const now = (import_ModulationStore2.ModulationStore.getSignal(index) + 1) / 2;
    const pts = Array(SCOPE_SAMPLES).fill(now);
    let raf = requestAnimationFrame(function tick() {
      pts.push((import_ModulationStore2.ModulationStore.getSignal(index) + 1) / 2);
      pts.shift();
      ref.current?.setAttribute("d", moveShapePath(pts));
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    "svg",
    {
      className: "tweakers-move-scope-wave",
      "data-scope": "true",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { ref })
    }
  );
}
function MoveWavePreview({ index }) {
  const path = (0, import_react16.useRef)(null);
  const line = (0, import_react16.useRef)(null);
  const preview = import_ModulationStore2.ModulationStore.getSettingsPreview(64);
  (0, import_react16.useEffect)(() => {
    let shown = "";
    let raf = requestAnimationFrame(function tick() {
      const { start, span } = getAudioModWindow();
      const key = `${start.toFixed(5)}|${span.toFixed(5)}`;
      if (key !== shown) {
        shown = key;
        const p = import_ModulationStore2.ModulationStore.getSettingsPreview(64);
        if (p) path.current?.setAttribute("d", moveShapePath(p.points));
      }
      const at2 = (import_ModulationStore2.ModulationStore.getSlotPhase(index) - start) / span;
      const x = (Math.min(1, Math.max(0, at2)) * 100).toFixed(2);
      line.current?.setAttribute("x1", x);
      line.current?.setAttribute("x2", x);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);
  if (!preview) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "svg",
    {
      className: "tweakers-move-scope-wave",
      "data-scope": "true",
      viewBox: "0 0 100 100",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("path", { ref: path, d: moveShapePath(preview.points) }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("line", { ref: line, x1: "0", y1: "0", x2: "0", y2: "100" })
      ]
    }
  );
}
function stepRuns(cells) {
  const runs = [];
  for (const cell of cells) {
    const last = runs[runs.length - 1];
    if (last && cell.group !== void 0 && last[0].group === cell.group && last[last.length - 1].step === cell.step - 1) last.push(cell);
    else runs.push([cell]);
  }
  return runs;
}
function MoveModCircle({ slot }) {
  const dotRef = (0, import_react16.useRef)(null);
  const pressAt = (0, import_react16.useRef)(0);
  (0, import_react16.useEffect)(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    return import_ModulationStore2.ModulationStore.subscribeFrames(() => {
      const el = dotRef.current;
      if (!el) return;
      const level = (import_ModulationStore2.ModulationStore.getSignal(slot.index) + 1) / 2;
      el.style.transform = `scale(${(0.66 + 0.34 * level).toFixed(3)})`;
    });
  }, [slot.index]);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    "button",
    {
      type: "button",
      className: "tweakers-move-mod",
      title: `${slot.type.toUpperCase()} \xB7 step ${slot.index + 1}`,
      onPointerDown: () => {
        pressAt.current = Date.now();
      },
      onPointerUp: () => {
        const held = Date.now() - pressAt.current;
        if (held >= LONG_PRESS_MS) {
          import_ModulationStore2.ModulationStore.removeSlot(slot.index);
          return;
        }
        const tapped = held < TAP_MS;
        if (tapped && import_ModulationStore2.ModulationStore.assignFromStep(slot.index).action !== "none") return;
        const open2 = import_ModulationStore2.ModulationStore.getSettings();
        if (tapped && open2 && open2.index === slot.index) import_ModulationStore2.ModulationStore.closeSettings();
        else import_ModulationStore2.ModulationStore.openSettings(slot.index);
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "span",
        {
          ref: dotRef,
          className: "tweakers-move-mod-dot",
          style: { background: modColor(slot.index) }
        }
      )
    }
  );
}

// src/components/MoveSlot.tsx
var import_react17 = require("react");
var import_TweakStore17 = require("tweakers/store");
var import_ModulationStore3 = require("tweakers/modulation-store");
var import_jsx_runtime18 = require("react/jsx-runtime");
var flat3 = (controls, out = []) => {
  for (const c of controls) {
    if (c.children) flat3(c.children, out);
    else out.push(c);
  }
  return out;
};
var findPanel = (panel) => import_TweakStore17.TweakStore.getPanel(panel) ?? import_TweakStore17.TweakStore.getPanels().find((p) => p.name === panel);
var warned = /* @__PURE__ */ new Set();
function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[tweakers] MoveSlot: ${message}`);
}
function MoveSlot({ panel, path, valueFirst = false, className, style }) {
  const config = (0, import_react17.useSyncExternalStore)(
    (0, import_react17.useCallback)((cb) => import_TweakStore17.TweakStore.subscribeGlobal(cb), []),
    () => findPanel(panel),
    () => void 0
  );
  const panelId = config?.id;
  const values = (0, import_react17.useSyncExternalStore)(
    (0, import_react17.useCallback)((cb) => panelId ? import_TweakStore17.TweakStore.subscribe(panelId, cb) : () => {
    }, [panelId]),
    () => panelId ? import_TweakStore17.TweakStore.getValues(panelId) : void 0,
    () => void 0
  );
  (0, import_react17.useSyncExternalStore)(
    (0, import_react17.useCallback)((cb) => panelId ? import_TweakStore17.TweakStore.subscribeControlState(panelId, cb) : () => {
    }, [panelId]),
    () => 0,
    () => 0
  );
  (0, import_react17.useSyncExternalStore)(
    (0, import_react17.useCallback)((cb) => import_ModulationStore3.ModulationStore.subscribe(cb), []),
    () => import_ModulationStore3.ModulationStore.getVersion(),
    () => 0
  );
  (0, import_react17.useSyncExternalStore)(MoveColorStore.subscribe, MoveColorStore.getVersion, () => 0);
  const fine = (0, import_react17.useRef)(null);
  const rangeHandle = (0, import_react17.useRef)("min");
  const filterHand = (0, import_react17.useRef)("cutoff");
  const faceDrag = (0, import_react17.useRef)(null);
  const press = (0, import_react17.useRef)(null);
  const tap = (0, import_react17.useRef)(null);
  const [dragPath, setDragPath] = (0, import_react17.useState)(null);
  const [heldPoint, setHeldPoint] = (0, import_react17.useState)(0);
  const [heldStop, setHeldStop] = (0, import_react17.useState)(0);
  if (!config || !values || !panelId) return null;
  const paths = Array.isArray(path) ? path : [path];
  const controls = flat3(config.controls);
  const metas = paths.map((p) => controls.find((c) => c.path === p));
  if (metas.some((m) => !m)) {
    warnOnce(`${panel}:${paths.join(",")}`, `no control at ${paths.filter((_, k) => !metas[k]).join(", ")} in "${panel}".`);
    return null;
  }
  const all = metas;
  const write2 = (meta2, next) => import_TweakStore17.TweakStore.updateValue(panelId, meta2.path, next);
  const off = (meta2) => import_TweakStore17.TweakStore.isDisabled(panelId, meta2.path);
  const cls = className ? `tweakers-move-dial ${className}` : "tweakers-move-dial";
  const drag = (meta2, turn2, release) => ({
    onPointerDown: (e) => {
      if (off(meta2)) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
      }
      fine.current = null;
      setDragPath(meta2.path);
      import_ModulationStore3.ModulationStore.noteTouch(panelId, meta2.path);
      turn2(e, true);
    },
    onPointerMove: (e) => {
      if (dragPath === meta2.path && !off(meta2)) turn2(e, false);
    },
    onPointerUp: () => {
      setDragPath(null);
      fine.current = null;
      release?.();
    },
    onPointerCancel: () => {
      setDragPath(null);
      fine.current = null;
    }
  });
  const begin = (e, meta2, v) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
    }
    fine.current = null;
    press.current = movePressStart(meta2.path, e, v);
    setDragPath(meta2.path);
    import_ModulationStore3.ModulationStore.noteTouch(panelId, meta2.path);
  };
  const end = (meta2) => {
    setDragPath(null);
    return movePressEnd(press, meta2.path);
  };
  const reset = (meta2) => {
    const first = import_TweakStore17.TweakStore.getDefault(panelId, meta2.path);
    if (first !== void 0 && !off(meta2)) write2(meta2, first);
  };
  const turn = (meta2) => ({
    onPointerDown: (e) => {
      if (e.button <= 0 && !off(meta2)) begin(e, meta2, normalizeDial(meta2, values[meta2.path]));
    },
    onPointerMove: (e) => {
      const p = movePressTravel(press, meta2.path, e, () => normalizeDial(meta2, values[meta2.path]));
      if (p && !off(meta2)) write2(meta2, moveTurnValue(meta2, p, e, moveTurnExtent(e.currentTarget.getBoundingClientRect())));
    },
    onPointerUp: (e) => {
      if (end(meta2) && e.shiftKey) reset(meta2);
    },
    onPointerCancel: () => {
      end(meta2);
    }
  });
  const step = (meta2) => ({
    onPointerDown: (e) => {
      if (e.button <= 0 && !off(meta2)) begin(e, meta2, enumIndex(meta2, values[meta2.path]));
    },
    onPointerMove: (e) => {
      const p = movePressTravel(press, meta2.path, e, () => enumIndex(meta2, values[meta2.path]));
      const next = p && !off(meta2) ? moveOptionStep(meta2, values[meta2.path], p, e) : void 0;
      if (next !== void 0) write2(meta2, next);
    },
    onPointerUp: (e) => {
      if (!end(meta2) || off(meta2)) return;
      const next = e.shiftKey ? import_TweakStore17.TweakStore.getDefault(panelId, meta2.path) : moveNextOption(meta2, values[meta2.path]);
      if (next !== void 0) write2(meta2, next);
    },
    onPointerCancel: () => {
      end(meta2);
    }
  });
  const keys = (meta2) => (e) => {
    if (off(meta2)) return;
    const next = moveDialKey(meta2, values[meta2.path], e);
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    import_ModulationStore3.ModulationStore.noteTouch(panelId, meta2.path);
    write2(meta2, next);
  };
  const slider = (meta2) => ({
    role: "slider",
    tabIndex: off(meta2) ? -1 : 0,
    "aria-label": meta2.label,
    "aria-valuemin": meta2.min ?? 0,
    "aria-valuemax": meta2.max ?? 1,
    "aria-valuenow": Number(values[meta2.path]),
    "aria-valuetext": moveVisualReading(meta2, Number(values[meta2.path])),
    "aria-orientation": "horizontal",
    "aria-disabled": off(meta2) || void 0,
    "data-disabled": off(meta2) || void 0,
    onKeyDown: keys(meta2)
  });
  const face = (dials) => {
    const vals = values;
    const reading = (m) => ({
      label: m.label,
      value: moveVisualReading(m, Number(vals[m.path])),
      active: dragPath === m.path
    });
    const take = dials.length === 2 ? moveTrimSpan(dials[0], vals[dials[0].path], dials[1], vals[dials[1].path]) : null;
    if (take) {
      const edges = [
        { edge: "start", meta: dials[0], position: take.start },
        { edge: "end", meta: dials[1], position: take.end }
      ];
      const side = (e) => ({
        ...reading(e.meta),
        position: e.position,
        moved: e.edge === "start" ? e.position > 1e-9 : e.position < 1 - 1e-9
      });
      return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: cls, style, "data-kind": "trim-span", "data-active": edges.some((e) => dragPath === e.meta.path) || void 0, children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotTrimSpanBody, { start: side(edges[0]), end: side(edges[1]) }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "tweakers-move-trim-span-zones", children: edges.map((e) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "tweakers-move-trim-span-zone", ...slider(e.meta), ...turn(e.meta), children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: e.meta.path }) }, e.meta.path)) })
      ] });
    }
    let kind;
    let parts;
    let body;
    const shown = (d) => ({ ...reading(d.meta), position: d.position });
    const gate = dials.length === 3 ? moveGateSpan(dials.map((m) => [m, vals[m.path]])) : null;
    const place3 = dials.length === 3 ? moveVectorAxes(dials.map((m) => [m, vals[m.path]])) : null;
    const cleaner = dials.length >= 3 ? moveMultibandSpan(dials.map((m) => [m, vals[m.path]]), dials.slice(2).map((m) => [m, vals[m.path]])) : null;
    const channels = dials.map((m) => moveChannelPosition(m, vals[m.path]));
    if (gate) {
      kind = "gate";
      parts = ["threshold", "lookahead", "release"].map((role, k) => ({ role, meta: dials[k], position: gate[role] }));
      body = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotGateBody, { threshold: shown(parts[0]), lookahead: shown(parts[1]), release: shown(parts[2]), children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveGateDisplay, { panelId, threshold: parts[0].position }) });
    } else if (place3) {
      kind = "vector";
      parts = ["x", "y", "z"].map((axis, k) => ({ role: `axis-${axis}`, meta: dials[k], position: place3[axis] }));
      body = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotVectorBody, { x: shown(parts[0]), y: shown(parts[1]), z: shown(parts[2]), down: place3.down });
    } else if (cleaner) {
      kind = "multiband";
      parts = dials.map((meta2, k) => ({
        role: k === 0 ? "amount" : k === 1 ? "speed" : "band",
        meta: meta2,
        position: k === 0 ? cleaner.amount : k === 1 ? cleaner.speed : cleaner.bands.find((b) => b.meta === meta2).position
      }));
      const visual = dials[0].moveVisual;
      body = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        MoveSlotMultibandBody,
        {
          amount: shown(parts[0]),
          speed: shown(parts[1]),
          bands: parts.slice(2).map(shown),
          icon: visual?.kind === "multiband" && visual.role === "amount" ? visual.icon : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveMultibandDisplay,
            {
              panelId,
              bands: cleaner.bands.map((b) => ({ position: b.position, active: dragPath === b.meta.path }))
            }
          )
        }
      );
    } else if (channels.every((c) => c !== null)) {
      kind = "channel";
      parts = dials.map((meta2, k) => ({ role: "channel", meta: meta2, position: channels[k], track: `channel-${k}` }));
      body = /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotChannelBody, { channels: parts.map((d) => {
        const visual = d.meta.moveVisual;
        return { ...shown(d), ...visual?.kind === "channel" ? { icon: visual.icon, tone: visual.tone } : {} };
      }) });
    } else {
      warnOnce(
        `${panel}:${dials.map((d) => d.path).join(",")}`,
        `${dials.map((d) => d.path).join(", ")} do not draw as one instrument \u2014 give each its own slot.`
      );
      return null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: cls, style, "data-kind": kind, "data-active": parts.some((d) => dragPath === d.meta.path) || void 0, children: [
      body,
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "tweakers-move-face-zones", children: parts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
        "div",
        {
          className: "tweakers-move-face-zone",
          "data-role": d.role,
          ...slider(d.meta),
          "aria-orientation": d.role === "lookahead" || d.role === "axis-x" ? "horizontal" : "vertical",
          onPointerDown: (e) => {
            let m = d.meta;
            if (d.role === "band" && cleaner) {
              const grid = e.currentTarget.closest?.(".tweakers-move-dial")?.querySelector('[data-track="grid"]')?.getBoundingClientRect();
              if (grid?.width) {
                const k = Math.floor((e.clientX - grid.left) / grid.width * cleaner.bands.length);
                m = cleaner.bands[Math.max(0, Math.min(cleaner.bands.length - 1, k))].meta;
              }
            }
            faceDrag.current = m;
            turn(m).onPointerDown(e);
          },
          onPointerMove: (e) => {
            if (faceDrag.current) turn(faceDrag.current).onPointerMove(e);
          },
          onPointerUp: (e) => {
            if (faceDrag.current) turn(faceDrag.current).onPointerUp(e);
            faceDrag.current = null;
          },
          onPointerCancel: () => {
            if (faceDrag.current) turn(faceDrag.current).onPointerCancel();
            faceDrag.current = null;
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: d.meta.path })
        },
        d.meta.path
      )) })
    ] });
  };
  if (all.length > 1) return face(all);
  const meta = all[0];
  const value = values[meta.path];
  const active = dragPath === meta.path;
  if (meta.type === "color") {
    const view = MoveColorStore.getView();
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      MoveColorSlot,
      {
        panelId,
        meta,
        active,
        className,
        style,
        open: view?.panelId === panelId && view.path === meta.path
      }
    );
  }
  if (meta.type === "toggle") {
    const checked = value === true;
    const kind = moveSlotKind(meta);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "button",
      {
        type: "button",
        className: cls,
        style,
        "data-kind": kind,
        "data-on": checked || void 0,
        role: "switch",
        "aria-label": meta.label,
        "aria-checked": checked,
        disabled: off(meta),
        onClick: () => {
          if (!off(meta)) write2(meta, !checked);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          kind === "metronome" ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotMetronomeBody,
            {
              label: meta.label,
              checked,
              swing: meta.moveVisual?.kind === "metronome" ? meta.moveVisual.swing : void 0
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotToggleBody, { label: meta.label, checked, icon: meta.icon, onIcon: meta.onIcon, offIcon: meta.offIcon })
        ]
      }
    );
  }
  if (meta.type === "filter") {
    const fv = normalizeFilterValue(value, resolveFilterAxis(meta.cutoffAxis, "cutoff"), resolveFilterAxis(meta.resonanceAxis, "resonance"));
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "filter",
        "data-active": active || void 0,
        "data-disabled": meta.filterEnabled === false || void 0,
        ...drag(meta, (e, down) => write2(meta, moveFilterValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), filterHand, fine, down))),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotFilterBody, { meta, value: fv, shape: filterShapePath(meta, value) })
        ]
      }
    );
  }
  if (meta.type === "gradient") {
    const g = normalizeGradient(value);
    const editable = g.stops.length <= MOVE_GRADIENT_STOPS;
    const view = MoveColorStore.getView();
    const open2 = view?.panelId === panelId && view.path === meta.path;
    const index = Math.min(open2 ? MoveColorStore.getStop() : heldStop, g.stops.length - 1);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "ramp",
        "data-active": active || open2 || void 0,
        role: editable ? "button" : void 0,
        "aria-expanded": editable ? open2 : void 0,
        "aria-haspopup": editable ? "dialog" : void 0,
        ...drag(meta, (e, down) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (down) {
            tap.current = { x: e.clientX, y: e.clientY, moved: false };
            const picked = moveRampStop(values[meta.path], e, rect);
            setHeldStop(picked);
            if (open2) MoveColorStore.selectStop(picked);
            return;
          }
          const t = tap.current;
          if (!t || !t.moved && Math.hypot(e.clientX - t.x, e.clientY - t.y) < MOVE_TAP_SLOP) return;
          t.moved = true;
          write2(meta, moveRampValue(values[meta.path], e, rect, index));
        }, () => {
          const tapped = tap.current && !tap.current.moved;
          tap.current = null;
          if (tapped && editable && !off(meta)) MoveColorStore.toggle(panelId, meta.path);
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotRampBody,
            {
              label: meta.label,
              value: `${index + 1}/${g.stops.length}`,
              css: rampCss(g.stops),
              stop: g.stops[index]?.position ?? null,
              stops: open2 ? g.stops.map((s) => s.position) : void 0
            }
          )
        ]
      }
    );
  }
  if (meta.type === "balance") {
    const a = String(values[meta.balanceA ?? ""] ?? "#000000");
    const b = String(values[meta.balanceB ?? ""] ?? "#ffffff");
    const v = Math.min(1, Math.max(0, Number(value ?? 0.5)));
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "balance",
        "data-active": active || void 0,
        ...slider(meta),
        ...turn(meta),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotRampBody,
            {
              label: meta.label,
              value: `${Math.round(v * 100)}%`,
              css: rampCss([{ color: a, position: 0 }, { color: b, position: 1 }]),
              stop: v
            }
          )
        ]
      }
    );
  }
  if (meta.type === "slider" && meta.display === "dial") {
    const min = meta.min ?? 0, max = meta.max ?? 1;
    const v = Number(value ?? min);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "dial",
        "data-active": active || void 0,
        ...slider(meta),
        ...drag(meta, (e) => {
          const next = moveNeedleValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect());
          if (next !== null) write2(meta, next);
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotDialBody,
            {
              label: meta.label,
              value: `${Number(v.toFixed(2))}${meta.unit ?? (Math.abs(max - min) >= 180 ? "\xB0" : "")}`,
              bearing: valueToBearing(v, min, max),
              origin: valueToBearing(meta.origin ?? min, min, max)
            }
          )
        ]
      }
    );
  }
  if (meta.type === "transfer") {
    const points = normalizeTransfer(value).points;
    const index = Math.min(heldPoint, points.length - 1);
    const held = points[index];
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "transfer",
        "data-active": active || void 0,
        ...drag(meta, (e, down) => {
          const next = moveTransferValue(values[meta.path], e, e.currentTarget.getBoundingClientRect(), heldPoint, down);
          if (down) setHeldPoint(next.held);
          write2(meta, next.value);
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotTransferBody,
            {
              label: meta.label,
              value: `${index + 1}/${points.length}`,
              shape: moveShapePath(Array.from({ length: 48 }, (_, k) => sampleTransfer(points, k / 47))),
              point: { x: held.x, y: 1 - held.y }
            }
          )
        ]
      }
    );
  }
  if (meta.type === "xy") {
    const xa = resolveAxis(meta.xAxis);
    const ya = resolveAxis(meta.yAxis);
    const pos = pointFromValue(normalizeValue(value, xa, ya), xa, ya);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "xy",
        "data-sub": valueFirst || void 0,
        "data-active": active || void 0,
        ...drag(meta, (e) => write2(meta, moveXYValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), fine)), () => {
          const rest = moveXYRest(meta);
          if (rest) write2(meta, rest);
        }),
        children: [
          valueFirst && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "tweakers-move-dial-sub", children: meta.label }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotXYBody,
            {
              label: meta.label,
              value: `${Math.round(pos.x * 100)}\xB7${Math.round((1 - pos.y) * 100)}`,
              position: pos,
              gridN: moveXYGrid(meta)
            }
          )
        ]
      }
    );
  }
  if (meta.type === "range") {
    const pos = normalizeRangeDial(meta, value);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "range",
        "data-active": active || void 0,
        ...drag(meta, (e, down) => write2(meta, moveRangeValue(meta, values[meta.path], e, e.currentTarget.getBoundingClientRect(), rangeHandle, fine, down))),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotRangeBody, { label: meta.label, value: moveRangeReading(meta, value), lo: pos.lo, hi: pos.hi })
        ]
      }
    );
  }
  if (isEnumDial(meta)) {
    const options = meta.options ?? [];
    const activeIdx = enumIndex(meta, value);
    const option = options[activeIdx];
    const optionLabel = enumOptionLabel(option);
    const shape = enumShapePath(meta, value);
    const playback = movePlaybackMode(meta, value);
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
      "div",
      {
        className: cls,
        style,
        "data-kind": "enum",
        "data-visual": playback ? "playback" : void 0,
        "data-shape": shape ? true : void 0,
        "data-active": active || void 0,
        ...slider(meta),
        "aria-valuemin": 0,
        "aria-valuemax": Math.max(0, options.length - 1),
        "aria-valuenow": activeIdx,
        "aria-valuetext": optionLabel,
        ...step(meta),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            MoveSlotEnumBody,
            {
              label: meta.label,
              optionLabel,
              options,
              activeIdx,
              shape,
              glyph: enumOptionIcon(option),
              picture: enumOptionPicture(option),
              playback
            }
          )
        ]
      }
    );
  }
  const drawing = moveNumericDrawing(meta, value);
  const origin01 = dialOrigin(meta);
  const originPct = origin01 > 0 ? origin01 * 100 : null;
  const headline = valueFirst || meta.display === "value";
  const chip = headline ? moveChipValue(meta, value) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "div",
    {
      className: cls,
      style,
      "data-active": active || void 0,
      "data-sub": !drawing && headline || void 0,
      "data-visual": drawing?.kind,
      ...slider(meta),
      ...turn(meta),
      children: [
        !drawing && headline && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "tweakers-move-dial-sub", children: meta.label }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveModRing, { panelId, path: meta.path }),
        drawing ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MoveSlotNumericBody, { label: meta.label, value: moveVisualReading(meta, Number(value)), drawing }) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          MoveSlotDefaultBody,
          {
            label: meta.label,
            value: chip ? `${chip.num}${chip.unit ? ` ${chip.unit}` : ""}` : moveDialReading(meta, value),
            pct: moveDialPercent(meta, value),
            originPct,
            atOrigin: originPct != null && Math.abs(normalizeDial(meta, value) - origin01) < 1e-6
          }
        )
      ]
    }
  );
}

// src/components/MoveActionButton.tsx
var import_react18 = require("react");
var import_jsx_runtime19 = require("react/jsx-runtime");
var PRESS_FLASH_MS2 = 160;
var KIND_FUNCTION = {
  enter: "jog_click",
  capture: "capture",
  sample: "sample",
  loop: "loop",
  copy: "copy"
};
function MoveActionButton({ kind, children, onPress, disabled, className }) {
  const name = kind === "shift" ? null : KIND_FUNCTION[kind];
  const [pressed, setPressed] = (0, import_react18.useState)(false);
  const flashTimer = (0, import_react18.useRef)(void 0);
  const flash = () => {
    setPressed(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS2);
  };
  (0, import_react18.useEffect)(() => {
    if (!name) return () => clearTimeout(flashTimer.current);
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran === name) flash();
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [name]);
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    "button",
    {
      className: className ? `tweakers-move-action ${className}` : "tweakers-move-action",
      "data-kind": kind,
      "data-pressed": pressed || void 0,
      disabled,
      onClick: () => {
        if (disabled) return;
        if (name) MoveFunctions.run(name, { name, shift: false });
        else flash();
        onPress?.();
      },
      children: [
        kind === "capture" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("svg", { className: "tweakers-move-action-icon", width: "14", height: "14", viewBox: ICON_MOVE_CAPTURE.viewBox, fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { d: ICON_MOVE_CAPTURE.path, fill: "currentColor" }) }) : kind === "loop" || kind === "copy" ? (
          // Stroked, unlike the filled dot and corners: these are the printed
          // marks off the pale function buttons, which the hardware outlines.
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "svg",
            {
              className: "tweakers-move-action-icon",
              width: "14",
              height: "14",
              viewBox: (kind === "loop" ? ICON_MOVE_LOOP : ICON_MOVE_COPY).viewBox,
              fill: "none",
              children: (kind === "loop" ? ICON_MOVE_LOOP : ICON_MOVE_COPY).paths.map((d) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { d, stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, d))
            }
          )
        ) : (
          // Enter and shift share the dot: it is drawn with currentColor, so it
          // comes out light-on-green on the enter pill and black on the light
          // shift pill without a second asset.
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("svg", { className: "tweakers-move-action-icon", width: "12", height: "12", viewBox: ICON_MOVE_ENTER.viewBox, fill: "none", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("circle", { ...ICON_MOVE_ENTER.circle, fill: "currentColor" }) })
        ),
        children
      ]
    }
  );
}

// src/components/MoveActionDeck.tsx
var import_react19 = require("react");

// src/move-deck-core.ts
var MOVE_DECK_MAX = MOVE_CHIP_BUTTONS.length;
function normalizeDeck(actions) {
  const kept = [];
  const warnings = [];
  const taken = /* @__PURE__ */ new Set();
  for (const action of actions) {
    if (!MOVE_CHIP_BUTTONS.includes(action.button)) {
      warnings.push(`"${action.button}" is not a deck key; expected one of: ${MOVE_CHIP_BUTTONS.join(", ")}`);
      continue;
    }
    if (taken.has(action.button)) {
      warnings.push(`"${action.button}" already carries "${kept.find((a) => a.button === action.button)?.label}"; "${action.label}" dropped`);
      continue;
    }
    if (kept.length >= MOVE_DECK_MAX) {
      warnings.push(`a deck carries at most ${MOVE_DECK_MAX} actions; "${action.label}" dropped`);
      continue;
    }
    taken.add(action.button);
    kept.push(action);
  }
  return { actions: kept, warnings };
}

// src/components/MoveActionDeck.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
var PRESS_FLASH_MS3 = 160;
function DeckButton({ action }) {
  const [pressed, setPressed] = (0, import_react19.useState)(false);
  const flashTimer = (0, import_react19.useRef)(void 0);
  (0, import_react19.useEffect)(() => {
    const unsubscribe = MoveFunctions.subscribeRuns((ran) => {
      if (ran !== action.button) return;
      setPressed(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setPressed(false), PRESS_FLASH_MS3);
    });
    return () => {
      unsubscribe();
      clearTimeout(flashTimer.current);
    };
  }, [action.button]);
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
    "button",
    {
      type: "button",
      className: "tweakers-move-deck-action",
      "data-name": action.button,
      "data-variant": action.variant,
      "data-pressed": pressed || void 0,
      disabled: action.disabled,
      onClick: () => {
        if (action.disabled) return;
        MoveFunctions.run(action.button, { shift: false });
      },
      children: [
        action.icon ?? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(MoveFunctionGlyphIcon, { glyph: MOVE_FUNCTION_ICONS[action.button], className: "tweakers-move-deck-icon" }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "tweakers-move-deck-label", children: action.label }),
        action.detail && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "tweakers-move-deck-detail", children: action.detail })
      ]
    }
  );
}
function MoveActionDeck({ actions, className }) {
  const { actions: shown, warnings } = (0, import_react19.useMemo)(
    () => normalizeDeck(actions),
    [actions]
  );
  (0, import_react19.useEffect)(() => {
    for (const warning of warnings) console.warn(`[tweakers] action deck: ${warning}`);
  }, [warnings]);
  const shownRef = (0, import_react19.useRef)(shown);
  shownRef.current = shown;
  const signature = shown.map((a) => `${a.button}:${a.disabled ? "-" : "+"}${a.label}`).join("|");
  (0, import_react19.useEffect)(() => {
    const detaches = shownRef.current.filter((a) => !a.disabled).map(
      (a) => MoveFunctions.attach(
        a.button,
        (press) => shownRef.current.find((x) => x.button === a.button)?.onPress(press),
        { label: a.label, chip: false }
      )
    );
    return () => {
      for (const detach of detaches) detach();
    };
  }, [signature]);
  if (!shown.length) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: className ? `tweakers-move-deck ${className}` : "tweakers-move-deck", children: shown.map((action) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(DeckButton, { action }, action.button)) });
}

// src/components/MoveViewStage.tsx
var import_react20 = require("react");

// src/move-views.ts
var import_react_dom6 = require("react-dom");
var MOVE_VIEW_STAGE_NAME = "tweakers-move-view";
var MOVE_VIEW_PANEL_NAME = "tweakers-move-view-panel";
var MOVE_VIEW_CHANGE_ATTR = "data-tweakers-move-view";
var JOG_EVENTS = ["move-tweakers:jog", "move-tweakers:jog-click"];
var IDLE = { busy: false, wait: null };
var state2 = IDLE;
var listeners3 = /* @__PURE__ */ new Set();
var running = null;
var stages = 0;
var emit2 = () => {
  for (const fn of listeners3) fn();
};
function setState(next) {
  if (next.busy === state2.busy && JSON.stringify(next.wait) === JSON.stringify(state2.wait)) return;
  state2 = next;
  emit2();
}
var reducedMotion2 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function play(root, layer, pseudoElement) {
  const { fade, move } = layer;
  const together = move && move.duration === fade.duration && move.delay === fade.delay && move.easing === fade.easing;
  const run = (frames, tween) => {
    const timing = { duration: tween.duration, delay: tween.delay, fill: "both", pseudoElement };
    try {
      root.animate(frames, { ...timing, easing: tween.easing });
    } catch {
      root.animate(frames, { ...timing, easing: MOVE_VIEW_EXPO_BEZIER });
    }
  };
  if (together) {
    run([{ opacity: fade.from, transform: move.from }, { opacity: fade.to, transform: move.to }], fade);
    return;
  }
  run([{ opacity: fade.from }, { opacity: fade.to }], fade);
  if (move) run([{ transform: move.from }, { transform: move.to }], move);
}
var playing = null;
var PANEL = ".tweakers-move[data-dock]";
var PANEL_ATTR = "data-tweakers-move-view-panel";
function panelKey(doc) {
  const panels = doc.querySelectorAll(PANEL);
  return panels.length === 1 ? panels[0].getAttribute("data-move-motion-key") ?? "" : null;
}
function runUpdates(updates) {
  (0, import_react_dom6.flushSync)(() => {
    for (const update of updates) {
      try {
        update();
      } catch (error) {
        console.error("[tweakers] a view change failed", error);
      }
    }
  });
}
var animatable = (doc) => !!doc?.startViewTransition && stages > 0 && doc.visibilityState !== "hidden";
function startChange(doc, change, updates) {
  const root = doc.documentElement;
  const reduced = reducedMotion2();
  const plan = moveViewChoreography(change, reduced);
  const panelPlan = movePanelChoreography(reduced);
  const before = panelKey(doc);
  let panelMotion = null;
  root.setAttribute(MOVE_VIEW_CHANGE_ATTR, change);
  root.toggleAttribute(PANEL_ATTR, before !== null);
  const entry = { queue: [...updates], movingAt: null, quiet: plan.quiet, next: null, updated: Promise.resolve() };
  const transition = doc.startViewTransition(() => {
    const queue = entry.queue ?? [];
    entry.queue = null;
    runUpdates(queue);
    const after = panelKey(doc);
    panelMotion = before !== null && after !== null ? before === after ? "hold" : "pair" : before !== null ? "exit" : after !== null ? "enter" : null;
    if (panelMotion) root.setAttribute(PANEL_ATTR, panelMotion);
    else root.removeAttribute(PANEL_ATTR);
    if (panelMotion && panelMotion !== "hold") entry.quiet = Math.min(plan.quiet, panelPlan.quiet);
  });
  entry.updated = transition.updateCallbackDone.catch(() => {
  });
  playing = entry;
  transition.ready.then(() => {
    entry.movingAt = performance.now();
    play(root, plan.leaving, `::view-transition-old(${MOVE_VIEW_STAGE_NAME})`);
    play(root, plan.arriving, `::view-transition-new(${MOVE_VIEW_STAGE_NAME})`);
    if (panelMotion === "exit" || panelMotion === "pair") play(root, panelPlan.leaving, `::view-transition-old(${MOVE_VIEW_PANEL_NAME})`);
    if (panelMotion === "enter" || panelMotion === "pair") play(root, panelPlan.arriving, `::view-transition-new(${MOVE_VIEW_PANEL_NAME})`);
  }).catch(() => {
  });
  transition.finished.catch(() => {
  }).finally(() => {
    if (playing !== entry) return;
    playing = null;
    root.removeAttribute(MOVE_VIEW_CHANGE_ATTR);
    root.removeAttribute(PANEL_ATTR);
    const next = entry.next;
    if (!next) return;
    if (animatable(doc)) void startChange(doc, next.change, next.updates).then(next.resolve);
    else {
      runUpdates(next.updates);
      next.resolve();
    }
  });
  return entry.updated;
}
var viewTransitionRunner = (change, update) => {
  const doc = typeof document === "undefined" ? null : document;
  if (!animatable(doc)) {
    try {
      update();
    } catch (error) {
      console.error("[tweakers] a view change failed", error);
    }
    return Promise.resolve();
  }
  const now = playing;
  if (now?.queue) {
    now.queue.push(update);
    return now.updated;
  }
  if (now && (now.movingAt === null || performance.now() - now.movingAt < now.quiet)) {
    runUpdates([update]);
    return Promise.resolve();
  }
  if (now) {
    if (!now.next) {
      let resolve;
      const landed = new Promise((r) => {
        resolve = r;
      });
      now.next = { change, updates: [], resolve, landed };
    }
    now.next.change = change;
    now.next.updates.push(update);
    return now.next.landed;
  }
  return startChange(doc, change, [update]);
};
var runner = viewTransitionRunner;
var timers = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  now: () => Date.now()
};
function holdInput(cancelable) {
  const wake = MoveFunctions.suspend(cancelable ? ["back"] : [], { sealed: true });
  const releaseBack = cancelable ? MoveFunctions.push("back", () => MoveViews.cancel(), { chip: false }) : null;
  const swallow = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const onKey2 = (event) => {
    event.stopImmediatePropagation();
    if (event.key !== "Escape") return;
    event.preventDefault();
    MoveViews.cancel();
  };
  const win = typeof window === "undefined" ? null : window;
  for (const type of JOG_EVENTS) win?.addEventListener(type, swallow, { capture: true });
  win?.addEventListener("keydown", onKey2, { capture: true });
  return () => {
    for (const type of JOG_EVENTS) win?.removeEventListener(type, swallow, { capture: true });
    win?.removeEventListener("keydown", onKey2, { capture: true });
    releaseBack?.();
    wake();
  };
}
function letGo() {
  const was = running;
  if (!was) return null;
  running = null;
  timers.clearTimeout(was.timer);
  was.controller.abort();
  was.drop();
  return was;
}
function settle2(was, update) {
  was?.release();
  setState(IDLE);
  MoveSurfaceStore.setWait(null);
  update?.();
}
var MoveViews = {
  getState: () => state2,
  subscribe(fn) {
    listeners3.add(fn);
    return () => listeners3.delete(fn);
  },
  /**
   * Change the view now. `update` is the app's own state change — a
   * setState, a dispatch — and runs inside the transition; `motion` says
   * which way it goes. A wait still running is let go first.
   */
  go(update, motion2 = "swap") {
    const was = letGo();
    return runner(motion2, () => settle2(was, update));
  },
  /**
   * Change the view once work lands. The view goes inert and its keys dark
   * at once; a wait comes up if the work outlasts the delay, and stays until
   * it has been read. Resolves with the work's value after `arrive` ran,
   * rejects with its error after the wait handed the view back, and
   * resolves `undefined` when the wait was cancelled or superseded.
   */
  load(work, options) {
    const was = letGo();
    return new Promise((resolve, reject) => {
      const wait = { title: options.title, cancelable: !!options.cancelable };
      if (options.detail) wait.detail = options.detail;
      const task = {
        controller: new AbortController(),
        wait,
        // a wait already up for the work this one replaces stays up
        shownAt: was && state2.wait ? was.shownAt : null,
        timer: void 0,
        release: holdInput(!!options.cancelable),
        drop: () => resolve(void 0)
      };
      was?.release();
      running = task;
      const show = () => {
        if (running !== task) return;
        if (task.shownAt === null) task.shownAt = timers.now();
        setState({ busy: true, wait: task.wait });
        MoveSurfaceStore.setWait({ title: task.wait.title, ...task.wait.detail ? { detail: task.wait.detail } : {} });
      };
      if (task.shownAt !== null) show();
      else {
        setState({ busy: true, wait: null });
        task.timer = timers.setTimeout(() => {
          if (running !== task) return;
          void runner("wait", show);
        }, MOVE_VIEW_WAIT.delay);
      }
      const say = (title, detail) => {
        if (running !== task) return;
        task.wait = { title, cancelable: task.wait.cancelable, ...detail ? { detail } : {} };
        if (task.shownAt !== null) show();
      };
      const finish = (landed) => {
        if (running !== task) return;
        const hold = moveViewHoldRemaining(task.shownAt, timers.now(), moveViewChoreography("wait", reducedMotion2()));
        const end = () => {
          if (running !== task) return;
          running = null;
          timers.clearTimeout(task.timer);
          landed();
        };
        if (hold > 0) task.timer = timers.setTimeout(end, hold);
        else end();
      };
      Promise.resolve().then(() => work({ signal: task.controller.signal, say })).then(
        (value) => finish(() => {
          const arrive = options.arrive;
          if (arrive) {
            void runner(options.motion ?? "open", () => settle2(task, () => arrive(value))).then(() => resolve(value));
          } else if (task.shownAt !== null) {
            void runner("resume", () => settle2(task)).then(() => resolve(value));
          } else {
            settle2(task);
            resolve(value);
          }
        }),
        (error) => finish(() => {
          const back = task.shownAt !== null ? runner("resume", () => settle2(task)) : (settle2(task), Promise.resolve());
          void back.then(() => reject(error));
        })
      );
    });
  },
  /** Abandon a cancelable wait: the work's signal aborts and the view comes
   *  back as it was. Returns whether there was one to abandon. */
  cancel() {
    if (!running?.wait.cancelable) return false;
    const was = letGo();
    if (was.shownAt === null) settle2(was);
    else void runner("resume", () => settle2(was));
    return true;
  },
  /** @internal The stage counts itself in: without one mounted, changes land
   *  unanimated and a wait has nowhere to show. */
  mountStage() {
    stages++;
    if (stages > 1) console.warn("[tweakers] more than one MoveViewStage is mounted; an app has one stage for all its views");
    return () => {
      stages--;
    };
  },
  /** @internal Tests drive the registry without a browser. */
  configureForTest(options) {
    if (options.runner) runner = options.runner;
    if (options.timers) timers = { ...timers, ...options.timers };
  },
  /** @internal */
  resetForTest() {
    letGo()?.release();
    state2 = IDLE;
    running = null;
    runner = viewTransitionRunner;
    MoveSurfaceStore.setWait(null);
  }
};

// src/components/MoveViewStage.tsx
var import_jsx_runtime21 = require("react/jsx-runtime");
var LIGHTS = Array.from({ length: 8 }, (_, i) => i);
function MoveViewWaitScreen({ wait }) {
  return (
    // wears the instrument tokens itself: it stands outside whatever view
    // carried them
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "tweakers-move-surface tweakers-move-view-wait", role: "status", "aria-live": "polite", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "tweakers-move-view-wait-title", children: wait.title }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "tweakers-move-view-wait-lights", "aria-hidden": "true", children: LIGHTS.map((i) => /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "tweakers-move-view-wait-light", style: { "--i": i } }, i)) }),
      wait.detail && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "tweakers-move-view-wait-detail", children: wait.detail }),
      wait.cancelable && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("button", { type: "button", className: "tweakers-move-view-wait-cancel", onClick: () => MoveViews.cancel(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("path", { d: ICON_CHEVRON_LEFT, stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { children: "Cancel" })
      ] })
    ] })
  );
}
function MoveViewStage({ children, className, style }) {
  const { busy, wait } = (0, import_react20.useSyncExternalStore)(MoveViews.subscribe, MoveViews.getState, MoveViews.getState);
  const content = (0, import_react20.useRef)(null);
  (0, import_react20.useEffect)(() => MoveViews.mountStage(), []);
  (0, import_react20.useLayoutEffect)(() => {
    if (content.current) content.current.inert = busy;
  }, [busy]);
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
    "div",
    {
      className: className ? `tweakers-move-view-stage ${className}` : "tweakers-move-view-stage",
      style,
      "data-busy": busy || void 0,
      "data-waiting": wait ? true : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "tweakers-move-view-frame", "data-move-view-frame": "", children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { ref: content, className: "tweakers-move-view-content", children }),
        wait && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(MoveViewWaitScreen, { wait })
      ] })
    }
  );
}

// src/components/MoveNotifications.tsx
var import_react21 = require("react");
var import_react_dom7 = require("react-dom");
var import_toast = require("@base-ui/react/toast");

// src/move-notify.ts
var MOVE_NOTIFY_KINDS = ["info", "success", "warning", "error"];
var MOVE_NOTIFY_GAP = 14;
var MOVE_FLOAT_SELECTOR = [
  ".tweakers-move-root .tweakers-move",
  '.tweakers-move-wave[data-variant="dock"]',
  '.tweakers-move-timeline[data-variant="dock"]',
  ".tweakers-move-curve",
  ".tweakers-move-preset-save",
  "[data-move-float]"
].join(", ");
function notifyDockBottom(tops, viewportHeight, gap = MOVE_NOTIFY_GAP) {
  let highest = Infinity;
  for (const top of tops) {
    if (Number.isFinite(top) && top < highest) highest = top;
  }
  if (!Number.isFinite(highest)) return gap;
  return Math.max(gap, Math.round(viewportHeight - highest) + gap);
}

// src/components/MoveNotifications.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
var manager = import_toast.Toast.createToastManager();
var moveNotify = manager;
var MEASURE_MS = 100;
function useDockBottom(active) {
  const [bottom, setBottom] = (0, import_react21.useState)(MOVE_NOTIFY_GAP);
  (0, import_react21.useEffect)(() => {
    if (!active || typeof window === "undefined") return;
    let frame = 0;
    let last = 0;
    const measure = () => {
      const tops = [];
      document.querySelectorAll(MOVE_FLOAT_SELECTOR).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) tops.push(rect.top);
      });
      const next = notifyDockBottom(tops, window.innerHeight);
      setBottom((prev) => prev === next ? prev : next);
    };
    const tick = (now) => {
      if (now - last >= MEASURE_MS) {
        last = now;
        measure();
      }
      frame = window.requestAnimationFrame(tick);
    };
    measure();
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active]);
  return bottom;
}
function NotifyStack({ className }) {
  const { toasts } = import_toast.Toast.useToastManager();
  const bottom = useDockBottom(toasts.length > 0);
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    import_toast.Toast.Viewport,
    {
      className: `tweakers-move-notify${className ? ` ${className}` : ""}`,
      style: { bottom: `${bottom}px` },
      children: toasts.map((toast) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Root, { toast, className: "tweakers-move-notify-card", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_toast.Toast.Content, { className: "tweakers-move-notify-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "tweakers-move-notify-text", children: [
          toast.type && toast.type !== "info" && /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("span", { className: "tweakers-move-notify-kind", children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "tweakers-move-notify-dot", "aria-hidden": "true" }),
            toast.type
          ] }),
          toast.title != null && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Title, { className: "tweakers-move-notify-title" }),
          toast.description != null && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Description, { className: "tweakers-move-notify-description" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Action, { className: "tweakers-move-notify-action" }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Close, { className: "tweakers-move-notify-close", "aria-label": "Dismiss", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("svg", { viewBox: "0 0 24 24", width: "14", height: "14", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("path", { d: ICON_CLOSE }) }) })
      ] }) }, toast.id))
    }
  );
}
function MoveNotifications({
  limit = 3,
  timeout = 5e3,
  className
}) {
  const [mounted, setMounted] = (0, import_react21.useState)(false);
  (0, import_react21.useEffect)(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return (0, import_react_dom7.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "tweakers-root tweakers-move-surface tweakers-move-notify-root", children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(import_toast.Toast.Provider, { toastManager: manager, limit, timeout, children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(NotifyStack, { ...className ? { className } : {} }) }) }),
    document.body
  );
}

// src/components/MoveConnectionDot.tsx
var import_react22 = require("react");
var import_react_dom8 = require("react-dom");

// src/move-connection.ts
var MOVE_CONNECTION_EVENT = "move-tweakers:connection";
var MOVE_CONNECTION_ASK_EVENT = "move-tweakers:connection-ask";
var AWAY = { bridge: false, device: false, active: false };
var state3 = AWAY;
var listeners4 = /* @__PURE__ */ new Set();
var hearing = false;
function hear(event) {
  const detail = event.detail;
  const next = { bridge: !!detail?.bridge, device: !!detail?.device, active: !!detail?.active };
  if (next.bridge === state3.bridge && next.device === state3.device && next.active === state3.active) return;
  state3 = next;
  for (const fn of listeners4) fn();
}
var MoveConnection = {
  getState: () => state3,
  /** The Move is connected and following this page — all three at once. */
  isLive: () => state3.bridge && state3.device && state3.active,
  subscribe(fn) {
    listeners4.add(fn);
    if (!hearing && typeof window !== "undefined") {
      hearing = true;
      window.addEventListener(MOVE_CONNECTION_EVENT, hear);
      window.dispatchEvent(new CustomEvent(MOVE_CONNECTION_ASK_EVENT));
    }
    return () => {
      listeners4.delete(fn);
    };
  },
  /** @internal Tests start from a page that has heard nothing. */
  resetForTest() {
    if (hearing && typeof window !== "undefined") window.removeEventListener(MOVE_CONNECTION_EVENT, hear);
    hearing = false;
    state3 = AWAY;
    listeners4.clear();
  }
};

// src/components/MoveConnectionDot.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
function MoveConnectionDot({ className }) {
  const live = (0, import_react22.useSyncExternalStore)(MoveConnection.subscribe, MoveConnection.isLive, () => false);
  const [mounted, setMounted] = (0, import_react22.useState)(false);
  (0, import_react22.useEffect)(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  const label = live ? "Move connected" : "Move not connected";
  return (0, import_react_dom8.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      "div",
      {
        className: `tweakers-root tweakers-move-surface tweakers-move-link${className ? ` ${className}` : ""}`,
        "data-live": live || void 0,
        role: "status",
        "aria-label": label,
        title: label,
        children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "tweakers-move-link-dot", "aria-hidden": "true" })
      }
    ),
    document.body
  );
}

// src/use-move-timeline.ts
var import_react23 = require("react");
var import_TweakStore18 = require("tweakers/store");

// src/timeline/adapter.ts
function resolveTimelineLoop(loop) {
  if (typeof loop === "object" && loop !== null) {
    return {
      enabled: true,
      start: Number.isFinite(loop.from) ? Math.max(0, loop.from) : 0
    };
  }
  return { enabled: Boolean(loop), start: 0 };
}
function buildTimelineMeta(id, name, duration, parsed, loop) {
  const resolvedLoop = resolveTimelineLoop(loop);
  return {
    id,
    name,
    duration,
    loop: resolvedLoop.enabled,
    loopStart: resolvedLoop.start,
    clips: parsed.clips
  };
}
function buildTimelineValues(staticClips, transport, timelineDuration, loopStart, loopEnd, actions) {
  var _a;
  const result = {
    time: transport.time,
    playing: transport.playing,
    duration: timelineDuration,
    ...actions
  };
  const span = loopSpan(transport.duration, loopStart, loopEnd);
  const cycleTime = (span > 0 ? transport.wraps * span : 0) + transport.time;
  for (const clip of staticClips) {
    const state4 = computeClipState(clip, transport.time, cycleTime);
    if (clip.group) {
      const bucket = result[_a = clip.group] ?? (result[_a] = {});
      bucket[clip.childKey] = state4;
    } else {
      result[clip.key] = state4;
    }
  }
  return result;
}

// src/use-move-timeline.ts
function useMoveTimeline(name, config, options) {
  const serialized = JSON.stringify(config);
  const parsed = (0, import_react23.useMemo)(() => parseTimelineConfig(config), [serialized]);
  const instance = (0, import_react23.useId)();
  const id = options?.id ?? `${name}-${instance}`;
  const optionsRef = (0, import_react23.useRef)(options);
  optionsRef.current = options;
  const panelOptions = () => ({ persist: optionsRef.current?.persist, kind: "timeline", retainOnUnmount: options?.id !== void 0 });
  const parsedRef = (0, import_react23.useRef)(parsed);
  parsedRef.current = parsed;
  (0, import_react23.useEffect)(() => {
    import_TweakStore18.TweakStore.registerPanel(id, name, parsedRef.current.tweakConfig, void 0, panelOptions());
    return () => import_TweakStore18.TweakStore.unregisterPanel(id);
  }, [id, name]);
  const shaped = (0, import_react23.useRef)(false);
  (0, import_react23.useEffect)(() => {
    if (!shaped.current) {
      shaped.current = true;
      return;
    }
    import_TweakStore18.TweakStore.updatePanel(id, name, parsed.tweakConfig, void 0, panelOptions());
  }, [id, name, parsed]);
  const values = (0, import_react23.useSyncExternalStore)(
    (0, import_react23.useCallback)((cb) => import_TweakStore18.TweakStore.subscribe(id, cb), [id]),
    () => import_TweakStore18.TweakStore.getValues(id),
    () => import_TweakStore18.TweakStore.getValues(id)
  );
  const statics = (0, import_react23.useMemo)(() => computeStaticTimeline(parsed, values), [parsed, values]);
  const duration = statics.duration;
  const buildMeta = (0, import_react23.useCallback)(
    () => buildTimelineMeta(id, name, duration, parsedRef.current, optionsRef.current?.loop),
    [id, name, duration]
  );
  const buildMetaRef = (0, import_react23.useRef)(buildMeta);
  buildMetaRef.current = buildMeta;
  (0, import_react23.useEffect)(() => {
    TimelineStore.register(buildMetaRef.current(), {
      autoplay: optionsRef.current?.autoplay ?? true,
      persist: optionsRef.current?.persist
    });
    return () => TimelineStore.unregister(id);
  }, [id, name]);
  const registered = (0, import_react23.useRef)(false);
  (0, import_react23.useEffect)(() => {
    if (!registered.current) {
      registered.current = true;
      return;
    }
    TimelineStore.update(buildMeta());
  }, [buildMeta, parsed]);
  const subscribeTransport = (0, import_react23.useCallback)((cb) => TimelineStore.subscribe(id, cb), [id]);
  const transport = (0, import_react23.useSyncExternalStore)(
    subscribeTransport,
    () => TimelineStore.getTransport(id),
    () => TimelineStore.getTransport(id)
  );
  const region = (0, import_react23.useSyncExternalStore)(
    subscribeTransport,
    () => TimelineStore.getLoopRegion(id),
    () => TimelineStore.getLoopRegion(id)
  );
  const play2 = (0, import_react23.useCallback)(() => TimelineStore.play(id), [id]);
  const pause = (0, import_react23.useCallback)(() => TimelineStore.pause(id), [id]);
  const replay = (0, import_react23.useCallback)(() => TimelineStore.replay(id), [id]);
  const seek = (0, import_react23.useCallback)((time) => TimelineStore.seek(id, time), [id]);
  return (0, import_react23.useMemo)(() => {
    const frame = buildTimelineValues(statics.clips, transport, duration, region?.start ?? 0, region?.end ?? duration, {
      play: play2,
      pause,
      replay,
      seek
    });
    return Object.assign(frame, { id });
  }, [statics.clips, transport, duration, region, play2, pause, replay, seek, id]);
}

// src/move-kit.ts
var import_ModulationStore4 = require("tweakers/modulation-store");
function liveClaims(app) {
  const claims = { ...app };
  Object.defineProperty(claims, "master", {
    enumerable: true,
    get: () => app?.master ? app.master : MoveTimelineStore.claimsKnob() || void 0
  });
  return claims;
}
function moveKitOptions(overrides) {
  const app = overrides?.claims;
  return {
    padList: MovePadListStore,
    functions: MoveFunctions,
    modulation: import_ModulationStore4.ModulationStore,
    color: MoveColorStore,
    surface: MoveSurfaceStore,
    waveform: MoveWaveformStore,
    volume: MoveVolumeDisplay,
    transfer: { sample: sampleTransfer, move: movePoint },
    exploration: PresetExplorationStore,
    ...overrides,
    claims: app === null ? null : liveClaims(app)
  };
}

// src/index.ts
var import_ModulationStore5 = require("tweakers/modulation-store");
var import_TweakStore19 = require("tweakers/store");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADSR_DEF,
  ADSR_STAGE_MAX,
  ANGLE_DEAD_ZONE_PX,
  AUDIO_DEF,
  COLOR_FORMATS,
  CURVE_CYCLE,
  CURVE_DEF,
  CURVE_DEFAULT_HEIGHT,
  CURVE_FIT_PADDING,
  CURVE_LABELS,
  CURVE_MAX_CLIPS,
  CURVE_MAX_DURATION,
  CURVE_MAX_HEIGHT,
  CURVE_MIN_DURATION,
  CURVE_MIN_HEIGHT,
  CURVE_SAMPLE_COUNT,
  CurveComposer,
  DEFAULT_GRADIENT,
  DEFAULT_TRANSFER,
  DEFAULT_TRIGGER_STEPS,
  ENV_BEND_STAGES,
  ENV_SUSTAIN_WAVE_BEATS,
  ENV_WAVE_STAGES,
  FILTER_DB_CEIL,
  FILTER_DB_FLOOR,
  ICON_MOVE_CAPTURE,
  ICON_MOVE_ENTER,
  LFO_DEF,
  LFO_SYNC_DIVISIONS,
  ListScreen,
  MIN_STOPS,
  MOD_COLORS,
  MOD_PAGE_DIALS,
  MOD_RING_CIRCUMFERENCE,
  MOD_RING_RADIUS,
  MOD_SETTINGS_PANEL,
  MOD_SLOTS,
  MOD_TOUCH_GRACE_MS,
  MOVE_BAND_H,
  MOVE_BAND_W,
  MOVE_CHIP_BUTTONS,
  MOVE_COLOR_HUES,
  MOVE_COLOR_PALETTES,
  MOVE_COLOR_STEPS,
  MOVE_COLOR_WHEEL,
  MOVE_CONNECTION_ASK_EVENT,
  MOVE_CONNECTION_EVENT,
  MOVE_DECK_MAX,
  MOVE_DIALS,
  MOVE_FLOAT_SELECTOR,
  MOVE_FUNCTION_BUTTONS,
  MOVE_FUNCTION_ICONS,
  MOVE_FUNCTION_MANIFEST,
  MOVE_GATE_GRID,
  MOVE_GAUGE,
  MOVE_GRADIENT_STOPS,
  MOVE_JOG_CLICK_EVENT,
  MOVE_JOG_EVENT,
  MOVE_LATCH_EVENT,
  MOVE_MULTIBAND_GRID,
  MOVE_MUTE_EVENT,
  MOVE_NOTIFY_GAP,
  MOVE_NOTIFY_KINDS,
  MOVE_OPACITY_PADS,
  MOVE_OVERRIDE_EVENT,
  MOVE_PADS,
  MOVE_PAD_LIBRARY,
  MOVE_PAGE_EVENT,
  MOVE_PAGE_SELECT_EVENT,
  MOVE_PALETTE,
  MOVE_SEARCH_EVENT,
  MOVE_SETTINGS_EVENT,
  MOVE_SLOT_LIBRARY,
  MOVE_SPECIAL_BUTTONS,
  MOVE_STAGE,
  MOVE_STEP_FUNCTIONS,
  MOVE_STRIP_EVENT,
  MOVE_TIMELINE_MAX_ZOOM,
  MOVE_TOUCH_EVENT,
  MOVE_TRACKS,
  MOVE_TRACK_COLORS,
  MOVE_VIEW_MOTIONS,
  MOVE_VIEW_PRESENTATION,
  MOVE_VIEW_WAIT,
  MOVE_VOLUME_EVENT,
  MOVE_VOLUME_TAP_EVENT,
  MOVE_WAVEFORM_DEMO_SECONDS,
  MOVE_WAVEFORM_PADS,
  MOVE_WAVEFORM_PANEL,
  MOVE_WAVEFORM_PIXEL_RANGE,
  MOVE_WAVEFORM_STEPS,
  MOVE_WAVE_FRAME,
  MOVE_WAVE_MAX_DISPLAY,
  MOVE_WAVE_MAX_HEIGHT,
  MOVE_WAVE_MAX_WIDTH,
  ModRing,
  ModulationStore,
  MoveActionButton,
  MoveActionDeck,
  MoveColorStore,
  MoveConnection,
  MoveConnectionDot,
  MoveFunctionChips,
  MoveFunctions,
  MoveGateDisplay,
  MoveGateMeter,
  MoveMultibandDisplay,
  MoveMultibandMeter,
  MoveNotifications,
  MovePadActionBody,
  MovePadAppBody,
  MovePadBandBody,
  MovePadColorBody,
  MovePadFadeBody,
  MovePadIconBody,
  MovePadIconLabelBody,
  MovePadListBody,
  MovePadListStore,
  MovePadLoopBody,
  MovePadTabsBody,
  MovePadToggleBody,
  MovePadValueBody,
  MovePadWaveBody,
  MovePanel,
  MovePresetStore,
  MoveSearchStore,
  MoveSettingsView,
  MoveSlot,
  MoveSlotChannelBody,
  MoveSlotColorBody,
  MoveSlotDefaultBody,
  MoveSlotDialBody,
  MoveSlotEnumBody,
  MoveSlotEnvBody,
  MoveSlotFilterBody,
  MoveSlotGateBody,
  MoveSlotGlyph,
  MoveSlotMetronomeBody,
  MoveSlotMultibandBody,
  MoveSlotNumericBody,
  MoveSlotOffsetBody,
  MoveSlotPlaybackDrawing,
  MoveSlotRampBody,
  MoveSlotRangeBody,
  MoveSlotReadout,
  MoveSlotScopeBody,
  MoveSlotShape,
  MoveSlotToggleBody,
  MoveSlotTransferBody,
  MoveSlotTrimSpanBody,
  MoveSlotVectorBody,
  MoveSlotXYBody,
  MoveSurfaceStore,
  MoveTimeline,
  MoveTimelineClock,
  MoveTimelineStore,
  MoveTimelineZoom,
  MoveViewStage,
  MoveViews,
  MoveVolumeDisplay,
  MoveWaveform,
  MoveWaveformStore,
  PresetExplorationStore,
  SH_DEF,
  TAB_PATH,
  TRANSFER_MAX_POINTS,
  TRANSFER_MIN_GAP,
  TimelineStore,
  TweakStore,
  WAVEFORM_BASE_BUCKET,
  WAVEFORM_MAX_ZOOM,
  WAVEFORM_MODES,
  WAVEFORM_SMOOTH_POINTS,
  WaveformVisualization,
  XY_DEFAULT_STEP,
  XY_DETENT_PX,
  addDriver,
  addStop,
  angleFromPointer,
  applyDetentAxis,
  applyModulation,
  arcPath,
  audioModLevel,
  bearingToValue,
  breedDNA,
  buildModMovePage,
  buildMovePages,
  buildMoveStrip,
  buildSamplers,
  buildWaveformLevels,
  centerValue,
  chooseParents,
  clamp,
  clampCurveHeight,
  clampOklchToSrgb,
  clampRange,
  clampStripOffset,
  cloneDNA,
  collectGenes,
  colorAtPosition,
  createMoveMeter,
  curveComposition,
  curveDuration,
  curvePathData,
  curveY,
  cycleDriverType,
  cycleSegmentType,
  defaultComposition,
  defaultFilterResponse,
  defaultListItemParams,
  denormalizeEnumDial,
  denormalizeFilterDial,
  denormalizeRangeDial,
  denormalizeToggleDial,
  dialOrigin,
  dialSpan,
  displayHex,
  drawMoveGate,
  drawMoveMultiband,
  enumOptionIcon,
  envCurveParam,
  envStageWave,
  envWaveFlipParam,
  envWaveParam,
  envelopeJoints,
  envelopePoints,
  fillRangePeaks,
  filterHand01,
  filterHandValue,
  filterResponsePath,
  filterShapePath,
  filterShapeResponse,
  flipDriver,
  flipDriverX,
  flipDriverY,
  flipSegment,
  flipSegmentX,
  flipSegmentY,
  followWindow,
  formatClock,
  formatHex,
  formatTimelineTick,
  geneBounds,
  getAudioModBuffer,
  getAudioModVersion,
  getAudioModWindow,
  getModType,
  gradientFillBox,
  gradientToCss,
  gradientToTransform,
  groupListFields,
  handleLeftStyles,
  hintDomId,
  hslToRgb,
  hsvToRgb,
  insertPoint,
  invertY,
  isIdentityTransfer,
  isMoveDial,
  isMoveTabs,
  isNamedTabs,
  isOutsideSpan,
  isPadSpanContinuation,
  isSpanContinuation,
  isStripSlot,
  isToggleDial,
  lfoSyncedHz,
  listModTypes,
  loopFromStep,
  loopSteps,
  modColor,
  modKey,
  modPageLayout,
  modPageWidth,
  modRingArc,
  morphDNA,
  moveAppPadRow,
  moveBandCell,
  moveBandCuts,
  moveChannelPosition,
  moveEdgesCell,
  moveGateDemoReading,
  moveGateSpan,
  moveGaugeBearing,
  moveKitOptions,
  moveMultibandDemoReading,
  moveMultibandRole,
  moveMultibandSpan,
  moveNotify,
  moveNumericDrawing,
  movePadRows,
  movePlaybackMode,
  movePoint,
  moveScreenChecked,
  moveScreenRowLabel,
  moveScreenRowSearchText,
  moveSearchFilter,
  moveSearchMatch,
  moveSlotKind,
  moveStop,
  moveTabCell,
  moveTrimSpan,
  moveVectorAxes,
  moveVectorStage,
  moveViewChoreography,
  moveVisualReading,
  moveWaveformDefaultStyle,
  moveWaveformDefaultView,
  moveWaveformDemoSample,
  moveWaveformStyleFromValues,
  moveWheelSlot,
  nearestHandle,
  nearestPoint,
  newDNAId,
  normToValue,
  normalizeAngle,
  normalizeCurveMarkers,
  normalizeDeck,
  normalizeDial,
  normalizeEnumDial,
  normalizeFilterDial,
  normalizeFilterValue,
  normalizeGradient,
  normalizeHex,
  normalizeListItems,
  normalizeRangeDial,
  normalizeToggleDial,
  normalizeTransfer,
  normalizeValue,
  normalizeXYDial,
  notifyDockBottom,
  nudge,
  nudgeAngle,
  oklchToRgb,
  opacityPercent,
  orderRange,
  packTimelineRows,
  padPosition,
  padSection,
  padSpan,
  pageStripOffset,
  parseHex,
  parseListItemSchema,
  percentToValue,
  pickDragTarget,
  plotCurve,
  pointFromValue,
  presetFlowerSeed,
  presetFlowerSvg,
  rampCss,
  rangesDuration,
  readComposition,
  reconcileDNA,
  redistributeWeight,
  registerModType,
  removeDriver,
  removePoint,
  removeSegment,
  removeStop,
  resolveAxis,
  resolveFilterAxis,
  rgbToHsl,
  rgbToHsv,
  rgbToOklch,
  sampleTransfer,
  scrubBy,
  seedDNA,
  setAudioModBuffer,
  setAudioModWindowSource,
  setDriverAnticipate,
  setDriverCurvature,
  setDriverOvershoot,
  setDriverSteepness,
  setGradientAngle,
  setGradientCenter,
  setGradientRotation,
  setGradientScale,
  setGradientSquash,
  setGradientType,
  setHigh,
  setLow,
  setSegmentAnticipate,
  setSegmentCurvature,
  setSegmentOvershoot,
  setSegmentSteepness,
  setStopColor,
  shiftSpan,
  slotGroups,
  snapAngle,
  snapToStep,
  splitSegment,
  springify,
  stepPosition,
  stepStripOffset,
  stripDialColumns,
  stripDialSlots,
  stripOffsets,
  stripSlotCount,
  stripSlotIndex,
  stripStarts,
  stripWindowPads,
  subscribeAudioMod,
  timelineClock,
  timelineRowHeight,
  timelineTicks,
  timelineWindow,
  toAudioBuffer,
  transferLut,
  triggerLevels,
  triggersCrossed,
  useMoveTimeline,
  valueFromPoint,
  valueToBearing,
  valueToNorm,
  valueToPercent,
  visibleColumns,
  visibleModControls,
  visibleWindow,
  waveformAsset,
  waveformAssetFromBuffer,
  zoomBy,
  zoomWindow
});
//# sourceMappingURL=index.cjs.map