export const prodConfig = {
  apiKey: process.env.REACT_APP_PROD_API_KEY,
  authDomain: process.env.REACT_APP_PROD_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_PROD_DATABASE_URL,
  projectId: process.env.REACT_APP_PROD_PROJECT_ID,
  storageBucket: process.env.REACT_APP_PROD_STORAGE_BUCKET,
  domain: process.env.REACT_APP_PROD_CONFIRMATION_EMAIL_REDIRECT,
  measurementId: process.env.REACT_APP_PROD_MEASUREMENT_ID,
  messagingSenderId: process.env.REACT_APP_PROD_MESSAGING_SENDER_ID
};

export const devConfig = {
  apiKey: process.env.REACT_APP_DEV_API_KEY,
  authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
  projectId: process.env.REACT_APP_DEV_PROJECT_ID,
  storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
  domain: process.env.REACT_APP_DEV_CONFIRMATION_EMAIL_REDIRECT,
  measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID,
  messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID
};
