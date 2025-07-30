const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// Plugin should be applied on the schema, not model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
