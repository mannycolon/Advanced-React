async function items(parent, args, context, info) {
  const items = context.prisma.items()

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

module.exports = {
  items,
  itemsConnection,
  item
};
