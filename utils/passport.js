import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { config } from "dotenv";
import client from "./client.js";

config()

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

passport.use(new GoogleStrategy({

    callbackURL: `${process.env.BACKEND_URL}/callback`,
    clientID: clientId,
    clientSecret: clientSecret,
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            // let user = await UserModel.findOne({ $or: [{ googleId: profile.id }, { email: profile._json.email }] });

            let user = await client.users.findFirst({
                where: {
                    email: profile._json.email
                }
            })
            if (user) return done(null, user)

            // let newUser = await new UserModel({
            //     googleId: profile._json.sub,
            //     fullName: profile._json.name,
            //     email: profile._json.email
            // }).save()

            // console.log(profile._json)

            let newUser = await client.users.create({
                data: {
                    email: profile._json.email,
                    last_name: `${profile._json.name.split(' ')[0]}`,
                    first_name: `${profile._json.name.split(' ')[1]}`,
                    // id_: parseInt(profile._json.sub),
                    pass_word: `null`,
                    username: `${profile._json.name}`,
                    phone: `null`,
                    googleId: profile._json.sub,
                    img_: profile._json.picture

                }
            })
            return done(null, newUser);
        } catch (error) {
            console.log('error creating profile', error.message)
        }
    }
))



