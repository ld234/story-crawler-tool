import { Crawler } from './Crawler';

import * as cheerio from 'cheerio';
import { sanitize } from "sanitize-filename-ts";
import requestPromise from 'request-promise';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
const fetch = require('node-fetch');
const readline = require('readline-promise').default;
const rlp = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});


export class WordpressCrawler implements Crawler {
    private defaultPassword: string;

    constructor(defaultPassword: string) {
        console.log('wordpress crawler constructor');
        this.defaultPassword = defaultPassword;
    }

    public async extractStory (url: string, extension: string): Promise<void> { 
        try {
            
            const responseHTML = await requestPromise({
                uri: url,
            });
    
            const domain = url.split('\/').slice(0,3).join('\/');
            
            const $ = cheerio.load(responseHTML);
            const title = sanitize($('.entry-title').text().trim(), { replacement: ' '});
    
            const extractedElements = $('.entry-content *:not(script)');
            const list = Array(0);
            const overview = Array(0);
            let counter = 0;
            const prefix = `<html>
<head>
    <title>${title}</title>
    <style>
        @font-face{
            font-family: local('Nunito');
            src: url(C:\\Users\\ldt99\\Downloads\\fonts\\Nunito\\Nunito-Regular.ttf);
        }

        body{
            padding: 30px;
        }
        *{
            font-family: 'Nunito';
            line-height: 2em;
        }
        img {
            display: block;
            text-align: center;
            margin-left: auto;
            margin-right: auto;
            width: 40%; 
            height: auto;
        }
        .overview *:not(img){
            text-align: center;
            width: 85%;
            margin: 0 auto;
        }
    </style>
<body>
`;
            const suffix = `</body>
    </html>`;

            extractedElements.each(function (index, element) {
                const href = $(element).attr('href');
                
                if (href && (href.startsWith(`${domain}`) || href.startsWith(`https://wp.me`) || href.startsWith(`http://wp.me`))) {
                    // $(element).attr('href', `#c${index}`);
                    list.push($(element).attr('href'));
                    $(element).attr('href', `#c${counter}`);
                    counter++;
                } 
            });

            extractedElements.each(function (index, element) {
                if (element.tagName == 'p' ){
                    overview.push($.html(element));
                }
            });
    
            
            const finalOutput = [];
            let index = 0;
            for (let chapterURL of list) {
                console.log(chapterURL);
                const returnVal = await this.extractChapter(chapterURL, index, this.defaultPassword);
                index++;
                finalOutput.push(returnVal.join('\n'));
            };
    
            fs.appendFileSync( 
                path.join(__dirname, `${title}.html`), 
                `${prefix}\n<div class="overview"><h1 class="chapter">${title}</h1>${overview.join('\n') }</div>${finalOutput.join('\n')} ${suffix}`,
            );

            // const options = {
            //     input: '"' +path.join(__dirname, `${title}.html`) +'"' ,
            //     output: '"' +  path.join(__dirname, `${title}.${extension}`) + '"' ,
            //     embedAllFonts: true,
            // }
            // const convertPromise = util.promisify(convert);
            // await convertPromise(options);
    
        } catch(err) {
            console.error('error getting table of content', err);
        }
    }

    async extractChapter (chapterURL: string, index: number, defaultPassword: string) : Promise<Array<string>>{
        const returnArray = Array<string>(0);
        try {
            const responseHTML = await requestPromise({
                uri: chapterURL,
            });
            
            let $ = cheerio.load(responseHTML);
            const title = $('.entry-title').text().trim();
            let breakout = false;
            while ($('input[name="post_password"]').length && !breakout) {
                let password = await rlp.questionAsync(`Enter password for ${title} > `);
                password = password.trim();
                password = password || defaultPassword;
                
                try {
                    const response = await fetch("https://fundranix.wordpress.com/wp-login.php?action=postpass", {
                        "credentials": "omit",
                        "headers": {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Upgrade-Insecure-Requests": "1"
                        },
                        "referrer": chapterURL,
                        "body": `post_password=${password}&Submit=Nh%E1%BA%ADp`,
                        "method": "POST",
                        "mode": "cors"
                    });
    
                    
                    const cookiePair = response.headers.raw()['set-cookie'][1].split(';')[0].split('=');
                    
                    const resp = await requestPromise({
                        uri: chapterURL,
                        headers: {
                            Cookie: `${cookiePair[0]}=${cookiePair[1]}`
                        }
                    });
                    $ = cheerio.load(resp);
                } catch (innerErr) {
                    console.error('password request', innerErr);
                }
    
                breakout = true;
                
                
            }
            $('a[href]').removeAttr('href');
            returnArray.push(`<h2 id="c${index}">${title}</h2>`);
            const paragraphs = $('.entry-content p');
            
            
            paragraphs.each(function (index, element) {
                returnArray.push($.html(element));
            });
            
        } catch(err) {
            console.error('extract chapter error', err);
        }
        return returnArray;
    } 
}