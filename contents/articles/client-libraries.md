# Client Libraries (Clientlibs)

Client libraries (clientlibs) là cơ chế của AEM để quản lý việc deliver CSS và JavaScript. Chúng cung cấp dependency management, aggregation, minification, proxy serving, và cache busting — tất cả được cấu hình declaratively trong repository.

Khác với static files thông thường, clientlibs cung cấp:
- **Categories** — tên logic nhóm các CSS/JS files lại với nhau
- **Dependencies** — khai báo thứ tự load giữa các libraries
- **Embedding** — inline nội dung của một library vào library khác để giảm HTTP requests
- **Proxy serving** — serve files từ `/etc.clientlibs/` thay vì `/apps/` (bị block trên publish)
- **Minification** — built-in CSS/JS minification và GZip compression
- **Cache busting** — content-hash URLs để browser cache lâu dài

> **Tài liệu gốc:** [AEM 6.5 — Using Client-Side Libraries](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/implementing/developing/introduction/clientlibs)

---

## Cấu Trúc Thư Mục

Một clientlib là một JCR node kiểu `cq:ClientLibraryFolder`. Trên filesystem (trong `ui.apps`):

```
clientlib-site/
├── .content.xml        ← Node definition: categories, dependencies, embed, allowProxy
├── js.txt              ← Manifest: danh sách JS files (theo thứ tự)
├── css.txt             ← Manifest: danh sách CSS files (theo thứ tự)
├── js/
│   ├── main.js
│   └── utils.js
├── css/
│   ├── styles.css
│   └── layout.css
└── resources/          ← Static resources: fonts, images, SVGs
    ├── fonts/
    │   └── myfont.woff2
    └── icons/
        └── logo.svg
```

### .content.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"/>
```

Các thuộc tính quan trọng:

| Thuộc tính | Mô tả |
|---|---|
| `jcr:primaryType` | Phải là `cq:ClientLibraryFolder` |
| `categories` | Tên logic để reference khi load |
| `allowProxy` | Serve từ `/etc.clientlibs/` — **bắt buộc** |
| `dependencies` | Các categories phải load trước |
| `embed` | Inline nội dung của categories khác vào đây |
| `channels` | Giới hạn theo device channel (hiếm dùng) |
| `cssProcessor` | Override CSS minifier (ví dụ: `[default:less, min:gcc]`) |
| `jsProcessor` | Override JS minifier (ví dụ: `[min:gcc]`) |

### js.txt / css.txt

Plain-text files liệt kê source files cần include theo thứ tự. Dùng `#base=` để đặt base directory:

```
#base=js
main.js
utils.js
```

```
#base=css
styles.css
layout.css
```

**Rules:**
- Một filename mỗi dòng
- Dòng bắt đầu bằng `#` là directives hoặc comments
- `#base=js` đặt base directory là `js/` — các filenames tiếp theo là relative so với thư mục đó
- Files được concatenate theo thứ tự liệt kê
- Missing files tạo build warning nhưng không hard failure

::: warning
Nếu bỏ `#base=`, AEM tìm files trực tiếp trong root của clientlib folder — không phải trong subdirectory. Đây là nguyên nhân phổ biến gây lỗi "file not found".
:::

### Resources Folder

Files trong `resources/` được serve as-is (fonts, images, SVGs) qua proxy URL:

```
/etc.clientlibs/myproject/clientlibs/clientlib-site/resources/fonts/myfont.woff2
```

Reference trong CSS bằng relative path:

```css
@font-face {
    font-family: 'MyFont';
    src: url('resources/fonts/myfont.woff2') format('woff2');
}
```

---

## Categories

Categories là identity của clientlib. Đây là tên logic — không phải file path — mà bạn reference khi load CSS/JS trong templates.

### Naming Conventions

Dùng dot-separated namespace để tránh collision:

```
myproject.site               ← Global site CSS/JS
myproject.dependencies       ← Third-party vendor libs
myproject.components.hero    ← Component-specific
myproject.components.card    ← Component-specific
cq.authoring.dialog          ← AEM built-in: load trong mọi Touch UI dialog
cq.authoring.editor.hook     ← AEM built-in: load trong page editor
```

### Multiple Categories

Một clientlib có thể thuộc nhiều categories:

```xml
categories="[myproject.site, myproject.base]"
```

Cả `myproject.site` và `myproject.base` đều resolve về files của clientlib này.

### Category Collisions

Nếu hai clientlib folders khai báo cùng category, cả hai đều được load và files được concatenate. Điều này có thể gây duplicate CSS/JS hoặc ordering issues. Luôn namespace với project prefix và kiểm tra collisions bằng **dump libs tool**.

---

## Dependencies và Embedding

### Dependencies

Property `dependencies` khai báo rằng các categories khác phải được load **trước** clientlib này. Mỗi dependency được load như một HTTP request riêng biệt.

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"
    dependencies="[myproject.dependencies, myproject.base]"/>
```

Khi `myproject.site` được load, AEM đảm bảo `myproject.dependencies` và `myproject.base` load trước (dưới dạng separate requests).

### Embedding

Property `embed` **inline** nội dung CSS/JS của library khác vào library này. Files của embedded library trở thành một phần output của library hiện tại — không cần thêm HTTP request.

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"
    embed="[myproject.components.hero, myproject.components.card, myproject.components.footer]"/>
```

Một request duy nhất tới `myproject.site` serve combined output của tất cả bốn libraries.

### Dependencies vs Embedding

| | `dependencies` | `embed` |
|---|---|---|
| HTTP request | Separate request cho mỗi dep | Gộp vào một request |
| Caching | Cached độc lập | Cần rebuild khi dep thay đổi |
| Dùng cho | Vendor libraries lớn | Component clientlibs riêng |

**Pattern phổ biến:** dùng `dependencies` cho shared vendor libraries (cache một lần, reuse), dùng `embed` cho component clientlibs của project (bundle vào một file site-wide).

---

## allowProxy Mechanism

Path `/apps/` bị block bởi Dispatcher trên publish instances vì lý do bảo mật. Không có `allowProxy`, clientlib CSS/JS sẽ 404 trên publish.

Setting `allowProxy="{Boolean}true"` làm AEM serve nội dung clientlib từ `/etc.clientlibs/`:

```
Vị trí thực:  /apps/myproject/clientlibs/clientlib-site/css/styles.css
Proxy URL:    /etc.clientlibs/myproject/clientlibs/clientlib-site/css/styles.css
```

::: danger
**Luôn set `allowProxy="{Boolean}true"`.**
- Trên AEM as a Cloud Service: clientlibs sẽ không load trên publish nếu thiếu
- Trên AEM 6.5: clientlibs load trên author nhưng 404 trên publish qua Dispatcher
- Đây là **hard requirement**, không chỉ là best practice
:::

---

## Load Clientlibs trong HTL

AEM cung cấp một built-in HTL template để load clientlibs. Import trước:

```html
<sly data-sly-use.clientlib="/libs/granite/sightly/templates/clientlib.html"/>
```

### clientlib.all — CSS + JS

```html
<sly data-sly-call="${clientlib.all @ categories='myproject.site'}"/>
```

### clientlib.css — CSS only

```html
<sly data-sly-call="${clientlib.css @ categories='myproject.site'}"/>
```

### clientlib.js — JS only

```html
<sly data-sly-call="${clientlib.js @ categories='myproject.site'}"/>
```

### Load Multiple Categories

```html
<sly data-sly-call="${clientlib.all @ categories=['myproject.dependencies', 'myproject.site']}"/>
```

### Async và Defer Loading

```html
<!-- Defer: thực thi sau khi HTML parse xong, giữ nguyên thứ tự -->
<sly data-sly-call="${clientlib.js @ categories='myproject.site', loading='defer'}"/>

<!-- Async: thực thi ngay khi download xong, không đảm bảo thứ tự -->
<sly data-sly-call="${clientlib.js @ categories='myproject.analytics', loading='async'}"/>
```

### Optimal Placement trong Page Template

CSS vào `<head>` (tránh FOUC), JS cuối `<body>` (không block rendering):

```html
<!DOCTYPE html>
<html>
<head>
    <sly data-sly-use.clientlib="/libs/granite/sightly/templates/clientlib.html"/>
    <sly data-sly-call="${clientlib.css @ categories='myproject.site'}"/>
</head>
<body>
    <div class="page">
        <sly data-sly-resource="${'root' @ resourceType='wcm/foundation/components/responsivegrid'}"/>
    </div>
    <sly data-sly-call="${clientlib.js @ categories='myproject.site', loading='defer'}"/>
</body>
</html>
```

### Conditional Loading (Author only)

```html
<sly data-sly-test="${wcmmode.edit || wcmmode.preview}">
    <sly data-sly-call="${clientlib.all @ categories='myproject.authoring'}"/>
</sly>
```

---

## Minification và Aggregation

AEM's HTML Library Manager xử lý minification và aggregation lúc runtime.

### OSGi Configuration

| Property | Default | Mô tả |
|---|---|---|
| `htmllibmanager.minify` | `true` | Bật minification |
| `htmllibmanager.debug` | `false` | Serve unminified (tương đương `?debugClientLibs=true`) |
| `htmllibmanager.gzip` | `true` | Bật GZip compression |
| `htmllibmanager.maxage` | `604800` | Cache max-age (7 ngày) |
| `htmllibmanager.timing` | `false` | Log build timing |

### Aggregation Behavior

Khi bật minification, AEM concatenate tất cả files trong một category thành một output duy nhất:

```
Debug mode (separate files):
  /etc.clientlibs/myproject/clientlibs/clientlib-site/js/main.js
  /etc.clientlibs/myproject/clientlibs/clientlib-site/js/utils.js

Production (aggregated):
  /etc.clientlibs/myproject/clientlibs/clientlib-site.min.js
```

### Custom Processors

Override minifier mặc định theo từng clientlib:

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"
    cssProcessor="[default:none, min:none]"
    jsProcessor="[default:none, min:none]"/>
```

Setting `none` tắt minification của AEM — hữu ích khi `ui.frontend` build (webpack/Vite) đã produce minified output.

---

## Versioning và Cache Busting

AEM generate versioned URLs với content hash để browser cache aggressively:

```
/etc.clientlibs/myproject/clientlibs/clientlib-site.lc-abc123def456-lc.min.css
                                                        ^^^^^^^^^^^^^^^^
                                                        content hash
```

Khi nội dung clientlib thay đổi, hash thay đổi, browser fetch phiên bản mới. Kết hợp với `max-age` header dài, điều này cho phép instant cache invalidation mà không có stale content.

::: tip AEM 6.5
Trên AEM 6.5 / AMS, cấu hình Dispatcher và CDN cache rules để respect pattern `lc-*-lc` trong URL. Đảm bảo flush agents invalidate clientlib URLs khi deployment xảy ra.
:::

---

## Debugging Clientlibs

### Debug Query Parameter

Thêm `?debugClientLibs=true` vào URL để serve các files riêng lẻ, unminified thay vì bundle:

```
http://localhost:4502/content/my-site/en/home.html?debugClientLibs=true
```

::: warning
Parameter này chỉ hoạt động trên author instance. Không hoạt động trên publish qua Dispatcher.
:::

### Dump Libs Tool

Truy cập để inspect tất cả registered clientlibs:

```
http://localhost:4502/libs/granite/ui/content/dumplibs.html
```

Tool này hiển thị:
- Tất cả categories và clientlib folders của chúng
- Dependencies và embeds cho mỗi category
- **Category collisions** (nhiều folders khai báo cùng category)
- **Broken dependencies** (references tới categories không tồn tại)

### Rebuild Clientlibs

Khi thay đổi không được reflect sau khi modify files trên running instance:

```
http://localhost:4502/libs/granite/ui/content/dumplibs.rebuild.html
```

Click **Invalidate Caches** rồi **Rebuild Libraries** để clear in-memory cache và recompile tất cả libraries.

### Browser DevTools

- **Network tab:** filter theo `clientlib` hoặc `etc.clientlibs` để xem tất cả loaded libraries
- **Source maps:** AEM không generate source maps mặc định. Dùng `ui.frontend` build pipeline (webpack/Vite) để có source maps
- **Console errors:** Missing clientlibs fail silently (không có 404 cho HTML tag). Kiểm tra dump libs tool nếu styles hoặc scripts không load

---

## Preprocessors

### Built-in LESS Compiler

AEM có LESS compiler xử lý `.less` files lúc runtime. Cấu hình qua `cssProcessor`:

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"
    cssProcessor="[default:less, min:gcc;compilationLevel=simple]"/>
```

`css.txt`:
```
#base=css
variables.less
styles.less
```

### SCSS, TypeScript, và Modern Tooling

AEM **không** có built-in support cho SCSS, TypeScript, hoặc PostCSS. Dùng `ui.frontend` module với webpack hoặc Vite build pipeline. Build output là plain CSS/JS mà AEM serve như regular clientlib.

---

## Common Patterns

### Site-wide Clientlib

Global CSS/JS load trên mọi trang qua page template. Chứa base styles, typography, layout grid, và shared JS utilities. Embed component clientlibs để bundle thành một request.

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.site]"
    embed="[myproject.components.header, myproject.components.footer, myproject.components.navigation]"/>
```

### Component-scoped Clientlib

CSS/JS đặt trong component folder, load chỉ khi component được render:

```
components/
└── articlecard/
    └── clientlibs/
        └── clientlib-site/
            ├── .content.xml    ← categories="[myproject.components.articlecard]"
            ├── css.txt
            └── css/
                └── articlecard.css
```

Load trong HTL của component:

```html
<sly data-sly-use.clientlib="/libs/granite/sightly/templates/clientlib.html"/>
<sly data-sly-call="${clientlib.css @ categories='myproject.components.articlecard'}"/>
```

Hoặc embed vào site-wide clientlib để bundle tất cả component styles vào một request.

### Dialog Clientlib

JavaScript chạy trong Touch UI dialog (authoring only). Dùng cho show/hide logic, custom validation, hoặc dynamic field behavior.

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[cq.authoring.dialog]"/>
```

Category `cq.authoring.dialog` được AEM load tự động khi bất kỳ component dialog nào mở. Scope JS của bạn bằng CSS selectors cụ thể cho component.

### Editor Clientlib

JavaScript hook vào page editor (custom layer hoặc toolbar behavior):

```xml
categories="[cq.authoring.editor.hook]"
```

### Theme / Brand Clientlib

Override base styles theo site hoặc brand. Dùng trong multi-tenancy setups nơi nhiều sites share components nhưng khác visual identity.

```xml
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[myproject.theme.brand-a]"
    dependencies="[myproject.site]"/>
```

Load theme clientlib **sau** base site clientlib để CSS overrides có hiệu lực.

---

## Best Practices

- **Luôn set `allowProxy="{Boolean}true"`** — bắt buộc trên mọi môi trường
- **Namespace categories với project prefix** — `myproject.site`, không phải `site`. Tránh collision
- **Giữ categories nhỏ và có mục đích rõ ràng** — một clientlib cho mỗi concern; combine chúng qua `embed` trong parent clientlib
- **Dùng `embed` cho production bundling** — inline component clientlibs vào site clientlib để giảm HTTP requests
- **Dùng `dependencies` cho shared vendor libraries** — cache một lần, reuse across clientlibs
- **Split CSS và JS loading** — CSS trong `<head>`, JS cuối `<body>` với `defer`
- **Disable AEM minification khi dùng `ui.frontend`** — set `cssProcessor` và `jsProcessor` thành `none` nếu webpack/Vite đã minify
- **Test với `?debugClientLibs=true`** — verify individual files load đúng trong development
- **Kiểm tra dump libs tool sau deployments** — detect category collisions hoặc broken dependencies
- **Không đặt sensitive data trong clientlibs** — chúng accessible công khai trên publish. Không API keys, tokens, hay server-side logic
- **Dùng `resources/` cho fonts và images** — được serve qua proxy và được cache headers

---

## Common Pitfalls

### Missing `#base=` Directive

```
# WRONG — AEM tìm main.js trong clientlib root, không phải js/
main.js
utils.js

# CORRECT
#base=js
main.js
utils.js
```

### Typo trong Category Name

Clientlib loading fail silently. Nếu CSS/JS không xuất hiện, kiểm tra:
1. Category name trong `.content.xml` match chính xác với reference trong HTL
2. Không có invisible characters hoặc trailing spaces
3. Dùng dump libs tool để verify category đã được register

### Circular Dependencies

Nếu clientlib A depends on B và B depends on A, AEM rơi vào infinite loop — page sẽ hang hoặc timeout. Phát hiện bằng dump libs tool (báo cáo circular dependency chains).

### Forgetting allowProxy

```
Author:  ✅ /apps/myproject/clientlibs/clientlib-site.css load bình thường
Publish: ❌ 404 — /apps/ bị block bởi Dispatcher
```

### Loading Heavy JS trong `<head>`

```html
<!-- WRONG: block page rendering cho đến khi JS download và execute xong -->
<head>
    <sly data-sly-call="${clientlib.all @ categories='myproject.site'}"/>
</head>

<!-- CORRECT: CSS trong head, JS deferred cuối body -->
<head>
    <sly data-sly-call="${clientlib.css @ categories='myproject.site'}"/>
</head>
<body>
    <!-- page content -->
    <sly data-sly-call="${clientlib.js @ categories='myproject.site', loading='defer'}"/>
</body>
```

### Stale Clientlibs trên Running Instance

Sau khi modify source files qua CRXDE hoặc package install, in-memory cache có thể serve stale content. Dùng rebuild tool để force recompilation, hoặc restart instance.

### Embedded Clientlib Không Update

Khi embed category B vào category A, thay đổi ở files của B cũng yêu cầu A được rebuild. AEM không phải lúc nào cũng detect transitive changes. Dùng rebuild tool sau khi modify embedded libraries.

---

## Tham khảo

- [AEM 6.5 — Using Client-Side Libraries](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/implementing/developing/introduction/clientlibs)
- [HTML Library Manager OSGi Config](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/implementing/deploying/configuring/osgi-configuration-settings)
- [Dump Libs Tool](http://localhost:4502/libs/granite/ui/content/dumplibs.html)
