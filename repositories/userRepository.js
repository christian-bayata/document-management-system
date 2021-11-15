import User from '../models/users';

class UserRepository {
    constructor(user) {
        this.user = user 
    };
    
    /**
     * @param user
     * @returns {Promise<void>}
     */

    async create(user) {
        return await this.user.create(user);
    }

    /**
     * @param email
     * @returns {Promise<void>}
     */

     async findUsingEmail(email) {
        return await this.user.findOne({email});
    };


}

export default new UserRepository(User);