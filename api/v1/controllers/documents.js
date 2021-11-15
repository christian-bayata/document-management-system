import Document from '../../../models/documents';
import helpCalls from '../../../helper/helpCalls';
import Response from '../../../utils/response';
import { validateCreateDoc } from '../../../validations/documents/validate-create-document';

class DocumentController {
    /**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new document
     * @param req
     * @param res
     * @param next
     * @returns {Object} 
     */

    async create(req, res, next) {
        return helpCalls(async () => {
            const { error }  = await validateCreateDoc(req.body); 
            if(error) return Response.badRequest({res, message: error.details[0].message})
    
            const { title, content, access, ownerId } = req.body;
            const document = await Document.create({
                title, 
                content,
                access,
                ownerId
            });
           return Response.success({res, message: "New Document Has Been Created Successfully", body: document});
        }, next);
    };

    async get(req, res, next) {
        const documents = await Document.find();

        res.status(200).json({
            success: true,
            documents
        });
    };
};
export default new DocumentController;