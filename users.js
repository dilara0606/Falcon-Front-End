import './style.css'
import * as THREE from "three"
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 30);
scene.add(camera);

//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 1

// Resize
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
});

// Timeline 
const tl = gsap.timeline({defaults: {duration:1}});
tl.fromTo("nav", {y:"-100%"}, {y:"0%"});
tl.fromTo("div", {x:"-100%"}, {x:"0%"});
//tl.fromTo(".title", {opacity: 0}, {opacity: 1});

// Add stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(85));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);


// Add table lights
const tableLight1 = new THREE.PointLight(0xffffff, 1, 20);
tableLight1.position.set(-5, 5, 5);
scene.add(tableLight1);

const tableLight2 = new THREE.PointLight(0xffffff, 1, 20);
tableLight2.position.set(5, 5, 5);
scene.add(tableLight2);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Animation loop
const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};
loop();

//pagination
const apiURL = `http://localhost:8090/time_spent/all`;

let pageSize = 5;
let currentPage = 0;

function updatePage(pageNumber) {
  fetch(`${apiURL}?pageNumber=${pageNumber}&pageSize=${pageSize}`).then(res => {
    res.json().then(data => {
      console.log(data);
      if (data.length > 0) {
        var temp = "";
        data.forEach((itemData) => {
          temp += "<tr>";
          temp += "<td>" + itemData.usersProjectsDTO.userDTO.name + "</td>";
          temp += "<td>" + itemData.usersProjectsDTO.userDTO.surname + "</td>";
          temp += "<td>" + itemData.usersProjectsDTO.projectDTO.name + "</td>";
          temp += "<td>" + itemData.date + "</td>";
          temp += "<td>" + itemData.times + "</td></tr>";
        });
        document.getElementById('dataContainer').innerHTML = temp;
      }
    })
  });
}

function updatePaginationButtons(totalPages) {
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.innerHTML = '';

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('btn-group');

  for (let i = 0; i < totalPages; i++) {
    console.log("Creating button for page:", i + 1);
    const button = document.createElement('button');
    button.textContent = i + 1;
    button.classList.add('btn', 'btn-light');
    button.addEventListener('click', function(event) {
      const clickedPage = parseInt(event.target.textContent) - 1;
      currentPage = clickedPage;
      updatePage(currentPage);
    });
    buttonGroup.appendChild(button);
  }
  
  console.log("Total buttons created:", buttonGroup.children.length);
  paginationContainer.appendChild(buttonGroup);
}

function fetchDataAndUpdate() {
  fetch(`${apiURL}?pageNumber=${currentPage}&pageSize=${pageSize}`).then(res => {
    res.json().then(data => {
      console.log("Received data:", data); 
      if (data.length > 0) {
        const totalRecords = 16;
        console.log("Total records:", totalRecords);
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (totalPages > 0) {
          updatePaginationButtons(totalPages);
          updatePage(currentPage);
        } else {
          console.error("Error: No records found.");
        }
      } else {
        console.error("Error: No records found.");
      }
    }).catch(error => {
      console.error("Error:", error);
    });
  }).catch(error => {
    console.error("Error:", error);
  });
}

document.getElementById('pageSizeSelect').addEventListener('change', function() {
  pageSize = parseInt(this.value);
  currentPage = 0;
  fetchDataAndUpdate();
});

fetchDataAndUpdate();

var button= document.getElementById('submit'); 

button.onclick = function (){
const timeSpentFilter = {
  userName: document.getElementById('name').value,        
  userSurname:document.getElementById('surname').value,      
  projectName: document.getElementById('project').value,      
  date: document.getElementById('date').value,          
  times: document.getElementById('times').value          
};

 fetch("http://localhost:8090/time_spent/search/timeSpent", {
  method: 'POST',
  body: JSON.stringify(timeSpentFilter),
  headers: {
    'Content-type': 'application/json; charset=UTF-8'
  }
  })
  .then(response => response.json())  
.then(data => {
  console.log('Success:', data);
  if (data.length > 0) {

    var temp = "";
    data.forEach((itemData) => {
      temp += "<tr>";
      temp += "<td>" + itemData.usersProjectsDTO.userDTO.name + "</td>";
      temp += "<td>" + itemData.usersProjectsDTO.userDTO.surname + "</td>";
      temp += "<td>" + itemData.usersProjectsDTO.projectDTO.name + "</td>";
      temp += "<td>" + itemData.date + "</td>";
      temp += "<td>" + itemData.times + "</td></tr>";
    });
    document.getElementById('dataContainer').innerHTML = temp;
  }
  else{
    document.getElementById('dataContainer').innerHTML = "<tr><td colspan='5'>No data found</td></tr>";
  }
})
.catch((error) => {
  console.error('Error:', error);  
})};
