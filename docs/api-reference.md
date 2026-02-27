# ChefMate AI — API Reference

Base URL: `http://localhost:3001/api` (development)

All protected routes require: `Authorization: Bearer <token>`

---

## Auth Routes (`/api/auth`)

### POST /api/auth/signup
```json
// Request
{ "email": "user@example.com", "name": "Priya", "password": "minLength8" }

// Response 201
{ "token": "eyJ...", "user": { "id": "uuid", "email": "...", "name": "..." } }

// Error 400 — email taken
{ "error": "EMAIL_TAKEN", "warmMessage": "That email is already cooking with us! Try logging in." }
```

### POST /api/auth/login
```json
// Request
{ "email": "user@example.com", "password": "..." }

// Response 200
{ "token": "eyJ...", "user": { ... } }

// Error 401
{ "error": "INVALID_CREDENTIALS", "warmMessage": "Hmm, that password doesn't seem right. Try again!" }
```

### POST /api/auth/refresh
```json
// Request header: Authorization: Bearer <expired-token>
// Response 200
{ "token": "eyJ..." }
```

---

## Chat Routes (`/api/chat`) 🔒

### POST /api/chat/message — SSE Streaming
```json
// Request
{
  "message": "What can I make with chicken and lemon?",
  "conversationId": "uuid or null (creates new)",
  "context": { "mood": "happy", "ingredients": ["chicken", "lemon"] }
}

// Response: Content-Type: text/event-stream
data: {"type":"text","delta":"Great choice! "}
data: {"type":"text","delta":"Here are some recipes:"}
data: {"type":"recipe","data":{"id":"...","title":"Lemon Herb Chicken","prepTime":45,"calories":520}}
data: {"type":"done","conversationId":"uuid"}
```

### GET /api/chat/history/:conversationId
```json
// Response 200
{
  "messages": [
    { "id": "uuid", "role": "user", "content": "...", "createdAt": "..." },
    { "id": "uuid", "role": "assistant", "content": "...", "metadata": {...}, "createdAt": "..." }
  ]
}
```

### DELETE /api/chat/:conversationId
```json
// Response 200
{ "success": true }
```

---

## Recipe Routes (`/api/recipes`) 🔒

### GET /api/recipes
Query params: `?cuisine=indian&dietary=vegetarian&difficulty=easy&page=1&limit=12`
```json
// Response 200
{
  "recipes": [{ "id": "uuid", "title": "...", "calories": 380, "prepTime": 25, ... }],
  "total": 84,
  "page": 1,
  "limit": 12
}
```

### GET /api/recipes/:id
```json
// Response 200
{
  "recipe": {
    "id": "uuid", "title": "...", "description": "...", "imageUrl": "...",
    "cuisine": "mediterranean", "dietary": ["gluten-free"],
    "difficulty": "medium", "prepTime": 45, "cookTime": 30, "servings": 4,
    "calories": 520, "protein": 38, "carbs": 12, "fat": 24, "fiber": 3,
    "ingredients": [{ "name": "chicken breast", "amount": "500", "unit": "g" }],
    "steps": [{ "stepNumber": 1, "instruction": "...", "tip": "..." }]
  }
}
```

### POST /api/recipes/generate — AI Generated ⚠️ Rate Limited (10/min)
```json
// Request
{
  "ingredients": ["chicken", "lemon", "garlic"],
  "mood": "happy",
  "dietary": "omnivore",
  "skill": "intermediate",
  "cuisine": "mediterranean"
}

// Response 200
{ "recipe": { ...full recipe object... } }

// Rate limited 429
{ "error": "RATE_LIMITED", "retryAfter": 45, "warmMessage": "ChefMate needs a tiny breather! ☕ Try again in 45 seconds." }
```

### POST /api/recipes/from-fridge — AI Generated ⚠️ Rate Limited (10/min)
```json
// Request
{ "ingredients": ["chicken", "onion", "tomato", "garlic", "lemon"] }

// Response 200
{ "recipes": [{ ...recipe... }, { ...recipe... }, { ...recipe... }] }
```

### GET /api/recipes/search?q=turmeric+dal
```json
// Response 200
{ "recipes": [...] }
```

### POST /api/recipes/:id/save
```json
// Response 200
{ "saved": true }
```

### GET /api/recipes/saved
```json
// Response 200
{ "recipes": [...] }
```

---

## Nutrition Routes (`/api/nutrition`) 🔒

### GET /api/nutrition/today
```json
// Response 200
{
  "date": "2026-02-27",
  "totals": { "calories": 1240, "protein": 68, "carbs": 180, "fat": 42, "fiber": 28 },
  "goal": { "calories": 1800, "protein": 120, "carbs": 250, "fat": 75, "fiber": 25 },
  "meals": [
    { "id": "uuid", "mealType": "breakfast", "mealName": "Oatmeal + Berries", "calories": 420, "loggedAt": "..." }
  ],
  "waterGlasses": 6
}
```

### POST /api/nutrition/log
```json
// Request
{
  "mealType": "lunch",
  "mealName": "Dal Rice + Salad",
  "calories": 480,
  "protein": 22,
  "carbs": 68,
  "fat": 12
}

// Response 201
{ "entry": { ...logEntry... }, "dailySummary": { ...totals... } }
```

### GET /api/nutrition/history?days=7
```json
// Response 200
{
  "history": [
    { "date": "2026-02-26", "calories": 1650, "protein": 95, "carbs": 220, "fat": 58 }
  ]
}
```

### POST /api/nutrition/water
```json
// Request
{ "action": "add" }  // or "remove"

// Response 200
{ "glasses": 7 }
```

### GET /api/nutrition/goals
### PUT /api/nutrition/goals
```json
// Request (PUT)
{ "calories": 1800, "protein": 120, "carbs": 250, "fat": 75, "fiber": 25 }
```

---

## Mood Routes (`/api/mood`) 🔒

### POST /api/mood/log
```json
// Request
{ "mood": "stressed", "note": "Big presentation today" }

// Response 201
{
  "entry": { "id": "uuid", "mood": "stressed", "loggedAt": "..." },
  "recommendations": {
    "recipes": [...],
    "tip": "Try some chamomile tea or warm soup to calm your nerves."
  }
}
```

### GET /api/mood/history?days=7
```json
// Response 200
{
  "history": [
    { "date": "2026-02-26", "mood": "happy" },
    { "date": "2026-02-27", "mood": "stressed" }
  ]
}
```

---

## User Routes (`/api/user`) 🔒

### GET /api/user/profile
```json
// Response 200
{
  "user": { "id": "uuid", "email": "...", "name": "Priya", "avatarUrl": null },
  "preferences": {
    "dietaryType": "vegetarian",
    "allergies": ["peanuts"],
    "cuisines": ["indian", "mediterranean"],
    "skillLevel": "intermediate",
    "calorieGoal": 1800,
    "theme": "warm-light",
    "language": "en"
  }
}
```

### PUT /api/user/profile
```json
// Request
{ "name": "Priya Sharma", "avatarUrl": "https://..." }
```

### PUT /api/user/preferences
```json
// Request
{
  "dietaryType": "vegetarian",
  "allergies": ["peanuts", "gluten"],
  "cuisines": ["indian", "italian"],
  "skillLevel": "intermediate",
  "calorieGoal": 1800,
  "theme": "warm-light"
}
```

### GET /api/user/streak
```json
// Response 200
{ "current": 7, "longest": 14, "lastActiveDate": "2026-02-27" }
```

### GET /api/user/achievements
```json
// Response 200
{
  "achievements": [
    { "key": "first_recipe", "title": "First Recipe!", "earnedAt": "...", "icon": "🍳" },
    { "key": "7_day_streak", "title": "7-Day Streak", "earnedAt": "...", "icon": "🔥" }
  ]
}
```

---

## Fridge Routes (`/api/fridge`) 🔒

### POST /api/fridge/recipes
```json
// Request
{ "ingredients": ["chicken", "onion", "tomato", "garlic", "lemon", "coriander"] }

// Response 200
{ "recipes": [...up to 6 recipe objects...] }
```

### POST /api/fridge/analyze-image
```json
// Request: multipart/form-data with 'image' field (base64 or file)

// Response 200
{ "detectedIngredients": ["chicken", "onion", "lemon", "garlic"] }
```

---

## Error Response Format

All errors follow this shape:
```json
{
  "error": "ERROR_CODE",
  "warmMessage": "Friendly ChefMate message for the user",
  "details": "Technical details (only in development mode)",
  "retryAfter": 30
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Validation error |
| 401  | Unauthorized (no/invalid token) |
| 403  | Forbidden |
| 404  | Not found |
| 409  | Conflict (e.g. email taken) |
| 422  | Unprocessable (business logic error) |
| 429  | Rate limited |
| 500  | Server error |
| 503  | AI service unavailable |
