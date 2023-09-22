import express from "express";
import { Telegraf } from "telegraf";
import {message}  from "telegraf/filters"

const app = express();

console.log(process.env.BOT_TOKEN)

if(process.env.BOT_TOKEN === undefined) {
    throw new TypeError("BOT_TOKEN must be provided!")
}

const bot  = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

app.get("/", function (_req, res) {
  return res.send("Parkour bot Up and running");
});

export default app;
