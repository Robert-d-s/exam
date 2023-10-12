import React from "react";

type ProjectSelectorProps = {
  projects: { id: string; name: string; teamId: string }[];
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
};

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onProjectChange,
}) => {
  return (
    <select
      value={selectedProject}
      onChange={(e) => onProjectChange(e.target.value)}
      className="form-select block w-full mt-4"
    >
      <option value="" disabled>
        Select a project
      </option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
};

export default ProjectSelector;
