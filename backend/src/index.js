const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env'})
const createServer = require('./createServer')

const server = createServer()

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
// Decode JWT so we can get the user id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    // Put userId onto the req or future requests to access
    req.userId = userId
  }
  next()
})

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  },
}, deets => {
  console.log(`Server is now running on port http://localhost:${deets.port}`)
})