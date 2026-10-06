import { INITIAL_DATA, COMPETENCY_TAGS } from '../mock/initialData';

const STORAGE_KEY = 'MULTICOINS_SCRUM_STATE_V2';

export const storageService = {
  getState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler estado do localStorage:', e);
    }
    this.saveState(INITIAL_DATA);
    return INITIAL_DATA;
  },

  saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar estado no localStorage:', e);
    }
  },

  resetData() {
    this.saveState(INITIAL_DATA);
    return INITIAL_DATA;
  },

  getCompetencyTags() {
    return COMPETENCY_TAGS;
  },

  // --- MULTI-TENANT: PROFESSORES ---
  getTeachers() {
    return this.getState().teachers || [];
  },

  getCoordinator() {
    return this.getState().coordinator || {
      id: 'coord-geral',
      name: 'Coordenação Pedagógica',
      email: 'coordenacao@escola.edu.br',
      password: 'admin123',
      institution: 'Centro de Educação & Tecnologia',
    };
  },

  loginCoordinator(password) {
    const coord = this.getCoordinator();
    if (password === 'admin123' || password === 'coord123' || (coord && coord.password === password)) {
      return { success: true, coordinator: coord };
    }
    return { success: false, message: 'Senha de coordenação incorreta (Dica padrão: admin123).' };
  },

  createTeacher({ name, email, department, password }) {
    const state = this.getState();
    const newTeacher = {
      id: `prof-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department?.trim() || 'Educação Profissional & Projetos',
      password: password?.trim() || 'admin123',
    };
    state.teachers = state.teachers || [];
    state.teachers.push(newTeacher);
    this.saveState(state);
    return { success: true, teacher: newTeacher };
  },

  updateTeacher(teacherId, data) {
    const state = this.getState();
    const idx = (state.teachers || []).findIndex(t => t.id === teacherId);
    if (idx === -1) return { success: false, message: 'Professor não encontrado.' };

    state.teachers[idx] = {
      ...state.teachers[idx],
      name: data.name !== undefined ? data.name.trim() : state.teachers[idx].name,
      email: data.email !== undefined ? data.email.trim().toLowerCase() : state.teachers[idx].email,
      department: data.department !== undefined ? data.department.trim() : state.teachers[idx].department,
      password: data.password !== undefined && data.password ? data.password.trim() : state.teachers[idx].password,
    };
    this.saveState(state);
    return { success: true, teacher: state.teachers[idx] };
  },

  deleteTeacher(teacherId) {
    const state = this.getState();
    const hasClasses = (state.classes || []).some(c => c.teacherId === teacherId);
    if (hasClasses) {
      return {
        success: false,
        message: 'Não é possível excluir este professor pois ele possui turmas ativas vinculadas. Reatribua as turmas antes de remover.',
      };
    }
    state.teachers = (state.teachers || []).filter(t => t.id !== teacherId);
    this.saveState(state);
    return { success: true };
  },

  getInstitutionalMetrics() {
    const state = this.getState();
    const teachers = state.teachers || [];
    const classes = state.classes || [];
    const squads = state.squads || [];
    const students = state.students || [];
    const evaluations = state.evaluations || [];
    const sprints = state.sprints || [];

    const totalCoinsCirculated = evaluations.reduce((acc, curr) => acc + (Number(curr.coins) || 0), 0);

    // Saúde institucional dos squads baseada nos termômetros das sprints
    let healthyCount = 0;
    let totalAssessedSquads = 0;

    squads.forEach(sq => {
      const squadSprints = sprints.filter(sp => sp.squadId === sq.id);
      if (squadSprints.length > 0) {
        totalAssessedSquads++;
        const lastSprint = squadSprints[squadSprints.length - 1];
        const thermo = this.getSquadThermometer(lastSprint.id, sq.id);
        if (thermo && (thermo.healthStatus === 'healthy' || thermo.healthStatus === 'warning')) {
          healthyCount++;
        }
      }
    });

    const institutionalHealthRate = totalAssessedSquads > 0
      ? Math.round((healthyCount / totalAssessedSquads) * 100)
      : 100;

    // Detalhamento consolidado por Professor
    const teacherBreakdown = teachers.map(t => {
      const tClasses = classes.filter(c => c.teacherId === t.id);
      const classIds = tClasses.map(c => c.id);
      const tSquads = squads.filter(s => classIds.includes(s.classId));
      const squadIds = tSquads.map(s => s.id);
      const tStudents = students.filter(st => classIds.includes(st.classId));
      const tSprints = sprints.filter(sp => squadIds.includes(sp.squadId));
      const tActiveSprints = tSprints.filter(sp => sp.status === 'active');

      const tEvals = evaluations.filter(ev => squadIds.includes(ev.squadId));
      const tCoins = tEvals.reduce((acc, curr) => acc + (Number(curr.coins) || 0), 0);

      return {
        ...t,
        classesCount: tClasses.length,
        squadsCount: tSquads.length,
        studentsCount: tStudents.length,
        sprintsCount: tSprints.length,
        activeSprintsCount: tActiveSprints.length,
        coinsCirculated: tCoins,
        classes: tClasses,
      };
    });

    return {
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalSquads: squads.length,
      totalStudents: students.length,
      totalCoinsCirculated,
      totalSprints: sprints.length,
      activeSprintsCount: sprints.filter(s => s.status === 'active').length,
      institutionalHealthRate,
      teacherBreakdown,
    };
  },

  generateInstitutionalCSV() {
    const metrics = this.getInstitutionalMetrics();
    let csv = 'Professor,Email,Departamento,Qtd Turmas,Qtd Squads,Qtd Alunos,Sprints Ativas,Moedas Distribuídas\n';

    metrics.teacherBreakdown.forEach(t => {
      const row = [
        `"${t.name}"`,
        `"${t.email}"`,
        `"${t.department}"`,
        t.classesCount,
        t.squadsCount,
        t.studentsCount,
        t.activeSprintsCount,
        t.coinsCirculated,
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  },

  loginTeacher(emailOrName, password) {
    const teachers = this.getTeachers();
    const query = emailOrName.trim().toLowerCase();

    // Compatibilidade com a senha padrão pedagógica ou busca pelo professor específico
    const teacher = teachers.find(
      t => (t.email.toLowerCase() === query || t.name.toLowerCase().includes(query) || t.id === query)
    );

    if (teacher && (teacher.password === password || password === 'admin123' || password === 'scrum123' || password === 'senai')) {
      return { success: true, teacher };
    }

    // Se digitou a senha mestra global sem escolher professor, loga com o primeiro
    if ((password === 'admin123' || password === 'scrum123' || password === 'senai' || password === 'senai2026') && teachers.length > 0) {
      return { success: true, teacher: teacher || teachers[0] };
    }

    return { success: false, message: 'Credenciais de instrutor inválidas (Dica padrão: admin123).' };
  },

  // --- TURMAS (ISOLADAS POR PROFESSOR) ---
  getClasses() {
    return this.getState().classes || [];
  },

  getClassesByTeacher(teacherId) {
    return this.getState().classes.filter(c => c.teacherId === teacherId);
  },

  createClass(teacherId, name, currentUC, year) {
    const state = this.getState();
    const newClass = {
      id: `class-${Date.now()}`,
      teacherId,
      name,
      currentUC,
      year: Number(year) || 2,
    };
    state.classes.push(newClass);
    this.saveState(state);
    return newClass;
  },

  // --- ALUNOS (LONGITUDINAIS) ---
  getStudentsByClass(classId) {
    return this.getState().students.filter(s => s.classId === classId);
  },

  getStudentById(studentId) {
    return this.getState().students.find(s => s.id === studentId);
  },

  // Importação em Lote de Alunos (Copia e Cola da Chamada / CSV)
  importStudentsBatch(classId, rawText, targetSquadId = '') {
    const state = this.getState();
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const added = [];

    const avatars = ['👨‍🎨', '👩‍💻', '🧑‍🎨', '👩‍🎨', '🧑‍💻', '🎬', '🎥', '✨', '🎧', '🎨'];
    const targetSquad = targetSquadId ? state.squads.find(s => s.id === targetSquadId) : null;

    lines.forEach((line, idx) => {
      // Suporta formato "Nome, PIN" ou apenas "Nome"
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const name = parts[0];
      if (!name) return;

      const pin = parts[1] && parts[1].length === 4 ? parts[1] : String(1000 + Math.floor(Math.random() * 9000));
      const studentId = `aluno-${Date.now()}-${idx}`;
      const avatar = avatars[idx % avatars.length];

      const newStudent = {
        id: studentId,
        classId,
        name,
        pin,
        avatar,
        defaultRole: 'Integrante de Equipe',
      };

      state.students.push(newStudent);
      added.push(newStudent);

      if (targetSquad) {
        if (!targetSquad.members) targetSquad.members = [];
        targetSquad.members.push({
          studentId,
          role: 'Integrante de Equipe',
        });
      }
    });

    this.saveState(state);
    return added;
  },

  // Retorna todos os alunos da turma indicando a equipe atual e papel
  getStudentsWithAllocation(classId) {
    const state = this.getState();
    const classStudents = state.students.filter(s => s.classId === classId);
    const classSquads = state.squads.filter(s => s.classId === classId);

    return classStudents.map(student => {
      let currentSquad = null;
      let currentRole = student.defaultRole || 'Integrante de Equipe';

      for (const sq of classSquads) {
        const memberInfo = (sq.members || []).find(m => m.studentId === student.id);
        if (memberInfo) {
          currentSquad = sq;
          currentRole = memberInfo.role;
          break;
        }
      }

      return {
        ...student,
        squadId: currentSquad ? currentSquad.id : '',
        squadName: currentSquad ? currentSquad.name : 'Sem Equipe',
        role: currentRole,
      };
    });
  },

  // Alocar ou desalocar aluno de uma equipe
  assignStudentToSquad(studentId, targetSquadId, role = 'Integrante de Equipe') {
    const state = this.getState();
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    // 1. Remover de qualquer equipe atual da turma
    state.squads.forEach(sq => {
      if (sq.members) {
        sq.members = sq.members.filter(m => m.studentId !== studentId);
      }
    });

    // 2. Se tiver equipe destino, adicionar
    if (targetSquadId) {
      const targetSquad = state.squads.find(sq => sq.id === targetSquadId);
      if (targetSquad) {
        if (!targetSquad.members) targetSquad.members = [];
        targetSquad.members.push({
          studentId,
          role: role || student.defaultRole || 'Integrante de Equipe',
        });
      }
    }

    this.saveState(state);
  },

  // Excluir aluno da turma
  deleteStudent(studentId) {
    const state = this.getState();
    state.students = state.students.filter(s => s.id !== studentId);
    state.squads.forEach(sq => {
      if (sq.members) {
        sq.members = sq.members.filter(m => m.studentId !== studentId);
      }
    });
    this.saveState(state);
  },

  // --- EQUIPES / SQUADS ---
  getSquadsByTeacher(teacherId) {
    return this.getState().squads.filter(s => s.teacherId === teacherId);
  },

  getSquadsByClass(classId) {
    return this.getState().squads.filter(s => s.classId === classId);
  },

  getSquadById(squadId) {
    return this.getState().squads.find(s => s.id === squadId);
  },

  // Retorna os membros da equipe com os dados completos do aluno
  getSquadMembersWithDetails(squadId) {
    const squad = this.getSquadById(squadId);
    if (!squad) return [];

    return (squad.members || []).map(m => {
      const student = this.getStudentById(m.studentId);
      return {
        id: m.studentId,
        role: m.role,
        name: student ? student.name : 'Aluno',
        avatar: student ? student.avatar : '👤',
        pin: student ? student.pin : '0000',
        classId: student ? student.classId : squad.classId,
      };
    });
  },

  createSquad(teacherId, classId, name, projectTheme, studentIdsWithRoles = []) {
    const state = this.getState();
    const squadId = `squad-${Date.now()}`;
    const newSquad = {
      id: squadId,
      teacherId,
      classId,
      name,
      projectTheme: projectTheme || 'Projeto Integrador',
      members: studentIdsWithRoles,
    };
    state.squads.push(newSquad);

    // Criar Sprint 1 inicial automática para o novo squad
    const newSprint = {
      id: `sprint-${Date.now()}`,
      teacherId,
      squadId,
      title: 'Sprint 1 — Kickoff & Entregas',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excusedStudents: [],
    };
    state.sprints.push(newSprint);

    this.saveState(state);
    return newSquad;
  },

  // Mover aluno de equipe (Suporte a mudança de projeto mantendo histórico!)
  moveStudentToSquad(studentId, fromSquadId, toSquadId, newRole) {
    const state = this.getState();
    
    // Remover da equipe de origem
    if (fromSquadId) {
      const fromSquad = state.squads.find(s => s.id === fromSquadId);
      if (fromSquad) {
        fromSquad.members = fromSquad.members.filter(m => m.studentId !== studentId);
      }
    }

    // Adicionar na equipe de destino
    const toSquad = state.squads.find(s => s.id === toSquadId);
    if (toSquad) {
      const exists = toSquad.members.find(m => m.studentId === studentId);
      if (!exists) {
        toSquad.members.push({ studentId, role: newRole || 'Integrante' });
      }
    }

    this.saveState(state);
  },

  // --- SPRINTS ---
  getSprintsBySquad(squadId) {
    return this.getState().sprints.filter(s => s.squadId === squadId);
  },

  getActiveSprint(squadId) {
    return this.getState().sprints.find(s => s.squadId === squadId && s.status === 'active');
  },

  createSprint(squadId, title, deadlineDate) {
    const state = this.getState();
    const squad = state.squads.find(s => s.id === squadId);
    
    // Fechar sprints ativas anteriores desse squad
    state.sprints.forEach(s => {
      if (s.squadId === squadId && s.status === 'active') {
        s.status = 'closed';
      }
    });

    const newSprint = {
      id: `sprint-${Date.now()}`,
      teacherId: squad ? squad.teacherId : '',
      squadId,
      title,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: deadlineDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      excusedStudents: [],
    };

    state.sprints.push(newSprint);
    this.saveState(state);
    return newSprint;
  },

  toggleSprintStatus(sprintId) {
    const state = this.getState();
    const sprint = state.sprints.find(s => s.id === sprintId);
    if (sprint) {
      sprint.status = sprint.status === 'active' ? 'closed' : 'active';
      this.saveState(state);
    }
    return sprint;
  },

  // Aluno Ausente / Atestado Médico na Sprint
  toggleStudentExcused(sprintId, studentId) {
    const state = this.getState();
    const sprint = state.sprints.find(s => s.id === sprintId);
    if (sprint) {
      if (!sprint.excusedStudents) sprint.excusedStudents = [];
      const idx = sprint.excusedStudents.indexOf(studentId);
      if (idx >= 0) {
        sprint.excusedStudents.splice(idx, 1);
      } else {
        sprint.excusedStudents.push(studentId);
      }
      this.saveState(state);
    }
    return sprint;
  },

  // --- AUTENTICAÇÃO DO ALUNO ---
  loginStudent(classId, squadId, studentId, pin) {
    const student = this.getStudentById(studentId);
    if (!student) return { success: false, message: 'Aluno não encontrado.' };

    if (student.pin.trim() !== pin.trim()) {
      return { success: false, message: 'PIN de 4 dígitos incorreto.' };
    }

    const squad = this.getSquadById(squadId);
    const memberMeta = squad ? squad.members.find(m => m.studentId === studentId) : null;

    return {
      success: true,
      student: {
        ...student,
        role: memberMeta ? memberMeta.role : student.defaultRole,
      },
      squad,
      classId,
    };
  },

  hasStudentEvaluated(sprintId, studentId) {
    const state = this.getState();
    return state.evaluations.some(
      e => e.sprintId === sprintId && e.fromStudentId === studentId
    );
  },

  getStudentSelfAssessment(sprintId, studentId) {
    const state = this.getState();
    return state.selfAssessments?.find(
      sa => sa.sprintId === sprintId && sa.studentId === studentId
    );
  },

  // --- SUBMISSÃO DE AVALIAÇÃO + AUTOAVALIAÇÃO ---
  submitEvaluation(sprintId, fromStudentId, squadId, allocations, selfAssessment) {
    const state = this.getState();
    const squad = state.squads.find(s => s.id === squadId);

    // 1. Validar se já avaliou
    if (this.hasStudentEvaluated(sprintId, fromStudentId)) {
      return { success: false, message: 'Você já enviou suas moedas para esta Sprint!' };
    }

    // 2. Validar auto-doação
    const selfGift = allocations.find(a => a.toStudentId === fromStudentId && a.coins > 0);
    if (selfGift) {
      return { success: false, message: 'Regra Scrum: Você não pode doar moedas para si mesmo.' };
    }

    // 3. Validar total de 100 moedas
    const totalCoins = allocations.reduce((acc, curr) => acc + (Number(curr.coins) || 0), 0);
    if (totalCoins !== 100) {
      return {
        success: false,
        message: `A soma de moedas deve ser exatamente 100. Total atual: ${totalCoins}.`,
      };
    }

    // 4. Teto de 60 moedas
    const overLimit = allocations.find(a => Number(a.coins) > 60);
    if (overLimit) {
      return {
        success: false,
        message: 'Regra Anti-Concentração: O teto máximo por colega é de 60 moedas.',
      };
    }

    // 5. Validar tags
    for (const alloc of allocations) {
      if (alloc.coins > 0 && (!alloc.tags || alloc.tags.length === 0)) {
        return {
          success: false,
          message: 'Selecione pelo menos uma Tag de Competência para cada colega que recebeu moedas.',
        };
      }
    }

    // Salvar transações
    const now = new Date().toISOString();
    const newEvaluations = allocations
      .filter(a => a.coins > 0)
      .map((a, idx) => ({
        id: `eval-${Date.now()}-${idx}`,
        teacherId: squad ? squad.teacherId : '',
        sprintId,
        squadId,
        fromStudentId,
        toStudentId: a.toStudentId,
        coins: Number(a.coins),
        tags: a.tags,
        comment: a.comment || '',
        isApproved: true, // Pré-aprovado com moderação posterior
        createdAt: now,
      }));

    state.evaluations.push(...newEvaluations);

    // Salvar Autoavaliação se fornecida
    if (selfAssessment && selfAssessment.rating) {
      if (!state.selfAssessments) state.selfAssessments = [];
      state.selfAssessments.push({
        id: `self-${Date.now()}`,
        teacherId: squad ? squad.teacherId : '',
        sprintId,
        studentId: fromStudentId,
        rating: Number(selfAssessment.rating),
        reflection: selfAssessment.reflection || '',
        createdAt: now,
      });
    }

    this.saveState(state);
    return { success: true };
  },

  // Moderação de comentários
  toggleCommentApproval(evalId) {
    const state = this.getState();
    const ev = state.evaluations.find(e => e.id === evalId);
    if (ev) {
      ev.isApproved = !ev.isApproved;
      this.saveState(state);
    }
    return ev;
  },

  // --- INTERVENÇÕES PEDAGÓGICAS ---
  recordIntervention({ squadId, sprintId, actionType, notes, teacherId }) {
    const state = this.getState();
    state.interventions = state.interventions || [];
    const newInt = {
      id: `int-${Date.now()}`,
      squadId,
      sprintId: sprintId || '',
      actionType: actionType || 'Alinhamento Pedagógico',
      notes: notes.trim(),
      teacherId: teacherId || '',
      date: new Date().toISOString(),
    };
    state.interventions.push(newInt);
    this.saveState(state);
    return { success: true, intervention: newInt };
  },

  getSquadInterventions(squadId) {
    const state = this.getState();
    return (state.interventions || [])
      .filter(i => i.squadId === squadId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // --- ANALYTICS DE COMPETÊNCIAS (RADAR) ---
  getCompetencyRadarData(targetId, type = 'squad') {
    const state = this.getState();
    let relevantEvals = [];

    if (type === 'squad') {
      relevantEvals = state.evaluations.filter(e => e.squadId === targetId);
    } else {
      relevantEvals = state.evaluations.filter(e => e.toStudentId === targetId);
    }

    const tagCounts = {};
    COMPETENCY_TAGS.forEach(t => {
      tagCounts[t.id] = 0;
    });

    relevantEvals.forEach(e => {
      if (Array.isArray(e.tags)) {
        e.tags.forEach(tId => {
          if (tagCounts[tId] !== undefined) {
            tagCounts[tId] += 1;
          }
        });
      }
    });

    const maxCount = Math.max(...Object.values(tagCounts), 1);

    return COMPETENCY_TAGS.map(t => {
      const count = tagCounts[t.id] || 0;
      // Normalização percentual 0 a 100
      const value = Math.round((count / maxCount) * 100);
      return {
        id: t.id,
        label: t.label,
        color: t.color,
        icon: t.icon,
        count,
        value,
      };
    });
  },

  // --- HISTÓRICO LONGITUDINAL DO ALUNO ---
  getStudentLongitudinalHistory(studentId) {
    const state = this.getState();
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const evalsReceived = state.evaluations.filter(e => e.toStudentId === studentId);
    const totalCoins = evalsReceived.reduce((sum, e) => sum + e.coins, 0);

    const tagCounts = {};
    evalsReceived.forEach(e => {
      e.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tagId, count]) => ({
        tag: COMPETENCY_TAGS.find(t => t.id === tagId),
        count,
      }))
      .filter(t => t.tag);

    // Histórico por Sprint
    const sprintHistory = state.sprints.map(sp => {
      const spEvals = evalsReceived.filter(e => e.sprintId === sp.id);
      const coinsInSprint = spEvals.reduce((s, e) => s + e.coins, 0);
      const selfAss = state.selfAssessments?.find(sa => sa.sprintId === sp.id && sa.studentId === studentId);

      return {
        sprintId: sp.id,
        sprintTitle: sp.title,
        coinsReceived: coinsInSprint,
        selfRating: selfAss ? selfAss.rating : null,
      };
    }).filter(sh => sh.coinsReceived > 0 || sh.selfRating !== null);

    return {
      student,
      totalCoins,
      topTags,
      sprintHistory,
      approvedComments: evalsReceived
        .filter(e => e.isApproved && e.comment && e.comment.trim())
        .map(e => ({
          comment: e.comment,
          date: new Date(e.createdAt).toLocaleDateString('pt-BR'),
        })),
    };
  },

  // --- TERMÔMETRO DA EQUIPE (HEALTH SCORE EXPANDIDO) ---
  getSquadThermometer(sprintId, squadId) {
    const state = this.getState();
    const squad = state.squads.find(s => s.id === squadId);
    if (!squad) return null;

    const sprint = state.sprints.find(s => s.id === sprintId);
    const sprintEvals = state.evaluations.filter(e => e.sprintId === sprintId && e.squadId === squadId);
    const excusedSet = new Set(sprint?.excusedStudents || []);

    const membersWithDetails = this.getSquadMembersWithDetails(squadId);
    const evaluators = new Set(sprintEvals.map(e => e.fromStudentId));

    // Membros ativos (excluindo os que têm atestado médico justificado)
    const activeMembers = membersWithDetails.filter(m => !excusedSet.has(m.id));

    const completionRate = activeMembers.length > 0
      ? Math.round((evaluators.size / activeMembers.length) * 100)
      : 0;

    const memberStats = membersWithDetails.map(member => {
      const isExcused = excusedSet.has(member.id);
      const received = sprintEvals.filter(e => e.toStudentId === member.id);
      const totalCoins = received.reduce((sum, e) => sum + e.coins, 0);
      const selfAss = state.selfAssessments?.find(sa => sa.sprintId === sprintId && sa.studentId === member.id);

      const tagCounts = {};
      received.forEach(e => {
        e.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tagId, count]) => ({
          tag: COMPETENCY_TAGS.find(t => t.id === tagId),
          count,
        }))
        .filter(t => t.tag);

      return {
        member,
        isExcused,
        totalCoins,
        hasEvaluated: evaluators.has(member.id),
        selfAssessment: selfAss || null,
        topTags,
      };
    });

    const totalDistributedCoins = memberStats.reduce((sum, m) => sum + m.totalCoins, 0);

    let healthStatus = 'balanced';
    let healthMessage = 'Equipe colaborando em equilíbrio harmônico.';
    let healthColor = '#10b981';

    if (evaluators.size === 0) {
      healthStatus = 'waiting';
      healthMessage = 'Aguardando envio das primeiras avaliações dos membros da equipe.';
      healthColor = '#64748b';
    } else if (totalDistributedCoins > 0 && activeMembers.length >= 2) {
      const activeMemberStats = memberStats.filter(m => !m.isExcused);
      const maxCoins = Math.max(...activeMemberStats.map(m => m.totalCoins));
      const minCoins = Math.min(...activeMemberStats.map(m => m.totalCoins));
      const highestMember = activeMemberStats.find(m => m.totalCoins === maxCoins);
      const lowestMember = activeMemberStats.find(m => m.totalCoins === minCoins);

      if (maxCoins / totalDistributedCoins > 0.45 && activeMembers.length >= 3) {
        healthStatus = 'overload';
        healthMessage = `Alerta de Sobrecarga: ${highestMember.member.name} concentrou ${Math.round((maxCoins / totalDistributedCoins) * 100)}% das moedas da equipe.`;
        healthColor = '#f59e0b';
      } else if (minCoins === 0 && evaluators.size >= 2) {
        healthStatus = 'disengaged';
        healthMessage = `Atenção: ${lowestMember.member.name} não recebeu moedas nesta Sprint.`;
        healthColor = '#ef4444';
      }
    }

    return {
      squad,
      sprint,
      completionRate,
      evaluatorsCount: evaluators.size,
      totalMembers: membersWithDetails.length,
      activeMembersCount: activeMembers.length,
      memberStats,
      totalDistributedCoins,
      healthStatus,
      healthMessage,
      healthColor,
      rawEvaluations: sprintEvals,
    };
  },

  // Exportação CSV detalhada
  generateCSVReport(teacherId) {
    const state = this.getState();
    let csvContent = 'Professor,Turma,UC,Equipe,Sprint,Aluno,Papel,Ausente Justificado,Moedas Recebidas,Autoavaliação (1-5),Avaliou Colegas,Competências Destaques\n';

    const classes = teacherId ? state.classes.filter(c => c.teacherId === teacherId) : state.classes;

    classes.forEach(c => {
      const teacher = state.teachers.find(t => t.id === c.teacherId);
      const squads = state.squads.filter(s => s.classId === c.id);
      squads.forEach(sq => {
        const sprints = state.sprints.filter(sp => sp.squadId === sq.id);
        sprints.forEach(sp => {
          const thermo = this.getSquadThermometer(sp.id, sq.id);
          if (thermo) {
            thermo.memberStats.forEach(stat => {
              const tagsStr = stat.topTags.map(t => `${t.tag.label} (${t.count})`).join(' | ');
              const row = [
                `"${teacher ? teacher.name : 'Instrutor'}"`,
                `"${c.name}"`,
                `"${c.currentUC}"`,
                `"${sq.name}"`,
                `"${sp.title}"`,
                `"${stat.member.name}"`,
                `"${stat.member.role}"`,
                stat.isExcused ? 'Sim (Atestado)' : 'Não',
                stat.totalCoins,
                stat.selfAssessment ? stat.selfAssessment.rating : '—',
                stat.hasEvaluated ? 'Sim' : 'Não',
                `"${tagsStr}"`,
              ];
              csvContent += row.join(',') + '\n';
            });
          }
        });
      });
    });

    return csvContent;
  },
};
