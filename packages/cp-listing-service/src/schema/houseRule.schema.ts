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

export const createHouseRuleSchema = object({
  body: object({
    houseRule: string({
      required_error: 'House Rule Key is required',
    }).min(1, 'House Rule Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'House Rule Key must be in all caps and underscore separated, i.e HOUSE_RULE_KEY')
      .refine((val) => !resourceExists('houseRules', 'houseRule', val), 'House Rule Key already exists'),
    title: string({
      required_error: 'title is required',
    }).min(1, 'title must be at least 1 character long'),
    descriptionHTML: string({})
      .min(1, 'description must be at least 1 character long')
      .optional(),
    faIconTrue: string({
      required_error: 'Allowed font awesome Icon is required',
    }).min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon'),
    faIconFalse: string({
      required_error: 'Allowed font awesome Icon is required',
    }).min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon'),
    mdiIconTrue: string({
      required_error: 'Allowed font awesome Icon is required',
    }).min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((val) => mdiIconsList.includes(val), 'mdiIconTrue must be a valid mdi icon'),
    mdiIconFalse: string({
      required_error: 'Allowed font awesome Icon is required',
    }).min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((val) => mdiIconsList.includes(val), 'mdiIconFalse must be a valid mdi icon'),
  })
});

export const updateHouseRuleSchema = object({
  params: object({
    houseRule: string({
      required_error: 'House Rule Key is required',
    }).min(1, 'House Rule Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'House Rule Key must be in all caps and underscore separated, i.e HOUSE_RULE_KEY')
      .refine((val) => resourceExists('houseRules', 'houseRule', val), 'House Rule Key does not exist'),
  }),
  body: object({
    title: string()
      .min(1, 'title must be at least 1 character long')
      .optional(),
    descriptionHTML: string()
      .min(1, 'description must be at least 1 character long')
      .optional(),
    faIconTrue: string()
      .min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon')
      .optional(),
    faIconFalse: string()
      .min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon')
      .optional(),
    mdiIconTrue: string()
      .min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((val) => mdiIconsList.includes(val), 'mdiIconTrue must be a valid mdi icon')
      .optional(),
    mdiIconFalse: string()
      .min(1, 'Allowed font awesome Icon must be at least 1 character long')
      .refine((val) => mdiIconsList.includes(val), 'mdiIconFalse must be a valid mdi icon')
      .optional(),
  }),
});

export const deleteHouseRuleSchema = object({
  params: object({
    houseRule: string({
      required_error: 'House Rule Key is required',
    }).min(1, 'House Rule Key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'House Rule Key must be in all caps and underscore separated, i.e HOUSE_RULE_KEY')
      .refine((val) => resourceExists('houseRules', 'houseRule', val), 'House Rule Key does not exist'),
  }),
});

export const createHouseRuleFields = ['houseRule', 'title', 'descriptionHTML', 'faIconTrue', 'faIconFalse', 'mdiIconTrue', 'mdiIconFalse'];
export const updateHouseRuleFields = ['title', 'descriptionHTML', 'faIconTrue', 'faIconFalse', 'mdiIconTrue', 'mdiIconFalse'];
