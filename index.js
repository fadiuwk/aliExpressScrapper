require('dotenv').config()
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require('cors');
const port = process.env.PORT || 3000;

const aliExpressScraper = require("./aliexpressProductScraper")

const app = express();

app.use(cors({
    origin: '*'
}), express.json())

app.get('/', cors(), (req, res) => res.send("Hello World!"))

app.post('/scrapingData', cors(), async (req, res) => {
    const { urls } = req.body;
    console.log("urls", urls);
    let result = await scrapProduct(urls)
    res.json(result)
})

const scrapProduct = async (urls) => {
    let aliProducts = [];
    console.log("1");
    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/chromium',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=egl'],
        ignoreDefaultArgs:
            ['--disable-extensions']
    });
    console.log("2");

    const page = await browser.newPage();
    console.log("3");

    try {
        for (let i = 0; i < urls?.length; i++) {
            console.log("4");

            console.log("4", urls[i]);


            await page.goto(urls[i], {
                waitUntil: 'load'
            });

            
            const id = Number(urls[i].split('/')[4].split('.')[0]);
            console.log("5");

            const aliProduct = await aliExpressScraper(id);
            // aliProduct.sku = nanoid();
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
        console.log("6");

        return aliProducts;
    } catch (e) {
        console.log("7");

        console.log('something error , please try again...', e)

    } finally {
        console.log("8");

        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Node Express server listening on :${port}`);
})
