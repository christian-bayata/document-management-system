import mongoose from 'mongoose';

class Database {
    constructor(connectionString) { 
        this.connectionString = connectionString
    }; 

    async connected() {
        try{
            await mongoose.connect(this.connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(conn => console.log(`Database is connected to ${conn.connection.host}`));
        } catch(err) {
            console.log("Could not connect to the database", err);
            process.exit(1);
        };
    };
};

export default Database;