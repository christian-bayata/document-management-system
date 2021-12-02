# DOCUMENT MANAGEMENT SYSTEM

> Secure API that allows users save, update and delete their documents based on authorization.

[![Coverage Status](https://coveralls.io/repos/github/christian-bayata/document-management-system/badge.svg?branch=main)](https://coveralls.io/github/christian-bayata/document-management-system?branch=main) [![Maintainability](https://api.codeclimate.com/v1/badges/bd04780928a60e62ae1e/maintainability)](https://codeclimate.com/github/christian-bayata/document-management-system/maintainability)

| API Features                            |       Status       |
| :-------------------------------------- | :----------------: |
| User SignUp                             | :white_check_mark: |
| User SignIn                             | :white_check_mark: |
| Save Documents                          | :white_check_mark: |
| Update Documents                        | :white_check_mark: |
| Delete Documents                        | :white_check_mark: |
| Search(Query-based) Documents           | :white_check_mark: |
| Test Driven Development                 | :white_check_mark: |
| Micro Service Architecture              | :white_check_mark: |
| Test Coverage Visualization (coveralls) | :white_check_mark: |
| Code Quality Measurement                | :white_check_mark: |
| Role Based Access                       | :white_check_mark: |

- :cop: Authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- All background operations run on [document-management-system-background-service](https://github.com/christian-bayata/document-management-system.git). This is public repo and and can be used.
- Uses [MongoDB](https://www.mongodb.com) as database.
- [Mongoose](https://mongoosejs.com) as object document model
- Environments for `development`, `testing`, and `production`
- Linting via [eslint](https://github.com/eslint/eslint)
- Transpiling from ES6 to plain old ES5 using [babel](babeljs.io)
- Text formatting via [prettier](prettier.io)
- Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [npm scripts](#npm-scripts)
- example for User model and User controller, with jwt authentication, simply type `npm i` and `npm start`

## Table of Contents

- [Install & Use](#install-and-use)
- [Folder Structure](#folder-structure)
- [Repositories](#repositories)
  - [Create a Repository](#create-a-repository)
- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
- [Models](#models)
  - [Create a Model](#create-a-model)
- [Middlewares](#middlewares)
  - [auth.js](#authmiddleware)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
  - [Create Routes](#create-routes)
- [Test](#test)
  - [Setup](#setup)
- [npm Scripts](#npm-scripts)

## _Install and Use_

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/christian-bayata/document-management-system.git
```

then, do this afterwards:

```sh
# cd into project root
$ npm install
$ npm start
```

## _Folder Structure_

This codebase has the following directories:

- api - for controllers and routes.
- config - Settings for any external services or resources.
- helper - Contains functions to support the controllers
- middlewares - All middleware functions for authentication, authorization etc
- models - Database schema definitions, plugins and model creation
- repositories - Wrappers for database functions (Similar to Data Access Objects)
- tests - Automated tests for the project
- utils - Functions used often in codebase and tests
- validations Request payload validation at API level

### _Create a repository_

Repositories are wrappers around the models and use dependency injection to take the model as input.
The API was designed with the intent that users do not access the models directly but do so from the repositories.

Example: User Repository for all **CRUD** operations:

```js
import User from '../models/users';

class UserRepository {
  constructor(user) {
    this.user = user;
  }

  /**
   * @param user
   * @returns {Promise<void>}
   */

  async create(user) {
    return await this.user.create(user);
  }

  /**
   * @param email
   * @returns {Promise<void>}
   */

  async findUsingEmail(email) {
    return await this.user.findOne({ email });
  }

  /**
   * @returns {Promise<void>}
   */

  async findAll() {
    return await this.user.find({}, { password: false, roleId: false }).lean();
  }

  /**
   * @param id
   * @returns {Promise<void>}
   */

  async findById(id) {
    return await this.user.findById(id);
  }

  /**
   *
   * @param query
   * @returns {Promise<void|Promise>}
   */

  async search(query) {
    return this.user.search({
      query_string: {
        query: terms,
      },
    });
  }
}

export default new UserRepository(User);
```

## _Controllers_

### _Create a Controller_

Controllers in the codebase have a naming convention: `ModelnameController.js` and uses an ES6 class pattern.
To use a model function inside the controller, require the repository in the controller and use it. The controller should not have direct access to the Model except through the repository

Example: User Controller for all **CRUD** operations:

```js
import 'express-async-errors';
import validateRegisterUser from '../../../validations/users/validate-register-user';
import validateLoginUser from '../../../validations/users/validate-login-user';
import User from '../../../models/users';
import helpCalls from '../../../helper/helpCalls';
import _ from 'lodash';
import Response from '../../../utils/response';
import UserRepository from '../../../repositories/userRepository';
import Functionality from '../../../utils/functionality';

class UserController {
  /**
   * @Author - "Edomaruse, Frank"
   * @Responsibilty - Creates a new User
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/register
   * @returns {Object}
   */

  async register(req, res, next) {
    return helpCalls(async () => {
      const { error } = await validateRegisterUser(req.body);
      if (error)
        return Response.badRequest({ res, message: error.details[0].message });

      let { userName, firstName, lastName, email, password, roleId } = req.body;

      const existingUser = await UserRepository.findUsingEmail(email);
      if (existingUser) {
        return Response.badRequest({ res, message: 'User already exists' });
      }

      const user = await UserRepository.create({
        userName,
        firstName,
        lastName,
        email,
        password,
        roleId,
      });

      const token = user.generateAuthToken();

      let result = _.pick(user, [
        'userName',
        'firstName',
        'lastName',
        'email',
        'roleId',
      ]);
      result.token = token;
      res.header('x-auth-token', token);
      return Response.created({
        res,
        message: 'Successfully created new user',
        body: result,
      });
    }, next);
  }

  /**
   * @Responsibilty - logs a user in
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/login
   * @returns {Object}
   */

  async login(req, res, next) {
    const { error } = await validateLoginUser(req.body);
    if (error)
      return Response.badRequest({ res, message: error.details[0].message });

    let { email, password } = req.body;
    return helpCalls(async () => {
      const user = await UserRepository.findUsingEmail(email);
      if (!user)
        return Response.requestNotFound({
          res,
          message: 'Email address does not exist',
        });

      const confirmPassword = await user.comparePassword(password);
      if (!confirmPassword)
        return Response.badRequest({ res, message: 'Password does not match' });

      const token = user.generateAuthToken();
      let result = _.pick(user, ['_id', 'userName', 'email']);
      result.token = token;
      res.header('x-auth-token', token);
      return Response.success({
        res,
        message: 'Successfully logged in',
        body: result,
      });
    }, next);
  }

  /**
   * @Responsibilty - get user details
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/me
   * @returns {Object}
   */

  async userDetails(req, res, next) {
    return helpCalls(async () => {
      const user = await User.findById(req.user._id).select('-password');
      return Response.success({ res, body: user });
    }, next);
  }

  /**
   * @Responsibilty - Update user details
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/me/update
   * @returns {Object}
   */

  async updateUser(req, res, next) {
    return helpCalls(async () => {
      //Using the QUERY FIRST approach for updating, we have:
      // const user = await UserRepository.findById(req.user._id);
      // if(!user) return Response.requestNotFound({
      //     res,
      //     message: `User with id, ${req.user._id}, does not exist`
      // });
      //Update the document
      const userDetails = {
        userName: req.body.userName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
      };
      const user = await User.findByIdAndUpdate(req.user._id, userDetails, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      return Response.success({
        res,
        message: 'User details have been successfully updated',
        body: user,
      });
    }, next);
  }

  /**
   * @Responsibilty - Logs out a user
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/logout
   * @returns {Object}
   */

  async logout(req, res, next) {
    return helpCalls(async () => {
      res.header = null;
      return Response.success({
        res,
        message: 'You have logged out successfully',
      });
    }, next);
  }

  // ..................................................................................................
  //ADMIN

  /**
   * @Responsibilty - gets all users
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/admin/users
   * @returns {Object}
   */

  async getAllUsers(req, res, next) {
    return helpCalls(async () => {
      const users = await UserRepository.findAll();
      return Response.success({
        res,
        message: 'Successfully retrieved all users',
        body: users,
      });
    }, next);
  }

  /**
   * @Responsibilty - gets users by their ids
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/admin/user/:id
   * @returns {Object}
   */

  async getUserById(req, res, next) {
    return helpCalls(async () => {
      const id = req.params.id;
      const user = await UserRepository.findById(id);
      if (!user)
        return Response.requestNotFound({
          res,
          message: `user with the ID ${id} not found`,
        });
      return Response.success({
        res,
        message: `Successfully retrieved user with ID ${id}`,
        body: user,
      });
    }, next);
  }

  /**
   * @Responsibilty - gets users by their usernames
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/admin/user/search
   * @returns {Object}
   */

  async searchUsers(req, res, next) {
    return helpCalls(async () => {
      let functionality = new Functionality(
        User.find(),
        req.query
      ).searchUserByUsername();

      const user = await functionality.query;
      return Response.success({
        res,
        message: 'Successfully searched users',
        body: user,
      });
    }, next);
  }

  /**
   * @Responsibilty - deletes user
   * @param req
   * @param res
   * @param next
   * @route - /api/v1/admin/delete/user/:id
   * @returns {Object}
   */

  async deleteUser(req, res, next) {
    return helpCalls(async () => {
      const id = req.params.id;
      const user = await UserRepository.findById(id);
      if (!user)
        return Response.requestNotFound({
          res,
          message: `user with ID ${id} is not found`,
        });

      await user.deleteOne();
      return Response.success({
        res,
        message: `Successfully deleted user with ID ${id}`,
      });
    }, next);
  }
}

export default new UserController();
```

## _Models_

### _Create a Model_

Models in this boilerplate have a naming convention: `Model.js` and uses [Mongoose](https://mongoosejs.com) as the Object Data Model, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).

Example User Model:

```js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mexp from 'mongoose-elasticsearch-xp';
import mongoosastic from 'mongoosastic';
import { secretKey } from '../settings';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    firstName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    lastName: {
      type: String,
      required: true,
      es_indexed: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      es_indexed: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    roleId: {
      type: Number,
      default: 2,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

//Hash the password before storing it in the database
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    return next(err);
  }
});

//Compare password using bcrypt.compare
userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

//Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, roleId: this.roleId }, secretKey);
  return token;
};

userSchema.plugin(mongoosastic, {
  host: 'http://localhost:9200',
});

const User = mongoose.model('User', userSchema);
export default User;
```

## _Middlewares_

Middleware are functions that can run before hitting a route.

Example middleware:

Only allow if the user is logged in

> Note: this is not a secure example, only for presentation purposes

```js
import jwt from 'jsonwebtoken';
import User from '../models/users';
import Response from '../utils/response';
import { secretKey } from '../settings';

/**
 * @Author - Edomaruse, Frank
 * @Responsibilty - Ensures user is authenticated to access certain routes
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */

const isUserAuthenticated = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return Response.notAuthorized({
      res,
      message: 'You cannot access this resource, please provide a valid token',
    });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return next(Response.badRequest({ res, message: 'Invalid token' }));
  }
};

const isUserAuthorized = (req, res, next) => {
  if (req.user.roleId !== 1) {
    return next(
      Response.forbidden({
        res,
        message: 'Sorry, you cannot access this resource',
      })
    );
  }
  next();
};

export { isUserAuthenticated, isUserAuthorized };
```

> Note: The `isUserAuthenticated` middleware is used on all protected routes that require users to have at least logged in more than once

Example of routes that contain `isAuthenticated` middleware:

```js
import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import {
  isUserAuthenticated,
  isUserAuthorized,
} from '../../../middlewares/auth';

router.route('/me').get(isUserAuthenticated, userController.userDetails);

router.route('/me/update').put(isUserAuthenticated, userController.updateUser);
export default router;
```

> Furthermore, the `isUserAuthorized` middleware is used on all protected routes for admins only, whose `roleId` must be equal to 1.

```js
import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import {
  isUserAuthenticated,
  isUserAuthorized,
} from '../../../middlewares/auth';

router
  .route('/admin/users')
  .get(isUserAuthenticated, isUserAuthorized, userController.getAllUsers);

router
  .route('/admin/user/:id')
  .get(isUserAuthenticated, isUserAuthorized, userController.getUserById);

router
  .route('/admin/users/search')
  .get(isUserAuthenticated, isUserAuthorized, userController.searchUsers);

router
  .route('/admin/delete/user/:id')
  .delete(isUserAuthenticated, isUserAuthorized, userController.deleteUser);

export default router;
```

## _config_

### _connection-and-database_

> Note: if you use MongoDB make sure mongodb server is running on your local machine

These two files below are the means through which we connection can be made to the database.
Now simple configure the keys with your credentials from environment variables.

I create a separate module, `settings.js`, to export all environment variables that are used in `connection.js` and `database.js`:

### _settings.js_

```js
import dotenv from 'dotenv';
dotenv.config();

export const testEnvironmentVariable = process.env.TEST_ENV_VARIABLE;
export const port = process.env.PORT || 5000;
export const environment = process.env.NODE_ENV || 'development';

export const db_host = process.env.LOCAL_DB_HOST;
export const db_port = process.env.LOCAL_DB_PORT;
export const db_name = process.env.LOCAL_DB_NAME;

export const test_host = process.env.TEST_DB_HOST;
export const test_port = process.env.TEST_DB_PORT;
export const test_name = process.env.TEST_DB_NAME;

export const prod_db_password = process.env.PROD_DB_PASSWORD;
export const prod_db_name = process.env.PROD_DB_NAME;

export const secretKey = process.env.JWTPRIVATEKEY;
export const jwtExpirationTime = process.env.JWTEXPIRATIONTIME;
```

From this point, you can create a `.env` file, where you can manually store your variables

### _connection.js_

```js
import {
  environment,
  db_host,
  db_port,
  db_name,
  test_host,
  test_port,
  test_name,
  prod_db_password,
  prod_db_name,
} from '../settings';

let connectionString;

switch (environment) {
  case 'development':
    connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
    break;
  case 'test':
    connectionString = `mongodb://${test_host}:${test_port}/${test_name}`;
    break;
  case 'production':
    connectionString = `mongodb+srv://frank123:${prod_db_password}@frank.cw3md.mongodb.net/${prod_db_name}?retryWrites=true&w=majority`;
    break;
  default:
    connectionString = `mongodb://${db_host}:${db_port}/${db_name}`;
}

export default connectionString;
```

### _database.js_

```js
import mongoose from 'mongoose';

class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  async connected() {
    try {
      await mongoose
        .connect(this.connectionString, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then((conn) =>
          console.log(`Database is connected to ${conn.connection.host}`)
        );
    } catch (err) {
      console.log('Could not connect to the database', err);
      process.exit(1);
    }
  }
}

export default Database;
```

## _Routes_

Here you define all your routes for your api.

## _Create Routes_

For further information read the [guide](https://expressjs.com/en/guide/routing.html) of express router.

Example for User Resource:

> Note: Only supported Methods are **POST**, **GET**, **PUT**, and **DELETE**.

```js
import express from 'express';
import userController from '../controllers/users';
const router = express.Router();

import {
  isUserAuthenticated,
  isUserAuthorized,
} from '../../../middlewares/auth';

router.route('/register').post(userController.register);

router.route('/login').post(userController.login);

router.route('/me').get(isUserAuthenticated, userController.userDetails);

router.route('/me/update').put(isUserAuthenticated, userController.updateUser);

router.route('/logout').get(userController.logout);

router
  .route('/admin/users')
  .get(isUserAuthenticated, isUserAuthorized, userController.getAllUsers);

router
  .route('/admin/user/:id')
  .get(isUserAuthenticated, isUserAuthorized, userController.getUserById);

router
  .route('/admin/users/search')
  .get(isUserAuthenticated, isUserAuthorized, userController.searchUsers);

router
  .route('/admin/delete/user/:id')
  .delete(isUserAuthenticated, isUserAuthorized, userController.deleteUser);

export default router;
```

## Tests

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So please read their docs on further information.

### _Controller_

> Note: those request are asynchronous, we use `async await` syntax.

> Note: For ES6 based test, we use `import` and not the `require` syntax for tests

> All controller actions are wrapped in a function to avoid repetitive try...catch syntax

To test a Controller we create `requests` to our api routes.

Example `Document Contoller` that has been refactored for clean testing:

```js
import request from 'supertest';
import server from '../../../app';
import Document from '../../../models/documents';
import User from '../../../models/users';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { secretKey } from '../../../settings';

const baseURI = '/api/v1';
let app;

let token;
let decoded;
let user;
let document;

describe('Document Controller', () => {
  beforeAll(async () => {
    app = server;
  });

  afterAll(async () => {
    app.close();
    await Document.deleteMany({});
    await User.deleteMany({});
    mongoose.disconnect();
  });

  describe('Create new document', () => {
    const exec = async () => {
      return await request(app)
        .post(`${baseURI}/document/create`)
        .set('x-auth-token', token)
        .send(document);
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      decoded = jwt.verify(token, secretKey);

      user = new User({
        userName: 'Frankie11',
        firstName: 'Frank1',
        lastName: 'Osagie1',
        email: 'franksagie1111@gmail.com',
        password: 'frank1234',
        roleId: 2,
      });

      document = {
        title: 'doc_title',
        content: 'doc_content',
        access: 'private',
      };
    });

    it('should return 400 if title is missing from document payload', async () => {
      const documentPayload = {
        content: 'doc_content',
        access: 'private',
      };
      const token = new User().generateAuthToken();
      const res = await exec();

      expect(res.status).toEqual(400);
      expect(res.body.message).toMatch(/title/i);
    });
  });
});
```

### _Config/connection_

```js
import connectionString from '../../../config/connection';
import {
  environment,
  db_host,
  db_port,
  db_name,
  test_host,
  test_port,
  test_name,
  prod_db_password,
  prod_db_name,
} from '../../../settings';

describe('Config/connection.js', () => {
  const ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV }; //Make a copy of the environment variables
  });

  afterAll(() => {
    process.env = ENV; //Restore old env
  });

  it('should pass if environment is "development"', async () => {
    if ((ENV.NODE_ENV = 'development')) {
      expect(db_host).toMatch(/localhost/);
      expect(db_port).toMatch(/27017/);
      expect(db_name).toMatch(/domDB/);
      expect(connectionString).toMatch(
        `mongodb://${db_host}:${db_port}/${db_name}`
      );
    }
  });

  it('should pass if environment is "test"', async () => {
    if ((ENV.NODE_ENV = 'test')) {
      expect(test_host).toMatch(/localhost/);
      expect(test_port).toMatch(/27017/);
      expect(test_name).toMatch(/domDB_test/);
      expect(connectionString).toMatch(
        `mongodb://${test_host}:${test_port}/${test_name}`
      );
    }
  });

  it('should pass if environment is "production"', async () => {
    if ((ENV.NODE_ENV = 'production')) {
      expect(prod_db_password).toMatch(/fr/);
      expect(prod_db_name).toMatch(/domDB/);
    }
  });
});
```

### _Models_

Are usually automatically tested in the integration tests as the Controller uses the Models (you can test them seperately, not necessary though).

## npm scripts

There are no automation tool or task runner like [grunt](https://gruntjs.com/) or [gulp](http://gulpjs.com/) used for this project. This project only uses npm scripts for automation.

### npm run dev

This is the entry for a developer. This command:

- runs **nodemon watch task** for the all files connected to the codebase
- sets the **environment variable** `NODE_ENV` to `development`
- opens the db connection for `development`
- starts the server on `localhost`

### npm test

This command:

- sets the **environment variable** `NODE_ENV` to `test`
- creates the `test database`
- runs `jest --coverage --runInBand` for testing with [Jest](https://github.com/facebook/jest) and the coverage
- drops the `test database` after the test

![Image showing test coverage]

## npm run prod

This command:

- sets the **environment variable** to `production`
- opens the db connection for `production`
- starts the server on 127.0.0.1 or on 127.0.0.1:PORT_ENV

Before running on any environment you have to set the **environment variables**:

```dotenv
NODE_ENV=
PORT=

LOCAL_DB_HOST=
LOCAL_DB_PORT=
LOCAL_DB_NAME=

TEST_DB_HOST=
TEST_DB_PORT=
TEST_DB_NAME=

TEST_DB_HOST=
TEST_DB_PORT=
TEST_DB_NAME=

PROD_DB_PASSWORD=
PROD_DB_NAME=

JWTPRIVATEKEY=
JWTEXPIRATIONTIME=
```
