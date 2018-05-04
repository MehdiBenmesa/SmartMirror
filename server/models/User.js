const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    email: String,
    password: String,
    followers : [{type: mongoose.Schema.Types.ObjectId , ref: 'User'}],
    following : [{type: mongoose.Schema.Types.ObjectId , ref: 'User'}],
    closet : [
        {
            category: String,
            brand: String,
            colour: String,
            fabric: String
        }
    ]
});

module.exports = mongoose.model('User', userSchema);