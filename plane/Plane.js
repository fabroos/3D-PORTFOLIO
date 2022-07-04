import * as THREE from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const plane = {
  width: 400,
  height: 400,
  widthSegments: 50,
  heightSegments: 50
}
class Plane extends THREE.Mesh {
  constructor () {
    super(
      new THREE.PlaneGeometry(
        plane.width,
        plane.height,
        plane.widthSegments,
        plane.heightSegments
      ),
      new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        flatShading: THREE.FlatShading,
        vertexColors: true
      })
    )
    this.frame = 0
  }
  generatePlane () {
    this.geometry.dispose()
    this.geometry = new THREE.PlaneGeometry(
      plane.width,
      plane.height,
      plane.widthSegments,
      plane.heightSegments
    )

    // vertice position randomization
    const { array } = this.geometry.attributes.position
    const randomValues = []
    for (let i = 0; i < array.length; i++) {
      if (i % 3 === 0) {
        const x = array[i]
        const y = array[i + 1]
        const z = array[i + 2]

        array[i] = x + (Math.random() - 0.5) * 3
        array[i + 1] = y + (Math.random() - 0.5) * 3
        array[i + 2] = z + (Math.random() - 0.5) * 3
      }

      randomValues.push(Math.random() * Math.PI * 2)
    }

    this.geometry.attributes.position.randomValues = randomValues
    this.geometry.attributes.position.originalPosition = this.geometry.attributes.position.array

    const colors = []
    for (let i = 0; i < this.geometry.attributes.position.count; i++) {
      colors.push(0, 0.19, 0.4)
    }

    this.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    )
  }
  intersect (raycaster, mouse) {
    const {
      array,
      originalPosition,
      randomValues
    } = this.geometry.attributes.position
    for (let i = 0; i < array.length; i += 3) {
      // x
      array[i] =
        originalPosition[i] + Math.cos(this.frame + randomValues[i]) * 0.01

      // y
      array[i + 1] =
        originalPosition[i + 1] +
        Math.sin(this.frame + randomValues[i + 1]) * 0.001
    }
    this.geometry.attributes.position.needsUpdate = true
    const intersects = raycaster.intersectObject(this)

    if (intersects.length > 0) {
      const { color } = intersects[0].object.geometry.attributes

      // from the color of the plane => 0, 0.19, 0.4
      // to the color of the intersected point => 0.1, 0.5, 1
      // vertice 1

      intersects[0].object.geometry.attributes.color.needsUpdate = true

      const hoverColor = {
        r: 0.1,
        g: 0.5,
        b: 1
      }
      const initialColor = {
        r: 0,
        g: 0.19,
        b: 0.4
      }
      gsap.to(hoverColor, {
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        onUpdate: () => {
          const vertice1 = intersects[0].face.a
          color.setX(vertice1, hoverColor.r)
          color.setY(vertice1, hoverColor.g)
          color.setZ(vertice1, hoverColor.b)
          // vertice 2
          const vertice2 = intersects[0].face.b
          color.setX(vertice2, hoverColor.r)
          color.setY(vertice2, hoverColor.g)
          color.setZ(vertice2, hoverColor.b)
          // vertice 3
          const vertice3 = intersects[0].face.c
          color.setX(vertice3, hoverColor.r)
          color.setY(vertice3, hoverColor.g)
          color.setZ(vertice3, hoverColor.b)
        }
      })
    }
  }
}

export { Plane }
