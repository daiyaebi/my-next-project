import { createNextAuthMiddleware } from "./node_modules/nextjs-basic-auth-middleware/dist/index";

export const middleware = createNextAuthMiddleware();

export const config = {
    matcher: ["/(.*)"],
};