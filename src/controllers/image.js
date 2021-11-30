const path = require('path')
const md5 = require('md5')
const { randomNumber } = require('../helpers/libs')
const fs = require('fs-extra')
const cloudinary = require('cloudinary');
const ctrl = {}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const { Image, Comment } = require('../models')
const sidebar = require('../helpers/sidebar')
ctrl.index = async (req, res) => {
    let viewModel = {image: {}, comments: {}}
    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    if (image) {
        image.views = image.views + 1
        viewModel.image = image
        image.save()
        const comments = await Comment.find({image_id: image._id})
        viewModel.comments = comments
        viewModel = await sidebar(viewModel)
        res.render('image', viewModel)
    } else {
        res.redirect('/')
    }
    
}

ctrl.create = async (req, res) => {

    const saveImage = async () => {

        try {
            const imgUrl = randomNumber()
        const images = await Image.find({filename: imgUrl})
        if (images.length > 0) {
            saveImage()
        } else {
            console.log(imgUrl)
            const imageTempPath = req.file.path
            const ext = path.extname(req.file.originalname).toLowerCase()
            const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`)

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imageTempPath, targetPath)
                const result = await cloudinary.v2.uploader.upload(targetPath, {
                    folder: 'ImgShare'
                })

                console.log(result)
                const newImg = new Image({
                    title: req.body.title,
                    filename: result.original_filename,
                    description: req.body.description,
                    image_url: result.secure_url
                })
                await newImg.save()
                await fs.unlink(targetPath)
                res.redirect('/images/' + imgUrl)
            } else {
                await fs.unlink(imageTempPath)
                res.status(500).json({error: 'Only images are allowed'})
            }
        }
        } catch (error) {
            console.log(error)
        }
        
    }
    saveImage()
    
}

ctrl.like = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    if (image) {
        image.likes = image.likes + 1
        image.save()
        res.json({likes: image.likes})
    } else {
        res.status(500).json({error: 'Internal Error'})
    }
}

ctrl.comment = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    if (image) {
        const newComment = new Comment(req.body)
        newComment.gravatar = md5(newComment.email)
        newComment.image_id = image._id
        await newComment.save()
        res.redirect('/images/' + image.uniqueId)
    } else {
        res.redirect('/')
    }
    
    
    res.send('Comment')
}

ctrl.remove = async (req, res) => {
    const image =await  Image.findOne({filename: {$regex: req.params.image_id}})
    if (image) {
        await fs.unlink(path.resolve(`./src/public/upload/${image.filename}`))
        const result = await cloudinary.v2.uploader.destroy(image.public_id)
        await Comment.deleteOne({image_id: image._id})
        await image.remove()
        res.json(true)
    }
}

module.exports = ctrl