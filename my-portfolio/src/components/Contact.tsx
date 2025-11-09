import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";
import "./Contact.css";

export default function Contact() {
  const contactItems = [
    {
      icon: <FaGithub />,
      title: "GitHub",
      value: "github.com/melissaesalazarc",
      url: "https://github.com/melissaesalazarc",
    },
    {
      icon: <FaLinkedin />,
      title: "LinkedIn",
      value: "linkedin.com/in/melissaesalazarc",
      url: "https://www.linkedin.com/in/melissaesalazarc/",
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      value: "melissaesalazarc@gmail.com",
      url: "mailto:melissaesalazarc@gmail.com",
    },
  ];

  return (
    <section id="contact" className="contact-section">
      <motion.h2
        className="contact-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Contact
      </motion.h2>

      <div className="contact-grid">
        {contactItems.map((item, i) => (
          <motion.a
            key={i}
            href={item.url}
            target="_blank"
            className="contact-card"
            whileHover={{
              scale: 1.07,
              rotateX: 8,
              rotateY: -8,
            }}
            transition={{ type: "spring", stiffness: 150, damping: 12 }}
          >
            <div className="icon">{item.icon}</div>
            <div className="contact-info">
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
