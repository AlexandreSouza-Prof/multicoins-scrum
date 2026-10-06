import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginPin from './components/Student/LoginPin';
import CoinDistribution from './components/Student/CoinDistribution';
import WalletCard from './components/Student/WalletCard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import CoordinatorDashboard from './components/Coordinator/CoordinatorDashboard';
import { storageService } from './services/storageService';
import { Send, Wallet, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('student'); // 'student' | 'teacher' | 'coordinator'
  const [studentAuth, setStudentAuth] = useState(null); // { student, squad, classId }
  const [studentSubTab, setStudentSubTab] = useState('distribute'); // 'distribute' | 'wallet'
  const [stateVersion, setStateVersion] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // Tema Claro e Escuro persistido
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('MULTICOINS_THEME');
      if (savedTheme) return savedTheme;
    } catch (e) {
      console.error(e);
    }
    return 'dark'; // Dark mode padrão
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('MULTICOINS_THEME', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Carregar sessão salva do aluno se existir
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem('MULTICOINS_STUDENT_SESSION');
      if (savedAuth) {
        setStudentAuth(JSON.parse(savedAuth));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLoginSuccess = (student, squad, classId) => {
    const authData = { student, squad, classId };
    setStudentAuth(authData);
    sessionStorage.setItem('MULTICOINS_STUDENT_SESSION', JSON.stringify(authData));
  };

  const handleLogoutStudent = () => {
    setStudentAuth(null);
    sessionStorage.removeItem('MULTICOINS_STUDENT_SESSION');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar todas as turmas, equipes e avaliações para o estado inicial de demonstração?')) {
      storageService.resetData();
      try {
        sessionStorage.removeItem('MULTICOINS_STUDENT_SESSION');
        sessionStorage.removeItem('MULTICOINS_TEACHER_AUTH');
        sessionStorage.removeItem('MULTICOINS_COORD_AUTH');
      } catch (e) {
        console.error(e);
      }
      setStudentAuth(null);
      setIsTeacherAuthenticated(false);
      setIsCoordinatorAuthenticated(false);
      setResetKey(k => k + 1);
      setStateVersion(v => v + 1);
    }
  };

  const handleDataChanged = () => {
    setStateVersion(v => v + 1);
  };

  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('MULTICOINS_TEACHER_AUTH') === 'true';
    } catch {
      return false;
    }
  });

  const handleTeacherLoginSuccess = () => {
    try {
      sessionStorage.setItem('MULTICOINS_TEACHER_AUTH', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsTeacherAuthenticated(true);
  };

  const handleLogoutTeacher = () => {
    try {
      sessionStorage.removeItem('MULTICOINS_TEACHER_AUTH');
    } catch (e) {
      console.error(e);
    }
    setIsTeacherAuthenticated(false);
  };

  // Autenticação da Coordenação Pedagógica
  const [isCoordinatorAuthenticated, setIsCoordinatorAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('MULTICOINS_COORD_AUTH') === 'true';
    } catch {
      return false;
    }
  });

  const handleCoordinatorLoginSuccess = () => {
    try {
      sessionStorage.setItem('MULTICOINS_COORD_AUTH', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsCoordinatorAuthenticated(true);
  };

  const handleLogoutCoordinator = () => {
    try {
      sessionStorage.removeItem('MULTICOINS_COORD_AUTH');
    } catch (e) {
      console.error(e);
    }
    setIsCoordinatorAuthenticated(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentStudent={studentAuth?.student}
        onLogoutStudent={handleLogoutStudent}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onLogoutTeacher={handleLogoutTeacher}
        isCoordinatorAuthenticated={isCoordinatorAuthenticated}
        onLogoutCoordinator={handleLogoutCoordinator}
        onResetData={handleResetData}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-wrapper" key={resetKey}>
        {currentView === 'student' ? (
          !studentAuth ? (
            <LoginPin onLoginSuccess={handleLoginSuccess} />
          ) : (
            <div>
              {/* Abas do Aluno: Distribuir Moedas vs Ver Carteira */}
              <div style={{ maxWidth: '960px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setStudentSubTab('distribute')}
                    className={`btn ${studentSubTab === 'distribute' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Send size={16} />
                    <span>Avaliar Sprint (Distribuir Moedas)</span>
                  </button>
                  <button
                    onClick={() => setStudentSubTab('wallet')}
                    className={`btn ${studentSubTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Wallet size={16} />
                    <span>Minhas Moedas & Reconhecimentos</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Logado como: <strong style={{ color: 'var(--text-primary)' }}>{studentAuth.student.name}</strong> ({studentAuth.squad.name})
                </div>
              </div>

              {studentSubTab === 'distribute' ? (
                <CoinDistribution
                  student={studentAuth.student}
                  squad={studentAuth.squad}
                  classId={studentAuth.classId}
                  onSubmitted={handleDataChanged}
                />
              ) : (
                <WalletCard
                  student={studentAuth.student}
                  squad={studentAuth.squad}
                />
              )}
            </div>
          )
        ) : currentView === 'teacher' ? (
          <TeacherDashboard 
            onDataChanged={handleDataChanged} 
            isAuthenticated={isTeacherAuthenticated}
            onLoginSuccess={handleTeacherLoginSuccess}
            onLogout={handleLogoutTeacher} 
            stateVersion={stateVersion} 
          />
        ) : (
          <CoordinatorDashboard
            onDataChanged={handleDataChanged}
            isAuthenticated={isCoordinatorAuthenticated}
            onLoginSuccess={handleCoordinatorLoginSuccess}
            onLogout={handleLogoutCoordinator}
            stateVersion={stateVersion}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>MultiCoins Scrum • Plataforma de Avaliação por Pares em Metodologias Ágeis</div>
        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🛡️ <strong>Conformidade LGPD:</strong> Registros com finalidade estritamente formativa e pedagógica (Art. 7º, V da Lei 13.709/2018). Dados individuais confidenciais entre alunos.
        </div>
      </footer>
    </div>
  );
}
