import { isValidDate, mdiIconsList, faIconsList } from '@cribplug/common';
import {
  boolean, object, string
} from 'zod';

const commonFields = {
  title: string({
    required_error: 'title is required',
  }).min(1, 'title must be at least 1 character long'),
  descriptionHTML: string({})
    .min(1, 'description must be at least 1 character long').optional(),
};

export const createCategorySchema = object({
  body: object({
    amenityCategory: string({
      required_error: 'Category Key is required',
    })
      .min(1, 'Category Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Category Key must be in all caps and underscore separated, i.e CATEGORY_KEY'),
    ...commonFields,
  })
});

export const createAmenityCategory = object({
  body: object({}),
});

export const updateCategorySchema = object({
  body: object({
    title: string().min(1, 'title must be at least 1 character long').optional(),
    descriptionHTML: string().min(1, 'description must be at least 1 character long').optional(),
  })
});
