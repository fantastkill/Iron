import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Flame, Dumbbell, Users, Clock, ShieldCheck } from 'lucide-react';
import { Header, Footer } from '../components/Layout';
const plans = [
  { name: 'Smart', title: 'O primeiro passo para sua rotina.' },
  { name: 'Fit', title: 'Constância para seguir em frente.' },
  { name: 'Black', title: 'Foco no seu próximo objetivo.' },
];
export default function Home() {
  const [params] = useSearchParams();
  const [prices, setPrices] = useState({});
  useEffect(() => {
    let active = true;
    if (supabase)
      void supabase
        .from('plans')
        .select('*')
        .then(({ data, error }) => {
          if (active && !error && data)
            setPrices(
              Object.fromEntries(
                data
                  .filter((p) => p.price_published === true)
                  .map((p) => [
                    p.name,
                    Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                  ]),
              ),
            );
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const section = params.get('section');
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }, [params]);
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-content">
            <span className="eyebrow">
              <span className="red-dot" /> FORÇA. DISCIPLINA. EVOLUÇÃO.
            </span>
            <h1 className="hero-title">
              TRANSFORME SUA FORÇA.
              <br />
              <em>SUPERE SEUS LIMITES.</em>
            </h1>
            <p>
              Organize seus treinos. Acompanhe cada conquista.
              <br />
              Dê o próximo passo com mais direção.
            </p>
            <div className="actions">
              <Link to="/login?cadastro=1" className="button">
                Comece sua jornada <ArrowUpRight size={19} />
              </Link>
              <Link to="/?section=plans" className="text-link">
                Conheça os planos →
              </Link>
            </div>
            <div className="hero-proof">
              <Check className="proof-icon" />
              <p>
                <b>Seu ritmo. Sua evolução.</b>
                <small>Uma rotina construída um treino de cada vez.</small>
              </p>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <Dumbbell className="hero-dumbbell" strokeWidth={1.25} />
            <span className="vertical-label">CONSTRUÍDO COM DISCIPLINA</span>
            <div className="floating-card">
              <Flame />
              <div>
                <strong>Atitude para começar</strong>
                <small>Constância para continuar.</small>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>
              FORÇA <b>+</b> CONSTÂNCIA <b>+</b> EVOLUÇÃO
            </span>
            <small>CONTINUE PARA DESCOBRIR ↓</small>
          </div>
        </section>
        <div className="brand-strip">
          <span>SEU OBJETIVO. NOSSA ENERGIA.</span>
          <Dumbbell />
          <span>TREINE COM PROPÓSITO</span>
          <Flame />
          <span>SUPERE SEUS LIMITES</span>
        </div>
        <section id="structure" className="home-section">
          <span className="eyebrow">CONHEÇA A IRON PULSE</span>
          <h2>
            Mais direção.
            <br />
            Mais <em>constância.</em>
          </h2>
          <p className="section-intro">
            A Iron Pulse conecta sua rotina de treino ao acompanhamento da sua evolução. Aluno,
            professor e equipe trabalham com as informações certas, em um só lugar.
          </p>
          <div className="grid four">
            {[
              [
                Dumbbell,
                'Treinos organizados',
                'Consulte os exercícios, as séries, as repetições e os intervalos da sua ficha.',
              ],
              [
                Users,
                'Orientação conectada',
                'Acompanhe as fichas preparadas pelo professor responsável pelo seu treino.',
              ],
              [
                Clock,
                'Rotina no seu ritmo',
                'Veja sua programação semanal e registre o que você concluiu a cada dia.',
              ],
              [
                ShieldCheck,
                'Evolução com clareza',
                'Reúna seu histórico e suas medidas para observar sua trajetória ao longo do tempo.',
              ],
            ].map(([Icon, title, text]) => (
              <article className="card feature" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="plans" className="home-section plans">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ENCONTRE SEU PONTO DE PARTIDA</span>
              <h2>
                Seu objetivo.
                <br />
                <em>Seu plano.</em>
              </h2>
            </div>
            <p>
              Indique sua preferência ao criar a conta.
              <br />A seleção não realiza contratação nem cobrança.
            </p>
          </div>
          <div className="grid three">
            {plans.map(({ name, title }) => (
              <article className={`card plan ${name === 'Fit' ? 'featured' : ''}`} key={name}>
                <span className="eyebrow">IRON {name.toUpperCase()}</span>
                <h3>{title}</h3>
                <div className={`price ${prices[name] ? '' : 'price-consult'}`}>
                  {prices[name] ? (
                    <>
                      <small>R$</small> {prices[name]}
                      <span>/mês</span>
                    </>
                  ) : (
                    'Consulte condições'
                  )}
                </div>
                <ul>
                  {[
                    'Treinos em um só lugar',
                    'Histórico de atividades',
                    'Acompanhamento da evolução',
                  ].map((item) => (
                    <li key={item}>
                      <Check size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  className={`button ${name === 'Fit' ? '' : 'secondary'}`}
                  to={`/login?cadastro=1&plano=${name}`}
                >
                  Escolher {name}
                  <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="home-section">
          <span className="eyebrow">SIMPLES PARA COMEÇAR. CLARO PARA CONTINUAR.</span>
          <h2>
            Sua jornada,
            <br />
            <em>passo a passo.</em>
          </h2>
          <div className="grid three">
            {[
              [
                '01',
                'Crie sua conta',
                'Escolha um plano de interesse e organize seu acesso com e-mail e senha.',
              ],
              [
                '02',
                'Receba seu treino',
                'Após o vínculo com um professor, suas fichas ficam disponíveis no painel.',
              ],
              [
                '03',
                'Acompanhe sua evolução',
                'Marque os exercícios concluídos, consulte o histórico e registre suas medidas.',
              ],
            ].map(([number, title, text]) => (
              <article className="card journey-card" key={number}>
                <span className="eyebrow">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="faq" className="home-section faq">
          <div>
            <span className="eyebrow">CLAREZA PARA DAR O PRIMEIRO PASSO</span>
            <h2>
              Antes do
              <br />
              <em>próximo treino.</em>
            </h2>
          </div>
          <div>
            {[
              [
                'Como funciona a área do aluno?',
                'Crie sua conta, confirme o e-mail quando solicitado e entre com sua senha. Suas fichas aparecem após a atribuição de um professor.',
              ],
              [
                'Como meu treino é definido?',
                'O professor responsável organiza sua ficha com exercícios, séries, repetições, intervalos e dias da semana.',
              ],
              [
                'Escolher um plano gera uma cobrança?',
                'Não. A seleção registra seu interesse. A contratação e suas condições precisam ser confirmadas com a equipe responsável. Não há pagamento pelo site.',
              ],
              [
                'Posso consultar meus registros em outro dispositivo?',
                'Sim. Com o acesso disponível, entre com a mesma conta para consultar os registros salvos.',
              ],
              [
                'Quem pode consultar meus dados?',
                'Você acessa seus próprios registros. O professor consulta os treinos dos alunos sob sua responsabilidade. Medidas corporais são privadas, e a consulta administrativa dos treinos depende da sua autorização.',
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="cta-band">
          <Flame size={40} />
          <h2>
            O próximo passo
            <br />
            começa com você.
          </h2>
          <Link className="button light" to="/login?cadastro=1">
            Criar minha conta <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
