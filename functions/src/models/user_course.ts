// Currently following course
// Contains all status information

export class UserCourse {
    id?: string;
    courseId: string;
    startedAt?: string;
    expiryDate?: string;
    currentLessonNumber: number; // if lesson number is higher than previous lesson, it means that the previous lesson (practice) has been approved
    currentSubjectNumber: number;
    finished: boolean;
    licenseCode: string;
    // becomes active when licensecode has been validated
    active: UserCourseState;
    pendingApproval: boolean;

    constructor(courseId: string,
        startedAt: string,
        expiryDate: string,
        currentLessonNumber: number,
        currentSubjectNumber: number,
        finished: boolean = false,
        licenseCode: string,
        active: UserCourseState = UserCourseState.inactive, 
        id?: string,
        pendingApproval?: boolean) {
        this.courseId = courseId;
        this.startedAt = startedAt;
        this.expiryDate = expiryDate;
        this.currentLessonNumber = currentLessonNumber;
        this.currentSubjectNumber = currentSubjectNumber;
        this.finished = finished;
        this.licenseCode = licenseCode;
        this.active = active;
        this.id = id;
        this.pendingApproval = pendingApproval;
    }

    static fromDataList = (json: any): UserCourse[] => {
        var courses = json.map((element, index) => {
            return new UserCourse(
                element['courseId'],
                element['startedAt'],
                element['expiryDate'],
                element['currentLessonNumber'],
                element['currentSubjectNumber'],
                element['finished'],
                element['licenseCode'],
                element['active'],
                index,
                element['pendingApproval'],
            )
        });
        return courses;
    }
}

export enum UserCourseState {
    active,
    inactive,
    cancelled,
    expired,
}