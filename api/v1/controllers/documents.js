import Document from '../../../models/documents';
import helpCalls from '../../../helper/helpCalls';
import Response from '../../../utils/response';
import User from '../../../models/users';
import { validateCreateDoc } from '../../../validations/documents/validate-create-document';
import UserRepository from '../../../repositories/userRepository';
import DocumentRepository from '../../../repositories/documentRepository';

class DocumentController {
    /**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new document
     * @param req
     * @param res
     * @param next
     * @returns {Object} 
     */

    async createDocument(req, res, next) {
        return helpCalls(async () => {
            const { error }  = await validateCreateDoc(req.body); 
            if(error) return Response.badRequest({res, message: error.details[0].message})
    
            const { title, content, access } = req.body;
            
            const ownerId = await UserRepository.findById(req.user._id);
            if(!ownerId) return Response.requestNotFound({ res, message: "User with this ID not found" });
            
            const document = await DocumentRepository.create({
                title, 
                content,
                access, 
                ownerId
            });
           return Response.success({res, message: "New Document Has Been Created Successfully", body: document});
        }, next);
    };

    /**
     * @Responsibilty - Gets user document
     * @param req
     * @param res
     * @param next
     * @returns {Object} 
    */

    async getDocuments(req, res, next) {
        return helpCalls(async () => {
            
            const ownerId = await User.findById(req.user._id);
            if(!ownerId) return Response.requestNotFound({ res, message: "User with this ID not found" }); 
            
            const documents = await DocumentRepository.find({ownerId});
            
            res.status(200).json({
                success: true,
                documents
            });
        }, next);
    };
};
export default new DocumentController;