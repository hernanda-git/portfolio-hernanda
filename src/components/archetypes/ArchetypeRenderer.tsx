import React, { useState } from 'react';
import type { ConceptProject } from '../../data/projects';
import { ARCHETYPE_LABELS } from '../../data/sectors';
import {
  ClinicalEmrProto,
  FintechLedgerProto,
  GeoDispatchProto,
  MarketplaceStoreProto,
  MobileSuperAppProto,
  TerminalCliProto,
} from './GroupA';
import {
  AiAgentWorkbenchProto,
  BiAnalyticsProto,
  GovPortalProto,
  IotScadaProto,
  KanbanWorkflowProto,
  PosKioskProto,
} from './GroupB';
import {
  CalendarBookingProto,
  DesktopErpProto,
  DocumentVaultProto,
  IdeCodeDiffProto,
  SecuritySocProto,
  SocialCommunityProto,
} from './GroupC';

interface ArchetypeRendererProps {
  project: ConceptProject;
}

const metricTone = (tone?: 'neutral' | 'ok' | 'warn' | 'bad') => {
  if (tone === 'ok') return 'var(--ui-ok)';
  if (tone === 'warn') return 'var(--ui-warn)';
  if (tone === 'bad') return 'var(--ui-bad)';
  return 'var(--ui-text)';
};

export const ArchetypeRenderer: React.FC<ArchetypeRendererProps> = ({ project }) => {
  const [lastEvent, setLastEvent] = useState<string>(
    `Prototype ready (${ARCHETYPE_LABELS[project.archetype]}) — click controls inside the screen to test interactions.`
  );

  const renderSurface = () => {
    switch (project.archetype) {
      case 'mobile-superapp':
        return <MobileSuperAppProto project={project} onLog={setLastEvent} />;
      case 'terminal-cli':
        return <TerminalCliProto project={project} onLog={setLastEvent} />;
      case 'fintech-ledger':
        return <FintechLedgerProto project={project} onLog={setLastEvent} />;
      case 'clinical-emr':
        return <ClinicalEmrProto project={project} onLog={setLastEvent} />;
      case 'geo-dispatch':
        return <GeoDispatchProto project={project} onLog={setLastEvent} />;
      case 'marketplace-store':
        return <MarketplaceStoreProto project={project} onLog={setLastEvent} />;
      case 'kanban-workflow':
        return <KanbanWorkflowProto project={project} onLog={setLastEvent} />;
      case 'ai-agent-workbench':
        return <AiAgentWorkbenchProto project={project} onLog={setLastEvent} />;
      case 'pos-kiosk':
        return <PosKioskProto project={project} onLog={setLastEvent} />;
      case 'iot-scada':
        return <IotScadaProto project={project} onLog={setLastEvent} />;
      case 'gov-portal':
        return <GovPortalProto project={project} onLog={setLastEvent} />;
      case 'bi-analytics':
        return <BiAnalyticsProto project={project} onLog={setLastEvent} />;
      case 'ide-code-diff':
        return <IdeCodeDiffProto project={project} onLog={setLastEvent} />;
      case 'calendar-booking':
        return <CalendarBookingProto project={project} onLog={setLastEvent} />;
      case 'document-vault':
        return <DocumentVaultProto project={project} onLog={setLastEvent} />;
      case 'desktop-erp':
        return <DesktopErpProto project={project} onLog={setLastEvent} />;
      case 'social-community':
        return <SocialCommunityProto project={project} onLog={setLastEvent} />;
      case 'security-soc':
        return <SecuritySocProto project={project} onLog={setLastEvent} />;
    }
  };

  return (
    <div className="proto-shell">
      <div className="proto-chrome">
        <div className="proto-brand-strip">
          <span className="proto-brand-dot" style={{ background: project.brandColor }} />
          <strong style={{ fontSize: '13px' }}>{project.preview.surfaceTitle}</strong>
          <span className="tag tag-mono">{ARCHETYPE_LABELS[project.archetype]}</span>
        </div>
        <span className="tag tag-mono">{project.preview.envTag}</span>
      </div>

      <div className="proto-metrics-row">
        {project.preview.metrics.map((m) => (
          <div className="proto-metric-cell" key={m.label}>
            <div className="proto-metric-label">{m.label} (sample prototype readout)</div>
            <div className="proto-metric-val" style={{ color: metricTone(m.tone) }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {renderSurface()}

      <div className="proto-action-log">
        <span>EVENT LOG: {lastEvent}</span>
        <span>CONCEPT SAMPLE DATA · UNDEPLOYED PROTOTYPE</span>
      </div>
    </div>
  );
};
