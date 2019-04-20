async function items(parent, args, context, info) {
  const items = context.prisma.items()

  return items
}

module.exports = {
  items
};
