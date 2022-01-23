import * as functions from "firebase-functions";
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { User } from './models/user';
import { Course } from './models/course';
import { UserCourse, UserCourseState } from './models/user_course';
import { firestore } from "firebase-admin";

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
      console.log("ISSUER", req.body.issuingUid)
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

// Users

export const createUser = functions.https.onRequest(async (req, res) => {
  const newUser = new User('', req.body.name, req.body.lastName, req.body.phone, req.body.zipCode, req.body.address, req.body.city, req.body.avatar, req.body.email, req.body.isAdmin);
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

  const user = await usersDb.doc(req.body.uid).get();

  if (!user.exists) {
    res.sendStatus(404);
  }
  let usableUser = user.data();

  let newInfo = {
    name: req.body.firstName || usableUser.firstName,
    lastName: req.body.lastName || usableUser.lastName,
    email: req.body.email || usableUser.email,
    address: req.body.address || usableUser.address,
    city: req.body.city || usableUser.city,
    zipCode: req.body.zipCode || usableUser.zipCode,
    phone: req.body.phone || usableUser.phone,
    avatar: req.body.avatar || usableUser.avatar,
  }

  let result = await usersDb.doc(req.body.uid).update(
    newInfo
  );
  if (result) { res.send(result) }
});

export const deleteUser = functions.https.onRequest(async (req, res) => {
  // isAdmin(req, res);

  const userId = usersDb.doc(req.body.uid)
  let user = await userId.get()
  if (!user.exists) {
    res.sendStatus(404);
  }

  getAuth().deleteUser(req.body.uid).then(() => {
    usersDb.doc(req.body.uid).delete().then(() => {
      res.sendStatus(200);
    })
  })
});

export const getUser = functions.https.onRequest(async (req, res) => {
  // TODO: Uncomment
  // const tokenId = req.get('Authorization').split('Bearer ')[1];
  // getAuth().verifyIdToken(tokenId)
  //   .then(async (decoded) => {
  const userId = usersDb.doc(req.body.uid)
  let user = await userId.get()
  if (!user.exists) {
    res.sendStatus(404);
  }
  let data = await user.data();
  res.send(data)
  //     }).catch((err) => res.status(401).send(err))
});

export const getUserByEmail = functions.https.onRequest(async (req, res) => {
  // TODO: Uncomment
  // const tokenId = req.get('Authorization').split('Bearer ')[1];
  // getAuth().verifyIdToken(tokenId)
  //   .then(async (decoded) => {
  let userList = [];
  const user = usersDb.where('email', '==', req.body.email)
  let users = await user.get()

  users.forEach(u => {
    let data = u.data();
    userList.push(data);
  })
  res.send(userList)
  // })
  // .catch((err) => res.status(401).send(err));
});


export const getAllUsers = functions.https.onRequest(async (req, res) => {
  // TODO: Uncomment
  // const tokenId = req.get('Authorization').split('Bearer ')[1];
  // getAuth().verifyIdToken(tokenId)
  //   .then(async (decoded) => {
  let userList = [];
  let allUsers = await usersDb.get();

  allUsers.forEach(user => {
    let data = user.data();
    userList.push(data);
  })
  res.send(userList);
  // }).catch((err) => res.status(401).send(err));
});


// Courses

export const createCourse = functions.https.onRequest(async (req, res) => {
  const course = new Course(req.body.name, req.body.description, req.body.image, req.body.expiryTime);

  let result = await courseDb.add(
    { ...course }
  );
  if (result) { res.send({ id: result.id, ...course }) }
});

// User Courses

export const assignCourse = functions.https.onRequest(async (req, res) => {
  const { courseId, userId } = req.body;

  // Generate license key
  var code: string;
  var characters = '0123456789';
  for (var i = 0; i < 12; i++) {
    code += characters[Math.floor(Math.random() * characters.length)];
  };
  code = code.match(/\d{1,4}/g).join("-");

  const course = new UserCourse(courseId, new Date().toLocaleString('nl-NL', { timeZone: 'CET' }), new Date().toLocaleString('nl-NL', { timeZone: 'CET' }), 0, 0, false, code, UserCourseState.inactive, '');

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
      course.active = UserCourseState.active;
      legitCode = true;
    }
    return course;
  });
  if (!legitCode) {
    res.status(404).send('LicenseCode not correct');
  };


  console.log(newCourses);
  let result = await usersDb.doc(userId).update({
    courses: JSON.parse(JSON.stringify(newCourses))
    // [`courses.${currentCourse.id}`]: UserCourseState.active
  });
  if (result) { res.send(result) }
});

// TODO: not finished yet
export const updateUserCourse = functions.https.onRequest(async (req, res) => {
  const { courseId, userId } = req.body;
  const user = await usersDb.doc(userId).get();
  if (!user.exists) {
    res.sendStatus(404);
  }
  var filledUser = User.fromData(user.data());

  // let result = await usersDb.doc(userId).update({
  //   courses: firestore.FieldValue.arrayUnion({ ...course })
  // });
  if (filledUser) { res.send(filledUser) }
});

