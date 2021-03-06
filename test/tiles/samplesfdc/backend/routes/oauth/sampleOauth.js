var util = require('util');
var jive = require(process.cwd() + '/../api');

var sdkInstance = require(process.cwd() + '/../routes/oauth');

var myOauth = Object.create(sdkInstance);

module.exports = myOauth;

var tokenStore = jive.service.persistence();

/////////////////////////////////////////////////////////////
// overrides jive-sdk/routes/oauth.js to do something useful,
// like storing access token for the viewer

myOauth.oauth2SuccessCallback = function( state, originServerAccessTokenResponse, callback ) {
    console.log('State', state);
    console.log('originServerAccessTokenResponse', originServerAccessTokenResponse);
    tokenStore.save('tokens', state['viewerID'], {
        ticket : state['viewerID'],
        accessToken: originServerAccessTokenResponse['entity']
    }).then( function() {
        callback({'ticket': state['viewerID'] });
    });
};

myOauth.getTokenStore = function() {
    return tokenStore;
};
