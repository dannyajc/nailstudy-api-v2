import * as functions from "firebase-functions";
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { User } from './models/user';
import { Course } from './models/course';
import { UserCourse, UserCourseState } from './models/user_course';
import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from 'uuid';

const customParseFormat = require('dayjs/plugin/customParseFormat');
const dayjs = require("dayjs");
dayjs.extend(customParseFormat);

const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://nailstudy-backend-a1c76.firebaseio.com", //update this
  storageBucket: "nailstudy-backend-a1c76.appspot.com" //update this
});

const db = getFirestore();
const usersDb = db.collection('users');
const courseDb = db.collection('courses');
const levelDb = db.collection('levels');
const stepDb = db.collection('steps');
const theoryDb = db.collection('theory');
const courseMapDb = db.collection('courseMap')

const isAdmin = async (req, res) => {
  const tokenId = req.get('Authorization').split('Bearer ')[1];
  getAuth().verifyIdToken(tokenId)
    .then(async (decoded) => {
      let issuingUser = await usersDb.doc(req.body.issuingUid || "0").get();
      if (!issuingUser.exists) {
        res.send('Not a valid issuer');
      } else {
        let data = issuingUser.data();
        if (!data.isAdmin) {
          res.sendStatus(403);
        }
      }
    }).catch((err) => res.status(401).send(err));
}


const checkAdmin = async (req, res) => {
  let issuingUser = await usersDb.doc(req.body.issuingUid || "0").get();
  if (!issuingUser.exists) {
    res.send('Not a valid issuer');
  } else {
    let data = issuingUser.data();
    return data.isAdmin;
  }
}

const extractTokenOrError = (req, res): string | undefined => {
  try {
    const tokenId = req.get('Authorization').split('Bearer ')[1];
    if (!tokenId) {
      throw Error("Not authorized");
    }
    return tokenId;
  } catch (err) {
    return res.status(401).send("Not authorized");
  }
}

// Users

export const createUser = functions.https.onRequest(async (req, res) => {
  const newUser = new User('', req.body.name, req.body.lastName, req.body.phone, req.body.zipCode ?? '', req.body.address ?? '', req.body.city ?? '', req.body.avatar ?? '', req.body.email, req.body.isAdmin);
  let createdAuthUser = await getAuth().createUser({ email: newUser.email, password: req.body.password, displayName: `${newUser.firstName} ${newUser.lastName}`, emailVerified: true });
  let uid = createdAuthUser.uid;

  newUser.id = uid;
  let result = await usersDb.doc(uid).set(
    { ...newUser }
  );
  if (result) { res.send(newUser) }
});

export const modifyUser = functions.https.onRequest(async (req, res) => {
  // isAdmin(req, res);

  const user = await usersDb.doc(req.body.userId).get();

  if (!user.exists) {
    res.sendStatus(404);
  }
  let usableUser = user.data();

  let newInfo = {
    firstName: req.body.firstName || usableUser.firstName,
    lastName: req.body.lastName || usableUser.lastName,
    email: req.body.email || usableUser.email,
    address: req.body.address || usableUser.address,
    city: req.body.city || usableUser.city,
    zipCode: req.body.zipCode || usableUser.zipCode,
    phone: req.body.phone || usableUser.phone,
    avatar: req.body.avatar || usableUser.avatar,
  }

  let result = await usersDb.doc(req.body.userId).update(
    newInfo
  );
  if (result) { res.send(result) }
});

export const deleteUser = functions.https.onRequest(async (req, res) => {
  // isAdmin(req, res);

  const userId = usersDb.doc(req.body.userId)
  let user = await userId.get()
  if (!user.exists) {
    res.sendStatus(404);
  }

  getAuth().deleteUser(req.body.userId).then(() => {
    usersDb.doc(req.body.userId).delete().then(() => {
      res.sendStatus(200);
    })
  })
});

export const getUser = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const userId = usersDb.doc(req.body.userId)
      let user = await userId.get()
      if (!user.exists) {
        res.sendStatus(404);
      }
      let data = await User.fromData(user.data());
      const formats = ['DD-MM-YYYY HH-mm-ss', 'D-MM-YYYY HH-mm-ss', 'DD-M-YYYY HH-mm-ss', 'D-M-YYYY HH-mm-ss'];

      data.courses.forEach((c) => {
        const courseExp = dayjs(c.expiryDate, formats, 'nl');
        const now = dayjs(dayjs(), formats, 'nl')

        // TODO: Also save this to the database, now it's only returned to the call that a specific course has been expired.
        if (courseExp.isBefore(now) && c.active === 0 && !c.finished) {
          c.active = UserCourseState.expired;
        }
      });
      let result = await usersDb.doc(req.body.userId).update({
        courses: JSON.parse(JSON.stringify(data.courses))
      });
      if (result) {
        res.send(data)
      }
    }).catch((err) => res.status(401).send(err))
});

export const getUserById = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const userId = usersDb.doc(req.body.userId);
      let user = await userId.get();
      if (!user.exists) {
        res.sendStatus(404);
      }

      res.send(User.fromData(user.data()));
    })
    .catch((err) => res.status(401).send(err));
});

export const getUserByEmail = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      let userList = [];
      const user = usersDb.where('email', '==', req.body.email);
      let users = await user.get();

      users.forEach(u => {
        let data = u.data();
        userList.push(data);
      })
      res.send(userList);
    })
    .catch((err) => res.status(401).send(err));
});


export const getAllUsers = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      let userList = [];
      let allUsers = await usersDb.get();

      allUsers.forEach(user => {
        let data = user.data();
        userList.push(data);
      })
      res.send(userList);
    }).catch((err) => res.status(401).send(err));
});


// Courses

export const createCourse = functions.https.onRequest(async (req, res) => {
  // isadmin

  const course = Course.fromJson(
    req.body
  );

  let result = await courseDb.add(
    { ...course }
  );
  if (result) { res.send({ id: result.id, ...course }) }
});

export const exportDatabaseToJson = functions.https.onRequest(async (req, res) => {
  const courseId = req.query.courseId.toString();

  let courseRef = courseDb.doc(courseId);
  let course = await courseRef.get();
  let courseData = course.data();

  res.send(courseData);
});

// User Courses

export const assignCourse = functions.https.onRequest(async (req, res) => {
  // isadmin
  const { courseId, userId } = req.body;

  // Generate license key
  var code: string;
  var characters = '0123456789';
  for (var i = 0; i < 12; i++) {
    code += characters[Math.floor(Math.random() * characters.length)];
  };
  code = code.match(/\d{1,4}/g).join("-");

  const course = new UserCourse(courseId, new Date().toLocaleString('nl-NL', { timeZone: 'CET' }), new Date().toLocaleString('nl-NL', { timeZone: 'CET' }), 1, 0, false, code, UserCourseState.inactive, '', false);

  const user = await usersDb.doc(userId).get();

  if (!user.exists) {
    res.sendStatus(404);
  }
  let result = await usersDb.doc(userId).update({
    courses: firestore.FieldValue.arrayUnion({ ...course })
  });
  if (result) { res.send(result) }
});

export const activateUserCourse = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { userId, licenseCode } = req.body;
      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }

      var filledUser = User.fromData(user.data());
      const allCourses = filledUser.courses;
      var legitCode = false;
      const newCourses = allCourses.map((course) => {
        if (course.licenseCode == licenseCode) {
          if (course.active !== UserCourseState.active) {
            course.active = UserCourseState.active;
            course.startedAt = new Date().toLocaleString('nl-NL', { timeZone: 'CET' });
            const courseJson = _getCourseById(course.courseId);
            if (courseJson) {
              const fullCourse = Course.fromJson(courseJson);
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + (((fullCourse) ? fullCourse.expiryTime : 5) * 7));
              course.expiryDate = expiryDate.toLocaleString('nl-NL', { timeZone: 'CET' });
            }
            legitCode = true;
          }
        }
        return course;
      });
      if (!legitCode) {
        res.status(404).send('LicenseCode not correct');
      } else {
        let result = await usersDb.doc(userId).update({
          courses: JSON.parse(JSON.stringify(newCourses))
        });
        if (result) { res.send({ result, course: newCourses.find((course) => course.licenseCode === licenseCode) }) }
      }

    }).catch((err) => res.status(401).send(err));
});

export const getCourseById = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { courseId } = req.body;
      const courseJson = await _getCourseById(courseId);
      if (courseJson) {
        const fullCourse = Course.fromJson(courseJson);
        res.send(fullCourse);
      } else {
        res.status(404);
      }
    }).catch((err) => res.status(401).send(err));
});

const _getCourseById = async (courseId) => {
  const course = await courseDb.doc(courseId).get()
  if (!course.exists) {
    return null;
  }
  return course.data();
};

export const getAllCourses = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      let courseList = [];
      let allCourses = await courseDb.get();

      allCourses.forEach(course => {
        let data = course.data();
        const courseModel = Course.fromJson({ id: course.id, ...data });
        courseList.push(courseModel);
      })
      res.send(courseList);
    }).catch((err) => res.status(401).send(err));
});

export const updateSubjectNumber = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { courseId, userId } = req.body;
      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var filledUser = User.fromData(user.data());

      if (filledUser) {
        const allCourses = filledUser.courses;
        const newCourses = await Promise.all(allCourses.map(async (course) => {
          if (course.courseId == courseId) {
            course.currentSubjectNumber++;
            const courseJson = await _getCourseById(courseId);
            if (courseJson) {
              const fullCourse = Course.fromJson(courseJson);
              // Go to next lessen when all subjects have been done
              const currentLesson = fullCourse.lessons.find((lesson) => lesson.lessonNumber == course.currentLessonNumber);
              const theorySubjects = currentLesson.theory.subjects;
              const practiceSubjects = currentLesson.practice.subjects;

              const subjectAmount = theorySubjects.length + practiceSubjects.length;
              if (course.currentSubjectNumber > subjectAmount) {
                if (course.currentLessonNumber == fullCourse.lessons.length) {
                  course.finished = true;
                } else {
                  // +1 to currenlessonnumber when instructor approves photos
                  // course.currentLessonNumber++;
                  course.currentSubjectNumber = 1;
                }
              }
            }
          }
          return course;
        }));
        let result = await usersDb.doc(userId).update({
          courses: JSON.parse(JSON.stringify(newCourses))
        });
        if (result) {
          const updatedUser = (await usersDb.doc(userId).get()).data();
          res.send(User.fromData(updatedUser));
        }
      }
    }).catch((err) => res.status(401).send(err));
});

export const finishLesson = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { courseId, userId } = req.body;
      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var filledUser = User.fromData(user.data());

      if (filledUser) {
        const allCourses = filledUser.courses;
        const newCourses = await Promise.all(allCourses.map(async (course) => {
          if (course.courseId == courseId) {
            course.finished = true;
          }
          return course;
        }));
        let result = await usersDb.doc(userId).update({
          courses: JSON.parse(JSON.stringify(newCourses))
        });
        if (result) {
          const updatedUser = (await usersDb.doc(userId).get()).data();
          res.send(User.fromData(updatedUser));
        }
      }
    }).catch((err) => res.status(401).send(err));
});

export const approveLesson = functions.https.onRequest(async (req, res) => {
  // isadmin
  const { courseId, userId } = req.body;
  const user = await usersDb.doc(userId).get();
  if (!user.exists) {
    res.sendStatus(404);
  }
  var filledUser = User.fromData(user.data());

  if (filledUser) {
    const allCourses = filledUser.courses;
    const newCourses = await Promise.all(allCourses.map(async (course) => {
      if (course.courseId == courseId && course.pendingApproval == true) {
        const courseJson = await _getCourseById(courseId);
        if (courseJson) {
          const fullCourse = Course.fromJson(courseJson);
          if (course.currentLessonNumber == fullCourse.lessons.length) {
            course.finished = true;
            course.pendingApproval = false;
          } else {
            course.currentLessonNumber++;
            course.currentSubjectNumber = 1;
            course.pendingApproval = false;
          }
        }
      }
      return course;
    }));
    let result = await usersDb.doc(userId).update({
      courses: JSON.parse(JSON.stringify(newCourses))
    });
    if (result) {
      const updatedUser = (await usersDb.doc(userId).get()).data();
      res.send(User.fromData(updatedUser));
    }
  }
});

export const newChat = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { userId, receiverId } = req.body;

      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var filledUser = User.fromData(user.data());

      const receiver = await usersDb.doc(receiverId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var receivingUser = User.fromData(receiver.data());

      if (filledUser && receivingUser) {
        // Sending because it does exist already
        const intersectingChatIds = filledUser.chats.filter(id => receivingUser.chats.includes(id));
        if (intersectingChatIds.length !== 0) {
          res.send(intersectingChatIds[0]);
        } else {
          // Adding because it doesn't exist yet
          const newChatId = uuidv4();
          let updateOne = await usersDb.doc(userId).update({
            chats: [...filledUser.chats, newChatId]
          });

          let updateTwo = await usersDb.doc(receiverId).update({
            chats: [...receivingUser.chats, newChatId]
          });

          if (updateOne && updateTwo) {
            res.send(newChatId);
          }
        }
      }
    }).catch((err) => res.status(401).send(err));
});


// TODO: not finished yet
export const updateUserCourse = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { userId } = req.body;
      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var filledUser = User.fromData(user.data());

      // let result = await usersDb.doc(userId).update({
      //   courses: firestore.FieldValue.arrayUnion({ ...course })
      // });
      if (filledUser) { res.send(filledUser) }
    }).catch((err) => res.status(401).send(err));
});

export const newPendingApproval = functions.https.onRequest(async (req, res) => {
  let tokenId = extractTokenOrError(req, res);
  getAuth().verifyIdToken(tokenId)
    .then(async () => {
      const { courseId, userId } = req.body;
      const user = await usersDb.doc(userId).get();
      if (!user.exists) {
        res.sendStatus(404);
      }
      var filledUser = User.fromData(user.data());

      if (filledUser) {
        const allCourses = filledUser.courses;
        const newCourses = await Promise.all(allCourses.map(async (course) => {
          if (course.courseId == courseId) {
            course.pendingApproval = true;
          }
          return course;
        }));
        let result = await usersDb.doc(userId).update({
          courses: JSON.parse(JSON.stringify(newCourses))
        });
        if (result) {
          const updatedUser = (await usersDb.doc(userId).get()).data();
          res.send(User.fromData(updatedUser));
        }
      }
    }).catch((err) => res.status(401).send(err));
});
