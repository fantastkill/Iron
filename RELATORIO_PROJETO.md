> DOCUMENTO HISTÓRICO: descreve a versão demonstrativa anterior. Foi substituído por README.md, supabase/SETUP.md e ENTREGA_FINAL.md para a integração Supabase. Não use os acessos automáticos descritos abaixo.

﻿# RELATÓRIO DE ENTREGA E TRANSFERÊNCIA — IRON PULSE GYM

Data: 12 de novembro de 2026.
Finalidade: transferir o contexto completo a uma IA responsável por revisar o projeto, preparar a entrega no GitHub e apoiar a apresentação acadêmica.

## 1. Orientação à IA que receber este relatório

Atue como revisor técnico e responsável pela preparação da entrega acadêmica. Inspecione os arquivos reais antes de aprovar. Diferencie implementação existente, evidência automatizada e validação visual ainda pendente. Não declare que a faculdade aprovou o projeto: a avaliação pertence ao professor e depende da rubrica da disciplina, que não foi fornecida.

O projeto já está implementado localmente. Não refaça a aplicação sem necessidade. Revise, corrija problemas comprovados, repita as verificações afetadas e prepare um PR claro. Preserve a exigência do usuário de não fazer merge na branch principal nem substituir a versão pública sem autorização explícita.

IMPORTANTE: este relatório não contém o código-fonte completo. Uma IA remota que tenha acesso apenas ao GitHub verá a versão antiga enquanto a branch nova não for enviada. Para implementar ou revisar os arquivos novos, ela precisa de acesso a este diretório local ou de receber os fontes, sem node_modules, .git, dist, logs ou credenciais. As mudanças novas ainda não foram commitadas nem enviadas.

## 2. Identificação e situação de entrega

- Nome: IRON PULSE GYM.
- Natureza: plataforma web fictícia de gerenciamento de academia para fins acadêmicos.
- Diretório: C:\Users\Aluno\Downloads\iron.
- Repositório remoto: https://github.com/fantastkill/Iron.
- URL pública de destino: https://fantastkill.github.io/Iron/.
- Branch local de implementação: feat/iron-pulse-platform.
- Commit-base inspecionado: 8d75232 — docs: add direct link to open app page.
- Situação Git: mudanças locais não commitadas; arquivos novos e alterações/exclusões do legado.
- Push: não realizado.
- Pull request: não criado.
- Merge: não realizado.
- Deploy: não realizado; configuração preparada.
- A versão pública não foi substituída por esta implementação.
- Prévia local: http://127.0.0.1:5173/Iron/.

O diretório estava vazio no início. O repositório indicado foi clonado e a branch de implementação foi criada antes da reconstrução. Não existe AGENTS.md identificado no projeto.

## 3. Objetivo acadêmico e escopo

Demonstrar HTML, CSS, JavaScript, React, componentes reutilizáveis, props, useState, useEffect, Context, eventos, condicionais, formulários, arrays, map/filter, roteamento, persistência local, responsividade e organização de arquivos.

São exatamente seis páginas principais. Há modais de edição dentro dessas páginas, sem rotas adicionais. A solução é frontend estático, sem backend, banco remoto, pagamento, autenticação de produção ou serviço de e-mail.

## 4. Funcionalidades por página

### 4.1 Home — /Iron/#/

- Cabeçalho com identidade IRON PULSE GYM e navegação.
- Hero com chamada, ilustração vetorial e botões de acesso/cadastro.
- Apresentação da estrutura e benefícios.
- Planos fictícios Smart (R$ 79,90), Fit (R$ 99,90) e Black (R$ 159,90).
- Seleção do plano leva ao cadastro com plano preenchido.
- Depoimentos identificados como fictícios.
- FAQ interativo com details/summary.
- Rodapé e identificação de projeto acadêmico.
- Links de seção usam parâmetros de rota compatíveis com HashRouter.

### 4.2 Login e cadastro — /Iron/#/login

- Alternância entre entrar e criar conta.
- Campos de nome, e-mail, senha fictícia, confirmação e plano.
- Validação obrigatória, senha mínima de seis caracteres, confirmação e e-mail duplicado.
- Exibição e ocultação de senha.
- Feedback de erro e sucesso.
- Perfis demonstrativos Administrador, Professor e Aluno.
- Modo visitante, sem registros de progresso ou medidas.
- Recuperação de senha simulada: explica o funcionamento e não envia e-mail.
- Redirecionamento conforme o perfil.
- Logout pela barra lateral dos painéis.
- Nenhuma senha é gravada em localStorage.

A senha não é realmente autenticada: qualquer senha fictícia com seis caracteres é aceita para uma conta existente. Os botões de perfil permitem entrar sem digitação. Esse comportamento é didático e aparece explicado na interface.

### 4.3 Administrador — /Iron/#/admin

- Métricas de alunos, professores, fichas e alunos ativos.
- Gráfico da distribuição de alunos por professor.
- Indicadores de registros de treino e alunos sem professor.
- Abas para alunos e professores.
- Pesquisa por nome ou e-mail.
- Cadastro, edição e exclusão de alunos e professores.
- Edição de plano, professor responsável e status do aluno.
- Confirmação antes de excluir.
- Exclusão de aluno remove fichas, medidas, histórico e conclusões relacionadas.
- Exclusão de professor deixa os alunos sem professor para futura atribuição.
- Estados vazios e mensagens de feedback.

### 4.4 Professor — /Iron/#/professor

- Saudação personalizada.
- Resumo de alunos sob orientação, fichas desses alunos e catálogo de exercícios.
- Lista de todos os alunos, com identificação do professor responsável.
- Pesquisa por nome e seleção de aluno.
- Consulta de fichas existentes.
- Criação, edição, atribuição e exclusão de fichas.
- Título da ficha, aluno, dias da semana e exercícios.
- Séries, repetições e descanso por exercício.
- Adição e remoção de exercícios na ficha.
- Confirmação antes de excluir a ficha.

O professor pode gerenciar fichas da base demonstrativa inteira; não há isolamento de dados entre professores.

### 4.5 Aluno — /Iron/#/aluno

- Saudação personalizada, plano e professor responsável.
- Divisão semanal com seleção de dia.
- Ficha do dia e escolha entre várias fichas no mesmo dia.
- Lista de exercícios com séries, repetições e descanso.
- Marcação e desmarcação de exercícios concluídos.
- Barra de progresso com percentual atualizado.
- Registro automático no histórico ao concluir todos os exercícios.
- Últimas conquistas e acesso à evolução.
- Estados para visitante, ausência de ficha e dia sem treino.

A divisão semanal é uma consulta. Marcações são sempre registradas na data de hoje, mesmo ao selecionar outro dia da semana. Os treinos iniciais estão em Seg, Qua e Sex; selecione um desses dias caso a apresentação ocorra em outro dia.

### 4.6 Evolução e histórico — /Iron/#/evolucao

- Histórico de treinos concluídos.
- Frequência dos últimos sete dias.
- Gráfico de evolução de peso.
- Indicadores de treinos no período, último peso e variação no período.
- Registro de data, peso, cintura e tórax.
- Validação de limites numéricos e impedimento de datas futuras.
- Um registro de medidas por aluno e data; salvar na mesma data substitui o anterior.
- Filtros de 30, 90 e 365 dias.
- Tabela de medidas, estados vazios e mensagem motivacional.
- Link de retorno ao painel do aluno.

## 5. Base fictícia inicial

- 3 professores: Rafael Costa, Camila Rocha e Bruno Lima.
- 12 alunos, dos quais 11 começam ativos.
- 12 exercícios de catálogo.
- 12 fichas iniciais, uma por aluno.
- Fichas iniciais com quatro exercícios e divisão em Seg, Qua e Sex.
- 6 registros de histórico do primeiro aluno.
- 3 registros iniciais de medidas do primeiro aluno.
- Datas geradas relativamente à inicialização, evitando histórico preso a uma data fixa.

Contas de exemplo:

| Perfil | E-mail | Acesso |
| --- | --- | --- |
| Administrador | admin@demo.local | Botão Administrador ou senha fictícia de 6+ caracteres |
| Professor | rafael@demo.local | Botão Professor ou senha fictícia de 6+ caracteres |
| Aluno | aluno1@demo.local | Botão Aluno ou senha fictícia de 6+ caracteres |

Não inserir credenciais ou informações pessoais reais.

## 6. Arquitetura e regras de estado

A entrada main.jsx monta o React, HashRouter, AppProvider e as seis rotas. AppProvider centraliza dados, sessão e notificações. As páginas usam esse estado compartilhado, evitando bases separadas por painel. Alterações refletem imediatamente nos componentes da mesma aba.

Persistência:

- iron-data-v1: professores, alunos, fichas, conclusões, histórico e medidas.
- iron-session: identificação e perfil simulados.
- Conclusão de exercício: chave composta por aluno, ficha e data.
- Concluir todos os exercícios cria um registro por aluno/ficha/data.
- Desmarcar um exercício retira o registro de conclusão desse treino naquele dia.
- Restaurar demonstração pede confirmação, recria a base e encerra a sessão.
- Falha de escrita no armazenamento mostra aviso; o estado em memória continua utilizável.

ProtectedRoute direciona usuários sem sessão ao login e perfis incompatíveis ao próprio painel. Isso é controle de interface, não segurança de produção.

## 7. Tecnologias

As faixas exatas declaradas estão em package.json; as versões resolvidas estão em package-lock.json.

- React e React DOM: ^19.0.0.
- React Router DOM: ^7.1.0.
- Lucide React: ^0.468.0.
- Recharts: ^3.10.1.
- Vite: ^6.1.0; build observado com Vite 6.4.6.
- Plugin React do Vite: ^4.7.0.
- Vitest: ^5.1.0; execução observada com Vitest 5.1.0.
- jsdom: ^26.0.0.
- Testing Library React: ^16.1.0.
- Testing Library User Event: ^14.6.0, disponível no ambiente de teste.
- Prettier: ^3.10.1.
- JavaScript e JSX; sem TypeScript.
- CSS responsivo, sem framework visual externo.
- Node usado no desenvolvimento: 22.14.0.

## 8. Estrutura dos arquivos da implementação

```text
iron/
├── .github/
│   └── workflows/
│       └── pages.yml
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── UI.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── data/
│   │   └── seed.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Admin.jsx
│   │   ├── Professor.jsx
│   │   ├── Student.jsx
│   │   └── Evolution.jsx
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── progress.js
│   ├── App.test.jsx
│   └── main.jsx
├── .editorconfig
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── RELATORIO_PROJETO.md
└── RELATORIO_PROJETO.txt
```

Há configurações de editor preexistentes em .vscode. node_modules, dist e logs são gerados localmente e não devem ser commitados. Não foi necessário criar src/hooks porque não há hook customizado que justifique uma camada extra.

Responsabilidades:

- Layout.jsx: Logo, Header, Footer, ProtectedRoute e layout com barra lateral.
- UI.jsx: Button, Card, Input, Empty e PageTitle.
- AppContext.jsx: estado compartilhado, persistência, sessão, notificações e restauração.
- seed.js: catálogo e geração dos exemplos.
- progress.js: regra de conclusão e histórico por aluno, ficha e data.
- global.css: identidade, grids, formulários, modais, painéis, responsividade e foco.

Legado substituído: style.css, script.js e iron-pulse-all-in-one.html. Documentos antigos DEMO.md, ENGENHARIA_SOFTWARE.md, REDESIGN.md e SPOTIFY_DESIGN.md foram removidos da árvore atual porque descreviam a implementação anterior. Todos continuam recuperáveis no histórico Git. README.md foi reescrito.

## 9. Design e acessibilidade

- Predomínio de preto/grafite com vermelho como destaque.
- Tipografia Barlow Condensed e DM Sans via Google Fonts.
- Fallbacks locais para funcionamento sem fontes externas.
- Ilustração e ícones vetoriais via Lucide, sem dependência de fotografias externas.
- Cards, botões, tabelas, modais e mensagens consistentes.
- Layout adaptável para desktop e celular.
- Tabelas com rolagem quando necessário.
- Labels em formulários, rótulos acessíveis em ações de ícone e foco visível.
- Feedback com role=status e erros com role=alert.
- Preferência por movimento reduzido respeitada no CSS.

Não foi realizada auditoria completa WCAG nem validação visual automatizada. A revisão de navegação por teclado, foco dos modais, contraste e leitor de tela permanece recomendada antes da apresentação.

## 10. Testes e evidências

A suíte contém 14 testes:

1. Login obrigatório para painel protegido.
2. Restauração dos dados com confirmação e encerramento da sessão.
3. Logout.
4. Home, links de plano/cadastro e FAQ.
5. Redirecionamento de perfil demonstrativo.
6. Cadastro, confirmação de senha e ausência de senha persistida.
7. Cadastro, pesquisa, edição e exclusão de aluno.
8. Edição/exclusão de professor e remoção das atribuições.
9. Criação, edição e exclusão de ficha atribuída.
10. Conclusão de exercícios, progresso e histórico diário único.
11. Registro/substituição de medidas na mesma data e filtro de período.
12. Proteção contra navegação para painel de outro perfil.
13. Persistência após remontar a aplicação.
14. Isolamento de conclusão por aluno e data.

Evidência anterior à elaboração deste relatório: 14/14 testes aprovados; build concluído sem avisos; zero vulnerabilidades reportadas pelo npm na instalação final. Uma nova execução de testes e build foi iniciada durante a elaboração; seu resultado será registrado ao final deste documento.

Os testes DOM usam mocks dos componentes de gráficos. Build bem-sucedido confirma compilação, mas não prova que gráficos renderizam corretamente em todos os tamanhos. Responsividade foi implementada e revisada no CSS, sem sessão de inspeção visual automatizada. O site novo não foi testado em produção porque não foi publicado.

Servidor local: iniciado e respondeu HTTP 200 em http://127.0.0.1:5173/Iron/. A abertura automática do navegador foi bloqueada pela política de execução; o link pode ser aberto manualmente.

## 11. Execução local

No PowerShell:

```powershell
cd C:\Users\Aluno\Downloads\iron
npm.cmd ci
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Use http://127.0.0.1:5173/Iron/.

Para conferir o build:

```powershell
npm.cmd run preview
```

Use http://127.0.0.1:4173/Iron/.

Em shells sem bloqueio de scripts PowerShell, npm pode substituir npm.cmd. Não é preciso alterar a política de execução do Windows.

## 12. Preparação e revisão no GitHub

A IA deve começar com git status, git remote -v e git branch --show-current. Confirmar o repositório fantastkill/Iron e preservar mudanças locais. Não executar git reset --hard nem sobrescrever trabalho existente.

Etapas propostas:

1. Inspecionar código, README, package.json, lockfile e workflow.
2. Confirmar a rubrica acadêmica se estiver disponível; não inventar requisitos do professor.
3. Executar npm ci, npm test e npm run build.
4. Consultar npm audit para a situação atual; não tratar o resultado anterior como garantia futura.
5. Testar visualmente as seis páginas em desktop e celular.
6. Testar navegação, refresh, troca de perfil, CRUD, persistência, progresso, medidas e restauração.
7. Revisar git diff e garantir que node_modules, dist, .env e logs não entram no commit.
8. Commitar os fontes na branch de implementação e enviá-la ao remoto quando autorizado no contexto de execução da IA.
9. Abrir PR para a branch padrão real do repositório; não assumir que o nome é main.
10. Documentar problema, solução, testes, limitações e ausência de autenticação real no PR.
11. Apresentar o PR e a prévia ao usuário para aprovação concreta de merge/publicação.
12. Somente após autorização explícita, fazer merge e executar deploy.

Título sugerido de PR: feat: reconstruir IRON PULSE GYM com seis páginas React.

Descrição sugerida de PR:

Reconstrói a demonstração acadêmica da academia com seis páginas integradas em React, CRUD de alunos e professores, fichas de treino, progresso diário e evolução de medidas persistidos no navegador. Configura HashRouter e base /Iron/ para GitHub Pages e adiciona publicação manual por Actions. A autenticação é explicitamente simulada e nenhuma senha é persistida. Validação: 14 testes e build de produção; inspeção visual e teste pós-publicação devem constar com seu resultado real.

## 13. Publicação preparada

Arquivo: .github/workflows/pages.yml.
Nome: Publish IRON PULSE (manual).
Disparo: workflow_dispatch, sem deploy automático por push.

Job build:

- Checkout do repositório.
- Node 22 e cache npm.
- npm ci.
- npm test.
- npm run build.
- Configuração do Pages e upload do artifact dist.

Job deploy:

- Depende do build.
- Usa environment github-pages.
- Publica com actions/deploy-pages.
- Permissões: contents:read, pages:write, id-token:write.
- Concurrency evita publicações simultâneas concorrentes.

Após aprovação de substituição da versão pública:

1. Garantir que o workflow está na branch padrão.
2. Configurar Settings → Pages → Source como GitHub Actions.
3. Verificar permissões de Actions e regras do environment.
4. Executar manualmente o workflow na branch aprovada.
5. Aguardar sucesso e registrar o link da execução e o commit publicado.
6. Abrir https://fantastkill.github.io/Iron/ e testar as seis rotas.
7. Testar refresh em /Iron/#/aluno e caminhos de assets.
8. Se houver regressão, restaurar uma versão previamente aprovada pelo histórico/fluxo de publicação, sem apagar commits indiscriminadamente.

Base Vite: /Iron/.
Roteador: HashRouter, para não depender de reescrita de rotas do GitHub Pages.

## 14. Critérios para considerar a entrega pronta para apresentação

- Exatamente seis rotas principais navegáveis.
- Ausência de imports, assets ou links internos quebrados.
- Login, cadastro e perfis explicados como simulação.
- CRUD de alunos/professores demonstrável.
- Ficha criada pelo professor aparece para o aluno.
- Conclusões atualizam percentual e histórico sem duplicar no mesmo dia.
- Registro de medidas atualiza tabela e evolução.
- Refresh preserva dados no mesmo navegador.
- Logout e restauração funcionam.
- Layout legível no celular e no projetor da apresentação.
- Console do navegador revisado e sem erros relevantes.
- Testes e build aprovados no commit final.
- README condizente com o código entregue.
- Dados fictícios identificados e nenhuma credencial real no Git.
- PR revisado e deploy autorizado antes de substituir a versão pública.
- URL pública efetivamente validada depois de publicar.

O atendimento desses critérios apoia a revisão técnica; não garante nota ou aprovação acadêmica.

## 15. Roteiro de apresentação ao professor — aproximadamente 8 a 10 minutos

1. Contexto e objetivo, 1 minuto: explicar que é um sistema frontend acadêmico para academia fictícia, com três perfis e armazenamento local.
2. Home, 1 minuto: mostrar identidade, planos fictícios, botões e FAQ.
3. Login, 1 minuto: alternar cadastro, provocar erro de confirmação e mostrar entrada por perfil. Explicar que senhas não são persistidas.
4. Administrador, 2 minutos: mostrar métricas, criar aluno com dados fictícios, pesquisar, editar plano/professor e explicar confirmação de exclusão.
5. Professor, 1 a 2 minutos: sair, entrar como professor, selecionar Lucas e criar ficha com título, dia, exercícios e parâmetros.
6. Aluno, 1 minuto: sair, entrar como aluno, selecionar o dia programado e concluir os exercícios até 100%.
7. Evolução, 1 minuto: abrir histórico, registrar medidas fictícias, trocar período e atualizar a página para mostrar persistência.
8. Encerramento técnico, 1 minuto: mostrar src/pages, componentes reutilizáveis, Context, função de progresso, testes e workflow. Explicar limitações e restaurar a demonstração se desejado.

Perguntas técnicas prováveis:

- Por que React? Componentes reutilizáveis e atualização de interface a partir do estado.
- Por que Context? Compartilhar a mesma base entre perfis e páginas sem duplicação de estado.
- Por que localStorage? Persistência simples para uma demonstração sem backend.
- Por que HashRouter? Compatibilidade de refresh com hospedagem estática no GitHub Pages.
- Isso é autenticação segura? Não; é simulação explícita para o objetivo acadêmico.
- Como evita duplicação de treino concluído? A regra usa aluno, ficha e data e substitui o registro correspondente.
- Como testar? Suíte Vitest/Testing Library, build e verificação manual no navegador.

## 16. Limitações e pendências reais

- Não há backend ou banco compartilhado entre dispositivos.
- Dados e sessão podem ser editados no navegador.
- Não há autenticação, autorização ou recuperação de senha reais.
- Não há sincronização automática entre abas abertas.
- Perfis de professor não têm isolamento de segurança.
- Visitante não recebe uma ficha demonstrativa própria; visualiza estados vazios.
- Conteúdo, preços, depoimentos, histórico e medidas são fictícios.
- Não há pagamentos, e-mails, notificações externas ou avaliação clínica.
- Fontes externas dependem de conexão, com fallback local.
- Não há garantia de acessibilidade integral sem auditoria adicional.
- Gráficos não foram inspecionados visualmente por automação.
- A publicação depende do envio dos fontes, aprovação de merge e configuração do Pages.
- O relatório não substitui acesso ao código e não comprova aprovação do professor.

## 17. Entrega esperada da próxima IA

Apresente: achados de revisão por gravidade; correções efetivamente aplicadas; resultados exatos de testes/build/audit; link do PR quando criado; estado de aprovação; commit e execução de deploy quando autorizados; URL pública testada; pendências restantes e roteiro final da apresentação. Não declare concluída uma etapa que não foi executada.

## 18. Resultado atualizado das verificações nesta entrega

Verificações repetidas em 12/11/2026:

- npm run build: aprovado, sem avisos de build, duração de 46,80 segundos.
- Assets gerados: CSS 29,28 kB; aplicação 305,44 kB; gráficos 410,71 kB, antes de gzip.
- npm test executado isoladamente: 14/14 aprovados, duração total de 19,14 segundos.
- npm audit --json: exit code 0; zero vulnerabilidades reportadas.
- Prévia local: HTTP 200 em http://127.0.0.1:5173/Iron/.
- git diff --check: nenhuma falha de whitespace; apenas avisos de conversão LF/CRLF do Git no Windows.

Observação de confiabilidade: na primeira repetição desta entrega, testes e build rodaram simultaneamente. O teste de criação/edição/exclusão de ficha excedeu o timeout de 5 segundos (5,252 s), resultando em 13 aprovados e 1 falha por tempo, sem falha de asserção registrada. Ao repetir a suíte sozinha, todos os 14 passaram sem alterar o código. Portanto, há sensibilidade ao desempenho do ambiente; executar os checks em sequência. Se o timeout se repetir, investigar o custo do teste e do DOM antes de apenas elevar o limite. O workflow já executa testes e build em sequência.

O servidor de desenvolvimento foi deixado ativo para visualização. A abertura automática do navegador foi tentada, mas bloqueada pela política de execução do ambiente. Nenhum merge, push ou deploy foi realizado durante a elaboração deste relatório.
