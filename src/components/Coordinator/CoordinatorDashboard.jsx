import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Coins, 
  Activity, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Building2, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  KeyRound, 
  X,
  BookOpen
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function CoordinatorDashboard({ 
  isAuthenticated, 
  onLoginSuccess, 
  onLogout,
  onDataChanged, 
  stateVersion 
}) {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados do Dashboard
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'teachers'
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState(null);

  // Modal de Professor (Criar / Editar)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Carregar dados e métricas
  const loadData = () => {
    const data = storageService.getInstitutionalMetrics();
    setMetrics(data);
  };

  useEffect(() => {
    loadData();
  }, [stateVersion, isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = storageService.loginCoordinator(passwordInput);
    if (res.success) {
      onLoginSuccess();
      setPasswordInput('');
    } else {
      setAuthError(res.message || 'Senha incorreta.');
    }
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingTeacher(null);
    setTeacherFormData({
      name: '',
      email: '',
      department: '',
      password: 'admin123',
    });
    setFormError('');
    setIsTeacherModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department || '',
      password: teacher.password || 'admin123',
    });
    setFormError('');
    setIsTeacherModalOpen(true);
  };

  // Salvar Professor
  const handleSaveTeacher = (e) => {
    e.preventDefault();
    setFormError('');

    if (!teacherFormData.name.trim() || !teacherFormData.email.trim()) {
      setFormError('Por favor, preencha o nome e o e-mail do professor.');
      return;
    }

    if (editingTeacher) {
      const res = storageService.updateTeacher(editingTeacher.id, teacherFormData);
      if (res.success) {
        setIsTeacherModalOpen(false);
        setFeedbackMsg({ type: 'success', text: `Professor "${teacherFormData.name}" atualizado com sucesso!` });
        if (onDataChanged) onDataChanged();
        loadData();
      } else {
        setFormError(res.message);
      }
    } else {
      const res = storageService.createTeacher(teacherFormData);
      if (res.success) {
        setIsTeacherModalOpen(false);
        setFeedbackMsg({ type: 'success', text: `Novo professor "${teacherFormData.name}" cadastrado com sucesso!` });
        if (onDataChanged) onDataChanged();
        loadData();
      } else {
        setFormError(res.message);
      }
    }
  };

  // Excluir Professor
  const handleDeleteTeacher = (teacher) => {
    if (window.confirm(`Tem certeza que deseja remover o professor "${teacher.name}"?`)) {
      const res = storageService.deleteTeacher(teacher.id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `Professor "${teacher.name}" removido com sucesso.` });
        if (onDataChanged) onDataChanged();
        loadData();
      } else {
        alert(res.message);
      }
    }
  };

  // Exportar Relatório Geral CSV
  const handleExportCSV = () => {
    const csv = storageService.generateInstitutionalCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `relatorio_institucional_multicoins_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-fechar feedback temporário
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // Se não estiver autenticado, exibir tela de senha
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 1.5rem auto', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.4))', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            <ShieldCheck size={34} color="var(--accent-amber)" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Acesso da Coordenação
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Painel institucional restrito à liderança pedagógica e supervisão de cursos.
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Senha de Acesso Mestre
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Digite a senha institucional..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                  autoFocus
                />
                <KeyRound size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {authError && (
              <div style={{ 
                background: 'rgba(244, 63, 94, 0.1)', 
                border: '1px solid rgba(244, 63, 94, 0.3)', 
                borderRadius: '8px', 
                padding: '0.6rem 0.8rem', 
                color: 'var(--accent-rose)', 
                fontSize: '0.82rem', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertTriangle size={15} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }}
            >
              Entrar no Painel de Coordenação
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            🔑 Dica para ambiente de demonstração: <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Filtragem de professores e turmas
  const filteredTeachers = metrics.teacherBreakdown.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Banner / Header da Coordenação */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.45))', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.5)'
            }}>
              <ShieldCheck size={28} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                  Painel da Coordenação Pedagógica
                </h1>
                <span style={{ 
                  background: 'rgba(245, 158, 11, 0.15)', 
                  color: 'var(--accent-amber)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.72rem', 
                  fontWeight: 700 
                }}>
                  Superadmin
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Supervisão de cursos, alocação docente e governança ágil MultiCoins.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              title="Baixar planilha consolidada de todas as turmas e docentes"
            >
              <Download size={16} />
              <span>Exportar Relatório Geral (CSV)</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Cadastrar Professor</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div style={{ 
            marginTop: '1.25rem', 
            background: 'rgba(16, 185, 129, 0.12)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: '10px', 
            padding: '0.75rem 1rem', 
            color: 'var(--accent-emerald)', 
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={17} />
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Grid de Métricas Macro (KPI Cards) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.75rem' 
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Corpo Docente</span>
            <GraduationCap size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalTeachers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Professores ativos</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Turmas</span>
            <BookOpen size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalClasses}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Turmas cadastradas</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Equipes / Squads</span>
            <Users size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalSquads}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Times de projetos</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alunos Totais</span>
            <Layers size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.totalStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Estudantes avaliados</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>MultiCoins</span>
            <Coins size={18} color="var(--accent-coin)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-coin)' }}>
            {metrics.totalCoinsCirculated}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Moedas distribuídas</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saúde dos Squads</span>
            <Activity size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {metrics.institutionalHealthRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Taxa de equipes saudáveis</div>
        </div>
      </div>

      {/* Barra de Abas e Busca */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Building2 size={16} />
            <span>Panorama Geral & Turmas</span>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <GraduationCap size={16} />
            <span>Corpo Docente ({metrics.totalTeachers})</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Buscar por professor ou depto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              background: 'var(--bg-inner)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Conteúdo Aba 1: Panorama Geral & Turmas */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    background: 'var(--bg-surface)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    👨‍🏫
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {teacher.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                      <span>✉️ {teacher.email}</span>
                      <span>🏢 {teacher.department}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--bg-surface)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    📚 <strong>{teacher.classesCount}</strong> turmas
                  </span>
                  <span style={{ background: 'var(--bg-surface)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    👥 <strong>{teacher.squadsCount}</strong> equipes
                  </span>
                  <span style={{ background: 'var(--bg-surface)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    🎓 <strong>{teacher.studentsCount}</strong> alunos
                  </span>
                  <span style={{ background: 'var(--bg-surface)', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--accent-coin)' }}>
                    🪙 <strong>{teacher.coinsCirculated}</strong> moedas
                  </span>
                </div>
              </div>

              {/* Lista das Turmas do Professor */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  Turmas Vinculadas ({teacher.classes.length})
                </h4>

                {teacher.classes.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-inner)', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Nenhuma turma atribuída a este professor até o momento.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                    {teacher.classes.map(cls => (
                      <div 
                        key={cls.id} 
                        style={{ 
                          background: 'var(--bg-inner)', 
                          border: '1px solid var(--border-subtle)', 
                          borderRadius: '12px', 
                          padding: '1rem' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cls.name}</strong>
                          <span style={{ fontSize: '0.72rem', background: 'var(--bg-surface)', padding: '0.15rem 0.45rem', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                            {cls.year}º Ano
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                          📖 {cls.currentUC}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredTeachers.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum professor encontrado com o termo pesquisado.
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 2: Gestão do Corpo Docente */}
      {activeTab === 'teachers' && (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Professores Cadastrados
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Total: {filteredTeachers.length} docentes
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Docente</th>
                <th style={{ padding: '0.75rem 1rem' }}>E-mail</th>
                <th style={{ padding: '0.75rem 1rem' }}>Departamento</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Turmas</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Alunos</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>👨‍🏫</span>
                      <span>{teacher.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                    {teacher.email}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                    <span style={{ background: 'var(--bg-surface)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {teacher.department}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                    {teacher.classesCount}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                    {teacher.studentsCount}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(teacher)}
                        title="Editar Professor"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher)}
                        title="Remover Professor"
                        className="btn btn-secondary"
                        style={{ 
                          padding: '0.35rem 0.6rem', 
                          fontSize: '0.78rem',
                          color: 'var(--accent-rose)',
                          borderColor: 'rgba(244, 63, 94, 0.3)',
                          background: 'rgba(244, 63, 94, 0.05)'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastrar / Editar Professor */}
      {isTeacherModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsTeacherModalOpen(false); }}>
          <div className="glass-panel modal-dialog" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={22} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {editingTeacher ? 'Editar Professor' : 'Cadastrar Novo Professor'}
                </h3>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prof. Carlos Eduardo"
                  value={teacherFormData.name}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  E-mail Institucional *
                </label>
                <input
                  type="email"
                  placeholder="Ex: carlos.eduardo@escola.edu.br"
                  value={teacherFormData.email}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Departamento / Área
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvimento & TI, Design, etc."
                  value={teacherFormData.department}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Senha de Acesso (Dica padrão: admin123)
                </label>
                <input
                  type="text"
                  placeholder="Senha para login do professor"
                  value={teacherFormData.password}
                  onChange={(e) => setTeacherFormData({ ...teacherFormData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              {formError && (
                <div style={{ 
                  background: 'rgba(244, 63, 94, 0.1)', 
                  border: '1px solid rgba(244, 63, 94, 0.3)', 
                  borderRadius: '8px', 
                  padding: '0.6rem 0.8rem', 
                  color: 'var(--accent-rose)', 
                  fontSize: '0.82rem', 
                  marginBottom: '1rem' 
                }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTeacher ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
