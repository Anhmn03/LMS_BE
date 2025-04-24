const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { promisify } = require("node:util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
const signup = async (req, res) => {
  try {
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      throw new Error("Please provide email and password!");
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Incorrect email or password");
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role.name)) {
        throw new Error("You do not have permission to perform this action");
      }

      next();
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  };
};
const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new Error("You are not logged in! Please log in to get access.");
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("The user belonging to this token does no longer exist.");
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      throw new Error("Your current password is wrong.");
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, restrictTo, protect, updatePassword };
