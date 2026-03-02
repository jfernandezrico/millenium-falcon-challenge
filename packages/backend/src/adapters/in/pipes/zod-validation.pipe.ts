import { PipeTransform, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';

export const createZodValidationPipe = <T>(schema: ZodSchema<T>): PipeTransform => ({
  transform: (value: unknown) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      throw new BadRequestException(messages);
    }
    return result.data;
  },
});
