# Terra Athletes

This is a sample project to get started with the API and understand a full integration cycle with Terra.

## Structure

The main code of interest can be found in the `server.js` file. It covers the different core features of the API:
- Generate widget sessions to connect users (`/api/connect`)
- Parse the auth event URLs to update the application once a user fully connects (`/api/add`)
- Receive asynchronous events from Terra with data updates (`/api/terra`)
  
Additionally, the server has a `/api/users` endpoint which return the list of storred user data on the application, allowing a simple frontend to render the list of users and their daily metrics.

The frontend makes use of react and can be found in the `/src` folder.

## Running the project

The project uses a firestore database for simplicity, which can be setup easily on Firebase.

Create a `.env` file referring to the `.env-example` and populate it with the following variables (the firebase variables can be pulled directly from your firebase console):

```
TERRA_DEV_ID="your terra dev id"
TERRA_API_KEY="your terra api key"
FB_API_KEY="your firebase project api key"
FB_AUTH_DOMAIN="your firebase project auth domain" 
FB_PROJECT_ID="your firebase project project id"
FB_STORAGE_BUCKET="your firebase storage bucket"
FB_MESSAGING="your firebase project messaging id"
FB_APP_ID="your firebase app id"
URL="your application public URL to receive pushes from terra"
PORT="your application port"
```

Install the required npm packages:
```
npm install
```

Build the react frontend:
```
npm run build --prod
```

Run the server:
```
node server.js
```

You can get a free public URL from your localhost running server using ngrok.

## Deploying

You can run or deploy the application in a container using the docker files:

```
docker-compose up --build
```
