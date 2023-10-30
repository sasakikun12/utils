const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const mailOptions = {
  from: process.env.EMAIL,
  to: "Email to",
  subject: "Subject",
  html: `<div>
            ${"Text"}
        </div>`,
};

transporter.sendMail(mailOptions);
