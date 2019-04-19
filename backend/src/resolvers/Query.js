const Query = {
  dogs(parent, args, context, info) {
    return [{ name: 'snickers' }, { name: 'sunny' }]
  }
};

module.exports = Query;
