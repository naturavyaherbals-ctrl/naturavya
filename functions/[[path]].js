import { handleRequest } from "@opennextjs/cloudflare";

export async function onRequest(context) {
  return handleRequest({
    request: context.request,
    env: context.env,
    waitUntil: context.waitUntil,
  });
}
