import type { ArchetypeId, PlatformType, SectorId } from './sectors';

export interface PreviewMetric {
  label: string;
  value: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'bad';
}

export interface PreviewItem {
  code: string;
  title: string;
  subtitle: string;
  value: string;
  status: string;
  tone?: 'neutral' | 'ok' | 'warn' | 'bad';
  meta?: string;
}

export interface ArchLayers {
  client: string;
  edge: string;
  core: string;
  integration: string;
  storage: string;
}

export interface ConceptProject {
  id: string;
  name: string;
  tagline: string;
  sector: SectorId;
  platform: PlatformType;
  archetype: ArchetypeId;
  brandColor: string;
  featured?: boolean;
  audience: string;
  summary: string;
  problem: string;
  indonesiaContext: string;
  features: string[];
  stack: string[];
  standards: string[];
  cvLink?: string;
  architecture: ArchLayers;
  preview: {
    surfaceTitle: string;
    envTag: string;
    primaryAction: string;
    secondaryAction: string;
    metrics: [PreviewMetric, PreviewMetric, PreviewMetric];
    items: [PreviewItem, PreviewItem, PreviewItem, PreviewItem];
    snippet: string;
  };
}
