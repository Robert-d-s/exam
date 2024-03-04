import React from "react";
import Image from "next/image";

interface Person {
  name: string;
  roles: string[];
  images: [string, string];
}

const peopleData: Person[] = [
  {
    name: "Gustav Duus",
    images: ["/members/ceo_1.jpg", "/members/ceo_2.jpg"],
    roles: ["CEO", "Co-Founder"],
  },
  {
    name: "Joakim Larsen",
    images: ["/members/m_1.jpg", "/members/m_2.jpg"],
    roles: ["Co-Founder"],
  },
  {
    name: "George Aftincai",
    images: ["/members/gerorge_1.jpg", "/members/gerorge_2.jpg"],
    roles: ["Front-end"],
  },
  {
    name: "Riccardo Conti",
    images: ["/members/ricardo_1.jpg", "/members/ricardo_2.jpg"],
    roles: ["Front-end", "Mobile"],
  },
  {
    name: "Sam Hakimane",
    images: ["/members/sam_1.jpg", "/members/sam_2.jpg"],
    roles: ["Back-end"],
  },
  {
    name: "Jedrzej Lagodzinski",
    images: ["/members/j_1.jpg", "/members/j_2.jpg"],
    roles: ["Front-end"],
  },
  {
    name: "David Lin",
    images: ["/members/david_1.jpg", "/members/david_2.jpg"],
    roles: ["Front-end", "Design"],
  },
];

interface PeopleSectionProps {
  isActive: boolean;
}

const PeopleSection: React.FC<PeopleSectionProps> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <>
      <h2 className="text-3xl font-pt-sans-bold-900 mb-1 mx-4">People</h2>
      <div className="people-section grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {peopleData.map((person, index) => (
          <PersonCard key={index} person={person} />
        ))}
      </div>
    </>
  );
};

interface PersonCardProps {
  person: Person;
}

// Define the type for the mapping object
type RoleIconMappingType = {
  [roleName: string]: string;
};

// Define the mapping from role names to icon filenames
const roleIconMapping: RoleIconMappingType = {
  CEO: "ceo.svg",
  "Co-Founder": "founder.svg",
  "Front-end": "front.svg",
  Mobile: "mobile.svg",
  "Back-end": "back.svg",
  Design: "design.svg",
};

// Function to return the icon path based on the role, with a fallback
const getIconPath = (role: string): string => {
  return `/icons/${roleIconMapping[role] || "default-icon.svg"}`;
};

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="person-card cursor-pointer overflow-hidden relative w-full h-auto "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full ">
        <Image
          src={person.images[0]}
          alt={`${person.name} - Base`}
          layout="responsive"
          width={342}
          height={512}
          className={`rounded-lg transition-opacity duration-700 ease-in-out ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />
        <div className="absolute inset-0 flex justify-center items-center">
          <Image
            src={person.images[1]}
            alt={`${person.name} - Hover`}
            layout="responsive"
            width={342}
            height={512}
            className={`rounded-lg transition-opacity duration-700 ease-in-out ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4  rounded-lg">
        <div
          style={{ width: "fit-content" }}
          className="bg-black bg-opacity-40 p-2"
        >
          <h3 className="text-white text-xl font-bold">{person.name}</h3>
        </div>
        {person.roles.map((role, index) => (
          <div key={index} style={{ width: "fit-content" }}>
            <div className="bg-black bg-opacity-40 flex items-center">
              <div className="w-8 h-8 mr-2 flex justify-center items-center relative">
                <Image
                  src={getIconPath(role)}
                  alt={`${role} icon`}
                  layout="fill"
                  objectFit="contain"
                  className="filter invert"
                />
              </div>
              <span className="text-white text-lg mr-2">{role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleSection;
