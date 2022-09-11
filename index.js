require('dotenv').config()
const express = require("express");
const cheerio = require('cheerio');
const { default: axios } = require('axios');

const port = process.env.PORT || 3000;


const app = express();

app.use(express.json())

const url = 'https://www.theguardian.com/us'

app.get('/', (req, res) => res.send("Hello World!"))

app.get('/home', async (req, res) => {
    const result = {};
    await axios().then(res => result = res)
    res.send({result})
})

// app.get('/scrapingData', async (req, res) => {

//     res.json({ message: "Done"})
// })

axios(url)
    .then(res => {
        const html = res.html;
        const $ = cheerio.load(html);
        const articles = []
        $('.fc-item__title' , html).each(function (){
            const title = $(this).text();
            const url = $(this).find('a').attr('href');
            articles.push({
                title , 
                url
            })
            
        })
        console.log({articles});
        return articles;
    }).catch(error => console.log(error))


app.listen(port, () =>  console.log(`server running on port.....${port}`))