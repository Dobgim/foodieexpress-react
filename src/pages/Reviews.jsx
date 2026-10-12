import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { Stars } from '../components/Product';
import { CountUp, Reveal, ease } from '../components/Motion';

export default function Reviews() {
  const { reviews, addReview, toast } = useStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: '', comment: '', product: '' });

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const counts = [1, 2, 3, 4, 5].map((s) => reviews.filter((r) => r.rating === s).length);
  const max = Math.max(...counts, 1);

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return toast('Please select a rating.', 'warning');
    if (!form.name.trim() || !form.comment.trim()) return toast('Please fill in all required fields.', 'error');
    addReview({ name: form.name.trim(), avatar: form.name.trim()[0].toUpperCase(), rating, comment: form.comment.trim(), product: form.product.trim() });
    setForm({ name: '', comment: '', product: '' });
    setRating(0);
    toast('Review submitted! Thank you! ⭐');
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <PageTransition>
      <PageHeader label="Reviews" title="What food lovers say" text="Honest feedback from our community. Add yours below!" />
      <section className="section pt-0">
        <div className="container reviews-top">
          <Reveal variant="zoomIn" className="card rating-summary">
            <div className="overall">
              <div className="big">
                <CountUp value={avg} duration={1.5} />
              </div>
              <Stars rating={Number(avg)} size="1.4rem" />
              <span className="muted">{reviews.length} reviews</span>
            </div>
            <div className="bars">
              {[5, 4, 3, 2, 1].map((s) => (
                <div key={s} className="bar-row">
                  <span>{s} ★</span>
                  <div className="bar">
                    <motion.div
                      className="bar-fill"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: counts[s - 1] / max }}
                      viewport={{ once: false }}
                      transition={{ duration: 1, ease, delay: (5 - s) * 0.1 }}
                    />
                  </div>
                  <span>{counts[s - 1]}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal as="form" variant="right" className="card review-form" onSubmit={submit}>
            <h3>✍️ Write a review</h3>
            <div className="star-select" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.button
                  type="button"
                  key={s}
                  className={(hover || rating) >= s ? 'on' : ''}
                  onMouseEnter={() => setHover(s)}
                  onClick={() => setRating(s)}
                  whileHover={{ scale: 1.35, rotate: 15 }}
                  whileTap={{ scale: 0.8 }}
                  animate={rating >= s ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  aria-label={`${s} star${s > 1 ? 's' : ''}`}
                >
                  ★
                </motion.button>
              ))}
            </div>
            <div className="form-group">
              <label htmlFor="r-name">Your name *</label>
              <input id="r-name" className="input" placeholder="John Doe" {...field('name')} />
            </div>
            <div className="form-group">
              <label htmlFor="r-product">What did you order?</label>
              <input id="r-product" className="input" placeholder="e.g. Classic Cheeseburger" {...field('product')} />
            </div>
            <div className="form-group">
              <label htmlFor="r-comment">Your review *</label>
              <textarea id="r-comment" className="input" rows={4} placeholder="Tell us about your experience…" {...field('comment')} />
            </div>
            <motion.button type="submit" className="btn btn-primary btn-block" whileTap={{ scale: 0.96 }}>
              Submit review ⭐
            </motion.button>
          </Reveal>
        </div>

        <div className="container">
          {reviews.length === 0 ? (
            <Reveal variant="zoomIn" className="empty-state small">
              <span>💬</span>
              <h3>No reviews yet</h3>
              <p>Be the first to share your experience!</p>
            </Reveal>
          ) : (
            <motion.div className="reviews-grid" layout>
              <AnimatePresence initial={false}>
                {reviews.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    className="review-card"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease, delay: (i % 3) * 0.08 }}
                  >
                    <div className="rv-head">
                      <span className="avatar">{r.avatar || r.name[0]}</span>
                      <div>
                        <strong>{r.name}</strong>
                        <span className="muted">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                    <p>“{r.comment}”</p>
                    {r.product && <span className="chip">🍽️ {r.product}</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
