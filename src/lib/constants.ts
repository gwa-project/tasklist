export const TASK_STATUSES = ['draft', 'in_progress', 'done'] as const
export const PROJECT_STATUSES = TASK_STATUSES

export type TaskStatusOption = (typeof TASK_STATUSES)[number]