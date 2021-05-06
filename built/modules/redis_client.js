const { promisify } = require('util');
const redis_client = require("redis").createClient({
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT
});
redis_client.getAsync = promisify(redis_client.get).bind(redis_client);
redis_client.on("error", (err => {
    throw new Error(err);
}));
module.exports = redis_client;
