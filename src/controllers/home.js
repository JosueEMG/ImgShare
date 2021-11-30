const ctrl = {}

const { Image } = require('../models')
const slidebar = require('../helpers/sidebar')

ctrl.index = async (req, res) => {
    const images = await Image.find().sort({timestamp: -1})
    let viewModel = {images: []}
    viewModel.images = images
    viewModel = await slidebar(viewModel)
    res.render('index', viewModel)
}

module.exports = ctrl