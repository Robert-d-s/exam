import React from "react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "../lib/apolloClient";
import { currentUserVar } from "../lib/apolloClient";

// NavigationBar component
const NavigationBar: React.FC = () => {
  const loggedInUser = currentUserVar();
  const handleLogout = () => {
    logout();
  };
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center">
        <Image
          src="/logo.svg"
          alt="Enablment-tt Logo"
          width={200}
          height={40}
        />
        <div className="ml-4">
          <Link href="/issues2" className="mr-4">
            Issues
          </Link>
          <Link href="/adminPage" className="mr-4">
            Admin
          </Link>
          <Link href="/timeKeeper2">Timekeeper</Link>
        </div>
      </div>
      <div>
        <div>
          {loggedInUser ? (
            <h2
              className="text-lg bg-gray-800 text-white px-4  m-1 rounded"
              style={{ fontSize: "16px" }}
            >
              Welcome, {loggedInUser.email}
            </h2>
          ) : (
            <p className="text-md text-gray-500">Loading user data...</p>
          )}
        </div>
        <button
          className="bg-black text-white rounded hover:bg-gray-800 font-bold py-1 px-4 float-right"
          style={{ fontSize: "12px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
