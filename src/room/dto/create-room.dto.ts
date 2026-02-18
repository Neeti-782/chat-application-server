import { IsBoolean, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsBoolean()
  isGroup: boolean;
}
