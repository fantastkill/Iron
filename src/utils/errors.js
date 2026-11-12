// As respostas técnicas ficam fora da interface. Mensagens de validação locais
// são preservadas; falhas desconhecidas recebem uma orientação segura.
export function friendlyError(error, fallback = 'Não foi possível concluir. Tente novamente.') {
  const message = error?.message || '';
  const code = String(error?.code || error?.status || '');
  if (/invalid login credentials|invalid_credentials/i.test(message))
    return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar.';
  if (/already registered|already been registered/i.test(message) || code === '23505')
    return 'Este cadastro já existe. Confira seus dados.';
  if (code === '42501' || code === '403' || /row.level security|permission denied/i.test(message))
    return 'Você não tem permissão para realizar esta ação.';
  if (code === '429' || /rate limit|too many requests/i.test(message))
    return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.';
  if (/fetch|network|connection/i.test(message))
    return 'Não foi possível conectar. Verifique sua conexão e tente novamente.';
  if (code === '23514' || code === '22P02')
    return 'Confira os valores informados e tente novamente.';
  const safe = [
    'Somente alunos podem se cadastrar publicamente.',
    'Informe seu nome.',
    'A senha deve ter pelo menos oito caracteres.',
    'As senhas não coincidem.',
    'E-mail já cadastrado. Entre ou recupere sua senha.',
    'Use pelo menos oito caracteres.',
    'Sessão inválida. Entre novamente.',
    'Conta inativa ou sem perfil autorizado. Contate a administração.',
    'Não foi possível acessar seu cadastro. Sua conta pode estar inativa; contate a administração.',
    'Link de autenticação inválido ou expirado. Solicite um novo link.',
    'Senha alterada, mas não foi possível sair. Tente novamente usando Sair da conta.',
  ];
  return safe.includes(message) ? message : fallback;
}
