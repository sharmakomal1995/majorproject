const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('strictQuery', true);
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing"
    }
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  profileImage: {
    url: String,
    filename: String
  },
  profile: {
    birth: String,
    work: String,
    travel: String,
    pet: String,
    school: String,
    fun: String,
    time: String,
    skill: String,
    song: String,
    observe: String,
    biography: String
  }

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose,);

module.exports = mongoose.model('User', userSchema);
