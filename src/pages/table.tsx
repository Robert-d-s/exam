import React from "react";

// Define the TypeScript type for the table data
type ClientServiceData = {
  client: string;
  year: number;
  services: string;
};

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
    year: 2023,
    services: "Video Streaming Platform and Mobil App",
  },
  { client: "H5", year: 2023, services: "Website" },
  // ... other data objects
];

// The React component
const ServiceTable: React.FC = () => {
  //   return (
  //     <div className="overflow-x-auto">
  //       <table className="min-w-full table-auto text-left text-gray-800">
  //         <thead className="bg-gray-100">
  //           <tr>
  //             <th className="px-4 py-2 border-b-2 border-gray-200 md:px-4 sm:px-2 text-sm sm:text-base">
  //               CLIENT
  //             </th>
  //             {/* <th className="px-4 py-2 border-b-2 border-gray-200">YEAR</th> */}
  //             <th className="px-4 py-2 border-b-2 border-gray-200 md:px-4 sm:px-2 text-sm sm:text-base">
  //               SERVICES
  //             </th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {tableData.map((item, index) => (
  //             <tr key={index} className="hover:bg-gray-50">
  //               <td className="px-4 py-2 border-b border-gray-200 md:px-4 sm:px-2 text-sm sm:text-base">
  //                 {item.client}
  //               </td>
  //               {/* <td className="px-4 py-2 border-b border-gray-200">
  //                 {item.year}
  //               </td> */}
  //               <td className="px-4 py-2 border-b border-gray-200 md:px-4 sm:px-2 text-sm sm:text-base">
  //                 {item.services}
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>
  //   );
  return (
    <div className="flex flex-col mx-4">
      <p className="text-3xl font-bold">Our Happy Clients</p>
      {tableData.map((item, index) => (
        <div key={index} className="w-full pb-2">
          <div className="bg-white shadow rounded-lg p-1">
            <h3 className="text-lg font-semibold">{item.client}</h3>
            <p className="text-gray-600">Year: {item.year}</p>
            <p className="text-gray-600">Services: {item.services}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceTable;
