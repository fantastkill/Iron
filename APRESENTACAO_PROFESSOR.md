# Apresentação acadêmica — IRON PULSE GYM

## Proposta e estado real

O sistema organiza o relacionamento entre administração, professores e alunos de uma academia fictícia. São seis páginas React, integradas a Supabase Auth e PostgreSQL com Row Level Security. A interface existente foi preservada.

A integração foi implementada, mas depende de um projeto Supabase do proprietário. Até sua criação e validação, não demonstrar os painéis como se houvesse autenticação real funcionando. A Home e o Login podem ser apresentados; os painéis estão protegidos e não possuem atalho demonstrativo.

## Como os conteúdos da disciplina aparecem no código

| Conceito | Aplicação e arquivo de referência |
| --- | --- |
| HTML semântico | main, header, nav, section, form, table e details nas páginas; entrada index.html |
| CSS | global.css: cores, fontes, hover, foco, Grid, Flexbox, breakpoints e movimento reduzido |
| JavaScript | validação, arrays, map/filter, datas, transformação de dados e operações async/await |
| React | páginas como componentes e composição de elementos menores |
| Componentes reutilizáveis | Logo/Header/Footer/Layout/ProtectedRoute e Button/Card/Input/Empty/PageTitle |
| Props | label, children, variant, disabled e roles configuram componentes sem duplicar código |
| useState | campos de formulário, aba selecionada, pesquisa, modal aberto e período de evolução |
| useEffect | observar sessão, carregar dados, renovar consultas, exibir mensagens e limpar timers/listeners |
| Context API | AppProvider fornece user, data, api, busy, mutate, logout e notificações |
| React Router | seis rotas e guardas; HashRouter evita erro de refresh em hospedagem estática |
| Eventos | onSubmit salva formulários; onClick seleciona dias e ações; onChange atualiza campos |
| Formulários | cadastro/login, convite, edição de perfil, ficha, preço e medidas |
| Autenticação | Supabase valida e-mail/senha e administra confirmação, sessão e recuperação |
| Autorização | papel ativo no banco, RLS e validação no servidor para cada operação permitida |
| Banco | profiles, plans, invitations, workouts, progress, history, measurements e consentimentos |
| Git | branch separada, revisão de diff, commits e PR; sem reset destrutivo |
| GitHub Pages | build Vite em dist, base /Iron/ e workflow manual com checks |
| Testes | interface/contratos, SQL/RLS local, navegador e script separado para o serviço real |

## Explicação do fluxo de dados

1. O usuário envia e-mail/senha ao provedor, e não a uma comparação manual em JavaScript.
2. O SDK obtém/restaura a sessão. O app verifica a identidade e consulta o perfil protegido.
3. O contexto carrega os registros visíveis para aquele usuário.
4. A página renderiza esses registros por meio de props, map e condicionais.
5. Uma ação chama a API/RPC; o banco valida o JWT, o papel e a relação com o aluno.
6. Após sucesso, o contexto recarrega os dados; erros e carregamento são exibidos.

ProtectedRoute organiza a navegação, mas não é a barreira de segurança do banco. Mesmo uma requisição direta precisa respeitar RLS. Alterar localStorage ou metadata não promove uma conta.

## Fluxos de conta

- Aluno escolhe plano na Home, cadastra a própria conta, confirma o e-mail e entra.
- Professor recebe convite autorizado por administrador, define senha e entra.
- Administrador é provisionado pelo proprietário do Supabase e entra normalmente.
- Não há seletor público de administrador/professor nem usuário visitante autenticado.
- Recuperação envia instruções pelo provedor. Nunca demonstrar senha real em slides ou código.

## Preparação antes da aula

1. Concluir supabase/SETUP.md e os testes de integração com contas dedicadas.
2. Ter acesso aos e-mails de teste para confirmação/convite; não mostrar senhas no projetor.
3. Provisionar um administrador, convidar um professor e cadastrar dois alunos de teste.
4. Atribuir somente um deles ao professor e criar uma ficha com poucos exercícios para a demonstração.
5. Confirmar acesso em um segundo navegador/dispositivo e comportamento de sessão após refresh.
6. Testar a rede da faculdade e deixar o projeto local instalado como alternativa à URL pública.
7. Registrar os resultados exatos de testes e build do commit apresentado.
8. Apresentar os limites de hospedagem e os checks pendentes com honestidade.

## Roteiro das seis páginas — 8 a 12 minutos

1. **Home:** objetivo, identidade visual, três planos de interesse, seleção de plano e FAQ.
2. **Login/Cadastro:** criar aluno, demonstrar confirmação divergente, explicar e-mail de confirmação, entrar e mostrar rejeição de senha incorreta.
3. **Administrador:** métricas dos cadastros, convite de professor, atribuição de aluno, edição de plano/preço e confirmação antes da exclusão de uma conta descartável.
4. **Professor:** entrar como professor, mostrar somente o aluno atribuído e criar uma ficha com séries, repetições, descanso e dias. Mostrar que o outro aluno não aparece.
5. **Aluno:** entrar como aluno, consultar professor e ficha, marcar exercícios e acompanhar percentual e histórico. Mostrar consentimento administrativo opcional.
6. **Evolução:** registrar medidas fictícias, filtrar período, explicar os gráficos e demonstrar persistência após refresh/outro dispositivo.

Ao finalizar, mostrar arquivos pequenos de exemplo: UI.jsx para props, Login.jsx para eventos/useState, AppContext.jsx para useEffect/Context, main.jsx para rotas e a migração para RLS. Não abrir .env nem arquivos de credenciais de teste durante a apresentação.

## Pontos que merecem explicação

- As fichas iniciais são vazias no sistema real: não misturamos exemplos de terceiros com contas registradas.
- Os 12 exercícios do catálogo são conteúdo público, não dados pessoais.
- Selecionar dia da semana consulta a divisão; a marcação usa a data atual de São Paulo.
- Concluir todos os exercícios cria um registro único por aluno, ficha e data. Desmarcar remove a conclusão desse dia.
- Medidas são acessíveis somente pelo próprio aluno. Professor vê progresso de treinos, não medidas.
- Administrador gerencia cadastros, mas só consulta treinos/histórico após consentimento do aluno.
- Consulta de dados é renovada ao focar a janela e a cada 30 segundos; o armazenamento é compartilhado pelo banco entre dispositivos.
- Uma conta administrativa não nasce de um campo role enviado pelo navegador.

## Perguntas prováveis

**Por que não apenas localStorage?** Porque cadastro real, acesso entre dispositivos e controle por usuário exigem identidade e autorização no servidor.

**Por que Supabase?** Reúne Auth e PostgreSQL com RLS e funciona com frontend estático no GitHub Pages.

**O que o GitHub Pages executa?** Somente os arquivos do build. O Auth, banco e Edge Function executam no Supabase.

**Qual a diferença entre autenticar e autorizar?** Autenticar identifica a conta; autorizar decide quais dados e operações essa conta pode acessar.

**O que os testes comprovam?** Os testes de interface verificam contratos com SDK simulado; PGlite executa RLS/RPCs em PostgreSQL local; navegador verifica as páginas públicas e os redirecionamentos. Só os testes com projeto configurado comprovam o Auth/serviço hospedado.

**Está aprovado pela faculdade?** A aprovação pertence ao professor e depende dos critérios da disciplina. A documentação descreve o trabalho e as evidências, sem garantir nota.


## Refinamento comercial sem inventar ofertas

A documentação preserva o objetivo da disciplina; a interface usa comunicação de produto. Não há depoimentos ou contatos inventados. Os preços de desenvolvimento não são mostrados até um administrador confirmar sua publicação. Plano selecionado é uma preferência, não prova de contratação. Demonstre os filtros, a exportação CSV, o exercício personalizado, o período de datas e o controle de foco dos modais. A autorização para publicar foi dada pelo usuário, mas a autenticação hospedada precisa estar configurada e validada antes do deploy.
