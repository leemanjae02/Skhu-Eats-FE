type Handler = (msg: string) => void;
let _error: Handler = () => {};
let _success: Handler = () => {};

export const toast = {
  error: (msg: string) => _error(msg),
  success: (msg: string) => _success(msg),
};

export function registerToastHandlers(fns: { error: Handler; success: Handler }) {
  _error = fns.error;
  _success = fns.success;
}
