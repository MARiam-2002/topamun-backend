import { AppError } from "./error.class.js";

export const globalErrorHandling = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Handle other types of errors (e.g., database, validation)
    console.error(err); // Log the full error for debugging

    return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
}; 