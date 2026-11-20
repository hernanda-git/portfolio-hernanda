import React from 'react';
import type { ConceptProject } from '../data/projects';

interface ArchDiagramProps {
  project: ConceptProject;
}

export const ArchDiagram: React.FC<ArchDiagramProps> = ({ project }) => {
  const { architecture, brandColor } = project;
  const nodes = [
    { step: '01 · CLIENT SURFACE', label: architecture.client, x: 16 },
    { step: '02 · EDGE / GATEWAY', label: architecture.edge, x: 204 },
    { step: '03 · CORE DOMAIN', label: architecture.core, x: 392 },
    { step: '04 · NATIONAL / EXT API', label: architecture.integration, x: 580 },
    { step: '05 · DATA & AUDIT STORE', label: architecture.storage, x: 768 },
  ];

  const wrap = (text: string): [string, string] => {
    if (text.length <= 22) return [text, ''];
    const mid = text.lastIndexOf(' ', 22);
    if (mid > 8) return [text.slice(0, mid), text.slice(mid + 1, 46)];
    return [text.slice(0, 22), text.slice(22, 44)];
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox="0 0 956 156"
        width="100%"
        style={{ minWidth: '720px', display: 'block', background: 'var(--ui-surface-2)', border: '1px solid var(--ui-line)', borderRadius: '4px' }}
        role="img"
        aria-label={`Diagram arsitektur sistem untuk ${project.name}`}
      >
        <text x="16" y="24" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text-muted)">
          ARSITEKTUR SOLUSI REFERENSI — {project.id} · {project.name.toUpperCase()} · RESIDENSI DATA: INDONESIA (WIB)
        </text>

        {nodes.map((node, idx) => {
          const [line1, line2] = wrap(node.label);
          return (
            <g key={node.step}>
              {idx < nodes.length - 1 && (
                <g>
                  <line
                    x1={node.x + 170}
                    y1={84}
                    x2={node.x + 188}
                    y2={84}
                    stroke="var(--ui-line-strong)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points={`${node.x + 188},84 ${node.x + 182},80 ${node.x + 182},88`}
                    fill="var(--ui-line-strong)"
                  />
                </g>
              )}
              <rect
                x={node.x}
                y={42}
                width={170}
                height={84}
                rx={4}
                fill="var(--ui-surface)"
                stroke={idx === 2 ? brandColor : 'var(--ui-line-strong)'}
                strokeWidth={idx === 2 ? 1.8 : 1}
              />
              <rect
                x={node.x}
                y={42}
                width={170}
                height={22}
                rx={3}
                fill={idx === 2 ? brandColor : 'var(--ui-surface-3)'}
              />
              <text
                x={node.x + 8}
                y={56}
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="600"
                fill={idx === 2 ? '#ffffff' : 'var(--ui-text-2)'}
              >
                {node.step}
              </text>
              <text
                x={node.x + 8}
                y={84}
                fontSize="11"
                fontFamily="IBM Plex Sans, sans-serif"
                fontWeight="600"
                fill="var(--ui-text)"
              >
                {line1}
              </text>
              {line2 && (
                <text
                  x={node.x + 8}
                  y={101}
                  fontSize="11"
                  fontFamily="IBM Plex Sans, sans-serif"
                  fill="var(--ui-text-2)"
                >
                  {line2}
                </text>
              )}
            </g>
          );
        })}

        <text x="16" y="144" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" fill="var(--ui-text-muted)">
          Standar: {project.standards.join('  ·  ')}  |  Stack Utama: {project.stack.join(', ')}
        </text>
      </svg>
    </div>
  );
};
