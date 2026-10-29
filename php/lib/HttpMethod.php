<?php

declare(strict_types=1);

enum HttpMethod: string
{
    case Post   = 'POST';
    case Get    = 'GET';
    case Put    = 'PUT';
    case Delete = 'DELETE';
}
