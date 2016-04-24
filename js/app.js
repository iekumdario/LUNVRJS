var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);
        var x = 0;
        var z = 0;
        var y = 0;
        var phase;
        var sphere;
        var camera;

        var createScene = function () {
        
            // This creates a basic Babylon Scene object (non-mesh)
            var scene = new BABYLON.Scene(engine);
        
            // This creates and positions a free camera (non-mesh)
            camera = new BABYLON.VRDeviceOrientationFreeCamera("Camera", new BABYLON.Vector3 (0, 0, 0), scene, 0);
        
            // This targets the camera to scene origin
            camera.setTarget(BABYLON.Vector3.Zero());
        
            // This attaches the camera to the canvas
            camera.attachControl(canvas, true);
        
            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(30, 0, -25), scene);
        
            // Default intensity is 1. Let's dim the light a small amount
            light.intensity = 0.7;
        
            // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
            sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 15, scene);
        
            // Move the sphere upward 1/2 its height
            sphere.position.y = 1;
            sphere.position.z = 10;
            var materialSphere1 = new BABYLON.StandardMaterial("texture1", scene);
            //materialSphere1.diffuseColor = new BABYLON.Color3(0, 1, 0.35);
            materialSphere1.diffuseTexture = new BABYLON.Texture("js/texture/moon.jpg", scene);
            materialSphere1.bumpTexture = new BABYLON.Texture("js/texture/moonbump.png", scene);
            materialSphere1.specularPower = 0;

            sphere.material = materialSphere1;
            var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
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

            try{
                var test = Android.getMoonPhase();
                phase = JSON.parse(test);
                Android.printPosition(phase.phaseName);
            }catch(e){
                phase={phase:1,phaseName:"Full"};
            }

        switch (phase.phase) {
            case 0:
                light.direction = new BABYLON.Vector3(0, 0, 0);
                light.intensity = 0.1;
                break;
            case 1:
                light.direction = new BABYLON.Vector3(30, 0, 30);
                light.intensity = 0.5;
                break;
            case 2:
                light.direction = new BABYLON.Vector3(30, 0, 10);
                light.intensity = 0.5;
                break;
            case 3:
                light.direction = new BABYLON.Vector3(30, 0, -10);
                light.intensity = 0.5;
                break;
            case 4:
                light.direction = new BABYLON.Vector3(10, 0, -30);
                light.intensity = 0.5;
                break;
            case 5:
                light.direction = new BABYLON.Vector3(-20, 0, -20);
                light.intensity = 0.5;
                break;
            case 6:
                light.direction = new BABYLON.Vector3(-30, 0, 0);
                light.intensity = 0.5;
                break;
            case 7:
                light.direction = new BABYLON.Vector3(-30, 0, 30);
                light.intensity = 0.5;
                break;
            default:break;
        }

            return scene;
        
        }
        
        var scene = createScene();

        document.getElementById("phase").innerHTML=phase.phaseName;

        engine.runRenderLoop(function () {
            x+=0.002;
            z+=0.0020;
            sphere.position=new BABYLON.Vector3(Math.cos(x)*25,0,Math.sin(x)*25);
            scene.render();
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });