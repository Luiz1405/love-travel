import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development' , 'production', 'test')
        .default('development'),
        PORT: Joi.number().default(3000),

    //Validação de dados Postgres
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    //Validação de dados Mongo
    MONGO_URI: Joi.string().required(),

    //Validação JWT
    JWT_SECRET: Joi.string().required(),
})