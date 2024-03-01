import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Navbar from "./navTest";
import Section from "./sectionTest";
import { BackgroundBeams } from "../components/ui/background-beams";
import ContactForm from "./contact";

const Home: NextPage = () => {
  const sections = [
    "Home",
    "About",
    "Services",
    "People",
    "Contact",
    "Internal",
  ];

  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const isContactActive = activeSection === "Contact";
  const backgroundFadeVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 0.5 },
  };
  const closeContactForm = () => {
    setActiveSection("Home");
  };

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

  const handleFormSubmit = (data: {
    name: string;
    email: string;
    message: string;
  }) => {
    console.log("Form Data:", data);

    setActiveSection("Home");
  };
  const isActiveSectionCorrectlySet = (section: string) => {
    if (isContactActive) {
      return activeSection === section;
    }
    return activeSection === section;
  };

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
            {isContactActive && (
              <>
                {/* Backdrop with opacity */}
                <motion.div
                  className="fixed inset-0 z-40 bg-black bg-opacity-50"
                  variants={backgroundFadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                ></motion.div>
                {/* Contact Form without inheriting opacity */}
                <motion.div
                  className="fixed inset-0 z-50 flex justify-center items-center"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <ContactForm
                    onSubmit={handleFormSubmit}
                    onClose={closeContactForm}
                  />
                </motion.div>
              </>
            )}

            {sections
              .filter(
                (section) =>
                  section !== "Contact" && isActiveSectionCorrectlySet(section)
              )
              .map((section, index) => {
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
                    isContactFormActive={isContactActive}
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
