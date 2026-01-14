import { Modal } from "@mantine/core";
import { ProjectTeamEditor } from "./ProjectTeamEditor";

export function AssignMembersModal({ opened, onClose, project }) {
  return (
    <Modal opened={opened} onClose={onClose} title={`Equipe: ${project.name}`} centered size="lg">
      <ProjectTeamEditor
        project={project}
        onSaved={() => {
          onClose();
        }}
      />
    </Modal>
  );
}