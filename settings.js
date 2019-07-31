
const io = require('console-read-write');
const fs = require('fs');

let multiLevelFolder = (path) => {
    let segments = path.split('/').map( segment => segment.replace(/[\\\/\:\*\?\"\<\>\|]{1,}/, '').trim().toLowerCase() );
    for (let i = 0; i < segments.length; i++) {
        let folder = segments.slice(0, (i+1)).join('/');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
}

let inputs = async () => {
    multiLevelFolder('images')

    console.log('What will you provide to search images?');
    console.log('1. Keyword');
    console.log('2. URL');
    let provide_option = await io.ask('your answer is: (1/2)')
    
    while(!provide_option.match(/^(1|2)$/)){
        provide_option = await io.ask('your answer is: (1/2)')
    }
    io.write(' ');

    let image_folder_path = (await io.ask('Where to store images? [ folder\'s relative path ]'));    
    image_folder_path = image_folder_path.match(/^(images\/).+$/) ? image_folder_path : 'images/'+image_folder_path;
    while(image_folder_path === "images/"){
        image_folder_path = 'images/' + await io.ask('Where to store images? (mandatory)')
    }
    multiLevelFolder(image_folder_path);
    
    let name_prefix = await io.ask('File name prifix? (optional)');
    let start_number = await io.ask('File number to start from (optional):');
    let max_download = await io.ask('Download limit: [downloadable maximum number of files] (optional)');
    let url ='';
    let keyword ='';
    if(provide_option === '1') {
        keyword = await io.ask('Search keyword: ');
        while(!keyword){
            keyword = await io.ask('Search keyword: (mandatory)')
        }
        url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=isch`
    }else {
        url = await io.ask('Search url:');
        while(!url){
            url = await io.ask('Search url: (mandatory) ')
        }
    }

    return({
            search_by: provide_option,
            keyword: keyword,
            url: url,
            path: image_folder_path,
            prefix: name_prefix,
            start_from: start_number !== '' ? Number(start_number) : 1,
            download_limit: Number(max_download)
        })
};

let repeat = (str, symbol, no_of_repeat) => {
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
    repeat(msg, top_symbol, no_of_repeat);
    console.info(msg);
    repeat(msg, bottom_symbol, no_of_repeat)
}

module.exports.settings = inputs;
module.exports.boxInfo = boxInfo;
