const express = require("express");
const puppeteer = require('puppeteer');   
const cheerio = require('cheerio');


async function AliexpressProductScraper (productId)  {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        /** Scrape the aliexpress product page for details */
        await page.goto(`https://www.aliexpress.com/item/${productId}.html`);
        const aliExpressData = await page.evaluate(() => runParams);

        const data = aliExpressData.data;

        /** Scrape the description page for the product using the description url */
        const descriptionUrl = data.descriptionModule.descriptionUrl;
        await page.goto(descriptionUrl);
        const descriptionPageHtml = await page.content();

        /** Build the AST for the description page html content using cheerio */
        const $ = cheerio.load(descriptionPageHtml);
        const descriptionData = $('body').html();
        /** Build the JSON response with aliexpress product details */
        const json = {
            title: data.titleModule.subject,
            categoryId: data.actionModule.categoryId,
            productId: data.actionModule.productId,
            totalAvailableQuantity: data.quantityModule.totalAvailQuantity,
            description: descriptionData,
            orders: data.titleModule.tradeCount,
            storeInfo: {
                name: data.storeModule.storeName,
                companyId: data.storeModule.companyId,
                storeNumber: data.storeModule.storeNum,
                followers: data.storeModule.followingNumber,
                ratingCount: data.storeModule.positiveNum,
                rating: data.storeModule.positiveRate
            },
            ratings: {
                totalStar: 5,
                averageStar: data.titleModule.feedbackRating.averageStar,
                totalStartCount: data.titleModule.feedbackRating.totalValidNum,
                fiveStarCount: data.titleModule.feedbackRating.fiveStarNum,
                fourStarCount: data.titleModule.feedbackRating.fourStarNum,
                threeStarCount: data.titleModule.feedbackRating.threeStarNum,
                twoStarCount: data.titleModule.feedbackRating.twoStarNum,
                oneStarCount: data.titleModule.feedbackRating.oneStarNum
            },
            images:
                (data.imageModule &&
                    data.imageModule.imagePathList) ||
                [],
            specs: data.specsModule.props,
            currency: data.webEnv.currency,
            originalPrice: {
                min: data?.priceModule?.minAmount?.value,
                max: data?.priceModule?.maxAmount?.value
            },
            salePrice: {
                min: data?.priceModule?.minActivityAmount?.value,
                max: data?.priceModule?.maxActivityAmount?.value
            }
        };
        console.log(json);
        return descriptionData;

    } catch (error) {
        console.log('somthing error , please try again....', error);
    }
}


module.exports = AliexpressProductScraper;