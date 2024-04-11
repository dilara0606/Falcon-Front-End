import './style.css'
import * as THREE from "three"
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//scene
const scene = new THREE.Scene ()

//create our sphere
const geometry = new THREE.SphereGeometry(3, 64, 64)
const material = new THREE.MeshStandardMaterial({ 
  color: "#FFC0CB", 
  roughness: 0.5,
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

//sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

//light
const light = new THREE.PointLight( 0xffffff)
light.position.set(5, 5, 5)
light.intensity = 10
scene.add(light)

const ambientLight = new THREE.AmbientLight(0x100100100);
scene.add(ambientLight);

//camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 20
scene.add(camera)

 // renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(2)
renderer.render(scene, camera)

//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.enableZoom = false
controls.autoRotate = true
controls.autoRotateSpeed = 5

//resize
window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update renderer
  renderer.setSize(sizes.width, sizes.height)
})

const loop = () => {
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(loop)
}
loop()

//Timeline 
const tl = gsap.timeline({defaults: {duration:1}})
tl.fromTo(mesh.scale, {z:0, x:0, y:0},{z:1, x:1, y:1})
tl.fromTo("nav", {y:"-100%"}, {y:"0%"})
tl.fromTo(".title", {opacity: 0}, {opacity: 1})

//Mouse animation color
let mouseDown = false
let rgb = [0,0,0]
window.addEventListener("mousedown", () => (mouseDown = true))
window.addEventListener("mouseup", () => (mouseDown = false))

window.addEventListener("mousemove", (e) => {
  if(mouseDown){
    rgb = [
      Math.round((e.pageX / sizes.width) * 255),
      Math.round((e.pageY / sizes.height) * 255),
      150,
    ]
    //animate
    let newColor = new THREE.Color(`rgb(${rgb.join(",")})`)
    gsap.to(mesh.material.color, { 
      r: newColor.r, 
      g: newColor.g, 
      b: newColor.b })
  }
})

//stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(85));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(400).fill().forEach(addStar);
