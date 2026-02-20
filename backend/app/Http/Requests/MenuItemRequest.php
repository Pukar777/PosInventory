<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MenuItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $menuItemId = $this->route('menu_item') ? $this->route('menu_item')->id : null;

        $rules = [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:menu_items,name,' . $menuItemId,
            'price' => 'required|numeric|min:0',
            'image' => 'nullable',
            'is_available' => 'boolean',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:ingredients,id',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
        ];

        if ($this->isMethod('patch') || $this->isMethod('put')) {
            $rules['category_id'] = 'sometimes|required|exists:categories,id';
            $rules['name'] = 'sometimes|required|string|max:255|unique:menu_items,name,' . $menuItemId;
            $rules['price'] = 'sometimes|required|numeric|min:0';
        }

        return $rules;
    }
}
