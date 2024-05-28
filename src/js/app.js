import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, onValue, set, push, update, remove } from "firebase/database";
import '../css/styles_courses.css';
import '../css/styles_login.css';
import '../css/styles_profile.css';
import '../css/styles_projects.css';
import '../css/styles_solutions.css';
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

// Redirect if logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('index.html')) {
      window.location.href = 'courses.html';
    } else if (currentPath.endsWith('profile.html')) {
      loadUserProfile(user);
      loadBackgroundImage();
    } else {
      loadProfileButton(user);
    }
  } else {
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
    }
  }
});

// Load profile button
function loadProfileButton(user) {
  const userRef = ref(database, 'users/' + user.uid);
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    const profilePicUrl = userData.profilePicUrl || 'https://firebasestorage.googleapis.com/v0/b/talk-with-computer.appspot.com/o/profile%20pics%2Foptions%2Fdefault_profile.png?alt=media&token=b49ad6fe-8c2e-4a2d-a212-95eb3a4e81a7';
    const profilePicElement = document.getElementById('profile-pic');
    const profileButton = document.getElementById('profile-button');
    
    if (profilePicElement && profileButton) {
      profilePicElement.src = profilePicUrl;
      profileButton.onclick = () => {
        window.location.href = 'profile.html';
      };
    }
  });
}

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

// Logout
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Sign out error', error);
  });
}

// Load user profile
function loadUserProfile(user) {
  const userRef = ref(database, 'users/' + user.uid);
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    const profilePicUrl = userData.profilePicUrl || 'https://firebasestorage.googleapis.com/v0/b/talk-with-computer.appspot.com/o/profile%20pics%2Foptions%2Fdefault_profile.png?alt=media&token=b49ad6fe-8c2e-4a2d-a212-95eb3a4e81a7';
    const profilePicElement = document.getElementById('profile-pic');
    const profileUsernameElement = document.getElementById('profile-username');
    const profileEmailElement = document.getElementById('profile-email');
    const profileDateJoinedElement = document.getElementById('profile-dateJoined');
    const profileCourseSelectedElement = document.getElementById('profile-courseSelected');
    const profileCurrentLeagueElement = document.getElementById('profile-currentLeague');
    const profileCurrentRankElement = document.getElementById('profile-currentRank');
    
    if (profilePicElement) profilePicElement.src = profilePicUrl;
    if (profileUsernameElement) profileUsernameElement.innerText = userData.username;
    if (profileEmailElement) profileEmailElement.innerText += user.email;
    if(profileDateJoinedElement) profileDateJoinedElement.innerText += userData.DateJoined;
    if(profileCourseSelectedElement) profileCourseSelectedElement.innerText += userData.selectedCourse;
    if(profileCurrentLeagueElement) profileCurrentLeagueElement.innerText += userData.CurrentLeague;
    if(profileCurrentRankElement) profileCurrentRankElement.innerText += userData.Rank;
  });
}

// Load background image
function loadBackgroundImage() {
  const backgroundImagesRef = ref(database, 'backgroundImages');
  onValue(backgroundImagesRef, (snapshot) => {
    const backgroundImages = snapshot.val();
    if (backgroundImages) {
      const imageKeys = Object.keys(backgroundImages);
      const randomKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
      const backgroundImageUrl = backgroundImages[randomKey].url;
      console.log('Background image URL:', backgroundImageUrl); // Log for debugging
      document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
    } else {
      console.error('No background images found');
    }
  }, (error) => {
    console.error('Error fetching background images:', error);
  });
}
// Fetching courses
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.endsWith('courses.html')) {
    const coursesRef = ref(database, 'courses/');
    onValue(coursesRef, (snapshot) => {
      const courses = snapshot.val();
      const coursesList = document.getElementById('courses-list');
      coursesList.innerHTML = '';
      for (let course in courses) {
        const li = document.createElement('li');
        const courseImage = document.createElement('img');
        courseImage.src = courses[course].imageResourceURL || 'default_image_url';
        const courseName = document.createElement('p');
        courseName.innerText = courses[course].name;

        li.appendChild(courseImage);
        li.appendChild(courseName);
        li.onclick = () => {
          window.location.href = `projects.html?course=${course}`;
        };
        coursesList.appendChild(li);
      }
    });
  }

  /// Fetching projects
  if (user && window.location.pathname.endsWith('projects.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const projectsRef = ref(database, `courses/${courseId}/projects`);
    onValue(projectsRef, (snapshot) => {
      const projects = snapshot.val();
      const projectsList = document.getElementById('projects-list');
      projectsList.innerHTML = '';
      for (let project in projects) {
        const li = document.createElement('li');
        li.innerHTML = `
          <p><strong>Project: </strong>${projects[project].name}</p>
          <p><strong>Lecture: </strong>${projects[project].lectureName}</p>
          <p><strong>Topic: </strong>${projects[project].topic}</p>
        `;
        li.onclick = () => {
          window.location.href = `solution.html?course=${courseId}&project=${project}`;
        };
        projectsList.appendChild(li);
      }
    });
  }

  // Fetching solution and comments
  if (user && window.location.pathname.endsWith('solution.html')) {

    let codeMirrorInstance = CodeMirror.fromTextArea(document.getElementById('code-snippet'), {
      lineNumbers: true,
      mode: 'javascript', // Adjust the mode according to the solution's language
      readOnly: true,
      theme: 'material-darker',
      lineWrapping: true});

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const projectId = urlParams.get('project');
    const solutionRef = ref(database, `courses/${courseId}/projects/${projectId}/solution`);

    onValue(solutionRef, (snapshot) => {
      const solution = snapshot.val();
      codeMirrorInstance.setValue(solution.code);
      document.getElementById('code-snippet').innerText = solution.code;
    });

    const commentsRef = ref(database, `courses/${courseId}/projects/${projectId}/comments`);
    onValue(commentsRef, (snapshot) => {
      const comments = snapshot.val();
      const commentsSection = document.getElementById('comments-section');
      commentsSection.innerHTML = '';
      let commentCount = 0;
      for (let commentId in comments) {
        if (comments[commentId].user === user.uid) commentCount++;
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.dataset.commentId = commentId;

        const profilePicUrl = comments[commentId].profilePicUrl || 'https://firebasestorage.googleapis.com/v0/b/talk-with-computer.appspot.com/o/profile%20pics%2Foptions%2Fdefault_profile.png?alt=media&token=b49ad6fe-8c2e-4a2d-a212-95eb3a4e81a7';

        commentDiv.innerHTML = `
          <img src="${profilePicUrl}" alt="Profile Picture" class="profile-pic">
          <div class="comment-body">
            <span class="username">${comments[commentId].username}</span>
            <span class="timestamp">${new Date(comments[commentId].timestamp).toLocaleString()}</span>
            <div class="comment-text-container"> 
              <pre class="text" id="text">${comments[commentId].code}</pre>
              <pre class="turncate-text" id="turncate-text">${truncateText(comments[commentId].code)}</pre>
            </div>
              ${comments[commentId].code.split('').length > 100 ? `<span class="read-more" onclick="readMore('${commentId}')">Read more</span>` : ''}
            <span class="copy-button" onclick="copyComment('${commentId}')">Copy</span>
            <div class="three-dots" onclick="toggleDropdown('${commentId}')">⋮</div>
            <div class="dropdown">
              ${comments[commentId].user === user.uid ? `<button onclick="editComment('${commentId}')" class="dropdownBtn">Edit</button>` : ``}
              ${comments[commentId].user === user.uid ? `<button onclick="deleteComment('${commentId}')" class="dropdownBtn">Delete</button>`:''}
              <button class="word-wrap dropdownBtn" onclick="ToggleWordWrap('${commentId}')">enable Word Wrap</button>
            </div>
          </div>
        `;
        commentsSection.appendChild(commentDiv);
      }
      if (commentCount >= 3) {
        document.getElementById('submit-comment').onclick = function() {
          showToast("you can only comment upto 3 times");
        }
      } else {
        document.getElementById('submit-comment').onclick = submitComment;
      }
    });
  }
});



function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'`=\/]/g, (m) => map[m]);
}

// Add comment
window.submitComment = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('course');
  const projectId = urlParams.get('project');
  const commentText = escapeHtml(document.getElementById('new-comment').value);
  const user = auth.currentUser;
  const userRef = ref(database, 'users/' + user.uid);

  if(commentText==""){
    showToast("comment cannot be empty")
  }else{
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      const commentsRef = ref(database, `courses/${courseId}/projects/${projectId}/comments`);
      const newCommentKey = push(commentsRef).key;
      const newComment = {
        user: user.uid,
        username: userData.username,
        code: commentText,
        timestamp: Date.now(),
        profilePicUrl: userData.profilePicUrl || 'https://firebasestorage.googleapis.com/v0/b/talk-with-computer.appspot.com/o/profile%20pics%2Foptions%2Fdefault_profile.png?alt=media&token=b49ad6fe-8c2e-4a2d-a212-95eb3a4e81a7'
      };
      set(ref(database, `courses/${courseId}/projects/${projectId}/comments/${newCommentKey}`), newComment);
      document.getElementById('new-comment').value = '';
    }, { onlyOnce: true });
  }
}

// Edit comment
window.editComment = function(commentId) {
  const commentDiv = document.querySelector(`.comment[data-comment-id='${commentId}']`);
  const commentText = commentDiv.querySelector('.text').innerText;
  const editTextArea = document.createElement('textarea');
  editTextArea.classList.add('edit-comment');
  editTextArea.value = commentText;

  const saveButton = document.createElement('button');
  saveButton.innerText = 'Save';
  saveButton.onclick = () => {
    const newCommentText = escapeHtml(editTextArea.value);
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course');
    const projectId = urlParams.get('project');
    update(ref(database, `courses/${courseId}/projects/${projectId}/comments/${commentId}`), { code: newCommentText });
    commentDiv.querySelector('.text').innerText = truncateText(newCommentText);
    commentDiv.removeChild(editTextArea);
    commentDiv.removeChild(saveButton);
  };

  commentDiv.appendChild(editTextArea);
  commentDiv.appendChild(saveButton);
}

// Delete comment
window.deleteComment = function(commentId) {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('course');
  const projectId = urlParams.get('project');
  remove(ref(database, `courses/${courseId}/projects/${projectId}/comments/${commentId}`));
}

// Toggle dropdown menu
window.toggleDropdown = function(commentId) {
  const commentDiv = document.querySelector(`.comment[data-comment-id='${commentId}']`);
  commentDiv.classList.toggle('show-dropdown');
}

// Read more functionality
window.readMore = function(commentId) {
  const commentDiv = document.querySelector(`.comment[data-comment-id='${commentId}']`);
  const text = commentDiv.querySelector('.text');
  const turncateText = commentDiv.querySelector('.turncate-text');
  const readMoreButton = commentDiv.querySelector('.read-more');

  if(window.getComputedStyle(text).display === 'none' && window.getComputedStyle(turncateText).display==='block'){
    text.style.display = 'block';
    turncateText.style.display = 'none';
    readMoreButton.innerText = 'read less';
  }else if(window.getComputedStyle(text).display==='block' && window.getComputedStyle(turncateText).display==='none'){
    text.style.display = 'none';
    turncateText.style.display = 'block';
    readMoreButton.innerText = 'Read More';
  }
}

// Toggle word wrap functionality
window.ToggleWordWrap = function(commentId) {
  const commentDiv = document.querySelector(`.comment[data-comment-id='${commentId}']`);
  const text = commentDiv.querySelector('.text');
  const turncateText = commentDiv.querySelector('.turncate-text');
  const wordWrapButton = commentDiv.querySelector('.word-wrap');

  if(window.getComputedStyle(text).whiteSpace !== 'pre-wrap'){
    console.log("word wrap enable");
    text.style.whiteSpace = 'pre-wrap';
    turncateText.style.whiteSpace = 'pre-wrap';
    wordWrapButton.innerText = 'disable word wrap';
  }else if(window.getComputedStyle(text).whiteSpace==='pre-wrap'){
    console.log("wrap disabled");
    text.style.whiteSpace = 'pre';
    turncateText.style.whiteSpace = 'pre';
    wordWrapButton.innerText = 'enable Word Wrap';
  }
}

// Copy comment functionality
window.copyComment = function(commentId) {
  const commentText = document.querySelector(`.comment[data-comment-id='${commentId}'] .text`).innerText;
  navigator.clipboard.writeText(commentText).then(() => {
    showToast('Comment copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Copy solution functionality
window.copySolution = function() {
  const solutionText = document.getElementById('code-snippet').innerText;
  navigator.clipboard.writeText(solutionText).then(() => {
    showToast('Solution copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Truncate text for comments
function truncateText(turncate_text) {
  const lines = turncate_text.split('');
  if (lines.length > 100) {
    return lines.slice(0, 100).join('') + '...';
  }
  return turncate_text;
}

// Show toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

