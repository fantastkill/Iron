// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
let db;
const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  teacher: '00000000-0000-4000-8000-000000000002',
  student: '00000000-0000-4000-8000-000000000003',
  other: '00000000-0000-4000-8000-000000000004',
  workout: '00000000-0000-4000-8000-000000000005',
  exercise: '00000000-0000-4000-8000-000000000006',
};
async function asUser(id, fn) {
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${id}';`);
  try {
    return await fn();
  } finally {
    await db.exec('reset role; reset request.jwt.claim.sub;');
  }
}
beforeAll(async () => {
  db = new PGlite();
  // Auth é representado por uma tabela mínima. As políticas e RPCs da migração
  // rodam no PostgreSQL real do PGlite; isto NÃO testa o serviço Supabase Auth.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',encrypted_password text default 'managed-by-auth-fixture');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
  await db.exec(
    readFileSync(new URL('../supabase/migrations/202611120001_iron.sql', import.meta.url), 'utf8'),
  );
  await db.exec(
    readFileSync(
      new URL('../supabase/migrations/202611120002_publish_prices.sql', import.meta.url),
      'utf8',
    ),
  );
  for (const [key, id] of Object.entries(ids).slice(0, 4))
    await db.query(`insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)`, [
      id,
      `${key}@test.local`,
      { name: key, role: 'admin', plan: 'Fit' },
    ]);
  await db.query(`update public.profiles set role='admin' where id=$1`, [ids.admin]);
  await db.query(`update public.profiles set role='professor' where id=$1`, [ids.teacher]);
  await db.query(`update public.profiles set teacher_id=$1 where id=$2`, [
    ids.teacher,
    ids.student,
  ]);
}, 60000);
afterAll(async () => {
  await db?.close();
});
describe('Migração e RLS executadas em PostgreSQL local (sem Auth hospedado)', () => {
  it('não publica preços iniciais sem autorização explícita', async () => {
    expect(
      (await db.query('select price_published from plans')).rows.every(
        (p) => p.price_published === false,
      ),
    ).toBe(true);
    await asUser(ids.admin, () => db.query("select admin_update_plan('Fit',109.9,true)"));
    expect(
      (await db.query("select price_published from plans where name='Fit'")).rows[0]
        .price_published,
    ).toBe(true);
  });
  it('ignora role enviada pelo cadastro público no metadata', async () => {
    const { rows } = await db.query('select role from profiles where id=$1', [ids.other]);
    expect(rows[0].role).toBe('aluno');
  });
  it('somente convite autorizado provisiona professor', async () => {
    await db.query(
      `insert into invitations(email,name,role,plan,invited_by) values('invite@test.local','Convidado','professor','Fit',$1)`,
      [ids.admin],
    );
    await db.exec(
      `insert into auth.users values('00000000-0000-4000-8000-000000000009','invite@test.local','{}','')`,
    );
    const { rows } = await db.query(`select role from profiles where email='invite@test.local'`);
    expect(rows[0].role).toBe('professor');
  });
  it('convite não desbloqueia o papel antes de o Auth registrar a senha', async () => {
    const id = '00000000-0000-4000-8000-000000000009';
    await asUser(id, async () =>
      expect((await db.query('select private.current_role() as role')).rows[0].role).toBe(null),
    );
    await db.query('update auth.users set encrypted_password=$1 where id=$2', [
      'managed-by-auth-fixture',
      id,
    ]);
    await asUser(id, async () =>
      expect((await db.query('select private.current_role() as role')).rows[0].role).toBe(
        'professor',
      ),
    );
  });
  it('nega leitura anônima de perfis', async () => {
    await db.exec('set role anon');
    try {
      await expect(db.exec('select * from profiles')).rejects.toThrow();
    } finally {
      await db.exec('reset role');
    }
  });
  it('aluno só lê próprio perfil e professor atribuído', async () =>
    asUser(ids.student, async () => {
      const { rows } = await db.query('select id from profiles');
      expect(rows.map((r) => r.id).sort()).toEqual([ids.student, ids.teacher].sort());
    }));
  it('professor não lê aluno de outro professor', async () =>
    asUser(ids.teacher, async () => {
      const { rows } = await db.query('select id from profiles');
      expect(rows.map((r) => r.id).sort()).toEqual([ids.teacher, ids.student].sort());
    }));
  it('nega elevação direta de papel pelo navegador', async () =>
    asUser(ids.student, async () => {
      await expect(db.exec(`update profiles set role='admin'`)).rejects.toThrow();
    }));
  it('nega RPC administrativa ao aluno e professor', async () => {
    for (const id of [ids.student, ids.teacher])
      await asUser(id, async () => {
        await expect(db.exec(`select admin_update_plan('Fit',1)`)).rejects.toThrow(
          'Acesso administrativo',
        );
      });
  });
  it('admin atribui professor e atualiza plano sem mudar papel', async () =>
    asUser(ids.admin, async () => {
      await db.query('select admin_update_profile($1,$2,$3,$4,true)', [
        ids.student,
        'Aluno atualizado',
        'Black',
        ids.teacher,
      ]);
      await db.exec(`select admin_update_plan('Fit',109.9)`);
      const { rows } = await db.query('select role,plan from profiles where id=$1', [ids.student]);
      expect(rows[0]).toEqual({ role: 'aluno', plan: 'Black' });
    }));
  it('professor cria ficha apenas para aluno atribuído', async () =>
    asUser(ids.teacher, async () => {
      const exercise = [{ id: ids.exercise, name: 'Supino', sets: 3, reps: 12, rest: 60 }];
      await db.query(
        'insert into workouts(id,student_id,title,days,exercises) values($1,$2,$3,$4,$5)',
        [ids.workout, ids.student, 'Ficha local', ['Seg'], JSON.stringify(exercise)],
      );
      await expect(
        db.query('insert into workouts(student_id,title,days,exercises) values($1,$2,$3,$4)', [
          ids.other,
          'Indevida',
          ['Seg'],
          JSON.stringify(exercise),
        ]),
      ).rejects.toThrow();
    }));
  it('recusa exercício nulo ou parâmetros inválidos', async () => {
    const { rows } = await db.query(
      `select private.valid_exercises('[{"id":null,"name":null,"sets":null,"reps":null,"rest":null}]') as valid`,
    );
    expect(rows[0].valid).toBe(false);
  });
  it('aluno e admin sem consentimento não leem ficha de outro usuário', async () => {
    for (const id of [ids.other, ids.admin])
      await asUser(id, async () => {
        const { rows } = await db.query('select * from workouts');
        expect(rows).toHaveLength(0);
      });
  });
  it('consentimento do aluno libera e revoga consulta administrativa', async () => {
    await asUser(ids.student, () => db.query('select set_admin_access($1,true)', [ids.admin]));
    await asUser(ids.admin, async () =>
      expect((await db.query('select * from workouts')).rows).toHaveLength(1),
    );
    await asUser(ids.student, () => db.query('select set_admin_access($1,false)', [ids.admin]));
  });
  it('conclusão gera histórico único e desmarcação o remove', async () =>
    asUser(ids.student, async () => {
      const date = (
        await db.query(`select (now() at time zone 'America/Sao_Paulo')::date::text as day`)
      ).rows[0].day;
      await db.query('select toggle_exercise($1,$2,$3)', [ids.workout, ids.exercise, date]);
      expect((await db.query('select * from workout_history')).rows).toHaveLength(1);
      await db.query('select toggle_exercise($1,$2,$3)', [ids.workout, ids.exercise, date]);
      expect((await db.query('select * from workout_history')).rows).toHaveLength(0);
    }));
  it('outro aluno não consegue marcar exercício nem gravar histórico', async () =>
    asUser(ids.other, async () => {
      await expect(
        db.query('select toggle_exercise($1,$2,current_date)', [ids.workout, ids.exercise]),
      ).rejects.toThrow();
      await expect(db.exec('insert into workout_history default values')).rejects.toThrow();
    }));
  it('medidas pertencem exclusivamente ao aluno inclusive contra admin/professor', async () => {
    await asUser(ids.student, () =>
      db.query(
        "insert into measurements(student_id,date,weight,waist,chest) values($1,(now() at time zone 'America/Sao_Paulo')::date,80,90,100)",
        [ids.student],
      ),
    );
    for (const id of [ids.other, ids.teacher, ids.admin])
      await asUser(id, async () =>
        expect((await db.query('select * from measurements')).rows).toHaveLength(0),
      );
    await asUser(ids.other, async () => {
      await expect(
        db.query(
          "insert into measurements(student_id,date,weight,waist,chest) values($1,(now() at time zone 'America/Sao_Paulo')::date,80,90,100)",
          [ids.student],
        ),
      ).rejects.toThrow();
    });
  });
});
