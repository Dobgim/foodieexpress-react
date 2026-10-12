import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import { unsplash } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader, SectionHeader } from '../components/Layout';
import { CountUp, Reveal, RevealGroup, RevealItem, Tilt } from '../components/Motion';

const VALUES = [
  ['1540420773420-3366772f4999', 'Fresh ingredients', 'We source the freshest produce for every dish we prepare.'],
  ['1526367790999-0150786686a2', 'Fast delivery', 'An average delivery time of 30 minutes, so your food arrives hot.'],
  ['1556910103-1c02745aae4d', 'Cooked with care', 'Every dish is prepared by chefs who care about quality and taste.'],
  ['1488459716781-31db52582fe9', 'Community first', 'We buy from local farmers and markets and support local businesses.'],
  ['1414235077428-338989a2e8c0', 'Quality assured', 'Strict quality checks make sure every order meets our standards.'],
  ['1528605248644-14dd04022da1', 'Happy customers', 'Your satisfaction comes first, from the first click to the last bite.'],
];

const TEAM = [
  ['1581299894007-aaa50297cf16', 'Chef Amadou', 'Head Chef'],
  ['1531123897727-8f129e1688ce', 'Ngozi Okonkwo', 'Operations Manager'],
  ['1522529599102-193c0d76b5b6', 'Kwame Asante', 'Tech Lead'],
];

export default function About() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <PageTransition>
      <PageHeader label="About Us" title="Our story" text="Passionate about food, committed to quality." />

      <section className="section pt-0" ref={ref}>
        <div className="container about-hero">
          <Reveal variant="zoomIn" className="about-img">
            <div className="about-img-clip">
              <motion.img src="/images/african-chef-kitchen.png" alt="Our chef in the kitchen" style={{ scale: imgScale, y: imgY }} />
            </div>
            <motion.div className="about-badge" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
              <svg viewBox="0 0 100 100">
                <defs>
                  <path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <text>
                  <textPath href="#circle">FRESH • LOCAL • DELICIOUS • FAST •</textPath>
                </text>
              </svg>
              <span>
                <UtensilsCrossed size={26} />
              </span>
            </motion.div>
          </Reveal>
          <Reveal variant="right" className="about-text">
            <span className="section-label">Our story</span>
            <h2 className="heading">From a small kitchen to your doorstep</h2>
            <p>
              FoodieExpress started in 2026 with a simple mission: make delicious food accessible to everyone. What began as a small kitchen experiment has grown into a
              beloved food delivery service serving thousands of happy customers.
            </p>
            <p>
              We partner with talented local chefs and source the freshest ingredients to bring you dishes that delight every time. From hearty meals to quick bites,
              refreshing drinks to sweet treats — we've got it all.
            </p>
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore our menu
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeader label="Our values" title="What drives us" text="The principles that guide everything we do" />
          <RevealGroup className="values-grid" stagger={0.1}>
            {VALUES.map(([photo, title, text]) => (
              <RevealItem key={title} variant="zoomIn">
                <Tilt className="value-card">
                  <div className="value-photo">
                    <img src={unsplash(photo, 640, 400)} alt="" loading="lazy" />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Tilt>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="stats-band">
        <div className="container stats-grid">
          {[
            ['10K+', 'Happy customers'],
            ['500+', 'Menu items'],
            ['50+', 'Partner chefs'],
            ['4.9', 'Average rating'],
          ].map(([n, l], i) => (
            <Reveal key={l} variant="zoomOut" delay={i * 0.1} className="stat-item">
              <strong>
                <CountUp value={n} />
              </strong>
              <span>{l}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader label="Our team" title="Meet the people behind the food" text="Passionate individuals dedicated to bringing you the best" />
          <RevealGroup className="team-grid" stagger={0.15}>
            {TEAM.map(([photo, name, role]) => (
              <RevealItem key={name} variant="pop" className="team-card">
                <motion.div className="team-avatar" whileHover={{ scale: 1.05 }}>
                  <img src={unsplash(photo, 300, 300)} alt={name} loading="lazy" />
                </motion.div>
                <h3>{name}</h3>
                <span className="role">{role}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </PageTransition>
  );
}
