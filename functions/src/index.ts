import * as functions from "firebase-functions";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const usersDb = db.collection('users');
const courseDb = db.collection('courses');
const levelDb = db.collection('levels');
const stepDb = db.collection('steps');
const theoryDb = db.collection('theory');
const courseMapDb = db.collection('courseMap')

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const getAllCourses = functions.https.onRequest(async (req, res) => {
    let courseList = [];
    let allCourses = await courseDb.get();
    console.log('GET ALL COURSES');
  
    allCourses.forEach(course => {
      let data = course.data();
      courseList.push(data);
    })
    res.send(courseList);
  });
