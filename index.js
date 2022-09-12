require('dotenv').config()
const express = require("express");
const puppeteer = require('puppeteer');
const { nanoid } = require('nanoid');
const port = process.env.PORT || 3000;
const { default: axios } = require('axios');
// var userAgent = require("user-agents");

const aliExpressScraper = require('./aliexpressProductScraper')

const app = express();

app.use(express.json())

const url = 'https://ar.aliexpress.com/item/1005004688271277.html?spm=a2g0o.productlist.0.0.35b47183QbAsuX&algo_pvid=5a130f7d-46f2-44a1-93c5-46f09ada27aa&aem_p4p_detail=202209111616514305986719120740013361830&algo_exp_id=5a130f7d-46f2-44a1-93c5-46f09ada27aa-1&pdp_ext_f=%7B%22sku_id%22%3A%2212000030135698102%22%7D&pdp_npi=2%40dis%21EGP%21560.17%21280.08%21%21%211379.73%21%21%4021135c3416629382116772018e93ca%2112000030135698102%21sea&curPageLogUid=gWOZ7YGSLMlh&ad_pvid=202209111616514305986719120740013361830_2'

app.get('/', (req, res) => res.send("Hello 3m elnas!"))

app.get('/scrapingData', async (req, res) => {
    // const { urls} = req.body;

    axios(url)
        .then(async (response) => {
            let aliProducts = [];
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--use-gl=egl'],
            });
            const page = await browser.newPage();

            try {

                await page.goto(url, {
                    waitUntil: 'networkidle2', timeout: 0
                });
                const id = Number(url.split('/')[4].split('.')[0]);
                const aliProduct = await aliExpressScraper(id);
                aliProduct.sku = nanoid();
                if (aliProduct.salePrice === undefined) {
                    aliProduct.salePrice = ''
                }
                aliProduct.productUrl = url;


                let [el] = await page.$x('//*[@class="product-dynamic-shipping"]/div/div/div/span/strong/span');
                let txt = await el?.getProperty('textContent');
                let shipping = await txt?.jsonValue()
                let shippingPrice = Number(shipping?.toString().replace(/[^0-9.]/g, ''));
                aliProduct.shippingPrice = shippingPrice;

                aliProducts.push(shippingPrice);

                res.json({ message: "Done", aliProducts })

            } catch (e) {
                console.log('something error , please try again...', e)

            }
        })

})


// const scrapProduct = async (urls) => {

//     let aliProducts = [];
//     const browser = await puppeteer.launch({
//         headless: true,
//         ignoreDefaultArgs: ['--disable-extensions']
//     });
//     const page = await browser.newPage();

//     try {
//         // await page.setUserAgent(userAgent.toString());
//         for (let i = 0; i < urls.length; i++) {
//             await page.goto(urls[i], {
//                 waitUntil: 'networkidle2', timeout: 0
//             });
//             // const id = Number(urls[i].split('/')[4].split('.')[0]);
//             // const aliProduct = await aliExpressScraper(id);
//             // aliProduct.sku = nanoid();
//             // if (aliProduct.salePrice === undefined) {
//             //     aliProduct.salePrice = ''
//             // }
//             // aliProduct.productUrl = urls[i];


//             let [el] = await page.$x('//*[@class="product-dynamic-shipping"]/div/div/div/span/strong/span');
//             let txt = await el?.getProperty('textContent');
//             let shipping = await txt?.jsonValue()
//             let shippingPrice = Number(shipping?.toString().replace(/[^0-9.]/g, ''));
//             // aliProduct.shippingPrice = shippingPrice;

//             aliProducts.push(shippingPrice);
//         }

//         // console.log(aliProducts);
//         return aliProducts;

//     } catch (e) {
//         // res.send({ data: null });
//         console.log('something error , please try again...', e)

//     } finally {
//         await browser.close();
//     }


// }

app.listen(port, () => {
    console.log("running.....");
})