import nodemailer from 'nodemailer'

async function sendEmail(to, subject, text, html) {
  console.log(process.env.EMAIL_PASSWORD)
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
  let info = await transporter.sendMail({
    from: '"TT_news" <2634027884@qq.com>',
    to,
    subject,
    text,
    html,
  })
  return info
}

export default sendEmail
