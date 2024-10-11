const express = require('express');
const auth = require('../middleware/auth');
const { upload, linkImage } = require('../middleware/multer-config');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload.single("image"), linkImage, bookCtrl.createBook);
router.put('/:id', auth, upload.single("image"), linkImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.createRating);

module.exports = router;