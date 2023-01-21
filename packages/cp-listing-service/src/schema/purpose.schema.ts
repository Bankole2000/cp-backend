import { mdiIconsList } from '@cribplug/common';
import {
  boolean, object, string
} from 'zod';
import { db } from '../lib/lokijs';

function resourceExists(collectionName: string, key: string, value: string) {
  const collection = db.getCollection(collectionName);
  const result = collection.findOne({ [key]: value });
  console.log({ result });
  return Boolean(result);
}

// #region >>>: Common Fields
const commonRequiredFields = {
  title: string({
    required_error: 'title is required',
  }).min(1, 'title must be at least 1 character long'),
  descriptionHTML: string({
    required_error: 'description is required',
  }).min(1, 'description must be at least 1 character long'),
  isActive: boolean({
    invalid_type_error: 'active status must be a boolean',
  }).optional(),
  mdiIcon: string({
    required_error: 'mdi icon is required',
  }).min(1, 'mdi icon must be at least 1 character long')
    .refine((data) => mdiIconsList.includes(data), 'Invalid mdi Icon'),
  faIcon: string({
    required_error: 'font awesome icon is required',
  }).min(1, 'font awesome icon must be at least 1 character long')
    .refine((data) => resourceExists('faIcons', 'name', data), 'Invalid font awesome Icon'),
};

const commonOptionalFields = {
  body: object({
    title: string().min(1, 'title must be at least 1 character long').optional(),
    descriptionHTML: string().min(1, 'description must be at least 1 character long').optional(),
    isActive: boolean({
      invalid_type_error: 'isActive status must be a boolean',
    }).optional(),
    mdiIcon: string().min(1, 'mdi Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : mdiIconsList.includes(data)), 'Invalid mdi icon'),
    faIcon: string().min(1, 'font awesome Icon must be at least 1 character long').optional()
      .refine((data) => (data === undefined ? true : resourceExists('faIcons', 'name', data)), 'Invalid font awesome icon'),
  })
};

const typeParam = {
  params: object({
    typeId: string({
      required_error: 'Listing type key is required',
    }).min(1, 'Listing type key must be at least 1 character long'),
  })
};

const purposeParam = {
  params: object({
    purposeId: string({
      required_error: 'purpose key is required',
    }).min(1, 'purpose key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
  })
};

const subgroupParams = {
  params: object({
    purposeId: string({
      required_error: 'purpose key is required',
    }).min(1, 'purpose key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
      .refine((val) => resourceExists('purposes', 'listingPurpose', val), 'Listing purpose does not exist'),
    subgroupId: string({
      required_error: 'subgroup key is required',
    }).min(1, 'subgroup key must be at least 1 character long')
      .refine((val) => /^[A-Z_]+$/.test(val), 'purpose subgroup must be in all caps and underscore separated, e.g. PURPOSE_SUBGROUP')
      .refine((val) => resourceExists('subgroups', 'purposeSubgroup', val), 'Purpose Subgroup does not exist'),
  }),
};

const newkeyQuery = {
  query: object({
    newkey: string().min(1, 'Listing purpose must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE').optional(),
  }).optional(),
};
// #endregion

// #region >>>: Create Schemas
export const listingTypeSchema = object({
  body: object({
    listingType: string({
      required_error: 'Listing type (key) is required',
    }).min(1, 'Listing type must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Listing type must be in all caps and underscore separated, e.g. LISTING_TYPE'),
    ...commonRequiredFields,
  })
});

export const listingPurposeSchema = object({
  body: object({
    listingPurpose: string({
      required_error: 'Listing purpose (key) is required',
    }).min(1, 'Listing purpose must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Listing purpose must be in all caps and underscore separated, e.g. LISTING_PURPOSE')
      .refine((val) => !resourceExists('purposes', 'listingPurpose', val), 'Listing purpose already exists'),
    ...commonRequiredFields,
  })
});

export const purposeSubgroupSchema = object({
  body: object({
    purposeSubgroup: string({
      required_error: 'purposeSubgroup (key) is required',
    }).min(1, 'Purpose Subgroup must be at least 1 character long').refine((val) => /^[A-Z_]+$/.test(val), 'Purpose Subgroup must be in all caps and underscore separated, e.g. PURPOSE_SUBGROUP')
      .refine((val) => !resourceExists('subgroups', 'purposeSubgroup', val), 'Purpose Subgroup already exists'),
    ...commonRequiredFields,
  })
});
// #endregion

// #region >>>: Update Schemas
export const listingTypeUpdateSchema = object({
  ...typeParam,
  ...commonOptionalFields,
  ...newkeyQuery,
});

export const listingPurposeUpdateSchema = object({
  ...purposeParam,
  ...commonOptionalFields,
  ...newkeyQuery,
});

export const subgroupUpdateSchema = object({
  ...subgroupParams,
  ...commonOptionalFields,
  ...newkeyQuery,
});
// #endregion

// #region >>>: Delete Schemas
export const deletePurposeSchema = object({
  ...purposeParam,
});

export const deleteTypeSchema = object({
  ...typeParam,
});

export const deleteSubgroupSchema = object({
  ...subgroupParams,
});
// #endregion

// #region >>>: Resource FieldLists
export const listingTypeCreateFields = ['listingType', 'title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const listingPurposeCreateFields = ['listingPurpose', 'title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const listingPurposeUpdateFields = ['title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const listingTypeUpdateFields = ['title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const purposeSubgroupCreateFields = ['purposeSubgroup', 'title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
export const purposeSubgroupUpdateFields = ['title', 'descriptionHTML', 'isActive', 'faIcon', 'mdiIcon'];
// #endregion
