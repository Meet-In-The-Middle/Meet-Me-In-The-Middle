var sendgrid  = require('sendgrid')(process.env.SEND_GRID_ACCOUNT, process.env.SEND_GRID_PASSWORD);


/**
 * @desc  Connects to Send Grid account and sends email invites to list of emails provided
 * @param data: Array of emails
 * @param roomId: String
 * @param username: STring
 * @param roomName: STring
 */
exports.sendGridEmailInvite = function(data, roomId, username, roomName) {
  console.log('999email invite data is ', data, roomId, username, roomName);
  var params = {
    from: 'jsnisenson@gmail.com',
    subject: 'Invitation to MidUp',
    html: 'Hello, <br><br> ' +
    'You have been invited by ' + username + ' to be a part of this MidUp <a href="' + process.env.DOMAIN + '/mymidups/' + roomId + '">' + roomName + '</a><br><br>' +
    'MidUp helps you, your colleagues and your friends interactively find the perfect place to meet up in the middle.' + '<br><br>' +
    'If the link above does not work, copy and paste this link into a browser to join the MidUp:' + '<br><br>' +
    '' + process.env.DOMAIN + '/mymidups/' + roomId + '' + '<br><br>' +
    '- The MidUp Team'
  };
  var email = new sendgrid.Email(params);
  //addTo sends email to everyone in the array but independently (i.e. user won't see other users emails)
  email.addTo(data);
  //send emails and send back to
  sendgrid.send(email, function(err, json) {
    if(err) {console.log('sendgrid error ', err); }
    //Add user to DB as invited
    //var invited =
    console.log('////////sendgrid json ', json);
  });
};


