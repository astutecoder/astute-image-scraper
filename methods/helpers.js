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
        await new Promise(resolve => {
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