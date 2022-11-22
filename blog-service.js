const Sequelize = require('sequelize');
var sequelize = new Sequelize('deorj85qshvmte', 'epuritzoxgtctd', '71bfc6ad20969517153d338344122cadc7b1d2caa12d9ee8e672d52535a57eab', {
    host: 'ec2-54-165-90-230.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function () {
        return new Promise((resolve, reject) => {
            sequelize.sync()
            .then(resolve('database synced'))
            .catch(reject('unable to sync the database'));
        }); 
}

module.exports.getAllPosts = function () {
        return new Promise((resolve, reject) => {
            sequelize.sync()
            .then(resolve(Post.findAll()))
            .catch(reject('no results returned'));
    });
}

module.exports.getCategories = function () {
        return new Promise((resolve, reject) => {
            Category.findAll()
            .then(resolve(Category.findAll()))
            .catch(reject('no results returned'));
    });
}

module.exports.getPublishedPosts = function(){
        return new Promise((resolve, reject) => {
            Post.findAll({
                where:{
                    published: true
                }
            })
            .then(resolve(Post.findAll({where: {published: true}})))
            .catch(reject('no results returned'));
    });
}

module.exports.addPost = function(postData) {
        return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var i in postData) {
            if (postData[i].title == "") { postData[i].title = null; }
        }
        postData.postDate = new Date();
        Post.create(postData)
        .then(resolve(Post.findAll()))
        .catch(reject('unable to create post'))
    })
};

module.exports.getPostsByCategory = function(category) {
        return new Promise((resolve, reject) => {
            Post.findAll({
                where:{
                    category: category
                }
            })
            .then(resolve(Post.findAll({ where: { category: category}})))
            .catch(reject('no results returned'))
        })
}

module.exports.getPostsByMinDate = function(minDateStr) {
        const { gte } = Sequelize.Op;
        return new Promise((resolve, reject) => {
            Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            })   
            .then(resolve(Post.findAll({where: {[gte]: new Date(minDateStr)}})))
            .catch(reject('no results returned'));
    });
}

module.exports.getPostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id: id
            }
        })
        .then(resolve(Post.findAll({ where: { id: id}})))
        .catch(reject('no results returned'))
    })
}

module.exports.getPublishedPostsByCategory = function(category) {
            return new Promise((resolve, reject) => {
                Post.findAll({
                    where:{
                        category: category,
                        published: true
                    }
                })
                .then(resolve(Post.findAll({ where: { category: category, published: true}})))
                .catch(reject('no results returned'))
            })
}

module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null; }
        }
        Category.create(categoryData)
        .then(resolve())
        .catch(reject('unable to create category'))
    })
}

module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
                where:{
                    id: id
                }
            })
        })
        .then(data => {resolve();})
        .catch(err => reject('Reject'))
}


module.exports.deletePostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
                where:{
                    id: id
                }
            })
        })
        .then(data => resolve())
        .catch(err => reject('Reject'))
}