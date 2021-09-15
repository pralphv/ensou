import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/database";
import "firebase/storage";
import "firebase/auth";
import { prodConfig, devConfig } from "./config";

const isProduction = process.env.NODE_ENV === "production";

export const config = isProduction ? prodConfig : devConfig;
firebase.initializeApp(config);

export default firebase;

const storage = firebase.storage();
export const storageRef = storage.ref();
