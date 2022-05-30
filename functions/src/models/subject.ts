import { Paragraph } from "./paragraph";

export class Subject {
    title: string;
    description: string;
    subjectNumber: number;
    paragraphs: Paragraph[];

    constructor(title: string,
        description: string,
        subjectNumber: number,
        paragraphs: Paragraph[]) {
        this.title = title;
        this.description = description;
        this.subjectNumber = subjectNumber;
        this.paragraphs = paragraphs;
    }

    static fromDataList = (json: any): Subject[] => {
        var subjects = json.map((element): Subject => {
            return {
                title: element['title'],
                description: element['description'],
                subjectNumber: element['subjectNumber'],
                paragraphs: Paragraph.fromDataList(element['paragraphs']),
            }
        });
        return subjects;
    }
}