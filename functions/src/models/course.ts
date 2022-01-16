class Course {
    id?: String;
    name: String;
    description: String;
    image: String;
    expiryTime: number; // for instance 5 for 5 weeks

    constructor(name: String,
        description: String,
        image: String,
        expiryTime: number = 5) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.expiryTime = expiryTime;
    }
}