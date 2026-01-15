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
import { Paper, Text, Badge, Group, Avatar, ActionIcon, Menu, Portal } from "@mantine/core";
import { IconDots, IconEdit, IconTrash, IconGripVertical } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useUserRole } from "../../hooks/useUserRole";
import { resolveAssetUrl } from "../../utils/resolveAssetUrl";
import { PRIORITY_COLORS, PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "../../constants/status";

const priorityColors = PRIORITY_COLORS;
const priorityLabels = PRIORITY_LABELS;

const statusConfig = {
  todo: { label: TASK_STATUS_LABELS.todo, color: TASK_STATUS_COLORS.todo, bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  in_progress: { label: TASK_STATUS_LABELS.in_progress, color: TASK_STATUS_COLORS.in_progress, bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  review: { label: TASK_STATUS_LABELS.review, color: TASK_STATUS_COLORS.review, bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  done: { label: TASK_STATUS_LABELS.done, color: TASK_STATUS_COLORS.done, bgColor: "bg-teal-50", borderColor: "border-teal-200" },
};

function SortableTaskCard({ task, onEdit, onDelete, isDragging }) {
  const { isManager } = useUserRole();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

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
        {/* Header: Badges e Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Group gap={6} wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
            <Badge color={priorityColors[task.priority]} variant="filled" size="sm">
              #{task.id}
            </Badge>
            <Badge color={priorityColors[task.priority]} variant="dot" size="sm">
              {priorityLabels[task.priority] || task.priority}
            </Badge>
            {dayjs(task.dueDate).isBefore(dayjs()) && task.status !== "done" && (
              <Badge color="red" variant="filled" size="sm">
                ATRASADO
              </Badge>
            )}
          </Group>

          {isManager && (
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
                    leftSection={<IconEdit size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    Editar
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                  >
                    Excluir
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="mb-4">
          <Text 
            fw={600} 
            size="sm" 
            className="leading-tight mb-2 line-clamp-2"
            style={{ marginBottom: task.description ? '8px' : '0', color: '#2d3748' }}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text 
              size="xs" 
              c="dimmed" 
              className="line-clamp-3"
              style={{ lineHeight: '1.5', color: '#718096' }}
            >
              {task.description}
            </Text>
          )}
        </div>

        {/* Footer: Responsável e Grip */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#e2e8f0' }}>
          <Group gap={8} style={{ flex: 1, minWidth: 0 }}>
            <Avatar
              size="sm"
              radius="xl"
              color="blue"
              src={resolveAssetUrl(task.assignee?.avatarUrl)}
            >
              {task.assignee?.name?.[0] || "?"}
            </Avatar>
            <Text 
              size="xs" 
              fw={500} 
              className="truncate"
              style={{ color: '#4a5568', maxWidth: "140px" }}
            >
              {task.assignee?.name || "Ninguém"}
            </Text>
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

function TaskCardPlaceholder({ task }) {
  const { isManager } = useUserRole();

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
        <Group gap={6} wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
          <Badge color={priorityColors[task.priority]} variant="filled" size="sm">
            #{task.id}
          </Badge>
          <Badge color={priorityColors[task.priority]} variant="dot" size="sm">
            {priorityLabels[task.priority] || task.priority}
          </Badge>
          {dayjs(task.dueDate).isBefore(dayjs()) && task.status !== "done" && (
            <Badge color="red" variant="filled" size="sm">
              ATRASADO
            </Badge>
          )}
        </Group>

        {isManager && (
          <ActionIcon variant="subtle" color="gray" size="sm" style={{ flexShrink: 0 }}>
            <IconDots size={16} />
          </ActionIcon>
        )}
      </div>

      <div className="mb-4">
        <Text 
          fw={600} 
          size="sm" 
          className="leading-tight mb-2 line-clamp-2"
          style={{ marginBottom: task.description ? '8px' : '0', color: '#2d3748' }}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text 
            size="xs" 
            c="dimmed" 
            className="line-clamp-3"
            style={{ lineHeight: '1.5', color: '#718096' }}
          >
            {task.description}
          </Text>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#e2e8f0' }}>
        <Group gap={8} style={{ flex: 1, minWidth: 0 }}>
          <Avatar
            size="sm"
            radius="xl"
            color="blue"
            src={resolveAssetUrl(task.assignee?.avatarUrl)}
          >
            {task.assignee?.name?.[0] || "?"}
          </Avatar>
          <Text 
            size="xs" 
            fw={500} 
            className="truncate"
            style={{ color: '#4a5568', maxWidth: "140px" }}
          >
            {task.assignee?.name || "Ninguém"}
          </Text>
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

function KanbanColumn({ status, tasks, onEdit, onDelete, activeId, isOver }) {
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
            {tasks.length}
          </Badge>
        </Group>
      </Paper>

      <div
        className="flex flex-col flex-1 overflow-y-auto min-h-[400px] max-h-[calc(100vh-300px)]"
        style={{ rowGap: '16px' }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isDragging={activeId === task.id}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && !isActiveOver && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            <Text size="sm" c="dimmed" ta="center">
              Nenhuma tarefa
            </Text>
            <Text size="xs" c="dimmed" ta="center" mt={4}>
              Arraste tarefas aqui
            </Text>
          </div>
        )}
        {tasks.length === 0 && isActiveOver && (
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

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }) {
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

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
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
    
    // Se over.id é um status, usa diretamente
    // Caso contrário, é uma tarefa - busca o status da tarefa
    let status = over.id;
    if (!statusConfig[status]) {
      const targetTask = tasks.find((t) => t.id === status);
      if (targetTask) {
        status = targetTask.status;
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

    const taskId = active.id;
    let newStatus = over.id;

    // Se over.id não é um status válido, significa que soltamos em uma tarefa
    // Nesse caso, usamos o status da tarefa onde soltamos
    if (!statusConfig[newStatus]) {
      const targetTask = tasks.find((t) => t.id === newStatus);
      if (!targetTask) return;
      newStatus = targetTask.status;
    }

    // Verifica se a tarefa está sendo movida para uma coluna diferente
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Atualização otimista
    await onStatusChange(taskId, newStatus);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

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
              tasks={tasksByStatus[status] || []}
              onEdit={onEdit}
              onDelete={onDelete}
              activeId={activeId}
              isOver={overId === status}
            />
          </div>
        ))}
      </div>

      <Portal>
        <DragOverlay adjustScale={false}>
          {activeTask ? <TaskCardPlaceholder task={activeTask} /> : null}
        </DragOverlay>
      </Portal>
    </DndContext>
  );
}