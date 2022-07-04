import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// gltg loader
import { floor, wall1, wall2 } from './room/room'
import { Easing, Tween } from '@tweenjs/tween.js'
import { Plane } from 'three'

// dom elements
const portfolioHTML = document.querySelector('#portfolio')
const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)

const roomGroup = new THREE.Group()

const loader = new GLTFLoader()
loader.load(
  './setup/scene.gltf',
  gltf => {
    gltf.scene.position.set(15, 0, 15)
    gltf.scene.scale.set(1.5, 1.5, 1.5)
    gltf.scenes[0].traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
      }
    })
    // put the center of gtlf in the bottom of the scene
    gltf.scene.rotation.y = Math.PI / 2
    gltf.scene.castShadow = true
    gltf.scene.receiveShadow = true
    roomGroup.add(gltf.scene)
    let bbox = new THREE.Box3().setFromObject(gltf.scene)
    let size = bbox.getSize(new THREE.Vector3()) // HEREyou get the size
    gltf.scene.position.y = size.y / 3.17
  },
  undefined,
  error => {
    console.error(error)
  }
)
loader.load('./table-lamp/scene.gltf', gltf => {
  gltf.scene.position.set(10, 20, 5)
  gltf.scene.scale.set(0.2, 0.2, 0.2)
  gltf.scene.rotation.y = -Math.PI / 2 - Math.PI / 4
  roomGroup.add(gltf.scene)
})
roomGroup.add(floor)
roomGroup.add(wall1)
wall1.position.x = wall1.geometry.parameters.width / 2
roomGroup.add(wall2)
wall2.rotation.y = Math.PI / 2
wall2.position.z = wall2.geometry.parameters.width / 2

scene.add(roomGroup)
function parallaxRoomGroup (x, y) {
  if (x > innerWidth / 2) {
    roomGroup.rotation.y += x * 0.01
  } else {
    if (roomGroup.rotation.y < -100) roomGroup.rotation.y -= x * 0.001
  }
}
const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(devicePixelRatio)
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.getElementById('canvas').appendChild(renderer.domElement)

const axesHelper = new THREE.AxesHelper(100)
scene.add(axesHelper)
// ------------------------------------- planeMesh initialization ---------------------------------------------------

//  --------------------------------------------------------------------------------------------------------------------
// const light from top
// const light = new THREE.DirectionalLight(0xff_ff_ff, 1)
// light.position.set(0, 100, 0)
// scene.add(light)
// const light from bottom

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// ambientLight.position.set(50, 100, 50)
// scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 1.1, 240)
light.position.set(50, 50, 50)
light.castShadow = true
scene.add(light)
const helper = new THREE.PointLightHelper(light, 5)
scene.add(helper)

// we need to put the camera in the right position

//Set up shadow properties for the light
light.shadow.mapSize.width = 512 // default
light.shadow.mapSize.height = 512 // default
light.shadow.camera.near = 0.5 // default
light.shadow.camera.far = 500 // default

// ------------------------------------- orbitControls initialization ---------------------------------------------------
// const orbitControls = new OrbitControls(camera, renderer.domElement)
// orbitControls.autoRotate = true

// we need to animate the scene in a tick
// request animation frame is a function that will be called every time the browser is ready to render a new frame

const mouse = {
  x: 0,
  y: 0
}
let frame = 0

// ------------------------------------- mouse events ---------------------------------------------------

// ------------------------------------- in monitor ---------------------------------------------------
const positionMonitor = new THREE.Vector3(12, 30, 29)
camera.position.y = 30
camera.position.z = 30
camera.position.x = 70
camera.lookAt(
  roomGroup.children[2].position.x - 30,
  0,
  roomGroup.children[2].position.z - 20
)
const coords = {
  x: camera.position.x,
  y: camera.position.y,
  z: camera.position.z
}
let inMonitor
const tween = new Tween(coords) // Create a new tween that modifies 'coords'.
  .to(
    {
      x: positionMonitor.x,
      y: positionMonitor.y,
      z: positionMonitor.z
    },
    1000
  ) // Move to (300, 200) in 1 second.
  .easing(Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
  .onUpdate(() => {
    // Called after tween.js updates 'coords'.
    // Move 'box' to the position described by 'coords' with a CSS translation.
    camera.position.setX(coords.x)
    camera.position.setY(coords.y)
    camera.position.setZ(coords.z)
  })
  .onComplete(() => {
    document.querySelector('.container').style.display = 'none'
    portfolioHTML.style.display = 'block'
  })
// Called after tween.js updates 'coords'.

// ------------------------------------- out monitor ---------------------------------------------------

const tweenOut = new Tween(positionMonitor) // Create a new tween that modifies 'coords'.
  .to(
    {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    },
    1000
  ) // Move to (300, 200) in 1 second.
  .easing(Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
  .onUpdate(() => {
    // Called after tween.js updates 'coords'.
    // Move 'box' to the position described by 'coords' with a CSS translation.
    camera.position.setX(positionMonitor.x)
    camera.position.setY(positionMonitor.y)
    camera.position.setZ(positionMonitor.z)
  })

function animate () {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  // rotate the camera around the scene
  if (inMonitor !== undefined) {
    if (inMonitor) {
      tween.update()
    } else {
      tweenOut.update()
    }
  }

  parallaxRoomGroup(mouse.x, mouse.y)
  raycaster.setFromCamera(mouse, camera)
  frame += 0.01

  // parallax effect
}

animate()

addEventListener('mousemove', event => {
  const { clientX, clientY } = event

  mouse.x = (clientX / innerWidth) * 2 - 1
  mouse.y = -(clientY / innerHeight) * 2 + 1
})

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

document.getElementById('btn-cv').addEventListener('click', () => {
  portfolioHTML.style.animation = 'opening 0.5s ease-in-out'

  inMonitor = true
  tween.start()
})

document.getElementById('btn-close').addEventListener('click', () => {
  portfolioHTML.style.animation = 'closing 0.5s ease-in-out'
  setTimeout(() => {
    portfolioHTML.style.display = 'none'
    document.querySelector('.container').style.display = 'block'
    inMonitor = false
    tweenOut.start()
  }, 500)
})
