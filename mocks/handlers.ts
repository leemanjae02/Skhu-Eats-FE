import { memberHandlers } from "./handlers/member";
import { postHandlers } from "./handlers/post";

export const handlers = [
  ...memberHandlers,
  ...postHandlers,
];
