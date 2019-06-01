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
  }
};

module.exports = mutations;
