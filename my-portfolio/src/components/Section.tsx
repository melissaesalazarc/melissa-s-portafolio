import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  id: string;
  title: string;
  children?: ReactNode;
}

export default function Section({ id, title, children }: Props) {
  return (
    <div id={id} className="section-inner">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="section-content"
      >
        {children}
      </motion.div>
    </div>
  );
}
