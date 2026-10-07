<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $order = 1;
        $name = fake()->name();

        return [
            'employee_code'     => '0' . fake()->unique()->numerify('######'),
            'slug'              => Str::slug($name) . '-' . fake()->unique()->numberBetween(100, 9999),
            'name'              => $name,
            'email'             => fake()->unique()->safeEmail(),
            'phone'             => '08' . fake()->numerify('##########'),
            'position'          => fake()->randomElement(['Software Engineer', 'Finance Officer', 'HR Specialist', 'Marketing Lead']),
            'division'          => fake()->randomElement(['Teknologi Informasi', 'Keuangan', 'Operasional', 'Komunikasi']),
            'id_card_image'     => 'employees/id-cards/test-' . Str::random(16) . '.jpg',
            'employment_status' => 'active',
            'display_order'     => $order++,
            'is_published'      => true,
        ];
    }

    /**
     * Indicate that the employee is unpublished.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
        ]);
    }

    /**
     * Indicate that the employee is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'inactive',
        ]);
    }
}
