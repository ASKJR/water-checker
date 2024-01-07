import cheerio from "cheerio";
import axios, {type AxiosResponse} from "axios";
import {httpsAgent} from "./config/https";
import {sendEmail} from "./notification";

/**
 * Check if a city in the state of Parana (Brazil) will be temporarily
 * affected by a programmed lack of water and it prints the analysis
 * results based on Sanepar news website.
 * @param   {string}           city      default is Curitiba
 */
export const startWebScraping = async (
  city: string = "Curitiba",
): Promise<void> => {
  const baseUrl = `https://site.sanepar.com.br/paradas-no-abastecimento?name=${city}`;
  try {
    const response: AxiosResponse<string> = await axios.get<string>(baseUrl, {
      headers: {},
      httpsAgent,
    });
    const $ = cheerio.load(response.data);
    const divInfoUtilUl = $("div.info_util").find("ul");
    let htmlMessage = "";
    if (divInfoUtilUl.length === 0) {
      htmlMessage =
        `A pesquisa não encontrou nenhuma parada ` +
        `de abastecimento de àgua programada para ${city}.`;
      console.log(htmlMessage);
    } else {
      divInfoUtilUl.find("li").each((index, div) => {
        const cityName = $(div).find("div.cidade").text();
        const singleDate = $(div).find("span.date-display-single");
        let date = singleDate.text();
        if (singleDate.length === 0) {
          const startDate = $(div).find("span.date-display-start").text();
          const endDate = $(div).find("span.date-display-end").text();
          date = `${startDate} a ${endDate}`;
        }
        const msg = $(div).find("p").text();
        htmlMessage += `#${
          index + 1
        } - ${cityName} - ${date} - ${msg}.<br />\n`;
      });
      console.log(htmlMessage);
      sendEmail(htmlMessage);
    }
  } catch (error) {
    console.error(error);
  }
};
