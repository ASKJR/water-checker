import dotenv from "dotenv";
import {ServerClient} from "postmark";
dotenv.config();

export const sendEmail = (
  message: string,
  subject?: string,
  from?: string,
  to?: string,
): void => {
  if (process.env.ENVIRONMENT !== "development") {
    const client = new ServerClient(process.env.POSTMARK_API_KEY ?? "");
    client.sendEmail({
      From: from ?? process.env.FROM_EMAIL ?? "",
      To: to ?? process.env.TO_EMAIL ?? "",
      Subject: subject ?? "Água status - Sanepar - Scraper",
      HtmlBody: message,
    });
  }
};
