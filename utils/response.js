import status from 'http-status';

class Response {
    /**
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */

    static success({res, statusCode=status.OK, message="Successful Operation", body={}}) {
        return res.status(statusCode).send({message, body});
    };

    /**
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */
    
    static created({res, statusCode=status.CREATED, message="Created Successfully", body={}}) {
        return res.status(statusCode).send({message, body});
    };

    /**
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */ 

     static badRequest({res, statusCode=status.BAD_REQUEST, message="Failed Operation", body={}}) {
        return res.status(statusCode).send({message, body});
    };

    /**
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @returns {*}
     */

     static requestNotFound({res, statusCode=status.NOT_FOUND, message="Request Not Found", body={}}) {
        return res.status(statusCode).send({message, body});
    };

    /**
     * @param res
     * @param statusCode
     * @param message
     * @param body
     * @param error
     * @param stack
     * @returns {*}
     */

     static internalServerError({res, statusCode=status.INTERNAL_SERVER_ERROR, 
        message="Oops! Something Went Wrong", 
        body = {}, 
        error, 
        stack
    }) {
        return res.status(statusCode).send({message, body, error, stack});
    };
}

export default Response;