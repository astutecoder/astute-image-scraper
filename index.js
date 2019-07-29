const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');

// search url
 const url = 'https://www.google.com/search?q=plastic+bottles&rlz=1C1GGRV_enBD846BD846&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjBgOOEztfjAhUaSY8KHXQgCycQ_AUIESgB';

 // path to the image folder
 // please make sure you have created the folder first
 const image_folder_path = 'storage/plastic bottle';

 // delay between to clicks, smaller value scraps fast but return less image
 // try to set the value  between 100 - 500
 const click_delay = 100; // miliseconds

(async () => {
    try {
        const browser = await puppet.launch({ headless: false, defaultViewport: null });
        const page = await browser.newPage();
    
        await page.goto(url, { waitUntil: 'networkidle2'});

        console.info('starting scraping');

        console.time('evaluating: ');
        let images = await page.evaluate(async (delayDuration) => {
            const timeout  = () => (new Promise(function(resolve){
                    let interval = setInterval(function(){
                        if(document.body.scrollHeight !== (window.innerHeight + window.scrollY - 17)){
                            window.scrollTo(0, document.body.scrollHeight);
                            console.log('if');
                        } else if(document.querySelector('#smb')){
                            document.querySelector('#smb').click(); 
                            document.querySelector('#smb').remove();
                            console.log('else if');
                        }
                        else { 
                            console.log('else');
                            clearInterval(interval); 
                            resolve('done'); 
                        }
                    }, 1000)
                }));

            if(await timeout() === 'done'){
                window.scrollTo(0,0);

                function makeDelay(t = 10) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(true);
                        }, t);
                    })
                }

                const imageBoxes = Array.from(document.getElementsByClassName('rg_ic'));
                let i = 1;
                let imgSrc = [];
                async function makeClick(item) {                    
                     item.click();
                     await makeDelay(delayDuration);
                }

                for(imageBox of imageBoxes) {
                    imageBox.addEventListener('click', () => {
                        console.log('click click')
                        imgSrc.push(document.querySelectorAll('#irc_cc .irc_t.i30052 .irc_mic .irc_mimg.irc_hic')[1].querySelector('img').getAttribute('src'));
                    }, false);
                    await makeClick(imageBox);
                }
                let images = await imgSrc.filter((item, id)=>{
                    return item !== null && (imgSrc.indexOf(item) === id);
                })
                return await images;
            }
        }, click_delay);
        console.timeEnd('evaluating: ');
        console.info('found '+ images.length + ' unique images');
        
        var download = async function(uri, index){
            // var file_name = index +'_'+ uri.split('/').pop().split('?').shift();
            var file_name = index +'.jpg';
            request.get(uri)
                .on('error', (e) => console.dir(e) )
                .pipe(fs.createWriteStream(image_folder_path+'/'+file_name))
                .on('close', () => console.log('download complete:', file_name))            
        };
        
        console.info('starting to download images');
        
        async function storeImage(msg)
        {
            let i = 1;
            for(image of images){
                await download(image, i);
                i++;
            }
            console.info(msg)
        }
        await storeImage('Scraping complete. Please wait for event completion.')

        await browser.close();
    } catch(err) {
        console.dir(err);
    }
})();