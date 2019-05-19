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
  }
};

module.exports = mutations;
