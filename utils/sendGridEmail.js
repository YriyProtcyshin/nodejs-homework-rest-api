const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendGridEmail = async (data) => {
  const mail = { ...data, from: "yriy.protcyshin@gmail.com" };
  const sendEmailError = await sgMail
    .send(mail)
    .then(() => {
      "Email send seccess";
      return false;
    })
    .catch((error) => {
      console.log(error.message);
      return error.message;
    });
  return sendEmailError;
};

module.exports = sendGridEmail;
