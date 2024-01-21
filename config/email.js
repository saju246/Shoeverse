const nodemailer=require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//--------------create a email sender  for otp-------------

const transporter=nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth:{
        user:process.env.GMAIL,
        pass:process.env.PASS
    }
});

module.exports= transporter;