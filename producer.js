const amqp = require("amqplib");
require("dotenv").config();

async function sendToQueue(emailData) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  const queue = "email_queue";

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), {
    persistent: true,
  });

  console.log("📤 Email job added to queue:", emailData);
  setTimeout(() => conn.close(), 500);
}

// Example usage:
sendToQueue({
  to: "jellybeantemp@gmail.com",
  subject: "Badge Awarded",
  text: "Hello from RabbitMQ & Node.js!",
});
