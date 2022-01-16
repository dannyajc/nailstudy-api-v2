class User {
    firstName: String;
    lastName: String;
    phone: String;
    zipCode: String;
    address: String;
    city: String;
    avatar: String;
    email: String;
    isAdmin: boolean;
    courses?: UserCourse[];
    //TODO: Following courses (contains license)

    constructor(firstName: String, lastName: String,
        phone: String,
        zipCode: String,
        address: String,
        city: String,
        avatar: String,
        email: String,
        isAdmin: boolean = false,
        courses: UserCourse[] = []) {
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
}