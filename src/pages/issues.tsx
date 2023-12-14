import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { formatDateForDisplay } from "../utils/timeUtils";

type Label = {
  id: string;
  name: string;
  color: string;
  parentId: string;
};

type Issue = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  dueDate: string;
  projectId: string;
  priorityLabel: string;
  identifier: string;
  assigneeName: string;
  projectName: string;
  state: string;
  teamKey: string;
  teamName: string;
  labels: Label[];
};

const GET_ISSUES = gql`
  query GetIssues {
    issues {
      id
      createdAt
      updatedAt
      title
      dueDate
      projectId
      priorityLabel
      identifier
      assigneeName
      projectName
      state
      teamKey
      teamName
      labels {
        id
        name
        color
        parentId
      }
    }
  }
`;

const IssuesComponent: React.FC = () => {
  const { loading, error, data, refetch } = useQuery<{ issues: Issue[] }>(
    GET_ISSUES
  );
  const handleRefresh = () => {
    refetch();
  };
  console.log("GraphQL Response:", { loading, error, data });

  if (loading) return <p>Loading issues...</p>;
  if (error) {
    console.error("Error loading issues:", error);
    return <p>Error loading issues: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Issues</h1>
        <button
          onClick={handleRefresh}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          style={{ width: "40px", height: "40px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M16 15L24 15 20 20zM8 9L0 9 4 4z"></path>
            <path d="M21 6c0-1.654-1.346-3-3-3H7.161l1.6 2H18c.551 0 1 .448 1 1v10h2V6zM3 18c0 1.654 1.346 3 3 3h10.839l-1.6-2H6c-.551 0-1-.448-1-1V8H3V18z"></path>
          </svg>
        </button>
      </div>
      {data && data.issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.issues.map((issue) => (
            <div key={issue.id} className="border border-gray-200 rounded p-4">
              <h2 className="text-xl font-semibold">{issue.title}</h2>
              <p className="text-sm text-gray-500">
                Project: {issue.projectName}
              </p>
              {/* Render labels for each issue */}
              <div className="flex flex-wrap mt-2">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    style={{ backgroundColor: label.color }}
                    className="text-white text-xs font-semibold mr-2 mb-2 px-2 py-1 rounded"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              {/* Rest of the issue details */}
              <div className="mt-2 text-sm text-gray-500">
                <p>Due Date: {issue.dueDate}</p>
                <p>
                  Created At: {formatDateForDisplay(new Date(issue.createdAt))}
                </p>
                <p>
                  Updated At: {formatDateForDisplay(new Date(issue.updatedAt))}
                </p>
                <p>Priority: {issue.priorityLabel}</p>
                <p>State: {issue.state}</p>
                <p>Team Key: {issue.teamKey}</p>
                <p>Team: {issue.teamName}</p>
                <p>Assignee: {issue.assigneeName}</p>
                <p>Identifier: {issue.identifier}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No issues found.</div>
      )}
    </div>
  );
};

export default IssuesComponent;
