export interface ProjectTranslation {
  tagline: string;
  audience: string;
  summary: string;
  problem: string;
  indonesiaContext: string;
  features: string[];
}

export type ProjectTranslationMap = Record<string, ProjectTranslation>;
