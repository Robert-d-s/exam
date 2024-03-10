import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Navbar from "./nav";
import Section from "./section";
import { BackgroundBeams } from "../components/ui/background-beams";
import ContactForm from "./contact";
import ServiceTable from "./table";

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
    visible: {
      opacity: 0.5,
      transition: { duration: 0.4, delay: 0.2, ease: "easeOut" },
    },
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

  const sectionColors = ["bg-gray-900", "bg-gray-800", "bg-gray-700"];

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
  const isActiveSectionCorrectlySet = (section: string) =>
    activeSection === section;

  return (
    <>
      <BackgroundBeams />
      <div className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <Navbar
          sections={sections}
          setActiveSection={setActiveSection}
          activeSection={activeSection}
        />

        <div className="sections-container flex flex-col; st-top">
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
            <div className="flex pt-10 ">
              {activeSection === "Home" && (
                <div className="flex justify-center items-start ">
                  {/* <ServiceTable /> */}
                  <ServiceTable
                    onContactClick={() => setActiveSection("Contact")}
                  />
                </div>
              )}

              {sections
                .filter(
                  (section) =>
                    section !== "Contact" &&
                    isActiveSectionCorrectlySet(section)
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
                      color={sectionColors[index % sectionColors.length]}
                      zIndex={
                        activeSection === section
                          ? sections.length
                          : sections.length - index
                      }
                      videoSrc={videoSrc}
                      isContactFormActive={isContactActive}
                    />
                  );
                })}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Home;
