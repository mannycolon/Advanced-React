async function items(parent, args, context, info) {
  const items = context.prisma.items()

  return items
}

async function item(parent, args, context, info) {
  return context.prisma.item({ id: args.itemId })
}

module.exports = {
  items,
  item
};
