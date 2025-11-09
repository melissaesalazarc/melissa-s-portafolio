import { motion } from "framer-motion";
import AnimatedBlob from "./AnimatedBlob";
import TypewriterBubble from "./TypewriterBubble";
import "./Hero.css";
import meImg from "../assets/me.png";


const Hero = () => {
  return (
    <section id="home" className="hero-container">

      <AnimatedBlob />

      <motion.div
        className="hero-left"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}   
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1>
          Hi,<br />
          <span className="highlight">I'm Melissa</span>
        </motion.h1>

        <motion.h3 className="subtext">
          Frontend • UX/UI
        </motion.h3>

        <motion.p className="desc">
          I turn ideas into seamless digital experiences through intuitive design and clean, efficient code.
        </motion.p>

        <motion.div
          className="tech-stack"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">⚛️ React</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">🟦 TypeScript</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">💛 JavaScript</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">🎨 Figma</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">⚡ Tailwind</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">🟩 Node + Express</motion.span>
          <motion.span whileHover={{ scale: 1.1 }} className="tech-item">🐙 Git & GitHub</motion.span>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-right"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        <motion.img
          src={meImg} 
          alt="yo"
          className="hero-photo"
          initial={{ scale: 0.93, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        <div className="bubble-wrapper">
          <TypewriterBubble
            texts={[
              "Crafting interfaces that look good and feel even better.",
            ]}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
