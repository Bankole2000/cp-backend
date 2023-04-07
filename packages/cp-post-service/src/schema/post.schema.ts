import { object, string } from 'zod';

export const createCommentSchema = object({
  body: object({
    content: string({
      required_error: 'Content is required',
    }).min(1, 'Content must be at least 1 character').max(140, 'Comment must not be over 140 characters')
  })
});
