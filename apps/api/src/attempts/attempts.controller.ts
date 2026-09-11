import { Controller, Get, Post, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateSubmissionDto } from '../submissions/dto/create-submission.dto';

@Controller()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('problems/:slug/attempts')
  async createAttempt(@Param('slug') slug: string) {
    return this.attemptsService.createAttempt(slug);
  }

  @Get('problems/:slug/attempts')
  async getAttemptsByProblem(@Param('slug') slug: string) {
    return this.attemptsService.getAttemptsByProblem(slug);
  }

  @Get('attempts/:id')
  async getAttempt(@Param('id') id: string) {
    return this.attemptsService.getAttempt(id);
  }

  @Post('attempts/:id/submissions')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async submitSolution(
    @Param('id') id: string,
    @Body() dto: CreateSubmissionDto
  ) {
    return this.attemptsService.submitSolution(id, dto);
  }
}
