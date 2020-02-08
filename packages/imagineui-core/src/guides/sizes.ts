import {ParsePage} from "../parse/ast";

// TODO: [guide] Guidelines should be pluggable (i.e. with SCSS variables)
export const getPageWidth = (page: ParsePage) => {
    const {Mobile, Tablet, Widescreen} = page.children

    if(Mobile) return 320;
    if(Tablet) return 640;
    if(Widescreen) return 960;
    return null;
}

// assumed 16/9 ratio, mobile is vertical
export const getPageHeight = (page: ParsePage) => {
    const {Mobile, Tablet, Widescreen} = page.children

    if(Mobile) return 570;
    if(Tablet) return 360;
    if(Widescreen) return 540;
    return null;
}
