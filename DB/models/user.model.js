import mongoose, { Schema, Types, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";
import bcryptjs from 'bcryptjs'

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
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.INSTRUCTOR],
      default: systemRoles.USER,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: "system",
    },
    forgetCode: String,
    // student related
    governorate: String,
    gradeLevel: String,
    // instructor related
    subject: String,
    document: {
      secure_url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(this.password, +process.env.SALT_ROUND);
  }
  next();
});

const userModel = mongoose.models.userModel || model("User", userSchema);
export default userModel;
