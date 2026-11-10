# lib

Reusable utility code for PHP, JavaScript, TypeScript, TSX, CSS, and Unity.

## PHP

The PHP library is in [`php/`](./php/). It provides HTTP/API helpers,
authentication, MySQL table access, email, Telegram, and shared utilities.

### Requirements

- PHP 8.3 or newer
- PHP extensions: cURL, mbstring, and mysqli
- Imagick is optional and is only needed by `reduce_image_width()`

### Setup

Include `php/bootstrap.php` from application entry points to load configuration,
register error handling, configure UTC, and register the project's class loader.
Create `php/.env` for the application and set the environment values required
by the services you use; do not commit that file.

### Web server configuration

The included `.htaccess` files deny access to dotfiles and `logs/` and disable
directory listings on Apache 2.4 when `AllowOverride` permits the relevant
directives. Other web servers do not read `.htaccess`; configure equivalent
rules there. Prefer exposing only the intended public entry points rather than
the whole PHP directory as the document root.
