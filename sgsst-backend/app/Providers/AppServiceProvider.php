<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // El token fue creado por tienda-multitenancy con namespace App\Models\Auth\User
        // Mapeamos ese tipo al User de este backend
        Relation::morphMap([
            'App\\Models\\Auth\\User' => User::class,
        ]);
    }
}
