import React, { useState } from "react";
import { useRouter } from "next/router";

interface NavbarProps {
  sections: string[];
  setActiveSection: (section: string) => void;
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({
  sections,
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
    <nav className="flex justify-center space-x-4 p-4">
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
                ? "bg-black"
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
    </nav>
  );
};

export default Navbar;
