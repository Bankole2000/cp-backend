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

const commonOptionalFields = {
  title: string().min(1, 'title must be at least 1 character long').optional(),
  descriptionHTML: string().min(1, 'description must be at least 1 character long').optional(),
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

export const createAmenitySchema = object({
  body: object({
    ...commonFields,
    amenity: string({
      required_error: 'Amenity Key is required',
    })
      .min(1, 'Amenity Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, i.e AMENITY_KEY'),
    mdiIcon: string({
      required_error: 'mdi icon is required',
    }).min(1, 'mdi icon must be at least 1 character long')
      .refine((data) => mdiIconsList.includes(data), 'Invalid mdi Icon'),
    faIcon: string({
      required_error: 'font awesome icon is required',
    }).min(1, 'font awesome icon must be at least 1 character long')
      .refine((data) => faIconsList.includes(data), 'Invalid font awesome Icon'),
  }),
});

export const updateCategorySchema = object({
  params: object({
    categorykey: string({
      required_error: 'Category Key is required',
    }).min(1, 'Category Key must be at least 1 character long')
  }),
  body: object({
    ...commonOptionalFields,
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : mdiIconsList.includes(data)), 'Invalid mdi icon'),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : faIconsList.includes(data)), 'Invalid font awesome icon'),
  })
});

export const updateAmenitySchema = object({
  params: object({
    amenitykey: string({
      required_error: 'Amenity Key is required',
    }).min(1, 'Amenity Key must be at least 1 character long')
  }),
  body: object({
    ...commonOptionalFields,
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional(),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional(),
  })
});

export const deleteCategorySchema = object({
  params: object({
    categorykey: string({
      required_error: 'Category Key is required',
    }).min(1, 'Category Key must be at least 1 character long')
  }),
});

export const deleteAmenitySchema = object({
  params: object({
    amenitykey: string({
      required_error: 'Amenity Key is required',
    }).min(1, 'Amenity Key must be at least 1 character long')
  })
});

export const createCategoryFields = ['amenityCategory', 'title', 'descriptionHTML'];
export const createAmenityFields = ['amenity', 'title', 'descriptionHTML', 'mdiIcon', 'faIcon'];
export const updateCategoryFields = ['title', 'descriptionHTML'];
export const updateAmenityFields = ['title', 'descriptionHTML', 'mdiIcon', 'faIcon'];
