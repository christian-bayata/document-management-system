import Joi from 'joi';

/* 
    @params: doc
    @returns: {*} 
*/

export const validateCreateDoc = (doc) => {
    
    const schema = Joi.object({

        title: Joi.string()
                    .min(5)
                    .max(50)
                    .required(),
                
        content: Joi.string()
                    .min(5)
                    .required(),

        access: Joi.string()
                    .required()
        });       
    return schema.validate(doc)     
};
