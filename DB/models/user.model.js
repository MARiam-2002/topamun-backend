import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    googleId: String,
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin"],
      default: "Student",
      required: true,
    },
    // Student specific
    academicStage: {
      type: String,
    },
    // Teacher specific
    subject: {
      type: String,
    },
    isApproved: {
      // for teacher
      type: Boolean,
      default: false,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    forgetCode: String,
    activationCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dz5dpvxg7/image/upload/v1691521498/ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc.png",
      },
      id: {
        type: String,
        default:
          "ecommerceDefaults/user/png-clipart-user-profile-facebook-passport-miscellaneous-silhouette_aol7vc",
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
