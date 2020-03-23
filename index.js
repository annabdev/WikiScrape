// Import the modules we need
const rp = require("request-promise");
const otcsv = require("objects-to-csv");
const cheerio = require("cheerio");

// Define the URLS we will be scraping
const baseURL = "https://en.wikipedia.org";
const countriesURL = "/wiki/List_of_European_countries_by_population";

// Define the method for collecting the data
const getCountriesData = async () => {
  const html = await rp(baseURL + countriesURL);

  const countriesMap = cheerio("tr > td:nth-child(2) > a", html)
    .map(async (index, element) => {
      const link = baseURL + element.attribs.href; // Get the link for the country
      const name = element.children[0].data; // Get the country name
      const innerHTML = await rp(link);
      const tableHead = cheerio("tr > th", innerHTML);
      var capital;
      if (
        tableHead
          .text()
          .toLowerCase()
          .includes("capital")
      ) {
        const td = tableHead.next();
        const a = cheerio("a", td).first();
        capital = a.text();
        return {
          name,
          link,
          capital
        };
      }
    })
    .get();
  return Promise.all(countriesMap);
};

// Call the method
getCountriesData()
  .then(data => {
    const transformed = new otcsv(data);
    return transformed.toDisk("./countryData.csv");
  })
  .then(() => {
    console.log("Web Scrape Complete!");
  })
  .catch(error => {
    console.log(error);
  });