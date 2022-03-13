import { Lesson } from "./lesson";

export class Course {
    id?: string;
    name: string;
    description: string;
    image: string;
    expiryTime: number; // for instance 5 for 5 weeks
    lessons?: Lesson[];

    constructor(
        id: string,
        name: string,
        description: string,
        image: string,
        expiryTime: number = 5,
        lessons?: Lesson[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.expiryTime = expiryTime;
        this.lessons = lessons;
    }

    static fromJson = (json: any) => {
        return new Course(
            json['id'] ? json['id'] : null,
            json['name'],
            json['description'],
            json['image'],
            json['expiryTime'],
            json['lessons'] ? Lesson.fromDataList(json['lessons']) : null
        );
    }
}