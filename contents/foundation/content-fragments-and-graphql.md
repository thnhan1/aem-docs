---
tags: [project, active, aem, foundation, headless, graphql, content-fragments]
created: 2026-04-26
modified: 2026-04-26
title: Content Fragments & GraphQL (Beginners Guide) — AEM 6.5
aliases: [foundation-content-fragments-and-graphql]
---


## 0) TL;DR

- CF = data trong DAM, không layout
- GraphQL = API auto-generate từ CF Models
- Prod = persisted query (GET) + cache (Dispatcher/CDN)

---

## 1) CF vs Pages

| Item | Pages | Content Fragments |
|---|---|---|
| Layout | template-based | none |
| Output | HTML | JSON/data |
| Authoring | component page editor | CF editor |
| Delivery API | HTL + models / `.model.json` | GraphQL |

---

## 2) Content Fragment Models (schema)

Tools → General → **Content Fragment Models**:

- [ ] chọn `/conf/<site>`
- [ ] Create model (vd `Article`)
- [ ] add fields

Field types (hay dùng):

- text: single/multi line
- number/boolean/date
- enumeration/tags
- references: content ref (asset), fragment ref (CF khác)
- tab placeholder

Model `Article` (mẫu):

- [ ] Title (required)
- [ ] Slug (required)
- [ ] Body (rich text)
- [ ] Excerpt (plain)
- [ ] Featured Image (content ref)
- [ ] Publish Date
- [ ] Featured (boolean default false)
- [ ] Author (fragment ref)
- [ ] Category (enum)
- [ ] Tags

---

## 3) Create Content Fragments (Assets)

Assets → Files → folder (vd `/content/dam/<site>/articles`)

- [ ] Create → Content Fragment
- [ ] chọn model (Article)
- [ ] fill fields

Variations:

- Master
- named variations (Summary/Mobile/…)

---

## 4) GraphQL API (essentials)

Endpoint pattern (hay gặp local SDK):

```text
http://localhost:4502/content/_cq_graphql/<configuration>/endpoint.json
```

Field mapping:

- model field label → GraphQL **camelCase**
- case-sensitive → check schema explorer

---

## 5) Query templates

List:

```graphql
{
  articleList {
    items {
      _path
      title
      slug
      excerpt
      publishDate
      featured
      category
    }
  }
}
```

By path:

```graphql
{
  articleByPath(_path: "/content/dam/<site>/articles/getting-started") {
    item {
      title
      body { html plaintext }
      author { name bio }
    }
  }
}
```

Filter:

```graphql
{
  articleList(
    filter: {
      category: { _expressions: [{ value: "tech", _operator: EQUALS }] }
      featured: { _expressions: [{ value: true, _operator: EQUALS }] }
    }
  ) {
    items { title publishDate }
  }
}
```

Sort/paginate:

```graphql
{
  articleList(sort: "publishDate DESC", limit: 10, offset: 0) {
    items { title publishDate }
  }
}
```

---

## 6) Persisted queries (prod default)

- ad-hoc: dev only
- persisted: server-owned, cacheable (GET)

Execute:

```bash
curl -u admin:admin "http://localhost:4502/graphql/execute.json/<conf>/article-list"
curl "http://localhost:4503/graphql/execute.json/<conf>/article-list"
```

---

## 7) Hardening checklist (headless)

- [ ] Persisted queries only (Publish)
- [ ] Cache: Dispatcher/CDN allow GET persisted query path
- [ ] CORS allowlist
- [ ] Limit/offset everywhere
- [ ] Monitor latency + errors + cache hit ratio

---

## 8) CF on Pages (hybrid)

Content Fragment Core Component:

- chọn fragment
- chọn fields
- chọn variation (optional)

