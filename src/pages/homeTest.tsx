import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Navbar from "./navTest";
import Section from "./sectionTest";
import { BackgroundBeams } from "../components/ui/background-beams";

const Home: NextPage = () => {
  const sections = ["Home", "About", "Services", "People", "Contact"];
  // const [activeSection, setActiveSection] = useState<string>("Home");
  const [activeSection, setActiveSection] = useState<string>(sections[0]);

  // Initialize sectionProps with all sections and their default properties
  interface SectionProps {
    [key: string]: { zIndex: number; opacity: number };
  }

  const [sectionProps, setSectionProps] = useState<SectionProps>(
    sections.reduce((acc, section, index) => {
      acc[section as keyof SectionProps] = {
        zIndex: sections.length - index, // Stack sections with initial z-index
        opacity: section === "Home" ? 1 : 0.5, // Only the Home section is fully opaque initially
      };
      return acc;
    }, {} as SectionProps)
  );

  const sectionColors = [
    "bg-red-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-yellow-200",
  ];

  useEffect(() => {
    console.log("Component re-rendered");
    // Update sectionProps when activeSection changes
    const updatedProps = {
      ...sectionProps,
      [activeSection]: {
        ...sectionProps[activeSection],
        zIndex: sections.length,
        opacity: 1,
      }, // Bring active section to front and make it fully opaque
    };

    // Update the zIndex and opacity for inactive sections
    sections.forEach((section) => {
      if (section !== activeSection) {
        updatedProps[section] = {
          ...updatedProps[section],
          zIndex: updatedProps[section].zIndex - 1, // Move back
          opacity: 0.5, // Fade
        };
      }
    });
  }, [activeSection]);

  return (
    <>
      <BackgroundBeams />
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <Navbar
          sections={sections}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />
        <div className="sections-container flex flex-col; ">
          <AnimatePresence>
            {sections.map((section, index) => {
              // Determine the videoSrc based on the section name
              let videoSrc;
              if (section === "Home") {
                videoSrc = "/video/136259 (1080p).mp4";
              }

              return (
                <Section
                  key={section}
                  id={section}
                  content={section}
                  isActive={activeSection === section}
                  zIndex={
                    activeSection === section
                      ? sections.length
                      : sections.length - index
                  }
                  color={sectionColors[index % sectionColors.length]}
                  videoSrc={videoSrc}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Home;
