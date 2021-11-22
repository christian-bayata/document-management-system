import express from 'express';
import DocumentController from '../controllers/documents';
const router = express.Router();

import { isUserAuthenticated, isUserAuthorized } from '../../../middlewares/auth';

router.route('/document/create').post(isUserAuthenticated, DocumentController.createDocument);

router.route('/documents').get(isUserAuthenticated, DocumentController.getDocuments);

router.route('/document/update/:id').put(isUserAuthenticated, DocumentController.updateDocument);

export default router;