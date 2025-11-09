import { motion } from "framer-motion";
import "./About.css";

export default function About() {
  return (
    <section className="about-container">
      {/* Texto Izquierda */}
      <motion.div
        className="about-text"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <h2>About Me</h2>

        <p>
          I’m a Frontend Engineer with a strong UX/UI background, passionate about building digital experiences that feel intuitive, 
          visually refined, and genuinely enjoyable to use.
        </p>

        <p>
          I blend engineering, design, and creative thinking to turn ideas into interactive products that connect 
          with users and feel alive through thoughtful details.
        </p>

        <p>
          My work combines user-centered design, modern frontend development, and smooth interactions using React, 
          TypeScript, and scalable component systems.
        </p>
      </motion.div>

      {/* Lado derecho: tarjetas creativas */}
      <motion.div
        className="about-cards"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Tarjeta 1 */}
        <motion.div
          className="skill-card"
          whileHover={{ scale: 1.08, rotate: "-2deg" }}
        >
          <h3>🎨 UI • Visual Design</h3>
          <p>Modern aesthetics, clear hierarchy, purposeful layouts, and brand-consistent visuals.</p>
        </motion.div>

        {/* Tarjeta 2 */}
        <motion.div
          className="skill-card"
          whileHover={{ scale: 1.08, rotate: "2deg" }}
        >
          <h3>✨ UX • Product Thinking</h3>
          <p>Human-centered flows, intuitive navigation, and meaningful micro-interactions.</p>
        </motion.div>

        {/* Tarjeta 3 */}
        <motion.div
          className="skill-card"
          whileHover={{ scale: 1.08, rotate: "-1deg" }}
        >
          <h3>💻 Frontend Dev</h3>
          <p>React, TypeScript, responsive UI, clean architecture, and reusable components.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
