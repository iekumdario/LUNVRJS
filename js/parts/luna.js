var geometry   = new THREE.SphereGeometry(1, 32, 32);
var material  = new THREE.MeshPhongMaterial();
material.map    = THREE.ImageUtils.loadTexture('../texture/moon.jpg');
var luna = new THREE.Mesh(geometry, material);
