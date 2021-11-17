import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import { isUserAuthenticated, isUserAuthorized } from '../../../middlewares/auth'; 

router.route('/register').post(userController.register);

router.route('/login').post(userController.login);

router.route('/me').get(isUserAuthenticated, userController.userDetails);

router.route('/me/update').post(isUserAuthenticated, userController.updateUser);

router.route('/logout').get(userController.logout);

router.route('/users').get(isUserAuthenticated, isUserAuthorized, userController.getAllUsers);

router.route('/user/:id').get(isUserAuthenticated, isUserAuthorized, userController.getUserById);

router.route('/user/names').get(isUserAuthenticated, isUserAuthorized, userController.getUserByUsernames);

export default router;