const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');

const { questions, showInputInfo, askConfirmation } = require('./methods/questions');
const { infiniteScroll, boxInfo, download } = require('./methods/helpers');
const { googleImage, flickrImage } = require('./methods/image_scrapers');


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
        
        console.info('\nProcessing....\n');
        
        switch(settings.source) {
            case '1': if(!settings.url.match(/^(https?:\/\/(www.)?google.com).+(\&tbm=isch)/)){
                boxInfo(`\nYou have provided wrong URL\n${settings.url}`, 3, '?');
                return;
            } break;
            case '2': if(!settings.url.match(/^(https?:\/\/(www.)?flickr.com\/search\/\?text\=)/)){
                boxInfo('\nYou have provided wrong URL\n', 3, '?');
                return;
            } break;
            default: break;
        }

        const browser = await puppet.launch(
            {
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                } 
            }
        );
        const page = await browser.newPage();    
        
        await page.goto(settings.url);

        boxInfo('Scraping started. Please wait...', 2, '=') 

        await infiniteScroll(page);
        
        let imageSrc = [];
        switch (settings.source) {
            case '1'    : imageSrc = await googleImage(page); break;
            case '2'    : imageSrc = await flickrImage(page, settings.download_limit); break;
            default     : imageSrc = await googleImage(page); break;
        }

        await browser.close();

        if(!imageSrc.length) {
            boxInfo('\nSome thing went wrong. Please Try again later\n', 1, '/', '\\');
            return;
        }
        
        let downloadbale_count = settings.download_limit ? settings.download_limit : 'ALL';
        boxInfo(`Total ${imageSrc.length} images found. Downloading ${ typeof downloadbale_count !== 'number' || (downloadbale_count <= imageSrc.length) ? downloadbale_count : imageSrc.length } of them.`, 1, '!', '¡');

        let downloaded = 1;
        for(image of imageSrc){
            await download(image, settings.path, settings.prefix, settings.start_from, request, fs);            
            if(downloaded === settings.download_limit) break;            
            settings.start_from++;
            downloaded++;
        }

    } catch(err) {
        boxInfo(err.message, '1', "x");
        return;
    }
})();