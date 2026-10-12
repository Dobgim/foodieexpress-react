import { useState } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HQ_POS } from '../lib/catalog';
import { PageTransition } from '../components/Overlays';
import { PageHeader } from '../components/Layout';
import { LeafletMap, mapIcon } from '../components/LeafletMap';
import { Reveal, RevealGroup, RevealItem } from '../components/Motion';

const CARDS = [
  [MapPin, 'Visit us', '123 Food Street, Flavor City, FC 12345'],
  [Phone, 'Call us', '+1 (555) 123-4567'],
  [Mail, 'Email us', 'hello@foodieexpress.com'],
  [Clock, 'Working hours', 'Mon – Sun: 8:00 AM – 11:00 PM'],
];

export default function Contact() {
  const { toast } = useStore();
  const empty = { name: '', email: '', subject: '', message: '' };
  const [form, setForm] = useState(empty);
  const field = (key) => ({ value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return toast('Please fill in all required fields.', 'error');
    toast("Message sent. We'll get back to you soon.");
    setForm(empty);
  };

  return (
    <PageTransition>
      <PageHeader label="Contact" title="Get in touch" text="Questions, feedback or a big catering order? We'd love to hear from you." />
      <section className="section pt-0">
        <div className="container contact-layout">
          <RevealGroup className="contact-cards" stagger={0.1}>
            {CARDS.map(([Icon, title, text]) => (
              <RevealItem key={title} variant="left">
                <motion.div className="contact-card" whileHover={{ x: 8, scale: 1.02 }}>
                  <motion.span className="cc-icon" whileHover={{ scale: 1.08 }}>
                    <Icon size={22} strokeWidth={1.8} />
                  </motion.span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal as="form" variant="zoomIn" className="card" onSubmit={submit}>
            <h2 className="heading-sm">Send us a message</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="c-name">Your name *</label>
                <input id="c-name" className="input" placeholder="John Doe" {...field('name')} />
              </div>
              <div className="form-group">
                <label htmlFor="c-email">Your email *</label>
                <input id="c-email" type="email" className="input" placeholder="john@example.com" {...field('email')} />
              </div>
              <div className="form-group full">
                <label htmlFor="c-subject">Subject</label>
                <input id="c-subject" className="input" placeholder="How can we help?" {...field('subject')} />
              </div>
              <div className="form-group full">
                <label htmlFor="c-message">Message *</label>
                <textarea id="c-message" className="input" rows={5} placeholder="Your message…" {...field('message')} />
              </div>
            </div>
            <motion.button type="submit" className="btn btn-primary btn-lg btn-block" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              Send message
            </motion.button>
          </Reveal>
        </div>
        <div className="container">
          <Reveal variant="zoomOut" className="contact-map">
            <LeafletMap
              className="map map-contact"
              zoom={14}
              onReady={(map) => {
                L.marker(HQ_POS, { icon: mapIcon('kitchen', 42) }).addTo(map).bindPopup('<b>FoodieExpress Kitchen</b><br>Come say hi!').openPopup();
              }}
            />
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
