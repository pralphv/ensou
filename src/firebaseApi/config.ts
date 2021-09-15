interface IConfig {
  apiKey: string | undefined;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  domain: string;
  measurementId: string;
  messagingSenderId: string;
}

export const prodConfig: IConfig = {
  apiKey: process.env.REACT_APP_PROD_API_KEY as string,
  authDomain: process.env.REACT_APP_PROD_AUTH_DOMAIN as string,
  databaseURL: process.env.REACT_APP_PROD_DATABASE_URL as string,
  projectId: process.env.REACT_APP_PROD_PROJECT_ID as string,
  storageBucket: process.env.REACT_APP_PROD_STORAGE_BUCKET as string,
  domain: process.env.REACT_APP_PROD_CONFIRMATION_EMAIL_REDIRECT as string,
  measurementId: process.env.REACT_APP_PROD_MEASUREMENT_ID as string,
  messagingSenderId: process.env.REACT_APP_PROD_MESSAGING_SENDER_ID as string,
};

export const devConfig: IConfig = {
  apiKey: process.env.REACT_APP_DEV_API_KEY as string,
  authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN as string,
  databaseURL: process.env.REACT_APP_DEV_DATABASE_URL as string,
  projectId: process.env.REACT_APP_DEV_PROJECT_ID as string,
  storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET as string,
  domain: process.env.REACT_APP_DEV_CONFIRMATION_EMAIL_REDIRECT as string,
  measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID as string,
  messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID as string,
};
