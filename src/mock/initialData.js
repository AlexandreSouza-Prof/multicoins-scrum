export const COMPETENCY_TAGS = [
  { id: 'art_direction', label: 'Direção de Arte & Design', icon: 'Palette', color: '#38bdf8' },
  { id: 'video_editing', label: 'Edição & Pós-Produção', icon: 'Film', color: '#f59e0b' },
  { id: 'storytelling', label: 'Roteiro & Storytelling', icon: 'PenTool', color: '#10b981' },
  { id: 'deadline', label: 'Pontualidade & Backlog', icon: 'Clock', color: '#6366f1' },
  { id: 'teamwork', label: 'Colaboração & Suporte', icon: 'Users', color: '#ec4899' },
  { id: 'proactivity', label: 'Proatividade & Solução', icon: 'Zap', color: '#14b8a6' },
];

export const INITIAL_DATA = {
  // Multi-tenant: Isolamento estrito por Professor Responsável
  teachers: [
    {
      id: 'prof-alexandre',
      name: 'Prof. Alexandre',
      email: 'alexandre.instrutor@escola.edu.br',
      password: 'admin123',
      department: 'Metodologias Ágeis & Inovação',
    },
    {
      id: 'prof-mariana',
      name: 'Profa. Mariana Silva',
      email: 'mariana.silva@escola.edu.br',
      password: 'admin123',
      department: 'Design & Tecnologia',
    },
  ],

  coordinator: {
    id: 'coord-geral',
    name: 'Coordenação Pedagógica',
    email: 'coordenacao@escola.edu.br',
    password: 'admin123',
    institution: 'Centro de Educação & Tecnologia',
  },

  classes: [
    {
      id: 'multimidia-2ano',
      teacherId: 'prof-alexandre',
      name: 'Turma Alfa - 2º Ano (Projetos Ágeis)',
      currentUC: 'Módulo 04: Planejamento Ágil e Entregas',
      year: 2,
    },
    {
      id: 'multimidia-3ano',
      teacherId: 'prof-alexandre',
      name: 'Turma Beta - 3º Ano (Projetos Ágeis)',
      currentUC: 'Módulo 08: Projeto Integrador e Inovação',
      year: 3,
    },
    {
      id: 'design-web-1ano',
      teacherId: 'prof-mariana',
      name: 'Turma Gamma - 1º Ano (Fundamentos)',
      currentUC: 'Módulo 01: Fundamentos de Projetos e Criatividade',
      year: 1,
    },
  ],

  // Alunos como entidade longitudinal independente (permanecem os mesmos mesmo mudando de equipe)
  students: [
    // Turma 2º Ano (Prof. Alexandre)
    { id: 'aluno-lucas', classId: 'multimidia-2ano', name: 'Lucas Silva', pin: '1234', avatar: '👨‍🎨', defaultRole: 'Product Owner' },
    { id: 'aluno-beatriz', classId: 'multimidia-2ano', name: 'Beatriz Santos', pin: '2345', avatar: '👩‍💻', defaultRole: 'Scrum Master' },
    { id: 'aluno-matheus', classId: 'multimidia-2ano', name: 'Matheus Oliveira', pin: '3456', avatar: '🧑‍🎨', defaultRole: 'Designer Gráfico' },
    { id: 'aluno-clara', classId: 'multimidia-2ano', name: 'Clara Mendes', pin: '4567', avatar: '👩‍🎨', defaultRole: 'Ilustradora' },
    { id: 'aluno-enzo', classId: 'multimidia-2ano', name: 'Enzo Costa', pin: '1111', avatar: '🧑‍💻', defaultRole: 'Product Owner' },
    { id: 'aluno-gabriel', classId: 'multimidia-2ano', name: 'Gabriel Rocha', pin: '2222', avatar: '👨‍🎨', defaultRole: 'Motion Designer' },
    { id: 'aluno-julia', classId: 'multimidia-2ano', name: 'Julia Ferreira', pin: '3333', avatar: '👩‍💻', defaultRole: 'UI/UX Designer' },
    { id: 'aluno-mariana', classId: 'multimidia-2ano', name: 'Mariana Lima', pin: '4444', avatar: '👩‍🎨', defaultRole: 'Scrum Master' },

    // Turma 3º Ano (Prof. Alexandre)
    { id: 'aluno-felipe', classId: 'multimidia-3ano', name: 'Felipe Carvalho', pin: '1010', avatar: '🎬', defaultRole: 'Direção Geral' },
    { id: 'aluno-amanda', classId: 'multimidia-3ano', name: 'Amanda Ribeiro', pin: '2020', avatar: '🎥', defaultRole: 'Diretora de Fotografia' },
    { id: 'aluno-thiago', classId: 'multimidia-3ano', name: 'Thiago Souza', pin: '3030', avatar: '✨', defaultRole: 'Motion Designer' },
    { id: 'aluno-isabella', classId: 'multimidia-3ano', name: 'Isabella Costa', pin: '4040', avatar: '🎧', defaultRole: 'Scrum Master' },

    // Turma Profa. Mariana
    { id: 'aluno-pedro', classId: 'design-web-1ano', name: 'Pedro Alves', pin: '5555', avatar: '🎨', defaultRole: 'Designer Jr' },
    { id: 'aluno-larissa', classId: 'design-web-1ano', name: 'Larissa Duarte', pin: '6666', avatar: '👩‍🎨', defaultRole: 'Scrum Master' },
  ],

  // Equipes / Squads com alocação dos alunos
  squads: [
    {
      id: 'squad-framezero',
      teacherId: 'prof-alexandre',
      classId: 'multimidia-2ano',
      name: 'FrameZero Studio',
      projectTheme: 'Redesign de Identidade e Campanha Social',
      members: [
        { studentId: 'aluno-lucas', role: 'Product Owner / Roteiro' },
        { studentId: 'aluno-beatriz', role: 'Scrum Master / UI' },
        { studentId: 'aluno-matheus', role: 'Designer Gráfico' },
        { studentId: 'aluno-clara', role: 'Ilustradora' },
      ],
    },
    {
      id: 'squad-pixelcraft',
      teacherId: 'prof-alexandre',
      classId: 'multimidia-2ano',
      name: 'PixelCraft Agency',
      projectTheme: 'Branding e Interface para App Educativo',
      members: [
        { studentId: 'aluno-enzo', role: 'Product Owner / Copy' },
        { studentId: 'aluno-gabriel', role: 'Motion Designer' },
        { studentId: 'aluno-julia', role: 'UI/UX Designer' },
        { studentId: 'aluno-mariana', role: 'Scrum Master / Arte' },
      ],
    },
    {
      id: 'squad-cinemotion',
      teacherId: 'prof-alexandre',
      classId: 'multimidia-3ano',
      name: 'CineMotion Labs',
      projectTheme: 'Curta-Metragem Animado & Pós-Produção',
      members: [
        { studentId: 'aluno-felipe', role: 'Direção Geral / Roteiro' },
        { studentId: 'aluno-amanda', role: 'Diretora de Fotografia / Edição' },
        { studentId: 'aluno-thiago', role: 'Motion Designer / VFX' },
        { studentId: 'aluno-isabella', role: 'Scrum Master / Sound Design' },
      ],
    },
    {
      id: 'squad-mariana-alpha',
      teacherId: 'prof-mariana',
      classId: 'design-web-1ano',
      name: 'Studio Vetor',
      projectTheme: 'Cartazes Tipográficos e Identidade',
      members: [
        { studentId: 'aluno-pedro', role: 'Designer Jr' },
        { studentId: 'aluno-larissa', role: 'Scrum Master' },
      ],
    },
  ],

  sprints: [
    {
      id: 'sprint-1',
      teacherId: 'prof-alexandre',
      squadId: 'squad-framezero',
      title: 'Sprint 1: Pesquisa, Wireframes & Moodboard',
      status: 'closed',
      startDate: '2026-09-15',
      endDate: '2026-09-29',
      excusedStudents: [], // Lista de studentIds com atestado/ausência justificada
    },
    {
      id: 'sprint-2',
      teacherId: 'prof-alexandre',
      squadId: 'squad-framezero',
      title: 'Sprint 2: Identidade Visual e Guias de Estilo',
      status: 'active',
      startDate: '2026-09-30',
      endDate: '2026-10-14',
      excusedStudents: [],
    },
    {
      id: 'sprint-pixel-1',
      teacherId: 'prof-alexandre',
      squadId: 'squad-pixelcraft',
      title: 'Sprint 1: Benchmark e Personas',
      status: 'active',
      startDate: '2026-09-30',
      endDate: '2026-10-14',
      excusedStudents: [],
    },
    {
      id: 'sprint-cine-1',
      teacherId: 'prof-alexandre',
      squadId: 'squad-cinemotion',
      title: 'Sprint 1: Roteiro Técnico e Animatic',
      status: 'active',
      startDate: '2026-09-30',
      endDate: '2026-10-14',
      excusedStudents: [],
    },
  ],

  evaluations: [
    {
      id: 'eval-1',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-lucas',
      toStudentId: 'aluno-beatriz',
      coins: 40,
      tags: ['teamwork', 'deadline'],
      comment: 'Conduziu muito bem as Dailies e organizou o Trello com precisão.',
      isApproved: true, // Moderação de comentários
      createdAt: '2026-09-29T10:00:00Z',
    },
    {
      id: 'eval-2',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-lucas',
      toStudentId: 'aluno-matheus',
      coins: 35,
      tags: ['art_direction'],
      comment: 'O moodboard ficou excelente, ajudou muito na linha visual.',
      isApproved: true,
      createdAt: '2026-09-29T10:05:00Z',
    },
    {
      id: 'eval-3',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-lucas',
      toStudentId: 'aluno-clara',
      coins: 25,
      tags: ['storytelling'],
      comment: 'Contribuiu nas ideias do briefing inicial.',
      isApproved: true,
      createdAt: '2026-09-29T10:08:00Z',
    },
    {
      id: 'eval-4',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-beatriz',
      toStudentId: 'aluno-lucas',
      coins: 35,
      tags: ['storytelling', 'proactivity'],
      comment: 'Definiu o escopo do projeto com muita clareza.',
      isApproved: true,
      createdAt: '2026-09-29T10:15:00Z',
    },
    {
      id: 'eval-5',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-beatriz',
      toStudentId: 'aluno-matheus',
      coins: 35,
      tags: ['art_direction', 'deadline'],
      comment: 'Entregou todas as paletas de cores antes do prazo da Sprint.',
      isApproved: true,
      createdAt: '2026-09-29T10:20:00Z',
    },
    {
      id: 'eval-6',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      squadId: 'squad-framezero',
      fromStudentId: 'aluno-beatriz',
      toStudentId: 'aluno-clara',
      coins: 30,
      tags: ['teamwork'],
      comment: 'Sempre presente nas reuniões e tirando dúvidas.',
      isApproved: true,
      createdAt: '2026-09-29T10:22:00Z',
    },
  ],

  // Autoavaliação do Aluno (Auto-percepção vs Avaliação dos colegas)
  selfAssessments: [
    {
      id: 'self-1',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      studentId: 'aluno-lucas',
      rating: 5,
      reflection: 'Consegui alinhar bem o backlog e ajudar o time nas dúvidas de roteiro.',
      createdAt: '2026-09-29T10:10:00Z',
    },
    {
      id: 'self-2',
      teacherId: 'prof-alexandre',
      sprintId: 'sprint-1',
      studentId: 'aluno-beatriz',
      rating: 4,
      reflection: 'Organizei as tarefas, mas preciso melhorar o tempo gasto nas Dailies.',
      createdAt: '2026-09-29T10:25:00Z',
    },
  ],

  // Intervenções Pedagógicas & Planos de Ação do Instrutor
  interventions: [
    {
      id: 'int-1',
      squadId: 'squad-framezero',
      sprintId: 'sprint-1',
      teacherId: 'prof-alexandre',
      actionType: 'Realinhamento de Papéis no Scrum',
      notes: 'Realizada reunião com a equipe para redistribuir a carga de entrega do roteiro e incentivar maior participação do Lucas e Matheus nas dailies.',
      date: '2026-09-30T14:30:00Z',
    },
  ],
};
