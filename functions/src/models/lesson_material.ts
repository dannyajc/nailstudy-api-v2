class LessonMaterial {
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
}

enum MaterialType {
    theory,
    practice
}