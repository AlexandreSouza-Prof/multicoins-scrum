import React from 'react';
import { Coins, GraduationCap, Users, RefreshCw, LogOut, Sun, Moon, ShieldCheck } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  currentStudent, 
  onLogoutStudent, 
  isTeacherAuthenticated,
  onLogoutTeacher,
  isCoordinatorAuthenticated,
  onLogoutCoordinator,
  onResetData,
  theme,
  onToggleTheme
}) {
  const isCurrentViewAuthenticated = 
    (currentView === 'student' && !!currentStudent) ||
    (currentView === 'teacher' && isTeacherAuthenticated) ||
    (currentView === 'coordinator' && isCoordinatorAuthenticated);

  return (
    <header className="app-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="brand-badge">
            <div className="brand-logo-icon">
              <Coins size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>MultiCoins</span>{' '}
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Scrum</span>
              <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
                PEER ASSESSMENT • METODOLOGIAS ÁGEIS
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isCurrentViewAuthenticated ? (
            <div className="nav-pill-group">
              <button
                id="nav-student-btn"
                className={`nav-pill ${currentView === 'student' ? 'active' : ''}`}
                onClick={() => setCurrentView('student')}
              >
                <Users size={16} />
                Portal do Aluno
              </button>
              <button
                id="nav-teacher-btn"
                className={`nav-pill ${currentView === 'teacher' ? 'active' : ''}`}
                onClick={() => setCurrentView('teacher')}
              >
                <GraduationCap size={16} />
                Painel do Instrutor
              </button>
              <button
                id="nav-coordinator-btn"
                className={`nav-pill ${currentView === 'coordinator' ? 'active' : ''}`}
                onClick={() => setCurrentView('coordinator')}
              >
                <ShieldCheck size={16} />
                Coordenação
              </button>
            </div>
          ) : (
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.55rem', 
                background: 'var(--bg-surface)', 
                padding: '0.4rem 1.05rem', 
                borderRadius: '9999px', 
                border: '1px solid var(--border-active)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {currentView === 'teacher' && (
                <>
                  <GraduationCap size={17} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Painel do Instrutor
                  </span>
                </>
              )}
              {currentView === 'student' && (
                <>
                  <Users size={17} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Portal do Aluno
                  </span>
                </>
              )}
              {currentView === 'coordinator' && (
                <>
                  <ShieldCheck size={17} color="var(--accent-amber)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Coordenação Pedagógica
                  </span>
                </>
              )}
            </div>
          )}

          {currentView === 'student' && currentStudent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface)', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '1.1rem' }}>{currentStudent.avatar}</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentStudent.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{currentStudent.role}</div>
              </div>
              <button
                onClick={onLogoutStudent}
                title="Trocar de Aluno"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {currentView === 'teacher' && isTeacherAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface)', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '1.1rem' }}>👨‍🏫</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Instrutor</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Sessão Ativa</div>
              </div>
              <button
                onClick={onLogoutTeacher}
                title="Sair do Painel do Instrutor"
                className="btn btn-secondary"
                style={{ 
                  padding: '0.25rem 0.55rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--accent-rose)', 
                  borderColor: 'rgba(244, 63, 94, 0.4)',
                  background: 'rgba(244, 63, 94, 0.08)',
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  marginLeft: '0.35rem'
                }}
              >
                <LogOut size={13} />
                <span>Sair</span>
              </button>
            </div>
          )}

          {currentView === 'coordinator' && isCoordinatorAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-surface)', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '1.1rem' }}>👔</span>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Coordenador</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>Sessão Ativa</div>
              </div>
              <button
                onClick={onLogoutCoordinator}
                title="Sair da Coordenação"
                className="btn btn-secondary"
                style={{ 
                  padding: '0.25rem 0.55rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--accent-rose)', 
                  borderColor: 'rgba(244, 63, 94, 0.4)',
                  background: 'rgba(244, 63, 94, 0.08)',
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  marginLeft: '0.35rem'
                }}
              >
                <LogOut size={13} />
                <span>Sair</span>
              </button>
            </div>
          )}

          {/* Botão de alternância Modo Claro / Escuro */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} color="#fbbf24" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#0284c7" />
                <span>Escuro</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            title="Restaurar dados de exemplo"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} />
            Reset Demo
          </button>
        </div>
      </div>
    </header>
  );
}
