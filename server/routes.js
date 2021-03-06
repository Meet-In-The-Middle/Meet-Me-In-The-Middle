/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var userCtrl = require('./api/user/user.controller');
var fs = require('fs');
var multer = require('multer');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/rooms', require('./api/rooms'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('api/rooms', require('./api/rooms'));


  app.post('/userimage',  function(req, res) {
    userCtrl.updateImageUrl(req, res);
  });
  app.get('/userimage/*',  function(req, res) {
    userCtrl.getImageUrl(req, res);
  });




  //user image file upload using multer middleware; image is checked for size (500kb),
  //then uploaded to Azure blob storage and the url for location on blob storage returned to client
  var isFileTooLarge;
  app.post('/user/image', [multer({
    dest: './server/uploads/',
    limits: {
      fileSize: 500000
    },
    rename: function (fieldname, filename, req, res) {
      console.log('req.body', req.body);
      var userId = req.body.userId;
      return userId + '001';
    },
    onFileSizeLimit: function (file) {
      isFileTooLarge = true;
    },
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file, req, res) {
      console.log(file.fieldname + ' uploaded to  ' + file.path);
      var newFileName = req.files.file[0].name;
      if (!isFileTooLarge) {
        userCtrl.uploadUserImage(req.body.userId, newFileName, function () {
          //file parameter is actually an object with the path as a property
          file.path = 'http://midup.blob.core.windows.net/userpictures/' + newFileName;
          res.send(file);
          //delete file from local uploads folder
          fs.unlink('./server/uploads/' + newFileName);
        });
      } else {
        fs.unlink('./server/uploads/' + newFileName);
      }
    }
  }),
    function(req, res) {
      if( isFileTooLarge ) {
        console.log('123321 error');
        res.json({
          uploadError: 'Upload failed. File must be less than 500 KB'
        });
        isFileTooLarge = false;
      }
    }]);

  //route for authorization
  app.use('/auth', require('./auth'));


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
