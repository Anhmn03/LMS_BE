const categoryModel = require("../models/category.model");

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await categoryModel.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
