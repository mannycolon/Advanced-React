const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeNiceEmail } = require('../mail')
const { hasPermission } = require('../utils')

const checkIfLoggedIn = (context) => {
  if (!context.request.userId) {
    throw Error('You must be logged in to do that!')
  }
}


const mutations = {
  async createItem(parent, args, context, info) {
    checkIfLoggedIn(context)
    const item = await context.prisma.createItem({
      // This is how to create a relationship between the Item and the User
      user: {
        connect: {
          id: context.request.userId
        }
      },
      ...args
    })

    return item
  },
  updateItem(parent, args, context, info) {
    // first make a copy of the updates
    const updates = { ...args }
    // remove the ID from updates
    delete updates.id
    // run the update method
    return context.prisma.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    })
  },
  async deleteItem(parent, args, context) {
    // 1. find the item
    const fragment = `
      fragment itemWithProps on Item {
        id
        title
        user {
          id
        }
      }
    `
    const item = await context.prisma.item({ id: args.id }).$fragment(fragment)
    // 2. check if they own that item, or hve the permissions
    const ownsItem = item.user.id === context.request.userId
    const hasPermissions = context.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))
    if (!ownsItem && !hasPermissions) {
      throw Error('You dont have permission to do that')
    }
    // 3. Delete it!
    return context.prisma.deleteItem({ id: args.id })
  },
  async signup(parent, args, context, info) {
    // lowercase the user's email
    args.email = args.email.toLowerCase()
    // hash the user's password
    const password = await bcrypt.hash(args.password, 10)
    // create the user in the database
    const user = await context.prisma.createUser({
        ...args,
        password,
        permissions: { set: ['USER'] }
      },
      info
    )
    // create JWT token for user
    const token = jwt.sign({ userId: user.id, }, process.env.APP_SECRET)
    // set JWT as a cookie on the response
    context.response.cookie('token', token, {
      httpOnly: true, // make it not accesible by browser Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    // finally return the user to the browser
    return user
  },
  async signin(parent, { email, password }, context, info) {
    // check if there is a user with that email
    const user = await context.prisma.user({ email })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // check if password if correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return new Error('Invalid Password!')
    }
    // Generate the JWT token
    const token = jwt.sign({ userId: user.id, }, process.env.APP_SECRET)
    // Set the cookie with the token
    context.response.cookie('token', token, {
      httpOnly: true, // make it not accesible by browser Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    // Return the user
    return user;
  },
  signout(parent, args, context, info) {
    context.response.clearCookie('token');
    return { message: 'Succesful signout' }
  },
  async requestReset(parent, { email }, context, info) {
    // Check if is a real user.
    const user = await context.prisma.user({ email })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // Set a reset token and expiry for that user.
    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1 Hour from now
    const res = await context.prisma.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })
    // Email them the reset token.
    const mailRes = await transport.sendMail({
      from: 'colonmanuel7@gmail.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeNiceEmail(`Your Password Reset Token is here!
        \n\n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset!</a>`)
    })
    // Return message
    return { message: 'Succesful email reset request' }
  },
  async resetPassword(parent, args, context, info) {
    // Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw Error('Your passwords don\'t match.')
    }
    // Check if its a legit resetToken
    // check if its expired
    const [user] = await context.prisma.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })

    if (!user) {
      throw Error('This token is either invalid or expired.')
    }
    // Hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // Save the new password to the user and remove old reset token fields
    const updatedUser = await context.prisma.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    // Generate JWT token
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    // Set JWT cookie
    context.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    // Return the new user
    return updatedUser
  },
  async updatePermissions(parent, args, context, info) {
    // Check if user is logged in
    checkIfLoggedIn(context)
    // Query the current user
    const user = await context.prisma.user({ id: context.request.userId }, info)
    // Check if User has permissions to do this
    hasPermission(user, ['UPDATE', 'PERMISSIONUPDATE'])
    // Update permissions
    return context.prisma.updateUser({
      where: {
        id: args.userId
      },
      data: {
        permissions: {
          set: args.permissions
        }
      }
    })
  },
  async addToCart(parent, args, context, info) {
    // Make sure they are signed in
    checkIfLoggedIn(context)
    // Query the user's current cart
    const [existingCartItem] = await context.prisma.cartItems({
      where: {
        user: { id: context.request.userId },
        item: { id: args.id },
      }
    })
    // Check if item is already in their cart and increment by one if it is.
    if (existingCartItem) {
      console.log('This item is already in their cart')
      return context.prisma.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      })
    }
    // if its not, create a fresh cartItem for user
    return context.prisma.createCartItem({
      user: {
        connect: { id: context.request.userId }
      },
      item: {
        connect: { id: args.id }
      }
    })
  }
};

module.exports = mutations;
