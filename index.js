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

app.get('/', (req, res) => res.send("Hello 3m elnas!"))

app.post('/scrapingData', async (req, res) => {
    const { urls} = req.body;

    axios(urls)
        .then(async (response) => {
            let aliProducts = [];
            const browser = await puppeteer.launch({
                headless: true,
                ignoreDefaultArgs: ['--disable-extensions']
            });
            const page = await browser.newPage();
        
            try {
                // await page.setUserAgent(userAgent.toString());
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
        
                    aliProducts.push(shippingPrice);
                }
                res.json({ message: "Done", aliProducts })
        
            } catch (e) {
                console.log('something error , please try again...', e)
        
            } finally {
                await browser.close();
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