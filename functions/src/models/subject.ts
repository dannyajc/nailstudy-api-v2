import { Paragraph } from "./paragraph";

export class Subject {
    title: string;
    description: string;
    subjectNumber: number;
    paragraphs: Paragraph[];
    image?: string;

    constructor(title: string,
        description: string,
        subjectNumber: number,
        paragraphs: Paragraph[],
        image: string) {
        this.title = title;
        this.description = description;
        this.subjectNumber = subjectNumber;
        this.paragraphs = paragraphs;
        this.image = image;
    }

    static fromDataList = (json: any): Subject[] => {
        var subjects = json.map((element): Subject => {
            return {
                title: element['title'],
                description: element['description'],
                subjectNumber: element['subjectNumber'],
                paragraphs: Paragraph.fromDataList(element['paragraphs']),
                image: element['image'],
            }
        });
        return subjects;
    }
}