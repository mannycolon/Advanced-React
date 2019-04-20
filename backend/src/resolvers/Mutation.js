const mutations = {
  async createItem(parent, args, context, info) {
    // TODO: check if they are logged in
    const item = await context.prisma.createItem({
      ...args
    })

    return item
  }
};

module.exports = mutations;
