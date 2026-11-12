# IRON PULSE GYM

Projeto acadêmico de gerenciamento de academia em React, Vite e JavaScript. A interface preta/grafite/vermelha foi preservada; a versão atual substitui o acesso demonstrativo por integração com **Supabase Auth e PostgreSQL com RLS**.

**Estado:** integração implementada, mas o usuário ainda não possui projeto Supabase. Não há credenciais, migração aplicada no serviço, integração hospedada validada ou publicação desta versão. Sem configuração, Home e Login são públicos e os painéis permanecem bloqueados. Não existe login fictício, visitante autenticado ou botão que escolha um papel.

## Execução

Requer Node.js 22.14+ e npm.

```sh
npm ci
npm test
npm run build
npm audit
npm run dev
```

Abra http://127.0.0.1:5173/Iron/. No PowerShell, use npm.cmd se a execução de npm.ps1 estiver bloqueada. O build fica em dist; npm run preview usa http://127.0.0.1:4173/Iron/.

Copie .env.example para .env.local e configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY públicas. Nenhuma chave administrativa pode ser exposta no Vite. Consulte [o guia completo](supabase/SETUP.md) para criar o projeto, aplicar SQL, configurar Auth, e-mails, convites, primeiro administrador e testes reais.

## As seis páginas

| Rota após /Iron/# | Conteúdo |
| --- | --- |
| / | Academia, planos acadêmicos, depoimentos fictícios, benefícios e FAQ |
| /login | Cadastro de aluno, login, confirmação via provedor, recuperação e definição de senha |
| /admin | Gestão de cadastros, convites, atribuição de professor, planos e consulta autorizada de fichas |
| /professor | Alunos atribuídos, CRUD de fichas e histórico autorizado |
| /aluno | Próprio plano, professor, semana, exercícios, progresso e consentimento administrativo |
| /evolucao | Histórico próprio, frequência, gráfico de peso e registro privado de medidas |

HashRouter e base Vite /Iron/ preservam navegação e refresh no GitHub Pages. Convites e recuperação são estados da página Login, sem páginas principais extras.

## Cadastro, login e perfis

- **Aluno:** Home → escolher plano → cadastro público → confirmação de e-mail quando exigida → login → /aluno.
- **Professor:** administrador autenticado → convite → destinatário define senha → login → /professor.
- **Administrador:** provisionado pelo proprietário do Supabase, fora do cadastro público → login → /admin.

Login usa signInWithPassword. Senha incorreta ou e-mail inexistente não abrem sessão. O papel é lido de profiles após validação da identidade no provedor. ProtectedRoute espera essa consulta e não confia na sessão demonstrativa antiga. Logout usa o provedor. O SDK administra persistência e renovação da sessão; o código não grava senha, hashes ou tokens administrativos.

Cadastro público aceita somente aluno. O servidor ignora metadata role editável; apenas um convite previamente autorizado pode criar professor. A edição administrativa não possui parâmetro para mudar papel. E-mail de uma conta existente não é alterado no cadastro administrativo para evitar divergência com Auth.

## Dados e segurança

Nenhum dado demonstrativo local é importado. Cada conta começa sem fichas e histórico; um professor precisa ser atribuído e criar o treino. O catálogo de 12 exercícios é conteúdo estático, não cadastro de usuários.

As políticas RLS ficam na migração versionada. Professor consulta somente alunos atribuídos e cria/edita suas fichas. Aluno acessa suas fichas e conclusões; medidas são privadas inclusive perante professor e administrador. O administrador gerencia cadastros e planos; para consultar treinos/histórico precisa de consentimento do próprio aluno, concedido e revogado na área do aluno.

O progresso é atualizado por RPC transacional com validação do aluno, exercício e data de São Paulo; não pode ser forjado por inserção direta no histórico. Um registro de medida por aluno/data é atualizado por upsert. A consulta dos painéis é renovada ao focar a janela e a cada 30 segundos; persistência é no banco entre dispositivos, sem prometer sincronização instantânea.

A função de servidor manage-users valida JWT e papel antes de usar o cliente administrativo. Excluir uma conta exige confirmação na interface e autorização no servidor; a exclusão no Auth remove dados por cascata. Chaves administrativas ficam somente no runtime Supabase.

## Estrutura

```text
.github/workflows/ci.yml              checks sem deploy
.github/workflows/pages.yml           publicação manual com integração obrigatória
src/components/{Layout,UI}.jsx        componentes compartilhados e guardas
src/context/AppContext.jsx           sessão, perfil, dados, operações e feedback
src/data/seed.js                      somente catálogo e data; sem usuários fictícios
src/pages/{Home,Login,Admin,Professor,Student,Evolution}.jsx
src/services/supabase.js              configuração pública e callback PKCE/convite
src/services/api.js                   consultas e operações Auth/banco/Edge
src/styles/global.css                identidade e responsividade
src/utils/progress.js                 chave de leitura por aluno/ficha/data
src/App.test.jsx                      contratos e interface com SDK mockado
src/database.test.js                  migração e RLS em PostgreSQL local
src/services/supabase.test.js         callbacks do provedor
supabase/migrations/202611120001_iron.sql
supabase/functions/manage-users/index.ts
supabase/config.toml
supabase/SETUP.md
scripts/check-config.mjs
scripts/integration.mjs
e2e/public.spec.js
playwright.config.js
.env.example
.env.integration.example
index.html
vite.config.js
package.json
package-lock.json
APRESENTACAO_PROFESSOR.md
ENTREGA_FINAL.md
README.md
```

Os relatórios RELATORIO_PROJETO.md/.txt são históricos da versão demonstrativa e foram marcados como substituídos. Não siga as antigas instruções de acesso automático.

## Tecnologias e objetivo didático

React/React DOM, JavaScript/JSX, Vite, React Router, Lucide React, Recharts, Supabase JS, CSS Grid/Flexbox, fontes DM Sans e Barlow Condensed com fallback. Testes: Vitest, Testing Library, jsdom, PGlite e Playwright. Prettier para formatação.

O código demonstra componentes, props, useState/useEffect, Context API, eventos, formulários, map/filter, roteamento, requisições assíncronas, feedback de carregamento, autenticação, autorização e persistência em banco. Não há TypeScript no frontend; o arquivo de Edge Function usa o runtime TypeScript padrão do Supabase.

## Testes

```sh
npm test
npm run build
npm audit
npm exec -- playwright install chromium
npm run test:e2e
```

Testes DOM usam SDK mockado, sem comprovar Auth real. PGlite executa SQL/RLS em PostgreSQL local com tabela Auth mínima, sem comprovar SMTP ou Supabase hospedado. Playwright verifica Home, plano selecionado, Login, proteção/refresh das rotas sem sessão e largura em 390/1366px. Não valida os painéis autenticados contra serviço real sem configuração.

Para integração hospedada, siga supabase/SETUP.md, preencha .env.integration.local ignorado e rode npm run test:integration. O script bloqueia com configuração ausente. Cadastro, duplicidade, e-mails, convites, recuperação, sessões e visual dos painéis ainda exigem validação manual real.

## GitHub Pages

Repositório: https://github.com/fantastkill/Iron. Branch de implementação: feat/iron-pulse-platform. Destino: https://fantastkill.github.io/Iron/.

O usuário autorizou publicar **somente após** testes aprovados e autenticação configurada/validada. Essa condição ainda não foi atingida. A configuração recebida do conector GitHub permite leitura, sem push; confira ENTREGA_FINAL.md para o resultado da tentativa de envio por Git e demais bloqueios reais.

O workflow de publicação é manual e requer Variables públicas Supabase e Secrets de quatro contas de teste dedicadas, descritas no guia. Executa npm ci, testes, validação do ambiente, integração real, build e publica dist. ci.yml revisa a branch/PR sem publicar. Não coloque .env, node_modules, dist, artifacts ou logs no commit.

## Limitações

Academia, planos e depoimentos continuam acadêmicos; não há pagamentos. Não inserir informações clínicas reais para uma apresentação. O projeto depende de Supabase, SMTP, quotas e conexão configurados pelo proprietário. A revisão não é uma certificação de segurança nem substitui testes no serviço real. Não há confirmação de aprovação pela faculdade. O roteiro e a explicação dos conceitos estão em APRESENTACAO_PROFESSOR.md.
