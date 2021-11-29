import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mexp from 'mongoose-elasticsearch-xp';
import mongoosastic from 'mongoosastic';
import { secretKey } from '../settings'

const userSchema = new mongoose.Schema({ 
    userName: {
		type: String,
		required: true,
		es_indexed: true
	},
    firstName: {
		type: String,
		required: true,
		es_indexed: true
	},
	lastName: {
		type: String,
		required: true,
		es_indexed: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		es_indexed: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	roleId: {
		type: Number, 
		default: 2 
	},
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {timestamps: true});

//Hash the password before storing it in the database
userSchema.pre('save', async function save(next) {
    try {
        if(!this.isModified('password')) return next();

        this.password = await bcrypt.hash(this.password, 10)
    }
    catch(err) {
        return next(err)
    }
});

//Compare password using bcrypt.compare
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password)
};

//Generate JWT token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, roleId: this.roleId }, secretKey);
    return token;
};

userSchema.plugin(mongoosastic, {
	host: "http://localhost:9200"
});

const User =  mongoose.model('User', userSchema);
export default User;


