import express from 'express';
import testDocController from '../controllers/document';
const router = express.Router();


router.route('/document').get(testDocController);

export default router;