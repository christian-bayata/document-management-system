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

const isUserAuthorized = (req, res, next) => {
    if(req.user.roleId !== 1) {
        return next(Response.forbidden({ res, message: "Sorry, you cannot access this resource"}))
    }
    next();
}
    
export {
    isUserAuthenticated,
    isUserAuthorized
}