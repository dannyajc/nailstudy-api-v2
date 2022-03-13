export class Paragraph {
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

    static fromDataList = (json: any): Paragraph[] => {
        var paragraphs = json.map((element) => {
            return new Paragraph(
                element['title'],
                element['description'],
                element['images'],
            )
        });
        return paragraphs;
    }
}