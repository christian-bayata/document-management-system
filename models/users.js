import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoosastic from 'mongoosastic';
import { secretKey, jwtExpirationTime } from '../settings'

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

//Generate JWT token
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ id: this._id }, secretKey, {
        expiresIn: jwtExpirationTime
    });
    return token;
};

//Reset forgotten password using crypto 
userSchema.methods.getResetPasswordToken = function() {
    //Generate crypto token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Encrypt the token and set it to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set the token expiry time to 30 mins
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
     
    return resetToken;
}

userSchema.plugin(mongoosastic);

export default mongoose.model('User', userSchema);
