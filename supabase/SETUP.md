# Configurar Supabase — IRON PULSE GYM

Este guia depende de uma conta e de um projeto Supabase pertencentes ao usuário. Nenhum projeto foi criado e nenhuma credencial foi inventada. Enquanto não houver configuração, Home e Login funcionam, mas o formulário de acesso fica desabilitado e as rotas privadas redirecionam para o Login.

## 1. Criar o projeto

1. Entre em https://supabase.com/dashboard e crie sua conta.
2. Crie uma organização e um projeto. Escolha a região e uma senha forte para o banco; guarde essa senha fora do Git e deste chat.
3. Aguarde o provisionamento.
4. Em Project Settings → API, copie a URL e a chave pública publishable (ou anon legada). As telas podem mudar; procure o painel de API keys.
5. Nunca use service_role, sb_secret_, senha do banco ou token de gerenciamento em variáveis VITE_. Essas variáveis são públicas no JavaScript compilado.

## 2. Banco e autorização

Em um projeto novo, abra SQL Editor e execute, nesta ordem, `supabase/migrations/202611120001_iron.sql` e `supabase/migrations/202611120002_publish_prices.sql`. Ambos usam transação. Se a primeira migração já foi aplicada, execute somente a segunda. Não o execute em um banco compartilhado sem revisão; ele cria tabelas com nomes de aplicação e não é um importador do banco legado.

A migração cria:

- plans: três planos acadêmicos e preços.
- profiles: vínculo com auth.users, nome, e-mail, papel, plano, professor e estado ativo.
- invitations: autorização administrativa de convites.
- workouts: ficha com dias e exercícios JSON validados.
- workout_progress: conclusão por aluno/ficha/data.
- workout_history: histórico gerado transacionalmente.
- measurements: registros corporais privados do aluno.
- admin_student_access: consentimento explícito do aluno para consulta de treinos por um administrador.

Todas as tabelas têm RLS habilitada. Os helpers ficam em schema private, não exposto na Data API. Não adicione private à lista de schemas expostos. O papel vem de profiles, não de user_metadata editável. Escrita direta em profiles, invitations, progress e history é negada às chaves de navegador; as operações autorizadas passam por RPC ou Edge Function.

### Matriz de acesso

| Recurso | Aluno | Professor ativo | Administrador ativo |
| --- | --- | --- | --- |
| Perfil | Próprio e professor responsável | Próprio e alunos atribuídos | Cadastros de alunos/professores para gestão |
| Planos | Consulta | Consulta | Atualização de preços por RPC |
| Fichas | Consulta própria | CRUD de alunos atribuídos | Consulta somente com consentimento do aluno |
| Progresso/histórico | Consulta e conclusão próprios por RPC | Consulta dos alunos atribuídos | Consulta somente com consentimento |
| Medidas corporais | Consulta e registro próprios | Sem acesso | Sem acesso |
| Papéis | Sem alteração | Sem alteração | Sem elevação por formulário ou RPC de edição |
| Convites | Sem acesso | Sem acesso | Criação de aluno/professor pela Edge Function |

O primeiro administrador é provisionado pelo proprietário do projeto. Não existe cadastro público administrativo. A interface de consentimento no aluno lista apenas nome e identificador dos administradores ativos.

## 3. Variáveis locais

Copie `.env.example` para `.env.local` e preencha:

```dotenv
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

Os textos acima são marcadores de instrução, não credenciais válidas. Reinicie o Vite após alterar o ambiente. `.env.local` é ignorado pelo Git. `.env.example` deve continuar sem valores.

O SDK administra os tokens da sessão e a renovação. A aplicação não grava senhas, hashes caseiros nem papéis no localStorage. Persistência de sessão pelo SDK em navegador não substitui proteção contra XSS: não injete HTML não confiável e mantenha dependências atualizadas.

## 4. Configurar Auth e e-mails

Em Authentication:

- Ative o provedor de e-mail/senha.
- Ative confirmação de e-mail.
- Configure senha mínima de oito caracteres ou mais.
- Configure SMTP e remetente autorizados para testes com destinatários reais; o provedor padrão pode ter restrições de destinatário e limites.
- Site URL de produção: `https://fantastkill.github.io/Iron/`.
- Adicione Redirect URLs exatas para produção e desenvolvimento:
  - `https://fantastkill.github.io/Iron/`
  - `https://fantastkill.github.io/Iron/?type=recovery`
  - `http://127.0.0.1:5173/Iron/`
  - `http://127.0.0.1:5173/Iron/?type=recovery`
- Os retornos de confirmação e recuperação usam PKCE. Abra os links no mesmo navegador/dispositivo em que iniciou o fluxo, preservando o verificador gerido pelo SDK.

### Template obrigatório de convite

Convites administrativos precisam funcionar em outro dispositivo e abrir a definição de senha sem conflitar com HashRouter. No template **Invite user**, use o link:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">Aceitar convite e definir senha</a>
```

APP_URL deve ser somente a URL-base terminada em /, sem query nem fragmento. O app verifica esse token de uso único com verifyOtp e remove os parâmetros da barra de endereço antes de renderizar o roteador. Não copie o token nem URLs de convite para logs, screenshots ou issues públicas.

Templates de confirmação e recuperação podem usar a ConfirmationURL padrão do provedor, que redireciona ao callback PKCE. Teste todos os três fluxos por e-mail antes de publicar.

A recuperação retorna uma mensagem neutra tanto para e-mails existentes quanto inexistentes, evitando revelar contas. Login mostra mensagem comum para e-mail/senha inválidos.

## 5. Provisionar primeiro administrador

1. Crie a conta do proprietário em Authentication → Users, por convite ou pelo cadastro normal com confirmação.
2. Confirme a posse do e-mail e copie o UUID em Authentication → Users.
3. No SQL Editor, substitua apenas o UUID abaixo pelo identificador confirmado e execute:

```sql
update public.profiles
set role = 'admin', active = true, teacher_id = null
where id = 'UUID-REAL-DO-PROPRIETARIO';
```

Não execute esse SQL com e-mail/UUID desconhecidos. Essa promoção exige acesso de proprietário ao banco; não é uma função pública nem um botão no frontend. Saia e entre novamente na aplicação.

## 6. Edge Function para convites e exclusões

A função `supabase/functions/manage-users/index.ts` roda no servidor. Ela valida o JWT com getUser, consulta o papel ativo do chamador e só então utiliza o cliente administrativo. Não aceita convidar ou excluir administradores. Requisições anônimas, de aluno e de professor são rejeitadas.

Instale/configure a CLI Supabase conforme a documentação oficial, faça login e vincule seu projeto:

```sh
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase secrets set APP_ORIGIN=https://fantastkill.github.io
supabase secrets set APP_URL=https://fantastkill.github.io/Iron/
supabase functions deploy manage-users
```

O runtime fornece SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY. A chave service_role é usada somente no código do servidor. Nunca a coloque em .env do frontend ou no GitHub Pages. O config.toml desabilita a checagem legada do gateway; o handler mantém sua própria validação obrigatória do JWT e do papel no banco antes de criar o cliente privilegiado.

Para testar localmente contra um projeto de staging, configure APP_ORIGIN como `http://127.0.0.1:5173` e APP_URL como `http://127.0.0.1:5173/Iron/` nesse projeto de staging. Produção deve aceitar apenas sua origem de produção. O fluxo de aluno não depende da Edge Function; convite e exclusão administrativa dependem.

Quando o administrador convida um professor, a autorização do endereço é registrada antes do envio. A trigger cria o perfil com o papel autorizado. Selecionar role em metadata de um cadastro público não promove ninguém. Se o envio falhar, um convite autorizado pode permanecer pendente; conferir SMTP e reenviar pelo formulário do administrador. Não eleve uma conta já existente por meio de novo convite.

## 7. Testes reais obrigatórios

Os testes em src/database.test.js executam a migração e RLS em PostgreSQL local (PGlite), com uma tabela Auth mínima. Eles não comprovam funcionamento do serviço Auth hospedado, SMTP ou Edge Runtime.

Para testar o serviço real, prepare contas de teste dedicadas, sem informações reais de alunos:

1. Um administrador provisionado pelo proprietário.
2. Um professor convidado por esse administrador, com senha definida pelo link.
3. Um aluno público atribuído ao professor de teste.
4. Outro aluno público não atribuído a esse professor.
5. O primeiro aluno NÃO deve conceder consentimento ao administrador de teste antes de executar o script.

Copie `.env.integration.example` para `.env.integration.local`, preencha as variáveis públicas e os quatro pares de e-mail/senha de teste. Nunca compartilhe nem versione esse arquivo. Execute:

```sh
npm run test:integration
```

O script autentica as quatro contas com o provedor, tenta credenciais incorretas, testa consulta cruzada/elevação indevida, cria uma ficha descartável com um exercício, conclui o exercício, verifica histórico, tenta a Edge Function como aluno e apaga a ficha ao terminar. Não usa chave administrativa. A saída de sucesso não cobre automaticamente os testes manuais abaixo.

Checklist manual adicional:

- Cadastro real e confirmação por e-mail; senha incorreta, conta inexistente e duplicidade.
- Convite de professor, definição de senha e login.
- Recuperação e troca de senha; link expirado.
- Logout e refresh com sessão válida.
- Manipulação de metadata role=admin/professor sem promoção.
- CRUD, plano, atribuição, fichas, progresso, histórico e medidas entre dispositivos.
- Consentimento e revogação administrativa.
- Tela pequena, teclado, modais e gráficos nos quatro painéis privados.
- RLS no projeto hospedado e confirmação de que private não é schema exposto.

## 8. GitHub Actions e Pages

Em Settings → Secrets and variables → Actions:

**Variables públicas:** VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.

**Secrets de teste:** TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD, TEST_OTHER_STUDENT_EMAIL, TEST_OTHER_STUDENT_PASSWORD, TEST_TEACHER_EMAIL, TEST_TEACHER_PASSWORD, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD.

Use contas de teste dedicadas no mesmo projeto indicado para o deploy. Não use a conta pessoal principal como conta de integração. O workflow de publicação falha sem configuração pública ou sem teste real aprovado. Nenhuma chave service_role é necessária no GitHub.

Settings → Pages deve usar GitHub Actions. O workflow manual executa npm ci, testes locais, validação de configuração, integração real, build e deploy de dist. Não há publicação automática em push. Os testes de revisão em ci.yml não publicam.

Antes de merge e execução manual, confirme que os fluxos de e-mail e os painéis foram validados e que a condição de autorização do usuário foi cumprida. Depois de publicar, valide as seis rotas em `https://fantastkill.github.io/Iron/#/...` e atualize a página em cada uma. Não trate o site antigo ainda público como evidência de deploy novo.

## Referências oficiais consultadas

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail

### Definição de senha e refresh de convite

O perfil possui password_ready, atualizado somente por triggers do Auth com base na presença da credencial administrada pelo provedor. Não há cópia de senha ou hash no perfil. Convites sem senha definida ficam sem permissões privadas mesmo após refresh; a interface retorna à definição de senha. Nenhum RPC de navegador permite alterar esse indicador. Na validação hospedada, confirme os triggers de criação e atualização com um convite real.


## Conteúdo comercial e preços

A página pública não usa depoimentos, endereços, horários ou ofertas sem confirmação. Os três planos aparecem como preferências de cadastro. Os valores iniciais do banco são referências de desenvolvimento e ficam ocultos na Home: price_published começa falso. Somente um administrador autenticado pode confirmar o preço e autorizar sua exibição em Planos e condições. Desmarcar a autorização retira o valor da página pública. Confirmar preço não implementa contratação ou pagamento.

O painel administrativo permite filtrar e exportar os cadastros autorizados em CSV. Professores podem inserir nomes de exercícios personalizados nas fichas, com validação no banco. A evolução permite escolher datas inicial/final. Os modais têm controle de foco e fechamento por Escape.
