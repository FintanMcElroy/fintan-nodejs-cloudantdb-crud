'use strict'
const cookieParser = require('cookie-parser')
const session = require('express-session')

module.exports = class SSOUtils {
  constructor(credsSSO){
    this.creds = credsSSO
  }

  setupSSO(app, cb){
    const client_id = this.creds.clientId
    const client_secret = this.creds.secret
    const authorization_url = this.creds.authorizationEndpointUrl
    const token_url = this.creds.tokenEndpointUrl
    const issuer_id = this.creds.issuerIdentifier
    // needed for SSO - but I found you had to set it in the Integrate section of an app bound to SSO service and it is not needed here
    // const callback_url = 'https://fintanNodeSSO.mybluemix.net/auth/sso/callback'
    const passport = require('passport')
    const OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy
    const Strategy = new OpenIDConnectStrategy({
    							authorizationURL : authorization_url,
    							tokenURL : token_url,
    							clientID : client_id,
    							scope: 'openid',
    							response_type: 'code',
    							clientSecret : client_secret,
    							//callbackURL : callback_url,
    							skipUserProfile: true,
    							issuer: issuer_id},
    							(accessToken, refreshToken, profile, done) => {
                    // process.nextTick() is a nodejs approach to defer the execution of an action till the next pass around the event loop
    								process.nextTick(() => {
    									profile.accessToken = accessToken
    									profile.refreshToken = refreshToken
    									done(null, profile)
    								})
    							})

    // define express session services, etc for SSO
    app.use(cookieParser())
    app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'unwielding-snapdragon'}))
    app.use(passport.initialize())
    app.use(passport.session())
    passport.serializeUser((user, done) => {
      done(null, user)
    })
    passport.deserializeUser((obj, done) => {
      done(null, obj)
    })
    passport.use(Strategy)
    cb(passport)
  } // end setupSSO()
}
