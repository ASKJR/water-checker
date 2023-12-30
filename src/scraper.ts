import cheerio from "cheerio";
import axios from "axios";
import { httpsAgent } from "./config/https"

/**
 * Check if a city in the state of Parana (Brazil) will be temporarily 
 * affected by a programmed lack of water and it prints the analysis 
 * results based on Sanepar news website.
 * @param   {string}           city      default is Curitiba
 */
export const startWebScraping = async(city: string = "Curitiba"): Promise<void> => {
  const baseUrl = `https://site.sanepar.com.br/paradas-no-abastecimento?name=${city}`;
  try {
    
    const response = await axios.get(baseUrl, { httpsAgent });
    const $=cheerio.load(response.data);
    const divInfoUtil = $('div.info_util');
    
    if (divInfoUtil.length == 0) {
      console.log(`A pesquisa não encontrou nenhuma parada `
      + `de abastecimento de àgua programada para ${city}.`);
    } else {
      divInfoUtil.each((index,div) => {
        let cityName = $(div).find('div.cidade').text();
        let startDate = $(div).find('span.date-display-start').text();
        let endDate = $(div).find('span.date-display-end').text();
        let msg = $(div).find('p').text();
        console.log(`#${index+1} - ${cityName} - ${startDate} a ${endDate} - ${msg}`);
      });
    }

  } catch (error) {
    console.error(error);
  }
}