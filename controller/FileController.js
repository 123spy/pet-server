const ResultUtils = require("../common/ResultUtils");
const {Category} = require("../model");
const util = require("../utils");
const multer = require('multer');
const COS = require('cos-nodejs-sdk-v5');
const {v4: uuidv4} = require('uuid');
const config = require('../config/config.default');
const {extname} = require("path"); // Import configuration

// Initialize COS client
const cos = new COS({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
});

exports.uploadFile = async (req, res) => {
    try {
        // Get the uploaded file
        const file = req.file;
        if (!file) {
            throw new Error("Uploaded file is empty");
        }

        // Generate a unique name
        const uniqueFileName = `${uuidv4()}`;

        await new Promise((resolve, reject) => {
            cos.putObject({
                Bucket: config.Bucket,
                Region: config.Region,
                Key: uniqueFileName,
                Body: file.buffer,
                StorageClass: 'STANDARD',
                onProgress: function (progressData) {
                    console.log(JSON.stringify(progressData));
                }
            }, function (err, data) {
                if (err) {
                    console.error(err);
                    return reject(new Error("Failed to upload to COS"));
                }
                console.log('Upload Success:', data);
                resolve(data);
            });
        });

        // Return the file URL to the frontend
        const fileUrl = `https://${config.Bucket}.cos.${config.Region}.myqcloud.com/${uniqueFileName}`;

        res.status(200).send(ResultUtils.success(fileUrl));
    } catch (error) {
        console.error("Upload error:", error.message);
        res.send(ResultUtils.error(error.message ? "Upload failed, " + error.message : "Upload failed, please try again later"));
    }
};