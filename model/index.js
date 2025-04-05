const mongoose = require("mongoose");
const {dbURL} = require("../config/config.default");

// Connect to MongoDB database
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

// Connection failed
db.on("error", (err) => {
    console.log("MongoDB database connection failed");
});

// Connection successful
db.on("open", () => {
    console.log("MongoDB database connection successful");
});

module.exports = {
    User: mongoose.model("User", require("./User")),
    Product: mongoose.model("Product", require("./Product")),
    Cart: mongoose.model("Cart", require("./Cart")),
};