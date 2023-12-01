const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const config = require('config')
const{check, validationResult} = require('express-validator') 

const User = require('../models/User')
// @route POST Api/users
// @desc test route
// @access public
router.post('/', [
    check('name', 'name is required').not().isEmpty(), 
    check('email', 'please enter a valid email').isEmail(),
    check('password', 'please enter a passwor with6 or more characters').isLength({min:6})
], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    } 

    const {name, email, password} = req.body

    try{
        // check if user exists
        let user = await User.findOne({email})
        if(user){
            res.status(400).json({errors:[{msg: 'user already exists'}]})
        }

        // create gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r:'pg',
            d:'mm'
        })
        user=new User({
            name,
            email,
            avatar,
            password
        })

        // encrypt pasword

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        // save user
        await user.save()
        // return jwt
        const payload ={
            user:{
                id:user.id
            }
        }

      jwt.sign(payload, config.get('jwtSecret'), {expiresIn:360000}, (err, token) =>{
          if(err) throw err
          res.json({token})  
      })
    } catch(err){
     console.error(err.message)
     res.status(500).send('server error')
    }
 

})  

module.exports = router    