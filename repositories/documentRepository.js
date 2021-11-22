import Document from '../models/documents';

class DocumentRepository {
    constructor(doc) {
        this.doc = doc
    };
    
    /**
     * @param doc
     * @returns {Promise<void>}
     */

    async create(doc) {
        return await this.doc.create(doc)
    };

    /**
     * @param doc
     * @returns {Promise<void>}
     */

     async find(doc) {
        return await this.doc.find(doc).select('-access');
    };

    /**
     * @param id
     * @returns {Promise<void>}
     */

     async findById(id) {
        return await this.doc.findById(id).select('-access');
    };
};

export default new DocumentRepository(Document);