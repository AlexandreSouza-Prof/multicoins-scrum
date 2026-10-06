import React, { useState } from 'react';
import { Flame, AlertTriangle, CheckCircle2, HelpCircle, Users, Coins, Award, Star, UserCheck, ShieldAlert, Compass } from 'lucide-react';
import { storageService } from '../../services/storageService';
import CompetencyRadarChart from '../Charts/CompetencyRadarChart';

export default function TeamThermometer({ thermometerData, onToggleExcused, onOpenInterventionModal }) {
  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'radar'

  if (!thermometerData) return null;

  const {
    squad,
    sprint,
    completionRate,
    evaluatorsCount,
    totalMembers,
    activeMembersCount,
    memberStats,
    healthStatus,
    healthMessage,
    healthColor,
    totalDistributedCoins,
  } = thermometerData;

  const radarData = storageService.getCompetencyRadarData(squad.id, 'squad');

  const getStatusBadge = () => {
    switch (healthStatus) {
      case 'balanced':
        return { label: 'Equilibrado', icon: CheckCircle2, class: 'balanced' };
      case 'overload':
        return { label: 'Sobrecarga Identificada', icon: AlertTriangle, class: 'overload' };
      case 'disengaged':
        return { label: 'Alerta de Baixo Engajamento', icon: AlertTriangle, class: 'disengaged' };
      default:
        return { label: 'Aguardando Avaliações', icon: HelpCircle, class: 'waiting' };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
      {/* Cabeçalho do Termômetro */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${healthColor}20`, border: `1px solid ${healthColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: healthColor }}>
              <Flame size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Termômetro Ágil da Equipe
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {squad.name}
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Sprint: <strong>{sprint ? sprint.title : 'Nenhuma selecionada'}</strong>
          </div>
        </div>

        {/* Status Badge Principal */}
        <div style={{ textAlign: 'right' }}>
          <div className={`health-pill ${statusBadge.class}`}>
            <StatusIcon size={16} />
            <span>{statusBadge.label}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Participação: <strong>{evaluatorsCount}/{activeMembersCount} ativos ({completionRate}%)</strong>
          </div>
        </div>
      </div>

      {/* Caixa de Diagnóstico Pedagógico com Ação Direta de Intervenção */}
      <div style={{ background: `${healthColor}15`, border: `1px solid ${healthColor}40`, borderRadius: '12px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: '1 1 320px' }}>
          <Flame size={20} color={healthColor} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
          <div>
            <strong style={{ color: healthColor, fontSize: '0.9rem', display: 'block' }}>Diagnóstico do Instrutor:</strong>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '0.2rem', lineHeight: 1.5 }}>
              {healthMessage}
            </p>
          </div>
        </div>

        {onOpenInterventionModal && (
          <button
            onClick={onOpenInterventionModal}
            className="btn btn-secondary"
            style={{ 
              borderColor: `${healthColor}60`, 
              color: healthColor, 
              background: `${healthColor}12`,
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700
            }}
          >
            <ShieldAlert size={15} />
            <span>🚨 Registrar Intervenção Pedagógica</span>
          </button>
        )}
      </div>

      {/* Alternância de Abas: Integrantes vs Radar de Competências */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveSubTab('members')}
            className={`btn ${activeSubTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          >
            <Users size={15} />
            <span>Integrantes & Efeito Espelho</span>
          </button>
          <button
            onClick={() => setActiveSubTab('radar')}
            className={`btn ${activeSubTab === 'radar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          >
            <Compass size={15} />
            <span>Radar de Competências</span>
          </button>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activeSubTab === 'members' 
            ? '💡 Compare a Autoavaliação do aluno (⭐) com as moedas dadas pelo grupo (🪙)'
            : 'Mapeamento visual do equilíbrio entre as 6 competências ágeis'}
        </span>
      </div>

      {activeSubTab === 'radar' ? (
        <div style={{ padding: '1.5rem', background: 'var(--bg-inner)', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center' }}>
          <CompetencyRadarChart
            data={radarData}
            title={`Equilíbrio de Competências: ${squad.name}`}
            subtitle="Mapeamento multidimensional das tags conferidas entre os integrantes"
          />
        </div>
      ) : (
        /* Grid de Integrantes da Equipe */
        <div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {memberStats.map(stat => {
            const percentOfTotal = totalDistributedCoins > 0 ? Math.round((stat.totalCoins / totalDistributedCoins) * 100) : 0;

            return (
              <div
                key={stat.member.id}
                style={{
                  background: stat.isExcused ? 'rgba(100, 116, 139, 0.1)' : 'var(--bg-surface)',
                  border: `1px solid ${stat.isExcused ? 'rgba(100, 116, 139, 0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative',
                  opacity: stat.isExcused ? 0.75 : 1,
                }}
              >
                {/* Header do Aluno */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{stat.member.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{stat.member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.member.role}</div>
                    </div>
                  </div>

                  {/* Botão de Ausência Justificada / Atestado */}
                  <button
                    onClick={() => onToggleExcused && onToggleExcused(stat.member.id)}
                    title={stat.isExcused ? 'Desmarcar atestado' : 'Marcar como ausente justificado nesta Sprint'}
                    style={{
                      background: stat.isExcused ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-inner)',
                      border: `1px solid ${stat.isExcused ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                      color: stat.isExcused ? 'var(--accent-amber)' : 'var(--text-muted)',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {stat.isExcused ? 'Atestado' : 'Presente'}
                  </button>
                </div>

                {/* Efeito Espelho: Autoavaliação vs Moedas do Grupo */}
                <div style={{ background: 'var(--bg-inner)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Star size={14} color="var(--accent-emerald)" />
                    <span style={{ color: 'var(--text-secondary)' }}>Auto:</span>
                    <strong style={{ color: stat.selfAssessment ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {stat.selfAssessment ? `⭐ ${stat.selfAssessment.rating}/5` : 'Pendente'}
                    </strong>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: stat.hasEvaluated ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: stat.hasEvaluated ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    }}
                  >
                    {stat.hasEvaluated ? '✓ Votou' : 'Não Votou'}
                  </span>
                </div>

                {/* Contador de Moedas e Proporção */}
                {!stat.isExcused ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Moedas do Grupo:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-coin)', fontSize: '1.1rem' }}>
                        🪙 {stat.totalCoins} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({percentOfTotal}%)</span>
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--slider-track)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{ width: `${Math.min(100, percentOfTotal * 2)}%`, height: '100%', background: percentOfTotal > 45 ? 'var(--accent-amber)' : percentOfTotal < 15 && totalDistributedCoins > 0 ? 'var(--accent-rose)' : 'var(--accent-cyan)', transition: 'width 0.3s' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', margin: '0.5rem 0', fontStyle: 'italic' }}>
                    * Aluno justificado: não entra no cálculo de sobrecarga da Sprint.
                  </div>
                )}

                {/* Tags de Competência */}
                <div style={{ fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Destaques:</span>
                  {stat.topTags.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum destaque registrado</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {stat.topTags.map(tt => (
                        <span
                          key={tt.tag.id}
                          style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: 'var(--accent-cyan)', fontWeight: 600 }}
                        >
                          {tt.tag.label} ({tt.count})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
