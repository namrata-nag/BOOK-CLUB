var environment = {};

environment.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development"
};
environment.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production"
};

const createEnviroment =
  typeof process.env.APP_ENV == "string" ? process.env.APP_ENV : "";

const exportEnvironment = environment[createEnviroment]
  ? environment[createEnviroment]
  : environment["development"];

module.exports = exportEnvironment;
