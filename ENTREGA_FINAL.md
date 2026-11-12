# Entrega final — IRON PULSE GYM

Atualização: 12 de novembro de 2026.
Repositório confirmado: https://github.com/fantastkill/Iron.
Branch de trabalho: feat/iron-pulse-platform.
Destino do PR: main, confirmado na API do GitHub.
Site de destino: https://fantastkill.github.io/Iron/.

## Resultado implementado

As seis páginas foram preservadas, com React, Vite, JavaScript, Supabase Auth e PostgreSQL/RLS. A identidade preta/grafite/vermelha continua a mesma.

- Home com o título solicitado: TRANSFORME SUA FORÇA. SUPERE SEUS LIMITES.
- Comunicação pública profissional, sem rótulos acadêmicos desnecessários.
- Remoção de depoimentos, contatos, localização, horários e benefícios comerciais não confirmados.
- Planos Smart/Fit/Black como preferências no cadastro, sem contratação ou cobrança implícitas.
- Preços ocultos por padrão; um administrador precisa confirmar o valor e autorizar sua exibição.
- Cadastro público somente de aluno, login obrigatório, recuperação, sessão persistida pelo SDK e retorno PKCE/convite.
- Administração de cadastros, professores, atribuições, planos e consulta autorizada de fichas.
- Filtros por situação/plano e exportação CSV dos cadastros visíveis, protegida contra fórmulas.
- Professor restrito aos alunos atribuídos; fichas com exercícios personalizados, séries, repetições, intervalos e semana.
- Aluno com plano selecionado, professor, treinos, conclusões, progresso, histórico e consentimento administrativo.
- Evolução com medidas próprias, gráficos e período personalizado por datas.
- Modais com foco inicial, contenção de Tab, Escape e retorno do foco.
- Link para saltar ao conteúdo, responsividade em celular/tablet/desktop e mensagens de erro em português sem exposição de erros SQL.
- Atualização dos dados evita respostas antigas de consultas durante uma gravação; falha de atualização após uma gravação não é apresentada como falha de salvamento.

## Arquivos alterados nesta etapa

Home.jsx, Login.jsx, Admin.jsx, Professor.jsx, Student.jsx, Evolution.jsx, Layout.jsx, AppContext.jsx, api.js, global.css e os testes existentes. Novos componentes/utilitários: Modal.jsx, dates.js, errors.js, reports.js e product.test.js.

Nova migração: supabase/migrations/202611120002_publish_prices.sql. Executar após 202611120001_iron.sql. O guia supabase/SETUP.md explica a ordem e a autorização de publicação de preços.

README.md, APRESENTACAO_PROFESSOR.md, supabase/SETUP.md, PR_DESCRIPTION.md e este relatório documentam a implementação e seus limites. Os relatórios anteriores permanecem identificados como históricos.

## Verificações realizadas

- npm ci: aprovado, instalação reprodutível com o lockfile.
- npm test: 55/55 aprovados em 4 arquivos, execução observada em 18,02 segundos.
- PostgreSQL local/PGlite: migrações, RLS, RPCs, isolamento e publicação explícita de preço executados pelos testes.
- npm run build: aprovado, com divisão dos bundles de aplicação, Supabase e gráficos, sem aviso de tamanho.
- npm audit: zero vulnerabilidades reportadas.
- Playwright: 3/3 aprovados em 390px, 768px e 1366px, execução observada em 33,6 segundos.
- Navegador: título da Home, ausência de rótulos demonstrativos/ofertas sem confirmação, plano selecionado, salto por teclado, ausência de rolagem horizontal, ausência de atalhos por perfil e refresh das quatro rotas privadas sem sessão.
- Screenshots de Home/Login gerados em artifacts/ e inspecionados; artifacts não é enviado ao Git.
- git diff --check: sem erro de whitespace; o Git no Windows pode emitir avisos LF/CRLF.

Os testes de interface usam mocks do SDK. PGlite usa PostgreSQL local com uma tabela Auth mínima. Nenhum deles comprova o Supabase Auth hospedado, o SMTP ou o Edge Runtime. O roteiro scripts/integration.mjs permanece separado e exige o serviço configurado.

## GitHub e publicação

O proprietário concluiu gh auth login pelo fluxo oficial de dispositivo. GitHub CLI confirmou login como fantastkill e permissões push/admin em fantastkill/Iron. O bloqueio anterior de credencial Git foi resolvido.

A branch foi enviada ao GitHub e o PR #1 foi aberto como rascunho contra main. Os checks de revisão da implementação c687de4 passaram no GitHub Actions. Não há autorização adicional pendente para commit/push/PR/merge/deploy; existe a condição funcional explícita de não publicar login sem autenticação real configurada e validada.

O Pages atual foi consultado: build_type=legacy, status=built. Não foi alterado para Actions nesta etapa, pois isso faz parte da liberação após a validação do Supabase. A versão pública anterior permanece preservada.

## Bloqueio externo restante

Não existem .env.local nem .env.integration.local, nem Variables/Secrets Supabase no repositório consultado. O proprietário ainda não forneceu um projeto Supabase configurado. A ação necessária foi solicitada: criar o projeto, aplicar as duas migrações e informar URL + chave pública publishable/anon, sem service_role ou senha do banco.

Enquanto isso:

- Home e Login podem ser visualizados localmente.
- Login mostra indisponibilidade e seu botão permanece desabilitado.
- Nenhum painel recebe dados falsos para aparentar integração.
- Não é possível executar a validação hospedada de cadastro, confirmação, convite, recuperação e sessão.
- Não é possível validar os painéis com dados reais nem entre dispositivos.
- Merge de liberação e workflow de deploy permanecem pendentes.
- Não há validação de uma nova versão no site público porque ela não foi publicada.

## Etapas para liberar a versão

1. Aplicar as migrações e configurar Auth/SMTP, URLs de retorno e template de convite conforme supabase/SETUP.md.
2. Publicar a Edge Function manage-users com APP_ORIGIN e APP_URL corretos.
3. Provisionar administrador e contas de teste dedicadas; convidar professor e atribuir alunos.
4. Executar scripts/integration.mjs contra o projeto hospedado e validar os fluxos de e-mail manualmente.
5. Verificar os quatro painéis em celular/tablet/desktop, com as próprias contas e dados autorizados.
6. Configurar Variables públicas e Secrets das contas de teste no GitHub.
7. Confirmar aprovação técnica do PR e ausência de segredos; fazer merge em main.
8. Alterar Pages para GitHub Actions e executar o workflow manual de publicação de dist.
9. Validar a URL pública, assets, seis rotas, refresh e autenticação real depois do deploy.

O roteiro para apresentar a implementação ao professor está em APRESENTACAO_PROFESSOR.md. A avaliação acadêmica depende do professor; este relatório não promete aprovação.


## Operações efetivamente concluídas no GitHub

- Commit de implementação: c687de4 — feat: refine gym product content, reports and accessible workflows.
- Push: concluído para origin/feat/iron-pulse-platform, incluindo os commits locais anteriores.
- Pull Request: https://github.com/fantastkill/Iron/pull/1, em draft, destino main.
- GitHub Actions da implementação: aprovado em https://github.com/fantastkill/Iron/actions/runs/43227635894. O job executou instalação, testes, build e audit em Ubuntu.
- Aprovação técnica de liberação: pendente de integração real no Supabase.
- Merge: não realizado.
- Deploy: não acionado, por faltar autenticação configurada/validada. O Pages anterior permanece preservado.
- Gate de configuração: node scripts/check-config.mjs rejeitou corretamente a ausência das variáveis públicas.
- Integração hospedada: npm run test:integration confirmou ausência do ambiente e não executou os testes; não foi reportada como sucesso.

Uma atualização documental posterior pode possuir outro hash; consulte o último commit e o estado dos checks diretamente no PR. A falta de credencial Git foi resolvida pelo login interativo autorizado; o bloqueio restante é o Supabase.


### Atualização das Actions

Após a CI aprovada apontar a depreciação do runtime Node 20 nas Actions antigas, as referências foram atualizadas para versões oficiais verificadas: checkout 7.0.1, setup-node 7.1.0, configure-pages 6.0.0, upload-pages-artifact 5.0.0 e deploy-pages 5.0.1. O runner foi fixado em ubuntu-24.04 para evitar mudanças automáticas de imagem. O aplicativo continua sendo testado com Node 22. Os novos checks são acompanhados no PR; a configuração de deploy permanece sem execução até validar o Supabase.
