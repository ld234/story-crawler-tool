# Story Crawler Tool

Allow stories from story publishing websites such as Wattpad, Wordpress, SSTruyen to be downloaded as HTML files.

## Usage

**1. Install all dependencies:**
> npm install

**2. Downloading** 
> ts-node index.ts -u *url* -e *file-extension* -w *platform* 
 - url: table of contents
 - platform: platform from which to download the story (wattpad, wordpress, or sstruyen)
 - file-extension: Ebook file extension (epub, pdf, etc.)

**Example**
> ts-node index.ts -u https://muoivantue.com/2019/01/18/dam-my-hinh-xam/ -e epub -w wordpress
