export interface Crawler {
    extractStory: (startingPoint: any, extension: string) => Promise<void>; // arrow function
    extractChapter: (url: string, index: number, defaultPassword: string) => Promise<Array<string> >;
}