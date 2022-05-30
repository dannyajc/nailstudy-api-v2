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
        return {
            materialType: json['materialType'],
            name: json['name'],
            description: json['description'],
            image: json['image'],
            subjects: Subject.fromDataList(json['subjects']),
        };
    }
}

enum MaterialType {
    theory,
    practice
}