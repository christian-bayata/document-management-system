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

    /** 
     * @returns {Promise<void>}
     */

     async findAll() {
        return await this.user.find({}, { password: false, roleId: false }).lean();
    };

    /**
     * @param id 
     * @returns {Promise<void>}
     */

     async findById(id) {
        return await this.user.findById(id);
    };

    /**
     *
     * @param query
     * @returns {Promise<void|Promise>}
     */
	async search(query)
	{
		return this.user.esSearch({
			query_string: {
				query,
			},
		});
	}

}

export default new UserRepository(User);