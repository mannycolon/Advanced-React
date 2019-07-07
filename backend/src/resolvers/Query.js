const { hasPermission } = require('../utils')

async function items(parent, args, context, info) {
  const items = await context.prisma.items({
    orderBy: args.orderBy,
    first: args.first,
    skip: args.skip,
  })

  return items
}

async function item(parent, args, context, info) {
  return context.prisma.item({ id: args.id })
}

async function itemsConnection(parent, args, context, info) {
  const count = await context.prisma.itemsConnection({ where: args.where })
    .aggregate()
    .count()

  return {
    aggregate: {
      count
    }
  }
}

async function me(parent, args, context, info) {
  // check if there is a current user ID
  if (!context.request.userId) {
    return null
  }

  return context.prisma.user({ id: context.request.userId })
}

async function users(parent, args, context, info) {
  // Check if the user is logged in
  if (!context.request.userId) {
    throw new Error('You must be logged in')
  }
  // Check if the user has the permissions to query all the users
  // const user = context.prisma.user({ id: context.request.userId })
  hasPermission(context.request.user, ['ADMIN', 'PERMISSIONUPDATE'])
  // Query all the users
  return context.prisma.users()
}

module.exports = {
  items,
  itemsConnection,
  item,
  me,
  users
};
