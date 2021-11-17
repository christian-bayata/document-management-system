import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import { isUserAuthenticated, isUserAuthorized } from '../../../middlewares/auth'; 

router.route('/register').post(userController.register);

router.route('/login').post(userController.login);

router.route('/me').get(isUserAuthenticated, userController.userDetails);

router.route('/logout').get(userController.logout);

router.route('/users').get(isUserAuthenticated, isUserAuthorized, userController.getAllUsers);

export default router;