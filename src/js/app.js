import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import '../css/styles.css';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKOSkAqHOBpeU3pO7Xh775NIllHJwqh-M",
    authDomain: "talk-with-computer.firebaseapp.com",
    databaseURL: "https://talk-with-computer-default-rtdb.firebaseio.com",
    projectId: "talk-with-computer",
    storageBucket: "talk-with-computer.appspot.com",
    messagingSenderId: "531518451670",
    appId: "1:531518451670:web:99fb802ccf465c2da63e77",
    measurementId: "G-E5Q3DTK8G1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication
window.login = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = 'courses.html';
    })
    .catch((error) => {
      document.getElementById("login-error").innerText = error.message;
    });
}

// Fetching courses
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (window.location.pathname.endsWith('courses.html')) {
      const coursesRef = ref(database, 'courses/');
      onValue(coursesRef, (snapshot) => {
        const courses = snapshot.val();
        const coursesList = document.getElementById('courses-list');
        for (let course in courses) {
          const li = document.createElement('li');
          li.innerText = courses[course].name;
          li.onclick = () => {
            window.location.href = `projects.html?course=${course}`;
          };
          coursesList.appendChild(li);
        }
      });
    }

    // Fetching projects
    if (window.location.pathname.endsWith('projects.html')) {
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get('course');
      const projectsRef = ref(database, `courses/${courseId}/projects`);
      onValue(projectsRef, (snapshot) => {
        const projects = snapshot.val();
        const projectsList = document.getElementById('projects-list');
        for (let project in projects) {
          const li = document.createElement('li');
          li.innerText = projects[project].name;
          li.onclick = () => {
            window.location.href = `solution.html?course=${courseId}&project=${project}`;
          };
          projectsList.appendChild(li);
        }
      });
    }

    // Fetching solution and comments
    if (window.location.pathname.endsWith('solution.html')) {
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get('course');
      const projectId = urlParams.get('project');
      const solutionRef = ref(database, `courses/${courseId}/projects/${projectId}/solution`);

      onValue(solutionRef, (snapshot) => {
        const solution = snapshot.val();
        document.getElementById('code-snippet').innerText = solution.code;
      });

      const commentsRef = ref(database, `courses/${courseId}/projects/${projectId}/comments`);
      onValue(commentsRef, (snapshot) => {
        const comments = snapshot.val();
        const commentsSection = document.getElementById('comments-section');
        commentsSection.innerHTML = '';
        for (let comment in comments) {
          const div = document.createElement('div');
          div.innerHTML = `<strong>${comments[comment].user}:</strong><pre>${comments[comment].code}</pre>`;
          commentsSection.appendChild(div);
        }
      });
    }
  } else {
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
    }
  }
});

window.submitComment = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('course');
  const projectId = urlParams.get('project');
  const comment = document.getElementById('new-comment').value;
  const user = auth.currentUser.email;

  const newCommentKey = push(ref(database, `courses/${courseId}/projects/${projectId}/comments`)).key;
  const updates = {};
  updates[`courses/${courseId}/projects/${projectId}/comments/${newCommentKey}`] = {
    user: user,
    code: comment
  };

  update(ref(database), updates);
  document.getElementById('new-comment').value = '';
}
