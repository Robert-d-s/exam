// RatesManager.jsx
import React, { useState } from "react";
import { useQuery, useMutation, gql, ApolloError } from "@apollo/client";

interface Team {
  id: string;
  name: string;
}

interface Rate {
  id: number;
  name: string;
  teamId: string;
  rate: number;
}

// GraphQL Queries and Mutations
const GET_ALL_SIMPLE_TEAMS = gql`
  query GetAllSimpleTeams {
    getAllSimpleTeams {
      id
      name
    }
  }
`;

const CREATE_RATE = gql`
  mutation CreateRate($name: String!, $rate: Int!, $teamId: String!) {
    createRate(rateInputCreate: { name: $name, rate: $rate, teamId: $teamId }) {
      id
      name
      rate
      teamId
    }
  }
`;

const DELETE_RATE = gql`
  mutation DeleteRate($rateId: Int!) {
    deleteRate(rateId: $rateId) {
      id
    }
  }
`;

const GET_RATES = gql`
  query GetRates($teamId: String!) {
    rates(teamId: $teamId) {
      id
      name
      rate
    }
  }
`;

const RatesManager = () => {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [rateName, setRateName] = useState("");
  const [rateValue, setRateValue] = useState(0);

  const [error, setError] = useState<ApolloError | null>(null);

  const {
    loading: teamsLoading,
    data: teamsData,
    error: teamsError,
  } = useQuery(GET_ALL_SIMPLE_TEAMS, {
    context: { useLinearApi: false },
    onError: (error) => {
      setError(error);
    },
  });

  const {
    loading: ratesLoading,
    data: ratesData,
    refetch: refetchRates,
  } = useQuery(GET_RATES, {
    variables: { teamId: selectedTeamId },
    skip: !selectedTeamId,
  });
  const [createRate] = useMutation(CREATE_RATE, {
    onCompleted: () => refetchRates(),
  });
  const [deleteRate] = useMutation(DELETE_RATE, {
    onCompleted: () => refetchRates(),
    onError: (error) => {
      console.error("Error deleting rate:", error);
    },
  });

  const handleCreateRate = () => {
    if (selectedTeamId) {
      createRate({
        variables: { name: rateName, rate: rateValue, teamId: selectedTeamId },
      });
      setRateName("");
      setRateValue(0);
    }
  };

  const handleDeleteRate = (rateId: number) => {
    console.log("Attempting to delete rate with ID:", rateId); // Debugging log
    deleteRate({ variables: { rateId } }).catch((error) => {
      setError(error);
    });
  };
  if (error) return <p>Error: {error.message}</p>;
  if (teamsLoading || ratesLoading) return <p>Loading...</p>;
  if (!teamsData || !teamsData.getAllSimpleTeams)
    return <p>No data available.</p>;

  return (
    <div className="relative max-w-lg mx-auto p-6 bg-gray-200 rounded shadow-md flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-lg">Manage Rates</h3>
      </div>

      <div className="mb-4">
        <label htmlFor="teamSelector" className="block font-medium">
          Select a Team:
        </label>
        <select
          id="teamSelector"
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          onChange={(e) => setSelectedTeamId(e.target.value)}
          value={selectedTeamId}
        >
          <option value="">Select a Team</option>
          {teamsData.getAllSimpleTeams.map((team: Team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="rateName" className="block font-medium">
          Rate Name:
        </label>
        <input
          type="text"
          id="rateName"
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          value={rateName}
          onChange={(e) => setRateName(e.target.value)}
          placeholder="Rate Name"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="rateValue" className="block font-medium">
          Amount:
        </label>
        <input
          type="number"
          id="rateValue"
          className="w-full p-2 mt-1 border border-gray-300 rounded"
          value={rateValue}
          onChange={(e) => setRateValue(parseInt(e.target.value) || 0)}
          placeholder="Amount"
        />
      </div>

      <div className="mb-4">
        <button
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleCreateRate}
        >
          Create Rate
        </button>
      </div>

      <div>
        {ratesData &&
          ratesData.rates.map((rate: Rate) => (
            <div
              key={rate.id}
              className="flex justify-between items-center p-2 bg-gray-100 border border-gray-200 rounded mb-2"
            >
              <span className="font-semibold">
                {rate.name} - {rate.rate}
              </span>
              <button
                className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDeleteRate(rate.id)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RatesManager;
