const ResultUtils = require("../common/ResultUtils");
const {Cart, Product, Order} = require("../model");

exports.addCart = async (req, res) => {
    try {
        const {productId} = req.body;

        // Verify if the product exists
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            throw new Error("Product does not exist");
        }

        // Get user information from the session
        const sessionUser = req.session.user;
        if (!sessionUser) {
            throw new Error("User is not logged in");
        }

        // Check if the product is already in the user's cart
        const existingCartItem = await Cart.findOne({
            userId: sessionUser._id,
            productId: productId
        });

        if (existingCartItem) {
            return res.send(ResultUtils.error("This product is already in the cart"));
        }

        // Create and save the new cart item
        const newCart = new Cart({
            userId: sessionUser._id,
            productId: productId,
            createdAt: new Date() // Add creation time
        });

        await newCart.save();

        res.status(200).send(ResultUtils.success(newCart._id));
    } catch (error) {
        console.error("Add to cart error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to add, " + error.message : "Failed to add, please try again later"));
    }
};

exports.deleteCart = async (req, res) => {
    try {
        const {id} = req.body;

        // Check if the cart item exists
        const existingCart = await Cart.findById(id);
        if (!existingCart) {
            throw new Error("The product is not in the cart");
        }

        // Delete the cart item
        await Cart.findByIdAndDelete(id);

        res.status(200).send(ResultUtils.success(true));
    } catch (error) {
        console.error("Delete cart item error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to delete, " + error.message : "Failed to delete, please try again later"));
    }
};

exports.updateCart = async (req, res) => {
    try {
        const {
            id, userId, productId
        } = req.body;

        let updateData = {userId, productId};

        const updateResult = await Cart.findByIdAndUpdate(
            id,
            updateData,
            {new: true}, // Return the updated document
        );

        if (!updateResult) {
            throw new Error("Cart item does not exist");
        }

        res.status(200).send(ResultUtils.success(updateResult));
    } catch (error) {
        console.error("Update cart item error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to update, " + error.message : "Failed to update, please try again later"));
    }
};

exports.getCartByPage = async (req, res) => {
    try {
        const {id, userId, productId} = req.body;
        const current = parseInt(req.query.current, 10) || 1; // Get page number from query, default is 1
        const pageSize = parseInt(req.query.pageSize, 10) || 50; // Get page size from query, default is 50
        const skip = (current - 1) * pageSize;

        // Construct query conditions
        const query = {};

        if (id) {
            query._id = id;
        }

        if (userId) {
            query.userId = userId;
        }

        if (productId) {
            query.productId = productId;
        }

        // Query paginated data
        const carts = await Cart.find(query)
            .skip(skip)
            .limit(pageSize);

        // Concurrently query product information for each cart item
        const cartList = await Promise.all(carts.map(async (cart) => {
            let product = null;
            if (cart.productId) {
                product = await Product.findById(cart.productId);
            }
            return {
                ...cart.toObject(),
                product: product ? {
                    _id: product._id,
                    productName: product.productName,
                    productPrice: product.productPrice,
                    productStock: product.productStock,
                    productImages: product.productImages,
                    productDescription: product.productDescription,
                    productTags: product.productTags,
                } : null,
            };
        }));

        // Get total record count
        const total = await Cart.countDocuments(query); // Note: Pass query parameter here

        // Calculate total pages, using Math.ceil to handle non-integer cases
        const totalPages = Math.ceil(total / pageSize);

        // Build response data
        const paginationResult = {
            pageSize,
            current,
            total,
            totalPages,
            records: cartList
        };

        res.send(ResultUtils.success(paginationResult));
    } catch (error) {
        console.error("Error occurred while querying cart list by pagination:", error);
        res.send(ResultUtils.error("Query exception"));
    }
};