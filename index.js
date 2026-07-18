require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const ADMIN_ID = Number(process.env.ADMIN_ID);
const CHANNEL_ID = process.env.CHANNEL_ID;

const waiting = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Halo! 👋\n\nKirim /menfess untuk mengirim menfess."
  );
});

bot.onText(/\/menfess/, (msg) => {
  waiting[msg.chat.id] = true;
  bot.sendMessage(msg.chat.id, "Silakan kirim isi menfess kamu.");
});

bot.on("message", async (msg) => {
  if (!waiting[msg.chat.id]) return;
  if (msg.text.startsWith("/")) return;

  waiting[msg.chat.id] = false;

  bot.sendMessage(
    ADMIN_ID,
    `📩 Menfess baru\n\n${msg.text}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Approve",
              callback_data: "approve|" + msg.text
            },
            {
              text: "❌ Reject",
              callback_data: "reject"
            }
          ]
        ]
      }
    }
  );

  bot.sendMessage(msg.chat.id, "✅ Menfess berhasil dikirim. Tunggu admin approve.");
});

bot.on("callback_query", async (query) => {
  const data = query.data;

  if (data.startsWith("approve|")) {
    const text = data.split("|")[1];

    await bot.sendMessage(CHANNEL_ID, `💌 MENFESS\n\n${text}`);

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      }
    );

    bot.answerCallbackQuery(query.id, {
      text: "Berhasil diposting!"
    });
  }

  if (data === "reject") {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      }
    );

    bot.answerCallbackQuery(query.id, {
      text: "Menfess ditolak."
    });
  }
});
