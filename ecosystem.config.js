require("dotenv").config();

module.exports = {
  apps: [
    {
      script: "npm start",
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
