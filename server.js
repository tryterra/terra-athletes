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
  deleteDoc,
} = require("firebase/firestore/lite");
const db = firestore.getFirestore(firebaseApp);

// server options
const app = express();
var options = {
  inflate: true,
  limit: "4000kb",
  type: "application/json",
};
app.use(bodyParser.raw(options));
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
        "WITHINGS",
        "SUUNTO",
        "GARMIN",
        "GOOGLE",
        "POLAR",
        "IFIT",
      ],
      "EN",
      host,
      host + "/fail"
    )
    .then((s) => {
      console.log(s);
      res.send(JSON.stringify(s));
    });
});

// create new user
function add_user(user_id, reference_id, resource) {
  setDoc(doc(db, "users", user_id), {
    name: reference_id,
    resource: resource,
    id: user_id,
    steps: 0,
    total_burned_calories: 0,
  })
    .then((_) => {
      console.log(
        "Successfully added user to DB",
        user_id,
        reference_id,
        resource
      );
      terra.setCurrentUser(user_id);
      terra.getDaily(new Date());
    })
    .catch((_) =>
      console.log("Error adding user", user_id, reference_id, resource)
    );
}

// remove user
function remove_user(user_id) {
  deleteDoc(doc(db, "users", user_id))
    .then((_) => {
      console.log("Successfully deleted user from DB", user_id);
      terra.setCurrentUser(user_id);
      terra.getDaily(new Date());
    })
    .catch((_) => console.log("Error deleting user", user_id));
}

// verify terra signature
function verifySignature(terraSignature, payload, secret) {
  const s = terraSignature.split(",");
  const t = s[0].split("=")[1];
  const v1 = s[1].split("=")[1];
  var hmac = crypto
    .createHmac("sha256", secret)
    .update(t + "." + payload)
    .digest("hex");
  return hmac === v1;
}

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
  const data = JSON.parse(req.body);
  console.log(JSON.stringify(data)); // for the sake of logging >:(
  // verify signature
  // const signature = req.headers["terra-signature"];
  // console.log(verifySignature(signature, req.body, process.env.TERRA_SECRET));
  // currently we are only using the daily data but the switch can be expanded
  // to use sleep, activity, etc... depending on the application
  switch (data.type) {
    case "user_reauth":
      remove_user(data.old_user.user_id);
      break;
    case "deauth":
      remove_user(data.user.user_id);
      break;
    case "auth":
      add_user(data.user.user_id, data.reference_id, data.user.provider);
      break;
    case "daily":
      const dailyData = data.data[0];
      updateDoc(doc(db, "users", data.user.user_id), {
        steps: dailyData.distance_data.steps,
        total_burned_calories: dailyData.calories_data.total_burned_calories,
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
