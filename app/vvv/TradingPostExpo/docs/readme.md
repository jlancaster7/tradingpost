# TradingPost App
Please read instructions on configuring, running, and deploying the trading post app.

## Setup (Optional)

### Environment Variables 
|Name|Default| Description
|---|---|---|
API_PORT| 8082| Allows you to override the port of the api server for [LOCAL & DEV configuration](#configuration-parameters). (Need to update the expo app to look at this too)
postgres*||This variable allows you to specify the settings json for your local postgres instance in [LOCAL configuration](#configuration-parameters) <br/>Example:<br/> {"host":"localhost","user": "postgres","password": "********","database":"HIVE","port": 5432}


> \* This variable is only used if configuration is set to "LOCAL" when the app is launched 
## How To Run
The TradingPost app can be run using the following command:

```console
> #configuration defaults to DEV
> npm run launch 𝘤𝘰𝘯𝘧𝘪𝘨𝘶𝘳𝘢𝘵𝘪𝘰𝘯
```

### Configuration Parameters
|Name| Description
|---|---|
LOCAL| **Expo Build** expo start --web<br/>**API Server** is run locally.<br/> **Database**  is based on the [*postgres*](#environment-variables) environment variable
DEV| **Expo Build** expo start --web<br/>**API Server** is run locally.<br/> **Database**  is based on the SSM value "*/development/postgres*"
TEST| **Expo Build** expo start --web --no-dev --minify<br/>**API Server** is m.tradingpostapp.com<br/> **Database**  N/A

### How To Deploy
Currently only the web deployment is scripted for the TradingPost App
#### Web App
The following command will deploy the TradingPost Web app to https://m.tradingpostapp.com
```console
> npm run deploy
```


