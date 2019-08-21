let flickrImage = async (page, download_limit) => {
    let currentBrowser = await page.browser();
    // let newPage = await currentBrowser.newPage();
    
    let initital_image_tab_url = await page.$$eval('.photo-list-photo-interaction > a', (images_container) => {
        let url_prefix = 'https://www.flickr.com';
        let url_supfix = 'sizes/l/'
        return images_container.map((image) => (url_prefix +''+ image.getAttribute('href')) +''+ url_supfix);
    });

    console.info(`\nFound ${initital_image_tab_url.length} images. Please Have patience while we process all the data\n`);
    
    const downloadable = download_limit && download_limit < initital_image_tab_url.length ? download_limit : initital_image_tab_url.length;
    let images = [];

    for(let i = 0; i < downloadable; i++) {
        await page.goto(initital_image_tab_url[i])
        images.push(await page.$eval('#allsizes-photo > img', element => element.src));
        console.log(`\nFetching image data of: ${images[i]}`);
        if( i === (downloadable-1) ) break;
    }
    // newPage.close();
    return images;
}

module.exports = { flickrImage };