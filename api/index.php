<?php
require('Slim/Slim.php');
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->config('templates.path','.');
$app->config('debug','false');


// Update data in JSON File
$app->post('/update', function () use($app) {
    $request = json_decode($app->request()->getBody());

    $file = "../data/presentation.json";
    if(substr(sprintf('%o', fileperms($file)), -4)=='0640') {
        echo json_encode(array("error" => "true", "message" => "no permission"));
        return false;
    }

    $fcJson = array();
    foreach($request->steps as $slide) {
        $fcJson[] = $slide;
    }

    if(!file_put_contents($file, json_encode($fcJson),LOCK_EX)) {
        echo json_encode(array("error" => "true", "message" => "can not write file"));
        return false;
    } //json_encode($fcJson,JSON_PRETTY_PRINT) doesn't work on hosteurope

    echo json_encode(array("error" => "false", "message" => "presentation saved"));
});

//get images
$app->get('/images', function() use($app) {

    $fileExtensions = array('jpg','png','jpeg','bmp','Jpg','Png','Jpeg','Bmp','JPG','PNG','JPEG','BMP');


    $dir_contents = scandir("../img");

    $imgJson = array();
    $i = 0;
    foreach($dir_contents as $imageFile) {
        $fileExt = substr($imageFile,(strrpos($imageFile,'.')+1));
        if($imageFile != '.' && $imageFile != '..' && in_array($fileExt,$fileExtensions)) {
            $imgJson[$imageFile] = array('id'=>$i, 'filename'=>$imageFile);
            $i++;
        }
    }

    echo json_encode(array("error" => "false", "message" => "images retrieved", "data" => $imgJson));

});

//get stylesheets
$app->get('/css', function() use($app) {

    $fileExtensions = array('css','Css','CSS');

    $dir_subdirs = scandir("../templates");

    $cssJson = array();

    $i = 0;
    foreach($dir_subdirs as $subdir) {
        if(strpos($subdir,'.') === false) {
            //get only directories
            $subdir_contents = scandir("../templates/".$subdir."/css");
            $j = 0;
            $cssJson[$subdir] = array('id'=>$i, 'dir' => $subdir);
            foreach($subdir_contents as $cssFile) {

                $fileExt = substr($cssFile,(strrpos($cssFile,'.')+1));
                if($cssFile != '.' && $cssFile != '..' && in_array($fileExt,$fileExtensions)) {
                    $cssJson[$subdir]['files'][] = array('id' => $j, 'filename'=>$cssFile);
                    $j++;
                }
            }
        }
    }

    echo json_encode(array("error" => "false", "message" => "styles retrieved", "data" => $cssJson));

});

//get presentation data
$app->get('/presentations', function() use($app) {

    $fileExtensions = array('json','Json','JSON');
    $fileNames = array('config','data');

    $dir_subdirs = scandir("../presentations");

    $dataJson = array();

    $i = 0;
    foreach($dir_subdirs as $subdir) {
        if(strpos($subdir,'.') === false) {
            //get only directories
            $subdir_contents = scandir("../presentations/".$subdir);
            $j = 0;
            $dataJson[$subdir] = array('id'=>$i, 'dir' => $subdir);
            foreach($subdir_contents as $jsonFile) {

                $fileExt = substr($jsonFile,(strrpos($jsonFile,'.')+1));
                $filename = substr($jsonFile,0,strrpos($jsonFile,'.'));
                if($jsonFile != '.' && $jsonFile != '..' && in_array($fileExt,$fileExtensions)  && in_array($filename,$fileNames)) {
                    $dataJson[$subdir]['files'][] = array('id' => $j, 'filename'=>$jsonFile);
                    $j++;
                }
            }
        }
    }

    echo json_encode(array("error" => "false", "message" => "styles retrieved", "data" => $dataJson));

});

$app->run();