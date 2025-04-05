const ResultUtils = require("../common/ResultUtils");
const {User} = require("../model");
const util = require("../utils");

exports.userRegister = async (req, res) => {
    try {
        const {userAccount, userPassword, checkPassword} = req.body;

        console.log(userAccount, userPassword, checkPassword);

        if (util.isBlankStr(userAccount) || util.isBlankStr(userAccount) || util.isBlankStr(checkPassword)) {
            console.log("Parameters are empty");
            throw new Error("Parameters are empty");
        }

        // Verify if passwords match
        if (userPassword !== checkPassword) {
            throw new Error("Passwords do not match");
        }

        // Check if the user account already exists
        const existingUser = await User.findOne({userAccount});
        if (existingUser) {
            throw new Error("This account is already registered");
        }

        // Prepare user data, using a random string as the default username
        const newUser = new User({
            userName: util.generateRandomString(),
            userAccount,
            userPassword, // Note: Storing plaintext passwords is insecure; use bcrypt or similar for encryption
        });

        // Save the new user to the database
        await newUser.save();

        // Successful response with the new user's _id
        res.status(200).send(ResultUtils.success(newUser._id));
    } catch (error) {
        console.error("User registration error:", error.message);
        res.send(ResultUtils.error(error.message ? "Registration failed, " + error.message : "Registration failed, please try again later"));
    }
};

exports.userLogin = async (req, res) => {
    try {
        const {userAccount, userPassword} = req.body;

        console.log(userAccount, userPassword);

        // Query the user account
        const existingUser = await User.findOne({userAccount});

        // Account does not exist
        if (!existingUser) {
            throw new Error("Account does not exist");
        }

        // Validate password
        const isPasswordValid = userPassword === existingUser.userPassword;
        if (!isPasswordValid) {
            throw new Error("Incorrect password");
        }

        // On successful login, store user information in the session
        req.session.user = {
            _id: existingUser._id,
            userName: existingUser.userName, // Assuming there is a userName field
            userAccount,
        };

        res.status(200).send(ResultUtils.success(existingUser));
    } catch (error) {
        console.error("User login error:", error.message);
        res.send(ResultUtils.error(error.message ? "Login failed, " + error.message : "Login failed, please try again later"));
    }
};

exports.userLogout = async (req, res) => {
    try {
        // Check if there is user information in the session
        if (!req.session.user) {
            throw new Error("User is not logged in");
        }

        // Clear the user information in the session to log out
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session during logout:", err);
                throw new Error("System error, operation failed");
            }
            // Respond after successfully clearing the session
            res.status(200).send(ResultUtils.success("Logged out successfully"));
        });
    } catch (error) {
        console.error("User logout error:", error.message);
        res.send(ResultUtils.error(error.message ? "Logout failed, " + error.message : "Logout failed, please try again later"));
    }
};

exports.getLoginUser = async (req, res) => {
    try {
        // Get user information directly from the session
        const sessionUser = req.session.user;

        // Check if there is user information in the session
        if (!sessionUser) {
            throw new Error("User is not logged in");
        }

        let user = await User.findById(sessionUser._id);

        console.log("Get logged-in user:", user);

        res.status(200).send(ResultUtils.success(user));
    } catch (error) {
        console.error("Get logged-in user error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to get, " + error.message : "Failed to get, please try again later"));
    }
};

exports.addUser = async (req, res) => {
    try {
        const {userName, userAccount, userPassword} = req.body;

        if (util.isAnyBlank(userName, userAccount, userPassword)) {
            throw new Error("Parameter error");
        }

        // Check if the account already exists
        const existingUser = await User.findOne({userAccount});
        if (existingUser) {
            throw new Error("Account is already registered");
        }

        // Create and save the new user
        const newUser = new User({userName, userAccount, userPassword: userPassword});
        await newUser.save();

        res.status(200).send(ResultUtils.success(newUser._id));
    } catch (error) {
        console.error("Add user error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to add, " + error.message : "Failed to add, please try again later"));
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const {id} = req.body; // Assume ID is retrieved from request parameters, following RESTful style

        // Check if the user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
            throw new Error("Account is not registered");
        }

        // Delete the user
        await User.findByIdAndDelete(id);

        res.status(200).send(ResultUtils.success(true));
    } catch (error) {
        console.error("Delete user error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to delete, " + error.message : "Failed to delete, please try again later"));
    }
};

exports.updateUser = async (req, res) => {
    try {
        const {id, userName, userPassword, userProfile, userRole} = req.body;

        // Ensure at least one field is provided for update
        if (!id || ![userName, userPassword, userProfile, userRole].some((field) => field !== undefined)) {
            throw new Error("ID and at least one field for update must be provided");
        }

        // If updating the password, handle encryption (simplified here for demonstration)
        let updateData = {userName, userProfile, userRole};

        const updateResult = await User.findByIdAndUpdate(
            id,
            updateData,
            {new: true}, // Return the updated document
        );

        if (!updateResult) {
            throw new Error("User does not exist");
        }

        res.status(200).send(ResultUtils.success(updateResult));
    } catch (error) {
        console.error("Update user error:", error.message);
        res.send(ResultUtils.error(error.message ? "Failed to update, " + error.message : "Failed to update, please try again later"));
    }
};

/**
 * Get user by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.getUserById = async (req, res) => {
    try {
        const {id} = req.body; // Changed to get ID from req.params to follow RESTful principles

        // Use findById method to directly get a single user, instead of find
        const user = await User.findById(id);

        if (!user) {
            return res.send(ResultUtils.error("User not found"));
        }

        res.send(ResultUtils.success(user));
    } catch (error) {
        console.error("Error occurred while getting user by ID:", error);
        res.send(ResultUtils.error("Failed to get, please try again later"));
    }
};

exports.getUserByPage = async (req, res) => {
    try {
        const {id, userName, userRole, userProfile} = req.body;
        const current = parseInt(req.query.current, 10) || 1; // Get page number from query, default is 1
        const pageSize = parseInt(req.query.pageSize, 10) || 50; // Get page size from query, default is 50
        const skip = (current - 1) * pageSize;

        // Construct query object dynamically based on provided parameters
        const query = {};

        if (id) {
            query._id = id;
        }

        if (userName) {
            query.userName = {$regex: new RegExp(userName, "i")}; // 'i' flag for case-insensitive search
        }

        if (userRole) {
            query.userRole = {$regex: new RegExp(userRole, "i")}; // 'i' flag for case-insensitive search
        }

        if (userProfile) {
            query.userProfile = {$regex: new RegExp(userProfile, "i")}; // 'i' flag for case-insensitive search
        }

        // Query paginated data
        const users = await User.find(query).skip(skip).limit(pageSize);

        // Get total record count
        const total = await User.countDocuments();

        // Calculate total pages, using Math.ceil to handle non-integer cases
        const totalPages = Math.ceil(total / pageSize);

        // Build response data
        const paginationResult = {
            pageSize,
            current,
            total,
            totalPages,
            records: users,
        };

        res.send(ResultUtils.success(paginationResult));
    } catch (error) {
        console.error("Error occurred while querying user list by pagination:", error);
        res.send(ResultUtils.error("Query exception"));
    }
};