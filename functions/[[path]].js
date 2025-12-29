import handler from "../.open-next/server-functions/default/handler.js";

export async function onRequest(context) {
  return handler(context.request, context.env, context);
}
