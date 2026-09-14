# KitBox Control

Panel admin untuk menyalakan/mematikan fitur tools di KitBox. Terhubung ke Supabase yang sama dengan kitbox-tools-web, lewat tabel `feature_flags`.

## Menjalankan

```
npm install
npm run dev
```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, jangan pernah pakai prefix NEXT_PUBLIC)
- `ADMIN_ACCESS_PASSWORD` (server-only, password gate sementara sebelum Supabase Auth dipasang)
