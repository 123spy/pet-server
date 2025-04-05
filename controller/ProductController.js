const ResultUtils = require("../common/ResultUtils");
const {Product, User} = require("../model");
const util = require("../utils");

exports.addProduct = async (req, res) => {
    try {
        const {
            productName,
            productPrice,
            productStock,
            productImages,
            productDescription,
            productTags
        } = req.body;

        if (util.isAnyBlank(productName)) {
            throw new Error("Parameter error");
        }

        // Create a new product
        const newProduct = new Product({
            productName,
            productPrice,
            productStock,
            productImages,
            productDescription,
            productTags
        });

        // Save the product
        await newProduct.save();

        res.status(200).send(ResultUtils.success(newProduct._id));
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to add, " + error.message : "Failed to add, please try again later"));
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const {id} = req.body;

        // Check if the product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            throw new Error("Product does not exist");
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        res.status(200).send(ResultUtils.success(true));
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to delete, " + error.message : "Failed to delete, please try again later"));
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const {
            id,
            productName,
            productPrice,
            productStock,
            productImages,
            productDescription,
            productTags
        } = req.body;

        console.log(
            id,
            productName,
            productPrice,
            productStock,
            productImages,
            productDescription,
            productTags
        );

        if (!id) {
            throw new Error("Product ID cannot be empty");
        }

        // Get existing product data
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            throw new Error("Product does not exist");
        }

        // Handle image update logic
        let finalProductImages = existingProduct.productImages || [];
        if (productImages !== undefined) {
            // If the frontend sends a new image array, use it
            if (Array.isArray(productImages)) {
                finalProductImages = productImages;
            }
            // If a single image string is sent, convert it to an array
            else if (typeof productImages === 'string') {
                finalProductImages = [productImages];
            }
            // Otherwise, keep the original value
        }

        // Build update object
        const updateData = {
            productName: productName !== undefined ? productName : existingProduct.productName,
            productPrice: productPrice !== undefined ? productPrice : existingProduct.productPrice,
            productStock: productStock !== undefined ? productStock : existingProduct.productStock,
            productImages: finalProductImages,
            productDescription: productDescription !== undefined ? productDescription : existingProduct.productDescription,
            productTags: productTags !== undefined ? productTags : existingProduct.productTags
        };

        // Validate data
        if (updateData.productName && util.isAnyBlank(updateData.productName)) {
            throw new Error("Product name cannot be empty");
        }
        if (updateData.productPrice !== undefined && updateData.productPrice < 0) {
            throw new Error("Product price cannot be negative");
        }
        if (updateData.productStock !== undefined && updateData.productStock < 0) {
            throw new Error("Product stock cannot be negative");
        }

        const updateResult = await Product.findByIdAndUpdate(
            id,
            updateData,
            {new: true}
        );

        res.status(200).send(ResultUtils.success(updateResult));
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to update, " + error.message : "Failed to update, please try again later"));
    }
};

exports.getProductById = async (req, res) => {
    try {
        const {id} = req.body; // Changed to get ID from req.params to follow RESTful principles

        // Use findById method to directly get a single product, instead of find
        const product = await Product.findById(id);

        if (!product) {
            throw new Error("Product does not exist");
        }

        res.status(200).send(ResultUtils.success(product));
    } catch (error) {
        console.error("Error getting product:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to get, " + error.message : "Failed to get, please try again later"));
    }
};

exports.getProductByPage = async (req, res) => {
    try {
        const { id, searchText, productName} = req.body;
        const current = parseInt(req.query.current, 10) || 1; // Get page number from query, default is 1
        const pageSize = parseInt(req.query.pageSize, 10) || 50; // Get page size from query, default is 50
        const skip = (current - 1) * pageSize;

        console.log(id, searchText, productName);

        // Construct query object dynamically based on provided parameters
        const query = {};

        if (id) {
            query._id = id;
        }

        // Use $or operator to combine multiple regex queries
        if (searchText) {
            query.$or = [
                { productName: { $regex: new RegExp(searchText, "i") } },
                { productDescription: { $regex: new RegExp(searchText, "i") } },
            ];
        }

        if (productName) {
            query.productName = { $regex: new RegExp(productName, "i") }; // 'i' flag for case-insensitive search
        }

        // Query paginated data
        const products = await Product.find(query).skip(skip).limit(pageSize);

        // Get total record count
        const total = await Product.countDocuments(query); // Note that query parameter also needs to be passed here

        // Calculate total pages, using Math.ceil to handle non-integer cases
        const totalPages = Math.ceil(total / pageSize);

        // Build response data
        const paginationResult = {
            pageSize, current, total, totalPages, records: products,
        };

        res.send(ResultUtils.success(paginationResult));
    } catch (error) {
        console.error("Error occurred while querying product list by pagination:", error);
        res.send(ResultUtils.error("Query exception"));
    }
};