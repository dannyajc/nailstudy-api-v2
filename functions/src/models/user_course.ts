// Currently following course
// Contains all status information

class UserCourse {
    courseId: String;
    startedAt: Date;
    expiryDate: Date;
    currentLessonNumber: number; // if lesson number is higher than previous lesson, it means that the previous lesson (practice) has been approved
    currentSubjectNumber: number;
    finished: boolean;
    licenseCode: String;
    // becomes active when licensecode has been validated
    active: UserCourseState;
    // TODO; chat

    constructor(courseId: String,
        startedAt: Date,
        expiryDate: Date,
        currentLessonNumber: number, // if lesson number is higher than previous lesson, it means that the previous lesson (practice) has been approved
        currentSubjectNumber: number,
        finished: boolean = false,
        licenseCode: String,
        active: UserCourseState = UserCourseState.inactive) {
        this.courseId = courseId;
        this.startedAt = startedAt;
        this.expiryDate = expiryDate;
        this.currentLessonNumber = currentLessonNumber;
        this.currentSubjectNumber = currentSubjectNumber;
        this.finished = finished;
        this.licenseCode = licenseCode;
        this.active = active;
    }
}

enum UserCourseState {
    active,
    inactive,
    cancelled,
    expired,
}