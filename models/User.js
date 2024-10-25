const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Assure l'unicité de l'addresse e-mail
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);