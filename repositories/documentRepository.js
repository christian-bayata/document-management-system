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
};

export default new DocumentRepository(Document);