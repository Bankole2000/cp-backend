import { boolean, object, string } from 'zod';
import { isOfAge, isValidUserName } from '@cribplug/common';

export const emailRequiredSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
  })
});

export const ipGeoDataSchema = object({
  body: object({
    ip: string({
      required_error: 'IP is required',
    }).min(6, 'IP must be at least 6 characters'),
    geoData: object({
      phoneCode: string({
        required_error: 'Phone code is required',
      }).min(2, 'Phone code must be at least 2 characters'),
      countryCode: string({
        required_error: 'Country code is required',
      }).min(2, 'Country code must be at least 2 characters').max(2, 'Country code must be 2 characters'),
      name: string({
        required_error: 'Country name is required',
      }).min(1, 'Country name must be at least 1 character'),
      iso3: string({
        required_error: 'ISO3 is required',
      }).min(3, 'ISO3 must be at least 3 characters').max(3, 'ISO3 must be 3 characters'),
      currency: string({
        required_error: 'Currency is required',
      }).min(3, 'Currency must be at least 3 characters').max(3, 'Currency must be 3 characters'),
      currencySymbol: string({
        required_error: 'Currency symbol is required',
      }).min(1, 'Currency symbol must be at least 1 character'),
    }),
  }),
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
    }).min(1, 'Verification Type must be at least 1 character long')
  }).refine((data) => isOfAge(data.dob, 16), {
    message: 'You must be at least 16 years old to register',
    path: ['dob'],
  })
});

export const registerWithPhoneSchema = object({
  body: object({
    phone: string({
      required_error: 'Phone number is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    countryCode: string({
      required_error: 'Country code is required',
    })
      .min(2, 'Country code must be 2 Characters')
      .max(2, 'Country code must be 2 characters'),
    firstname: string({
      required_error: 'First name is required',
    }).min(2, 'First name must be at least 2 characters'),
    lastname: string({
      required_error: 'Last name is required',
    }).min(2, 'Last name must be at least 2 characters'),
    tos: boolean({
      required_error: 'You must agree to the terms of service',
    }),
    dob: string({
      required_error: 'Date of birth is required',
    }).min(1, 'Verification Type must be at least 1 character long')
  }).refine((data) => isOfAge(data.dob, 16), {
    message: 'You must be at least 16 years old to register',
    path: ['dob'],
  })
});

export const onboardingUsernameAndPasswordSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    username: string({
      required_error: 'Username is required',
    }).refine((data) => isValidUserName(data), 'Username can only have lowercase (small) letters, numbers, and underscores'),
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

export const verifyDeviceLoginSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    userId: string({
      required_error: 'User id is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    code: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at 6 characters long').max(6, 'Verification code must be 6 characters long'),
    deviceId: string({
      required_error: 'Device Id is required'
    }).min(1, 'Verification Type must be at least 1 character long'),
    type: string({
      required_error: 'Verification Type is required'
    }).min(1, 'Verification Type must be at least 1 character long')
  })
});

export const forgotPasswordSchema = object({
  body: object({
    field: string({
      required_error: 'Field type is required',
    }).min(1, 'Field Type must be at least 1 character long'),
  }),
});

export const sendOTPSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Id Token must be at least 1 character long'),
    userId: string({
      required_error: 'User Id is required',
    }).min(1, 'User Id must be at least 1 character long'),
    type: string({
      required_error: 'Verification Type is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
  }),
});

export const verifyOTPSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    userId: string({
      required_error: 'User Id is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    OTP: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at 6 characters long').max(6, 'Verification code must be 6 characters long'),
    type: string({
      required_error: 'Verification Type is required'
    }).min(1, 'Verification Type must be at least 1 character long')
  })
});

export const verifyEmailDeviceLoginSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    userId: string({
      required_error: 'User id is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    email: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    code: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at 6 characters long').max(6, 'Verification code must be 6 characters long'),
    deviceId: string({
      required_error: 'Device Id is required'
    }).min(1, 'Verification Type must be at least 1 character long'),
    type: string({
      required_error: 'Verification Type is required'
    }).min(1, 'Verification Type must be at least 1 character long')
  })
});

export const verifyPhoneDeviceLoginSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    userId: string({
      required_error: 'User id is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    phone: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    code: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at 6 characters long').max(6, 'Verification code must be 6 characters long'),
    deviceId: string({
      required_error: 'Device Id is required'
    }).min(1, 'Verification Type must be at least 1 character long'),
    type: string({
      required_error: 'Verification Type is required'
    }).min(1, 'Verification Type must be at least 1 character long')
  })
});

export const verifyUsernameDeviceLoginSchema = object({
  body: object({
    idToken: string({
      required_error: 'Id Token is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    userId: string({
      required_error: 'User id is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    username: string({
      required_error: 'Email is required',
    }).email('Email must be a valid email address'),
    code: string({
      required_error: 'Verification Code is required',
    }).min(6, 'Verification code must be at 6 characters long').max(6, 'Verification code must be 6 characters long'),
    deviceId: string({
      required_error: 'Device Id is required'
    }).min(1, 'Verification Type must be at least 1 character long'),
    type: string({
      required_error: 'Verification Type is required'
    }).min(1, 'Verification Type must be at least 1 character long')
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

export const phoneLoginSchema = object({
  body: object({
    phone: string({
      required_error: 'Phone number is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
    countryCode: string({
      required_error: 'Country code is required',
    }).min(2, 'Country code must be 2 Characters').max(2, 'Country code must be 2 characters'),
    password: string({
      required_error: 'Password is required',
    }).min(1, 'Verification Type must be at least 1 character long'),
  })
});

export const usernameLoginSchema = object({
  body: object({
    username: string({
      required_error: 'Username is required',
    }).min(1, 'Username must be at least 1 character long'),
    password: string({
      required_error: 'Password is required',
    }).min(1, 'Password must be at least 1 character long')
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

export const userOnboardingFields = ['username', 'password', 'gender'];
export const userSoftDeleteFields = ['email', 'username', 'phone'];
export const systemPermittedRoles = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM'];
export const supportPermittedRoles = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM', 'SUPPORT'];
export const agentPermittedRoles = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM', 'SUPPORT', 'AGENT'];
export const allRoles = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM', 'SUPPORT', 'AGENT', 'USER'];

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
