const nodemailer = require("nodemailer");


export default class Mailer {
  constructor(config) {
    this.mailer = nodemailer.createTransport({
      host: config.hostName,
      port: config.port,
      secure: config.secure, 
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async sendMail(from, to, opts = {}){
      const subject = opts.subject || "";
      const text = opts.text || "";
      const html = opts.html || "";
      const result =  await this.mailer.sendMail({
        from , to, html, text,subject
      });

      return result.messageId != "";
    }
}