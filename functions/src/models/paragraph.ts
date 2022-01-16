class Paragraph {
    title: String;
    description: String;
    images: String[]; // urls

    constructor(title: String,
        description: String,
        images: String[]) {
        this.title = title;
        this.description = description;
        this.images = images;
    }
}