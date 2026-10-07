<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicCacheHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (in_array($request->method(), ['GET', 'HEAD'], true)
            && $response->getStatusCode() === Response::HTTP_OK
            && !$request->user()) {
            // Set Symfony's cache metadata as well as the header so the final
            // response preparation step does not downgrade it to private.
            $response->setPublic();
            $response->setMaxAge(60);
            $response->setSharedMaxAge(60);
            $response->headers->addCacheControlDirective('stale-while-revalidate', 300);
            $response->setEtag(sha1((string) $response->getContent()));

            if ($response->isNotModified($request)) {
                return $response;
            }
        }

        return $response;
    }
}

