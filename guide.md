# Hướng Dẫn Thêm Note

## Cấu trúc thư mục

```
/
├── index.md                        ← Homepage
├── guide.md                        ← File này
├── .vitepress/config.mts           ← Config navigation & sidebar
└── contents/
    ├── content-and-data/           ← JCR, Query Builder, CF, Replication...
    ├── backend/                    ← OSGi, Servlets, Workflows, ACL...
    ├── tools/                      ← Groovy scripts
    └── ui/                         ← Coral UI, Touch UI...
```

---

## Thêm một file note mới

### Bước 1 — Tạo file `.md` vào đúng thư mục

Đặt file vào thư mục phù hợp với chủ đề:

```
contents/backend/sling-models.md
contents/content-and-data/dam-operations.md
contents/tools/migration-scripts.md
```

### Bước 2 — Thêm vào sidebar trong `.vitepress/config.mts`

Mở `.vitepress/config.mts`, tìm đúng section trong `sidebar` và thêm item:

```ts
{
  text: 'Backend',
  items: [
    { text: 'OSGi Configuration', link: '/contents/backend/osgi-configuration' },
    { text: 'Servlets',           link: '/contents/backend/servlets' },
    // Thêm vào đây:
    { text: 'Sling Models',       link: '/contents/backend/sling-models' },
  ],
},
```

- `text` — tên hiển thị trên sidebar
- `link` — đường dẫn từ root, **không có `.md`**, bắt đầu bằng `/`

### Bước 3 — Thêm vào `nav` (tuỳ chọn)

Nếu muốn xuất hiện trên thanh nav trên cùng, sửa phần `nav` trong config:

```ts
nav: [
  { text: 'Home',       link: '/' },
  { text: 'Backend',    link: '/contents/backend/osgi-configuration' },
  // ...
],
```

---

## Thêm một section mới

Ví dụ muốn thêm section **Infrastructure**:

**1. Tạo thư mục:**
```
contents/infrastructure/
```

**2. Tạo file markdown:**
```
contents/infrastructure/dispatcher.md
contents/infrastructure/ssl-setup.md
```

**3. Thêm sidebar section trong `config.mts`:**
```ts
{
  text: 'Infrastructure',
  collapsed: false,
  items: [
    { text: 'Dispatcher',  link: '/contents/infrastructure/dispatcher' },
    { text: 'SSL Setup',   link: '/contents/infrastructure/ssl-setup' },
  ],
},
```

---

## Format một file note

VitePress dùng Markdown chuẩn + một số tính năng mở rộng.

### Frontmatter (tuỳ chọn)

```yaml
---
title: Sling Models
description: Hướng dẫn dùng Sling Models trong AEM 6.5
---
```

### Callout boxes

```md
::: tip
Dùng `@Model(adaptables = Resource.class)` thay vì SlingHttpServletRequest khi không cần request context.
:::

::: warning
Không inject `ResourceResolver` trực tiếp — dùng `@SlingObject`.
:::

::: danger
Không commit credential vào repo.
:::

::: info
Áp dụng từ AEM 6.5 SP13 trở lên.
:::
```

Kết quả:

::: tip
Dùng `@Model(adaptables = Resource.class)` thay vì SlingHttpServletRequest khi không cần request context.
:::

::: warning
Không inject `ResourceResolver` trực tiếp — dùng `@SlingObject`.
:::

### Code block với ngôn ngữ và tiêu đề

````md
```java [MyService.java]
@Component(service = MyService.class)
public class MyServiceImpl implements MyService {
    // ...
}
```
````

### Code highlight dòng cụ thể

````md
```java{3,5-7}
public void doSomething() {
    // dòng bình thường
    String path = "/content/mysite"; // dòng 3 được highlight
    // dòng bình thường
    if (session != null) {           // dòng 5-7 được highlight
        session.save();
    }
}
```
````

---

## Dev server

```bash
# Dùng Node 22 trước (mỗi lần mở terminal mới)
fnm use 22

# Chạy dev server — hot reload, xem ngay thay đổi
npm run docs:dev
# → http://localhost:5173/

# Build static files để kiểm tra trước khi deploy
npm run docs:build

# Preview bản build
npm run docs:preview
```

---

## Deploy lên GitHub Pages

### Lần đầu tiên

1. Tạo repo trên GitHub, đặt tên `aem-note`
2. Nếu deploy vào **root domain** (ví dụ `username.github.io`) thì giữ `base: '/'` trong `.vitepress/config.mts`.
   Nếu deploy vào **subpath** (ví dụ `username.github.io/aem-note/`) thì đặt `base: '/aem-note/'`.
3. Vào **Settings → Pages → Source** → chọn **GitHub Actions**
4. Push lên nhánh `main`:
   ```bash
   git init
   git add .
   git commit -m "init"
   git remote add origin https://github.com/YOUR_USERNAME/aem-note.git
   git push -u origin main
   ```
5. GitHub Actions tự build và deploy. URL tuỳ theo cấu hình Pages (root domain hoặc subpath).

### Các lần sau

Chỉ cần push lên `main` — workflow tự chạy.

```bash
git add .
git commit -m "add: sling-models note"
git push
```
