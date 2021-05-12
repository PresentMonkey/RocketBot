import { connect } from "https://deno.land/x/redis/mod.ts";
import { configs } from "../../configs.ts";

export const redis = await connect({
  hostname: configs.redis.hostname,
  port: configs.redis.port,
});


