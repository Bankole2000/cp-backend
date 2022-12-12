import { boolean, object, string } from 'zod';
import { isOfAge, isValidUserName } from '@cribplug/common';

export const emailRequiredSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
  })
});

export const registerWithEmailSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    firstname: string({
      required_error: 'First name is required',
    }).min(2, 'First name must be at least 2 characters'),
    lastname: string({
      required_error: 'Last name is required',
    }).min(2, 'Last name must be at least 2 characters'),
    tos: boolean({
      required_error: 'You must agree to the terms of service',
    }).refine((data) => data === true, 'You must agree to the terms of service'),
    dob: string({
      required_error: 'Date of birth is required',
    })
  }).refine((data) => isOfAge(data.dob, 16), {
    message: 'You must be at least 16 years old to register',
    path: ['dob'],
  })
});

export const onboardingUsernameAndPasswordSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }),
    username: string({
      required_error: 'Username is required',
    }).refine((data) => isValidUserName(data), 'Username can only have letters, numbers, and underscores'),
    gender: string({
      required_error: 'Gender is required',
    }).refine((data) => ['MALE', 'FEMALE', 'OTHER'].includes(data), 'Gender must be either male, female, or other'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters'),
    confirmPassword: string({
      required_error: 'Confirm Password is required',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
});

export const emailLoginSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters'),
  })
});

export const updatePasswordSchema = object({
  body: object({
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Password must be at least 8 characters'),
    confirmPassword: string({
      required_error: 'Confirm Password is required',
    }).min(8, 'Password must be at least 8 characters'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const verifyEmailSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid Email'),
    code: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at least 5 characters long'),
  }),
});

export const userCreateFields = ['firstname', 'lastname', 'email', 'tos', 'dob'];
export const userOnboardingFields = ['username', 'password', 'gender'];
export const userSoftDeleteFields = ['email', 'username'];

export const isValidDate = (datelike: string) => new Date(datelike) instanceof Date && !Number.isNaN(datelike) && typeof datelike !== 'boolean' && new Date(datelike).toString() !== 'Invalid Date';

export const resanitizeData = (fields: string[], data: any, scrambler: string) => {
  const resanitizedData: { [key: string]: any } = {};
  const dataFields = Object.keys(data);
  dataFields.forEach((field) => {
    if (fields.includes(field)) {
      resanitizedData[field] = data[field].replace(`-${scrambler}`, '');
    } else {
      resanitizedData[field] = data[field];
    }
  });
  return resanitizedData;
};

export const desanitizeData = (fields: string[], data: any, scrambler: string) => {
  const desanitizedData: { [key: string]: any } = {};
  const dataFields = Object.keys(data);
  dataFields.forEach((field) => {
    if (fields.includes(field)) {
      desanitizedData[field] = `${data[field]}-${scrambler}`;
    } else {
      desanitizedData[field] = data[field];
    }
  });
  return desanitizedData;
};

export const sanitizeData = (fields: string[], data: any) => {
  const sanitizedData: { [key: string]: any } = {};

  fields.forEach((field) => {
    if (data[field]) {
      sanitizedData[field] = data[field];
      if (isValidDate(data[field])) {
        sanitizedData[field] = new Date(data[field]);
      }
    }
  });
  return sanitizedData;
};