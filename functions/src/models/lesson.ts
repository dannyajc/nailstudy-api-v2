class Lesson {
    name: String;
    lessonNumber: number;
    theory: LessonMaterial;
    practice: LessonMaterial;
    image?: String;

    constructor(name: String, lessonNumber: number, theory: LessonMaterial, practice: LessonMaterial, image: String) {
        this.name = name;
        this.lessonNumber = lessonNumber;
        this.theory = theory;
        this.practice = practice;
        this.image = image;
    }
}