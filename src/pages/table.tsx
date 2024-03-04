import React from "react";

// Define the TypeScript type for the table data
type ClientServiceData = {
  client: string;
  year: number;
  services: string;
};
interface ServiceTableProps {
  onContactClick: () => void;
}

// Sample data array
const tableData: ClientServiceData[] = [
  {
    client: "Modstrøm",
    year: 2023,
    services: "Climate Footprint Reporting: Scope 1 and 2",
  },
  { client: "Junkfood", year: 2023, services: "Climate Footprint Reporting" },
  { client: "Confidential", year: 2023, services: "Cloud, User Platform" },
  { client: "Shipping Company", year: 2023, services: "Cloud, User Platform" },
  { client: "B93", year: 2023, services: "Website, UI & UX" },
  {
    client: "B:A:M",
    year: 2024,
    services: "Video Streaming Platform and Mobil App",
  },
  { client: "H5", year: 2024, services: "Website" },
  // ... other data objects
];

// The React component
// const ServiceTable: React.FC = () => {
const ServiceTable: React.FC<ServiceTableProps> = ({ onContactClick }) => {
  return (
    <div className="flex flex-col mx-4 st">
      <p className="text-3xl font-pt-sans-bold-900 pb-2">
        Our Happy Collaborators
      </p>
      {tableData.map((item, index) => (
        <div key={index} className="w-full pb-2">
          <div className="bg-white shadow rounded-lg p-3">
            <h3 className="text-lg font-semibold">{item.client}</h3>
            <p className="text-gray-600 font-roboto">Year: {item.year}</p>
            <p className="text-gray-600 font-roboto">
              Services: {item.services}
            </p>
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-2">
        <button
          className="bg-black hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
          // onClick={onContactClick}
        >
          Shall we collaborate ?
        </button>
      </div>
    </div>
  );
};

export default ServiceTable;
