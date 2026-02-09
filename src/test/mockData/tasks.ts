import type { Task, TaskMetrics } from '@/hooks/useTasks'

export const mockTask: Task = {
  id: 'task-123',
  title: 'Llamar a cliente potencial',
  description: 'Seguimiento de visita programada para la propiedad en Polanco',
  task_type: 'llamada',
  priority: 'alta',
  status: 'pendiente',
  due_date: '2024-01-20T10:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  assigned_to: 'user-123',
  assigned_to_name: 'Agent Smith',
  assigned_to_avatar: 'https://example.com/avatar.jpg',
  contact_name: 'Juan Pérez',
  contact_phone: '+5215512345678',
  contact_email: 'juan@example.com',
  property_title: 'Casa en Polanco',
  sale_price: 5000000,
  auto_generated: false,
  related_contact_id: 'contact-123',
  related_property_id: 'property-123',
}

export const mockTasks: Task[] = [
  mockTask,
  {
    ...mockTask,
    id: 'task-456',
    title: 'Agendar visita',
    task_type: 'visita',
    priority: 'media',
    status: 'en_proceso',
    due_date: '2024-01-25T14:00:00Z',
  },
  {
    ...mockTask,
    id: 'task-789',
    title: 'Enviar documentación',
    task_type: 'documentacion',
    priority: 'baja',
    status: 'completada',
    auto_generated: true,
  },
  {
    ...mockTask,
    id: 'task-101',
    title: 'Seguimiento urgente',
    task_type: 'seguimiento',
    priority: 'urgente',
    status: 'vencida',
    due_date: '2024-01-10T09:00:00Z',
  },
]

export const mockTaskMetrics: TaskMetrics = {
  total_tasks_assigned: 50,
  tasks_completed: 35,
  tasks_completed_on_time: 30,
  tasks_completed_late: 5,
  tasks_overdue: 3,
  avg_completion_time_minutes: 120,
  ranking_position: 2,
  total_agents: 10,
  completion_rate: 70,
}
