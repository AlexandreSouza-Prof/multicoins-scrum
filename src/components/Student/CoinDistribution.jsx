import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Coins, CheckCircle, AlertTriangle, MessageSquare, Award, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function CoinDistribution({ student, squad, classId, onSubmitted }) {
  const activeSprint = storageService.getActiveSprint(squad.id);
  const competencyTags = storageService.getCompetencyTags();
  const hasEvaluated = activeSprint ? storageService.hasStudentEvaluated(activeSprint.id, student.id) : false;

  // Obter membros detalhados da equipe
  const allSquadMembers = storageService.getSquadMembersWithDetails(squad.id);
  const excusedSet = new Set(activeSprint?.excusedStudents || []);

  // Colegas de time (excluindo a si mesmo)
  const teammates = allSquadMembers.filter(m => m.id !== student.id);

  // Inicializar alocações (dividindo de forma igual ou zerada)
  const [allocations, setAllocations] = useState(
    teammates.map(tm => ({
      toStudentId: tm.id,
      coins: 0,
      tags: [],
      comment: '',
      isExcused: excusedSet.has(tm.id),
    }))
  );

  // Estado da Autoavaliação do próprio aluno
  const [selfRating, setSelfRating] = useState(5);
  const [selfReflection, setSelfReflection] = useState('');

  const [feedbackError, setFeedbackError] = useState('');
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!activeSprint) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(100, 116, 139, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nenhuma Sprint Ativa no Momento</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          O instrutor ainda não abriu uma nova rodada de avaliação para a equipe <strong>{squad.name}</strong>.
        </p>
      </div>
    );
  }

  if (hasEvaluated || successCelebration) {
    return (
      <div className="glass-panel fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--accent-emerald)' }}>
          <CheckCircle size={38} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Avaliação da Sprint Concluída!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Obrigado, <strong>{student.name}</strong>! Suas <strong>100 MultiCoins</strong> e sua <strong>Autoavaliação</strong> foram computadas de forma segura para o diagnóstico ágil da equipe.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'inline-flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Sprint Avaliada:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSprint.title}</span>
        </div>
      </div>
    );
  }

  const currentTotal = allocations.reduce((sum, a) => sum + (Number(a.coins) || 0), 0);
  const remainingCoins = 100 - currentTotal;

  const handleCoinsChange = (toStudentId, val) => {
    setFeedbackError('');
    const num = Math.min(60, Math.max(0, parseInt(val, 10) || 0));
    setAllocations(prev =>
      prev.map(item => (item.toStudentId === toStudentId ? { ...item, coins: num } : item))
    );
  };

  const handleAddQuickCoins = (toStudentId, delta) => {
    setFeedbackError('');
    setAllocations(prev =>
      prev.map(item => {
        if (item.toStudentId === toStudentId) {
          const nextVal = Math.min(60, Math.max(0, item.coins + delta));
          return { ...item, coins: nextVal };
        }
        return item;
      })
    );
  };

  const handleToggleTag = (toStudentId, tagId) => {
    setFeedbackError('');
    setAllocations(prev =>
      prev.map(item => {
        if (item.toStudentId === toStudentId) {
          const exists = item.tags.includes(tagId);
          const nextTags = exists
            ? item.tags.filter(t => t !== tagId)
            : [...item.tags, tagId];
          return { ...item, tags: nextTags };
        }
        return item;
      })
    );
  };

  const handleCommentChange = (toStudentId, text) => {
    setAllocations(prev =>
      prev.map(item => (item.toStudentId === toStudentId ? { ...item, comment: text } : item))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedbackError('');

    const selfAssessmentData = {
      rating: selfRating,
      reflection: selfReflection.trim(),
    };

    const res = storageService.submitEvaluation(activeSprint.id, student.id, squad.id, allocations, selfAssessmentData);
    if (!res.success) {
      setFeedbackError(res.message);
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#10b981'],
      });
    } catch (e) {
      // Ignorar falha no canvas
    }

    setSuccessCelebration(true);
    if (onSubmitted) onSubmitted();
  };

  return (
    <div className="fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Banner de Status da Sprint */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Retrospectiva Scrum • Avaliação por Pares
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {activeSprint.title}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Equipe: <strong style={{ color: 'var(--text-primary)' }}>{squad.name}</strong> • Projeto: <em>{squad.projectTheme}</em>
          </div>
        </div>

        {/* Saldo da Carteira */}
        <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUA CARTEIRA DESTA SPRINT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: remainingCoins === 0 ? 'var(--accent-emerald)' : remainingCoins < 0 ? 'var(--accent-rose)' : 'var(--accent-coin)' }}>
              {remainingCoins}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 100 restantes</span>
          </div>
        </div>
      </div>

      {/* Regras Claras do Scrum */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--accent-coin)' }}>💰</span> Total de 100 MultiCoins obrigatório
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>🛡️</span> Máximo de 60 moedas por colega
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--accent-emerald)' }}>🏷️</span> Selecione tags de competência
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--accent-rose)' }}>🔒</span> Anônimo entre colegas
        </div>
      </div>

      {feedbackError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-rose)', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertTriangle size={20} />
          <span style={{ fontWeight: 500 }}>{feedbackError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* PARTE 1: AUTOAVALIAÇÃO DO ALUNO (O Efeito Espelho) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Star size={20} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Sua Autoavaliação nesta Sprint
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Como você avalia seu próprio comprometimento, entregas técnicas e colaboração com a equipe nesta Sprint? (Visível apenas para o professor):
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setSelfRating(star)}
                style={{
                  background: star <= selfRating ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                  border: `1px solid ${star <= selfRating ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  color: star <= selfRating ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>⭐</span>
                <span>{star} {star === 1 ? 'Mínimo' : star === 5 ? 'Excelente' : ''}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Breve reflexão pessoal: no que você mais se dedicou e o que pode melhorar na próxima Sprint?"
            value={selfReflection}
            onChange={(e) => setSelfReflection(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        {/* PARTE 2: AVALIAÇÃO DOS COLEGAS DE EQUIPE */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Distribuição de MultiCoins para seus Colegas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {teammates.map(teammate => {
              const isExcused = excusedSet.has(teammate.id);
              const alloc = allocations.find(a => a.toStudentId === teammate.id) || { coins: 0, tags: [], comment: '' };

              if (isExcused) {
                return (
                  <div key={teammate.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', opacity: 0.7, background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.8rem' }}>{teammate.avatar}</span>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teammate.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{teammate.role}</span>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(100, 116, 139, 0.2)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                        Ausente Justificado / Atestado
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={teammate.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>{teammate.avatar}</span>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teammate.name}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {teammate.role}
                        </span>
                      </div>
                    </div>

                    {/* Contadores */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                        onClick={() => handleAddQuickCoins(teammate.id, -5)}
                        disabled={alloc.coins <= 0}
                      >
                        -5
                      </button>

                      <div className="coin-counter" style={{ minWidth: '90px', justifyContent: 'center' }}>
                        <span className="coin-icon">🪙</span>
                        <span>{alloc.coins}</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                        onClick={() => handleAddQuickCoins(teammate.id, +5)}
                        disabled={alloc.coins >= 60 || remainingCoins <= 0}
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem', color: 'var(--accent-coin)' }}
                        onClick={() => handleAddQuickCoins(teammate.id, +10)}
                        disabled={alloc.coins >= 60 || remainingCoins < 10}
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  {/* Slider */}
                  <div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={alloc.coins}
                      onChange={(e) => handleCoinsChange(teammate.id, e.target.value)}
                      className="coin-slider"
                    />
                  </div>

                  {/* Competências */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Competências Reconhecidas:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {competencyTags.map(tag => {
                        const isSelected = alloc.tags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            className={`competency-tag ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggleTag(teammate.id, tag.id)}
                          >
                            <span>🏷️</span>
                            <span>{tag.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comentário anônimo */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      <MessageSquare size={14} />
                      <span>Elogio ou Feedback Construtivo da Sprint:</span>
                    </div>
                    <input
                      type="text"
                      placeholder={`Ex: Mandou muito bem nos cortes do vídeo e ajudou nas Dailies...`}
                      value={alloc.comment}
                      onChange={(e) => handleCommentChange(teammate.id, e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.6rem 0.85rem' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Submissão Fixa */}
        <div className="glass-panel" style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '2px solid var(--border-subtle)', marginTop: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: remainingCoins === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {remainingCoins === 0 ? '✓ Saldo de 100 MultiCoins alocado perfeitamente!' : remainingCoins > 0 ? `⚠️ Você ainda precisa alocar mais ${remainingCoins} moedas.` : `⚠️ Você ultrapassou o limite em ${Math.abs(remainingCoins)} moedas.`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Após enviar, a avaliação desta Sprint é gravada e o Termômetro é recalculado.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            disabled={remainingCoins !== 0}
          >
            <span>Confirmar e Enviar MultiCoins</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
