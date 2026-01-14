import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Text, Badge, Group, Avatar, ActionIcon, Menu, Tooltip } from "@mantine/core";
import { IconDots, IconEdit, IconTrash, IconUserPlus, IconGripVertical, IconCalendar, IconListCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";

const statusConfig = {
  planned: { label: "Planejado", color: "gray", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  active: { label: "Ativo", color: "blue", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  completed: { label: "Concluído", color: "teal", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
  cancelled: { label: "Cancelado", color: "red", bgColor: "bg-red-50", borderColor: "border-red-200" },
};

function SortableProjectCard({ project, onEdit, onDelete, onAssign, onTasks, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-0">
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        withBorder
        className="hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing bg-white hover:border-blue-300"
        {...attributes}
        {...listeners}
      >
        {/* Header: Badge e Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge color={statusConfig[project.status]?.color || "gray"} variant="light" size="sm">
            {statusConfig[project.status]?.label || project.status}
          </Badge>

          <div onClick={(e) => e.stopPropagation()}>
            <Menu withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  style={{ flexShrink: 0 }}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconListCheck size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTasks?.(project);
                  }}
                >
                  Tarefas
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconUserPlus size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(project);
                  }}
                >
                  Equipe
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                >
                  Editar
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                >
                  Excluir
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="mb-4">
          <Text 
            fw={600} 
            size="sm" 
            className="leading-tight mb-2 line-clamp-2"
            style={{ marginBottom: project.description ? '8px' : '0', color: '#2d3748' }}
          >
            {project.name}
          </Text>
          {project.description && (
            <Text 
              size="xs" 
              c="dimmed" 
              className="line-clamp-3"
              style={{ lineHeight: '1.5', color: '#718096' }}
            >
              {project.description}
            </Text>
          )}
        </div>

        {/* Data de término */}
        {project.endDate && (
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <IconCalendar size={14} />
            <Text size="xs" c="dimmed">
              {dayjs(project.endDate).format("DD/MM/YYYY")}
            </Text>
          </div>
        )}

        {/* Footer: Equipe e Grip */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#e2e8f0' }}>
          <Group gap={8} style={{ flex: 1, minWidth: 0 }}>
            {project.developers && project.developers.length > 0 ? (
              <Tooltip.Group openDelay={300} closeDelay={100}>
                <Avatar.Group spacing="sm">
                  {project.developers.slice(0, 3).map((dev) => (
                    <Tooltip key={dev.id} label={dev.name}>
                      <Avatar
                        src={resolveAssetUrl(dev.avatarUrl)}
                        radius="xl"
                        size="sm"
                        alt={dev.name}
                      >
                        {dev.name[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {project.developers.length > 3 && (
                    <Avatar radius="xl" size="sm">+{project.developers.length - 3}</Avatar>
                  )}
                </Avatar.Group>
              </Tooltip.Group>
            ) : (
              <Text size="xs" c="dimmed">
                Sem equipe
              </Text>
            )}
          </Group>
          <IconGripVertical 
            size={16} 
            className="text-gray-400" 
            style={{ flexShrink: 0, opacity: 0.6 }}
          />
        </div>
      </Paper>
    </div>
  );
}

function ProjectCardPlaceholder({ project }) {
  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      className="hover:shadow-md transition-all bg-white mb-0 opacity-50"
      style={{ width: '300px' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge color={statusConfig[project.status]?.color || "gray"} variant="light" size="sm">
          {statusConfig[project.status]?.label || project.status}
        </Badge>
        <ActionIcon variant="subtle" color="gray" size="sm" style={{ flexShrink: 0 }}>
          <IconDots size={16} />
        </ActionIcon>
      </div>

      <div className="mb-4">
        <Text 
          fw={600} 
          size="sm" 
          className="leading-tight mb-2 line-clamp-2"
          style={{ marginBottom: project.description ? '8px' : '0', color: '#2d3748' }}
        >
          {project.name}
        </Text>
        {project.description && (
          <Text 
            size="xs" 
            c="dimmed" 
            className="line-clamp-3"
            style={{ lineHeight: '1.5', color: '#718096' }}
          >
            {project.description}
          </Text>
        )}
      </div>

      {project.endDate && (
        <div className="flex items-center gap-2 mb-3 text-gray-500">
          <IconCalendar size={14} />
          <Text size="xs" c="dimmed">
            {dayjs(project.endDate).format("DD/MM/YYYY")}
          </Text>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#e2e8f0' }}>
        <Group gap={8} style={{ flex: 1, minWidth: 0 }}>
          {project.developers && project.developers.length > 0 ? (
            <Avatar.Group spacing="sm">
              {project.developers.slice(0, 3).map((dev) => (
                <Avatar key={dev.id} src={resolveAssetUrl(dev.avatarUrl)} radius="xl" size="sm">
                  {dev.name[0]}
                </Avatar>
              ))}
              {project.developers.length > 3 && (
                <Avatar radius="xl" size="sm">+{project.developers.length - 3}</Avatar>
              )}
            </Avatar.Group>
          ) : (
            <Text size="xs" c="dimmed">
              Sem equipe
            </Text>
          )}
        </Group>
        <IconGripVertical 
          size={16} 
          className="text-gray-400" 
          style={{ flexShrink: 0, opacity: 0.6 }}
        />
      </div>
    </Paper>
  );
}

function KanbanColumn({ status, projects, onEdit, onDelete, onAssign, onTasks, activeId, isOver }) {
  const config = statusConfig[status];
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: status,
  });

  const isActiveOver = isOver || isDroppableOver;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg p-3 transition-all ${
        isActiveOver ? `${config.bgColor} border-2 ${config.borderColor} shadow-lg` : ""
      }`}
    >
      <Paper
        p="md"
        radius="md"
        className={`${config.bgColor} mb-4 transition-all ${
          isActiveOver ? "ring-2 ring-blue-400 shadow-md" : ""
        }`}
      >
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg" c={config.color}>
            {config.label}
          </Text>
          <Badge size="lg" variant="light" color={config.color} radius="md">
            {projects.length}
          </Badge>
        </Group>
      </Paper>

      <div
        className="flex flex-col flex-1 overflow-y-auto min-h-[400px] max-h-[calc(100vh-300px)]"
        style={{ rowGap: '16px' }}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssign={onAssign}
              onTasks={onTasks}
              isDragging={activeId === project.id}
            />
          ))}
        </SortableContext>
        {projects.length === 0 && !isActiveOver && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            <Text size="sm" c="dimmed" ta="center">
              Nenhum projeto
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt={4}>
              Arraste projetos aqui
            </Text>
          </div>
        )}
        {projects.length === 0 && isActiveOver && (
          <div className="flex items-center justify-center h-32 text-blue-500 text-sm border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            <Text size="sm" fw={500} c="blue">
              Solte aqui
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ projects, onStatusChange, onEdit, onDelete, onAssign, onTasks }) {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const projectsByStatus = {
    planned: projects.filter((p) => p.status === "planned"),
    active: projects.filter((p) => p.status === "active"),
    completed: projects.filter((p) => p.status === "completed"),
    cancelled: projects.filter((p) => p.status === "cancelled"),
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) {
      setOverId(null);
      return;
    }
    
    let status = over.id;
    if (!statusConfig[status]) {
      const targetProject = projects.find((p) => p.id === status);
      if (targetProject) {
        status = targetProject.status;
      } else {
        setOverId(null);
        return;
      }
    }
    setOverId(status);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const projectId = active.id;
    let newStatus = over.id;

    if (!statusConfig[newStatus]) {
      const targetProject = projects.find((p) => p.id === newStatus);
      if (!targetProject) return;
      newStatus = targetProject.status;
    }

    const project = projects.find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    await onStatusChange(projectId, newStatus);
  };

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setOverId(null);
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
        {Object.entries(statusConfig).map(([status, _config]) => (
          <div key={status} style={{ flexShrink: 0, width: '320px', minWidth: '320px' }}>
            <KanbanColumn
              status={status}
              projects={projectsByStatus[status] || []}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssign={onAssign}
              onTasks={onTasks}
              activeId={activeId}
              isOver={overId === status}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? <ProjectCardPlaceholder project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
