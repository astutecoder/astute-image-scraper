const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');
const io = require('console-read-write');

const user_defined = require('./settings');

let showInputInfo = async (settings) => {
    user_defined.boxInfo('Your settings are as follows:', 1, '.',';');
    io.write('');
    io.write('{');
    io.write(' "Image Folder": "' + settings.path + '"');
    io.write(' "Image File Prefix": "' + settings.prefix + '"');
    io.write(' "Image File Name Start From": ' + settings.start_from);
    io.write(' "Download Limit (quantity)": ' + (settings.download_limit ? settings.download_limit : '"No Limit"'));
    (settings.search_by === '1') ? io.write(' "Search keyword": "' + settings.keyword + '"') : io.write(' "Search URL": "' + settings.url + '"');
    io.write('}')
}
let askConfirmation = async () => {
    let confirmation = (await io.ask('Is it ok? (Y/N)')).toLowerCase();
        
    while(!confirmation || !confirmation.match(/^(n|no|y|yes)$/) ){
        confirmation = await io.ask('Is it ok? (Y/N)');
    }
    return confirmation;
}

(async () => {
    try {
        let settings = await user_defined.settings();
        showInputInfo(settings);
        let confirmation = await askConfirmation();
        while(confirmation.toLowerCase().match(/^(n|no)$/) && !confirmation.toLowerCase().match(/^(y|yes)$/)){
            user_defined.boxInfo('Enter settings info one more time', 1, '-')
            settings = await user_defined.settings();
            showInputInfo(settings);
            confirmation = await askConfirmation();            
        }
        
        io.write('Processing....');

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

        user_defined.boxInfo('Scraping started. Please wait...', 2, '=') 

        let imageSrc = await page.evaluate(async () => {
            let infiniteScroll = () => {
                return (new Promise(resolve => {
                    let interval = setInterval(function(){
                        if(document.body.scrollHeight !== (window.innerHeight + window.scrollY)){
                            window.scrollTo(0, document.body.scrollHeight);
                        } else if(document.querySelector('#smb')){
                            document.querySelector('#smb').click(); 
                            document.querySelector('#smb').remove();
                        }
                        else { 
                            clearInterval(interval); 
                            resolve('done');
                        }
                    }, 1000);
                }))
            }
            
            await infiniteScroll();

            let imageBoxes = Array.from(document.querySelectorAll('a[jsname="hSRGPd"]'));

            let images = [];
            for(imageBox of imageBoxes) {
                let href = imageBox.getAttribute('href');
                let enc_url = String(href.split('=')[1]).replace('&imgrefurl','');

                images.push(decodeURIComponent(enc_url));
            }
            return images;
        });
        await browser.close();

        let downloadbale_count = settings.download_limit ? settings.download_limit : 'ALL'
        user_defined.boxInfo(`Total ${imageSrc.length} images found. Downloading ${downloadbale_count} of them.`, 1, '!', '¡');

        let download = (uri, file_prefix = '', start_number = 1) => {
            let file_name_with_prefix = file_prefix + '_' + start_number + '.jpg';
            let file_name_without_prefix = start_number + '.jpg';
            let file_name = file_prefix ? file_name_with_prefix : file_name_without_prefix;

            request.get(uri)
                .on('error', (e) => user_defined.boxInfo(e.message, 1, 'x') )
                .pipe(fs.createWriteStream(settings.path + '/' + file_name))
                .on('close', () => console.log('download complete:', file_name))            
        };

        let downloaded = 1;
        for(image of imageSrc){
            await download(image, settings.prefix, settings.start_from);
            
            if(downloaded === settings.download_limit) break;
            
            settings.start_from++;
            downloaded++;
        }

    } catch(err) {
        user_defined.boxInfo(err.message, '1', "x");
    }
})();