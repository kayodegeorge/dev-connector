const express = require('express')
const router = express.Router()

// @route get Api/posts
// @desc test route
// @access public
router.get('/', (req,res)=>res.send('Posts route'))  

module.exports = router 