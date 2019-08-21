let googleImage = async (page) => {
    let googleImages = await page.evaluate(async () => {
        let imageBoxes = Array.from(document.querySelectorAll('a[jsname="hSRGPd"]'));
        let images = [];
        for(imageBox of imageBoxes) {
            let href = imageBox.getAttribute('href');
            let enc_url = String(href.split('=')[1]).replace('&imgrefurl','');
            let decoded_url = decodeURIComponent(enc_url);
    
            if(decoded_url.match(/^(http).+/)) images.push(decoded_url)
        }
        
        return images;
    });
    return googleImages;
}
module.exports = { googleImage };