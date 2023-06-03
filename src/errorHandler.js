const logger = require("./services/logger");

const notFoundHandler =  (req, res, next) => {
    return res.status(404).json({
        status: 404,
        message: "Route not found",
    });
}

const errorHandler = async (err, res) => {
    await logger.error(err);
    
    if(res)
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
        });
    else return null;
}

module.exports = {
    notFoundHandler,
    errorHandler,
};
