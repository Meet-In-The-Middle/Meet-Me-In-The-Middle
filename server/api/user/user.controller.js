'use strict';
//NOTE: These will be moved to enviromental variables when deployed
//Also will remove them from createBlobService... so it will read   ...createBlobService()...
var AZURE_STORAGE_ACCOUNT='midup';
var AZURE_STORAGE_ACCESS_KEY='qCNxXUKd6+hzDKF+tdZ99jIDFor5Dadd9L9rLiaI7ullkVEZCoioxcyvRLgaedMdThWrYdtwonZsAmf89C2rpw==';



var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var azure = require('azure-storage');
var retryOperations = new azure.ExponentialRetryPolicyFilter();
var blobSvc = azure.createBlobService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY).withFilter(retryOperations);
blobSvc.createContainerIfNotExists('userpictures', {publicAccessLevel: 'blob'}, function(error, result, response) {
  if (!error) {
    console.log(result);
    console.log(response);
  } else {
    console.log('error creating azure blob container ', error);
  }
});

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.imageUrl = '';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

/**
 *
 * @param req
 * @param res
 * @param imageName
 * @param cb  :  send the azure blob image url back to client after it saves successfully
 */
exports.uploadUserImage = function(userId, imageName, cb) {
  var localPath = './server/uploads/' + imageName;
  blobSvc.createBlockBlobFromLocalFile('userpictures', imageName, localPath, function(error, result, response) {
    if (!error) {
      console.log('file uploaded');
      cb();
      var imageUrl = 'http://midup.blob.core.windows.net/userpictures/' + result.blob;
      exports.updateImageUrl(userId, imageUrl);
    } else {
      console.log('error on image upload is ', error);
      return error;
    }
  });
};
/**
 * Update or store the imageUrl for user in User Collection
 * @param userId
 * @param url
 */
exports.updateImageUrl = function(userId, url) {
  var userId = userId;
  var url = url;
  User
    .findOne({
      _id: userId
    }, function(err, user) {
      user.imageUrl = url;
      user.save();
      if( err ) {
        console.log('error updating ImageUrl in mongoDB for user', err);
        return err;
      } else {
        //console.log('successfully updated User with imageUrl');
      }
    });
};

/**
 * Get user profile image url
 */
exports.getImageUrl = function(req, res, next) {
  console.log('called getImageUrl');
  var userId = req.url.split('/')[2];
  console.log('userId is ', userId);
  User.findOne({
      _id: userId
    }, function(err, user){
      var imageUrl = user.imageUrl || '';
      if ( user && imageUrl ){
        console.log('user data is ', user);
        res.send(user.imageUrl);
      } else {
        //if user does not yet have an image uploaded, send generic user icon image
        res.send('http://midup.blob.core.windows.net/userpictures/user-icon.png');
      }
    });
};



