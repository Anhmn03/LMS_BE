const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minLength: [2, "Full name must be at least 2 characters"],
      maxLength: [50, "Full name cannot exceed 50 characters"],
    },
    profilePicture: {
      type: String,
      trim: true,
      match: [/^$|\.(jpg|jpeg|png|gif)$/, "Profile picture must be a valid image URL"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    specialization: {
      type: String,
      trim: true,
      maxLength: [100, "Specialization cannot exceed 100 characters"],
    },
    expertise: {
      type: String,
      trim: true,
      maxLength: [100, "Expertise cannot exceed 100 characters"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
