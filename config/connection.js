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
} from '../settings';

let connectionString;

switch(environment) {
    case "development": 
        connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
        break;
    case "test":
        connectionString = `mongodb://${test_host}:${test_port}/${test_name}`;
        break;
    case "production":
        connectionString = `mongodb+srv://frank123:${prod_db_password}@frank.cw3md.mongodb.net/${prod_db_name}?retryWrites=true&w=majority`
        break;
    default: 
        connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
};

export default connectionString;