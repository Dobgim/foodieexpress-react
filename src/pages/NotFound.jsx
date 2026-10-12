import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { unsplash } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="section not-found">
        <motion.img
          className="nf-photo"
          src={unsplash('1495195134817-aeb325a55b65', 640, 420)}
          alt="An empty wooden serving board"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <h1 className="display">404</h1>
        <p>This plate is empty — the page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          Back to home
        </Link>
      </section>
    </PageTransition>
  );
}
