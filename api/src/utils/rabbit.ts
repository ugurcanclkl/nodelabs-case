import amqp from "amqplib";

export let channel: amqp.Channel;

export async function initRabbit() {
  const conn = await amqp.connect(
    process.env.RABBITMQ_URL ?? "amqp://localhost:5672"
  );
  channel = await conn.createChannel();
  await channel.assertQueue("message_sending_queue", { durable: true });
  console.log("🐇  RabbitMQ channel ready");
}