import validateRegisterUser from '../../../validations/users/validate-register-user';
import User from '../../../models/users';
import helpCalls from '../../../helper/helpCalls';
import _ from 'lodash';
import Response from '../../../utils/response';

class UserController {
     
    /**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new User
     * @param req
     * @param res
     * @param next
     * @returns {Object} 
     */

    async register(req, res, next) {
        return helpCalls(async () => {
            const { error } = await validateRegisterUser(req.body);
            if(error) return Response.badRequest({res, message: error.details[0].message});

            let { userName, firstName, lastName, email, password, roleId } = req.body;

            const user = await User.create({
                userName,
                firstName,
                lastName,
                email,
                password,
                roleId 
            });
            
            let token = user.generateAuthToken();
            
            let result = _.pick(user, [ "userName", "firstName", "lastName", "email", "roleId" ]);
            result.token = token;
            res.header('X-auth-token', token);
            console.log(token);
            return Response.success({res, message: "User has successfully registered", body: user }); 
        }, next)
    }
}

export default new UserController;