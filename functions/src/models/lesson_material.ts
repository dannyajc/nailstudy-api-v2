import { Subject } from "./subject";

export class LessonMaterial {
    materialType: MaterialType;
    name: string;
    description: string;
    image: string;
    subjects: Subject[];

    constructor(materialType: MaterialType,
        name: string,
        description: string,
        image: string,
        subjects: Subject[]) {
        this.materialType = materialType;
        this.name = name;
        this.description = description;
        this.image = image;
        this.subjects = subjects;
    }

    static fromData = (json: any): LessonMaterial => {
        return new LessonMaterial(
            json['materialType'],
            json['name'],
            json['description'],
            json['image'],
            Subject.fromDataList(json['subjects']),
        );
    }
}

enum MaterialType {
    theory,
    practice
}