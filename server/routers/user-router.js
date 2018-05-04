const User = require('../models/User.js');
const express = require('express');
const router = express.Router();

// Controller
const userController = {};

userController.addUser = (o, callback) => {
    let user = new User(o);
    user.save( (error,  user) => {
        callback(error, user);
    })
};

userController.getUser = (email, password, callback ) => {
    User.findOne({email : email, password: password}, (error, user) => {
        let response = {};
        if(user) response = {
            authenticated : true,
            user
        };
        else response = {
            authenticated : false,
        };
        callback(error, response);
    });
};

userController.searchUsers = (keyword, callback) =>{
    keyword = new RegExp('.*' + keyword + '.*', 'i');
    User.find({ $or: [ {firstname: keyword}, {lastname: keyword}, {email: keyword} ]}, {password: 0, following: 0, followers: 0, closet: 0}, (error, result) => {
        callback(error, result);
    });
};

userController.getAllUsers = (callback) => {
    User.find({}, (error, users) => {
        callback(error, users);
    })
};

userController.deleteUser = (id, callback) => {
    User.findByIdAndRemove(id, (err, user) => {
        let response = {
            message : 'Removed Succefully',
            id : user._id
        };
        callback(err, response);
    });
};

userController.followUser = (id, toFollow, callback) => {
    User.findOneAndUpdate({_id: toFollow}, {$addToSet:{followers :id}}).exec();
    User.findOneAndUpdate({_id: id}, {$addToSet:{following :toFollow}},{new : true}, (err, user) => {
        callback(err, user);
    });
};

userController.unfollowUser = (id, toUnfollow, callback) => {
    User.findOneAndUpdate({_id: toUnfollow}, {$pull:{followers: id}}).exec();
    User.findOneAndUpdate({_id: id}, {$pull:{following: toUnfollow}},{new: true}, (error, user) => {
        callback(error, user);
    });
};

userController.getFollowing = (id, callback) => {
    User.findOne({_id: id}, {following: 1}).populate('following').exec((error, following) => {
        callback(error, following);
    });
};

userController.addClothing = (userId, clothing, callback) => {
    User.findOneAndUpdate({_id : userId}, {$push : {closet: clothing}}, {new : true, fields : {closet: 1}}, (error, result) => {
        callback(error, result);
    });
};

userController.removeClothing = (userId, clothingId, callback) => {
    User.findOneAndUpdate({_id: userId}, {$pull : {closet: {_id : clothingId}}}, {new : true, fields: {closet: 1}}, (error, retult) => {
        callback(error, retult);
    });
};



// Router

router.get('/', (req, res) => {
    userController.getAllUsers((error, users) => {
        if (error) throw error;
        res.json(users);
    });
});

router.post('/', (req, res) => {
   userController.addUser(req.body, (error, user ) => {
        if (error) throw error;
        res.json(user);
    });
});

router.post('/login', (req, res) => {
    userController.getUser(req.body.email, req.body.password, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

router.get('/:id/following', (req, res) => {
   userController.getFollowing(req.params.id, (error, following) => {
        if (error) throw error;
        res.json(following);
   });
});

router.delete('/:id', (req, res) => {
    userController.deleteUser(req.params.id, (error, response) => {
        if (error) throw error;
        res.json(response)
    });
});

router.put('/:id/follow', (req, res) => {
    console.log(req.params.id)
    console.log(req.body._id)
    userController.followUser(req.params.id, req.body._id, (error, user) => {
        if(error) throw error;
        res.json(user)
    });
});

router.put('/:id/unfollow', (req, res) => {
    userController.unfollowUser(req.params.id, req.body._id, (error, user) => {
        if (error) throw error;
        res.json(user);
    });
});

router.post('/:id/closet', (req, res) => {
    userController.addClothing(req.params.id, req.body, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

router.delete('/:id/closet/:clothing', (req, res) => {
    userController.removeClothing(req.params.id, req.params.clothing, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

router.get('/:keyword/search', (req, res) => {
    userController.searchUsers(req.params.keyword, (error, result) => {
        if (error) throw error;
        res.json(result);
    });
});

module.exports = router;