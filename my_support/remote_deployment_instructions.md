# Deployment on container hosted by local network server (raspberry pi, another PC, NAS devise)

## Content

- [Deploy server container](#deploy-server-container)
- [Add user in Debian](#add-user-in-debian)
- [Add user to the sudo group](#add-user-to-the-sudo-group)
- [Delete a user in Debian](#delete-a-user-in-debian)
- [Generate ssh key](#generate-ssh-key)
- [Enable SSH on Debian](#enable-ssh-on-debian)
- [Installing Node in remote server](#installing-node-in-remote-server)
- [Installing other required apps](#installing-other-required-apps)
- [pm2 ecosystem](#pm2-ecosystem)

## Deploy server container

[Content](#content)

TO-DO

## Add user in Debian

[Content](#content)

As you've created new container and got to terminal through host connection you most likely will be logged in as `root`. Here are steps to create your account. First lets install `sudo`

```bash
apt update && apt install -y sudo
```

Now lets add user

```bash
adduser leah
```

You will be asked a series of questions. Entering and confirming the password is required; all other information is optional. On the last prompt, confirm that the information is correct by pressing `Enter`. The command will create the new user’s home directory and copy files from `/etc/skel` directory to the user’s home directory. The user can write, edit, and delete files and directories within the home directory. By default on Debian, members of the group sudo are granted with sudo access. If you want the newly created user to have administrative rights, [add user to the sudo group](#add-user-to-the-sudo-group):

```bash
usermod -aG sudo leah
```

## Add user to the sudo group

[Content](#content)

To add an existing user to a secondary group, use the `usermod -a -G` command followed the name of the group and the user:

```bash
usermod -a -G groupname username
```

For example, to add the user linuxize to the sudo group, you would run the following command:

```bash
usermod -a -G sudo linuxize
```

Always use the `-a` (append) option when adding a user to a new group. If you omit the `-a` option, the user will be removed from any groups not listed after the `-G` option.

On success, the `usermod` command does not display any output. It warns you only if the user or group doesn’t exist.

## Delete a user in Debian

[Content](#content)

f the user account is no longer needed, you can delete it with `userdel` or `deluser`. Generally, it is better to use the `deluser` command as it is more friendly than the low-level `userdel`.

To delete a user, without removing the user files, run:

```bash
deluser leah
```

When removing a user account with userdel, the user’s home directory and mail spool are not removed. To remove those directories, invoke the command with the --remove-home flag:

```bash
deluser --remove-home leah
```

## Generate ssh key:

[Content](#content)

```bash
ssh-keygen -t ed25519 -b 4096 -C "your_email@example.com"
```

this will generate 2 files in your `/home/your_user_name_directory/.ssh/`

- `id_ed25519` is your private key. Meant to be saved where it is now.
- `id_ed25519.pub` is your public key. Meant to be shared to remote host
  Don't share your public key to untrusted places
  This public key can be saved in github https://github.com/settings/keys

To save ssh public key to remote server (linux container)

```bash
ssh-copy-id user@hostname
```

Enter password and key will be copied to remote server. Now you can connect to server without asked for password

```bash
ssh user@hostname
```

## Enable SSH on Debian

[Content](#content)

A secure connection is important when connecting remotely. Otherwise, the machine's security is compromised. The following five steps explain how to enable SSH and establish a secure connection on Debian.

Before installing new software, update the software repository list on both machines with the following command:

```bash
sudo apt update
```

On the system that acts as a server (server container), run the following command:

```bash
sudo apt install openssh-server
```

Once the installation completes, check the SSH service status with the following command:

```bash
sudo systemctl status ssh
```

![alt text](ssh_status_running.png)

In case the SSH status is not active, start the service with:

```bash
sudo service ssh start
```

The command has no output. To stop the SSH host server, enter the following:

```bash
sudo service ssh stop
```

The command shows no output. However, if you check the service status, the system indicates the SSH is inactive and shows the exact date and time it stopped.

![alt text](ssh_status_stopped.png)

The service will be stopped only until the next reboot. To turn off SSH indefinitely, enter:

```bash
sudo systemctl disable ssh
```

![alt text](ssh_status_dissabled.png)

To enable the SSH service again, run:

```bash
sudo systemctl enable ssh
```

![alt text](ssh_status_enabling.png)

Install SSH Client Service (this is on your local machine). By default, most Linux systems have the SSH client installed. If yours doesn't, enter the following command in the client machine terminal:

```bash
sudo apt install openssh-client
```

Once both the client and the server machine are set up, connect to the server from the client machine using SSH via the following command:

```bash
ssh user@hostname
```

One last thing we need to do is to add host information on your local computer. So on VS-Code terminal please run command:

```bash
nano ~/.ssh/config
```

And copy past this text

```config
Host census-app
        ForwardAgent yes
```

Then click `CONTROL + X`, then click `Y` and `ENTER`. This commands will save config file.

## Installing other required apps

[Content](#content)

Please run command all of this commands on remote server:

```bash
sudo apt update && apt install -y curl mc nano git nginx
```

We need to save some configuration for nginx. Run command:

```bash
sudo nano /etc/nginx/conf.d/census-app.conf
```

And copy past this text:

```conf
server {
    listen 80;
    server_name census-app;

    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

Then click `CONTROL + X`, then click `Y` and `ENTER`. This commands will save conf file.

Now we need to reload nginx by running command:

```bash
sudo service nginx restart
```

Then on your computer's browser open this url `census-app/`. If you have "Welcome to nginx!" message then congratulations, you are on the right track!

## Installing Node in remote server

[Content](#content)

We will use nvm to install out Node to server. [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) is lint on instruction to install nvm.

```bash
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

to apply env variables on our terminal, please run

```bash
source ~/.bashrc
```

to confirm `nvm` is installed properly let's run

```bash
nvm -v
```

it should return it's version. Now let's install latest Node, please run

```bash
nvm install --lts
```

Please run both commands `node -v` and `npm -v`. If both return their versions then we good to go.

you should update npm by running:

```bash
nvm install-latest-npm
```

## pm2 ecosystem

[Content](#content)

[pm2 Docs](https://pm2.keymetrics.io/docs/usage/quick-start/)

Have your VS-Code opened and clone repository to your local computer. Every time when I refer to local computer I mean running commands on VS-Code terminal with repository opened.

1. Copy you ssh key to locally cloned census-app repository.

```bash
cp ~/.ssh/id_ed25519 ./key.pem
```

Now make it not easily accessible by running command:

```bash
chmod 400 key.pem
```

This key will be used to remotely connect to your server and deploy census-app by pm2

2. Let's install pm2 on both your local computer and remote server by running:

```bash
npm install pm2 -g
```

3. On remote server, assuming you've ssh in to it already, create directory byt running command:

```bash
mkdir ~/census-app
```

4. If on your local cloned census-app repository file `ecosystem.config.js` already exist then skip this step. Otherwise please command on your local computer in VS-Code terminal:

```bash
pm2 ecosystem
```

please adjust `ecosystem.config.js` to be as fallows:

```js
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
      "post-setup": "cp ~/.env* .",
      "pre-deploy-local": "",
      "post-deploy": "source ~/.nvm/nvm.sh && npm install && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
```

5. Make sure you have `.env` file saved as follows:

```Properties
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="census_app"
#if deployed on your local computer container
POSTGRES_HOST="localhost"
#if deployed on remote server container
#POSTGRES_HOST="postgres"

# environment variables for prisma
DATABASE_URL=`postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public`

SSH_KEY=key.pem
SSH_USERNAME=sobir
SSH_HOSTMACHINE=census-app
GIT_REPOSITORY=https://github.com/sobir-t/census_app.git
DESTINATION_PATH=/home/sobir/server

AUTH_SECRET=1hWCheVza3jTjPXzK1RpkKA08crxLKKCBXLPhX9Ts2mA
```

Update your `.env` variables accordingly

Value for `AUTH_SECRET` can ge generated by running command:

```bash
openssl rand -base64 33
```

Now let's save your environment files in your server computer. Please run command:

```bash
nano ~/.env
```

Copy / past this text:

```Properties
DATABASE_URL=`postgresql://postgres:postgres@postgres:5432/census_app?schema=public`
```

Then press `CONTROL + X` and then press `ENTER` to save `.env` file. Do the same for `.env.local`, but copy / past this text:

```Properties
AUTH_SECRET=1hWCheVza3jTjPXzK1RpkKA08crxLKKCBXLPhX9Ts2mA
AUTH_TRUST_HOST=true
AUTH_URL=http://census-app/
```

Both of this files will be copied to cloned census-app repository on remote server by pm2 ecosystem deployment.

6. Deploy your census-app application on remote server. On VS-Code terminal run command:

```bash
pm2 deploy production setup
```

Next run command:

```bash
pm2 deploy production
```
