// Check if a string is empty
const isBlankStr = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim().length === 0) || // Check if it's an empty string, using trim() to remove leading/trailing spaces
        (Array.isArray(value) && value.length === 0) || // Check if it's an empty array
        (typeof value === 'object' && Object.keys(value).length === 0) // Check if it's an empty object
    );
}

const isAnyBlank = (...args) => {
    // Use some method to iterate through all arguments
    // Check if each argument is undefined, null, or an empty string
    return args.some(arg => arg === undefined || arg === null || arg === "");
}

const generateRandomString = () => {
    // Prefix
    const prefix = "User";

    // Character set: includes all uppercase letters, lowercase letters, and digits
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    // Generate a 6-character random string
    for (let i = 0; i < 6; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length);
        randomString += chars[randomNumber];
    }

    // Return the combined string
    return prefix + randomString;
}

module.exports = {isBlankStr, generateRandomString, isAnyBlank};