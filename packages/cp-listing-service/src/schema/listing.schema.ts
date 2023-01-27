import { isValidDate } from '@cribplug/common';
import {
  object, string
} from 'zod';

export const createListingSchema = object({
  body: object({
    title: string({
      required_error: 'title is required',
    }).min(1, 'title must be at least 1 character long'),
    caption: string({
      required_error: 'caption is required',
    }).min(1, 'shortDescription must be at least 1 character long').max(160, 'caption must be at most 160 characters long'),
    longDescription: string({}).min(1, 'longDescription must be at least 1 character long').optional(),
  })
});

export const createListingFields = ['title', 'caption', 'longDescription'];

const htmlRegex = /<\/?[^>]+(>|$)/gi;
export const stripHTML = (html: string) => html.replace(htmlRegex, '');

export const isBoolean = (val: any) => Boolean(val) === val;

export const sanitizeData = (fields: string[], data: any) => {
  const sanitizedData: { [key: string]: any } = {};
  fields.forEach((field) => {
    if (isBoolean(data[field])) {
      sanitizedData[field] = data[field];
      return;
    }
    if (data[field]) {
      sanitizedData[field] = data[field];
      if (isValidDate(data[field])) {
        sanitizedData[field] = new Date(data[field]);
      }
    }
  });
  return sanitizedData;
};
