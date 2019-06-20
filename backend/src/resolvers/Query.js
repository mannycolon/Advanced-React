async function items(parent, args, context, info) {
  const items = context.prisma.items({
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

  return context.prisma.user({ id: context.request.userId }, info)
}

module.exports = {
  items,
  itemsConnection,
  item,
  me
};
