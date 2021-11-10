import { 
    environment, 
    db_host, 
    db_port, 
    db_name,
    test_host, 
    test_port, 
    test_name,  
} from '../settings';

let connectionString;

switch(environment) {
    case "development": 
        connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
        break;
    case "test":
        connectionString = `mongodb://${test_host}:${test_port}/${test_name}`;
        break;
    default: 
        connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
};

export default connectionString;