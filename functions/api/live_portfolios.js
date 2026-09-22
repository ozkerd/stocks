import { onRequest as tradingLabOnRequest } from "./trading_lab.js";

export async function onRequest(context) {
  return tradingLabOnRequest(context);
}
