import React from 'react';
import { Coins, Award, Sparkles, MessageSquareQuote, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { storageService } from '../../services/storageService';
import CompetencyRadarChart from '../Charts/CompetencyRadarChart';

export default function WalletCard({ student, squad }) {
  const historyData = storageService.getStudentLongitudinalHistory(student.id);
  const studentRadarData = storageService.getCompetencyRadarData(student.id, 'student');

  if (!historyData) return null;

  const { totalCoins, topTags, sprintHistory, approvedComments } = historyData;

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '2rem auto 0 auto' }}>
      <div className="grid-cols-2">
        {/* Card de Saldo e Evolução */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Histórico Longitudinal • Curso Técnico
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                MultiCoins Acumuladas
              </h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <Coins size={24} color="var(--accent-coin)" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-coin)', textShadow: '0 0 25px rgba(251, 191, 36, 0.4)' }}>
              {totalCoins}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>MultiCoins em todas as Sprints</span>
          </div>

          {/* Destaque das Principais Habilidades */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="var(--accent-cyan)" />
              <span>Competências Mais Reconhecidas pelos Colegas:</span>
            </div>

            {topTags.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Nenhuma competência computada ainda nesta UC.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {topTags.map(st => (
                  <div
                    key={st.tag.id}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.75rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{st.tag.label}</span>
                    <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-cyan)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                      +{st.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evolução Sprint a Sprint */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="var(--accent-emerald)" />
              <span>Linha do Tempo de Sprints e Autoavaliação:</span>
            </div>

            {sprintHistory.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sem histórico de sprints concluídas.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sprintHistory.map((sh, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sh.sprintTitle}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {sh.selfRating && (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          Auto: ⭐ {sh.selfRating}/5
                        </span>
                      )}
                      <span style={{ color: 'var(--accent-coin)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        🪙 +{sh.coinsReceived}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mural de Kudos e Feedback */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                Mural Socioemocional
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                Feedbacks Aprovados
              </h3>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <MessageSquareQuote size={24} color="var(--accent-emerald)" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {approvedComments.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Aguardando comentários dos colegas nas avaliações de Sprint.
              </div>
            ) : (
              approvedComments.map((kc, idx) => (
                <div
                  key={idx}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid var(--accent-emerald)' }}
                >
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{kc.comment}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Elogio de colega</span>
                    <span>Anônimo • {kc.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gráfico Radar de Competências Pessoais */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CompetencyRadarChart
          data={studentRadarData}
          title="Minha Teia de Competências Ágeis"
          subtitle="Equilíbrio das 6 competências socioemocionais e técnicas reconhecidas nas Sprints"
        />
      </div>
    </div>
  );
}
