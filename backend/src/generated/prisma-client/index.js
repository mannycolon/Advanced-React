"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Permission",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "Item",
    embedded: false
  },
  {
    name: "CartItem",
    embedded: false
  },
  {
    name: "OrderItem",
    embedded: false
  },
  {
    name: "Order",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://sick-fits-macp-e570d07844.herokuapp.com/sick-fits-prod/prod`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
