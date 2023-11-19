import React from "react";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";

import {
  formatDateForDisplay,
  formatTimeFromISOString,
} from "../utils/timeUtils";

interface Team {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  key: string;
  description: string | null;
}

interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  lastSeen: string | null;
  teams: {
    nodes: Team[];
  };
}

interface Organization {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  users: {
    nodes: User[];
  };
}

interface GetOrganizationResponse {
  getOrganization: Organization;
}

const GET_ORGANIZATION = gql`
  query getOrganization {
    getOrganization {
      id
      createdAt
      updatedAt
      name
      users {
        nodes {
          id
          createdAt
          updatedAt
          name
          displayName
          email
          avatarUrl
          lastSeen
          teams {
            nodes {
              id
              createdAt
              updatedAt
              name
              key
              description
            }
          }
        }
      }
    }
  }
`;

const OrganizationComponent = () => {
  // const { loading, error, data } = useQuery<{ organization: Organization }>(
  const { loading, error, data } =
    useQuery<GetOrganizationResponse>(GET_ORGANIZATION);

  console.log({ loading, error, data });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const formatDateTime = (isoString: string) => {
    return isoString
      ? `${formatDateForDisplay(
          new Date(isoString)
        )} at ${formatTimeFromISOString(isoString)}`
      : "N/A";
  };

  const organization = data?.getOrganization;
  console.log({ loading, error, data });
  console.log("Organization data at render:", organization);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Organization: {organization?.name}
      </h1>
      <div className="mb-6">
        <p>ID: {organization?.id}</p>
        <p>
          Created At:{" "}
          {organization?.createdAt
            ? formatDateTime(organization.createdAt)
            : "N/A"}
        </p>
        <p>
          Updated At:{" "}
          {organization?.updatedAt
            ? formatDateTime(organization.updatedAt)
            : "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organization?.users.nodes.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold">{user.displayName}</h3>
            <p className="text-gray-600">ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>
              Last Seen: {user.lastSeen ? formatDateTime(user.lastSeen) : "N/A"}
            </p>
            <div className="w-20 h-20 rounded-full my-2 overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Avatar"
                  width={80}
                  height={80}
                  layout="responsive"
                />
              ) : (
                <Image
                  src="/E.png"
                  alt="Default Avatar"
                  width={40}
                  height={40}
                  layout="responsive"
                />
              )}
            </div>

            <h4 className="text-lg font-semibold mt-3">Teams</h4>
            <ul className="list-disc pl-5">
              {user.teams.nodes.map((team) => (
                <li
                  key={team.id}
                  className="border-b border-gray-200 mb-2 pb-2"
                >
                  <p>Team Name: {team.name}</p>
                  <p>Team ID: {team.id}</p>
                  <p>Created At: {formatDateTime(user.createdAt)}</p>
                  <p>Updated At: {formatDateTime(user.updatedAt)}</p>
                  <p>Description: {team.description || "No description"}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationComponent;
