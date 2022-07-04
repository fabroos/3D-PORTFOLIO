import * as THREE from 'three'

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 20, 20),
  new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
)
floor.position.x = floor.geometry.parameters.width / 2
floor.position.z = floor.geometry.parameters.width / 2

floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true

const wall1 = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 1),
  new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
)
wall1.position.y = wall1.geometry.parameters.height / 2

const wall2 = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 1),
  new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
)
wall2.position.y = wall2.geometry.parameters.height / 2

export { floor, wall1, wall2 }
