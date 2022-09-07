## Setting up the Front-End

---

Run the following commands in your terminal:

```bash
cd wagerMongo/client
yarn
cd src
cp config.example.json config.json
```

Get secret `config.json` file data from a Lead and congrats! You're now ready to spin up the front-end! Do so with the command:

```bash
yarn start
```

## Setting up the Back-End

---

Run the following commands in your terminal:

```bash
cd wagerMongo/server
yarn
cp .env.example .env
```

Talk to a lead for:

1. Secret `.env` file data
1. Getting added on Facebook as an app tester

Congrats! You're now ready to spin up the back-end! Do so with the command:

```bash
yarn dev
```