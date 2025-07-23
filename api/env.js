const fs = require('fs');
const dotenv = require('dotenv');

const envFile = `.env.${process.env.NODE_ENV}`;

if (process.env.NODE_ENV && fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}
