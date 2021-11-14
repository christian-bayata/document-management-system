import express from 'express';
import DocumentController from '../controllers/document';
const router = express.Router();

router.route('/document/create').post(DocumentController.create);
router.route('/document').get(DocumentController.get);

export default router;