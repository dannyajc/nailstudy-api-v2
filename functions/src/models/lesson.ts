class Lesson {
    name: string;
    lessonNumber: number;
    theory: LessonMaterial;
    practice: LessonMaterial;
    image?: string;

    constructor(name: string, lessonNumber: number, theory: LessonMaterial, practice: LessonMaterial, image: string) {
        this.name = name;
        this.lessonNumber = lessonNumber;
        this.theory = theory;
        this.practice = practice;
        this.image = image;
    }
}