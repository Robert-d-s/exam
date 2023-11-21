import React from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

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
  const { loading, error, data } = useQuery<{ issues: Issue[] }>(GET_ISSUES);

  console.log("GraphQL Response:", { loading, error, data });

  if (loading) return <p>Loading issues...</p>;
  if (error) {
    console.error("Error loading issues:", error); // Detailed error log
    return <p>Error loading issues: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Issues</h1>
      {data && data.issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p>Created At: {issue.createdAt}</p>
                <p>Updated At: {issue.updatedAt}</p>
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
