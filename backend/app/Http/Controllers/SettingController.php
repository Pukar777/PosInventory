<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Exception;

class SettingController extends Controller
{
    /**
     * Display a listing of the settings organized by parent groups.
     */
    public function index()
    {
        $settings = Setting::whereNull('parent_id')
            ->with('children')
            ->get();

        return ApiResponse::success($settings, 'Settings retrieved successfully.');
    }

    /**
     * Update the specified settings values.
     */
    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:settings,id',
            'settings.*.value' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $updatedSettings = [];
            foreach ($validatedData['settings'] as $settingData) {
                // only update the value
                $setting = Setting::findOrFail($settingData['id']);
                $setting->value = $settingData['value'];
                $setting->save();
                $updatedSettings[] = $setting;
            }

            // Clear the settings cache so it is reloaded on next request
            Cache::forget('app_settings');

            DB::commit();

            return ApiResponse::success(
                $updatedSettings,
                'Settings updated successfully.'
            );
        } catch (Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Failed to update settings.', 500, ['error' => $e->getMessage()]);
        }
    }
}
