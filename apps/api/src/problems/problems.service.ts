import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const problems = await this.prisma.problem.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return problems.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      requirements: JSON.parse(p.requirements || '[]'),
      constraints: JSON.parse(p.constraints || '[]'),
      thinkingPoints: JSON.parse(p.thinkingPoints || '[]'),
    }));
  }

  async findBySlug(slug: string) {
    const p = await this.prisma.problem.findUnique({
      where: { slug },
    });

    if (!p) {
      throw new NotFoundException(`Problem with slug "${slug}" not found.`);
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      requirements: JSON.parse(p.requirements || '[]'),
      constraints: JSON.parse(p.constraints || '[]'),
      thinkingPoints: JSON.parse(p.thinkingPoints || '[]'),
    };
  }
}
