const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');

const { questions, showInputInfo, askConfirmation } = require('./methods/questions');
const { infiniteScroll, boxInfo, download } = require('./methods/helpers');
const { googleImage } = require('./methods/image_scrapers/google_image');


(async () => {
    try {
        let settings = await questions();
        showInputInfo(settings);
        let confirmation = await askConfirmation();
        while(confirmation.toLowerCase().match(/^(n|no)$/) && !confirmation.toLowerCase().match(/^(y|yes)$/)){
            boxInfo('Enter settings info one more time', 1, '-');
            settings = await questions();
            showInputInfo(settings);
            confirmation = await askConfirmation();
        }
        
        console.info('Processing....');

        const browser = await puppet.launch(
            {
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                } 
            }
        );
        const page = await browser.newPage();    
        await page.goto(settings.url, { waitUntil: 'networkidle2'});

        boxInfo('Scraping started. Please wait...', 2, '=') 

        await infiniteScroll(page);
        
        let imageSrc = await googleImage(page);
        
        await browser.close();

        let downloadbale_count = settings.download_limit ? settings.download_limit : 'ALL'
        boxInfo(`Total ${imageSrc.length} images found. Downloading ${downloadbale_count} of them.`, 1, '!', '¡');

        let downloaded = 1;
        for(image of imageSrc){
            await download(image, settings.path, settings.prefix, settings.start_from, request, fs);            
            if(downloaded === settings.download_limit) break;            
            settings.start_from++;
            downloaded++;
        }

    } catch(err) {
        boxInfo(err.message, '1', "x");
    }
})();