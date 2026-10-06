import React, { useState } from 'react';
import { KeyRound, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function LoginPin({ onLoginSuccess }) {
  const state = storageService.getState();
  const classes = state.classes || [];
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  
  const squads = storageService.getSquadsByClass(selectedClassId);
  const [selectedSquadId, setSelectedSquadId] = useState(squads[0]?.id || '');

  const squadMembers = storageService.getSquadMembersWithDetails(selectedSquadId);
  const [selectedStudentId, setSelectedStudentId] = useState(squadMembers[0]?.id || '');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronizar ao trocar de turma
  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedClassId(newClassId);
    const newSquads = storageService.getSquadsByClass(newClassId);
    if (newSquads.length > 0) {
      setSelectedSquadId(newSquads[0].id);
      const newMembers = storageService.getSquadMembersWithDetails(newSquads[0].id);
      setSelectedStudentId(newMembers[0]?.id || '');
    }
  };

  // Sincronizar ao trocar de equipe
  const handleSquadChange = (e) => {
    const newSquadId = e.target.value;
    setSelectedSquadId(newSquadId);
    const newMembers = storageService.getSquadMembersWithDetails(newSquadId);
    if (newMembers.length > 0) {
      setSelectedStudentId(newMembers[0].id);
    }
  };

  const currentMember = squadMembers.find(m => m.id === selectedStudentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pin || pin.length < 4) {
      setErrorMessage('Digite seu PIN de 4 dígitos.');
      return;
    }

    const res = storageService.loginStudent(selectedClassId, selectedSquadId, selectedStudentId, pin);
    if (res.success) {
      onLoginSuccess(res.student, res.squad, selectedClassId);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }} className="fade-in">
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Acesso do Aluno
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Selecione seu perfil Scrum e insira seu PIN de 4 dígitos
          </p>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Seletor de Turma */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Turma / Curso
            </label>
            <select
              className="form-input"
              value={selectedClassId}
              onChange={handleClassChange}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Equipe */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Equipe / Agência Criativa
            </label>
            <select
              className="form-input"
              value={selectedSquadId}
              onChange={handleSquadChange}
            >
              {squads.map(s => (
                <option key={s.id} value={s.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {s.name} — ({s.projectTheme})
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Aluno */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Identificação do Integrante
            </label>
            <select
              className="form-input"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {squadMembers.map(m => (
                <option key={m.id} value={m.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {m.avatar} {m.name} — {m.role}
                </option>
              ))}
            </select>
          </div>

          {/* Dica do PIN para demonstração */}
          {currentMember && (
            <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>PIN de {currentMember.name}:</span>
              <button
                type="button"
                onClick={() => setPin(currentMember.pin)}
                style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              >
                Usar {currentMember.pin}
              </button>
            </div>
          )}

          {/* Campo de PIN */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Digite seu PIN de 4 Dígitos
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
            <span>Entrar na Sala da Sprint</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
