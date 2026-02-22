<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Config;
use App\Models\Setting;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        try {
            // Check if settings table exists before querying
            if (Schema::hasTable('settings')) {
                // TODO: Later add this data to Redis
                $settings = Cache::rememberForever('app_settings', function () {
                    // Get only string, numeric, select or boolean settings (ignoring groups which have null values)
                    return Setting::whereNotNull('value')->pluck('value', 'key')->toArray();
                });

                // Set all settings into config under the 'settings' key
                if (!empty($settings)) {
                    Config::set('settings', array_merge(config('settings', []), $settings));
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't break the application if DB is down or migrating
            \Log::error('SettingsServiceProvider failed to load settings: ' . $e->getMessage());
        }
    }
}
