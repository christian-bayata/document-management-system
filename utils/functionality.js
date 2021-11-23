class Functionality {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    };

    /**
     * @returns {*}
    */

    //The search method
    search() { 
        //If the keyword exists, run a $regex on the it with case insensitive option
        //If not, return an empty object
        const keyword = this.queryStr.keyword ? {
            //search product by its title
                title: {
                $regex: this.queryStr.keyword,
                $options: 'i'
                } 
        }: {}
        
        this.query = this.query.find({ ...keyword });
        return this;
    };
};

export default Functionality;