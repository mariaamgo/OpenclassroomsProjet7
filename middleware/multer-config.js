const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const linkImage = async(req, res, next) => {
    const imagesDir = path.join(__dirname, '../images'); 
    fs.access(imagesDir, (error) => {
        if (error) {
          fs.mkdirSync(imagesDir);
        }
    });
    const { buffer, originalname } = req.file;
    const timestamp = Date.now();
    const fileName = `${originalname.split(' ').join('_')}-${timestamp}.webp`;
    await sharp(buffer)
        .webp({ quality: 20 })
        .toFile("./images/" + fileName);
    req.processedImageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`
    next();
}

module.exports = {upload, linkImage};