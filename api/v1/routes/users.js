import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import isUserAuthenticated from '../../../middlewares/auth'; 

router.route('/register').post(userController.register);

router.route('/login').post(userController.login);

router.route('/me').get(isUserAuthenticated, userController.userDetails);

router.route('/logout').get(userController.logout);

export default router;