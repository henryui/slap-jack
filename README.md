# Full-Stack Challenge

## Instructions for the candidate

### Folder Structure

All the source code will be inside **src** directory.
The client will be served on port `3000` and the server on port `8000`.
To access the server routes from the client, use `/api/...`.

### Packages that are already installed

- axios
- dayjs
- moment
- lodash
- antd
- etc, please request to install any libraries you want

---

## Instructions for the host

### Preparation

The candidate will need vscode, so send an email a couple of days before the interview making sure they:
- Install VS Code (the web version does not work)
- Have the Live Share Extension enabled

#### Before the interview:

- Start local mongodb server
- Set up `.env` based on `.env.example`.
- Run:
```bash
yarn
yarn seed
yarn start
```
- Start Live Share and test it


#### Live Share

When starting a new session, make sure:

- Both `localhost:3000` and `localhost:8000` are listed in the Shared Servers. If one is missing, click on the "Share Server" icon and add both.
- Make sure the terminal is read-only for the candidate, for security reasons.
- Make sure the candidate has write permissions for the code.
- You can right-click on the User to start following them.
- To preview the changes, access `localhost:3000`.

TODO: Update React version
