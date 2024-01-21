const nodemailer=require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//--------------create a email sender  for otp-------------

const transporter=nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth:{
        user:'shoeverse.2024@gmail.com',
        pass:'sdkgfatgmrwasoln'
    }
});

module.exports= transporter;