// Master dispatcher for all 32 distinct screen layouts.
import { FONTS, THEMES } from './themes.mjs';
import { renderLayoutA } from './layoutsA.mjs';
import { renderLayoutB } from './layoutsB.mjs';
import { renderLayoutC } from './layoutsC.mjs';

const SET_A = new Set([
  'pos-touch-register',
  'kds-kitchen-board',
  'stadium-seating-map',
  'gantt-tape-chart',
  'dicom-radiology-pacs',
  'document-redline-editor',
  'ide-code-diff-workbench',
  'api-postman-inspector',
  'livestream-commerce-studio',
  'whatsapp-inbox-flow',
  'kanban-sprint-board',
]);

const SET_B = new Set([
  'geo-dispatch-map',
  'scada-plant-blueprint',
  'floorplan-bay-grid',
  'cbt-exam-simulator',
  'social-creator-marketplace',
  'accounting-ledger-sheet',
  'email-approval-inbox',
  'dag-pipeline-canvas',
  'form-wizard-onboarding',
  'trading-fraud-terminal',
  'clinical-emr-chart',
]);

export function renderProjectPage(project, pageSpec, art) {
  const theme = THEMES[art.theme] || THEMES['studio-daylight'];
  const font = FONTS[art.font] || FONTS['swiss-geometric'];
  const persona = art.persona || 'Operator · Jakarta';

  if (SET_A.has(pageSpec.layout)) {
    return renderLayoutA(pageSpec.layout, project, pageSpec, theme, font, persona);
  }
  if (SET_B.has(pageSpec.layout)) {
    return renderLayoutB(pageSpec.layout, project, pageSpec, theme, font, persona);
  }
  return renderLayoutC(pageSpec.layout, project, pageSpec, theme, font, persona);
}
