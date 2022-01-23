import { UserCourse } from './user_course';

export class User {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    zipCode: string;
    address: string;
    city: string;
    avatar: string;
    email: string;
    isAdmin: boolean;
    courses?: UserCourse[];

    constructor(id: string, firstName: string, lastName: string,
        phone: string,
        zipCode: string,
        address: string,
        city: string,
        avatar: string,
        email: string,
        isAdmin: boolean = false,
        courses: UserCourse[] = []) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.zipCode = zipCode;
        this.address = address;
        this.city = city;
        this.avatar = avatar;
        this.email = email;
        this.isAdmin = isAdmin;
        this.courses = courses;
    }

    static fromData = (json: any): User => {
        console.log(json['courses']);
        return new User(
            json['id'],
            json['firstName'],
            json['lastName'],
            json['phone'],
            json['zipCode'],
            json['address'],
            json['city'],
            json['avatar'],
            json['email'],
            json['isAdmin'],
            UserCourse.fromDataList(json['courses'])
        );
    };
}