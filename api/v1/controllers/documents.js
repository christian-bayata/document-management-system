import Document from '../../../models/documents';
import helpCalls from '../../../helper/helpCalls';
import Response from '../../../utils/response';
import User from '../../../models/users';
import { validateCreateDoc } from '../../../validations/documents/validate-create-document';
import UserRepository from '../../../repositories/userRepository';
import DocumentRepository from '../../../repositories/documentRepository';
import Functionality from '../../../utils/functionality';

class DocumentController {
    /**
     * @Author - "Edomaruse, Frank"
     * @Responsibilty - Creates a new document
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/document/create
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
     * @route - /api/v1/documents
     * @returns {Object} 
    */

    async getDocuments(req, res, next) {
        return helpCalls(async () => {
            //Check for the Id of the user from the token passed
            const ownerId = await UserRepository.findById(req.user._id);
            if(!ownerId) return Response.requestNotFound({ res, message: "User with this ID not found" }); 
            
            //Only finds the document of the currently logged-in user
            const documents = await DocumentRepository.find({ownerId});
            return Response.success({ res, message: "Successfully retrieved all your documents", body: documents });
        }, next);
    };

    /**
     * @Responsibilty - Update user document
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/document/update/:id
     * @returns {Object} 
    */

    async updateDocument(req, res, next) {
        return helpCalls(async () => {
            //Using the QUERY FIRST approach for updating, we have:
            const document = await DocumentRepository.findById(req.params.id);
            if(!document) return Response.requestNotFound({ 
                res, 
                message: `Document with id, ${req.params.id} does not exist` 
            });

            if(String(document.ownerId) !== String(req.user._id)) {
                return Response.notAuthorized({ 
                    res, 
                    message: "You are not authorized to update this document" 
                });
            };

            //Update the document
            document.title = req.body.title;
            document.content = req.body.content;

            await document.save();
            
            return Response.success({ 
                res, 
                message: "Successfully updated your document", 
                body: document
            });
        }, next);
    };

    /**
     * @Responsibilty - Update user document
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/document/delete/:id
     * @returns {Object} 
    */

    async deleteDocument(req, res, next) {
        return helpCalls(async () => { 
            const id = req.params.id;
            const document = await DocumentRepository.findById(id);
            if(!document) return Response.requestNotFound({res, message: `document with ID ${id} is not found`});

            await document.deleteOne();
            return Response.success({res, message: `Successfully deleted document with ID ${id}`});
        }, next)
    };

     // ..................................................................................................
    //ADMIN
    
    /**
     * @Responsibilty - Get all documents
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/admin/documents
     * @returns {Object} 
    */

     async getAllDocuments(req, res, next) {
        return helpCalls(async () => { 
            const documents = await DocumentRepository.find();

            return Response.success({res, message: `Successfully retireved all documents`, body: documents});
        }, next)
    };

    /**
     * @Responsibilty - Get a document by its id
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/admin/document/:id
     * @returns {Object} 
    */

     async getSingleDocument(req, res, next) {
        return helpCalls(async () => { 
            const id = req.params.id;
            const document = await DocumentRepository.findById(id);
            if(!document) return Response.requestNotFound({res, message: `document with ID ${id} is not found`});

            return Response.success({res, message: `Successfully retrieved document with ID ${id}`, body: document});
        }, next);
    };

    /**
     * @Responsibilty - Get a document by its title
     * @param req
     * @param res
     * @param next
     * @route - /api/v1/admin/document/search?keyword={}
     * @returns {Object} 
    */

    async searchDocuments(req, res, next) {
        return helpCalls(async () => { 
           let functionality = new Functionality(Document.find(), req.query).searchDocumentsByTitle();

           const documents = await functionality.query;
           const count = documents.length;
           return Response.success({ res, message: "Successfully searched documents", body: {count, documents } });
        }, next);
    };
};

export default new DocumentController;