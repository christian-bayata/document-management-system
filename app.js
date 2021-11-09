const express = require('express');
const app = express();
const logger = require('morgan');
const indexRoute = require('./routes/index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1', indexRoute);

app.listen(3000, function() { console.log('server running on port 3000' )});