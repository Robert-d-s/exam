import { useQuery, useMutation, gql } from "@apollo/client";
import { useState, useEffect } from "react";
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
  teams: { teamId: string; team: { name: string } }[];
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
      teams {
        id
        name
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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<{
    [userId: number]: string;
  }>({});

  const {
    loading: loadingUsers,
    error: errorUsers,
    data: dataUsers,
    refetch: refetchUsers,
  } = useQuery(GET_USERS);
  const { loading: loadingTeams, data: dataTeams } = useQuery(GET_TEAMS);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  //   const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM);
  const [removeUserFromTeam] = useMutation(REMOVE_USER_FROM_TEAM);
  const [errorMessage, setErrorMessage] = useState("");

  const [addUserToTeam] = useMutation(ADD_USER_TO_TEAM, {
    onCompleted: () => refetchUsers(), // Refetch users to update UI with new team associations
  });

  //   useEffect(() => {
  //     if (dataUsers) {
  //       setUsers(dataUsers.users);
  //     }
  //   }, [dataUsers]);
  useEffect(() => {
    if (dataUsers) {
      console.log("Fetched users with teams:", dataUsers);
      const usersWithTeams = dataUsers.users.map((user: User) => ({
        ...user,
        teams: user.teams || [], // Ensure teams is an array
      }));
      setUsers(usersWithTeams);
    }
  }, [dataUsers]);

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

  //   const handleAddUserToTeam = async (userId: number, teamId: string) => {
  //     try {
  //       await addUserToTeam({ variables: { userId, teamId } });
  //       // Refresh the user list or display success message
  //     } catch (error) {
  //       console.error("Error adding user to team:", error);
  //       // Handle error
  //     }
  //   };

  const handleAddUserToTeam = async (userId: number) => {
    const teamId = selectedTeam[userId];
    if (teamId) {
      try {
        await addUserToTeam({ variables: { userId, teamId } });
      } catch (error) {
        console.error("Error adding user to team:", error);
      }
    }
  };

  const handleTeamSelection = (userId: number, teamId: string) => {
    setSelectedTeam((prev) => ({ ...prev, [userId]: teamId }));
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

  //   return (
  //     <div>
  //       <table>
  //         <thead>
  //           <tr>
  //             <th>Email</th>
  //             <th>Team</th>
  //             <th>Role</th>
  //             <th>Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {users.map((user) => (
  //             <tr key={user.id}>
  //               <td>{user.email}</td>
  //               <td>
  //                 <select
  //                   onChange={(e) => handleAddUserToTeam(user.id, e.target.value)}
  //                 >
  //                   <option value="">Select team...</option>
  //                   {dataTeams?.fetchTeamsFromLinear.nodes.map((team: Team) => (
  //                     <option key={team.id} value={team.id}>
  //                       {team.name}
  //                     </option>
  //                   ))}
  //                 </select>
  //               </td>
  //               <td>
  //                 <select
  //                   defaultValue={user.role}
  //                   onChange={(e) =>
  //                     handleRoleChange(user.id, e.target.value as UserRole)
  //                   }
  //                 >
  //                   {Object.values(UserRole).map((role) => (
  //                     <option key={role} value={role}>
  //                       {role}
  //                     </option>
  //                   ))}
  //                 </select>
  //               </td>
  //               <td>
  //                 <button
  //                   onClick={() =>
  //                     handleRemoveUserFromTeam(user.id /* teamId here */)
  //                   }
  //                 >
  //                   Remove from Team
  //                 </button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //       {errorMessage && <p>{errorMessage}</p>}
  //     </div>
  //   );

  return (
    <div>
      <table>
        {/* ... other table elements */}
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{/* ... team selection dropdown and add button */}</td>
              <td>
                {user.teams && user.teams.length > 0 ? (
                  <ul>
                    {user.teams.map((team) => (
                      <li key={team.teamId}>{team.team.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No teams assigned</p>
                )}
              </td>
              {/* ... other columns */}
            </tr>
          ))}
        </tbody>
      </table>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default AdminPage;
