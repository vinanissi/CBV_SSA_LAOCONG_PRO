/**
 * PHASE_DOSSIER_04 — in-memory focus request bus (no persistence).
 */

import type { DossierFocusRequest } from './dossierCrossFocusTypes';

type DossierCrossFocusListener = (request: DossierFocusRequest) => void;

const listeners = new Set<DossierCrossFocusListener>();

export function subscribeDossierCrossFocus(listener: DossierCrossFocusListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishDossierCrossFocus(request: DossierFocusRequest): void {
  for (const listener of listeners) {
    listener(request);
  }
}
