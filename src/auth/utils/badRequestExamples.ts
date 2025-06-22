export const loginBadRequestExamples = {
  invalidEmail: {
    summary: 'Некорректный email',
    value: {
      message: ['Please provide a valid email address'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  noEmail: {
    summary: 'Email не указан',
    value: {
      message: ['Email is required', 'Please provide a valid email address'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  invalidPassword: {
    summary: 'Несоотвествие пароля требованиям',
    value: {
      message: [
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  tooShortPassword: {
    summary: 'Пароль слишком короткий',
    value: {
      message: ['Password must be at least 8 characters long'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  tooLongPassword: {
    summary: 'Пароль слишком длинный',
    value: {
      message: ['Password must not exceed 100 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  noPassword: {
    summary: 'Пароль не указан',
    value: {
      message: [
        'Password is required',
        'Password must be at least 8 characters long',
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const registerBadRequestExamples = {
  ...loginBadRequestExamples,
  noName: {
    summary: 'Имя не указано',
    value: {
      message: ['Name is required', 'Name must be at least 1 character long'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },

  nameIsNotString: {
    summary: 'Имя должно быть строкой',
    value: {
      message: ['Name must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },

  nameTooShort: {
    summary: 'Имя слишком короткое',
    value: {
      message: ['Name must be at least 1 character long'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },

  nameTooLong: {
    summary: 'Имя слишком длинное',
    value: {
      message: ['Name must not exceed 100 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },

  noConfirmPassword: {
    summary: 'Пароль не подтвержден',
    value: {
      message: ['Confirm password is required', 'Passwords do not match'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },

  passwordsDoNotMatch: {
    summary: 'Пароли не совпадают',
    value: {
      message: ['Passwords do not match'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};
