const success = (data) => {
    return {
        code: 0,
        msg: "success",
        data: data,
    }
}

const error = (message) => {
    return {
        code: 5000,
        msg: message,
        data: null,
    }
}

exports.success = success;
exports.error = error;