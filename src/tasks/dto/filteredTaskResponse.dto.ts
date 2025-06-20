import { TaskResponseDto } from './taskResponse.dto';

export class FilteredTasksResponseDto {
  data: TaskResponseDto[];
  total: number;
  offset: number;
  limit: number;
}
