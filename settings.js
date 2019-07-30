// please make sure you have created the folder first
let image_folder_path = 'storage/plastic bottle';

let name_prefix = 'plastic_bottle';

let start_number = 1; // file number to start with

let max_download = 1000; // maximum number of files to be downloaded

// search url
url = 'https://www.google.com/search?q=plastic+bottles&rlz=1C1GGRV_enBD846BD846&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjBgOOEztfjAhUaSY8KHXQgCycQ_AUIESgB';




module.exports.settings = {
    url: url,
    path: image_folder_path,
    prefix: name_prefix,
    start_from: start_number,
    download_limit: max_download
}