const puppet = require('puppeteer');
const fs = require('fs');
const request = require('request');

 const url = 'https://www.google.com/search?q=plastic+bottles&rlz=1C1GGRV_enBD846BD846&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjBgOOEztfjAhUaSY8KHXQgCycQ_AUIESgB';

 const speed = 100;

 (async () => {
    try {
        const browser = await puppet.launch({ headless: false, defaultViewport: null });
        const page = await browser.newPage();
    
        await page.goto(url, { waitUntil: 'networkidle2'});
    
        // const scrollComplete =  await timeout();

        console.info('starting scraping');

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
                console.log(imageBoxes.length);
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
                console.log(images);
                return await images;
            }
        }, speed);
        console.info('found '+images.length)+ ' unique images';
        
        await browser.close();    

        
        var download = async function(uri){
            var file_name = uri.split('/').pop().split('?').shift();
            await request.get(uri)
                .on('error', function(e) {console.dir(e)})
                .pipe(fs.createWriteStream('storage/'+file_name))
                .on('close', () => {
                    console.log('download complete:', file_name);
                })
        };        
        
        // download('https://inhabitat.com/wp-content/blogs.dir/1/files/2018/03/bottled-water-plastics-study.jpg', 'file_a');
        
        console.info('starting to download images');
        
        for(image of images){
            await download(image);
        }
        console.info('scraping complete');
    } catch(err) {
        console.dir(err);
    }
})();