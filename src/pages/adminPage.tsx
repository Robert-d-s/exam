import { useQuery, useMutation, gql } from "@apollo/client";
import { useState } from "react";
import { ApolloError } from "@apollo/client";
import { logout } from "../lib/apolloClient";

enum UserRole {
  ADMIN = "ADMIN",
  ENABLER = "ENABLER",
  COLLABORATOR = "COLLABORATOR",
  PENDING = "PENDING",
}

// User type
type User = {
  id: number;
  email: string;
  role: UserRole;
  teams: { teamId: string; team: { name: string } }[];
};

type Team = {
  teamId: string;
  team: {
    name: string;
  };
};

// GraphQL Queries and Mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      role
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: Int!, $newRole: UserRole!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      id
      role
    }
  }
`;

const ADD_USER_TO_TEAM = gql`
  mutation AddUserToTeam($userId: Int!, $teamId: String!) {
    addUserToTeam(userId: $userId, teamId: $teamId) {
      id
      email
      teams {
        teamId
        team {
          name
        }
      }
    }
  }
`;

const REMOVE_USER_FROM_TEAM = gql`
  mutation RemoveUserFromTeam($userId: Int!, $teamId: String!) {
    removeUserFromTeam(userId: $userId, teamId: $teamId) {
      id
      email
      teams {
        teamId
        team {
          name
        }
      }
    }
  }
`;

const GET_TEAMS = gql`
  query FetchTeamsFromLinear {
    fetchTeamsFromLinear {
      nodes {
        id
        name
      }
    }
  }
`;

// Admin Page Component
const AdminPage = () => {
  const { loading, error, data } = useQuery(GET_USERS);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: dataTeams } = useQuery(GET_TEAMS);

  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM);
  const [removeUserFromTeam] = useMutation(REMOVE_USER_FROM_TEAM);

  if (loading) return <p>Loading...</p>;
  if (error) {
    const graphQLError = error.graphQLErrors[0];
    const message = graphQLError
      ? graphQLError.message
      : error.networkError
      ? "Network error, please try again."
      : "An error occurred.";

    // Specific handling based on error type
    if (graphQLError && graphQLError.extensions?.code === "FORBIDDEN") {
      // Handle Forbidden error
      return <p>You do not have permission to view this resource.</p>;
    } else if (
      graphQLError &&
      graphQLError.extensions?.code === "UNAUTHENTICATED"
    ) {
      // Handle Unauthorized error
      logout();
      return;
    }

    return <p>Error: {message}</p>;
  }

  const handleAddUserToTeam = async (userId: number, teamId: string) => {
    try {
      await addUserToTeam({ variables: { userId, teamId } });
      // Refresh the user list or display success message
    } catch (error) {
      console.error("Error adding user to team:", error);
      // Handle error
    }
  };

  const handleRemoveUserFromTeam = async (userId: number, teamId: string) => {
    try {
      await removeUserFromTeam({ variables: { userId, teamId } });
      // Refresh the user list or display success message
    } catch (error) {
      console.error("Error removing user from team:", error);
      // Handle error
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    console.log(`Updating role for user ${userId} to ${newRole}`);
    try {
      await updateUserRole({ variables: { userId, newRole } });
      setErrorMessage("");
    } catch (error) {
      if (error instanceof ApolloError) {
        const message =
          error.graphQLErrors[0]?.message ||
          "An error occurred while updating user role";
        setErrorMessage(message);
      } else {
        console.error("Error updating user role:", error);
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  // return (
  //   <div>
  //     <h1 className="text-2xl font-bold">Admin Dashboard</h1>
  //     <button onClick={handleLogout}>Logout</button>
  //     <table className="min-w-full">
  //       <thead>
  //         <tr>
  //           <th>Email</th>
  //           <th>Role</th>
  //           <th>Actions</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {data.users.map((user: User) => (
  //           <tr key={user.id}>
  //             <td>{user.email}</td>
  //             <td>
  //               <select
  //                 value={user.role}
  //                 onChange={(e) =>
  //                   handleRoleChange(user.id, e.target.value as UserRole)
  //                 }
  //                 className="form-select"
  //               >
  //                 {Object.values(UserRole).map((role) => (
  //                   <option key={role} value={role}>
  //                     {role}
  //                   </option>
  //                 ))}
  //               </select>
  //             </td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //     {errorMessage && (
  //       <p className="text-red-500 text-sm my-2">{errorMessage}</p>
  //     )}
  //   </div>
  // );

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Teams</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as UserRole)
                  }
                  className="form-select"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {/* Teams list */}
                <ul>
                  {user.teams.map((team: Team) => (
                    <li key={team.teamId}>
                      {team.team.name}
                      <button
                        onClick={() =>
                          handleRemoveUserFromTeam(user.id, team.teamId)
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {/* Add to team dropdown */}
                <select
                  onChange={(e) => handleAddUserToTeam(user.id, e.target.value)}
                  className="form-select"
                >
                  <option value="">Add to team...</option>
                  {dataTeams?.teams.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {errorMessage && (
        <p className="text-red-500 text-sm my-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default AdminPage;
