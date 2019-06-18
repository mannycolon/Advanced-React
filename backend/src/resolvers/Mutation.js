const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const mutations = {
  async createItem(parent, args, context, info) {
    // TODO: check if they are logged in
    const item = await context.prisma.createItem({
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
    // const where = { id: args.id }

    // 1. find the item
    // const item = await ctx.prisma.item({ where }, `{ id title}`)
    // 2. check if they own that item, or hve the permissions
    // TODO:
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
  }
};

module.exports = mutations;
