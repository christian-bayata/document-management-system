import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

router.route('/register').post(userController.register);
router.route('/login').post(userController.login);
export default router;