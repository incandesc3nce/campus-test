import { TaskStatus } from 'generated/prisma';

export class TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
