// tweakers — Move-only package: the shared state core plus the Move-hardware
// bottom-sheet surface. The mouse-driven sidebar UI lives in the dialkit repo.

// Shared theme type
export type { TweakTheme } from './theme';

// Move surface mirror (docked bottom panel matching the bridge kit's mapping)
export { MovePanel } from './components/MovePanel';
export type { MovePanelProps } from './components/MovePanel';
// The panel's window events — what the bridge kit sends in and hears back.
export {
  MOVE_TOUCH_EVENT,
  MOVE_OVERRIDE_EVENT,
  MOVE_LATCH_EVENT,
  MOVE_PAGE_EVENT,
  MOVE_PAGE_SELECT_EVENT,
  MOVE_JOG_EVENT,
  MOVE_JOG_CLICK_EVENT,
  MOVE_MUTE_EVENT,
  MOVE_STRIP_EVENT,
  MOVE_TRACK_COLORS,
} from './components/MovePanel';
export { MoveActionButton } from './components/MoveActionButton';
export type { MoveActionButtonProps } from './components/MoveActionButton';
export { MoveFunctionChips } from './components/MoveFunctionChips';
export type { MoveFunctionChipsProps } from './components/MoveFunctionChips';
export { buildMovePages, buildModMovePage, movePadRows, moveAppPadRow, visibleColumns, isToggleDial, normalizeToggleDial, denormalizeToggleDial, normalizeDial, normalizeXYDial, normalizeRangeDial, denormalizeRangeDial, normalizeEnumDial, denormalizeEnumDial, normalizeFilterDial, denormalizeFilterDial, filterShapePath, dialOrigin, dialSpan, isMoveDial, isSpanContinuation, enumOptionIcon, MOVE_TRACKS, MOVE_DIALS, MOVE_PADS } from './move-layout';
export type { MovePage } from './move-layout';

// The endless strip — a page with more slots than the Move has dials
export { buildMoveStrip, isStripSlot, stripStarts, stripOffsets, clampStripOffset, stepStripOffset, pageStripOffset, stripDialColumns, stripDialSlots, stripWindowPads, stripSlotCount, stripSlotIndex } from './move-strip';

// The big-slot library — the dictionary of what a Move dial slot can be
export { MOVE_SLOT_LIBRARY, moveSlotKind, MoveSlotXYBody, MoveSlotDefaultBody, MoveSlotEnumBody, MoveSlotRangeBody, MoveSlotFilterBody, MoveSlotNumericBody, MoveSlotPlaybackDrawing, MoveSlotEnvBody, MoveSlotScopeBody, MoveSlotToggleBody, MoveSlotTransferBody, MoveSlotRampBody, MoveSlotDialBody, MoveSlotColorBody, MoveSlotGlyph, MoveSlotReadout, MoveSlotShape } from './components/move-slots';
// The small slots — the pad row under the dials
export { MOVE_PAD_LIBRARY, MovePadToggleBody, MovePadValueBody, MovePadActionBody, MovePadAppBody, MovePadWaveBody } from './components/move-slots';
export type { MovePadKind } from './components/move-slots';
export { moveNumericDrawing, movePlaybackMode, moveVisualReading } from './move-visual-core';
export type { MoveVisual, MoveSliderVisual, MoveSelectVisual, MovePlaybackMode, MoveNumericDrawing } from './move-visual-core';
export type { MoveSlotKind } from './components/move-slots';

// The filter control core — the kit's first 2-slot control (cutoff + resonance)
export { resolveFilterAxis, normalizeFilterValue, defaultFilterResponse, filterShapeResponse, filterResponsePath, filterHand01, filterHandValue, FILTER_DB_FLOOR, FILTER_DB_CEIL } from './filter-core';
export type { FilterAxis, FilterAxisConfig, FilterValue, FilterResponse, FilterShapeType } from './filter-core';
export { MoveFunctions, MOVE_FUNCTION_BUTTONS, MOVE_FUNCTION_MANIFEST, MOVE_SPECIAL_BUTTONS, MOVE_STEP_FUNCTIONS, MOVE_CHIP_BUTTONS } from './move-functions';
export type { MoveFunctionButton, MoveFunctionPress, MoveFunctionHandler, MoveFunctionOptions, MoveFunctionChip, MoveFunctionChipStyle, MoveFunctionRunListener } from './move-functions';
export { MoveWaveform } from './components/MoveWaveform';
export type { MoveWaveformProps } from './components/MoveWaveform';
export {
  MoveWaveformStore,
  defaultView as moveWaveformDefaultView,
  scrubBy,
  zoomBy,
  stepPosition,
  loopFromStep,
  loopSteps,
  visibleWindow,
  padPosition,
  padSection,
  MOVE_WAVEFORM_STEPS,
  MOVE_WAVEFORM_PADS,
} from './move-waveform';
export type { MoveWaveformVariant, MoveWaveformView } from './move-waveform';
// Notifications — the app's messages, floating over the instrument and over
// whatever display is already up there.
export { MoveNotifications, moveNotify } from './components/MoveNotifications';
export type { MoveNotificationsProps, MoveNotifyOptions } from './components/MoveNotifications';
export { MOVE_NOTIFY_KINDS, MOVE_NOTIFY_GAP, MOVE_FLOAT_SELECTOR, notifyDockBottom } from './move-notify';
export type { MoveNotifyKind } from './move-notify';
export { MOVE_PALETTE } from './move-palette';
export type { MovePaletteName } from './move-palette';
export { MoveSettingsView } from './move-settings';
export { MoveVolumeDisplay } from './move-volume';
export type { MoveVolumeDisplayState } from './move-volume';
export { ICON_MOVE_CAPTURE, ICON_MOVE_ENTER, MOVE_FUNCTION_ICONS } from './icons';
export type { MoveFunctionGlyph } from './icons';
// Raw hardware an app claims for itself — the bottom pad rows, the step
// buttons, the device screen — kept for the on-screen mirror.
export { MoveSurfaceStore, moveScreenRowLabel, moveScreenChecked } from './move-surface-store';
export type { MovePadCell, MoveStepCell, MoveScreenList, MoveScreenRow, MoveSurfaceState } from './move-surface-store';

// List screen (the Move's dark display list, standalone)
export { ListScreen } from './components/ListScreen';
export type { ListScreenProps, ListScreenItem, ListScreenDetail } from './components/ListScreen';

// Modulation layer — slots, assignments, the engine, and the type registry
export { ModulationStore, MOD_TOUCH_GRACE_MS } from './store/ModulationStore';
export type { ModulationSourceConfig, ModStepAction } from './store/ModulationStore';
export {
  MOD_SLOTS,
  MOD_COLORS,
  MOD_SETTINGS_PANEL,
  modColor,
  modKey,
  applyModulation,
  registerModType,
  getModType,
  listModTypes,
  LFO_DEF,
  SH_DEF,
  ADSR_DEF,
  CURVE_DEF,
  AUDIO_DEF,
  setAudioModBuffer,
  getAudioModBuffer,
  subscribeAudioMod,
  getAudioModVersion,
  audioModLevel,
  CURVE_LABELS,
  CURVE_MAX_CLIPS,
  CURVE_MIN_DURATION,
  CURVE_MAX_DURATION,
  curveComposition,
  curveDuration,
  modPageLayout,
  visibleModControls,
  MOD_PAGE_DIALS,
  modRingArc,
  MOD_RING_RADIUS,
  MOD_RING_CIRCUMFERENCE,
  LFO_SYNC_DIVISIONS,
  lfoSyncedHz,
  envelopePoints,
  envelopeJoints,
  envCurveParam,
  ENV_BEND_STAGES,
  envStageWave,
  envWaveParam,
  envWaveFlipParam,
  ENV_WAVE_STAGES,
  ENV_SUSTAIN_WAVE_BEATS,
  modPageWidth,
  ADSR_STAGE_MAX,
} from './modulation-core';
export type {
  ModulationType,
  EnvStage,
  ModulationParams,
  ModulationParamValue,
  ModulationSlot,
  ModulationAssignment,
  ModTypeDef,
  ModControlMeta,
  ModPageLayout,
  ModPageSlot,
} from './modulation-core';
export { ModRing } from './components/ModRing';

// Timeline stores (headless — the Timeline UI lives in dialkit)
export { formatClock } from './timeline-core';
export { TimelineStore } from './store/TimelineStore';
export type {
  TimelineMeta,
  TimelineClipMeta,
  TimelineClipTrackMeta,
  TimelineTransport,
} from './store/TimelineStore';

// Shared cores and visualizations the Move surface builds on
export { sampleTransfer, transferLut, normalizeTransfer, insertPoint, removePoint, movePoint, nearestPoint, isIdentityTransfer, DEFAULT_TRANSFER, TRANSFER_MIN_GAP, TRANSFER_MAX_POINTS } from './transfer-core';
export type { TransferPoint, TransferValue } from './transfer-core';
export { snapAngle, normalizeAngle, valueToBearing, bearingToValue, angleFromPointer, nudgeAngle, arcPath, ANGLE_DEAD_ZONE_PX } from './angle-core';
export { WaveformVisualization } from './components/WaveformVisualization';
export type { WaveformMode, WaveformLoop } from './components/WaveformVisualization';
// The zoom ceiling belongs with the window maths a host frames against.
export { WAVEFORM_MAX_ZOOM, WAVEFORM_SMOOTH_POINTS } from './waveform-engine';
export { CurveComposer } from './components/CurveComposer';
export type { CurveType, CurveSegment, CurveDriver, CurveComposition, DriverDirection } from './components/CurveComposer';
export {
  CURVE_CYCLE,
  defaultComposition,
  splitSegment,
  removeSegment,
  flipSegment,
  flipDriver,
  flipSegmentX,
  flipSegmentY,
  flipDriverX,
  flipDriverY,
  cycleSegmentType,
  setSegmentCurvature,
  setSegmentSteepness,
  setSegmentOvershoot,
  setSegmentAnticipate,
  redistributeWeight,
  addDriver,
  removeDriver,
  cycleDriverType,
  setDriverCurvature,
  setDriverSteepness,
  setDriverOvershoot,
  setDriverAnticipate,
  springify,
  buildSamplers,
  readComposition,
  triggerLevels,
  triggersCrossed,
  DEFAULT_TRIGGER_STEPS,
} from './curve-composer-core';
export type { Sampler, SpringifyOptions, CompositionSamplers, CompositionRead } from './curve-composer-core';
export {
  clamp,
  valueToPercent,
  percentToValue,
  orderRange,
  clampRange,
  setLow,
  setHigh,
  shiftSpan,
  nearestHandle,
  pickDragTarget,
  isOutsideSpan,
  handleLeftStyles,
} from './range-slider-core';
export {
  COLOR_FORMATS,
  parseHex,
  formatHex,
  normalizeHex,
  displayHex,
  opacityPercent,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToOklch,
  oklchToRgb,
  clampOklchToSrgb,
} from './color-core';
export type { RGBA, HSVA, HSLA, OKLCH, ColorFormat } from './color-core';
export {
  gradientToCss,
  rampCss,
  gradientToTransform,
  gradientFillBox,
  normalizeGradient,
  colorAtPosition,
  addStop,
  removeStop,
  moveStop,
  setStopColor,
  setGradientType,
  setGradientAngle,
  setGradientCenter,
  setGradientScale,
  setGradientSquash,
  setGradientRotation,
  DEFAULT_GRADIENT,
  MIN_STOPS,
} from './gradient-core';
export type { GradientValue, GradientStop, GradientType, GradientTransform } from './gradient-core';
export {
  XY_DETENT_PX,
  XY_DEFAULT_STEP,
  resolveAxis,
  // `clamp` is re-exported once from './range-slider-core' above; xy-pad-core's
  // identical `clamp` is intentionally not re-exported here to avoid a duplicate.
  snapToStep,
  valueToNorm,
  normToValue,
  invertY,
  valueFromPoint,
  pointFromValue,
  applyDetentAxis,
  nudge,
  centerValue,
  normalizeValue,
} from './xy-pad-core';
export type { XYValue, AxisSpec, Point } from './xy-pad-core';
export {
  CURVE_SAMPLE_COUNT,
  CURVE_MIN_HEIGHT,
  CURVE_MAX_HEIGHT,
  CURVE_DEFAULT_HEIGHT,
  CURVE_FIT_PADDING,
  clampCurveHeight,
  normalizeCurveMarkers,
  plotCurve,
  curveY,
  curvePathData,
} from './curve-preview-core';
export type { CurvePoint, CurvePlot } from './curve-preview-core';

// Store (for advanced usage)
export { TweakStore, TAB_PATH, parseListItemSchema, groupListFields, defaultListItemParams, normalizeListItems, hintDomId } from './store/TweakStore';
export type {
  SpringConfig,
  EasingConfig,
  TransitionConfig,
  ActionConfig,
  SelectConfig,
  ToggleConfig,
  ColorConfig,
  GradientConfig,
  XYConfig,
  XYAxis,
  TextConfig,
  GalleryConfig,
  GalleryItem,
  FileConfig,
  SwatchConfig,
  SwatchOption,
  ChipsConfig,
  ChipOption,
  MultiSelectConfig,
  MultiSelectOption,
  SliderConfig,
  NumberConfig,
  RangeConfig,
  FilterConfig,
  RangeValue,
  ListConfig,
  ListItemValue,
  CurveConfig,
  AnalyserConfig,
  AffordanceConfig,
  AffordanceContext,
  AffordanceStatus,
  ListItemField,
  ListItemType,
  ListField,
  ListFieldKind,
  ListFieldGroup,
  ShortcutConfig,
  ShortcutMode,
  ShortcutInteraction,
  Preset,
  PresetProvider,
  PresetProviderPreset,
  PresetItem,
  TweakValue,
  TweakEvent,
  TweakConfig,
  ResolvedValues,
  ControlMeta,
  PanelConfig,
} from './store/TweakStore';

export { MoveColorStore, MOVE_COLOR_WHEEL, MOVE_COLOR_HUES, MOVE_COLOR_STEPS, MOVE_COLOR_PALETTES, MOVE_OPACITY_PADS, moveWheelSlot } from './move-color';
export type { MoveColorView, MoveColorPalette } from './move-color';

// The preset navigator behind the hardware Menu button — the store the
// bridge kit drives (scroll on wheel turns, confirm on jog click,
// beginSave on a long press).
export { MovePresetStore } from './move-presets';
export type { MovePresetItem, MovePresetView, MovePresetSave, MovePresetPhase } from './move-presets';
