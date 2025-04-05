const util = require("util");

module.exports = () => {
    return (error, request, response, next) => {
        return response.status(500).json({
            error: util.format(error),
        })
    }
}