import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http'
import cors from 'cors'
import passport from 'passport';
import session from 'express-session';
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerdef.js';

import authRouter from './routes/auth.js'
import indexRouter from './routes/index.js';
import videoRouter from './routes/data.js'
import usersRouter from './routes/users.js';

import './utils/passport.js'
import { createToken } from './utils/createToken.js';
import _ from 'lodash';

const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const server = http.createServer(app)
const port = process.env.PORT || 8000


app.use(cors(
  {
    origin: '*',
    credentials: false
  }
))
app.use(logger('dev'));
app.use(express.json({
  limit: '35mb'
}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true, limit: '35mb', parameterLimit: 50000 }));
app.use(cookieParser());
app.use(session({
  resave: false, saveUninitialized: true, secret: 'my-secret'
}))

app.use(passport.initialize())
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', indexRouter);

app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/data', videoRouter)


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/callback', passport.authenticate('google', { failureRedirect: '/auth/google' }), async (req, res, next) => {
  const token = await createToken(req.user.id_);
  res.redirect(`${process.env.FRONTEND_URL}?access_token=${token}&user=${JSON.stringify(req.user)}`)
})


app.all('/health', (req, res) => {
  res.sendStatus(200)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ status: false, message: res.locals.message })
});




server.listen(port, () => {
  console.log("listening on port:", port);
})



export default app;
