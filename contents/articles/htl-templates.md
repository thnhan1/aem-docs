# HTL Templates (Sightly)

HTL (HTML Template Language), trước đây gọi là Sightly, là ngôn ngữ template phía server của AEM. Đây là reference implementation của HTL 1.4 specification. HTL bắt buộc tách biệt rõ ràng giữa presentation và business logic: logic nghiệp vụ thuộc về Sling Models hoặc Use-objects, còn template chỉ xử lý việc hiển thị.

> **Tài liệu gốc:** [HTL Specification](https://github.com/adobe/htl-spec/blob/master/SPECIFICATION.md) · [Adobe HTL Docs](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/implementing/developing/components/templates)

---

## Basics

Load một Sling Model hoặc Use-object với `data-sly-use`, sau đó truy cập properties qua expression language `${}`.

```html
<div data-sly-use.model="com.example.core.models.HeroComponent">
    <h1>${model.title}</h1>
    <p>${model.description}</p>
    <span>Published: ${model.publishDate}</span>
</div>
```

---

## Block Elements

HTL cung cấp các `data-sly-*` block elements để kiểm soát rendering. Chúng có thể đặt trên bất kỳ HTML element nào.

### data-sly-use

Khởi tạo một Use-object (Sling Model, POJO, hoặc JS file) và bind nó vào một biến.

```html
<!-- Fully qualified Java class -->
<div data-sly-use.hero="com.example.core.models.HeroComponent">
    ${hero.title}
</div>

<!-- Relative JavaScript Use-object -->
<div data-sly-use.logic="logic.js">
    ${logic.greeting}
</div>

<!-- HTL template file khác -->
<div data-sly-use.tmpl="partials/card.html">
    <!-- tmpl giữ các templates định nghĩa trong card.html -->
</div>
```

Truyền parameters vào Use-objects:

```html
<div data-sly-use.product="${'com.example.core.models.ProductCard' @ sku='ABC-123', locale='en'}">
    <h3>${product.name}</h3>
    <span>${product.formattedPrice}</span>
</div>
```

### data-sly-test

Render element có điều kiện. Element và children bị xóa nếu expression trả về `false`.

```html
<!-- Simple boolean check -->
<div data-sly-test="${model.showBanner}">
    <p>This banner is visible!</p>
</div>

<!-- Lưu kết quả test vào biến để dùng lại -->
<div data-sly-test.hasItems="${model.items.size > 0}">
    <p>We have ${model.items.size} items.</p>
</div>

<!-- Dùng lại biến (negation) -->
<div data-sly-test="${!hasItems}">
    <p>No items found.</p>
</div>
```

### data-sly-list

Iterate qua một collection. Bên trong loop, `item` là element hiện tại và `itemList` cung cấp loop metadata.

```html
<ul data-sly-list="${model.navigationItems}">
    <li class="${itemList.first ? 'first' : ''}${itemList.last ? ' last' : ''}">
        <a href="${item.url}">${item.title}</a>
    </li>
</ul>
```

Đổi tên loop variable:

```html
<ul data-sly-list.page="${model.pages}">
    <li>${pageList.index}: ${page.title} (count: ${pageList.count})</li>
</ul>
```

**Properties của `itemList` / `*List`:**

| Property | Giá trị |
|---|---|
| `index` | 0-based index |
| `count` | 1-based count |
| `first` | `true` cho item đầu |
| `middle` | `true` nếu không phải first/last |
| `last` | `true` cho item cuối |
| `odd` | `true` nếu index lẻ |
| `even` | `true` nếu index chẵn |

### data-sly-repeat

Tương tự `data-sly-list`, nhưng lặp lại **host element** thay vì children của nó.

```html
<!-- Lặp lại <li> cho từng tag -->
<li data-sly-repeat="${model.tags}" class="tag">${item}</li>
<!-- Output:
<li class="tag">Java</li>
<li class="tag">AEM</li>
<li class="tag">HTL</li> -->
```

**So sánh `data-sly-list` vs `data-sly-repeat`:**

```html
<!-- data-sly-list: <ul> render một lần, <li> lặp lại bên trong -->
<ul data-sly-list="${model.colors}">
    <li>${item}</li>
</ul>

<!-- data-sly-repeat: chính <div> được lặp lại -->
<div data-sly-repeat="${model.colors}" class="color-chip">
    ${item}
</div>
```

### data-sly-text

Set text content của host element, thay thế mọi children hiện có. Output được HTML-escaped mặc định.

```html
<p data-sly-text="${model.summary}">Placeholder text bị thay thế lúc render.</p>
```

### data-sly-attribute

Thêm hoặc thay thế attributes trên host element.

```html
<!-- Single attribute -->
<a data-sly-attribute.href="${model.link}" data-sly-attribute.title="${model.linkTitle}">
    Read more
</a>

<!-- Multiple attributes qua Map -->
<div data-sly-attribute="${model.dataAttributes}">Content</div>

<!-- Conditional CSS class -->
<div class="card" data-sly-attribute.class="${model.isActive ? 'card active' : 'card'}">
    ${model.title}
</div>

<!-- Attribute chỉ render khi true -->
<button data-sly-attribute.disabled="${model.isDisabled}">Submit</button>
```

::: tip
Giá trị `false` hoặc empty sẽ **xóa attribute hoàn toàn** khỏi HTML output.
:::

### data-sly-element

Thay thế tag name của host element — hữu ích cho heading levels động.

```html
<h1 data-sly-element="${model.headingLevel}">${model.title}</h1>
<!-- Nếu model.headingLevel = 'h3' → <h3>My Title</h3> -->
```

::: warning
Vì lý do bảo mật, `data-sly-element` chỉ cho phép: `h1–h6`, `section`, `header`, `footer`, `nav`, `aside`, `article`, `main`, `div`, `span`, `p`, `ul`, `ol`, `li`, `small`, `pre`, `blockquote`.
:::

### data-sly-include

Include output của một HTL file khác vào markup hiện tại. File được include **không** có access vào HTL context hiện tại.

```html
<header data-sly-include="partials/header.html"></header>
<main>
    <h1>${model.title}</h1>
</main>
<footer data-sly-include="partials/footer.html"></footer>

<!-- Truyền request attributes -->
<div data-sly-include="${'partials/alert.html' @ requestAttributes=model.alertAttributes}"></div>
```

### data-sly-resource

Include một Sling resource (child component hoặc resource path khác). Đây là cách embed AEM components bên trong components khác.

```html
<!-- Include child resource theo relative path -->
<div data-sly-resource="content/header"></div>

<!-- Force resource type cụ thể -->
<div data-sly-resource="${'content/header' @ resourceType='myproject/components/header'}"></div>

<!-- Include với selectors -->
<div data-sly-resource="${'content/teaser' @ selectors='mobile'}"></div>

<!-- Thêm selectors -->
<div data-sly-resource="${'content/teaser' @ addSelectors='print', selectors='summary'}"></div>

<!-- Truyền Resource object trực tiếp -->
<div data-sly-resource="${model.featuredResource}"></div>
```

### data-sly-template và data-sly-call

Định nghĩa reusable template blocks và gọi chúng với parameters. Templates là "partials" hay "macros" của HTL.

**Định nghĩa template (`partials/card.html`):**

```html
<template data-sly-template.card="${@ title, description, imageUrl}">
    <div class="card">
        <img src="${imageUrl}" alt="${title}"/>
        <h3>${title}</h3>
        <p>${description}</p>
    </div>
</template>

<template data-sly-template.badge="${@ label}">
    <span class="badge">${label}</span>
</template>
```

**Gọi template:**

```html
<sly data-sly-use.tmpl="partials/card.html"/>

<!-- Gọi card template -->
<div data-sly-call="${tmpl.card @ title=model.title, description=model.summary, imageUrl=model.image}"></div>

<!-- Gọi trong loop -->
<div data-sly-list="${model.articles}">
    <sly data-sly-call="${tmpl.card @ title=item.title, description=item.excerpt, imageUrl=item.thumbnail}"/>
</div>
```

### data-sly-unwrap

Xóa host element khỏi output nhưng giữ lại children. Dùng cho wrapper elements chỉ cần thiết để apply block statements.

```html
<!-- <sly> element luôn unwrap, không bao giờ render ra output -->
<sly data-sly-test="${model.showGreeting}">
    <h2>Welcome!</h2>
</sly>

<!-- Unwrap có điều kiện -->
<div data-sly-unwrap="${!model.needsWrapper}">
    <p>Content này có thể có hoặc không có wrapping div.</p>
</div>
```

### data-sly-set

Định nghĩa biến để dùng sau. Available từ HTL 1.4.

```html
<sly data-sly-set.fullName="${model.firstName} ${model.lastName}"/>
<sly data-sly-set.isAdmin="${model.role == 'admin'}"/>

<p>Hello, ${fullName}!</p>
<div data-sly-test="${isAdmin}">
    <a href="/admin">Admin Panel</a>
</div>
```

---

## Expressions

HTL expressions dùng cú pháp `${}`. Hỗ trợ literals, variables, operators, và option modifiers.

### Literals

```html
<p>${'Hello World'}</p>  <!-- String -->
<p>${42}</p>             <!-- Integer -->
<p>${3.14}</p>           <!-- Float -->
<p>${true}</p>           <!-- Boolean -->
<p>${[1, 2, 3]}</p>      <!-- Array -->
```

### Operators

```html
<!-- Logical -->
<p data-sly-test="${model.isActive && model.isVisible}">Active and visible</p>
<p data-sly-test="${model.isAdmin || model.isModerator}">Has elevated role</p>
<p data-sly-test="${!model.isHidden}">Not hidden</p>

<!-- Comparison -->
<p data-sly-test="${model.count > 0}">Has items</p>
<p data-sly-test="${model.status == 'published'}">Published</p>

<!-- Ternary -->
<p>${model.isActive ? 'Active' : 'Inactive'}</p>

<!-- Grouping -->
<p data-sly-test="${(model.isAdmin || model.isModerator) && model.isActive}">
    Active privileged user
</p>
```

### Option Modifiers

Options dùng ký tự `@`, ngăn cách bằng dấu phẩy.

```html
<!-- String join -->
<p>${model.tags @ join=', '}</p>
<!-- Output: "Java, AEM, HTL" -->

<!-- URI manipulation -->
<a href="${model.path @ extension='html'}">Link</a>
<!-- Output: /content/my-page.html -->

<a href="${model.path @ selectors='mobile', extension='html'}">Mobile</a>
<!-- Output: /content/my-page.mobile.html -->

<a href="${model.path @ prependPath='/content/site', extension='html'}">Prepend</a>
<a href="${model.path @ appendPath='jcr:content', extension='json'}">JSON</a>

<!-- Scheme và domain -->
<a href="${model.path @ scheme='https'}">Secure Link</a>
```

---

## Display Context (Escaping)

HTL tự động escape output dựa trên context phát hiện được. Dùng `@ context='...'` để override.

```html
<!-- Default: HTML text escaping -->
<p>${model.title}</p>

<!-- URI context cho href/src -->
<a href="${model.link @ context='uri'}">Click here</a>
<img src="${model.imageUrl @ context='uri'}"/>

<!-- Render raw HTML (cẩn thận — nguy cơ XSS!) -->
<div>${model.richText @ context='html'}</div>

<!-- Attribute context -->
<div title="${model.tooltip @ context='attribute'}">Hover me</div>

<!-- Script context -->
<script>var config = ${model.jsonConfig @ context='scriptString'}</script>

<!-- Style context -->
<div style="${model.inlineStyles @ context='styleString'}">Styled</div>

<!-- Number context -->
<span>${model.count @ context='number'}</span>
```

**Danh sách contexts:**

| Context | Dùng cho |
|---|---|
| `text` | Default — text nodes |
| `html` | Rich text đã được sanitize |
| `attribute` | Giá trị attribute |
| `uri` / `href` / `src` | URLs |
| `scriptString` | Inline JS string values |
| `styleString` | Inline CSS values |
| `number` | Số |
| `jsonString` | JSON trong script |
| `unsafe` | Tắt hoàn toàn XSS (⚠️ nguy hiểm) |

::: danger
**Không bao giờ dùng `context='unsafe'` với user-provided content.** Dùng `context='html'` thay thế — nó lọc các tags nguy hiểm nhưng vẫn cho phép safe markup qua AntiSamy.
:::

### XSS Protection với XSSAPI trong Java

Khi cần sanitize trong Sling Model, inject `XSSAPI` service:

```java
import com.adobe.granite.xss.XSSAPI;

@Model(adaptables = SlingHttpServletRequest.class)
public class SafeTextModel {

    @OSGiService
    private XSSAPI xssAPI;

    @ValueMapValue(optional = true)
    private String richText;

    @ValueMapValue(optional = true)
    private String linkUrl;

    public String getSafeRichText() {
        return richText != null ? xssAPI.filterHTML(richText) : "";
    }

    public String getSafeLink() {
        return linkUrl != null ? xssAPI.getValidHref(linkUrl) : "#";
    }
}
```

```html
<sly data-sly-use.model="com.example.core.models.SafeTextModel">
    <div>${model.safeRichText @ context='html'}</div>
    <a href="${model.safeLink @ context='uri'}">Read more</a>
</sly>
```

**Các XSSAPI methods quan trọng:**

| Method | Mục đích |
|---|---|
| `filterHTML(String)` | Sanitize HTML qua AntiSamy policy |
| `encodeForHTML(String)` | Encode cho `context='text'` |
| `encodeForHTMLAttr(String)` | Encode cho attribute values |
| `encodeForJSString(String)` | Encode cho inline `<script>` |
| `getValidHref(String)` | Validate và sanitize URLs |
| `getValidInteger(String, int)` | Parse integer với fallback |

::: tip Defense in depth
Ngay cả khi Sling Model đã sanitize qua XSSAPI, vẫn apply đúng `@ context` trong HTL. Nếu một layer bị bypass, layer kia vẫn bảo vệ.
:::

### AntiSamy Configuration Overlay

AEM dùng OWASP AntiSamy để lọc HTML với `context='html'`. Config mặc định ở:
- `/libs/cq/xssprotection/config.xml`
- `/libs/sling/xss/config.xml`

**Overlay để customize** (không chỉnh sửa trực tiếp `/libs`):

```
/apps/cq/xssprotection/config.xml
```

Ví dụ cho phép `<iframe>` từ trusted sources:

```xml
<tag name="iframe" action="validate">
    <attribute name="src">
        <regexp-list>
            <regexp value="https://www\.example\.com/.*"/>
            <regexp value="https://www\.youtube\.com/embed/.*"/>
            <regexp value="https://player\.vimeo\.com/video/.*"/>
        </regexp-list>
    </attribute>
    <attribute name="width">
        <regexp-list><regexp value="[0-9]+(%)?"/></regexp-list>
    </attribute>
    <attribute name="height">
        <regexp-list><regexp value="[0-9]+(%)?"/></regexp-list>
    </attribute>
    <attribute name="allowfullscreen">
        <literal-list>
            <literal value="allowfullscreen"/>
            <literal value="true"/>
        </literal-list>
    </attribute>
</tag>
```

::: warning
Phải overlay **toàn bộ** file `config.xml`. AntiSamy loader không hỗ trợ partial overlays.
:::

---

## Internationalisation (i18n)

HTL có built-in support cho translation:

```html
<!-- Simple translation -->
<p>${'Welcome to our site' @ i18n}</p>

<!-- Với locale cụ thể -->
<p>${'Welcome to our site' @ i18n, locale='de'}</p>

<!-- Với hint cho translator -->
<p>${'Save' @ i18n, hint='Button label for saving a form'}</p>

<!-- Với custom resource bundle -->
<p>${'Hello' @ i18n, basename='com.example.i18n.messages'}</p>
```

### Format Strings

Dùng `@ format` cho placeholder replacement:

```html
<p>${'Hello {0}, you have {1} new messages.' @ format=[model.userName, model.messageCount]}</p>
<!-- Output: "Hello Alice, you have 5 new messages." -->

<p>${'Welcome back, {0}!' @ format=model.userName}</p>
<!-- Output: "Welcome back, Alice!" -->

<!-- Plural support (cần ICU4J bundle) -->
<p>${'{0, plural, one{# result} other{# results}}' @ format=model.resultCount}</p>
```

### Format Dates

```html
<!-- Custom date pattern -->
<p>${model.publishDate @ format='yyyy-MM-dd'}</p>
<!-- Output: "2025-03-15" -->

<!-- Predefined patterns -->
<p>${model.publishDate @ format='short'}</p>    <!-- 3/15/25 -->
<p>${model.publishDate @ format='medium'}</p>   <!-- Mar 15, 2025 -->
<p>${model.publishDate @ format='long'}</p>     <!-- March 15, 2025 -->
<p>${model.publishDate @ format='full'}</p>     <!-- Saturday, March 15, 2025 -->

<!-- Với locale -->
<p>${model.publishDate @ format='long', locale='de'}</p>
<!-- Output: "15. März 2025" -->
```

---

## Use-API

HTL hỗ trợ nhiều cách cung cấp business logic qua Use-objects. Sling implementation cung cấp nhiều Use Providers với priority khác nhau.

### Java Use-API (Sling Model)

Cách phổ biến và được khuyến nghị nhất. Sling Models là standard way để cung cấp component logic.

```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = ArticleModel.class,
    resourceType = "myproject/components/article",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class ArticleModel {

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String author;

    @ValueMapValue
    private Calendar publishDate;

    @ValueMapValue
    private String[] tags;

    public String getTitle() { return title; }

    public String getAuthor() {
        return author != null ? author : "Anonymous";
    }

    public List<String> getTags() {
        return tags != null ? Arrays.asList(tags) : Collections.emptyList();
    }
}
```

```html
<article data-sly-use.article="com.example.core.models.ArticleModel">
    <h1>${article.title}</h1>
    <span class="author">By ${article.author}</span>
    <time>${article.publishDate @ format='medium'}</time>
    <ul data-sly-list="${article.tags}">
        <li>${item}</li>
    </ul>
</article>
```

**Truyền parameters vào Sling Model:**

```html
<div data-sly-use.card="${'com.example.core.models.ProductCard' @ colour='red', year=2025}">
    ${card.colour} - ${card.year}
</div>
```

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class ProductCard {
    @Inject
    private String colour;

    @Inject
    private Integer year;
}
```

Parameters truyền qua HTL trở thành request attributes, được inject qua `@Inject`.

### JavaScript Use-API

JavaScript Use-objects được evaluate server-side bởi Rhino engine. Dùng ES5 syntax. Phù hợp cho prototyping nhanh.

```javascript
// logic.js
use(function () {
    'use strict';
    var currentDate = new java.util.Date();
    var title = this.title || 'Default Title';
    return {
        title: title,
        year: currentDate.getYear() + 1900,
        isWeekend: function () {
            var day = new java.util.Date().getDay();
            return day == 0 || day == 6;
        }
    };
});
```

```html
<div data-sly-use.logic="${'logic.js' @ title='My Page'}">
    <h1>${logic.title}</h1>
    <p>Year: ${logic.year}</p>
    <p data-sly-test="${logic.isWeekend}">Enjoy your weekend!</p>
</div>
```

::: warning
- JavaScript Use-objects **chậm hơn** Sling Models và khó test hơn. Ưu tiên Sling Models cho production.
- Dùng loose equality (`==`) thay vì strict equality (`===`) khi so sánh Java objects trong Rhino — `===` không thực hiện type coercion giữa Java và JavaScript types.
:::

### Global Objects

Các global objects sau có sẵn cho mọi Use-objects (Java và JavaScript):

```
currentNode    // javax.jcr.Node
currentSession // javax.jcr.Session
log            // org.slf4j.Logger
properties     // org.apache.sling.api.resource.ValueMap
request        // org.apache.sling.api.SlingHttpServletRequest
resolver       // org.apache.sling.api.resource.ResourceResolver
resource       // org.apache.sling.api.resource.Resource
response       // org.apache.sling.api.SlingHttpServletResponse
sling          // org.apache.sling.api.scripting.SlingScriptHelper
```

---

## Type Conversions

HTL tự động convert Java objects theo các rules:

| Java type | Boolean | String |
|---|---|---|
| `null` | `false` | `""` |
| `Number` | `!= 0` | `toString()` |
| `String` | `!isEmpty()` | As-is |
| `Collection/Array` | `!isEmpty()` | Join với `,` |
| `Enum` | `true` | `name()` |
| `Object` | `true` | `toString()` |

`java.util.Optional` được tự động unwrap trước khi convert.

```html
<!-- Empty string là falsy -->
<p data-sly-test="${model.subtitle}">Has subtitle</p>

<!-- Empty list là falsy -->
<div data-sly-test="${model.items}">
    <p>Items exist</p>
</div>

<!-- Number comparison -->
<p data-sly-test="${model.price > 0}">Price: ${model.price}</p>

<!-- Iterate Map → cho keys -->
<ul data-sly-list="${model.configMap}">
    <li>${item}</li>
</ul>
```

---

## Common Patterns

### Conditional CSS Classes

```html
<div class="card${model.isFeatured ? ' card--featured' : ''}${model.isCompact ? ' card--compact' : ''}">
    <h3>${model.title}</h3>
</div>
```

### Fallback Content

```html
<h1>${model.title || 'Untitled'}</h1>
<img src="${model.imageUrl || '/content/dam/fallback.jpg'}"
     alt="${model.imageAlt || model.title}"/>
```

### Nested Loops với Templates

```html
<!-- partials/nav.html -->
<template data-sly-template.navItem="${@ item, level}">
    <li class="nav-item nav-level-${level}">
        <a href="${item.url}">${item.title}</a>
        <ul data-sly-test="${item.children}" data-sly-list.child="${item.children}">
            <sly data-sly-call="${navItem @ item=child, level=level + 1}"/>
        </ul>
    </li>
</template>
```

```html
<!-- Sử dụng -->
<nav data-sly-use.nav="partials/nav.html">
    <ul data-sly-list.root="${model.rootItems}">
        <sly data-sly-call="${nav.navItem @ item=root, level=0}"/>
    </ul>
</nav>
```

### Edit Placeholder (Author mode)

```html
<div data-sly-use.model="com.example.core.models.TextComponent"
     data-sly-test.hasContent="${model.text}">
    <div class="text-component">
        ${model.text @ context='html'}
    </div>
</div>

<!-- Placeholder cho component rỗng trong author mode -->
<div data-sly-test="${!hasContent && wcmmode.edit}" class="cq-placeholder">
    Click to configure text
</div>
```

### WCM Mode Checks

```html
<sly data-sly-test="${wcmmode.edit || wcmmode.preview}">
    <div class="author-info">
        <p>Component: ${resource.resourceType}</p>
        <p>Path: ${resource.path}</p>
    </div>
</sly>
```

### Iteration với Separator

```html
<p>
    Tags:
    <span data-sly-repeat="${model.tags}">
        ${item}<span data-sly-test="${!itemList.last}">, </span>
    </span>
</p>
<!-- Output: Tags: Java, AEM, HTL -->
```

---

## Best Practices

- **Giữ logic trong Sling Models** — HTL chỉ xử lý presentation. Business logic, string manipulation, data transformation thuộc về Java models.
- **Tránh string concatenation** — Dùng expression options (`@ format`, `@ join`) và URI manipulation thay vì build strings thủ công.
- **Dùng `data-sly-test` có chủ ý** — Lưu kết quả test vào biến khi cần tham chiếu nhiều lần.
- **Ưu tiên `<sly>` cho logic-only blocks** — Element `<sly>` không bao giờ render ra output, lý tưởng cho control flow không cần DOM element.
- **Extract repeated markup thành templates** — Dùng `data-sly-template` / `data-sly-call` cho các markup patterns lặp lại.
- **Luôn dùng đúng display context** — Không bao giờ dùng `context='unsafe'`. Dùng `context='html'` cho rich text, `context='uri'` cho links.
- **Ưu tiên Sling Models hơn JavaScript Use-objects** — Nhanh hơn, dễ test hơn, tích hợp đầy đủ với AEM framework.
- **Dùng `data-sly-resource` cho component composition** — Include child components qua resource path thay vì duplicate markup.

---

## Tham khảo

- [HTL 1.4 Specification](https://github.com/adobe/htl-spec/blob/master/SPECIFICATION.md)
- [Granite XSSAPI Javadoc](https://developer.adobe.com/experience-manager/reference-materials/6-5/javadoc/com/adobe/granite/xss/XSSAPI.html)
- [Sling Models](https://sling.apache.org/documentation/bundles/models.html)
- [AntiSamy Configuration](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/implementing/developing/introduction/security)
