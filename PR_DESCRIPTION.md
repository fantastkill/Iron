## Problema e comportamento final

O acesso aos painéis era possível por escolha de perfil e qualquer senha fictícia. Esta alteração remove esses atalhos e integra as seis páginas ao Supabase Auth e a um banco PostgreSQL com RLS, preservando a identidade visual.

Cadastro público cria somente aluno. Professor depende de convite autorizado; administrador é provisionado fora do site. As operações usam o JWT do usuário, RPCs restritos e uma Edge Function administrativa. Medidas são privadas do aluno; consulta administrativa de treinos exige consentimento.

## Validação e limite de entrega

Testes locais de interface/contratos e PostgreSQL/RLS, build, audit e checks públicos em navegador estão documentados em ENTREGA_FINAL.md. Esses resultados não substituem validação do Supabase hospedado.

**PR deve permanecer draft e sem merge/deploy:** o proprietário ainda não possui projeto Supabase. É necessário criar/configurar o projeto, aplicar a migração, publicar a Edge Function, provisionar contas e executar os testes reais. A autorização do usuário para publicar é condicionada a essas verificações.

Guia: supabase/SETUP.md. Roteiro acadêmico: APRESENTACAO_PROFESSOR.md. O workflow de publicação é manual e bloqueia ausência de configuração/integração.
