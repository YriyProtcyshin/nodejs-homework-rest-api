const nodeMailer = require("nodemailer");
require("dotenv").config();

const { UKR_NET_KEY } = process.env;

// 1. Create config

const nodeMailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: "bortach@ukr.net",
    pass: UKR_NET_KEY,
  },
};

// 2. Create transport
const transport = nodeMailer.createTransport(nodeMailerConfig);

const sendMail = async (data) => {
  const mail = { ...data, from: "bortach@ukr.net" };
  const sendEmailError = await transport
    .sendMail(mail)
    .then(() => {
      console.log("Email send seccess");
      return false;
    })
    .catch((error) => {
      console.log(error.message);
      return error.message;
    });
  return sendEmailError;
};

module.exports = sendMail;
