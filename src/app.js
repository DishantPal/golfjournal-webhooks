const express = require('express');
const helmet = require('helmet');

const config = require('./config');
const routes = require('./routes');
const { errorHandler,notFoundHandler } = require('./errorHandler');

const app = express();

// set security HTTP headers
app.use(helmet());

app.use('/', routes);


// Error Handling
app.use(notFoundHandler);

app.use(async (err, req, res, next) => {
    await errorHandler(err, res);
});

process.on("uncaughtException", error => {
    errorHandler(error);
});

process.on("unhandledRejection", (reason) => {
    errorHandler(reason);
});

module.exports = app;
