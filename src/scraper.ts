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
      httpsAgent,
    });
    const $ = cheerio.load(response.data);
    const divInfoUtil = $("div.info_util");
    let message = "";
    if (divInfoUtil.length === 0) {
      message =
        `A pesquisa não encontrou nenhuma parada ` +
        `de abastecimento de àgua programada para ${city}.`;
      console.log(message);
    } else {
      divInfoUtil.each((index, div) => {
        const cityName = $(div).find("div.cidade").text();
        const startDate = $(div).find("span.date-display-start").text();
        const endDate = $(div).find("span.date-display-end").text();
        const msg = $(div).find("p").text();
        message += `#${
          index + 1
        } - ${cityName} - ${startDate} a ${endDate} - ${msg}\n`;
      });
      console.log(message);
      sendEmail(message);
    }
  } catch (error) {
    console.error(error);
  }
};
