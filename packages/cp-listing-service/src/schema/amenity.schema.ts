import { mdiIconsList } from '@cribplug/common';
import {
  object, string
} from 'zod';
import { db } from '../lib/lokijs';

function resourceExists(collectionName: string, key: string, value: string) {
  const collection = db.getCollection(collectionName);
  const result = collection.findOne({ [key]: value });
  console.log({ result });
  return Boolean(result);
}

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

const requireNewAmenityCategory = {
  amenityCategory: string({
    required_error: 'Category Key is required',
  })
    .min(1, 'Category Key must be at least 1 character long')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Category Key must be in all caps and underscore separated, i.e CATEGORY_KEY')
    .refine((val) => !resourceExists('amenityCategories', 'amenityCategory', val), 'Category Key already exists'),
};

const requireNewAmenity = {
  amenity: string({
    required_error: 'Amenity Key is required',
  })
    .min(1, 'Amenity Key must be at least 1 character long')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, i.e AMENITY_KEY')
    .refine((val) => !resourceExists('amenities', 'amenity', val), 'Amenity Key already exists'),
};

const requireExistingAmenityKey = {
  amenitykey: string({
    required_error: 'Amenity Key is required',
  }).min(1, 'Amenity Key must be at least 1 character long')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Amenity Key must be in all caps and underscore separated, i.e AMENITY_KEY')
    .refine((val) => resourceExists('amenities', 'amenity', val), 'Amenity Key does not exist'),
};

const requireExistingCategoryKey = {
  categorykey: string({
    required_error: 'Category Key is required',
  }).min(1, 'Category Key must be at least 1 character long')
    .refine((val) => /^[A-Z_]+$/.test(val), 'Category Key must be in all caps and underscore separated, i.e CATEGORY_KEY')
    .refine((val) => resourceExists('amenityCategories', 'amenityCategory', val), 'Category Key does not exist'),
};

export const createCategorySchema = object({
  body: object({
    ...requireNewAmenityCategory,
    ...commonFields,
  })
});

const newkeyQuery = {
  query: object({
    newkey: string()
      .min(1, 'Listing purpose must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
      .optional(),
  }).optional(),
};

export const createAmenitySchema = object({
  params: object({
    ...requireExistingCategoryKey,
  }),
  body: object({
    ...requireNewAmenity,
    ...commonFields,
    mdiIcon: string({
      required_error: 'mdi icon is required',
    }).min(1, 'mdi icon must be at least 1 character long')
      .refine((data) => mdiIconsList.includes(data), 'Invalid mdi Icon'),
    faIcon: string({
      required_error: 'font awesome icon is required',
    }).min(1, 'font awesome icon must be at least 1 character long')
      .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon'),
  }),
});

export const updateCategorySchema = object({
  query: object({
    newkey: string()
      .min(1, 'New Category Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'New Category Key must be in all caps and underscore separated, e.g. NEW_KEY')
      .refine((val) => !resourceExists('amenityCategories', 'amenityCategory', val), 'New Category Key already exists')
      .optional(),
  }).optional(),
  params: object({
    ...requireExistingCategoryKey,
  }),
  body: object({
    ...commonOptionalFields,
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : mdiIconsList.includes(data)), 'Invalid mdi icon'),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : resourceExists('faIcons', 'name', data)), 'Invalid font awesome icon'),
  })
});

export const updateAmenitySchema = object({
  query: object({
    newkey: string()
      .min(1, 'New Amenity Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'New Amenity Key must be in all caps and underscore separated, e.g. NEW_KEY')
      .refine((val) => !resourceExists('amenities', 'amenity', val), 'New Amenity Key already exists')
      .optional(),
  }).optional(),
  params: object({
    ...requireExistingAmenityKey,
    ...requireExistingCategoryKey,
  }),
  body: object({
    ...commonOptionalFields,
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional(),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional(),
  })
});

export const deleteCategorySchema = object({
  params: object({
    ...requireExistingCategoryKey,
  }),
});

export const deleteAmenitySchema = object({
  params: object({
    ...requireExistingCategoryKey,
    ...requireExistingAmenityKey,
  })
});

export const createCategoryFields = ['amenityCategory', 'title', 'descriptionHTML'];
export const createAmenityFields = ['amenity', 'title', 'descriptionHTML', 'mdiIcon', 'faIcon'];
export const updateCategoryFields = ['title', 'descriptionHTML'];
export const updateAmenityFields = ['title', 'descriptionHTML', 'mdiIcon', 'faIcon'];
