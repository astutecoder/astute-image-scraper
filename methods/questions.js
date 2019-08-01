const io = require('console-read-write');
const fs = require('fs');

const helpers = require('./helpers');

let multiLevelFolderCreate = (path) => {
    let segments = path.split('/').map( segment => segment.replace(/[\\\/\:\*\?\"\<\>\|]{1,}/, '').trim().toLowerCase() );
    for (let i = 0; i < segments.length; i++) {
        let folder = segments.slice(0, (i+1)).join('/');
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
}

let qKeywordOrUrl = async () => {
    console.log('What will you provide to search images?');
    console.log('1. Keyword');
    console.log('2. URL');
    let provide_option = await io.ask('your answer is: (1/2)')
    
    while(!provide_option.match(/^(1|2)$/)){
        provide_option = await io.ask('your answer is: (1/2)')
    }
    io.write(' ');

    return provide_option;
}

let qImageFolderPath = async () => {
    let image_folder_path = (await io.ask('Where to store images? [ folder\'s relative path ]'));    
    image_folder_path = image_folder_path.match(/^(images\/).+$/) ? image_folder_path : 'images/'+image_folder_path;
    while(image_folder_path === "images/"){
        image_folder_path = 'images/' + await io.ask('Where to store images? (mandatory)')
    }
    multiLevelFolderCreate(image_folder_path);
    return image_folder_path;
}

let qURL = async (keyword_or_Url) => {
    let url, keyword = '';
    if(keyword_or_Url === '1') {
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
    return {
        url: url,
        keyword: keyword
    }
}

let questions = async () => {
    multiLevelFolderCreate('images')
    
    let keyword_or_Url = await qKeywordOrUrl();
    let image_folder_path = await qImageFolderPath();    
    let name_prefix = await io.ask('File name prifix? (optional)');
    let start_number = await io.ask('File number to start from (optional):');
    let max_download = await io.ask('Download limit: [downloadable maximum number of files] (optional)');
    let url_and_keyword = await qURL(keyword_or_Url);   

    return({
            search_by: keyword_or_Url,
            keyword: url_and_keyword.keyword,
            url: url_and_keyword.url,
            path: image_folder_path,
            prefix: name_prefix,
            start_from: start_number !== '' ? Number(start_number) : 1,
            download_limit: Number(max_download)
        })
};


let showInputInfo = async (settings) => {
    // await new Promise(resolve => {
        helpers.boxInfo('Your settings are as follows:', 1, '.',';');
        io.write('');
        io.write('{');
        io.write(' "Image Folder": "' + settings.path + '"');
        io.write(' "Image File Prefix": "' + settings.prefix + '"');
        io.write(' "Image File Name Start From": ' + settings.start_from);
        io.write(' "Download Limit (quantity)": ' + (settings.download_limit ? settings.download_limit : '"No Limit"'));
        (settings.search_by === '1') ? io.write(' "Search keyword": "' + settings.keyword + '"') : io.write(' "Search URL": "' + settings.url + '"');
        io.write('}')
        // resolve();
    // })
}
let askConfirmation = async () => {
    let confirmation = (await io.ask('Is it ok? (Y/N)')).toLowerCase();
        
    while(!confirmation || !confirmation.match(/^(n|no|y|yes)$/) ){
        confirmation = await io.ask('Is it ok? (Y/N)');
    }
    return confirmation;
}

module.exports = {
    questions,
    showInputInfo,
    askConfirmation
};