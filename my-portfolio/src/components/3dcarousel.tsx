import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./3dcarousel.css";
import neorisImg from "../assets/NEORIS.png";
import xcienImg from "../assets/XCIEN.png";
import baemiImg from "../assets/BAEMI.png";
import pictolingo from "../assets/PICTOLINGO.png";

export default function ThreeDCarousel() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [direction, setDirection] = useState(1); 
  const [isHovering, setIsHovering] = useState(false);

  const speed = 0.35; 

  const projects = [
    {
      title: "Pictolingo, andorid app",
      company: "Nuevo Amanecer • 2023",
      description:
        "Android educational app developed in Kotlin as part of a team project for a non-profit organization supporting children with neurological disabilities. I was responsible for designing and implementing three interactive mini-games: a puzzle game, a word-building activity, and a memory match game. My work focused on creating intuitive game logic, responsive UI components, and engaging learning experiences tailored to the needs of young users.",
      image: pictolingo ,
      url: "https://youtu.be/2j5H3laLR_c",
    },
    {
      title: "Dashboard Platform with Chatbot",
      company: "Neoris • 2024",
      description:
        "Interactive internal platform with user management, data visualization, and modular dashboards. I developed the frontend, built reusable components, and implemented login, user roles, and dynamic visualizations using network graphs.",
      image: neorisImg ,
      url: "https://youtu.be/H0J7G12T8KI",
    },
    {
      title: "Network Monitoring Platform",
      company: "XCIEN • 2025",
      description:
        "Real-time network visualization platform with user profiles and automated reports. I led the UX/UI and frontend development, built dashboards, authentication, user management, and data persistence with Firebase, and connected the frontend with backend services.",
      image: xcienImg,
      url: "https://youtu.be/T3WI1LJKO6g",
    },
    {
      title: "Business Website",
      company: "Comercializadora BAEMI • 2025",
      description:
        "Responsive website showcasing company history, services, and product catalog. I designed the information architecture, created the UI system, and built a clean, fast interface optimized for clarity and cross-device navigation.",
      image: baemiImg,
      url: "https://www.baemigroup.com/",
    },
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    const wrapper = wrapperRef.current;

    if (!slider || !wrapper) return;

    const totalWidth = slider.scrollWidth / 2;

    const animate = () => {
      if (!isHovering) {
        slider.scrollLeft += direction * speed;

        // ✅ Loop perfecto sin vibraciones
        if (slider.scrollLeft >= totalWidth) {
          slider.scrollLeft = 0;
        }
        if (slider.scrollLeft <= 0) {
          slider.scrollLeft = totalWidth;
        }
      }
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // ✅ Detectar lado derecho/izquierdo
    const moveHandler = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < rect.width / 2) {
        setDirection(-1);
      } else {
        setDirection(1);
      }
    };

    wrapper.addEventListener("mousemove", moveHandler);
    wrapper.addEventListener("mouseenter", () => setIsHovering(true));
    wrapper.addEventListener("mouseleave", () => setIsHovering(false));

    return () => {
      wrapper.removeEventListener("mousemove", moveHandler);
    };
  }, [direction, isHovering]);

  return (
    <div className="carousel-wrapper" ref={wrapperRef}>
      <div className="carousel-track" ref={sliderRef}>
        {[...projects, ...projects].map((p, i) => (
          <motion.div
            key={i}
            className="carousel-card"
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

              <a className="btn-c" href={p.url} target="_blank">
                View Project
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
