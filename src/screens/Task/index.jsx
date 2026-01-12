import { useState, useEffect } from "react";
import { Button, Modal, Title, LoadingOverlay, Group, Select as MantineSelect } from "@mantine/core";
import { IconPlus, IconFilter } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { TaskCard } from "./TaskCard"; // Importe o componente novo
import { TaskForm } from "./TaskForm"; // Importe o componente novo
import showDefaultNotification from "../../utils/showDefaultNotification";

export default function TasksPage() {
 const { permissions } = useAuthStore();
  const isManager = permissions.includes("tasks");
  
  const [viewScope, setViewScope] = useState(isManager ? 'all' : 'mine');
  
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [projects, setProjects] = useState([]); // <--- NOVO: Estado para projetos
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = viewScope === 'mine' ? '/task/my-tasks' : '/task';
      
      // Lista de requisições que TODOS fazem (Tarefas e Projetos)
      const requests = [
        api.get(endpoint),
        api.get("/project")
      ];

      // SÓ adiciona a requisição de usuários se for gerente
      if (isManager) {
        requests.push(api.get("/user/by-role/developer"));
      }

      // Executa tudo em paralelo
      const results = await Promise.all(requests);

      // O índice 0 e 1 sempre existem
      setTasks(results[0].data);
      setProjects(results[1].data);
      
      // O índice 2 (usuários) só existe se for gerente. 
      // Se não for, definimos como array vazio [] para não quebrar o form.
      setUsers(isManager ? results[2].data : []);

    } catch (error) {
      console.error(error);
      showDefaultNotification({ 
        title: "Erro", 
        message: "Falha ao carregar dados", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewScope]); 

  const handleCreate = () => {
    setEditingTask(null);
    open();
  };

  const handleEdit = (task) => {
    setEditingTask({
        ...task,
        dueDate: new Date(task.dueDate),
        assigneeId: task.assigneeId ? String(task.assigneeId) : null,
        projectId: task.projectId ? String(task.projectId) : null // <--- Converte para string pro Select ler
    });
    open();
  };

  const handleSave = async (values) => {
    // <--- CORREÇÃO CRÍTICA: Converte Strings para Números antes de enviar
    const payload = {
        ...values,
        projectId: Number(values.projectId),
        assigneeId: Number(values.assigneeId),
        // Se a prioridade ou status forem selects, verifique se o backend espera string (geralmente sim para enums)
    };

    try {
      if (editingTask?.id) {
        await api.put(`/task/${editingTask.id}`, payload);
      } else {
        await api.post("/task", payload);
      }
      showDefaultNotification({ title: "Sucesso", message: "Tarefa salva.", type: "success" });
      close();
      fetchData();
    } catch (error) {
      console.error(error); // Veja o erro no console se falhar
      showDefaultNotification({ 
          title: "Erro", 
          // Tenta mostrar a mensagem exata do backend se possível
          message: error.response?.data?.message?.message?.[0] || "Erro ao salvar.", 
          type: "error" 
      });
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Excluir tarefa permanentemente?")) return;
      try {
          await api.delete(`/task/${id}`);
          // Remove da lista localmente para não precisar recarregar tudo
          setTasks(tasks.filter(t => t.id !== id));
          showDefaultNotification({ title: "Sucesso", message: "Tarefa excluída.", type: "success" });
      } catch(e) { 
          console.error(e);
          showDefaultNotification({ title: "Erro", message: "Não foi possível excluir.", type: "error" });
      }
  }

  const handleStatusChange = async (taskId, newStatus) => {
      // Atualização Otimista (Muda na tela antes de confirmar no servidor)
      setTasks(current => current.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      try {
          await api.patch(`/task/${taskId}/status`, { status: newStatus });
      } catch (error) {
          console.error(error);
          showDefaultNotification({ title: "Erro", message: "Falha ao atualizar status", type: "error" });
          fetchData(); // Reverte a mudança se der erro
      }
  }

  const filteredTasks = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

  return (
    <div className="w-full p-8 relative min-h-screen bg-gray-50">
      <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <Title order={2}>Tarefas</Title>
          <p className="text-gray-500 text-sm mt-1">
            {isManager ? "Gestão total do backlog." : "Visualize e atualize suas demandas."}
          </p>
        </div>
        
        <Group>
            <MantineSelect 
                leftSection={<IconFilter size={16}/>}
                data={[
                    { value: 'all', label: 'Todos Status'},
                    { value: 'todo', label: 'A Fazer'},
                    { value: 'in_progress', label: 'Em Progresso'},
                    { value: 'done', label: 'Concluído'},
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                w={180}
            />
            {isManager && (
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
                    Nova Tarefa
                </Button>
            )}
        </Group>
      </div>

      {/* Lista / Grid de Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <Modal opened={opened} onClose={close} title={editingTask ? "Detalhes da Tarefa" : "Nova Tarefa"} centered>
        <TaskForm 
            initialValues={editingTask} 
            onSubmit={handleSave} 
            onCancel={close} 
            users={users}
            projects={projects}
        />
      </Modal>
    </div>
  );
}