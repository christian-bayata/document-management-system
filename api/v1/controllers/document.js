import Document from '../../../models/documents';


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
        const { title, content, access, ownerId } = req.body;
        const document = await Document.create({
            title, 
            content,
            access,
            ownerId
        });
        res.status(201).json({
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