import express from 'express';
import logger from 'morgan';
import { port, environment } from './settings'
import Database from './config/database';
import connectionString from './config/connection';
import documents from './api/v1/routes/document';

const app = express();

//Express set-up
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Set up database connection
new Database(connectionString).connect()

//Routes
app.use('/api/v1', documents);


const server = app.listen(port, () => { console.log(`server running on port ${port} in ${environment} mode`) });
export default server;