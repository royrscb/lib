<?php

    require_once __DIR__.'/../lib/la.php';

    const VALID_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

    $data = json_decode($_POST['dataJSON'], true);
    $filesCount = count($_FILES['files']['name']);

    // Check valid formats ---
    $invalidFormatFileName = array_find($_FILES['files']['name'], function($file) {
        return !in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), VALID_FORMATS);
    });
    if($invalidFormatFileName){
        throwError('Invalid format for "'.$invalidFormatFileName.'"');
    }

    // Move files ---
    $newImagesNames = [];
    for($i = 0; $i < $filesCount; $i++){
        $tmp_name = $_FILES['files']['tmp_name'][$i];
        $extension = strtolower(pathinfo($_FILES['files']['name'][$i], PATHINFO_EXTENSION));

        // New image
        $newImageName = time();
        if (isset($data['name_prefix'])) $newImageName = $data['name_prefix'].$newImageName;
        if (parse_bool($data['multiple_images'])) $newImageName .= '-'.$i;
        $newImageName .= '.'.$extension;

        $newImageFileName = __DIR__.'/'.$data['destination_folder'].'/'.$newImageName;

        // Move to folder
        if(move_uploaded_file($tmp_name, $newImageFileName)) {
            array_push($newImagesNames, $newImageName);
        }
		else {
            throwException(500, 'Error uploading image ['.$i."]: '".$newImageFileName."'");
        }
    }

    echo json_encode($newImagesNames);

?>
