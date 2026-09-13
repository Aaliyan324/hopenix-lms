const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user
  .findMany({ select: { email: true, role: true } })
  .then((u) => {
    console.log(JSON.stringify(u));
    process.exit(0);
  })
  .catch((e) => {
    console.log('ERR', e.message);
    process.exit(1);
  });
