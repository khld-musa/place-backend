const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    type: process.env.SMTP_TYPE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};


// const https =require('https');

// const sendEmail = async (optionsUser) => {
//   console.log(`statusCode: caled}`);
//   console.log(optionsUser);
//   const path = encodeURI(`/smsv1/sms/api?action=send-sms&api_key=eWFzc2lubXVhd2lhOTRAZ21haWwuY29tOnYkUVVWbkhkYU0=&to=249${optionsUser.phone}&from=KSS&sms='${optionsUser.message}'&unicode=1`);
// const options = {
//   hostname: 'mazinhost.com',
//   port: 443,
//   path: path,
//   data:{},
//   method: 'GET',
// };

// const req = https.request(options, res => {
//   console.log(`statusCode: ${res.statusCode}`);

//   res.on('data', d => {
//     process.stdout.write(d);
//   });
// });

// req.on('error', error => {  
//   console.error(error);
// });

// req.end();
// };

module.exports = sendEmail;
