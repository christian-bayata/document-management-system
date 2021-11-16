import validateRegisterUser from '../../../validations/users/validate-register-user';
import validateLoginUser from '../../../validations/users/validate-login-user';
import User from '../../../models/users';
import helpCalls from '../../../helper/helpCalls';
import _ from 'lodash';
import Response from '../../../utils/response';
import UserRepository from '../../../repositories/userRepository';

class UserController {
     
    /**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new User
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/register
     * @returns {Object} 
     */

    async register(req, res, next) {
        return helpCalls(async () => {
            const { error } = await validateRegisterUser(req.body);
            if(error) return Response.badRequest({res, message: error.details[0].message});

            let { userName, firstName, lastName, email, password, roleId } = req.body;

            const existingUser = await UserRepository.findUsingEmail(email);
            if(existingUser) {
                return Response.badRequest({ res, message: "User already exists" });
            }

            const user = await UserRepository.create({
                userName,
                firstName,
                lastName,
                email,
                password,
                roleId 
            });
            
            const token = user.generateAuthToken();
            
            let result = _.pick(user, [ "userName", "firstName", "lastName", "email", "roleId" ]);
            result.token = token;
            res.header('x-auth-token', token);
            return Response.success({ res, message: "Successfully created new user", body: result }); 
        }, next)
    }

    /**
    * @Responsibilty - logs a user in
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/login
     * @returns {Object} 
     */

    async login(req, res, next) {
        const { error } = await validateLoginUser(req.body);
        if(error) return Response.badRequest({res, message: error.details[0].message});

        let { email, password } = req.body;
        return helpCalls(async () => {
            const user = await UserRepository.findUsingEmail(email);
            if(!user) return Response.requestNotFound({ res, message: "Email address does not exist" });

            const confirmPassword = await user.comparePassword(password);
            if(!confirmPassword) return Response.badRequest({ res, message: "Password does not match" });

            const token = user.generateAuthToken();
            let result = _.pick(user, ["_id", "userName", "email"]);
            result.token = token;
            res.header('X-auth-token', token);
            return Response.success({ res, message: "Successfully logged in", body: result });
        }, next)
    };

    /**
    * @Responsibilty - Logs out a user
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/logout
     * @returns {Object} 
     */

    async logout(req, res, next) {
        return helpCalls(async () => {
            res.header = null;
            return Response.success({ res, message: "You have logged out successfully"});
        }, next)
        
    }
};

export default new UserController;