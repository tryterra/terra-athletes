// server setup
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

// terra wrapper
const { default: Terra } = require("terra-api");
const terra = new Terra(process.env.TERRA_DEV_ID, process.env.TERRA_API_KEY);
const host = process.env.URL;

// firebase client to store the data
const firebase = require("firebase/app");
const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING,
  appId: process.env.FB_APP_ID,
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestore = require("firebase/firestore/lite");
const {
  setDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
} = require("firebase/firestore/lite");
const db = firestore.getFirestore(firebaseApp);

// server options
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "build")));

// API endpoint to return a widget session
app.get("/api/connect", function (req, res) {
  const name = req.query.name;
  console.log(name);
  terra
    .generateWidgetSession(
      name,
      [
        "FITBIT",
        "OURA",
        "TRAININGPEAKS",
        "WITHINGS",
        "SUUNTO",
        "PELOTON",
        "ZWIFT",
        "GARMIN",
        "EIGHT",
        "WAHOO",
        "GOOGLE",
        "POLAR",
        "WEAROS",
        "FREESTYLELIBRE",
        "TEMPO",
        "IFIT",
        "CONCEPT2",
        "FATSECRET",
        "CRONOMETER",
        "MYFITNESSPAL",
        "NUTRACHECK",
        "UNDERARMOUR",
        "OMRON",
      ],
      "EN",
      host + "/api/add",
      host + "/fail"
    )
    .then((s) => {
      console.log(s.url);
      res.send(JSON.stringify(s));
    });
});

// API endpoint to add a new user to the database
// makes use of the redirect URL feature where the info is appended to the URL
// e.g. URL?user_id=XYZ&reference_id=ABC&resource=RES
app.get("/api/add", function (req, res) {
  const user_id = req.query.user_id;
  const reference_id = req.query.reference_id;
  const resource = req.query.resource;
  console.log(user_id, reference_id, resource);
  setDoc(doc(db, "users", user_id), {
    name: reference_id,
    resource: resource,
    id: user_id,
    steps: 0,
    total_burned_calories: 0,
  })
    .then((_) => {
      terra.setCurrentUser(user_id);
      terra.getDaily(new Date());
      res.redirect("/");
    })
    .catch((_) =>
      res.send(
        `Could not add ${reference_id}'s ${resource} to the system, please try again or check with admin`
      )
    );
});

// API to pull all users and their scores and return them
app.get("/api/users", function (req, res) {
  var docs = {};
  getDocs(collection(db, "users")).then((r) => {
    r.forEach((doc) => {
      docs[doc.id] = doc.data();
    });
    res.send(docs);
  });
});

// Webhook endpoint to which terra pushes data
app.post("/api/terra", function (req, res) {
  res.sendStatus(200); // reply to terra we received the payload
  const user_id = req.body.user.user_id;
  console.log(user_id, req.body.type);
  // currently we are only using the daily data but the switch can be expanded
  // to use sleep, activity, etc... depending on the application
  // we can also handle deauth and auth events here
  switch (req.body.type) {
    case "daily":
      const data = req.body.data[0];
      updateDoc(doc(db, "users", user_id), {
        steps: data.distance_data.steps,
        total_burned_calories: data.calories_data.total_burned_calories,
      }).catch((e) => console.log(e));
      break;
    default:
      break;
  }
});

// Server application
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT;
app.listen(port);
console.log("Server started on port " + port);
