'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   'meetmeinthemiddle-secret',

  FACEBOOK_ID:      '550878558385169',
  FACEBOOK_SECRET:  'e23e0f527ad1c93be7a78a40429f6a6a',

  TWITTER_ID:       'RTp9hnB4DYsaJcWRsB6eBW4CY',
  TWITTER_SECRET:   'qFkPI6RvUh1jSmaY1jXiwBs1ipQ5YF6unzQMWj11FoZuLWkWn6',

  GOOGLE_ID:        '904045696854-6ec041gm8if4m463v37mquogsqi3h8sa.apps.googleusercontent.com',
  GOOGLE_SECRET:    '904045696854-6ec041gm8if4m463v37mquogsqi3h8sa.apps.googleusercontent.com',

  AZURE_STORAGE_ACCOUNT: 'midup',
  AZURE_STORAGE_ACCESS_KEY: 'qCNxXUKd6+hzDKF+tdZ99jIDFor5Dadd9L9rLiaI7ullkVEZCoioxcyvRLgaedMdThWrYdtwonZsAmf89C2rpw==',
  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
