import { z } from 'zod';

export const validate = (schemas) => {
    return (req, res, next) =>  {
        
        req.validated = {};
        const errors = {};

        for (const source of ["body", "query", "params"]) {
            if (!schemas[source]) continue;

            const result = schemas[source].safeParse(req[source]);

            if (!result.success) {
                errors[source] = result.error.flatten().fieldErrors;
            } else {
                req.validated[source] = result.data;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    }
};