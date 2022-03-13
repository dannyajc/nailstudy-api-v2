import { LessonMaterial } from "./lesson_material";

export class Lesson {
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

    static fromDataList = (json: any): Lesson[] => {
        var lessons = json.map((element) => {
            return new Lesson(
                element['name'],
                element['lessonNumber'],
                LessonMaterial.fromData(element['theory']),
                LessonMaterial.fromData(element['practice']),
                element['image'],
            )
        });
        return lessons;
    }
}