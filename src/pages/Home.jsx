import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Flame, Dumbbell, Users, Clock, ShieldCheck } from 'lucide-react';
import { Header, Footer } from '../components/Layout';
export default function Home() {
  const [params] = useSearchParams();
  const [prices, setPrices] = useState({});
  useEffect(() => {
    let active = true;
    if (supabase)
      void supabase
        .from('plans')
        .select('name,price')
        .then(({ data }) => {
          if (active && data)
            setPrices(
              Object.fromEntries(
                data.map((p) => [
                  p.name,
                  Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                ]),
              ),
            );
        });
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
      <main>
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-content">
            <span className="eyebrow">
              <span className="red-dot" /> MAIS QUE TREINO. TRANSFORMAÇÃO.
            </span>
            <h1>
              O SEU PRÓXIMO
              <br />
              NÍVEL COMEÇA
              <br />
              <em>AQUI.</em>
            </h1>
            <p>
              Força para ir além. Estrutura para evoluir.
              <br />
              Uma comunidade que cresce com você.
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
              <div className="avatar-stack">
                <span>LC</span>
                <span>AS</span>
                <span>PR</span>
              </div>
              <p>
                <b>Seu ritmo. Sua evolução.</b>
                <small>Uma experiência fitness completa.</small>
              </p>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <Dumbbell className="hero-dumbbell" strokeWidth={1.25} />
            <span className="vertical-label">BUILT BY DISCIPLINE</span>
            <div className="floating-card">
              <Flame />
              <div>
                <strong>100% de atitude</strong>
                <small>O primeiro passo é seu.</small>
              </div>
            </div>
            <span className="art-number">01 / 06</span>
          </div>
          <div className="hero-bottom">
            <span>
              FORÇA <b>+</b> CONSTÂNCIA <b>+</b> EVOLUÇÃO
            </span>
            <small>ROLE PARA DESCOBRIR ↓</small>
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
          <span className="eyebrow">A ESTRUTURA QUE VOCÊ MERECE</span>
          <h2>
            Feita para quem
            <br />
            quer ir <em>além.</em>
          </h2>
          <div className="grid four">
            {[
              [
                Dumbbell,
                'Equipamentos completos',
                'Musculação, pesos livres e área funcional para cada etapa da sua jornada.',
              ],
              [
                Users,
                'Perto de você',
                'Professores presentes e fichas de treino adaptadas ao seu objetivo.',
              ],
              [
                Clock,
                'No seu tempo',
                'Conceito de funcionamento: segunda a sexta, 6h às 23h; sábado, 8h às 16h.',
              ],
              [
                ShieldCheck,
                'Evolução acompanhada',
                'Organize seus treinos e acompanhe suas conquistas em um só lugar.',
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
              <span className="eyebrow">INVISTA NA SUA MELHOR VERSÃO</span>
              <h2>
                Seu treino.
                <br />
                <em>Seu plano.</em>
              </h2>
            </div>
            <p>
              Valores fictícios para demonstração acadêmica.
              <br />
              Sem contratação ou cobrança real.
            </p>
          </div>
          <div className="grid three">
            {[
              [
                'Smart',
                '79,90',
                'O essencial para começar',
                ['Musculação completa', 'Ficha de treino digital', 'Acesso em horário comercial'],
              ],
              [
                'Fit',
                '99,90',
                'Mais possibilidades para evoluir',
                ['Tudo do Smart', 'Área funcional', 'Acompanhamento mensal'],
              ],
              [
                'Black',
                '159,90',
                'A experiência completa',
                ['Tudo do Fit', 'Avaliação corporal demonstrativa', 'Acesso em todos os horários'],
              ],
            ].map(([name, price, subtitle, items]) => (
              <article className={`card plan ${name === 'Fit' ? 'featured' : ''}`} key={name}>
                {name === 'Fit' && <span className="plan-tag">MAIS ESCOLHIDO</span>}
                <span className="eyebrow">IRON {name.toUpperCase()}</span>
                <h3>{subtitle}</h3>
                <div className="price">
                  <small>R$</small> {prices[name] || price}
                  <span>/mês</span>
                </div>
                <ul>
                  {items.map((x) => (
                    <li key={x}>
                      <Check size={16} />
                      {x}
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
          <span className="eyebrow">HISTÓRIAS QUE INSPIRAM</span>
          <h2>
            O resultado vai além
            <br />
            do <em>espelho.</em>
          </h2>
          <div className="grid three">
            {[
              [
                'Ana Souza',
                '“Encontrei uma rotina que cabe no meu dia. A cada treino, me sinto mais confiante.”',
              ],
              ['Lucas Oliveira', '“Ver meus treinos organizados me ajuda a manter a constância.”'],
              ['Pedro Santos', '“O acompanhamento faz toda a diferença para continuar evoluindo.”'],
            ].map(([name, quote]) => (
              <article className="card quote" key={name}>
                <span className="stars">★★★★★</span>
                <p>{quote}</p>
                <strong>{name}</strong>
                <small>Depoimento fictício • Exemplo acadêmico</small>
              </article>
            ))}
          </div>
        </section>
        <section id="faq" className="home-section faq">
          <div>
            <span className="eyebrow">SEM DÚVIDAS. COM ATITUDE.</span>
            <h2>
              Antes do
              <br />
              <em>primeiro treino.</em>
            </h2>
          </div>
          <div>
            {[
              [
                'Preciso ter experiência para começar?',
                'Não. O conceito da academia inclui orientação para iniciantes e fichas adaptadas a cada nível.',
              ],
              [
                'Como funciona a área do aluno?',
                'Crie sua conta de aluno, confirme o e-mail quando solicitado e entre com sua senha para acompanhar seus treinos e evolução.',
              ],
              [
                'Os planos podem ser contratados aqui?',
                'Não. Este é um projeto acadêmico fictício. Os preços são exemplos e não há pagamentos.',
              ],
              [
                'Meus dados ficam salvos?',
                'Quando o serviço está configurado, seus dados são vinculados à sua conta no banco. Entre com a mesma conta para acessá-los em outros dispositivos.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="cta-band">
          <Flame size={40} />
          <h2>
            A mudança começa
            <br />
            com uma decisão.
          </h2>
          <Link className="button light" to="/login">
            Explore a experiência <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
