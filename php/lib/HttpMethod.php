<?php

declare(strict_types=1);

enum HttpMethod: string
{
    case Post    = 'POST';
    case Get     = 'GET';
    case Head    = 'HEAD';
    case Put     = 'PUT';
    case Patch   = 'PATCH';
    case Delete  = 'DELETE';
    case Options = 'OPTIONS';
    case Trace   = 'TRACE';
    case Connect = 'CONNECT';
}
