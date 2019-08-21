let msgDecorator = (str, symbol, no_of_repeat) => {
    let divider = '';
    let j = 0;
    let count = str.length < 10 ? 10 : str.length;
    for( let i = 0; i < count; i++){
        divider += symbol;
    }
    while(j < no_of_repeat){
        console.info(divider);
        j++;
    }
}

let boxInfo = (msg, no_of_repeat = 1, top_symbol = '=', bottom_symbol = top_symbol) => {
    console.info('');
    msgDecorator(msg, top_symbol, no_of_repeat);
    console.info(msg);
    msgDecorator(msg, bottom_symbol, no_of_repeat)
}

async function infiniteScroll (page) {
    await page.evaluate(async () => {
        let loadmoreClick = (element) => {
            if(element) {
                element.click();
                element.remove();
            }
        }
        await new Promise(resolve => {
            let totalHeight = 0;
            let distance = 100;
            let interval = setInterval(async () => {
                let scrolled_distance = window.innerHeight + window.scrollY + distance;
                window.scrollBy(0, distance);
                totalHeight += distance;
                
                loadmoreClick(document.querySelector('#smb'));
                loadmoreClick(document.querySelector('.infinite-scroll-load-more'));
                
                if(document.body.scrollHeight <= (scrolled_distance + 150)){
                    window.scrollTo(0, scrolled_distance - 200);
                    await new Promise(resolve =>{
                        setTimeout(() => resolve(), 2500);
                    });
                }
                if((document.body.scrollHeight <= (scrolled_distance)) && !(document.querySelector('.flickr-dots'))) { 
                    clearInterval(interval); 
                    resolve('done');
                }
            }, 100);
        });
    });
}

let download = (uri, path, file_prefix = '', start_number = 1, request, fs) => {
    let file_name_with_prefix = file_prefix + '_' + start_number + '.jpg';
    let file_name_without_prefix = start_number + '.jpg';
    let file_name = file_prefix ? file_name_with_prefix : file_name_without_prefix;

    request.get(uri)
        .on('error', (e) => boxInfo(e.message, 1, 'x') )
        .pipe(fs.createWriteStream(path + '/' + file_name))
        .on('close', () => console.log('download complete:', file_name))            
};

module.exports = { infiniteScroll, boxInfo, download };