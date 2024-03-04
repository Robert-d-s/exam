import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

interface NavbarProps {
  sections: string[];
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({
  sections = [],
  setActiveSection,
  activeSection,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const router = useRouter();

  const handleSectionClick = (section: string) => {
    if (section === "Internal") {
      // If the section is 'Internal', navigate to the login route
      router.push("/login");
    } else {
      setActiveSection(section);
    }
  };

  return (
    // <nav className="flex justify-center space-x-4 p-4">
    <nav
      className="relative flex items-center justify-center p-4"
      style={{ minHeight: "64px" }}
    >
      <div className="absolute left-0 pl-4">
        <Image src="/icons/logo.svg" alt="Logo" width={100} height={50} />
      </div>
      <div className="flex justify-center space-x-4">
        {sections.map((section) => (
          // Use onMouseEnter and onMouseLeave on the parent div
          <div
            key={section}
            className="flex items-center"
            onMouseEnter={() => setHoveredSection(section)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div
              className={`h-4 w-4 rounded-full  cursor-pointer transition duration-800 ease-in-out ${
                activeSection === section
                  ? "bg-green-500"
                  : hoveredSection === section
                  ? "bg-gray-500"
                  : "bg-transparent border-2 border-black"
              }`}
              // onClick={() => setActiveSection(section)}
              onClick={() => handleSectionClick(section)}
            />
            <button
              className="text-black py-2 px-4"
              // onClick={() => setActiveSection(section)}
              onClick={() => handleSectionClick(section)}
            >
              {section}
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
