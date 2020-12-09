/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    "tests": '/',
    "": '/src',

  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-dotenv'
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    port: 8056,
    open:"none",
    
  },
  buildOptions: {
    // sourceMaps: true, //sourcemaps don't appear to work atm
    // out:"./snowbuild"
  },
  testOptions: {
  },
  proxy: {
    //"/duocms/api":"http://cris1.local:49567/duocms/api"
  },
  alias: {
    /* ... */
  },
};
