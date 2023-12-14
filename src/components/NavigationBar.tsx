import React from "react";
import Image from "next/image";
import { currentUserVar } from "../lib/apolloClient";

// NavigationBar component
const NavigationBar: React.FC = () => {
  const loggedInUser = currentUserVar();
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center">
        <Image
          src="/logo.svg" // Route of the image file
          alt="Enablment-tt Logo"
          width={200} // Specify the width
          height={40} // Specify the height
        />
      </div>
      <div>
        {loggedInUser ? (
          <h2 className="text-lg text-gray-800">
            Welcome, {loggedInUser.email}
          </h2>
        ) : (
          <p className="text-md text-gray-500">Loading user data...</p>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
