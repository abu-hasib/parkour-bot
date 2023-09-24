import express from "express";
import { Composer, Markup, Scenes, Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { bold, fmt, italic } from "telegraf/format";
import jobCreatePrisma from "./utils/db/job/jobCreatePrisma";
import prisma from "./lib/prisma";
import OpenAI from "openai";
import generatePrompt from "./utils/db/generate";

const openai = new OpenAI({
  apiKey: process.env.GPT_KEY,
});

const app = express();
interface MyWizardSession extends Scenes.WizardSessionData {
  // will be available under `ctx.scene.session.myWizardSessionProp`
  myWizardSessionProp: number;
  title: string;
  description: string;
  compensation: number;
  location: string;
  years: number;
  company: string;
  completion: string;
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
    await ctx.reply("👀 Great! Let's create your job post.");
    await ctx.reply("What role are you hiring");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text"))) {
      ctx.scene.session.title = ctx.update.message.text;
    }
    await ctx.reply("📁Saved, please enter the description for the job");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.description = ctx.update.message.text;
    await ctx.reply("📁Saved, please enter compensation(💲)");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.compensation = parseInt(ctx.update.message.text);
    await ctx.reply("📁Saved, how many years experience");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.years = parseInt(ctx.update.message.text);
    ctx.reply("📁Saved, what is your company called");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.has(message("text")))
      ctx.scene.session.company = ctx.update.message.text;
    await ctx.reply(
      'Based on your info,can I show you an improved "description"',
      Markup.inlineKeyboard([
        Markup.button.callback("No, I'm OK", "delete"),
        Markup.button.callback("Show me", "next"),
      ])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const { description, title, years } = ctx.scene.session;
    const completions = await openai.completions.create({
      model: "text-davinci-003",
      prompt: generatePrompt(`${description} ${title} ${years}`),
      max_tokens: 50,
    });
    ctx.scene.session.completion = completions.choices[0].text;
    console.log({ response: completions.choices[0].text });
    await ctx.reply(
      ctx.scene.session.completion,
      Markup.inlineKeyboard([Markup.button.callback("Use it", "next")])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const { title, description, completion, compensation, company, years } =
      ctx.scene.session;
    try {
      await jobCreatePrisma(title, completion, compensation, company, years);
    } catch (error) {
      console.error({ error });
      await ctx.reply("We sorry, we could not create your ");
      await ctx.reply("Done");
      return await ctx.scene.leave();
    }
    // const { title, description, compensation } = ctx.scene.session;
    await ctx.reply(
      fmt`🎉! Job post successful 🚀, find details:

Title: ${bold`${title}`}
Description: ${bold`${completion}`}
Compensation: ${bold`💲${compensation}`}
Years of experience: ${bold`${years}`}
Your company🏢 name: ${bold`💲${company}`}
    `
    );
    return await ctx.scene.leave();
  },
  stepHandler
);

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([superWizard], {
  default: "super-wizard",
});

bot.start((ctx) => {
  ctx.reply("Welcome to Parkour");
  ctx.reply(cmdList);
});

bot.command("post", (ctx) => {
  ctx.scene.enter("super-wizard");
});

bot.command("jobs", async (ctx) => {
  const jobs = await prisma.job.findMany();
  if (jobs.length === 0)
    ctx.reply(
      "💔 Apologies, we do not have new jobs at the moment, check back."
    );

  jobs.map((job) => {
    const post = fmt`
${bold`${job.title} в ${job.company}`}
${italic`${job.location}, ${job.years} years of experience`}
${italic`${job.description}`}
${`Salary: ${job.compensation}`}
        `;
    const replyMarkup = Markup.inlineKeyboard([
      Markup.button.callback("Apply", `apply_${job.id}`),
    ]);
    ctx.reply(post, replyMarkup);
  });
  bot.action(/^apply_(\d+)$/, (ctx) => {
    const jobId = ctx.match[1]; // Extract the job ID from the callback data
    ctx.answerCbQuery("Applied Successfully"); // Respond to the button press
  });
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
