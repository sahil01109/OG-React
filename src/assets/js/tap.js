const tapCount = document.querySelector(".tapCount");
const pointCont = document.querySelector(".pointCont");
const scoreCont = document.querySelector(".scoreCont");

const particleCount = 2;
let timer;
let points;
let userName;
// console.log(tapCount);

const increment = 2;
let power = 0;
let level = 1;
const levelThresholds = [10, 25, 40, 40000, 500000, 600000000];

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const createParticle = (e) => {
  return new Promise((resolve) => {
    const particle = document.createElement("h4");
    particle.textContent = 1;
    tapCount.appendChild(particle); //APPEND ELEMENT TO OUR TAP CONTAINER
    // RANDOMIZE THE PARTICLE STARTING POSITION
    const startX = e.clientX - tapCount.offsetLeft + getRandomInt(-50, 50);
    const startY = e.clientY - tapCount.offsetTop + getRandomInt(-50, 50);
    particle.style.top = `${startY}px`;
    particle.style.left = `${startX}px`;
    particle.style.opacity = 1;

    // WORKING ON THE END POINTS
    const endX = e.clientX - tapCount.offsetLeft + getRandomInt(-100, 100);
    const endY = e.clientY - tapCount.offsetTop + getRandomInt(-100, 100);

    setTimeout(() => {
      particle.style.bottom = `${endY}px`;
      particle.style.right = `${endX}px`;
      particle.style.opacity = 0;
    }, 500);

    setTimeout(() => {
      particle.remove();
      resolve();
    }, 1000);
  });
};

const tap = async (e) => {
  // Creating our element
  try {
    if (
      Number(scoreCont.textContent) > 0 &&
      Number(scoreCont.textContent) <= 2500
    ) {
      const particlePromises = [];
      for (let index = 0; index < particleCount; index++) {
        particlePromises.push(createParticle(e));
      }
      await Promise.all(particlePromises);

      // DOM MANIPULATION
      points = Number(pointCont.textContent) + particleCount;
      power += increment;
      pointCont.textContent = Number(pointCont.textContent) + particleCount;
      scoreCont.textContent = Number(scoreCont.textContent) - particleCount;

      function updateProgress() {
        const progressElement = document.getElementById('progress');
        const progress = (power / levelThresholds[level - 1]) * 100;
        progressElement.style.width = `${progress}%`;

        if (power >= levelThresholds[level - 1] && level < 6) {
          level++;
          power = 0;
          document.getElementById('level').textContent = level;
          progressElement.style.width = '0%';
        }
      }
      updateProgress();

      // localStorage.setItem(userName, points);
      if (timer) {
        // console.log(timer);
      } else {
        renewCount();
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// RENEW COUNT, LIKE RENEW ENERGY
const renewCount = () => {
  timer = setInterval(() => {
    if (Number(scoreCont.textContent) >= 2500) {
      clearInterval(timer);
      timer = undefined;
    } else {
      scoreCont.textContent = Number(scoreCont.textContent) + particleCount;
    }
  }, 500);
};

// EVENT LISTENERS
tapCount.addEventListener("click", tap);

// RUNS WHEN THE WEBSITE LOADS
window.addEventListener("load", () => {
  if (window.Telegram && window.Telegram.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    userName = user.username;
    userCont.textContent = userName;
    const dbref = ref(db);
    get(child(dbref, "users/" + userName)).then((snapshot) => {
      if (snapshot.exists()) {
        pointCont.textContent = snapshot.val().points;
      } else {
        console.log("Not found");
      }
    });
  }
});