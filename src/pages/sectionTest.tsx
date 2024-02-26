import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";
import { ContentWrapper } from "./contentWrapper";

interface SectionProps {
  id: string;
  content: string;
  isActive: boolean;
  color: string;
  zIndex: number;
}

const Section: React.FC<SectionProps> = ({
  id,
  content,
  isActive,
  color,
  zIndex,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isActive ? "active" : "inactive");
  }, [isActive, controls]);

  const sectionVariants = {
    inactive: {
      y: -40,
      opacity: 0.7,
      scale: 0.95,
      zIndex: zIndex,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    active: {
      y: 0,
      opacity: 1,
      scale: 1,
      zIndex: zIndex,
      transition: {
        y: {
          duration: 0.2,
          type: "spring",
          from: "40vh",
          stiffness: 70,
          damping: 15,
        },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    },
    exit: {
      y: 50,
      opacity: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      layoutId={id}
      variants={sectionVariants}
      initial="initial" // Use 'initial' for the entering animation
      animate={controls}
      exit="inactive"
      transition={{ duration: 0.5, type: "easeOut" }}
      className={`section p-10  rounded-3xl shadow-lg ${color} `}
      style={{
        position: "absolute",
        width: "75%",
        top: 100,
        right: 0,
        bottom: 0,
        boxSizing: "border-box",
      }}
    >
      <ContentWrapper isActive={isActive}>
        <h2 className="text-2xl font-bold mb-4">{content}</h2>
        <p className="text-gray-700">
          Placeholder content for the {content} section. Replace this with any
          content you like.
        </p>
      </ContentWrapper>
    </motion.div>
  );
};

export default Section;
