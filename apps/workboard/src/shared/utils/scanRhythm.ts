/** GS_09J — readability + scan rhythm constants */
/** GS_09I — readability tuning (typography + contrast floor) */
/** GS_09H — stable queue scan rhythm constants */

export const SCAN_ROW_MIN_HEIGHT_PX = 48;
export const SCAN_ROW_GAP_PX = 4;
export const SCAN_GROUP_GAP_PX = 8;
export const ACTION_ZONE_WIDTH_REM = 4.25;

/** Operational typography targets (px) — GS_09L */
export const READABILITY_TITLE_PX = 16;
export const READABILITY_OPERATIONAL_LINE_PX = 14;
export const READABILITY_PASSIVE_META_PX = 14;
export const READABILITY_MENU_PX = 15;
export const READABILITY_BASE_PX = 16;

/** Hot signal bar width (px) */
export const HOT_SIGNAL_BAR_PX = 3;

export function cardDisclosureMode(focused: boolean, hovered: boolean, selected?: boolean): 'compact' | 'expanded' {
  if (focused || hovered || selected) return 'expanded';
  return 'compact';
}

export function effectiveDisclosureMode(
  focused: boolean,
  hovered: boolean,
  selected: boolean | undefined,
  focusQueueMode: boolean,
): 'compact' | 'expanded' {
  if (focusQueueMode) return 'compact';
  return cardDisclosureMode(focused, hovered, selected);
}
