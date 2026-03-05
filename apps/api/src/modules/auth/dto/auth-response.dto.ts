import { ApiProperty } from '@nestjs/swagger';
import { AuthMeDto } from './auth-me.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class AuthResponseDto extends AuthTokensDto {
  @ApiProperty({ type: AuthMeDto })
  user!: AuthMeDto;
}
