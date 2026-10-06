import React from 'react';

/**
 * CompetencyRadarChart - Gráfico Radar/Teia SVG puro
 * Sem dependências externas para garantir máxima estabilidade e compatibilidade com Vercel.
 */
export default function CompetencyRadarChart({ data, title = 'Teia de Competências', subtitle }) {
  if (!data || data.length === 0) return null;

  const size = 320;
  const center = size / 2;
  const radius = size * 0.36;
  const totalAxes = data.length; // 6 competências

  // Calcula coordenadas polares para cartesianas
  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const r = (radius * Math.max(valuePercent, 10)) / 100;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Coordenadas da teia de fundo (anéis concêntricos)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getPolygonPoints = (levelFactor) => {
    return data
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
        const r = radius * levelFactor;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Pontos do polígono de dados reais
  const dataPolygonPoints = data
    .map((item, i) => {
      const coords = getCoordinates(i, item.value);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
      {title && (
        <div style={{ marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        style={{ width: '100%', height: 'auto', maxHeight: '300px', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.25" />
          </linearGradient>
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Anéis concêntricos da teia (Grid) */}
        {levels.map((lvl, idx) => (
          <polygon
            key={idx}
            points={getPolygonPoints(lvl)}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            strokeDasharray={lvl < 1.0 ? '3 3' : 'none'}
          />
        ))}

        {/* Eixos radiais */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* Área preenchida dos dados */}
        <polygon
          points={dataPolygonPoints}
          fill="url(#radarFillGrad)"
          stroke="var(--accent-cyan)"
          strokeWidth="2.5"
          filter="url(#radarGlow)"
        />

        {/* Vértices e Indicadores */}
        {data.map((item, i) => {
          const coords = getCoordinates(i, item.value);
          return (
            <g key={i}>
              <circle
                cx={coords.x}
                cy={coords.y}
                r="4.5"
                fill={item.color || 'var(--accent-cyan)'}
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
              />
            </g>
          );
        })}

        {/* Rótulos Radiais com cores das tags */}
        {data.map((item, i) => {
          const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
          const labelDistance = radius + 22;
          const lx = center + labelDistance * Math.cos(angle);
          const ly = center + labelDistance * Math.sin(angle);

          // Ajuste de ancoragem textual
          let textAnchor = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';

          // Resumo curto da tag
          const words = item.label.split('&')[0].trim();

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="9"
              fontWeight="700"
              fill={item.color || 'var(--text-secondary)'}
              style={{ letterSpacing: '0.02em', userSelect: 'none' }}
            >
              {words} ({item.count})
            </text>
          );
        })}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
        {data.map(item => (
          <span
            key={item.id}
            style={{
              fontSize: '0.7rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.15rem 0.45rem',
              color: item.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }}></span>
            <span>{item.label}: <strong>{item.count}</strong></span>
          </span>
        ))}
      </div>
    </div>
  );
}
