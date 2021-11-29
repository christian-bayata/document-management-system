import connectionString from '../../../config/connection';
import {
    environment, 
    db_host, 
    db_port, 
    db_name,
    test_host, 
    test_port, 
    test_name,
    prod_db_password,
    prod_db_name 
} from '../../../settings'

describe('Config/connection.js', () => {
    const ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {... ENV}; //Make a copy of the environment variables
    });

    afterAll(() => {
        process.env = ENV; //Restore old env
    })

    it('should pass if environment is "development"', async () => {
        if(ENV.NODE_ENV="development") {
           expect(db_host).toMatch(/localhost/);
           expect(db_port).toMatch(/27017/);
           expect(db_name).toMatch(/domDB/);
           expect(connectionString).toMatch(`mongodb://${db_host}:${db_port}/${db_name}`);
       }; 
    });

    it('should pass if environment is "test"', async () => {
        if(ENV.NODE_ENV="test") {
           expect(test_host).toMatch(/localhost/);
           expect(test_port).toMatch(/27017/);
           expect(test_name).toMatch(/domDB_test/);
           expect(connectionString).toMatch(`mongodb://${test_host}:${test_port}/${test_name}`);
       }; 
    });

    it('should pass if environment is "production"', async () => {
        if(ENV.NODE_ENV="production") {
           expect(prod_db_password).toMatch(/fr/);
           expect(prod_db_name).toMatch(/domDB/);
        }; 
    });
})