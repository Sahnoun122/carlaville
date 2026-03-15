import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignAgentDto {
  @IsMongoId()
  @IsNotEmpty()
  agentId: string;
}
