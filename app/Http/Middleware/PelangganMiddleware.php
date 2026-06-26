<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PelangganMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role === 'pelanggan') {
            return $next($request);
        }

        if ($request->user() && $request->user()->role === 'admin') {
            return redirect('/admin/dashboard');
        }

        return redirect('/login');
    }
}
