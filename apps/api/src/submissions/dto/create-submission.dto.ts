import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  requirements: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  assumptions: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  classes: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  responsibilities: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  relationships: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  interfaces: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  decisions: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  edgeCases: string;

  @IsString()
  @IsOptional()
  pseudocode?: string;
}
