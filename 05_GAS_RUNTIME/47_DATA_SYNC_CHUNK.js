/**
 * DATA SYNC — chunk / row conventions (DATA_SYNC_MODULE_DESIGN.md §7, §9 I-1).
 * Load before 48_DATA_SYNC_TRANSFORM / 49_DATA_SYNC_ENGINE.
 */

/** First data row on sheet (1-based). Header row = 1. */
var DATA_SYNC_FIRST_DATA_ROW = 2;

/** Default max data rows per buildDataSyncReport chunk (avoid GAS timeout). */
var DATA_SYNC_DEFAULT_CHUNK_SIZE = 2500;

/**
 * nextStartRow (in continuation token): 1-based sheet row index of the FIRST row
 * of the NEXT chunk (inclusive). Do not mix with 0-based array index — convert at boundaries only.
 */
