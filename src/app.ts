import express from "express";
import { Composer, Markup, Scenes, Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import prisma from "./lib/prisma";
import { Prisma } from "@prisma/client";
import { bold, fmt } from "telegraf/format";

const app = express();
interface MyWizardSession extends Scenes.WizardSessionData {
  // will be available under `ctx.scene.session.myWizardSessionProp`
  myWizardSessionProp: number;
  title: string;
  description: string;
  compensation: number;
  data: {};
}

type MyContext = Scenes.WizardContext<MyWizardSession>;

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided!");
}

const cmdList = `
/start - Start the bot
/help - Show help
/post - Post a ⚡snap job
/jobs - Show all ⚡snap jobs
`;

const keyboard = Markup.inlineKeyboard([
  //   Markup.button.url("❤️", "http://telegraf.js.org"),
  Markup.button.callback("Next", "next"),
]);

const stepHandler = new Composer<MyContext>();
stepHandler.action("next", async (ctx) => {
  await ctx.reply("Step 2. Via inline button");
  return ctx.wizard.next();
});
stepHandler.command("next", async (ctx) => {
  await ctx.reply("Step 2. Via command");
  return ctx.wizard.next();
});
stepHandler.use((ctx) =>
  ctx.replyWithMarkdown("Press `Next` button or type /next")
);

const superWizard = new Scenes.WizardScene(
  "super-wizard",
  async (ctx) => {
    await ctx.reply("You can post job by entering the title", keyboard);
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply("Great! Let's create a snap job post.");
    ctx.reply("Please enter the title of the job post:");
    return ctx.wizard.next();
  },
  async (ctx) => {
      if (ctx.has(message("text"))) {
      while(ctx.update.message.text === "") ctx.reply("Please enter the title of the job post:");
      ctx.scene.session.title = ctx.update.message.text;
      }
    ctx.reply("Please enter the description of the job post:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.description = ctx.update.message.text;
    ctx.reply("Please enter the compensation: (💲)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.compensation = parseInt(ctx.update.message.text);

    const { title, description, compensation } = ctx.scene.session;
    const data: Prisma.JobCreateInput = {
      title,
      description,
      compensation,
    };
    try {
      await prisma.job.create({
        data,
      });
    } catch (error) {
        await ctx.reply("We sorry, we could not create your ")
    await ctx.reply("Done");
    return await ctx.scene.leave();
    }
    ctx.scene.session.data = data;
    // const { title, description, compensation } = ctx.scene.session;
    await ctx.reply(
      fmt`🎉! Job post successful 🚀, find details:
Title: ${bold`${title}`}
Description: ${bold`${description}`}
Compensation: ${bold`💲${ compensation}`}
    `,
      keyboard
    );
    return await ctx.scene.leave();
  },
  stepHandler
);

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([superWizard], {
  default: "super-wizard",
});
bot.use(session());
bot.use(stage.middleware());

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

app.get("/", function (_req, res) {
  return res.send("Parkour bot Up and running");
});

export default app;
