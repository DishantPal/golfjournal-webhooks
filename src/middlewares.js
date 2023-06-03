const asyncMiddleware = (req, res, next) => {
    try {
        next();
    } catch (error) {
        next(new Error("From Midddlware"));
    }
}

module.exports = {
    asyncMiddleware
}