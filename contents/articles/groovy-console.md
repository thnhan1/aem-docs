# Groovy Console — AEM 6.5 On-Premise

> Package: [orbinson/aem-groovy-console](https://github.com/orbinson/aem-groovy-console)

Groovy Console là công cụ chạy Groovy script trực tiếp trong AEM — thao tác JCR, gọi OSGi service, migration dữ liệu — không cần deploy code package.

URL: `http://localhost:4502/groovyconsole`

---

## 1. Cài Đặt (AEM 6.5)

### Orbinson fork — phiên bản khuyến nghị

Hỗ trợ AEM 6.5.10+, Java 8/11/17/21.

```xml
<!-- root pom.xml -->
<dependency>
    <groupId>be.orbinson.aem</groupId>
    <artifactId>aem-groovy-console-all</artifactId>
    <version>19.0.8</version>
    <type>zip</type>
</dependency>
```

```xml
<!-- all/pom.xml — embeddeds section -->
<embedded>
    <groupId>be.orbinson.aem</groupId>
    <artifactId>aem-groovy-console-all</artifactId>
    <target>/apps/vendor-packages/content/install</target>
</embedded>
```

Hoặc tải `.zip` từ [GitHub releases](https://github.com/orbinson/aem-groovy-console/releases), install qua Package Manager.

### OSGi config — bắt buộc phải cấu hình trước khi dùng

```json
// ui.config/.../osgiconfig/config.author/
// be.orbinson.aem.groovy.console.configuration.impl.DefaultConfigurationService.cfg.json
{
    "allowedGroups": ["administrators"],
    "allowedScheduledJobsGroups": ["administrators"],
    "auditDisabled": false,
    "emailEnabled": false,
    "threadTimeout": 300
}
```

| Property | Mô tả | Default |
|---|---|---|
| `allowedGroups` | Groups được phép chạy script | `[]` (chỉ admin) |
| `allowedScheduledJobsGroups` | Groups được phép schedule job | `[]` |
| `auditDisabled` | Tắt audit log lịch sử chạy | `false` |
| `threadTimeout` | Giây trước khi interrupt script (0 = không timeout) | `0` |
| `distributedExecutionEnabled` | Replicate và chạy script trên tất cả publish agents | `false` |

**Không bao giờ để Groovy Console accessible trên publish production.** Console cho phép chạy code tùy ý với full JCR access. Chỉ deploy trên author và môi trường non-production.

---

## 2. Bindings Có Sẵn

Mỗi script có sẵn các biến sau, không cần import:

| Biến | Type | Mô tả |
|---|---|---|
| `session` | `javax.jcr.Session` | JCR session của current user |
| `resourceResolver` | `ResourceResolver` | Sling resource resolver |
| `pageManager` | `PageManager` | AEM page management API |
| `queryBuilder` | `QueryBuilder` | AEM QueryBuilder API |
| `bundleContext` | `BundleContext` | OSGi bundle context |
| `log` | `Logger` | SLF4J logger (output ra `error.log`) |
| `out` | `PrintWriter` | Ghi output ra console result panel |
| `sling` | `SlingScriptHelper` | Truy cập OSGi service |

### Lấy OSGi service trong script

```groovy
import com.day.cq.replication.Replicator

// Cách 1: qua sling helper
def replicator = sling.getService(Replicator)

// Cách 2: qua bundleContext
def ref = bundleContext.getServiceReference(Replicator.class.name)
def replicator2 = bundleContext.getService(ref)
```

---

## 3. Safety Rules — Bắt Buộc

### DRY_RUN flag

**Luôn luôn** guard mutation sau `DRY_RUN`. Chạy lần đầu với `DRY_RUN = true` để xác nhận đúng node, sau đó mới flip sang `false`.

```groovy
final boolean DRY_RUN = true

// ... logic tìm node ...

if (!DRY_RUN) {
    node.setProperty('myProp', 'newValue')
    mutated++
}

if (!DRY_RUN && mutated > 0) {
    session.save()
}
out.println("Mutated: ${mutated} (DRY_RUN=${DRY_RUN})")
```

### Batch save

`session.save()` sau mỗi node = cực chậm, gây OOM với dataset lớn. Save theo batch:

```groovy
final int BATCH_SIZE = 1000
int changed = 0

// trong loop:
if (!DRY_RUN) {
    node.setProperty('updated', true)
    changed++
    if (changed % BATCH_SIZE == 0) {
        session.save()
        out.println("Saved batch: ${changed}")
    }
}

// save phần còn lại
if (!DRY_RUN && changed % BATCH_SIZE != 0) {
    session.save()
}
```

### Tips thêm

- Test trên local trước, không chạy script chưa test trên shared environment
- Dùng `session.refresh(false)` để discard pending changes nếu có lỗi giữa chừng
- Thêm `sleep(100)` trong tight loops trên instance đang có load cao
- Log progress bằng `out.println()` để monitor script dài
- Set `threadTimeout` trong OSGi config để tự động interrupt script bị treo

---

## 4. Template Cơ Bản — Bulk Operation Với SQL2

Template tái sử dụng cho hầu hết bulk operation: query theo batch, hỗ trợ DRY_RUN, có throttle.

```groovy
import javax.jcr.Node
import javax.jcr.Session
import javax.jcr.query.Query
import javax.jcr.query.QueryManager
import javax.jcr.query.QueryResult
import javax.jcr.query.RowIterator

// ---- Config ----
final String BASE_PATH      = '/content/mysite'
final String NODE_TYPE      = 'cq:Page'
final int    BATCH_SIZE     = 500
final long   THROTTLE_MS    = 0L      // tăng lên 100-250 nếu instance đang load
final boolean DRY_RUN       = true

// ---- Helper ----
static String safeTitle(Session s, String path) {
    try {
        String cp = path + '/jcr:content'
        if (s.nodeExists(cp)) {
            Node c = s.getNode(cp)
            return c.hasProperty('jcr:title') ? c.getProperty('jcr:title').string : ''
        }
    } catch (Throwable ignored) {}
    return ''
}

// ---- Main ----
Session s = session
QueryManager qm = s.workspace.queryManager

String sql = """
    SELECT p.[jcr:path]
    FROM   [${NODE_TYPE}] AS p
    WHERE  ISDESCENDANTNODE(p, '${BASE_PATH}')
    ORDER  BY p.[jcr:path]
""".stripIndent().trim()

int offset  = 0
int scanned = 0
int mutated = 0

while (true) {
    Query q = qm.createQuery(sql, Query.JCR_SQL2)
    q.setLimit(BATCH_SIZE)
    q.setOffset(offset)

    QueryResult result = q.execute()
    RowIterator rows   = result.rows
    int returned       = 0

    while (rows.hasNext()) {
        def row = rows.nextRow()
        returned++
        scanned++

        String path  = row.getPath('p')
        Node   node  = s.getNode(path)
        String title = safeTitle(s, path)

        out.println("Found: ${path}${title ? " | '${title}'" : ''}")

        if (!DRY_RUN) {
            // --- thay bằng logic thực tế ---
            node.setProperty('demo:lastScanned',
                java.time.Instant.now().toString())
            mutated++

            if (mutated % BATCH_SIZE == 0) {
                s.save()
                out.println("Saved batch at ${mutated}")
            }
        }
    }

    out.println("Scanned: ${scanned} | batch: ${returned} | offset: ${offset}")
    if (returned < BATCH_SIZE) break

    offset += returned
    if (THROTTLE_MS > 0) sleep THROTTLE_MS
}

if (!DRY_RUN && mutated % BATCH_SIZE != 0) s.save()

out.println('---')
out.println("Base: ${BASE_PATH} | Type: ${NODE_TYPE}")
out.println("Scanned: ${scanned} | Mutated: ${mutated} | DRY_RUN: ${DRY_RUN}")
return scanned
```

---

## 5. Script Examples

### Bulk update property theo template

```groovy
final String BASE_PATH = '/content/mysite'
final String TEMPLATE  = '/conf/mysite/settings/wcm/templates/article-page'
final boolean DRY_RUN  = true

int count = 0

getPage(BASE_PATH).recurse { page ->
    if (page.properties['cq:template'] == TEMPLATE) {
        def content = page.node
        out.println("${page.path} | hideInNav=${content.get('hideInNav')}")
        if (!DRY_RUN) {
            content.set('hideInNav', true)
            count++
        }
    }
}

if (!DRY_RUN) session.save()
out.println("Updated ${count} pages (DRY_RUN=${DRY_RUN})")
```

### Find & replace text trong property

```groovy
final String BASE_PATH = '/content/mysite'
final String PROPERTY  = 'jcr:title'
final String SEARCH    = 'Old Brand Name'
final String REPLACE   = 'New Brand Name'
final boolean DRY_RUN  = true

int count = 0

getPage(BASE_PATH).recurse { page ->
    def content = page.node
    String val  = content.get(PROPERTY)
    if (val?.contains(SEARCH)) {
        String updated = val.replace(SEARCH, REPLACE)
        out.println("${page.path}: '${val}' -> '${updated}'")
        if (!DRY_RUN) {
            content.set(PROPERTY, updated)
            count++
        }
    }
}

if (!DRY_RUN) session.save()
out.println("Replaced in ${count} pages (DRY_RUN=${DRY_RUN})")
```

### Tìm pages theo template

```groovy
final String BASE_PATH = '/content/mysite'
final String TEMPLATE  = '/conf/mysite/settings/wcm/templates/homepage'
int count = 0

getPage(BASE_PATH).recurse { page ->
    if (page.properties['cq:template'] == TEMPLATE) {
        out.println("${page.path} | ${page.properties['jcr:title'] ?: 'n/a'}")
        count++
    }
}

out.println("---")
out.println("Found ${count} pages with template: ${TEMPLATE}")
return count
```

### Tìm orphaned components (resourceType không tồn tại)

```groovy
final String BASE_PATH = '/content/mysite'
int orphanCount = 0

getPage(BASE_PATH).recurse { page ->
    page.node?.recurse { node ->
        String rt = node.get('sling:resourceType')
        if (rt
            && !resourceResolver.getResource('/apps/' + rt)
            && !resourceResolver.getResource('/libs/' + rt)) {
            out.println("ORPHAN: ${node.path} | resourceType: ${rt}")
            orphanCount++
        }
    }
}

out.println("---")
out.println("Found ${orphanCount} orphaned components")
return orphanCount
```

### Activate / Deactivate pages

```groovy
import com.day.cq.replication.ReplicationActionType
import com.day.cq.replication.Replicator

final String BASE_PATH = '/content/mysite/en/news'
final boolean DRY_RUN  = true

def replicator = sling.getService(Replicator)
int count = 0

getPage(BASE_PATH).recurse { page ->
    if (page.properties['hideInNav'] == 'true') {
        out.println("Deactivate: ${page.path}")
        if (!DRY_RUN) {
            replicator.replicate(session, ReplicationActionType.DEACTIVATE, page.path)
            count++
        }
    }
}

out.println("Deactivated ${count} pages (DRY_RUN=${DRY_RUN})")
```

### DAM: tìm assets theo MIME type

```groovy
import javax.jcr.query.Query

final String BASE_PATH = '/content/dam/mysite'
final String MIME_TYPE = 'application/pdf'

String sql = """
    SELECT a.[jcr:path]
    FROM   [dam:Asset] AS a
    INNER JOIN [nt:resource] AS r ON ISDESCENDANTNODE(r, a)
    WHERE  ISDESCENDANTNODE(a, '${BASE_PATH}')
      AND  r.[jcr:mimeType] = '${MIME_TYPE}'
    ORDER  BY a.[jcr:path]
"""

def result = session.workspace.queryManager
    .createQuery(sql, Query.JCR_SQL2)
    .execute()

int count = 0
result.rows.each { row ->
    out.println(row.getPath('a'))
    count++
}

out.println("---")
out.println("Found ${count} assets of type: ${MIME_TYPE}")
return count
```

### DAM: update metadata hàng loạt

```groovy
final String BASE_PATH = '/content/dam/mysite'
final String PROPERTY  = 'dc:rights'
final String NEW_VALUE = '© 2026 My Company. All rights reserved.'
final boolean DRY_RUN  = true

int count = 0

resourceResolver.getResource(BASE_PATH).listChildren().each { child ->
    def meta = child.getChild('jcr:content/metadata')
    if (meta == null) return

    def node = meta.adaptTo(javax.jcr.Node)
    String current = node.hasProperty(PROPERTY)
        ? node.getProperty(PROPERTY).string
        : 'not set'

    out.println("${child.path} | ${PROPERTY}: ${current}")

    if (!DRY_RUN) {
        node.setProperty(PROPERTY, NEW_VALUE)
        count++
    }
}

if (!DRY_RUN) session.save()
out.println("Updated ${count} assets (DRY_RUN=${DRY_RUN})")
```

### Xóa nodes theo pattern (collect trước, xóa sau)

```groovy
final String BASE_PATH       = '/content/mysite'
final String NODE_NAME       = 'cq:LiveSyncConfig'
final boolean DRY_RUN        = true

// Collect trước để tránh ConcurrentModificationException
List<String> toDelete = []

session.getNode(BASE_PATH).recurse { node ->
    if (node.name == NODE_NAME) {
        toDelete.add(node.path)
    }
}

int count = 0
toDelete.each { path ->
    out.println("Delete: ${path}")
    if (!DRY_RUN) {
        session.getNode(path).remove()
        count++
    }
}

if (!DRY_RUN) session.save()
out.println("Deleted ${count} nodes (DRY_RUN=${DRY_RUN})")
```

### Tạo pages programmatically

```groovy
final String PARENT_PATH = '/content/mysite/en'
final String TEMPLATE    = '/conf/mysite/settings/wcm/templates/content-page'
final boolean DRY_RUN    = true

def pages = [
    [name: 'about-us', title: 'About Us'],
    [name: 'contact',  title: 'Contact'],
    [name: 'privacy',  title: 'Privacy Policy'],
]

int count = 0
pages.each { p ->
    String fullPath = "${PARENT_PATH}/${p.name}"
    if (session.nodeExists(fullPath)) {
        out.println("SKIP (exists): ${fullPath}")
    } else {
        out.println("CREATE: ${fullPath} | title: ${p.title}")
        if (!DRY_RUN) {
            pageManager.create(PARENT_PATH, p.name, TEMPLATE, p.title)
            count++
        }
    }
}

if (!DRY_RUN) session.save()
out.println("Created ${count} pages (DRY_RUN=${DRY_RUN})")
```

### SQL2 join — tìm pages có child node cụ thể

```groovy
// Tìm pages có rep:cugPolicy với principalNames được set
import javax.jcr.query.Query

final String BASE_PATH = '/content/mysite'

String sql = """
    SELECT p.[jcr:path]
    FROM   [cq:Page] AS p
    INNER JOIN [nt:base] AS c ON ISCHILDNODE(c, p)
    WHERE  ISDESCENDANTNODE(p, '${BASE_PATH}')
      AND  NAME(c) = 'rep:cugPolicy'
      AND  c.[rep:principalNames] IS NOT NULL
    ORDER  BY p.[jcr:path]
"""

// Luôn qualify column bằng selector alias khi dùng nhiều selector
def result = session.workspace.queryManager
    .createQuery(sql, Query.JCR_SQL2)
    .execute()

int count = 0
result.rows.each { row ->
    out.println(row.getPath('p'))
    count++
}
out.println("Found ${count} CUG-protected pages")
return count
```

### QueryBuilder trong Groovy

```groovy
import com.day.cq.search.PredicateGroup

def params = [
    'path'           : '/content/mysite',
    'type'           : 'cq:Page',
    'property'       : 'jcr:content/cq:template',
    'property.value' : '/conf/mysite/settings/wcm/templates/article-page',
    'p.guessTotal'   : 'true',
    'p.limit'        : '100',
    'orderby'        : 'path'
]

def query  = queryBuilder.createQuery(PredicateGroup.create(params), session)
def result = query.result

out.println("Total matches: ${result.totalMatches}")
result.hits.each { hit ->
    out.println("${hit.path} | ${hit.properties['jcr:content/jcr:title'] ?: 'n/a'}")
}

return result.totalMatches
```

Không dùng `p.limit=-1` trong QueryBuilder trừ khi biết chắc result set nhỏ.

### Liệt kê OSGi configurations

```groovy
import org.osgi.service.cm.ConfigurationAdmin

def configAdmin = sling.getService(ConfigurationAdmin)
def configs     = configAdmin.listConfigurations(null)

configs?.sort { it.pid }.each { config ->
    out.println(config.pid)
}

out.println("---")
out.println("Total: ${configs?.size() ?: 0}")
```

---

## 6. Schedule và Remote Execution

### Schedule script qua UI

1. Lưu script trong console (stored tại `/conf/groovyconsole/scripts`)
2. Mở tab **Scheduler**
3. Chọn script, set Cron expression hoặc chạy ngay (async)

### Remote execution qua curl — dùng trong CI/CD

```bash
# Chạy một script đã lưu
curl -d "scriptPath=/conf/groovyconsole/scripts/samples/JcrSearch.groovy" \
     -X POST -u admin:admin \
     http://localhost:4502/bin/groovyconsole/post.json

# Chạy nhiều scripts tuần tự
curl -d "scriptPaths=/conf/groovyconsole/scripts/cleanup.groovy&scriptPaths=/conf/groovyconsole/scripts/reindex.groovy" \
     -X POST -u admin:admin \
     http://localhost:4502/bin/groovyconsole/post.json
```

Bảo vệ `/bin/groovyconsole/*` trong Dispatcher config, chỉ cho phép từ IP nội bộ hoặc yêu cầu authentication.

---

## 7. Custom Binding Extension

Thêm biến tùy chỉnh vào tất cả script (helper project-specific, config values...):

```java
package com.myproject.core.groovy;

import be.orbinson.aem.groovy.console.api.BindingExtensionProvider;
import be.orbinson.aem.groovy.console.api.BindingVariable;
import org.osgi.service.component.annotations.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component(service = BindingExtensionProvider.class, immediate = true)
public class ProjectBindingProvider implements BindingExtensionProvider {

    @Override
    public Map<String, BindingVariable> getBindingVariables() {
        Map<String, BindingVariable> vars = new LinkedHashMap<>();
        vars.put("projectName",
            new BindingVariable("myproject", String.class));
        vars.put("damRoot",
            new BindingVariable("/content/dam/myproject", String.class));
        return vars;
    }
}
```

Sau khi deploy, mọi script có thể dùng `projectName` và `damRoot` trực tiếp.

---

## 8. Dispatcher Config (nếu cần expose qua Dispatcher)

Chỉ áp dụng cho author instance nội bộ có Dispatcher phía trước:

```
# dispatcher.any — filter section

# Groovy Console UI
/gc01 { /type "allow" /url "/groovyconsole" }
/gc02 { /type "allow" /url "/apps/groovyconsole.html" }

# Servlet endpoint (cần auth + IP restriction bổ sung)
/gc03 { /type "allow" /path "/bin/groovyconsole/*" }
```

---

## Tham Khảo

- [orbinson/aem-groovy-console](https://github.com/orbinson/aem-groovy-console) — GitHub
- [Sample scripts](https://github.com/orbinson/aem-groovy-console/tree/main/ui.content/src/main/content/jcr_root/conf/groovyconsole/scripts/samples)
