## O que muda

Reconstrói a versão anterior em seis páginas React integradas ao Supabase Auth e PostgreSQL com RLS. Remove acesso automático por perfil e senhas simuladas. Preserva a identidade visual e refina a apresentação pública, sem depoimentos, contatos, horários ou ofertas não confirmadas.

Inclui cadastro público de aluno, convites administrativos para professor, perfis provisionados com segurança, fichas, progresso, medidas privadas, consentimento para consulta administrativa, filtros, exportação CSV e exercícios personalizados. Preços só aparecem após autorização explícita de um administrador. Modais têm controle de foco/teclado e erros técnicos são traduzidos para mensagens de uso.

## Validação

- npm ci, 55 testes locais, build de produção e npm audit aprovados; zero vulnerabilidades reportadas.
- 3 testes Playwright aprovados em 390/768/1366px.
- Migrações e RLS executadas em PostgreSQL local/PGlite.
- Interfaces Auth testadas com SDK mockado; isso NÃO comprova autenticação hospedada.

## Bloqueio de liberação

**Manter como draft, sem merge ou deploy até configurar e validar Supabase.**

O proprietário ainda precisa criar/configurar o projeto, aplicar as duas migrações, publicar a Edge Function, provisionar contas e testar Auth, SMTP, convites, recuperação, sessão e RLS no serviço real. O workflow de publicação exige configuração e teste de integração. A autorização do usuário já cobre merge/deploy quando essas condições técnicas forem cumpridas.

Guia: supabase/SETUP.md. Evidências e estado: ENTREGA_FINAL.md. Roteiro acadêmico: APRESENTACAO_PROFESSOR.md.
