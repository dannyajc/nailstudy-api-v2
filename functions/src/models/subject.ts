class Subject {
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
}