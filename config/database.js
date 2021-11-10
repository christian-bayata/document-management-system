import mongoose from 'mongoose';

class Database {
    constructor(connectionString) {
        this.connectionString = connectionString
    }; 

    async connect() {
        try{
            await mongoose.connect(this.connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => console.log(`Database is connected to ${this.connectionString}`));
        } catch(err) {
            console.log("Could not connect to the database", err);
            process.exit(1);
        };
    };
};

export default Database;