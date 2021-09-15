import {
  ExtendedAuthInstance,
  ExtendedFirebaseInstance,
} from "react-redux-firebase";
import { config } from "./firebase";
import * as types from "./types";

async function pushNewEntry(
  firebase: ExtendedFirebaseInstance,
  path: string,
  obj: types.GenericObject
): Promise<types.Resp> {
  const ref = firebase.ref(path);
  let status: string = "ok";
  const snapshot = await ref.push(obj, (error) => {
    if (error) {
      alert(error);
      status = "error";
    }
  });
  return { status, message: snapshot };
}

async function fetchFirebase(
  firebase: ExtendedFirebaseInstance,
  endPoint: string
): Promise<any> {
  const ref = firebase.ref(endPoint);
  let result;
  await ref.once("value", (snapshot) => {
    result = snapshot.val();
  });
  return result;
}

async function updateObject(
  firebase: ExtendedFirebaseInstance,
  path: string,
  obj: types.GenericObject
) {
  const ref = firebase.ref(path);
  try {
    await ref.update(obj);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
async function setObject(
  firebase: ExtendedFirebaseInstance,
  path: string,
  obj: types.GenericObject
) {
  const ref = firebase.ref(path);
  try {
    await ref.set(obj);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function deleteObject(firebase: ExtendedFirebaseInstance, path: string) {
  const ref = firebase.ref(path);
  try {
    await ref.remove();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function registerUser(
  firebase: ExtendedAuthInstance,
  email: string,
  password: string
): Promise<types.Resp> {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    return { status: "ok", message: "success" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error };
  }
}

export async function updateDisplayName(
  firebase: ExtendedAuthInstance,
  username: string
): Promise<types.Resp> {
  try {
    await firebase.auth().currentUser?.updateProfile({ displayName: username });
    return { status: "ok", message: "success" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: error };
  }
}

export async function sendPasswordResetEmail(
  firebase: ExtendedAuthInstance,
  email: string
) {
  await firebase.auth().sendPasswordResetEmail(email);
}

export async function sendVerification(
  firebase: ExtendedAuthInstance
): Promise<types.Resp> {
  const user = firebase.auth().currentUser;
  if (user) {
    const url: { url: any } = { url: config.domain };
    try {
      await user.sendEmailVerification(url);
      return { status: "ok", message: "success" };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  } else {
    return { status: "error", message: "User is not logged in" };
  }
}

export async function logout(firebase: ExtendedAuthInstance) {
  await firebase.auth().signOut();
  // clearBackendResponse();
}

