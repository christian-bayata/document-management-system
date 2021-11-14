import status from 'http-status';
import Document from '../../../models/documents';
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
        const { error }  = await validateCreateDoc(req.body); 
        if(error) return res.status(status.BAD_REQUEST).json(error.details[0].message);

        const { title, content, access, ownerId } = req.body;
        await Document.create({
            title, 
            content,
            access,
            ownerId
        });
        res.status(status.CREATED).json({
            success: true,
            message: "New Document has been created"
        });
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