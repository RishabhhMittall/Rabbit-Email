const amqp = require("amqplib");
const nodemailer = require("nodemailer");
require("dotenv").config();

async function startConsumer() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  const queue = "email_queue";

  await channel.assertQueue(queue, { durable: true });
  console.log("⏳ Waiting for messages in", queue);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const emailData = JSON.parse(msg.content.toString());
      try {
        await sendEmail(emailData);
        console.log("✅ Email sent to", emailData.to);
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error sending email:", error.message);
        channel.nack(msg); // optionally retry
      }
    }
  });
}

async function sendEmail({ to, subject, text }) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}

startConsumer();
