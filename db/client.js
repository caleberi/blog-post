const { PrismaClient } = require('@prisma/client');
module.exports = function (_dbOpts){
    return new PrismaClient({
        datasourceUrl:"file:../prisma/dev.db"
    });
}