import { motion } from "framer-motion";
import ThreeDCarousel from "./3dcarousel";
import "./Projects.css";

export default function Projects() {
  return (
    <section id="projects" className="projects-section">
      <motion.h2
        className="projects-title gradient-heading"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: false}}
      >
        Projects
      </motion.h2>

      <ThreeDCarousel />
    </section>
  );
}
