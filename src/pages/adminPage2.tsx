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

type User = {
  id: number;
  email: string;
  role: UserRole;
  //   teams: { teamId: string; team: { name: string } }[];
};

type Team = {
  id: string;
  name: string;
};

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      role
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
const AdminPage = () => {
  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
  } = useQuery(GET_USERS);
  const { loading: loadingTeams, data: dataTeams } = useQuery(GET_TEAMS);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM);
  const [removeUserFromTeam] = useMutation(REMOVE_USER_FROM_TEAM);
  const [errorMessage, setErrorMessage] = useState("");
  console.log("user data: ", dataUsers);
  console.log("error data: ", errorUsers);
  if (loadingUsers || loadingTeams) return <p>Loading...</p>;
  if (errorUsers) {
    const graphQLError = errorUsers.graphQLErrors[0];
    const message = graphQLError
      ? graphQLError.message
      : errorUsers.networkError
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

  return (
    <div>
      <table>
        <tbody>
          {dataUsers?.users.map((user: User) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <select
                  onChange={(e) => handleAddUserToTeam(user.id, e.target.value)}
                >
                  <option value="">Add to team...</option>
                  {dataTeams?.fetchTeamsFromLinear.nodes.map((team: Team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{/* Role dropdown logic here */}</td>
              {/* Additional columns as needed */}
            </tr>
          ))}
        </tbody>
      </table>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default AdminPage;
