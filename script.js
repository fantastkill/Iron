const STORAGE_KEY = "iron_pulse_state_v1";
const SESSION_KEY = "iron_pulse_session_v1";

const seedState = {
  admin: {
    nome: "Administrador",
    email: "admin@ironpulse.com",
    senha: "123456"
  },
  professores: [
    {
      nome: "Lucas Trainer",
      email: "lucas@ironpulse.com",
      senha: "111111",
      alunos: ["joao@ironpulse.com", "carlos@ironpulse.com", "bruno@ironpulse.com"]
    },
    {
      nome: "Marina Coach",
      email: "marina@ironpulse.com",
      senha: "222222",
      alunos: ["fernanda@ironpulse.com", "juliana@ironpulse.com", "pedro@ironpulse.com"]
    }
  ],
  alunos: [
    { nome: "Joao Silva", email: "joao@ironpulse.com", senha: "333333", professorEmail: "lucas@ironpulse.com", evolucao: "+2kg massa magra" },
    { nome: "Carlos Lima", email: "carlos@ironpulse.com", senha: "333333", professorEmail: "lucas@ironpulse.com", evolucao: "Melhora no cardio" },
    { nome: "Bruno Alves", email: "bruno@ironpulse.com", senha: "333333", professorEmail: "lucas@ironpulse.com", evolucao: "+8% forca" },
    { nome: "Fernanda Souza", email: "fernanda@ironpulse.com", senha: "333333", professorEmail: "marina@ironpulse.com", evolucao: "+3kg massa magra" },
    { nome: "Juliana Rocha", email: "juliana@ironpulse.com", senha: "333333", professorEmail: "marina@ironpulse.com", evolucao: "Mais mobilidade" },
    { nome: "Pedro Henrique", email: "pedro@ironpulse.com", senha: "333333", professorEmail: "marina@ironpulse.com", evolucao: "Reducao de 2% gordura" }
  ],
  treinos: [
    {
      id: 1,
      professorEmail: "lucas@ironpulse.com",
      alunoEmail: "joao@ironpulse.com",
      titulo: "Hipertrofia A",
      descricao: "Supino reto 4x10\nRemada curvada 4x10\nAgachamento 4x12",
      criadoEm: "2026-05-20"
    },
    {
      id: 2,
      professorEmail: "marina@ironpulse.com",
      alunoEmail: "fernanda@ironpulse.com",
      titulo: "Definicao Full Body",
      descricao: "Leg press 4x12\nDesenvolvimento 3x12\nPrancha 4x40s",
      criadoEm: "2026-05-20"
    }
  ],
  agendaSemanal: [
    { dia: "Segunda", foco: "Musculacao - Membros Superiores", horario: "06:00 - 22:00" },
    { dia: "Terca", foco: "Treino Funcional", horario: "07:00 - 21:00" },
    { dia: "Quarta", foco: "Musculacao - Membros Inferiores", horario: "06:00 - 22:00" },
    { dia: "Quinta", foco: "HIIT e Condicionamento", horario: "07:00 - 21:00" },
    { dia: "Sexta", foco: "Core e Mobilidade", horario: "06:00 - 22:00" },
    { dia: "Sabado", foco: "Aula Coletiva e Alongamento", horario: "08:00 - 16:00" },
    { dia: "Domingo", foco: "Recuperacao Ativa", horario: "08:00 - 13:00" }
  ],
  alunoPainel: {}
};

const $ = (id) => document.getElementById(id);
const norm = (value) => String(value || "").trim().toLowerCase();
const today = () => new Date().toISOString().slice(0, 10);

const loginContainer = $("loginContainer");
const adminPanel = $("adminPanel");
const professorPanel = $("professorPanel");
const alunoPanel = $("alunoPanel");

const loginForm = $("loginForm");
const signupForm = $("signupForm");
const tabLogin = $("tabLogin");
const tabSignup = $("tabSignup");
const msg = $("msg");

const emailInput = $("email");
const senhaInput = $("senha");
const nomeCadastro = $("nomeCadastro");
const emailCadastro = $("emailCadastro");
const senhaCadastro = $("senhaCadastro");
const senhaCadastro2 = $("senhaCadastro2");
const professorCadastro = $("professorCadastro");
const passStrengthFill = $("passStrengthFill");
const passStrengthText = $("passStrengthText");
const emailHint = $("emailHint");
const signupSubmitBtn = $("signupSubmitBtn");
const promoDots = $("promoDots");
const promoSlides = [...document.querySelectorAll(".promo-slide")];

const statProfessores = $("statProfessores");
const statAlunos = $("statAlunos");
const statTreinos = $("statTreinos");
const filtroProfessorAdmin = $("filtroProfessorAdmin");
const listaTreinosAdmin = $("listaTreinosAdmin");

const nomeProfessor = $("nomeProfessor");
const listaProfessor = $("listaProfessor");
const filtroAlunoProfessor = $("filtroAlunoProfessor");
const alunoTreino = $("alunoTreino");
const tituloTreino = $("tituloTreino");
const descricaoTreino = $("descricaoTreino");
const salvarTreinoBtn = $("salvarTreinoBtn");
const treinosSalvos = $("treinosSalvos");
const msgProfessor = $("msgProfessor");

const alunoTreinoAtual = $("alunoTreinoAtual");
const alunoEvolucao = $("alunoEvolucao");
const alunoProfessor = $("alunoProfessor");
const cardsEnsinoAluno = $("cardsEnsinoAluno");
const programacaoSemanalAluno = $("programacaoSemanalAluno");
const listaFichasAluno = $("listaFichasAluno");

const adminLogout = $("adminLogout");
const professorLogout = $("professorLogout");
const alunoLogout = $("alunoLogout");

let state = loadState();
let session = null;
let promoIndex = 0;
let promoTimer = null;

const signupReqIds = {
  len: "reqLen",
  caseMix: "reqCase",
  number: "reqNum",
  special: "reqSpecial",
  match: "reqMatch"
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw || typeof raw !== "object") return clone(seedState);

    const merged = {
      admin: raw.admin || seedState.admin,
      professores: Array.isArray(raw.professores) ? raw.professores : clone(seedState.professores),
      alunos: Array.isArray(raw.alunos) ? raw.alunos : clone(seedState.alunos),
      treinos: Array.isArray(raw.treinos) ? raw.treinos : clone(seedState.treinos),
      agendaSemanal: Array.isArray(raw.agendaSemanal) && raw.agendaSemanal.length ? raw.agendaSemanal : clone(seedState.agendaSemanal),
      alunoPainel: raw.alunoPainel && typeof raw.alunoPainel === "object" ? raw.alunoPainel : {}
    };

    return merged;
  } catch {
    return clone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveSession(nextSession) {
  session = nextSession;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
}

function clearSession() {
  session = null;
  sessionStorage.removeItem(SESSION_KEY);
}

function restoreSession() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (!raw || !raw.email || !raw.role) return;

    if (raw.role === "admin" && norm(raw.email) === norm(state.admin.email)) {
      saveSession(raw);
      openAdmin();
      return;
    }

    if (raw.role === "professor") {
      const professor = state.professores.find((item) => norm(item.email) === norm(raw.email));
      if (professor) {
        saveSession({ role: "professor", email: professor.email });
        openProfessor(professor);
      }
      return;
    }

    if (raw.role === "aluno") {
      const aluno = state.alunos.find((item) => norm(item.email) === norm(raw.email));
      if (aluno) {
        saveSession({ role: "aluno", email: aluno.email });
        openAluno(aluno);
      }
    }
  } catch {}
}

function setMode(mode) {
  const isLogin = mode === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabSignup.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("active", isLogin);
  signupForm.classList.toggle("active", !isLogin);
  if (!isLogin) updateSignupInteractivity();
  setMsg("");
}

function setMsg(text, type = "") {
  msg.textContent = text;
  msg.className = `msg ${type}`.trim();
}

function setMsgProfessor(text, type = "") {
  msgProfessor.textContent = text;
  msgProfessor.className = `msg inline ${type}`.trim();
}

function hideAllPanels() {
  stopPromoCarousel();
  loginContainer.style.display = "none";
  adminPanel.style.display = "none";
  professorPanel.style.display = "none";
  alunoPanel.style.display = "none";
}

function openLogin() {
  hideAllPanels();
  loginContainer.style.display = "flex";
  emailInput.value = "";
  senhaInput.value = "";
  renderSignupProfessores();
  updateSignupInteractivity();
  startPromoCarousel();
  setMsg("");
}

function setPromoSlide(index) {
  if (!promoSlides.length) return;
  promoIndex = (index + promoSlides.length) % promoSlides.length;
  promoSlides.forEach((slide, idx) => slide.classList.toggle("active", idx === promoIndex));
  promoDots?.querySelectorAll(".dot").forEach((dot, idx) => dot.classList.toggle("active", idx === promoIndex));
}

function startPromoCarousel() {
  if (!promoSlides.length) return;
  stopPromoCarousel();
  setPromoSlide(promoIndex);
  promoTimer = setInterval(() => setPromoSlide(promoIndex + 1), 3800);
}

function stopPromoCarousel() {
  if (!promoTimer) return;
  clearInterval(promoTimer);
  promoTimer = null;
}

function openAdmin() {
  hideAllPanels();
  adminPanel.style.display = "block";
  renderAdminStats();
  renderAdminProfessorFilter();
  renderAdminTreinosRecentes();
}

function renderAdminStats() {
  statProfessores.textContent = `${state.professores.length} professores ativos`;
  statAlunos.textContent = `${state.alunos.length} alunos cadastrados`;
  statTreinos.textContent = `${state.treinos.length} fichas cadastradas`;
}

function renderSignupProfessores() {
  professorCadastro.innerHTML = '<option value="">Sem treinador por enquanto</option>';
  state.professores.forEach((professor) => {
    const option = document.createElement("option");
    option.value = professor.email;
    option.textContent = professor.nome;
    professorCadastro.appendChild(option);
  });
}

function renderAdminProfessorFilter() {
  filtroProfessorAdmin.innerHTML = '<option value="">Todos</option>';
  state.professores.forEach((professor) => {
    const option = document.createElement("option");
    option.value = professor.email;
    option.textContent = professor.nome;
    filtroProfessorAdmin.appendChild(option);
  });
}

function renderAdminTreinosRecentes() {
  const filtroEmail = norm(filtroProfessorAdmin.value);
  const treinos = state.treinos
    .filter((treino) => !filtroEmail || norm(treino.professorEmail) === filtroEmail)
    .slice()
    .sort((a, b) => (a.id < b.id ? 1 : -1))
    .slice(0, 8);

  if (!treinos.length) {
    listaTreinosAdmin.innerHTML = '<div class="empty">Nenhuma ficha encontrada para o filtro selecionado.</div>';
    return;
  }

  listaTreinosAdmin.innerHTML = `<div class="list-stack">${treinos.map((treino) => {
    const professor = state.professores.find((item) => norm(item.email) === norm(treino.professorEmail));
    const aluno = state.alunos.find((item) => norm(item.email) === norm(treino.alunoEmail));
    return `
      <article class="list-item">
        <div>
          <h4>${treino.titulo}</h4>
          <p>${aluno ? aluno.nome : "Aluno nao encontrado"} - ${professor ? professor.nome : "Professor nao encontrado"}</p>
        </div>
        <span class="list-tag">${treino.criadoEm}</span>
      </article>
    `;
  }).join("")}</div>`;
}

function openProfessor(professor) {
  hideAllPanels();
  professorPanel.style.display = "block";
  nomeProfessor.textContent = `Professor: ${professor.nome}`;
  filtroAlunoProfessor.value = "";
  renderProfessorStudents(professor, "");
  renderProfessorTreinos(professor);
  renderAlunoSelect(professor);
}

function renderProfessorStudents(professor, filtroNome = "") {
  const meusAlunos = state.alunos.filter((aluno) => professor.alunos.includes(aluno.email));
  const filtro = norm(filtroNome);
  const listaFiltrada = meusAlunos.filter((aluno) => !filtro || norm(aluno.nome).includes(filtro));

  if (!listaFiltrada.length) {
    listaProfessor.innerHTML = '<div class="empty">Nenhum aluno vinculado.</div>';
    return;
  }

  listaProfessor.innerHTML = `<div class="list-stack">${listaFiltrada.map((aluno) => {
    const treinoAtual = latestTreinoByAluno(aluno.email);
    return `
      <div class="aluno-item list-item">
        <div>
        <h3>${aluno.nome}</h3>
        <p>${treinoAtual ? `Treino ativo: ${treinoAtual.titulo}` : "Sem treino ativo"}</p>
        </div>
        <span class="list-tag">${treinoAtual ? "Ativo" : "Pendente"}</span>
      </div>
    `;
  }).join("")}</div>`;
}

function renderAlunoSelect(professor) {
  const meusAlunos = state.alunos.filter((aluno) => professor.alunos.includes(aluno.email));

  alunoTreino.innerHTML = "";
  if (!meusAlunos.length) {
    alunoTreino.innerHTML = '<option value="">Sem alunos</option>';
    return;
  }

  meusAlunos.forEach((aluno) => {
    const option = document.createElement("option");
    option.value = aluno.email;
    option.textContent = aluno.nome;
    alunoTreino.appendChild(option);
  });
}

function renderProfessorTreinos(professor) {
  const meusTreinos = state.treinos
    .filter((treino) => norm(treino.professorEmail) === norm(professor.email))
    .slice()
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  if (!meusTreinos.length) {
    treinosSalvos.innerHTML = '<div class="empty">Nenhuma ficha criada ainda.</div>';
    return;
  }

  treinosSalvos.innerHTML = meusTreinos.map((treino) => {
    const aluno = state.alunos.find((item) => norm(item.email) === norm(treino.alunoEmail));
    return `
      <div class="treino-box">
        <h4>${treino.titulo}</h4>
        <p><strong>Aluno:</strong> ${aluno ? aluno.nome : "Nao encontrado"}</p>
        <p>${treino.descricao.replace(/\n/g, "<br>")}</p>
        <small>Criado em ${treino.criadoEm}</small>
      </div>
    `;
  }).join("");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getAlunoPainel(email) {
  const key = norm(email);
  if (!state.alunoPainel[key]) {
    state.alunoPainel[key] = { estudo: {}, semanal: {} };
  }
  if (!state.alunoPainel[key].estudo) state.alunoPainel[key].estudo = {};
  if (!state.alunoPainel[key].semanal) state.alunoPainel[key].semanal = {};
  return state.alunoPainel[key];
}

function renderAlunoLearningCards(aluno, treinoAtual) {
  const painel = getAlunoPainel(aluno.email);
  const exercicios = String(treinoAtual?.descricao || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  const cards = [
    {
      id: "aquecimento",
      titulo: "Aquecimento Inteligente",
      descricao: "Faca 8 a 10 minutos de aquecimento antes do treino para ativar musculatura e reduzir risco de lesao."
    },
    {
      id: "tecnica",
      titulo: "Tecnica do Treino Atual",
      descricao: exercicios.length
        ? `Foco de hoje: ${exercicios.join(" | ")}. Priorize amplitude completa e controle do movimento.`
        : "Seu treino ainda nao foi cadastrado. Assim que sair sua ficha, aqui entram as orientacoes tecnicas."
    },
    {
      id: "recuperacao",
      titulo: "Recuperacao Pos-Treino",
      descricao: "Respeite intervalo, hidratacao e descanso. O resultado vem da consistencia entre treino e recuperacao."
    }
  ];

  cardsEnsinoAluno.innerHTML = cards.map((card) => {
    const done = !!painel.estudo[card.id];
    return `
      <article class="edu-card">
        <span class="card-status ${done ? "ok" : ""}">${done ? "Estudado" : "Pendente"}</span>
        <h3>${card.titulo}</h3>
        <p>${card.descricao}</p>
        <button class="mini-btn" type="button" data-edu-toggle="${card.id}">
          ${done ? "Marcar como pendente" : "Marcar como estudado"}
        </button>
      </article>
    `;
  }).join("");
}

function renderAlunoWeeklySchedule(aluno) {
  const painel = getAlunoPainel(aluno.email);
  const agenda = Array.isArray(state.agendaSemanal) ? state.agendaSemanal : [];

  if (!agenda.length) {
    programacaoSemanalAluno.innerHTML = '<div class="empty">Programacao semanal indisponivel no momento.</div>';
    return;
  }

  programacaoSemanalAluno.innerHTML = agenda.map((item) => {
    const dayKey = slugify(item.dia);
    const done = !!painel.semanal[dayKey];
    return `
      <article class="week-card">
        <span class="card-status ${done ? "ok" : ""}">${done ? "Concluido" : "Planejado"}</span>
        <h3>${item.dia}</h3>
        <p>${item.foco}</p>
        <p><strong>Horario:</strong> ${item.horario}</p>
        <button class="mini-btn" type="button" data-week-toggle="${dayKey}">
          ${done ? "Desmarcar treino do dia" : "Marcar treino realizado"}
        </button>
      </article>
    `;
  }).join("");
}

function openAluno(aluno) {
  hideAllPanels();
  alunoPanel.style.display = "block";

  const professor = state.professores.find((item) => norm(item.email) === norm(aluno.professorEmail));
  const treinos = state.treinos
    .filter((treino) => norm(treino.alunoEmail) === norm(aluno.email))
    .slice()
    .sort((a, b) => (a.id < b.id ? 1 : -1));
  const treinoAtual = treinos[0];

  alunoTreinoAtual.textContent = treinoAtual ? treinoAtual.titulo : "Sem treino definido";
  alunoEvolucao.textContent = aluno.evolucao || "Sem dados de evolucao";
  alunoProfessor.textContent = professor ? professor.nome : "Nao definido";
  renderAlunoLearningCards(aluno, treinoAtual);
  renderAlunoWeeklySchedule(aluno);

  const historico = treinos.slice(1);
  if (!historico.length) {
    listaFichasAluno.innerHTML = '<div class="empty">Sem historico adicional. O treino atual ja esta destacado no topo.</div>';
    return;
  }

  listaFichasAluno.innerHTML = historico.map((treino) => `
    <div class="treino-box">
      <h4>${treino.titulo}</h4>
      <p>${treino.descricao.replace(/\n/g, "<br>")}</p>
      <small>Criado em ${treino.criadoEm}</small>
    </div>
  `).join("");
}

function latestTreinoByAluno(alunoEmail) {
  return state.treinos
    .filter((treino) => norm(treino.alunoEmail) === norm(alunoEmail))
    .sort((a, b) => (a.id < b.id ? 1 : -1))[0] || null;
}

function doLogin(event) {
  event.preventDefault();

  const email = norm(emailInput.value);
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    setMsg("Informe e-mail e senha.", "bad");
    return;
  }

  if (email === norm(state.admin.email) && senha === state.admin.senha) {
    setMsg("Acesso administrador liberado.", "ok");
    saveSession({ role: "admin", email: state.admin.email });
    openAdmin();
    return;
  }

  const professor = state.professores.find((item) => norm(item.email) === email && item.senha === senha);
  if (professor) {
    setMsg("Acesso de professor liberado.", "ok");
    saveSession({ role: "professor", email: professor.email });
    openProfessor(professor);
    return;
  }

  const aluno = state.alunos.find((item) => norm(item.email) === email && item.senha === senha);
  if (aluno) {
    setMsg("Acesso de aluno liberado.", "ok");
    saveSession({ role: "aluno", email: aluno.email });
    openAluno(aluno);
    return;
  }

  setMsg("Login invalido.", "bad");
}

function doSignup(event) {
  event.preventDefault();

  const validation = getSignupValidation();
  if (!validation.nome || !validation.email || !validation.senha || !validation.confirmar) {
    setMsg("Preencha todos os campos.", "bad");
    return;
  }

  if (!validation.emailFormat) {
    setMsg("Email invalido.", "bad");
    return;
  }

  if (!validation.emailFree) {
    setMsg("Esse email ja esta cadastrado.", "bad");
    return;
  }

  if (!validation.passwordValid) {
    setMsg("Senha fora do padrao minimo de seguranca.", "bad");
    return;
  }

  if (!validation.match) {
    setMsg("As senhas nao conferem.", "bad");
    return;
  }

  const professorEmail = norm(professorCadastro.value);
  state.alunos.push({
    nome: validation.nome,
    email: validation.email,
    senha: validation.senha,
    professorEmail,
    evolucao: "Evolucao ainda nao registrada"
  });
  if (professorEmail) {
    const professor = state.professores.find((item) => norm(item.email) === professorEmail);
    if (professor && !professor.alunos.includes(validation.email)) professor.alunos.push(validation.email);
  }
  saveState();

  signupForm.reset();
  emailInput.value = validation.email;
  setMode("login");
  updateSignupInteractivity();
  setMsg("Conta criada com sucesso.", "ok");
}

function saveTreino() {
  if (!session || session.role !== "professor") return;

  const professor = state.professores.find((item) => norm(item.email) === norm(session.email));
  if (!professor) return;

  const alunoEmail = norm(alunoTreino.value);
  const titulo = tituloTreino.value.trim();
  const descricao = descricaoTreino.value.trim();

  if (!alunoEmail || !titulo || !descricao) {
    setMsgProfessor("Preencha aluno, titulo e exercicios.", "bad");
    return;
  }

  if (!professor.alunos.includes(alunoEmail)) {
    setMsgProfessor("Aluno nao pertence a sua lista.", "bad");
    return;
  }

  state.treinos.push({
    id: Date.now(),
    professorEmail: professor.email,
    alunoEmail,
    titulo,
    descricao,
    criadoEm: today()
  });

  saveState();
  tituloTreino.value = "";
  descricaoTreino.value = "";
  renderAdminStats();
  renderProfessorStudents(professor);
  renderProfessorTreinos(professor);
  renderAdminTreinosRecentes();
  setMsgProfessor("Treino salvo com sucesso.", "ok");
}

function doLogout() {
  clearSession();
  setMsgProfessor("");
  openLogin();
}

function isEmailTaken(email) {
  const allEmails = [state.admin.email, ...state.professores.map((item) => item.email), ...state.alunos.map((item) => item.email)];
  return allEmails.some((item) => norm(item) === norm(email));
}

function getSignupValidation() {
  const nome = nomeCadastro.value.trim();
  const email = norm(emailCadastro.value);
  const senha = senhaCadastro.value;
  const confirmar = senhaCadastro2.value;
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailFree = emailFormat && !isEmailTaken(email);
  const len = senha.length >= 8;
  const caseMix = /[a-z]/.test(senha) && /[A-Z]/.test(senha);
  const number = /\d/.test(senha);
  const special = /[^A-Za-z0-9]/.test(senha);
  const match = senha.length > 0 && senha === confirmar;
  const passwordValid = len && caseMix && number && special;
  const strength = [len, caseMix, number, special].filter(Boolean).length;
  return { nome, email, senha, confirmar, emailFormat, emailFree, len, caseMix, number, special, match, passwordValid, strength };
}

function setRequirementState(id, ok) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle("ok", !!ok);
}

function setInputState(input, state) {
  input.classList.remove("input-ok", "input-bad");
  if (state === "ok") input.classList.add("input-ok");
  if (state === "bad") input.classList.add("input-bad");
}

function updateSignupInteractivity() {
  const v = getSignupValidation();

  setRequirementState(signupReqIds.len, v.len);
  setRequirementState(signupReqIds.caseMix, v.caseMix);
  setRequirementState(signupReqIds.number, v.number);
  setRequirementState(signupReqIds.special, v.special);
  setRequirementState(signupReqIds.match, v.match);

  const strengthPct = Math.max(0, Math.min(100, v.strength * 25));
  passStrengthFill.style.width = `${strengthPct}%`;
  passStrengthFill.className = "";
  if (v.strength > 0) passStrengthFill.classList.add(`level-${v.strength}`);

  const strengthLabel = ["muito fraca", "fraca", "media", "forte", "excelente"][v.strength] || "aguardando preenchimento";
  passStrengthText.textContent = `Seguranca da senha: ${strengthLabel}`;
  passStrengthText.className = `field-hint ${v.passwordValid ? "ok" : ""}`.trim();

  if (!v.email) {
    emailHint.textContent = "Digite um e-mail valido para continuar.";
    emailHint.className = "field-hint";
    setInputState(emailCadastro, "");
  } else if (!v.emailFormat) {
    emailHint.textContent = "Formato de e-mail invalido.";
    emailHint.className = "field-hint bad";
    setInputState(emailCadastro, "bad");
  } else if (!v.emailFree) {
    emailHint.textContent = "Esse e-mail ja esta em uso.";
    emailHint.className = "field-hint bad";
    setInputState(emailCadastro, "bad");
  } else {
    emailHint.textContent = "E-mail disponivel para cadastro.";
    emailHint.className = "field-hint ok";
    setInputState(emailCadastro, "ok");
  }

  setInputState(senhaCadastro, v.senha.length ? (v.passwordValid ? "ok" : "bad") : "");
  setInputState(senhaCadastro2, v.confirmar.length ? (v.match ? "ok" : "bad") : "");
  setInputState(nomeCadastro, v.nome.length ? "ok" : "");

  signupSubmitBtn.disabled = !(v.nome && v.emailFormat && v.emailFree && v.passwordValid && v.match);
}

tabLogin.addEventListener("click", () => setMode("login"));
tabSignup.addEventListener("click", () => setMode("signup"));
loginForm.addEventListener("submit", doLogin);
signupForm.addEventListener("submit", doSignup);
salvarTreinoBtn.addEventListener("click", saveTreino);
filtroProfessorAdmin.addEventListener("change", renderAdminTreinosRecentes);
filtroAlunoProfessor.addEventListener("input", () => {
  if (!session || session.role !== "professor") return;
  const professor = state.professores.find((item) => norm(item.email) === norm(session.email));
  if (!professor) return;
  renderProfessorStudents(professor, filtroAlunoProfessor.value);
});
alunoPanel.addEventListener("click", (event) => {
  if (!session || session.role !== "aluno") return;
  const aluno = state.alunos.find((item) => norm(item.email) === norm(session.email));
  if (!aluno) return;
  const painel = getAlunoPainel(aluno.email);

  const eduBtn = event.target.closest("[data-edu-toggle]");
  if (eduBtn) {
    const key = eduBtn.dataset.eduToggle;
    painel.estudo[key] = !painel.estudo[key];
    saveState();
    const treinoAtual = latestTreinoByAluno(aluno.email);
    renderAlunoLearningCards(aluno, treinoAtual);
    return;
  }

  const weekBtn = event.target.closest("[data-week-toggle]");
  if (weekBtn) {
    const key = weekBtn.dataset.weekToggle;
    painel.semanal[key] = !painel.semanal[key];
    saveState();
    renderAlunoWeeklySchedule(aluno);
  }
});

adminLogout.addEventListener("click", doLogout);
professorLogout.addEventListener("click", doLogout);
alunoLogout.addEventListener("click", doLogout);
promoDots?.addEventListener("click", (event) => {
  const dot = event.target.closest(".dot[data-dot]");
  if (!dot) return;
  const next = Number(dot.dataset.dot);
  setPromoSlide(next);
  startPromoCarousel();
});
signupForm.addEventListener("input", updateSignupInteractivity);
signupForm.addEventListener("click", (event) => {
  const toggle = event.target.closest(".field-toggle[data-toggle-target]");
  if (!toggle) return;
  const input = $(toggle.dataset.toggleTarget);
  if (!input) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  toggle.textContent = show ? "Ocultar" : "Mostrar";
});

saveState();
setMode("login");
openLogin();
restoreSession();
