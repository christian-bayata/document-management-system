import dotenv from 'dotenv';
dotenv.config();

export const testEnvironmentVariable = process.env.TEST_ENV_VARIABLE;
export const port = process.env.PORT || 5000;
export const environment = process.env.NODE_ENV || "development";

export const db_host = process.env.LOCAL_DB_HOST;
export const db_port = process.env.LOCAL_DB_PORT;
export const db_name = process.env.LOCAL_DB_NAME;

export const test_host = process.env.TEST_DB_HOST;
export const test_port = process.env.TEST_DB_PORT;
export const test_name = process.env.TEST_DB_NAME;

export const secretKey = process.env.JWTPRIVATEKEY;
export const jwtExpirationTime = process.env.JWTEXPIRATIONTIME;