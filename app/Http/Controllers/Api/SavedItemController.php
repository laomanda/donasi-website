<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Program;
use App\Models\SavedItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedItemController extends Controller
{
    /**
     * List saved items for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $savedPrograms = SavedItem::where('user_id', $user->id)
            ->where('saveable_type', Program::class)
            ->with('saveable')
            ->get()
            ->pluck('saveable');

        $savedArticles = SavedItem::where('user_id', $user->id)
            ->where('saveable_type', Article::class)
            ->with('saveable')
            ->get()
            ->pluck('saveable');

        return response()->json([
            'programs' => $savedPrograms,
            'articles' => $savedArticles,
        ]);
    }

    /**
     * Toggle saving an item.
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'id'   => 'required|integer',
            'type' => 'required|string|in:Article,Program',
        ]);

        $user = Auth::user();
        $id   = $request->id;
        $type = $request->type === 'Article' ? Article::class : Program::class;

        // Verify item exists
        $model = $type::find($id);
        if (!$model) {
            return response()->json(['message' => 'Item not found.'], 404);
        }

        $savedItem = SavedItem::where('user_id', $user->id)
            ->where('saveable_id', $id)
            ->where('saveable_type', $type)
            ->first();

        if ($savedItem) {
            $savedItem->delete();
            return response()->json(['status' => 'removed', 'message' => 'Item removed from saved list.']);
        }

        SavedItem::create([
            'user_id'       => $user->id,
            'saveable_id'   => $id,
            'saveable_type' => $type,
        ]);

        return response()->json(['status' => 'saved', 'message' => 'Item saved successfully.']);
    }

    /**
     * Check if items are saved for global state in frontend.
     */
    public function checkStatus(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['saved_ids' => []]);

        $savedItems = SavedItem::where('user_id', $user->id)
            ->select('saveable_id', 'saveable_type')
            ->get()
            ->map(function($item) {
                $typeName = str_replace('App\\Models\\', '', $item->saveable_type);
                return "{$typeName}:{$item->saveable_id}";
            });

        return response()->json(['saved_items' => $savedItems]);
    }
}
