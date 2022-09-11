const express = require("express");
const puppeteer = require('puppeteer');
const { nanoid } = require('nanoid');
const cheerio = require('cheerio');

const aliExpressScraper = require('./aliexpressProductScraper')



const app = express();
const port = 3000

app.use(express.json())

app.get('/', (req, res) => res.send("Hello World!"))

app.post('/scrapingData', async (req, res) => {
    const { urls } = req.body;

    let result = await scrapProduct(urls)



    res.json({ message: "Done", result })
})


const scrapProduct = async (urls) => {

    let aliProducts = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        for (let i = 0; i < urls.length; i++) {
            await page.goto(urls[i], {
                waitUntil: 'networkidle2', timeout: 0
            });
            const id = Number(urls[i].split('/')[4].split('.')[0]);
            const aliProduct = await aliExpressScraper(id);
            aliProduct.sku = nanoid();
            if (aliProduct.salePrice === undefined) {
                aliProduct.salePrice = ''
            }
            aliProduct.productUrl = urls[i];


            let [el] = await page.$x('//*[@class="product-dynamic-shipping"]/div/div/div/span/strong/span');
            let txt = await el?.getProperty('textContent');
            let shipping = await txt?.jsonValue()
            let shippingPrice = Number(shipping?.toString().replace(/[^0-9.]/g, ''));
            aliProduct.shippingPrice = shippingPrice;

            aliProducts.push(aliProduct);
        }

        console.log(aliProducts);
        return aliProducts;

    } catch (e) {
        // res.send({ data: null });
        console.log('something error , please try again...' , e)

    } finally {
        await browser.close();
    }


}

scrapProduct(['https://ar.aliexpress.com/item/1005003677394621.html?spm=a2g0o.productlist.0.0.72514ec6nUnXs1&algo_pvid=747ea142-1d79-42ee-92ea-c541c16d0ada&aem_p4p_detail=20220911032835136422655449760010522971&algo_exp_id=747ea142-1d79-42ee-92ea-c541c16d0ada-1&pdp_ext_f=%7B%22sku_id%22%3A%2212000029514508558%22%7D&pdp_npi=2%40dis%21EGP%212416.18%212416.18%21%21%2170.36%21%21%402101e9d116628921153727901e3e44%2112000029514508558%21sea&curPageLogUid=JWymV3Edoj4P&ad_pvid=20220911032835136422655449760010522971_2'])

// const scraper = async (productId) => {

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     try {
//         /** Scrape the aliexpress product page for details */
//         await page.goto(`https://www.aliexpress.com/item/${productId}.html`);
//         const aliExpressData = await page.evaluate(() => runParams);

//         const data = aliExpressData.data;

//         /** Scrape the description page for the product using the description url */
//         const descriptionUrl = data.descriptionModule.descriptionUrl;
//         await page.goto(descriptionUrl);
//         const descriptionPageHtml = await page.content();

//         /** Build the AST for the description page html content using cheerio */
//         const $ = cheerio.load(descriptionPageHtml);
//         const descriptionData = $('body').html();
//         /** Build the JSON response with aliexpress product details */
//         const json = {
//             title: data.titleModule.subject,
//             categoryId: data.actionModule.categoryId,
//             productId: data.actionModule.productId,
//             totalAvailableQuantity: data.quantityModule.totalAvailQuantity,
//             description: descriptionData,
//             orders: data.titleModule.tradeCount,
//             storeInfo: {
//                 name: data.storeModule.storeName,
//                 companyId: data.storeModule.companyId,
//                 storeNumber: data.storeModule.storeNum,
//                 followers: data.storeModule.followingNumber,
//                 ratingCount: data.storeModule.positiveNum,
//                 rating: data.storeModule.positiveRate
//             },
//             ratings: {
//                 totalStar: 5,
//                 averageStar: data.titleModule.feedbackRating.averageStar,
//                 totalStartCount: data.titleModule.feedbackRating.totalValidNum,
//                 fiveStarCount: data.titleModule.feedbackRating.fiveStarNum,
//                 fourStarCount: data.titleModule.feedbackRating.fourStarNum,
//                 threeStarCount: data.titleModule.feedbackRating.threeStarNum,
//                 twoStarCount: data.titleModule.feedbackRating.twoStarNum,
//                 oneStarCount: data.titleModule.feedbackRating.oneStarNum
//             },
//             images:
//                 (data.imageModule &&
//                     data.imageModule.imagePathList) ||
//                 [],
//             specs: data.specsModule.props,
//             currency: data.webEnv.currency,
//             originalPrice: {
//                 min: data?.priceModule?.minAmount?.value,
//                 max: data?.priceModule?.maxAmount?.value
//             },
//             salePrice: {
//                 min: data?.priceModule?.minActivityAmount?.value,
//                 max: data?.priceModule?.maxActivityAmount?.value
//             }
//         };
//         console.log(json);
//         return json;

//     } catch (error) {
//         console.log('somthing error , please try again....', error);
//     }
// }

// scraper(1005003677394621);


app.listen(port, () => {
    console.log("running.....");
})