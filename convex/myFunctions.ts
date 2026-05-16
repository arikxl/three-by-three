import { query } from "./_generated/server";

export const getCities = query({
  handler: async () => {
    return ["אילת", "באר שבע", "טירת הכרמל"];
  },
});