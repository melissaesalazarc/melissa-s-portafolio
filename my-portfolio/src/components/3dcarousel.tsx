import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./3dcarousel.css";
import neorisImg from "../assets/NEORIS.png";
import xcienImg from "../assets/XCIEN.png";
import baemiImg from "../assets/BAEMI.png";
import pictolingo from "../assets/PICTOLINGO.png";

export default function ThreeDCarousel() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  // ✅ Velocidad ajustable - prueba con estos valores
  const speed = 0.5; // 1=lento, 2=normal, 3=rápido

  const projects = [
    {
      title: "Pictolingo, andorid app",
      company: "Nuevo Amanecer • 2023",
      description: "Educational Android app built for children with neurological disabilities. I collaborated with the team on UX and development, designing three mini-games and implementing them in Kotlin. My focus was on creating intuitive interactions, accessible UI components, and engaging learning experiences tailored to young users and therapists.",
      image: pictolingo,
      url: "https://youtu.be/2j5H3laLR_c",
    },
    {
      title: "Dashboard Platform with Chatbot",
      company: "Neoris • 2024",
      description: "Internal platform for managing users, dashboards, and automated insights. I worked across UI/UX and frontend: structured the information architecture, designed the interface flow for user roles, and developed reusable React components. I also implemented authentication and dynamic visualizations using network graphs, collaborating closely with backend and data teams to align the product with internal needs.",
      image: neorisImg,
      url: "https://youtu.be/H0J7G12T8KI",
    },
    {
      title: "Network Monitoring Platform",
      company: "XCIEN • 2025",
      description: "Real-time network visualization SaaS. I led the UX/UI design and frontend development: mapped user journeys for admins/clients, created the design system, and built dashboards, authentication, and user management. I integrated Firebase for persistence and connected the frontend with backend services. The project improved visibility of network health and automated reporting for internal operations",
      image: xcienImg,
      url: "https://youtu.be/T3WI1LJKO6g",
    },
    {
      title: "Business Website",
      company: "Comercializadora BAEMI • 2025",
      description: "Responsive corporate website highlighting company history, services, and product catalog. I defined the site structure, designed the UI system, and built a clean, fast interface optimized for clarity and cross-device navigation. I collaborated with the business owner to refine content priorities and ensure the product supported their sales goals.",
      image: baemiImg,
      url: "https://www.baemigroup.com/",
    },
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // ✅ Función de animación mejorada
    const animate = () => {
      if (!isHovering && slider) {
        slider.scrollLeft += speed;
        
        // ✅ Loop suave
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // ✅ Limpiar animación anterior antes de empezar
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isHovering, speed]);

  return (
    <div className="carousel-wrapper">
      <div className="carousel-track" ref={sliderRef}>
        {[...projects, ...projects].map((p, i) => (
          <motion.div
            key={i}
            className="carousel-card"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            whileHover={{
              rotateX: 12,
              rotateY: -12,
              scale: 1.08,
              transition: { duration: 0.25 },
            }}
          >
            <div className="carousel-img-wrap">
              <img src={p.image} alt={p.title} />
            </div>

            <div className="carousel-info">
              <h3>{p.title}</h3>
              <p className="company">{p.company}</p>
              <p className="desc">{p.description}</p>

              <a className="btn-c" href={p.url} target="_blank" rel="noopener noreferrer">
                View Project
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}