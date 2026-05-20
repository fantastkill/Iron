# Engenharia de Software - Iron Pulse Gym

## Equipe
- Mayk da Silva Santos - RGM 26110772
- Gian Luca Bin Tortato - RGM 26110808
- Pedro Henrique de Carvalho - RGM 26110727
- Emily Moreira dos Santos - RGM 2518926
- Joao Vitor dos Santos Matos - RGM 6818232

Data: Maio de 2026

## Introducao
O sistema Iron Pulse Gym e um aplicativo para gestao de academia voltado para tres perfis:
- Aluno
- Personal trainer (professor)
- Administrador

Objetivo principal:
- Centralizar treinos, acompanhamento e operacoes administrativas em uma unica plataforma.

Beneficios esperados:
- Organizacao do trabalho interno da academia
- Melhor comunicacao entre alunos e professores
- Acompanhamento de desempenho com mais clareza
- Base para escalabilidade de novos modulos

## Levantamento de Requisitos

### Requisitos Funcionais (RF)
- RF01: cadastro de usuarios (aluno, professor, administrador)
- RF02: login e autenticacao por e-mail e senha
- RF03: recuperacao de senha por e-mail
- RF04: cadastro de treinos personalizados por professor
- RF05: visualizacao de treinos diarios/semanais pelo aluno
- RF06: registro de evolucao fisica (peso, medidas, gordura)
- RF07: controle de frequencia
- RF08: gestao de pagamentos/mensalidades
- RF09: notificacoes de treinos, metas e vencimentos
- RF10: historico de exercicios
- RF11: chat entre aluno e professor
- RF12: relatorios gerenciais administrativos

### Requisitos Nao Funcionais (RNF)
- RNF01: seguranca de dados com criptografia
- RNF02: resposta em ate 3 segundos
- RNF03: disponibilidade minima de 99%
- RNF04: compatibilidade com Android e iOS
- RNF05: escalabilidade sem perda significativa de desempenho
- RNF06: usabilidade com interface intuitiva
- RNF07: backup automatico diario

## Analise e Modelagem

### 1) Casos de Uso
Atores:
- Aluno
- Personal trainer
- Administrador

Aluno:
- realizar login
- visualizar treino
- registrar evolucao
- consultar historico
- receber notificacoes
- conversar com professor

Personal trainer:
- realizar login
- criar treino
- editar treino
- acompanhar evolucao
- conversar com aluno

Administrador:
- gerenciar usuarios
- controlar pagamentos
- emitir relatorios
- gerenciar planos

### 2) Diagrama de Classes (representacao textual)
Usuario
- id
- nome
- email
- senha
- tipoUsuario
- login()
- logout()

Aluno (herda Usuario)
- peso
- altura
- percentualGordura
- visualizarTreino()
- registrarEvolucao()

PersonalTrainer (herda Usuario)
- cref
- especialidade
- criarTreino()
- editarTreino()

Treino
- idTreino
- nome
- descricao
- duracao
- adicionarExercicio()

Exercicio
- idExercicio
- nome
- series
- repeticoes

Pagamento
- idPagamento
- valor
- data
- status

Notificacao
- idNotificacao
- mensagem
- dataEnvio

Relacionamentos:
- Usuario <|-- Aluno
- Usuario <|-- PersonalTrainer
- Aluno --- Treino
- Treino --- Exercicio
- Aluno --- Pagamento
- Aluno --- Notificacao

### 3) Sequencia (fluxo principal de visualizacao de treino)
1. Aluno realiza login no app
2. App valida credenciais no sistema
3. Sistema consulta dados no banco
4. Sistema retorna autenticacao
5. Aluno solicita treino
6. Sistema consulta treino no banco
7. App exibe treino para o aluno

### 4) Atividades (cadastro de treino)
1. Personal faz login
2. Seleciona aluno
3. Cria treino
4. Adiciona exercicios
5. Define series/repeticoes
6. Salva treino
7. Sistema valida dados
8. Treino e armazenado
9. Aluno recebe notificacao

### 5) Arquitetura em Camadas
- Camada de apresentacao: interface (web/mobile)
- Camada de negocio: regras e validacoes
- Camada de persistencia: acesso a dados
- Banco de dados: armazenamento

## Metodologia

Metodologia escolhida: Agil com Scrum.

Motivos:
- flexibilidade para mudancas
- entregas incrementais
- validacao continua com usuarios
- melhor comunicacao da equipe

Fases:
1. Levantamento de requisitos
2. Planejamento
3. Modelagem
4. Desenvolvimento
5. Testes
6. Implantacao
7. Manutencao

## Implementacao

### Tecnologias propostas
- Front-end: HTML5, CSS3, JavaScript
- Bibliotecas/frameworks: Bootstrap, React, Axios
- Back-end: Node.js, Express
- Banco: MySQL
- Ferramentas: Git, GitHub, VS Code, Figma

### Estrutura de projeto proposta
```text
academia-app/
|-- public/
|   |-- index.html
|-- src/
|   |-- components/
|   |-- pages/
|   |-- services/
|   |-- styles/
|   |-- assets/
|   `-- App.js
|-- backend/
|   |-- routes/
|   |-- controllers/
|   |-- models/
|   |-- config/
|   `-- server.js
|-- package.json
`-- README.md
```

## Testes e Qualidade

### Casos de teste (resumo)
- CT01: login de usuario cadastrado
- CT02: recuperacao de senha
- CT03: criacao de treino por personal
- CT04: visualizacao de treino por aluno
- CT05: registro de pagamento
- CT06: registro de evolucao
- CT07: envio de mensagem
- CT08: geracao de relatorio

### Metricas
- Tempo de resposta: ate 3 segundos
- Disponibilidade alvo: 99%
- Usabilidade: interface simples e intuitiva
- Manutenibilidade: separacao em camadas/componentes
- Seguranca: protecao de credenciais e dados sensiveis

## Status Atual do Projeto Web (maio/2026)

Implementado no prototipo atual:
- login por perfil (admin, professor, aluno)
- painel administrativo com contadores
- gestao basica de alunos por professor
- criacao de fichas de treino
- visualizacao de fichas no painel do aluno
- persistencia local com localStorage

Ainda pendente para atender todos os RF:
- recuperacao de senha (RF03)
- registro completo de evolucao fisica (RF06)
- controle de frequencia (RF07)
- pagamentos (RF08)
- notificacoes (RF09)
- historico completo de exercicios (RF10)
- chat aluno-professor (RF11)
- relatorios gerenciais completos (RF12)

## Conclusao
O Iron Pulse Gym apresenta base funcional consistente para evolucao do sistema. A estrutura atual ja atende o nucleo de autenticacao e fluxo de treino, e o documento define o caminho para a expansao dos modulos administrativos, financeiros e de comunicacao em proximas sprints.
