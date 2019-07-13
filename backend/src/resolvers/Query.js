const { hasPermission, checkIfLoggedIn } = require('../utils')

const query = {
  async items(parent, args, context, info) {
    const items = await context.prisma.items({
      ...args
    })

    return items
  },
  async item(parent, args, context, info) {
    return context.prisma.item({ id: args.id })
  },
  async itemsConnection(parent, args, context, info) {
    const count = await context.prisma.itemsConnection({ where: args.where })
      .aggregate()
      .count()

    return {
      aggregate: {
        count
      }
    }
  },
  async me(parent, args, context, info) {
    // check if there is a current user ID
    if (!context.request.userId) {
      return null
    }

    return context.prisma.user({ id: context.request.userId })
  },
  async users(parent, args, context, info) {
    // Check if the user is logged in
    checkIfLoggedIn(context)
    // Check if the user has the permissions to query all the users
    hasPermission(context.request.user, ['ADMIN', 'PERMISSIONUPDATE'])
    // Query all the users
    return context.prisma.users()
  },
  async order(parent, args, ctx, info) {
    // Check if the user is logged in
    checkIfLoggedIn(ctx)
    // Query the current order
    const fragment = `
      fragment orderWithProps on order {
        id
        items {
          id
          title
          description
          price
          quantity
          image
          largeImage
        }
        total
        user {
          id
        }
        charge
        createdAt
        updatedAt
      }
    `
    const order = await ctx.prisma.order({ id: args.id }).$fragment(fragment)
    // Check if they have the permissions to see the order
    const ownsOrder = order.user.id === ctx.request.userId
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN')
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw Error('You dont have permissions to see this.')
    }
    // Return the order
    return order
  },
  async orders(parent, args, ctx, info) {
    // Check if the user is logged in
    checkIfLoggedIn(ctx)
    return ctx.prisma.orders({
      where: {
        user: { id: ctx.request.userId }
      }
    })
  }
}

module.exports = query;
