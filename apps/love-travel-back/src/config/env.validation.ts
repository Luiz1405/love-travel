import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),

    //Validação de dados Postgres
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    //Validação de dados Mongo
    MONGO_URI: Joi.string().uri().optional(),
    MONGO_HOST: Joi.string().when('MONGO_URI', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    MONGO_PORT: Joi.number().default(27017),
    MONGO_USERNAME: Joi.string().when('MONGO_URI', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    MONGO_PASSWORD: Joi.string().when('MONGO_URI', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    MONGO_DATABASE: Joi.string().default('admin'),

    //Validação JWT
    JWT_SECRET: Joi.string().required(),

    //Validação OAuth Google
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
    FRONTEND_URL: Joi.string().uri().required(),

    //Validação de dados Supabase
    SUPABASE_URL: Joi.string().required().messages({
        'string.uri': 'SUPABASE_URL must be a valid URL',
    }),
    SUPABASE_KEY: Joi.string().required(),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

    //Validação de dados Redis
    REDIS_URL: Joi.string().uri().optional(),
    REDIS_HOST: Joi.string().when('REDIS_URL', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
    }),
    REDIS_PORT: Joi.number().default(6379),
})