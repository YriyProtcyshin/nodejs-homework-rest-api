const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendGridEmail = async (data) => {
  const mail = { ...data, from: "yriy.protcyshin@gmail.com" };
  await sgMail
    .send(mail)
    .then(() => {
      "Email send seccess";
    })
    .catch((error) => console.log(error.message));
  return true;
};

module.exports = sendGridEmail;
