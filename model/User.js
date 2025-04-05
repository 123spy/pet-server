const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {type: String},
    userAccount: {type: String},
    userPassword: {type: String},
    userRole: {type: String, default: 'user'},
    userProfile: {type: String, default: 'null...'}
});

module.exports = UserSchema;