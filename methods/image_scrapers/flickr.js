let flickrImage = async (page, download_limit) => {
    let currentBrowser = await page.browser();
    let newPage = await currentBrowser.newPage();
    
    let initital_image_tab_url = await page.$$eval('.photo-list-photo-interaction > a', (images_container) => {
        let url_prefix = 'https://www.flickr.com';
        let url_supfix = 'sizes/h/'
        return images_container.map((image) => (url_prefix +''+ image.getAttribute('href')) +''+ url_supfix);
    });
    
    const downloadable = download_limit ? download_limit : initital_image_tab_url.length;
    let images = [];
    
    for(let i = 0; i < initital_image_tab_url.length; i++) {
        await newPage.goto(initital_image_tab_url[i], { waitUntil: 'networkidle2'})
        images.push(await newPage.$eval('#allsizes-photo > img', element => element.src));
        if( i === (downloadable-1) ) break;
    }
    newPage.close();
    return images;
}

module.exports = { flickrImage };