import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";


export function IsAfter(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isAfter',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];

                    if (!value || !relatedValue) return true;
                    return value >= relatedValue;
                },
                defaultMessage() {
                    return `Data de término deve ser depois da Data de início`;
                }
            }
        })
    }
}