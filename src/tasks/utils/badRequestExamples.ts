export const findAllBadRequestExamples = {
  invalidStatus: {
    summary: 'Некорректный статус задачи',
    value: {
      message: ['Status must be a valid TaskStatus (TODO, IN_PROGRESS, DONE)'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  invalidOffset: {
    summary: 'Некорректный offset',
    value: {
      message: ['Offset must be at least 1', 'Offset must be an integer'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  invalidLimit: {
    summary: 'Некорректный limit',
    value: {
      message: ['Limit must be at least 1', 'Limit must be an integer'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

export const createBadRequestExamples = {
  invalidTitle: {
    summary: 'Некорректное название задачи',
    value: {
      message: ['Title must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  invalidDescription: {
    summary: 'Некорректное описание задачи',
    value: {
      message: ['Description must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  invalidStatus: {
    summary: 'Некорректный статус задачи',
    value: {
      message: ['Status must be a valid TaskStatus (TODO, IN_PROGRESS, DONE)'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};
