require('dotenv').config()
const puppeteer = require("puppeteer");
const { Item } = require('./models')
const send_mail = require('./utils/mail')
const cron = require('node-cron')

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const explore = async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(true)
    await page.goto(`https://kyou.id/search?series=Kamen Rider&page=1&sort=newest`)
    .catch(e => {})
    await scrollPage(page)
    const items = await page.evaluate(async function() {
        var contents = []
        const gallery_product = document.querySelectorAll('div.gallery-product__content > div.gallery-product__content__product')
        gallery_product.forEach(product => {
            let content = product.querySelector('.product-thumbnail')
            let product_info = content.querySelector('.product-thumbnail__info ul')
            let product_link = content.querySelector('div.product-thumbnail__img a').getAttribute('href')

            contents.push({
                title: product_info.querySelector('.product-thumbnail__info__name').textContent,
                status: product_info.querySelector('.product-thumbnail__info__status').textContent,
                link: "https://kyou.id" + product_link,
                image: content.querySelector('div.product-thumbnail__img > a > div > img').getAttribute('src'),
                release: product_info.querySelector('.product-thumbnail__info__release').textContent,
                price: {
                    price: product_info.querySelector('.product-thumbnail__info__price span.price').textContent,
                    down_payment: product_info.querySelector('.product-thumbnail__info__price span.dp').textContent
                }
            })
        });
        return contents
    })
    await browser.close()
    return items
}

const scrollPage = async(page) => {
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    // Scroll one viewport at a time, pausing to let content load
    const viewportHeight = page.viewport().height;
    let viewportIncr = 0;
    while (viewportIncr + viewportHeight < height) {
        await page.evaluate(_viewportHeight => {
            window.scrollBy(0, _viewportHeight);
        }, viewportHeight);
        viewportIncr = viewportIncr + viewportHeight;
        await timeout(10);
    }
}

async function start() {
    let item = await explore()
    item.forEach(async element => {
        var id = element.link.split('/')[4]
        await Item.findOne({id: id}).then(async p => {
            if(p) {
                console.log(id+" exist")
                return p
            } else {
                console.log(id+" NEW!")
                textmail = `Hi Bayu, ada khilafan baru nih yg namanya ${element.title}

Status: ${element.status}
Release: ${element.release}
Price: ${element.price.price} [${element.price.down_payment}]

${element.link}

Regards,
bayun.id
`
                let dataEmail = {
                    to: process.env.EMAIL_TO,
                    subject: "Item baru - " + element.title,
                    message: textmail
                }
                await Item.create({
                    id: id,
                    title: element.title,
                    status: element.status,
                    link: element.link,
                    image: element.image,
                    release: element.release,
                    price: element.price.price,
                    down_payment: element.price.down_payment
                }).then(c => {
                    send_mail(dataEmail)
                })
            }
        })
    });
}

cron.schedule('0 * * * *', () => {
    console.log("START")
    console.log("--------------")
    start()
})

console.info("Service is running, press CTRL+C to stop.")