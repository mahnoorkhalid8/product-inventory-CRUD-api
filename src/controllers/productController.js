const createError = require("http-errors");
const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");

const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Product created successfully", data: product });
});

const getProducts = catchAsync(async (req, res, next) => {
  const { category, search, sortBy, order, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (category) filter.category = category.toLowerCase();
  if (search) filter.name = { $regex: search, $options: "i" };

  const sortField = ["price", "createdAt"].includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name email"),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("createdBy", "name email");

  if (!product) {
    return next(createError(404, "Product not found"));
  }

  res.status(200).json({ success: true, data: product });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(createError(404, "Product not found"));
  }

  const { name, description, price, category, stock } = req.body;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = stock;
  if (req.file) product.image = `/uploads/${req.file.filename}`;

  await product.save();

  res.status(200).json({ success: true, message: "Product updated successfully", data: product });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(createError(404, "Product not found"));
  }

  await product.deleteOne();

  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

const getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        averagePrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        count: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
        totalStock: 1,
      },
    },
    { $sort: { category: 1 } },
  ]);

  res.status(200).json({ success: true, data: stats });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
};
