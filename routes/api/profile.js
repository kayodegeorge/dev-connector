const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const Profile = require('../models/Profile')
const User = require('../models/User')
// @route get Api/profile/me
// @desc get current users profile
// @access private
router.get('/me', auth, async (req,res)=>{
  try{ 
    const profile = await Profile.findOne({
        user:req.user.id}).populate('user',['name', 'avatar'])
        if(!profile){
            return res.status(400).json({msg:'there is no profile for this user'})
        }
        res.json(profile)
  } catch(err){
      console.error(err.message)
      res.status(500).send('server error')
  }
}) 

// @route get Api/profile/me
// @desc get current users profile
// @access private

router.post('/', [auth,[check('status', 'status is required').not().isEmpty(),check('skills', 'skills is required').not().isEmpty()]], async(req,res)=>{
    const errors = validationResult(req)
     if(!errors.isEmpty()){
         return res.status(400).json({erors:errors.array()})
     }

    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    const profileFields={}
    profileFields.user = req.user.id
    if(company)profileFields.company=company
    if(website)profileFields.website=website
    if(location)profileFields.location=location
    if(bio)profileFields.bio=bio
    if(status)profileFields.status=status
    if(githubusername)profileFields.githubusername=githubusername
    if(skills){
        profileFields.skills=skills.split(',').map(skill=>skill.trim())
    }

    // build social object
    profileFields.social={}
    if(youtube)profileFields.social.youtube=youtube
    if(twitter)profileFields.social.twitter=twitter
    if(facebook)profileFields.social.facebook=facebook
    if(linkedin)profileFields.social.linkedin=linkedin
    if(instagram)profileFields.social.instagram=instagram 

   try{
     let profile = await Profile.findOne({user:req.user.id})
     if(profile){
        //  update
        profile = await Profile.findOneAndUpdate({user:req.user.id}, {$set:profileFields},
            {new:true})
            return res.json(profile)
     }

    //  create
    profile=new Profile(profileFields)
    await profile.save()
    res.json(profile)
                 
   } catch(err){ 
       console.error(err.message)
       res.status(500).send('server error')
   }
})  

// @route get Api/profile/me
// @desc get all profile
// @access public
router.get('/', async(req,res)=>{
  try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar'])
      res.json(profiles)
  } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
  }    
})

// @route get Api/profile/user/
// @desc get profile 
// @access public
// router.get
// router.get('/user/:user_id', async(req,res)=>{
//     try {
//         const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar'])
//         if(!profile) return res.status(400).json({msg:'there is no profile for this user'})
//         res.json(profiles)
//     } catch (err) {
//         console.error(err.message)
//         res.status(500).send('server error')
//     } 
//   })

module.exports = router 