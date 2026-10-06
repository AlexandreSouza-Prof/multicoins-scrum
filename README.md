# 🪙 MultiCoins Scrum

> **Plataforma Educacional de Avaliação por Pares (Peer Assessment), Governança Ágil e Gamificação Formativa.**

O **MultiCoins Scrum** é uma solução completa para gestão de equipes ágeis em cursos técnicos e de graduação. A plataforma substitui notas subjetivas por uma economia comportamental formativa, onde alunos distribuem moedas de reconhecimento baseadas em competências reais observadas nas Sprints, enquanto instrutores e coordenadores monitoram o clima socioemocional e a saúde dos squads em tempo real.

---

## 🌟 Principais Funcionalidades

### 1. 👥 Portal do Aluno
* **Avaliação por Pares Gamificada:** Distribuição de moedas (*MultiCoins*) por integrante da equipe na rodada da Sprint.
* **Mapeamento de 6 Competências Ágeis:** Direção de Arte & Design, Edição & Pós-Produção, Roteiro & Storytelling, Pontualidade & Backlog, Colaboração & Suporte, e Proatividade & Solução.
* **Efeito Espelho (Metacognição):** O aluno realiza sua autoavaliação (1 a 5 estrelas e reflexão) antes de avaliar os colegas, comparando sua autopercepção com a percepção do time.
* **Carteira de Reconhecimentos & Teia de Competências:** Gráfico Radar nativo em SVG exibindo o perfil de forças socioemocionais do estudante, além de histórico acumulado e mural de elogios anônimos aprovados.

### 2. 👨‍🏫 Painel do Instrutor
* **Termômetro Ágil em Tempo Real:** Diagnóstico algorítmico que detecta automaticamente:
  * 🟢 **Equilíbrio Harmônico:** Colaboração distribuída.
  * 🟡 **Sobrecarga de Tarefas:** Concentração excessiva de moedas em um único membro.
  * 🔴 **Baixo Engajamento / Isolamento:** Alunos com zero moedas ou ausência de participação.
* **🚨 Intervenção Pedagógica com Histórico:** Registro de ações do professor (*Reunião 1-on-1*, *Realinhamento de Papéis*, *Mediação de Conflito*, *Mentoria Técnica*) para acompanhamento contínuo da evolução da equipe.
* **Alocação de Alunos nas Equipes (Squads):** Modal moderno ancorado ao topo para distribuição de alunos, papéis Scrum (Product Owner, Scrum Master, Equipe) e criação de novos squads.
* **Importação em Lote:** Cadastro instantâneo de listas de chamada inteiras via cópia e cola.
* **Moderação Ética de Feedbacks:** O instrutor audita os comentários antes de liberá-los para o mural dos alunos.
* **Exportação CSV & Impressão Executiva (PDF):** Relatório formatado em folha A4 com `@media print` para conselhos pedagógicos.

### 3. 👔 Painel da Coordenação Pedagógica (Superadmin / RBAC)
* **Visão Macro Institucional:** 6 KPI Cards consolidados (Total de Docentes, Turmas, Squads, Alunos, Volume de Moedas e Taxa de Saúde Institucional).
* **Gestão do Corpo Docente (CRUD):** Cadastro, edição e desativação segura de professores com trava de proteção para turmas ativas.
* **Panorama Consolidado de Turmas:** Visualização hierárquica das turmas e módulos por professor.
* **Relatório Institucional Executivo (CSV):** Exportação global em um clique para prestação de contas pedagógica.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React 19 + Vite (HMR ultra-rápido)
* **Estilização:** CSS3 Vanilla Moderno com Tokens de Design, Suporte a Modo Escuro / Modo Claro e Glassmorphism
* **Visualização de Dados:** `CompetencyRadarChart` desenvolvido em **SVG Nativo Puro** (zero dependências externas, compatibilidade total com Vercel)
* **Ícones:** Lucide React
* **QR Code:** qrcode.react (para projeção em sala de aula)
* **Gamificação:** canvas-confetti
* **Conformidade:** LGPD (Art. 7º, V da Lei 13.709/2018 - Finalidade estritamente formativa e pedagógica)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js 18+ instalado
* NPM ou Yarn

### Passo a passo
```bash
# 1. Clonar o repositório
git clone https://github.com/AlexandreSouza-Prof/multicoins-scrum.git

# 2. Entrar na pasta do projeto
cd multicoins-scrum

# 3. Instalar as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```
Abra o navegador no endereço indicado: `http://localhost:5173/`

### 🔑 Credenciais Padrão de Demonstração
* **Coordenação / Superadmin:** Senha `admin123`
* **Instrutor:** Senha `admin123`
* **Alunos (PINs de exemplo):** `1234`, `2345`, `3456`, `4567`, `1111`, `2222`, `3333`, `4444`

---

## ☁️ Deploy na Vercel

O projeto já conta com o arquivo `vercel.json` pré-configurado para roteamento SPA:

1. Acesse **[vercel.com](https://vercel.com)** e faça login com seu GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Importe o repositório `multicoins-scrum`.
4. Mantenha as configurações padrão (Framework: *Vite*) e clique em **Deploy**.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.
