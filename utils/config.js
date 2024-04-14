const URL = process.env.ATLAS_URI;
const PORT = process.env.PORT;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const APP_PASSWORD = process.env.APP_PASSWORD;
const SECRET = process.env.SECRET;
const BEURL = process.env.BEURL;
const FEURL = process.env.FEURL;

module.exports = {
  URL,
  PORT,
  EMAIL_ADDRESS,
  APP_PASSWORD,
  SECRET,
  FEURL,
  BEURL,
};

// export const URL = process.env.ATLAS_URI;
// export const PORT = process.env.PORT;
// export const EMAIL_USER = process.env.EMAIL_USER;
// export const EMAIL_PASS = process.env.EMAIL_PASS;
// export const JWT_SECRET = process.env.JWT_SECRET;
// export const BEURL = process.env.BEURL;
// export const FRONTEND_URL = process.env.FRONTEND_URL;