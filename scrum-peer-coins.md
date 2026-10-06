# MultiCoins Scrum — Sistema de Avaliação por Pares Gamificada

## 1. Overview
Aplicação Web para turmas do 2º e 3º ano do curso **Técnico em Multimídia** (Ensino Médio SENAI), permitindo a avaliação por pares (*Peer Assessment*) em projetos ágeis no modelo **Scrum**.
Ao final de cada Sprint em uma Unidade Curricular (UC), cada aluno recebe uma quantia fechada de **MultiCoins** para distribuir entre os colegas do seu grupo com base em entregas, competências criativas e colaboração, alimentando o **Termômetro da Equipe** para o professor.

---

## 2. Project Type
- **Tipo de Projeto:** `WEB` (Web Application Responsiva — Desktop dos Laboratórios e Celulares dos Alunos)
- **Primary Agent:** `frontend-specialist` (com suporte de `backend-specialist` para camada de dados)

---

## 3. Decisões de Implementação (Recomendações Definidas)

### 3.1 Acesso & Hierarquia RBAC (Institucional & Zero Friction)
- **Modo Aluno:** Acesso direto via seleção de **Turma** (ex: *2º Multimídia A*, *3º Multimídia B*) ➔ **Equipe / Agência** (ex: *Pixel Squad*, *Framerate Studio*) ➔ **Nome do Aluno** + **PIN individual de 4 dígitos**. Não depende de criação de e-mails nem contas externas.
- **Modo Professor Titular:** Acesso com e-mail corporativo SENAI, criação de turmas/UCs, equipes, abertura/fechamento de Sprints, importação de chamada e moderação.
- **Modo Co-docência (Professor Convidado):** Possibilidade de o professor titular convidar outro docente para co-gerenciar a turma e acompanhar os termômetros da Sprint.
- **Modo Coordenador / Superadmin:** Gestão e cadastro de professores da unidade escolar, visão panorâmica consolidada de todos os projetos/turmas e exportação institucional.
- **Recuperação de Acesso:** Reset de senha automatizado e seguro enviado diretamente para o e-mail corporativo institucional via Firebase Auth.

### 3.2 Mecânica das Moedas (Anti-Conluio & Gamificação)
- **Cota por Sprint:** Cada aluno recebe 100 MultiCoins por fechamento de Sprint.
- **Auto-doação Proibida:** O aluno não pode transferir moedas para si mesmo.
- **Teto por Colega (Anti-Panelinha):** Limite máximo de transferência para um único colega (ex: máximo de 60% da carteira) para forçar o reconhecimento dos demais participantes.
- **Tags de Competência Multimídia:** Toda doação de moedas deve vir acompanhada de pelo menos uma Tag de Competência:
  - 🎨 *Direção de Arte / Design Visual*
  - 🎬 *Edição / Pós-Produção Audiovisual*
  - ✍️ *Roteiro / Storytelling*
  - ⏱️ *Pontualidade / Respeito ao Backlog*
  - 🤝 *Comunicação & Trabalho em Equipe*
  - 🚀 *Proatividade & Resolução de Problemas*
- **Camada de Privacidade:**
  - **Entre alunos:** O saldo total e os elogios recebidos são públicos para motivação mútua, mas a quantia exata doada por aluno específico para outro permanece **anônima** para evitar retaliação.
  - **Para o Professor:** **100% transparente**. Matriz completa de transferências, comentários e gráficos de dispersão.

### 3.3 Termômetro da Equipe (Painel do Instrutor)
- **Índice de Saúde da Sprint (Health Score):**
  - 🟢 **Equilibrado:** Moedas distribuídas de forma homogênea; ritmo de trabalho saudável.
  - 🟡 **Concentração / Sobrecarga:** Um aluno recebendo >70% de todas as moedas da equipe (alerta de "Carregando o time nas costas").
  - 🔴 **Desengajamento / Isolamento:** Aluno recebendo 0 a 10 moedas sucessivas (alerta de carona ou dificuldade socioemocional/técnica).
- **Relatórios & Exportação:** Exportação em CSV/Excel das notas e engajamento para lançar no diário de classe do SENAI.

---

## 4. Tech Stack
- **Frontend:** React + Vite (rápido, modular, responsivo e interativo).
- **Estilização:** CSS Moderno / Tailwind com paleta visual voltada para Estúdio Criativo / Multimídia (dark mode refinado, detalhes em acentos néon/azul-índigo, sem roxo genérico).
- **Camada de Dados & Persistência:**
  - Inicialmente: LocalStorage + IndexedDB com estrutura State Service desacoplada (permite uso imediato em qualquer máquina/offline).
  - Suporte nativo a importação/exportação de dados em JSON e CSV.
  - Preparado para fácil acoplamento com backend leve (Node.js/Express ou Firebase Firestore).

---

## 5. File Structure Planejada
```
scrum-peer-coins/
├── index.html
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── Student/
│   │   │   ├── LoginPin.jsx
│   │   │   ├── CoinDistribution.jsx
│   │   │   ├── WalletCard.jsx
│   │   │   └── KudosBadgeSelector.jsx
│   │   ├── Teacher/
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── TeamThermometer.jsx
│   │   │   ├── SprintManager.jsx
│   │   │   ├── TeamMatrixView.jsx
│   │   │   └── ExportDataModal.jsx
│   │   └── UI/
│   │       ├── Card.jsx
│   │       ├── Badge.jsx
│   │       ├── ProgressBar.jsx
│   │       └── Modal.jsx
│   ├── services/
│   │   ├── storageService.js
│   │   └── analyticsService.js
│   └── mock/
│       └── initialData.js (Turmas 2º/3º ano, UCs e squads modelo)
```

---

## 6. Task Breakdown

### Fase P0: Setup & Modelagem de Dados
- [x] **Task P0.1:** Inicializar projeto React com Vite e configurar estrutura base de pastas.
- [x] **Task P0.2:** Modelar schemas de Turma, Equipe/Squad, Aluno, Sprint, Transação de Moedas e Tags de Competência em `services/storageService.js`.

### Fase P1: Fluxo do Aluno (Distribuição de Moedas & Kudos)
- [x] **Task P1.1:** Tela de seleção de perfil (Turma ➔ Equipe ➔ Nome) e validação de PIN de 4 dígitos.
- [x] **Task P1.2:** Interface de distribuição de MultiCoins com sliders/contadores dinâmicos, validação de limite (100 moedas), restrição anti-auto-doação e seleção de Tags de Competência.

### Fase P2: Painel do Professor (Termômetro da Equipe)
- [x] **Task P2.1:** Dashboard do Professor com seletor de UC, visualização das equipes e controle de abertura/encerramento de Sprints.
- [x] **Task P2.2:** Componente "Termômetro da Equipe" (Health Score, indicador visual de sobrecarga e de isolamento, cálculo dinâmico).
- [x] **Task P2.3:** Exportação de relatórios em CSV com médias, notas formativas e justificativas.

### Fase P3: Refinamento Estético & Responsividade
- [x] **Task P3.1:** Estilização temático-criativa (design escuro com estética de estúdio multimídia, sem roxo genérico, micro-animações nas moedas, responsividade total mobile).
- [x] **Task P3.2:** Alternância dinâmica de Modo Claro e Modo Escuro (Dark/Light Mode) com persistência em `localStorage`.

### Fase P4: Multi-Tenancy, Importação & Conformidade LGPD
- [x] **Task P4.1:** Arquitetura Multi-Tenant isolada por Professor Responsável (turmas e dados segregados).
- [x] **Task P4.2:** Importação em lote de chamada de alunos via copiar e colar / CSV com PINs automáticos.
- [x] **Task P4.3:** Autoavaliação do Aluno (Efeito Espelho) integrada à distribuição de moedas da Sprint.
- [x] **Task P4.4:** Tratamento de alunos ausentes/atestado médico na Sprint com ajuste no termômetro.
- [x] **Task P4.5:** Projeção de QR Code em tela cheia na lousa para conexão dos alunos via celular na rede Wi-Fi.
- [x] **Task P4.6:** Moderação pedagógica com aprovação/ocultação de comentários no mural.
- [x] **Task P4.7:** Blindagem e aviso de conformidade com a LGPD (Art. 7º, V da Lei 13.709/2018).
- [x] **Task P4.8:** Gestão e Alocação de Alunos nas Equipes (Squads), criação de novas equipes com Sprint 1 automática e consulta de PINs.

---

## 7. Phase X: Verificação & Qualidade
- [x] Lint e compilação de produção: `npm run build` executado com sucesso (0 erros).
- [x] Validação das regras de negócio (anti-auto-doação, limite de 100 moedas, teto de 60 por colega, diagnóstico do termômetro).
- [x] Suporte completo a Modo Claro e Escuro com transições suaves e contraste legível.
- [x] Servidor de desenvolvimento rodando em `http://localhost:5173/` (HTTP 200 OK).

## ✅ PHASE X COMPLETE
- Build: ✅ Success (Vite React bundle gerado)
- Servidor: ✅ http://localhost:5173/ Ativo
- Date: 2026-10-06

