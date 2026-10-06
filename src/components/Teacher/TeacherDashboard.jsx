import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogOut,
  Download, 
  PlusCircle, 
  Sparkles,
  QrCode,
  UserPlus,
  Users,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Search,
  Trash2,
  UserCheck,
  AlertTriangle,
  Plus,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { storageService } from '../../services/storageService';
import TeamThermometer from './TeamThermometer';

export default function TeacherDashboard({ onDataChanged, isAuthenticated, onLoginSuccess, stateVersion }) {
  const teachers = storageService.getTeachers();
  const [currentTeacherId, setCurrentTeacherId] = useState(teachers[0]?.id || 'prof-alexandre');
  
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [localVersion, setLocalVersion] = useState(0);

  useEffect(() => {
    setLocalVersion(v => v + 1);
  }, [stateVersion]);

  // Turmas do professor logado (Isolamento Multi-Tenant)
  const teacherClasses = storageService.getClassesByTeacher(currentTeacherId);
  const [selectedClassId, setSelectedClassId] = useState(teacherClasses[0]?.id || '');
  
  const classSquads = storageService.getSquadsByClass(selectedClassId);
  const [selectedSquadId, setSelectedSquadId] = useState(classSquads[0]?.id || '');

  const activeSquad = classSquads.find(s => s.id === selectedSquadId) || classSquads[0];
  const squadSprints = activeSquad ? storageService.getSprintsBySquad(activeSquad.id) : [];
  const [selectedSprintId, setSelectedSprintId] = useState(squadSprints[0]?.id || '');

  // Modais
  const [showNewSprintModal, setShowNewSprintModal] = useState(false);
  const [newSprintTitle, setNewSprintTitle] = useState('');
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawStudentList, setRawStudentList] = useState('');
  const [importFeedback, setImportFeedback] = useState('');

  const [showQrModal, setShowQrModal] = useState(false);

  // Gestão e Alocação de Alunos
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSquadFilter, setStudentSquadFilter] = useState('all');
  const [importTargetSquadId, setImportTargetSquadId] = useState('');
  const [showCreateSquadSection, setShowCreateSquadSection] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadTheme, setNewSquadTheme] = useState('');
  const [allocationFeedback, setAllocationFeedback] = useState('');

  // Intervenção Pedagógica (Opção 2)
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionType, setInterventionType] = useState('Realinhamento de Papéis no Scrum');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [interventionFeedback, setInterventionFeedback] = useState('');

  // Sincronizar ao trocar de professor (Demonstração Multi-Tenant)
  const handleTeacherSwitch = (newTeacherId) => {
    setCurrentTeacherId(newTeacherId);
    const classes = storageService.getClassesByTeacher(newTeacherId);
    const firstClassId = classes[0]?.id || '';
    setSelectedClassId(firstClassId);
    
    const squads = storageService.getSquadsByClass(firstClassId);
    const firstSquadId = squads[0]?.id || '';
    setSelectedSquadId(firstSquadId);

    const sprints = firstSquadId ? storageService.getSprintsBySquad(firstSquadId) : [];
    setSelectedSprintId(sprints[0]?.id || '');
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    const squads = storageService.getSquadsByClass(classId);
    const firstSquadId = squads[0]?.id || '';
    setSelectedSquadId(firstSquadId);

    const sprints = firstSquadId ? storageService.getSprintsBySquad(firstSquadId) : [];
    setSelectedSprintId(sprints[0]?.id || '');
  };

  const handleSquadChange = (e) => {
    const sqId = e.target.value;
    setSelectedSquadId(sqId);
    const sprints = storageService.getSprintsBySquad(sqId);
    setSelectedSprintId(sprints[0]?.id || '');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = storageService.loginTeacher(currentTeacherId, password);
    if (res.success) {
      setPassword('');
      if (onLoginSuccess) onLoginSuccess();
      if (onDataChanged) onDataChanged();
    } else {
      setLoginError(res.message);
    }
  };

  const handleCreateSprint = (e) => {
    e.preventDefault();
    if (!newSprintTitle.trim() || !activeSquad) return;
    const created = storageService.createSprint(activeSquad.id, newSprintTitle.trim());
    setNewSprintTitle('');
    setShowNewSprintModal(false);
    setSelectedSprintId(created.id);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleToggleSprint = (sprintId) => {
    storageService.toggleSprintStatus(sprintId);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleToggleExcused = (studentId) => {
    if (!selectedSprintId) return;
    storageService.toggleStudentExcused(selectedSprintId, studentId);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleToggleCommentApproval = (evalId) => {
    storageService.toggleCommentApproval(evalId);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleImportStudents = (e) => {
    e.preventDefault();
    if (!rawStudentList.trim() || !selectedClassId) return;
    const added = storageService.importStudentsBatch(selectedClassId, rawStudentList, importTargetSquadId);
    setImportFeedback(`${added.length} alunos cadastrados com sucesso na turma!`);
    setRawStudentList('');
    setImportTargetSquadId('');
    setTimeout(() => {
      setShowImportModal(false);
      setImportFeedback('');
    }, 1500);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleAssignStudent = (studentId, squadId, role) => {
    storageService.assignStudentToSquad(studentId, squadId, role);
    setAllocationFeedback('Alocação atualizada com sucesso!');
    setTimeout(() => setAllocationFeedback(''), 2000);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteStudent = (studentId, name) => {
    if (window.confirm(`Deseja remover o aluno "${name}" desta turma?`)) {
      storageService.deleteStudent(studentId);
      setAllocationFeedback(`Aluno "${name}" removido.`);
      setTimeout(() => setAllocationFeedback(''), 2000);
      setLocalVersion(v => v + 1);
      if (onDataChanged) onDataChanged();
    }
  };

  const handleCreateNewSquad = (e) => {
    e.preventDefault();
    if (!newSquadName.trim() || !selectedClassId) return;
    const created = storageService.createSquad(currentTeacherId, selectedClassId, newSquadName.trim(), newSquadTheme.trim());
    setNewSquadName('');
    setNewSquadTheme('');
    setShowCreateSquadSection(false);
    setSelectedSquadId(created.id);
    setAllocationFeedback(`Equipe "${created.name}" criada com sucesso!`);
    setTimeout(() => setAllocationFeedback(''), 2500);
    setLocalVersion(v => v + 1);
    if (onDataChanged) onDataChanged();
  };

  const handleExportCSV = () => {
    const csvData = storageService.generateCSVReport(currentTeacherId);
    const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `multicoins_relatorio_${currentTeacherId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulações didáticas
  const handleSimulateScenario = (scenarioType) => {
    if (!activeSquad || !selectedSprintId) return;
    const state = storageService.getState();
    const members = activeSquad.members;
    if (members.length < 2) return;

    state.evaluations = state.evaluations.filter(e => !(e.sprintId === selectedSprintId && e.squadId === activeSquad.id));

    if (scenarioType === 'overload') {
      const target = members[0];
      members.slice(1).forEach((evaluator, idx) => {
        state.evaluations.push({
          id: `sim-ov-${Date.now()}-${idx}-1`,
          teacherId: currentTeacherId,
          sprintId: selectedSprintId,
          squadId: activeSquad.id,
          fromStudentId: evaluator.studentId,
          toStudentId: target.studentId,
          coins: 60,
          tags: ['deadline', 'proactivity', 'art_direction'],
          comment: 'Fez grande parte do projeto para garantir a entrega da Sprint.',
          isApproved: true,
          createdAt: new Date().toISOString(),
        });
        if (members.length > 2) {
          state.evaluations.push({
            id: `sim-ov-${Date.now()}-${idx}-2`,
            teacherId: currentTeacherId,
            sprintId: selectedSprintId,
            squadId: activeSquad.id,
            fromStudentId: evaluator.studentId,
            toStudentId: members[idx === 0 ? 2 : 1].studentId,
            coins: 40,
            tags: ['teamwork'],
            comment: 'Apoiou nas entregas.',
            isApproved: true,
            createdAt: new Date().toISOString(),
          });
        }
      });
    } else if (scenarioType === 'balanced') {
      members.forEach((evaluator, idx) => {
        const peers = members.filter(m => m.studentId !== evaluator.studentId);
        const perPeer = Math.floor(100 / peers.length);
        peers.forEach((peer, pIdx) => {
          state.evaluations.push({
            id: `sim-bal-${Date.now()}-${idx}-${pIdx}`,
            teacherId: currentTeacherId,
            sprintId: selectedSprintId,
            squadId: activeSquad.id,
            fromStudentId: evaluator.studentId,
            toStudentId: peer.studentId,
            coins: perPeer,
            tags: ['teamwork', 'deadline'],
            comment: 'Excelente cooperação e cumprimento das entregas Scrum.',
            isApproved: true,
            createdAt: new Date().toISOString(),
          });
        });
      });
    }

    storageService.saveState(state);
    if (onDataChanged) onDataChanged();
  };

  // Se não estiver logado, exibe tela de login do professor
  if (!isAuthenticated) {
    const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];

    return (
      <div style={{ maxWidth: '460px', margin: '3rem auto' }} className="fade-in">
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--accent-cyan)' }}>
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Acesso do Instrutor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Ambiente pedagógico com isolamento multi-tenant
          </p>

          {/* Seletor de Professor Multi-Tenant */}
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Selecione o Professor Responsável
            </label>
            <select
              className="form-input"
              value={currentTeacherId}
              onChange={(e) => setCurrentTeacherId(e.target.value)}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--accent-rose)', padding: '0.65rem 1rem', borderRadius: '12px', fontSize: '0.85rem', margin: '1.25rem 0' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ textAlign: 'center' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Senha padrão para demonstração: <strong style={{ color: 'var(--accent-cyan)' }}>admin123</strong>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem' }}>
              <span>Entrar no Painel de {currentTeacher.name}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);
  const currentClass = teacherClasses.find(c => c.id === selectedClassId);
  const currentSprint = squadSprints.find(s => s.id === selectedSprintId) || squadSprints[0];
  const thermometerData = activeSquad && currentSprint ? storageService.getSquadThermometer(currentSprint.id, activeSquad.id) : null;
  const squadInterventions = activeSquad ? storageService.getSquadInterventions(activeSquad.id) : [];

  const handleOpenInterventionModal = () => {
    setInterventionType('Realinhamento de Papéis no Scrum');
    setInterventionNotes('');
    setInterventionFeedback('');
    setShowInterventionModal(true);
  };

  const handleSaveIntervention = (e) => {
    e.preventDefault();
    if (!interventionNotes.trim() || !activeSquad) return;
    storageService.recordIntervention({
      squadId: activeSquad.id,
      sprintId: currentSprint?.id,
      actionType: interventionType,
      notes: interventionNotes,
      teacherId: currentTeacherId,
    });
    setInterventionFeedback('Intervenção pedagógica registrada com sucesso!');
    setInterventionNotes('');
    if (onDataChanged) onDataChanged();
    setTimeout(() => {
      setInterventionFeedback('');
      setShowInterventionModal(false);
    }, 1200);
  };

  // Alunos e Alocação na Turma
  const classStudentsWithAlloc = storageService.getStudentsWithAllocation(selectedClassId);
  const unallocatedStudents = classStudentsWithAlloc.filter(s => !s.squadId);
  const unallocatedCount = unallocatedStudents.length;

  const filteredStudents = classStudentsWithAlloc.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (studentSquadFilter === 'unallocated') return !st.squadId;
    if (studentSquadFilter !== 'all') return st.squadId === studentSquadFilter;
    return true;
  });

  // URL para acesso de outros dispositivos (rede Wi-Fi local ou túnel público)
  const localShareUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? window.location.origin 
    : 'http://192.168.100.45:5173';

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Bar de Gestão e Ações Multi-Tenant */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                PROFESSOR: {currentTeacher?.name.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {currentClass ? currentClass.currentUC : 'Nenhuma turma'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Painel de Gestão & Termômetro Ágil
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setShowQrModal(true)} className="btn btn-secondary" title="Projetar QR Code para a turma">
              <QrCode size={16} />
              <span>QR Code da Sala</span>
            </button>
            <button onClick={() => setShowImportModal(true)} className="btn btn-secondary" title="Importar chamada em lote">
              <UserPlus size={16} />
              <span>Importar Alunos</span>
            </button>
            <button 
              onClick={() => setShowManageStudentsModal(true)} 
              className={`btn ${unallocatedCount > 0 ? 'btn-primary' : 'btn-secondary'}`}
              title="Gerenciar e distribuir alunos nas equipes"
            >
              <Users size={16} />
              <span>Alocar Alunos</span>
              {unallocatedCount > 0 && (
                <span style={{ 
                  background: 'var(--accent-amber)', 
                  color: '#0f172a', 
                  fontSize: '0.7rem', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '9999px', 
                  fontWeight: 800,
                  marginLeft: '0.25rem'
                }}>
                  {unallocatedCount} sem equipe
                </span>
              )}
            </button>
            <button onClick={handleExportCSV} className="btn btn-secondary">
              <Download size={16} />
              <span>Exportar CSV</span>
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary" title="Imprimir / Salvar PDF Executivo (A4)">
              <Printer size={16} />
              <span>Imprimir / PDF</span>
            </button>
            <button onClick={() => setShowNewSprintModal(true)} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Nova Sprint</span>
            </button>
          </div>
        </div>

        {/* Seletores: Professor (Multi-tenant), Turma, Equipe e Sprint */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          {/* Seletor do Professor Ativo (demonstra isolamento) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
              Ambiente do Instrutor (Tenant)
            </label>
            <select className="form-input" value={currentTeacherId} onChange={(e) => handleTeacherSwitch(e.target.value)}>
              {teachers.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Turma Selecionada
            </label>
            <select className="form-input" value={selectedClassId} onChange={handleClassChange}>
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Equipe / Squad
            </label>
            <select className="form-input" value={selectedSquadId} onChange={handleSquadChange}>
              {classSquads.map(s => (
                <option key={s.id} value={s.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Sprint Analisada
            </label>
            <select className="form-input" value={selectedSprintId} onChange={(e) => setSelectedSprintId(e.target.value)}>
              {squadSprints.map(s => (
                <option key={s.id} value={s.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {s.title} ({s.status === 'active' ? '● Ativa' : 'Encerrada'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status da Sprint selecionada */}
        {currentSprint && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Status da rodada: <strong style={{ color: currentSprint.status === 'active' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>{currentSprint.status === 'active' ? 'Aberta para envio dos alunos' : 'Encerrada pelo professor'}</strong>
            </span>
            <button
              onClick={() => handleToggleSprint(currentSprint.id)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              {currentSprint.status === 'active' ? 'Encerrar Rodada' : 'Reabrir Rodada'}
            </button>
          </div>
        )}

        {/* Banner de Alerta para Alunos Sem Equipe */}
        {unallocatedCount > 0 && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="var(--accent-amber)" />
              </div>
              <div>
                <strong style={{ color: 'var(--accent-amber)', fontSize: '0.95rem' }}>
                  {unallocatedCount} aluno(s) aguardando equipe nesta turma
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Alunos importados só conseguem acessar o portal e avaliar após serem distribuídos em uma Equipe/Squad.
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setStudentSquadFilter('unallocated');
                setShowManageStudentsModal(true);
              }}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <span>Distribuir nas Equipes</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Caixa de Ferramentas de Simulação Rápida */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Simulador de Diagnóstico Rápido:</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Teste o termômetro com 1 clique</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSimulateScenario('balanced')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}
            >
              ● Simular Equilíbrio
            </button>
            <button
              onClick={() => handleSimulateScenario('overload')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--accent-amber)' }}
            >
              ● Simular Sobrecarga
            </button>
          </div>
        </div>
      </div>

      {/* Exibição do Termômetro da Equipe com Autoavaliação e Ausências */}
      <TeamThermometer 
        thermometerData={thermometerData} 
        onToggleExcused={handleToggleExcused}
        onOpenInterventionModal={handleOpenInterventionModal}
      />

      {/* Matriz de Transparência 360° com Moderação de Comentários */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Auditoria & Moderação Pedagógica
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Matriz Detalhada de Transferências
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Visível apenas para você: acompanhe feedbacks e controle a exibição no mural dos alunos com 1 clique.
            </p>
          </div>
        </div>

        {thermometerData?.rawEvaluations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhuma avaliação registrada ainda para esta Sprint.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Avaliador</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Avaliado</th>
                  <th style={{ padding: '0.75rem 1rem' }}>MultiCoins</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Competências</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Feedback</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Moderação</th>
                </tr>
              </thead>
              <tbody>
                {thermometerData?.rawEvaluations.map((ev) => {
                  const fromStudent = storageService.getStudentById(ev.fromStudentId);
                  const toStudent = storageService.getStudentById(ev.toStudentId);
                  const tags = storageService.getCompetencyTags().filter(t => ev.tags.includes(t.id));

                  return (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {fromStudent ? `${fromStudent.avatar} ${fromStudent.name}` : ev.fromStudentId}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-cyan)' }}>
                        {toStudent ? `${toStudent.avatar} ${toStudent.name}` : ev.toStudentId}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-coin)' }}>
                        🪙 {ev.coins}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {tags.map(t => (
                            <span key={t.id} style={{ background: 'var(--bg-surface)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontStyle: ev.comment ? 'italic' : 'normal' }}>
                        {ev.comment || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {ev.comment ? (
                          <button
                            onClick={() => handleToggleCommentApproval(ev.id)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.75rem',
                              color: ev.isApproved ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                            }}
                            title={ev.isApproved ? 'Comentário visível no mural do aluno (clique para ocultar)' : 'Comentário ocultado pelo professor (clique para aprovar)'}
                          >
                            {ev.isApproved ? <Eye size={14} /> : <EyeOff size={14} />}
                            <span>{ev.isApproved ? 'Aprovado' : 'Oculto'}</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: QR CODE PARA A SALA DE AULA */}
      {showQrModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowQrModal(false); }}>
          <div className="glass-panel modal-dialog" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              QR Code de Acesso Rápido
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Projete este código na lousa. Os alunos apontam a câmera do celular e abrem o portal na hora!
            </p>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', marginBottom: '1.25rem' }}>
              <QRCodeSVG value={localShareUrl} size={220} level="M" />
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Link na rede Wi-Fi: <strong style={{ color: 'var(--accent-cyan)' }}>{localShareUrl}</strong>
            </div>

            <button onClick={() => setShowQrModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
              Fechar Projeção
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORTAÇÃO EM LOTE DE ALUNOS */}
      {showImportModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowImportModal(false); }}>
          <div className="glass-panel modal-dialog" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Importar Alunos em Lote
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Cole a lista de chamada da turma (um aluno por linha). Se não especificar PIN, ele será gerado automaticamente.
            </p>

            {importFeedback && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {importFeedback}
              </div>
            )}

            <form onSubmit={handleImportStudents}>
              <div style={{ marginBottom: '1rem' }}>
                <textarea
                  rows={7}
                  placeholder={`Lucas Silva\nBeatriz Santos, 2345\nMatheus Oliveira\nClara Mendes`}
                  value={rawStudentList}
                  onChange={(e) => setRawStudentList(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Alocar diretamente em uma equipe (opcional):
                </label>
                <select
                  className="form-input"
                  value={importTargetSquadId}
                  onChange={(e) => setImportTargetSquadId(e.target.value)}
                >
                  <option value="">Deixar sem equipe (alocar depois no botão "Alocar Alunos")</option>
                  {classSquads.map(sq => (
                    <option key={sq.id} value={sq.id}>Distribuir em: {sq.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!rawStudentList.trim()}
                >
                  Cadastrar Alunos na Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOVA SPRINT */}
      {showNewSprintModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowNewSprintModal(false); }}>
          <div className="glass-panel modal-dialog" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Iniciar Nova Sprint de Avaliação
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Ao abrir uma nova Sprint para a equipe <strong>{activeSquad?.name}</strong>, a anterior será arquivada e os alunos receberão 100 novas MultiCoins.
            </p>

            <form onSubmit={handleCreateSprint}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Título / Objetivo da Sprint
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sprint 3: Produção dos Teasers e Motion"
                  value={newSprintTitle}
                  onChange={(e) => setNewSprintTitle(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewSprintModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newSprintTitle.trim()}
                >
                  Criar e Abrir Rodada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GESTÃO & ALOCAÇÃO DE ALUNOS NAS EQUIPES */}
      {showManageStudentsModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowManageStudentsModal(false); }}>
          <div className="glass-panel modal-dialog" style={{ maxWidth: '960px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '1.75rem 2rem' }}>
            {/* Header do Modal */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={22} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Alocação de Alunos nas Equipes (Squads)
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Turma: <strong style={{ color: 'var(--text-primary)' }}>{currentClass?.name}</strong> • Alunos precisam estar em um Squad para avaliar e receber MultiCoins.
                </p>
              </div>
              <button 
                onClick={() => setShowManageStudentsModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                ✕ Fechar
              </button>
            </div>

            {/* Alerta de Feedback de Ação */}
            {allocationFeedback && (
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                <span>{allocationFeedback}</span>
              </div>
            )}

            {/* Badges de Contagem */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total na Turma</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{classStudentsWithAlloc.length} alunos</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Alocados em Equipes</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{classStudentsWithAlloc.length - unallocatedCount} alunos</div>
              </div>
              <div style={{ background: unallocatedCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '10px', border: unallocatedCount > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: unallocatedCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>Aguardando Equipe</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: unallocatedCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>{unallocatedCount} alunos</div>
              </div>
            </div>

            {/* Barra de Filtros e Busca + Botão Criar Nova Equipe */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar aluno por nome..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.2rem', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  className="form-input"
                  style={{ fontSize: '0.85rem', minWidth: '180px' }}
                  value={studentSquadFilter}
                  onChange={(e) => setStudentSquadFilter(e.target.value)}
                >
                  <option value="all">Filtrar: Todos ({classStudentsWithAlloc.length})</option>
                  <option value="unallocated">Filtrar: Sem Equipe ({unallocatedCount})</option>
                  {classSquads.map(sq => (
                    <option key={sq.id} value={sq.id}>Equipe: {sq.name}</option>
                  ))}
                </select>

                <button 
                  onClick={() => setShowCreateSquadSection(!showCreateSquadSection)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Plus size={15} />
                  <span>{showCreateSquadSection ? 'Fechar Nova Equipe' : '+ Nova Equipe'}</span>
                </button>
              </div>
            </div>

            {/* Painel Expansível de Criação de Nova Equipe */}
            {showCreateSquadSection && (
              <form onSubmit={handleCreateNewSquad} style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-cyan)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                  Criar Nova Equipe / Squad para esta Turma
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Nome da Equipe</label>
                    <input
                      type="text"
                      placeholder="Ex: Neon Studio, Vertex Squad"
                      value={newSquadName}
                      onChange={(e) => setNewSquadName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tema / Projeto da Equipe</label>
                    <input
                      type="text"
                      placeholder="Ex: Videoclipe e Motion Graphics"
                      value={newSquadTheme}
                      onChange={(e) => setNewSquadTheme(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowCreateSquadSection(false)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                    Criar Equipe com Sprint 1
                  </button>
                </div>
              </form>
            )}

            {/* Tabela de Alunos com Rolagem Suave */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
              {filteredStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Nenhum aluno encontrado para os filtros selecionados.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Aluno</th>
                      <th style={{ padding: '0.75rem 1rem' }}>PIN de Acesso</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Equipe / Squad</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Papel no Scrum</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: !st.squadId ? 'rgba(245, 158, 11, 0.04)' : 'transparent' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{st.avatar}</span>
                            <span>{st.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            background: 'var(--bg-surface)', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '6px', 
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--accent-cyan)',
                            fontWeight: 700
                          }}>
                            {st.pin}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            className="form-input"
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.82rem',
                              border: !st.squadId ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                              color: !st.squadId ? 'var(--accent-amber)' : 'var(--text-primary)',
                              fontWeight: !st.squadId ? 700 : 500
                            }}
                            value={st.squadId || ''}
                            onChange={(e) => handleAssignStudent(st.id, e.target.value, st.role)}
                          >
                            <option value="">⚠️ Sem Equipe (Aguardando)</option>
                            {classSquads.map(sq => (
                              <option key={sq.id} value={sq.id} style={{ color: 'var(--text-primary)' }}>
                                {sq.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select
                            className="form-input"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                            value={st.role || 'Integrante de Equipe'}
                            onChange={(e) => handleAssignStudent(st.id, st.squadId, e.target.value)}
                          >
                            <option value="Integrante de Equipe">Integrante de Equipe</option>
                            <option value="Product Owner">Product Owner</option>
                            <option value="Scrum Master">Scrum Master</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="Direção de Arte & Design">Direção de Arte & Design</option>
                            <option value="Edição & Pós-Produção">Edição & Pós-Produção</option>
                            <option value="Roteiro & Storytelling">Roteiro & Storytelling</option>
                            <option value="Ilustração & Concept">Ilustração & Concept</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="btn btn-secondary"
                            title="Remover aluno da turma"
                            style={{ padding: '0.3rem 0.5rem', color: 'var(--accent-rose)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                💡 Todas as alocações e mudanças de cargo são salvas automaticamente em tempo real.
              </span>
              <button
                onClick={() => setShowManageStudentsModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Concluir Alocação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: INTERVENÇÃO PEDAGÓGICA */}
      {showInterventionModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowInterventionModal(false); }}>
          <div className="glass-panel modal-dialog" style={{ maxWidth: '640px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '1.75rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={22} color="var(--accent-amber)" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Intervenção Pedagógica Ágil
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Equipe: <strong style={{ color: 'var(--text-primary)' }}>{activeSquad?.name}</strong> • Registro formativo de mediação ou alinhamento.
                </p>
              </div>
              <button onClick={() => setShowInterventionModal(false)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                ✕ Fechar
              </button>
            </div>

            {interventionFeedback && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                <span>{interventionFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveIntervention} style={{ marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Tipo de Ação / Intervenção
                </label>
                <select
                  className="form-input"
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                >
                  <option value="Realinhamento de Papéis no Scrum">Realinhamento de Papéis no Scrum</option>
                  <option value="Reunião 1-on-1 com Aluno">Reunião 1-on-1 com Aluno</option>
                  <option value="Mediação de Conflito Interno">Mediação de Conflito Interno</option>
                  <option value="Mentoria Técnica & Suporte">Mentoria Técnica & Suporte</option>
                  <option value="Ajuste de Escopo do Projeto">Ajuste de Escopo do Projeto</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Diagnóstico & Plano de Ação Pedagógico *
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o que foi acordado com a equipe ou aluno para sanar o desequilíbrio..."
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button type="button" onClick={() => setShowInterventionModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!interventionNotes.trim()}>
                  Registrar no Histórico
                </button>
              </div>
            </form>

            {/* Histórico das Intervenções Anteriores deste Squad */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', overflowY: 'auto', flex: 1 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Histórico de Intervenções Desta Equipe ({squadInterventions.length})
              </h4>
              {squadInterventions.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  Nenhuma intervenção anterior registrada para esta equipe.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {squadInterventions.map((int) => (
                    <div key={int.id} style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>{int.actionType}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(int.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {int.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
