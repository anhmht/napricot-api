"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getUrlPreview", {
    enumerable: true,
    get: function() {
        return getUrlPreview;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _jsdom = require("jsdom");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const getUrlPreview = async (req, res, next)=>{
    try {
        const { url } = req.query;
        if (!url) {
            res.status(400).json({
                error: true,
                message: 'URL is required'
            });
            return next(new Error('URL is required'));
        }
        // Fetch the HTML content of the URL
        const response = await _axios.default.get(url);
        const html = response.data;
        // Suppress JSDOM CSS parse warnings
        const virtualConsole = new _jsdom.VirtualConsole();
        virtualConsole.sendTo(console, {
            omitJSDOMErrors: true
        });
        // Parse the HTML using JSDOM
        const dom = new _jsdom.JSDOM(html, {
            virtualConsole
        });
        const document = dom.window.document;
        // Get the title
        const title = document.querySelector('title')?.textContent || '';
        // Get the first image from meta tags or content
        let image = '';
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
        if (ogImage) {
            image = ogImage;
        } else if (twitterImage) {
            image = twitterImage;
        } else {
            // Try to get image from .imgTagWrapper img
            const wrapperImg = document.querySelector('.imgTagWrapper img');
            if (wrapperImg && 'src' in wrapperImg) {
                image = wrapperImg.src;
            } else {
                // Fallback to first image in content
                const firstImage = document.querySelector('img');
                if (firstImage && 'src' in firstImage) {
                    image = firstImage.src;
                }
            }
        }
        // Get description
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
        res.status(200).json({
            title,
            image,
            description
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=urlPreview.js.map