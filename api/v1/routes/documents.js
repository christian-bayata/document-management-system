import express from 'express';
import DocumentController from '../controllers/documents';
const router = express.Router();

import { isUserAuthenticated, isUserAuthorized } from '../../../middlewares/auth';

router.route('/document/create').post(isUserAuthenticated, DocumentController.createDocument);
router.route('/document').get(DocumentController.get);

export default router;