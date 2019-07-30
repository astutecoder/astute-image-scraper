
const io = require('console-read-write');
const fs = require('fs');

let multiLevelFolder = (path) => {
    let segments = path.split('/').map( segment => segment.replace(/[\\\/\:\*\?\"\<\>\|]{1,}/, '') );
    for (let i = 0; i < segments.length; i++) {
        let folder = segments.slice(0, (i+1)).join('/');
        if (!fs.existsSync(folder)){
            fs.mkdirSync(folder);
        }
    }
}

let inputs = async () => {
    multiLevelFolder('images')
    let image_folder_path = (await io.ask('Where to store images? [ folder\'s relative path ]'));    
    image_folder_path = image_folder_path.match(/^(images\/).+$/) ? image_folder_path : 'images/'+image_folder_path;
    while(image_folder_path === "images/"){
        image_folder_path = 'images/' + await io.ask('Where to store images? [ you can not skip this :( ]')
    }
    multiLevelFolder(image_folder_path);
    
    let name_prefix = await io.ask('File name prifix? [ you can skip this :) ]');
    let start_number = await io.ask('File number to start from: ');
    let max_download = await io.ask('Download limit: [ maximum number of files]');
    
    let url = await io.ask('Search url:');
    while(!url){
        url = await io.ask('Search url: [ you can not skip this :( ] ')
    }

    return({
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
    repeat(msg, top_symbol, no_of_repeat)
    console.info(msg);
    repeat(msg, bottom_symbol, no_of_repeat)
}

module.exports.settings = inputs;
module.exports.boxInfo = boxInfo;
