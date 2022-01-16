class Subject {
    title: String;
    description: String;
    subjectNumber: number;
    paragraphs: Paragraph[];

    constructor(title: String,
        description: String,
        subjectNumber: number,
        paragraphs: Paragraph[]) {
        this.title = title;
        this.description = description;
        this.subjectNumber = subjectNumber;
        this.paragraphs = paragraphs;
    }
}