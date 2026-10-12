import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/Overlays';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="section not-found">
        <motion.div className="nf-plate" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
          🍽️
        </motion.div>
        <h1 className="display">404</h1>
        <p>This plate is empty — the page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Back to home
        </Link>
      </section>
    </PageTransition>
  );
}
