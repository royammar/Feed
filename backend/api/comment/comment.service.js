
const dbService = require('../../services/db.service')
const reviewService = require('../review/review.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByEmail,
    remove,
    update,
    add
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    console.log(criteria);
    
    const collection = await dbService.getCollection('comment')
    try {
        const comments = await collection.find(criteria).toArray();
      
        return comments
    } catch (err) {
        console.log('ERROR: cannot find comments')
        throw err;
    }
}

async function getById(commentId) {
    const collection = await dbService.getCollection('comment')
    try {
        const comment = await collection.findOne({"_id":ObjectId(commentId)})
        delete comment.password

        comment.givenReviews = await reviewService.query({byCommentId: ObjectId(comment._id) })
        comment.givenReviews = comment.givenReviews.map(review => {
            delete review.byComment
            return review
        })


        return comment
    } catch (err) {
        console.log(`ERROR: while finding comment ${commentId}`)
        throw err;
    }
}
async function getByEmail(email) {
    const collection = await dbService.getCollection('comment')
    try {
        const comment = await collection.findOne({email})
        return comment
    } catch (err) {
        console.log(`ERROR: while finding comment ${email}`)
        throw err;
    }
}

async function remove(commentId) {
    const collection = await dbService.getCollection('comment')
    try {
        await collection.deleteOne({"_id":ObjectId(commentId)})
    } catch (err) {
        console.log(`ERROR: cannot remove comment ${commentId}`)
        throw err;
    }
}

async function update(comment) {
    const collection = await dbService.getCollection('comment')
    comment._id = ObjectId(comment._id);

    try {
        await collection.replaceOne({"_id":comment._id}, {$set : comment})
        return comment
    } catch (err) {
        console.log(`ERROR: cannot update comment ${comment._id}`)
        throw err;
    }
}

async function add(comment) {
    const collection = await dbService.getCollection('comment')
    try {
        await collection.insertOne(comment);
        return comment;
    } catch (err) {
        console.log(`ERROR: cannot insert comment`)
        throw err;
    }
}

function _buildCriteria(filterBy) {
    console.log(filterBy,'critearia');
    
    const criteria = {};
        criteria.comment ={$regex :`.*${filterBy.comment}.*`}
    
    
    return criteria;
}


