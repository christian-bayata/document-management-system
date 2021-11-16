import jwt from 'jsonwebtoken';
import User from '../models/users';
import Response from '../utils/response';
import { secretKey } from '../settings';

/**
 * @Author - Edomaruse, Frank
 * @Responsibilty - Ensures user is authenticated to access certain routes
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>} 
 */

const isUserAuthenticated = async (req, res, next) => {
    const token = req.header("x-auth-token");
    console.log(token);
    if(!token) return Response.notAuthorized({ 
        res, 
        message: "You cannot access this resource, please provide a valid token"
    });

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next()
    } 
    catch(err) {
        return next(Response.badRequest({ res, message: "Invalid token" }));
    }
}

// const isUserAuthorized = function (...roles) {
//     return (req, res, next) => {
//         if(!roles.includes(req.user.role)) {
//             return next(new ErrorHandler(`Role ${req.user.role} is not permitted to access this resource`, 403))
//         };
//         next()
//     }
// };

export default isUserAuthenticated;