import { describe, it, expect } from 'vitest';
import { peopleCsv } from './reports';
import { friendlyError } from './errors';
import { daysAgo } from './dates';
describe('Relatórios, datas e mensagens ao usuário', () => {
  it('exporta o cadastro autorizado com nomes, situação e professor', () => {
    const csv = peopleCsv(
      [{ name: 'Ana "Silva"', email: 'ana@test.local', plan: 'Fit', teacherId: 't', active: true }],
      [{ id: 't', name: 'Rafael' }],
    );
    expect(csv).toContain('"Ana ""Silva"""');
    expect(csv).toContain('"Rafael"');
    expect(csv).toContain('"Ativo"');
  });
  it('neutraliza fórmulas mesmo quando precedidas de espaços', () => {
    const csv = peopleCsv([{ name: '  =1+1', email: '@SUM(1)', plan: 'Fit', active: true }], []);
    expect(csv).toContain('"\'  =1+1"');
    expect(csv).toContain('"\'@SUM(1)"');
  });
  it('não expõe erro SQL desconhecido', () =>
    expect(friendlyError(new Error('relation public.private_data does not exist'))).toBe(
      'Não foi possível concluir. Tente novamente.',
    ));
  it('traduz falta de permissão e falha de conexão', () => {
    expect(friendlyError({ code: '42501', message: 'permission denied' })).toContain(
      'não tem permissão',
    );
    expect(friendlyError({ message: 'Failed to fetch' })).toContain('Verifique sua conexão');
  });
  it('calcula períodos por dia de calendário', () =>
    expect(daysAgo(1, '2026-03-01')).toBe('2026-02-28'));
});
