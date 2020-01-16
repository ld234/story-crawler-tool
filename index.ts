
import program from 'commander';
import { WordpressCrawler } from './WordpressCrawler';
console.log('hello wod');

program
    .requiredOption('-u, --url <string>', 'URL of table of contents')
    .requiredOption('-e, --extension <string>', 'Ebook extension (epub, pdf, etc.)')
    .requiredOption('-w, --website <string>', 'Choose from wattpad, sstruyen, wordpress')
    .option('-p, --default-password <string>', 'Default password');

program.parse(process.argv);
console.log(program.url, program.extension, program.defaultPassword);

if ( program.website == 'wordpress' ) {
    const wpCrawler = new WordpressCrawler(program.defaultPassword || "");
    wpCrawler.extractStory(program.url, program.extension).then( () => {
        console.log('completed');
    });
} else {
    console.error(`${program.website} is not yet supported.`);
}
    





