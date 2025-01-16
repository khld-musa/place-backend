const express = require('express')
const router = express.Router();


const {
    getUserImages
} = require('../controllers/imageController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/userImages/:file').get(getUserImages);

module.exports = router;