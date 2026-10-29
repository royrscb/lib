<?php
/**
 * Image upload endpoint.
 *
 * POST multipart/form-data
 * -------------------------------------------------------------------------------------------------
 * INPUT (request key => what it is)
 *   images[]   (required) The images. Always sent with the [] even if there is only one.
 *              Allowed types and size: see Config below.
 *   options    (required) JSON object, sent as a string, with the options below.
 *
 *              destination_folder  (required) string  Folder inside uploads/, which must already exist.
 *                                                     Plain names separated by '/', e.g. "photos/users".
 *                                                     No '..'.
 *              name_prefix         (optional) string  Prefix of the saved file names, e.g. "user-".
 *                                                     Default "". Letters, digits, '_' and '-'.
 *              allow_multiple      (optional) bool    Add "_index" to the saved file names. Without it,
 *                                                     two images in one request get the same name (409).
 *                                                     Default false. Send true with several images.
 *
 *   Example options: {"destination_folder": "photos/users", "name_prefix": "user-", "allow_multiple": true}
 *
 * OUTPUT
 *   201 + JSON list with the names of the saved files, in the same order as images[].
 *   File name: {name_prefix}{unix time}[_{index}].{ext}   (_index only with allow_multiple)
 *   If that file already exists, the request fails (409).
 *   If an image fails, the ones already saved in this request are deleted.
 *
 * ERRORS
 *   400      Not an uploaded file.
 *   405      Not a POST.
 *   409      A file with that name already exists.
 *   413      An image is too large.
 *   415      An image is not one of ALLOWED_IMAGE_EXTENSIONS.
 *   422      Missing or invalid input (see the checks below).
 *   500      An image can't be saved.
 */

declare(strict_types=1);
require_once __DIR__.'/../../bootstrap.php';

// Config ---
const UPLOADS_DIR              = APP_ROOT.'/uploads'; // destination_folder goes inside it
const MAX_IMAGES               = 10;
const MAX_IMAGE_BYTES          = 10_000_000; // 10 Mb
const MAX_NAME_PREFIX_LENGTH   = 50;
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic']; // jpg and jpeg are the same format: always saved as .jpg
const HEIC_MIME_TYPES          = ['image/heic', 'image/heif']; // iPhone photos. getimagesize() doesn't know them, so the mime type is checked
// ---

// 1. Access ---------------------------------------------------------------------------------------

if (Request::method() !== HttpMethod::Post)
    throw new RuntimeException('Method not allowed', 405);

// 2. Read the input -------------------------------------------------------------------------------
// Each variable is named after its request key in camelCase (destination_folder => $destinationFolder)

$options = json_decode(Request::vars()['options'] ?? '', true);

if (!is_array($options))
    throw new RuntimeException("'options' must be a valid JSON object", 422);

$destinationFolder = $options['destination_folder'] ?? null;
$namePrefix        = $options['name_prefix'] ?? '';
$allowMultiple     = filter_var($options['allow_multiple'] ?? false, FILTER_VALIDATE_BOOLEAN);

// images[]: PHP gives one list per property, not one array per image: $images['tmp_name'][0], $images['error'][0]...
$images     = $_FILES['images'] ?? [];
$imageCount = is_array($images['name'] ?? null) ? count($images['name']) : 0;

// 3. Validate it ----------------------------------------------------------------------------------

// The folder comes from the client: only plain folder names, so it can't escape uploads/ ('..', absolute paths...)
if (!is_string($destinationFolder) || !preg_match('#^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$#D', $destinationFolder))
    throw new RuntimeException("Invalid 'destination_folder'", 422);

$destinationDir = UPLOADS_DIR.'/'.$destinationFolder;

if (!is_dir($destinationDir))
    throw new RuntimeException("'destination_folder' does not exist", 422);
if (!is_string($namePrefix) || !preg_match('/^[A-Za-z0-9_-]{0,'.MAX_NAME_PREFIX_LENGTH.'}$/D', $namePrefix))
    throw new RuntimeException("Invalid 'name_prefix'", 422);
if ($imageCount === 0)
    throw new RuntimeException('No image uploaded', 422);
if ($imageCount > MAX_IMAGES)
    throw new RuntimeException('Too many images (max '.MAX_IMAGES.')', 422);

// 4. Check and save the images --------------------------------------------------------------------
// The real content of each image is checked (not the type the browser claims) and its original name is never used.

$finfo = new finfo(FILEINFO_MIME_TYPE);
$savedFilePaths = [];

try {
    foreach ($images['tmp_name'] as $index => $tmpName) {
        $error = $images['error'][$index];
        $size  = $images['size'][$index];

        if (is_array($error))
            throw new RuntimeException('No image uploaded', 422);
        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE || $size > MAX_IMAGE_BYTES)
            throw new RuntimeException('Image too large', 413);
        if ($error !== UPLOAD_ERR_OK)
            throw new RuntimeException("Upload error $error", 422);
        if (!is_uploaded_file($tmpName))
            throw new RuntimeException('Invalid upload', 400);

        $imageInfo = @getimagesize($tmpName); // false if PHP doesn't know the format. [2] is its type (IMAGETYPE_JPEG...)
        $extension = $imageInfo ? image_type_to_extension($imageInfo[2], false) : null; // 'jpeg', 'png'... (false if unknown)
        if ($extension === 'jpeg')
            $extension = 'jpg'; // PHP calls it jpeg

        // HEIC is not an image type for getimagesize(): only its mime type (the start of the file) is checked
        if ($imageInfo === false && in_array($finfo->file($tmpName), HEIC_MIME_TYPES, true))
            $extension = 'heic';

        if (!in_array($extension, ALLOWED_IMAGE_EXTENSIONS, true))
            throw new RuntimeException('Invalid format: only '.implode(', ', ALLOWED_IMAGE_EXTENSIONS).' images are allowed', 415);

        // {name_prefix}{unix time}[_{index}].{ext}
        // e.g. "user-1700000000.jpg" or, with allow_multiple, "user-1700000000_0.jpg", "user-1700000000_1.jpg"...
        $fileName = $namePrefix.time().($allowMultiple ? "_$index" : '').".$extension";
        $filePath = "$destinationDir/$fileName";

        if (file_exists($filePath))
            throw new RuntimeException("File already exists: $fileName", 409);

        if (!move_uploaded_file($tmpName, $filePath))
            throw new RuntimeException('Can not save the uploaded image', 500);

        $savedFilePaths[] = $filePath;
    }
}
catch (Throwable $e) {
    // One invalid image saves none: delete the ones already saved in this request
    foreach ($savedFilePaths as $filePath)
        unlink($filePath);

    throw $e;
}

Api::sendJson(array_map(basename(...), $savedFilePaths), 201);