require("@dotenvx/dotenvx").config();

module.exports = {
  apps: [
    {
      name: "census-app",
      script: "npm start",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      key: process.env.SSH_KEY,
      user: process.env.SSH_USERNAME,
      host: process.env.SSH_HOSTMACHINE,
      ssh_options: "ForwardAgent=yes",
      ref: "origin/main",
      repo: process.env.GIT_REPOSITORY,
      path: process.env.DESTINATION_PATH,
      "pre-setup": "",
      "post-setup": "cp ~/.env* . && source ~/.nvm/nvm.sh && npm install",
      "pre-deploy-local": "",
      "post-deploy": "source ~/.nvm/nvm.sh && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
