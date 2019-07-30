const user_defined = require('./settings');
const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');
console.log(user_defined);
(async () => {
    try {
        const browser = await puppet.launch(
            {
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                } 
            }
        );
        const page = await browser.newPage();    
        await page.goto(user_defined.settings.url, { waitUntil: 'networkidle2'});

        console.info('scraping started');

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

        let download = async function(uri, file_prefix = '', start_number = 1){
            let file_name_with_prefix = file_prefix + '_' + start_number + '.jpg';
            let file_name_without_prefix = start_number + '.jpg';
            let file_name = file_prefix ? file_name_with_prefix : file_name_without_prefix;

            request.get(uri)
                .on('error', (e) => console.dir(e) )
                .pipe(fs.createWriteStream(user_defined.settings.path + '/' + file_name))
                .on('close', () => console.log('download complete:', file_name))            
        };

        let downloaded = 1;
        for(image of imageSrc){
            await download(image, user_defined.settings.prefix, user_defined.settings.start_from);
            user_defined.settings.start_from++;
            if(downloaded === user_defined.settings.download_limit) break;
            downloaded++;
        }

    } catch(err) {
        console.dir(err);
    }
})();