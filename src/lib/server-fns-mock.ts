export const createServerFn = () => ({
  inputValidator: () => ({
    handler: (h: any) => h
  }),
  handler: (h: any) => h
});

export const useServerFn = (fn: any) => {
  return async (args: any) => {
    return fn(args);
  };
};

export const useSession = (config: any) => {
  return {
    data: {},
    update: async (data: any) => {},
    clear: async () => {}
  };
};
