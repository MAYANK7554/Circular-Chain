module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            // This creates an alias `@` that points to the root of your project
            "@": "./",
            // You can also create more specific aliases
            "@/components": "./components",
            "@/app": "./app",
          },
        },
      ],
    ],
  };
};