# Entrega técnica — integração Supabase

Data: 12/11/2026.
Repositório confirmado: https://github.com/fantastkill/Iron.
Branch de trabalho: feat/iron-pulse-platform.
Branch padrão consultada no GitHub: main.
Destino público: https://fantastkill.github.io/Iron/.

## Implementado

- Preservadas as seis páginas e a identidade visual.
- Removidos botões de escolha de perfil, visitante autenticado e aceitação de qualquer senha.
- Cadastro público somente de aluno, plano pré-selecionado, validações e retorno de confirmação.
- Login, logout, sessão e recuperação integrados ao SDK Supabase.
- Retorno PKCE/convite tratado antes da navegação autenticada no HashRouter.
- Perfis carregados do banco após verificação da identidade no provedor.
- Dados de painéis, fichas, progresso e medidas consultados/gravados no banco.
- Removidos usuários e conclusões demonstrativos do código de execução.
- Professor limitado aos alunos atribuídos, na interface e em RLS.
- Medidas corporais privadas do aluno.
- Administração de cadastros e planos; consulta de treinos mediante consentimento do aluno.
- SQL versionado, RLS, RPCs transacionais e Edge Function de convite/exclusão.
- Configuração pública de exemplo sem valores e proteção contra chave administrativa no build.
- Workflow de revisão sem deploy e workflow manual de publicação com integração real obrigatória.
- Guia Supabase, README e roteiro para o professor atualizados.

## Bloqueios externos confirmados

1. O usuário informou que não possui projeto Supabase. Portanto não há URL/chave pública, migração aplicada no serviço, configuração SMTP, administrador provisionado ou testes do Auth hospedado.
2. O conector GitHub retornou permissions.push=false e permissions.admin=false para fantastkill/Iron. O envio por Git será tentado com a credencial local disponível, sem abrir fluxo interativo de senha; seu resultado será registrado abaixo.
3. A autorização de publicar é condicionada a testes aprovados e autenticação configurada/validada. Sem essas condições, não fazer merge nem substituir a versão pública.

Não existe chave administrativa no frontend. O arquivo supabase/functions/manage-users/index.ts referencia apenas o nome de uma variável administrativa fornecida pelo runtime do servidor, sem seu valor.

## Evidências e limites

- Testes de interface e contratos usam mocks do SDK; não provam autenticação real.
- Testes PGlite executam a migração e as políticas RLS em PostgreSQL local. A tabela mínima auth.users de teste não substitui o Supabase Auth.
- Playwright verifica Home, cadastro, plano selecionado, ausência de atalhos, redirecionamento/refresh das quatro rotas privadas sem sessão e largura em 390px/1366px. Screenshots foram gerados e inspecionados; não equivalem à revisão dos painéis com dados reais.
- Script separado scripts/integration.mjs executa testes reais com quatro contas dedicadas quando o projeto existir. Sem ambiente, termina como não executado.
- Cadastro/duplicidade real, confirmação, convite, troca de senha, persistência real entre dispositivos, visual dos painéis privados e URL pós-deploy continuam pendentes.
- npm ci inicialmente encontrou esbuild.exe em uso pelo servidor local da prévia. O servidor pertencente a este projeto foi encerrado e a instalação repetida com sucesso.

Os resultados finais de testes/build/audit, commit e envio serão acrescentados após a execução.

## Próximo passo indispensável do proprietário

Criar o projeto Supabase e seguir supabase/SETUP.md. Após aplicar a migração, configurar Auth/SMTP/Edge Function e informar URL + chave pública, será possível testar o serviço real. Não enviar service_role, senha do banco nem credenciais pessoais ao chat.

Para o GitHub, disponibilizar uma conexão ou credencial com escrita no repositório caso a tentativa local também seja negada. O título e corpo do PR estão preparados em PR_DESCRIPTION.md; enquanto o serviço não estiver validado, abrir somente como draft.

## Checklist de liberação

- [ ] Projeto Supabase provisionado e migração aplicada.
- [ ] Auth/e-mails/convites/recuperação validados.
- [ ] Primeiro administrador provisionado e contas de teste criadas.
- [ ] RLS e integração real aprovadas no projeto de destino.
- [ ] Painéis privados verificados visualmente em desktop/celular.
- [ ] Variables e Secrets de teste configurados no GitHub.
- [ ] PR revisado, destino main e ausência de segredos confirmados.
- [ ] Merge e workflow executados somente após cumprir as condições.
- [ ] URL pública e refresh das seis rotas validados após deploy.
