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
  if (!isActive) return null; // Render nothing if not active

  return (
    <div className="people-section grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {peopleData.map((person, index) => (
        <PersonCard key={index} person={person} />
      ))}
    </div>
  );
};

interface PersonCardProps {
  person: Person;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const [hover, setHover] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="person-card cursor-pointer overflow-hidden relative w-full h-auto"
      // onMouseEnter={() => setHover(true)}
      // onMouseLeave={() => setHover(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* <Image
        src={hover ? person.images[1] : person.images[0]}
        alt={person.name}
        layout="responsive" // This can help if your containers have a fixed aspect ratio
        width={342} // Image's natural width
        height={512} // Image's natural height
        className="rounded-lg transition-all duration-700 ease-in-out"
      /> */}
      <div className="relative w-full h-full">
        {/* Base Image */}
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
        {/* Hover Image */}
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
      <div className="absolute inset-0 flex flex-col justify-end p-4  bg-opacity-50 rounded-lg">
        <h3 className="text-white text-xl font-bold">{person.name}</h3>
        {person.roles.map((role, index) => (
          <p key={index} className="text-white text-md">
            {role}
          </p>
        ))}
      </div>
    </div>
  );
};

export default PeopleSection;
