const {Comment, Image} = require('../models')

async function imageCounter() {
    return await Image.countDocuments();
}

async function commentsCounter() {
    return await Comment.countDocuments();
}

async function imageTotalViewsCounter() {

    try {
        const result = await Image.aggregate([{$group: {
            _id: '1',
            viewsTotal: {$sum: '$views'}
        }}])
        if (result) {
            return result[0].viewsTotal
        }
        else {
            return 0
        }
    } catch (error) {
        
    }
    
}

async function likesTotalCounter() {

    try {

        const result = await Image.aggregate([{$group: {
            _id: '1',
            likesTotal: {$sum: '$likes'}
        }}])    
        
        if (result)  {
            return result[0].likesTotal 
        }
        else {
            return 0
        }
        
    } catch (error) {
        console.log(error)
    }

    
}

module.exports = async () => {

    const results = await Promise.all([
        imageCounter(),
        commentsCounter(),
        imageTotalViewsCounter(),
        likesTotalCounter()
    ])

    return {
        image: results[0],
        comments: results[1],
        views: results[2],
        likes: results[3]
    } 

}