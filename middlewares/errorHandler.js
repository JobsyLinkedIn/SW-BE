const errorHandler = (err, req, res, next) => {
    console.error(err.stack || "");
    const statusCode = err.statusCode || 500; // Default to 500 if not provided
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Show stack only in development
    });
};

export default errorHandler;
