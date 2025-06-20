import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function Match<T extends object>(
  property: keyof T,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate<V>(value: V, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [keyof T];
          const relatedValue = (args.object as T)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [keyof T];
          return `${propertyName} must match ${String(relatedPropertyName)}`;
        },
      },
    });
  };
}
