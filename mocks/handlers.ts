import { memberHandlers } from "./handlers/member";
import { postHandlers } from "./handlers/post";
import { notificationHandlers } from "./handlers/notification";

export const handlers = [...memberHandlers, ...postHandlers, ...notificationHandlers];
