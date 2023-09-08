import React, { useState, useEffect } from "react";

const AddTimeEntry: React.FC = () => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [rateId, setRateId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch available projects when the component mounts
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{
                    projects {
                        id
                        name
                    }
                }`,
        }),
      });

      const data = await response.json();
      if (data && data.projects) {
        setProjects(data.projects);
      }
    };

    fetchProjects();
  }, []);

  const handleAddTime = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
                    mutation CreateTime($timeInputCreate: TimeInputCreate!) {
                        createTime(timeInputCreate: $timeInputCreate) {
                            id
                            startTime
                            endTime
                            projectId
                            rateId
                        }
                    }
                `,
          variables: {
            timeInputCreate: {
              startTime,
              endTime,
              projectId,
              rateId,
              userId,
            },
          },
        }),
      });

      // Parse the JSON response
      const data = await response.json();

      // Check if the response contains the expected data
      if (data && data.createTime && data.createTime.id) {
        // Provide success feedback
        alert("Time entry added successfully!");
        // Optionally, reset the form fields or navigate elsewhere
        setStartTime("");
        setEndTime("");
        setProjectId("");
        setRateId(null);
      } else if (data.errors && data.errors.length > 0) {
        // Handle any GraphQL errors
        alert(`Error: ${data.errors[0].message}`);
      } else {
        // Handle other types of errors
        alert("An unexpected error occurred.");
      }
    } catch (error: any) {
      // Handle network or other errors
      alert(
        `Network error: ${error.message || "Cannot connect to the server."}`
      );
    }
  };

  return (
    <div>
      <h2>Add Time Entry</h2>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        placeholder="Start Time"
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        placeholder="End Time"
      />
      <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        <option value="" disabled>
          Select a project
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <input
        value={rateId !== null ? rateId : ""}
        onChange={(e) => setRateId(Number(e.target.value))}
        placeholder="Rate ID"
      />
      <input
        value={userId !== null ? userId : ""}
        onChange={(e) => setUserId(Number(e.target.value))}
        placeholder="User ID"
      />
      <button onClick={handleAddTime}>Add</button>
    </div>
  );
};

export default AddTimeEntry;

// import React, { useState } from "react";

// const AddTimeEntry: React.FC = () => {
//   const [startTime, setStartTime] = useState<string>("");
//   const [endTime, setEndTime] = useState<string>("");
//   const [projectId, setProjectId] = useState<string>("");
//   //   const [rateId, setRateId] = useState<string>("");
//   const [rateId, setRateId] = useState<number | null>(null);

//   const [userId, setUserId] = useState<number | null>(null);

//   const handleAddTime = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await fetch("http://localhost:8080/graphql", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           query: `
//                     mutation CreateTime($timeInputCreate: TimeInputCreate!) {
//                         createTime(timeInputCreate: $timeInputCreate) {
//                             id
//                             startTime
//                             endTime
//                             projectId
//                             rateId
//                         }
//                     }
//                 `,
//           variables: {
//             timeInputCreate: {
//               startTime,
//               endTime,
//               projectId,
//               rateId,
//               userId,
//             },
//           },
//         }),
//       });

//       // Parse the JSON response
//       const data = await response.json();

//       // Check if the response contains the expected data
//       if (data && data.createTime && data.createTime.id) {
//         // Provide success feedback
//         alert("Time entry added successfully!");
//         // Optionally, reset the form fields or navigate elsewhere
//         setStartTime("");
//         setEndTime("");
//         setProjectId("");
//         // setRateId("");
//         setRateId(null);
//       } else if (data.errors && data.errors.length > 0) {
//         // Handle any GraphQL errors
//         alert(`Error: ${data.errors[0].message}`);
//       } else {
//         // Handle other types of errors
//         alert("An unexpected error occurred.");
//       }
//     } catch (error: any) {
//       // Handle network or other errors
//       alert(
//         `Network error: ${error.message || "Cannot connect to the server."}`
//       );
//     }
//   };

//   return (
//     <div>
//       <h2>Add Time Entry</h2>
//       <input
//         type="datetime-local"
//         value={startTime}
//         onChange={(e) => setStartTime(e.target.value)}
//         placeholder="Start Time"
//       />
//       <input
//         type="datetime-local"
//         value={endTime}
//         onChange={(e) => setEndTime(e.target.value)}
//         placeholder="End Time"
//       />
//       <input
//         value={projectId}
//         onChange={(e) => setProjectId(e.target.value)}
//         placeholder="Project ID"
//       />
//       <input
//         value={rateId !== null ? rateId : ""}
//         onChange={(e) => setRateId(Number(e.target.value))}
//         placeholder="Rate ID"
//       />

//       <input
//         value={userId !== null ? userId : ""}
//         onChange={(e) => setUserId(Number(e.target.value))}
//         placeholder="User ID"
//       />

//       <button onClick={handleAddTime}>Add</button>
//     </div>
//   );
// };

// export default AddTimeEntry;
