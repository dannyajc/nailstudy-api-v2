class LessonMaterial {
    materialType: MaterialType;
    name: String;
    description: String;
    image: String;
    subjects: Subject[];

    constructor(materialType: MaterialType,
        name: String,
        description: String,
        image: String,
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