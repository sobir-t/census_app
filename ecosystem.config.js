require("@dotenvx/dotenvx").config();

module.exports = {
  apps: [
    {
      name: "census-app",
      script: "npm start",
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_TRUST_HOST: true,
        AUTH_URL: `${process.env.SSH_HOSTMACHINE}/`,
        HOSTNAME: process.env.SSH_HOSTMACHINE,
      },
    },
  ],

  deploy: {
    production: {
      key: process.env.SSH_KEY,
      user: process.env.SSH_USERNAME,
      host: process.env.SSH_HOSTMACHINE,
      ref: "origin/main",
      repo: process.env.GIT_REPOSITORY,
      path: process.env.DESTINATION_PATH,
      "pre-deploy-local": "",
      "post-deploy": "source ~/.nvm/nvm.sh && npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      ssh_options: "ForwardAgent=yes",
    },
  },
};
