var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);
        var x = 0;
        var z = 0;
        var y = 0;
        var phase;
        var sphere;
        var camera;
		var lines;
        var north;
        var coords;
        var found = false;
        var scene;
        var currentStory;
        const MOON_SIZE = 1736.482;
        var planePic;
        var imageSelected = false;
        var android = false;

        try{
            //phase object with phase name and index
            phase = JSON.parse(Android.getMoonPhase());
            //magnetic north
            north = Android.getNorth();
            //coords.lon longitude
            //coords.lat latitude
            coords = JSON.parse(Android.getGeoposition());
            android = true;
        }catch(e){
            phase = { phase:1, phaseName:"Full"} ;
            coords = { lon:300, lat:400};
            north = -1;
        }
        //calculate position of the moon
        var longitude = coords.lon;
        var latitude = coords.lat;
        var date = new Date();
        var moonPosition = SunCalc.getMoonPosition(date,latitude,longitude);
        var altitude = moonPosition.altitude;
        var azimuth = 2*Math.PI - moonPosition.azimuth;
        var distance = moonPosition.distance/100;
        var parallacticAngle = moonPosition.parallacticAngle;

        var theta = azimuth;
        var phi = Math.PI/2 - altitude;
        var moonX = distance*Math.sin(phi)*Math.cos(theta);
        var moonZ = distance*Math.sin(phi)*Math.sin(theta);
        var moonY = distance*Math.cos(phi);

		        var makeTextPlane = function(text, color, size) {
		            var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
		            dynamicTexture.hasAlpha = true;
		            dynamicTexture.drawText(text, null, 100, "20px Arial", color, "transparent", true);
		            dynamicTexture.drawText(phase.phaseName + " Moon", null, 150, "20px Arial", color, "transparent", true);
		            var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
		            plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
		            plane.material.backFaceCulling = false;
		            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
		            plane.material.diffuseTexture = dynamicTexture;
		            return plane;
		        };

        var createScene = function () {
        
            // This creates a basic Babylon Scene object (non-mesh)
            var scene = new BABYLON.Scene(engine);
        
            // This creates and positions a free camera (non-mesh)
            if(isMobile.any){
                camera = new BABYLON.VRDeviceOrientationFreeCamera("Camera", new BABYLON.Vector3 (0, 0, 0), scene, 0);
            }else{
                document.getElementById("crosshair2").style.visibility = "hidden";
                document.getElementById("crosshair1").className = "crosshair-center";
                camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3 (0, 0, 0), scene, 0);
            }
            // This targets the camera to scene origin
            camera.setTarget(BABYLON.Vector3.Zero());

            camera.rotation.x = north;
            //Android.printTest("Norte"+north);
        
            // This attaches the camera to the canvas
            camera.attachControl(canvas, true);
        
            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(30, 0, -25), scene);
        
            // Default intensity is 1. Let's dim the light a small amount
            light.intensity = 0.7;
        
            // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
            sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, MOON_SIZE, scene);
        
            // Move the sphere upward 1/2 its height
            sphere.position.y = 1;
            sphere.position.z = 10;
            var materialSphere1 = new BABYLON.StandardMaterial("texture1", scene);
            //materialSphere1.diffuseColor = new BABYLON.Color3(0, 1, 0.35);
            materialSphere1.diffuseTexture = new BABYLON.Texture("js/texture/moon.jpg", scene);
            materialSphere1.bumpTexture = new BABYLON.Texture("js/texture/moonbump.png", scene);
            materialSphere1.specularPower = 0;

            sphere.material = materialSphere1;

		        var makeTextPlane2 = function(text, color, size) {
		            var dynamic = new BABYLON.DynamicTexture("TTexture", 250, scene, true);
		            dynamic.hasAlpha = true;
		            dynamic.drawText(text, null, 100, "20px Arial", color, "transparent", true);
		            var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
		            plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
		            plane.material.backFaceCulling = false;
		            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
		            plane.material.diffuseTexture = dynamic;
		            return plane;
		        };

		find = makeTextPlane2("Find the moon", "white", 250);
               	find.position = new BABYLON.Vector3(camera.position.x, camera.position.y, camera.position.z+500);
                find.material.emissiveColor = new BABYLON.Color3(255,255,255);
                find.lookAt(new BABYLON.Vector3(camera.position.x,camera.position.y,camera.position.z),0, 0, 0);
		find.parent = camera;

		setTimeout(function() { find.dispose(); }, 10000);

            var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;
            skybox.material = skyboxMaterial;
            skybox.infiniteDistance = true;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            var currentSky = "skybox"
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("js/texture/"+currentSky+"/skybox", scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

            scene.collisionsEnabled = true;
            camera.checkCollisions = true;

            lines = BABYLON.Mesh.CreateLines("lineMesh", [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 3000)
            ], scene);
            lines.material.alpha = 1;
            lines.parent = camera;

            sphere.checkCollisions = true;
            lines.checkCollisions = true;

            light.intensity = 0.5;

            switch (phase.phase) {
                case 0:
                    light.direction = new BABYLON.Vector3(0, 0, 0);
                    light.intensity = 0.1;
                    break;
                case 1:
                    light.direction = new BABYLON.Vector3(30, 0, 30);
                    break;
                case 2:
                    light.direction = new BABYLON.Vector3(30, 0, 10);
                    break;
                case 3:
                    light.direction = new BABYLON.Vector3(30, 0, -10);
                    break;
                case 4:
                    light.direction = new BABYLON.Vector3(10, 0, -30);
                    break;
                case 5:
                    light.direction = new BABYLON.Vector3(-20, 0, -20);
                    break;
                case 6:
                    light.direction = new BABYLON.Vector3(-30, 0, 0);
                    break;
                case 7:
                    light.direction = new BABYLON.Vector3(-30, 0, 30);
                    break;
                default:break;
            }
			sphere.position=new BABYLON.Vector3(moonX,moonY,moonZ);
            return scene;
        
        }

        // Returns a random integer between min (included) and max (included)
        // Using Math.round() will give you a non-uniform distribution!
        function getRandomIntInclusive(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        scene = createScene();


        engine.runRenderLoop(function () {
            scene.render();

            if ((lines.intersectsMesh(sphere, true)) && (!found)){
                currentStory=getRandomIntInclusive(0, 2);

                textPlaneTexture = makeTextPlane(stories[currentStory].title, "white", 500);
                textPlaneTexture.position = new BABYLON.Vector3(sphere.position.x/10, sphere.position.y/10+200, sphere.position.z/10);
                textPlaneTexture.material.emissiveColor = new BABYLON.Color3(255,255,255);
                textPlaneTexture.lookAt(new BABYLON.Vector3(camera.position.x,camera.position.y,camera.position.z),0, 0, 0);

                planePic = BABYLON.Mesh.CreatePlane("plane", 500.0, scene);
                var material = new BABYLON.StandardMaterial("texture", scene);
                material.diffuseTexture = new BABYLON.Texture("img/"+stories[currentStory].imgurl, scene);
                material.emissiveColor = new BABYLON.Color3(255,255,255);
                planePic.material = material;
                planePic.position = new BABYLON.Vector3(sphere.position.x/10-700, sphere.position.y/10, sphere.position.z/10);

                var audiofileurl="audio/s"+(currentStory+1)+".wav";
                if(android){
                    Android.playSound(audiofileurl);
                }else{
                    var audio = new Audio(audiofileurl);
                    audio.play();
                }
                planePic.lookAt(camera.position,0, 0, 0);
                found=true;
            }

            if ( found && !imageSelected ){
               if (lines.intersectsMesh(planePic, true)){
                   planePic.position.z-=500;
                   imageSelected=true;
               } else if (imageSelected){
                   planePic.position.z+=500;
                   imageSelected=false;
               }
           }
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });