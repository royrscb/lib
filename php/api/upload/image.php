<?php

/**
 * Image upload endpoint.
 *
 * POST multipart/form-data
 * -------------------------------------------------------------------------------------------------
 * INPUT (request key => what it is)
 *   images[]   (required) The images. Allowed types and size are checked by saveUploadedImage().
 *   options    (required) JSON object, sent as a string, with the options below.
 *
 *              destination_folder  (required) string  Folder inside uploads/. Plain names separated
 *                                                     by '/', e.g. "photos/users". No '..'.
 *              name_prefix         (optional) string  Prefix of the saved image names, e.g. "user-".
 *                                                     Default "". Letters, digits, '_' and '-'.
 *              allow_multiple      (optional) bool    Add "_index" to the saved names, so the images
 *                                                     of one request don't overwrite each other.
 *                                                     Default false. Send true with several images.
 *
 *   Example options: {"destination_folder": "photos/users", "name_prefix": "user-", "allow_multiple": true}
 *
 * OUTPUT
 *   201 + JSON list with the names of the saved images, in the same order as images[].
 *   Saved name: {name_prefix}{unix time}[_{index}].{ext}   (_index only with allow_multiple)
 *
 * ERRORS
 *   401/403  Not logged in / not allowed.
 *   405      Not a POST.
 *   422      Missing or invalid input (see the checks below).
 * -------------------------------------------------------------------------------------------------
 *
 * Depends on (defined elsewhere): APP_ROOT, normalizeFilesArray(), saveUploadedImage().
 */

require_once __DIR__.'/../../lib/bootstrap.php';

// Config ---
const UPLOADS_DIR                   = APP_ROOT.'/uploads';
const UPLOAD_MAX_IMAGES             = 20;
const UPLOAD_MAX_NAME_PREFIX_LENGTH = 50;
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

$uploadedImages = normalizeFilesArray($_FILES['images'] ?? []);

// 3. Validate it ----------------------------------------------------------------------------------

// The folder comes from the client: only plain folder names, so it can't escape uploads/ ('..', absolute paths...)
if (!is_string($destinationFolder) || !preg_match('#^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$#D', $destinationFolder))
    throw new RuntimeException("Invalid 'destination_folder'", 422);
if (!is_string($namePrefix) || !preg_match('/^[A-Za-z0-9_-]{0,'.UPLOAD_MAX_NAME_PREFIX_LENGTH.'}$/D', $namePrefix))
    throw new RuntimeException("Invalid 'name_prefix'", 422);
if (empty($uploadedImages))
    throw new RuntimeException('No image uploaded', 422);
if (count($uploadedImages) > UPLOAD_MAX_IMAGES)
    throw new RuntimeException('Too many images (max '.UPLOAD_MAX_IMAGES.')', 422);

// 4. Save the images ------------------------------------------------------------------------------

$savedImageNames = [];

foreach ($uploadedImages as $index => $uploadedImage) {
    // Name without extension (saveUploadedImage() adds it): {name_prefix}{unix time}[_{index}]
    $imageBaseName = $namePrefix.time().($allowMultiple ? "_$index" : '');

    $savedImageNames[] = saveUploadedImage($uploadedImage, UPLOADS_DIR.'/'.$destinationFolder, $imageBaseName);
}

Api::sendJson($savedImageNames, 201);