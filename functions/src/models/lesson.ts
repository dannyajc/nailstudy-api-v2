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
        var lessons = json.map((element): Lesson => {
            return {
                name: element['name'],
                lessonNumber: element['lessonNumber'],
                theory: LessonMaterial.fromData(element['theory']),
                practice: LessonMaterial.fromData(element['practice']),
                image: element['image'],
            }
        });
        return lessons;
    }
}
