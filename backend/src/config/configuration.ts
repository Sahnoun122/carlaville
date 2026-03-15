export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri:
      process.env.DATABASE_URI || 'mongodb://localhost:27017/carlaville',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
