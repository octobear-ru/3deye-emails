import pjson from './package.json';
import minimist from 'minimist';
import nodemailer from 'nodemailer';
import wellknown from 'nodemailer-wellknown';
import Promise from 'promise';
import keys from './config/keys'

let readFile = Promise.denodeify(require('fs').readFile);

let config = pjson.config;
let args = minimist(process.argv.slice(2));

let sendEmail = filename => {
  let html;
  let dirs = config.directories;
  let build = dirs.destination;
  let preview = dirs.preview;

  return html = readFile(build + `/${filename}.html`, 'utf-8').then(html => {
    let options = keys.mailer;
    let mailOptions = keys.mailOptions;
    mailOptions.html = html;

    var smtpTransport = nodemailer.createTransport(options);

    console.log(mailOptions);
    return smtpTransport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Message sent: ${info.response}`);
        smtpTransport.close();
      }
    });
  });
};

export default sendEmail;

