class Paragraph {
    title: string;
    description: string;
    images: string[]; // urls

    constructor(title: string,
        description: string,
        images: string[]) {
        this.title = title;
        this.description = description;
        this.images = images;
    }
}