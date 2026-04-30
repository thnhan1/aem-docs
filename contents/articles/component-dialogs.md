# Touch UI Component Dialogs

Mỗi mục bên dưới là một Coral XML snippet có thể copy trực tiếp vào file `_cq_dialog/.content.xml` của component.

> **Tài liệu tham khảo chính:** [Granite UI API — AEM 6.5](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/server.html)

---

## TL;DR

- Bắt đầu từ **empty dialog template** rồi mở rộng dần.
- Dùng `fieldLabel` + `fieldDescription` nhất quán để hướng dẫn author.
- Ưu tiên composite multifield và `@ChildResource` cho structured data.
- Giữ validation tối thiểu — handle missing values trong Sling Model.

---

## Best Practices

1. Nếu có thể, kế thừa (extend) một core component có sẵn.
2. Đánh version component: `<component>/<version>/<component>`.
3. Phân chia fields vào tabs khi hợp lý.
4. Không lạm dụng multifield.
5. Dùng ít fields nhất có thể, nhưng đủ để thực hiện yêu cầu.
6. Dùng Granite Alerts cho hints/notes quan trọng.
7. Dùng Granite Wells để group fields theo visual.
8. Thêm file `README.md` vào component để hỗ trợ author.
9. Thêm clientLib trực tiếp vào component folder nếu cần.
10. Đừng over-validate — xử lý missing field gracefully trong model.

## Common Pitfalls

- **Thiếu `./` prefix trong `name`** — giá trị sẽ không được persist xuống JCR.
- **Quên `fieldLabel`** — dialog khó scan và thiếu thân thiện.
- **Lạm dụng multifield** thay vì tách thành component riêng.
- **Áp clientlib globally** thay vì scoped theo dialog category.

---

## Empty Dialog — Starting Point

Cấu trúc dialog rỗng với 2 tabs. Thêm fields vào `<!-- Place your components / dialog fields here -->`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="MyTestComponent"
    sling:resourceType="cq/gui/components/authoring/dialog"
    helpPath="https://url-to-your-documentation.com">
  <content
      granite:class="cmp-mytestcmp__editor"
      jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/container">
    <items jcr:primaryType="nt:unstructured">
      <tabs
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/tabs"
          maximized="{Boolean}true">
        <items jcr:primaryType="nt:unstructured">
          <properties
              jcr:primaryType="nt:unstructured"
              jcr:title="Properties"
              sling:resourceType="granite/ui/components/coral/foundation/container"
              margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
              <columns
                  jcr:primaryType="nt:unstructured"
                  sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                  margin="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                  <column
                      jcr:primaryType="nt:unstructured"
                      sling:resourceType="granite/ui/components/coral/foundation/container">
                    <items jcr:primaryType="nt:unstructured">
                      <!-- Place your components / dialog fields here -->
                    </items>
                  </column>
                </items>
              </columns>
            </items>
          </properties>
          <layout
              jcr:primaryType="nt:unstructured"
              jcr:title="Layout"
              sling:resourceType="granite/ui/components/coral/foundation/container"
              margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
              <columns
                  jcr:primaryType="nt:unstructured"
                  sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                  margin="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                  <column
                      jcr:primaryType="nt:unstructured"
                      sling:resourceType="granite/ui/components/coral/foundation/container">
                    <items jcr:primaryType="nt:unstructured">
                      <!-- Place your components / dialog fields here -->
                    </items>
                  </column>
                </items>
              </columns>
            </items>
          </layout>
        </items>
      </tabs>
    </items>
  </content>
</jcr:root>
```

---

## Simple Data Fields

### Textfield

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/textfield/index.html)

```xml
<textfield
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldDescription="The button label"
    fieldLabel="Button Label"
    name="./label"/>
```

![Textfield trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/textfield.png)

### Textarea

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/textarea/index.html)

```xml
<textarea
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
    fieldLabel="This is a text area"
    emptyText="Please add your descriptive text"
    name="./textareacontent"/>
```

![Textarea trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/textarea.png)

### Hidden

```xml
<hidden
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/hidden"
    name="./source"
    value="author-ui"/>
```

### Numberfield

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/numberfield/index.html)

Có thể định nghĩa `min`, `max`, và `step`.

```xml
<numberfield
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
    fieldLabel="Choose a number value"
    name="./numbervalue"
    min="{Long}1"
    max="{Long}10"
    step="{Double}1"/>
```

![Numberfield trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/numberfield.png)

### Pathfield

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/pathfield/index.html)

```xml
<pathfield
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Select path"
    rootpath="/content"
    name="./path"/>
```

![Pathfield trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/pathfield.png)

**Pathfield chọn asset từ DAM:**

```xml
<pathfield
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Select asset"
    forceSelection="{Boolean}true"
    rootPath="/content/dam"
    pickerSrc="/mnt/overlay/granite/ui/content/coral/foundation/form/pathfield/picker.html"
    name="./assetPath"/>
```

::: tip
Coral 3 components có path `/components/coral/foundation`. Coral 2 (cũ) dùng `/components/foundation`. Nhận biết qua đường dẫn `sling:resourceType`.
:::

### Asset Upload

```xml
<file
    jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
    class="cq-droptarget"
    fileNameParameter="./fileName"
    fileReferenceParameter="./fileReference"
    mimeTypes="[image/gif,image/jpeg,image/png,image/tiff,image/svg+xml]"
    name="./file"/>
```

![Asset Upload trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/assetupload.png)

### Checkbox

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/checkbox/index.html)

```xml
<checkbox
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    checked="true"
    name="./altValueFromPageImage"
    text="Inherit alternative text from page"
    uncheckedValue="false"
    value="{Boolean}true"/>
```

![Checkbox trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/checkbox.png)

### Checkbox Group

```xml
<checkboxGroup
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkboxgroup"
    fieldLabel="Options"
    name="./options">
  <items jcr:primaryType="nt:unstructured">
    <optA text="Option A" value="a" jcr:primaryType="nt:unstructured"/>
    <optB text="Option B" value="b" jcr:primaryType="nt:unstructured"/>
  </items>
</checkboxGroup>
```

### Switch

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/switch/index.html)

```xml
<switch
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/switch"
    fieldLabel="Enable feature"
    onText="On"
    offText="Off"
    name="./featureEnabled"
    uncheckedValue="false"
    value="{Boolean}true"/>
```

![Switch trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/switch.png)

### Datepicker

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/datepicker/index.html)

```xml
<datepicker
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/datepicker"
    displayedFormat="MM-DD-YYYY HH:mm"
    fieldLabel="Publish date"
    name="./datepicker"
    type="datetime"
    typeHint="Date"/>
```

Với constraints min/max:

```xml
<datepicker
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/datepicker"
    fieldLabel="Publish date"
    minDate="2024-01-01"
    maxDate="2030-12-31"
    displayedFormat="YYYY-MM-DD"
    name="./publishDate"/>
```

![Datepicker trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/datepicker.png)

### Colorfield

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/colorfield/index.html)

```xml
<colorpicker
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/colorfield"
    fieldLabel="Brand Color"
    name="./brandColor"
    showDefaultColors="{Boolean}true"
    showProperties="{Boolean}true"
    showSwatches="{Boolean}true"/>
```

Giới hạn palette cố định:

```xml
<colorpicker
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/colorfield"
    fieldLabel="Theme Color"
    name="./themeColor"
    showProperties="{Boolean}false"
    showSwatches="{Boolean}true"
    showDefaultColors="{Boolean}false">
  <items jcr:primaryType="nt:unstructured">
    <primary jcr:primaryType="nt:unstructured" value="#0055FF"/>
    <secondary jcr:primaryType="nt:unstructured" value="#FF6600"/>
    <dark jcr:primaryType="nt:unstructured" value="#333333"/>
  </items>
</colorpicker>
```

### Password

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/password/index.html)

```xml
<password
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/password"
    fieldLabel="API Key"
    fieldDescription="Stored as plain text in the JCR -- consider using OSGi configs for secrets"
    name="./apiKey"/>
```

::: danger
Password trong dialog được lưu dưới dạng **plain text trong JCR**. Với secrets thực sự, dùng OSGi secret configurations hoặc context-aware configurations.
:::

### Button Group

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/buttongroup/index.html)

Visual toggle group, hữu ích cho alignment hoặc variant selection. `selectionMode`: `single`, `multiple`, hoặc `none`.

```xml
<alignment
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/buttongroup"
    fieldLabel="Text Alignment"
    selectionMode="single"
    name="./alignment">
  <items jcr:primaryType="nt:unstructured">
    <left  jcr:primaryType="nt:unstructured" text="Left"   value="left"   icon="textLeft"/>
    <center jcr:primaryType="nt:unstructured" text="Center" value="center" icon="textCenter" checked="{Boolean}true"/>
    <right  jcr:primaryType="nt:unstructured" text="Right"  value="right"  icon="textRight"/>
  </items>
</alignment>
```

### Userpicker

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/userpicker/index.html)

```xml
<userpicker
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/userpicker"
    fieldLabel="User Picker"
    hideServiceUsers="{Boolean}true"
    impersonatesOnly="{Boolean}false"
    name="./user"/>
```

![Userpicker trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/userpicker.png)

---

## Complex Data Fields

### Show/Hide — Native (`cq-dialog-dropdown-showhide`)

Trước khi viết custom JS, dùng script có sẵn của AEM. Đăng ký category `cq.authoring.dialog` và một `select`/`checkbox` với class đặc biệt có thể toggle bất kỳ element nào có matching target class và `showhidetargetvalue`.

```xml
<!-- Source: select dropdown -->
<linkType
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Link Type"
    name="./linkType"
    granite:class="cq-dialog-dropdown-showhide">
  <granite:data jcr:primaryType="nt:unstructured"
      cq-dialog-dropdown-showhide-target=".cmp-link-type-target"/>
  <items jcr:primaryType="nt:unstructured">
    <internal jcr:primaryType="nt:unstructured" text="Internal" value="internal"/>
    <external jcr:primaryType="nt:unstructured" text="External" value="external"/>
    <email    jcr:primaryType="nt:unstructured" text="Email"    value="email"/>
  </items>
</linkType>

<!-- Target: chỉ hiện khi chọn "internal" -->
<internalPath
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Internal Path"
    name="./internalPath"
    rootPath="/content"
    granite:class="cmp-link-type-target hide">
  <granite:data jcr:primaryType="nt:unstructured" showhidetargetvalue="internal"/>
</internalPath>

<!-- Target: chỉ hiện khi chọn "external" -->
<externalUrl
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="External URL"
    name="./externalUrl"
    granite:class="cmp-link-type-target hide">
  <granite:data jcr:primaryType="nt:unstructured" showhidetargetvalue="external"/>
</externalUrl>
```

**Cách hoạt động:**
1. Select fires `change` event → script đọc `cq-dialog-dropdown-showhide-target`
2. Query tất cả elements khớp selector (`.cmp-link-type-target`)
3. So sánh `showhidetargetvalue` với giá trị select hiện tại
4. Matching targets: xóa `.hide`; còn lại: thêm `.hide`

### Show/Hide — Render Condition (Server-side)

Dùng khi cần kiểm soát phía server (ví dụ: permissions, site-level logic).

```xml
<advancedSettings
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/container">
  <granite:rendercondition
      jcr:primaryType="nt:unstructured"
      sling:resourceType="com.myproject/renderconditions/isAdmin"/>
  <items jcr:primaryType="nt:unstructured">
    <!-- advanced fields chỉ hiện với Admin -->
  </items>
</advancedSettings>
```

### Select Dropdown

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/select/index.html)

```xml
<select
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="List Item"
    name="./selectItem">
  <items jcr:primaryType="nt:unstructured">
    <children jcr:primaryType="nt:unstructured" text="Child pages" value="children"/>
    <static   jcr:primaryType="nt:unstructured" text="Fixed list"  value="static"/>
    <search   jcr:primaryType="nt:unstructured" text="Search"      value="search"/>
    <tags     jcr:primaryType="nt:unstructured" text="Tags"        value="tags"/>
  </items>
</select>
```

**Closed:**
![Select Closed](https://lucanerlich.com/images/aem/dialogfields/selectclosed.png)

**Open:**
![Select Open](https://lucanerlich.com/images/aem/dialogfields/selectopen.png)

**Select với Datasource (dynamic values):**

```xml
<categorySelect
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Category"
    name="./category">
  <datasource
      jcr:primaryType="nt:unstructured"
      sling:resourceType="/apps/myproject/datasource/categories"/>
  <items jcr:primaryType="nt:unstructured"/>
</categorySelect>
```

### Radio Group

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/radiogroup/index.html)

```xml
<radio
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/radiogroup"
    name="./radioselection"
    vertical="{Boolean}true"
    fieldLabel="Radio Select">
  <items jcr:primaryType="nt:unstructured">
    <vara jcr:primaryType="nt:unstructured" text="Variation A" value="var-a"/>
    <varb jcr:primaryType="nt:unstructured" text="Variation B" value="var-b"/>
  </items>
</radio>
```

![Radio Select trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/radio.png)

### Multifield

Cho phép author tạo n bộ fields lặp lại. Data lưu vào subnodes. Dùng `@ChildResource` trong Sling Model.

Thêm `composite="{Boolean}true"` để lưu entries như child node — inject dễ dàng qua `@ChildResource`. Nếu không, tất cả values lưu dưới dạng Array Properties trên node.

```xml
<myMultifield
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    composite="{Boolean}true"
    required="{Boolean}true">
  <field
      jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/container"
      name="./values">
    <items jcr:primaryType="nt:unstructured">
      <textvalue
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="Text Value"
          name="./textvalue"/>
      <numbervalue
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
          fieldLabel="Number Value"
          name="./numbervalue"/>
    </items>
  </field>
</myMultifield>
```

**Multifield với min/max validation:**

```xml
<links
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    composite="{Boolean}true">
  <granite:data jcr:primaryType="nt:unstructured" min-items="1" max-items="5"/>
  <field
      jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/container"
      name="./links">
    <items jcr:primaryType="nt:unstructured">
      <textvalue
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="Link Text"
          name="./text"/>
    </items>
  </field>
</links>
```

![Multifield trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/multifield.png)

### FieldSet (Grouped Fields)

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/form/fieldset/index.html)

FieldSet group các fields liên quan dưới một legend, và prefix property name của mỗi nested field — values được lưu vào subnode. Cách sạch nhất để persist "một logical sub-object" (ví dụ: social links, SEO metadata) mà không cần multifield.

```xml
<social
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/fieldset"
    jcr:title="Social Links"
    name="./social">
  <items jcr:primaryType="nt:unstructured">
    <twitter
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
        fieldLabel="Twitter / X"
        name="./twitter"/>
    <linkedin
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
        fieldLabel="LinkedIn"
        name="./linkedin"/>
  </items>
</social>
```

Dữ liệu được persist như sau:

```text
myComponent
└─ social/
   ├─ twitter = "..."
   └─ linkedin = "..."
```

Đọc trong Sling Model với `@ChildResource`:

```java
@ChildResource
private Resource social;

public String getTwitter() {
    return social != null ? social.getValueMap().get("twitter", String.class) : null;
}
```

::: tip Fieldset vs Well vs Multifield
- **Well** — visual grouping only. Không name prefix, không subnode.
- **Fieldset** — visual grouping + persist vào subnode (`name="./social"`).
- **Multifield** — chỉ dùng khi author cần thêm n items lặp lại. Fieldset là lựa chọn đúng cho nhóm fields cố định.
:::

### Accordion

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/accordion/index.html)

Thêm `parentConfig` với `active` để accordion mở mặc định. Bất kỳ dialog field nào cũng có thể được thêm vào `items` của mỗi accordion item.

```xml
<accordion
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/accordion"
    variant="default">
  <items jcr:primaryType="nt:unstructured">
    <block1
        jcr:primaryType="nt:unstructured"
        jcr:title="Some Category"
        sling:resourceType="granite/ui/components/coral/foundation/container"
        maximized="{Boolean}true">
      <items jcr:primaryType="nt:unstructured">
        <textvalue1
            jcr:primaryType="nt:unstructured"
            sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
            fieldLabel="Text Value"
            name="./textvalue"/>
      </items>
      <parentConfig jcr:primaryType="nt:unstructured" active="{Boolean}true"/>
    </block1>
    <block2
        jcr:primaryType="nt:unstructured"
        jcr:title="Another Category"
        sling:resourceType="granite/ui/components/coral/foundation/container"
        maximized="{Boolean}true">
      <items jcr:primaryType="nt:unstructured">
        <numbervalue
            jcr:primaryType="nt:unstructured"
            sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
            fieldLabel="Number Value"
            name="./numbervalue"/>
      </items>
    </block2>
  </items>
</accordion>
```

![Accordion trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/accordion.png)

### Tags Field

```xml
<tags
    jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/coral/common/form/tagfield"
    fieldLabel="Tags"
    name="./cq:tags"
    multiple="{Boolean}true"
    rootPath="/content/cq:tags/myproject"/>
```

- `name="./cq:tags"` là tên property quy ước — Sling và AEM search đã hiểu nó.
- `rootPath` giới hạn picker về một nhánh taxonomy cụ thể.
- `multiple="{Boolean}true"` persist `String[]` — recommended ngay cả với single tag.

Đọc tags trong Sling Model — **dùng `TagManager`**, không concatenate paths thủ công:

```java
@ValueMapValue(name = "cq:tags")
private String[] tagIds;

public List<Tag> getTags() {
    if (tagIds == null || tagIds.length == 0) return Collections.emptyList();
    TagManager tagManager = request.getResourceResolver().adaptTo(TagManager.class);
    return Arrays.stream(tagIds)
        .map(tagManager::resolve)
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
}
```

---

## Validation

Hầu hết dialogs chỉ cần declarative attributes. Với custom validators phức tạp hơn, xem [Dialog Validation](https://lucanerlich.com/aem/components/dialog-validation/).

### Quick Reference — Declarative Attributes

```xml
<!-- Required + maxlength -->
<title
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Title"
    name="./title"
    required="{Boolean}true"
    maxlength="{Long}80"/>

<!-- Number range -->
<price
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
    fieldLabel="Price"
    name="./price"
    min="{Double}0.01"
    max="{Double}99999.99"
    step="{Double}0.01"/>

<!-- JCR node name validation -->
<nodeName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Node name"
    name="./name"
    validation="foundation.jcr.name"/>
```

---

## Dialog Inheritance

### Extend dialog cha với `sling:resourceSuperType`

Khi component extend component khác (ví dụ: core component), dialog có thể kế thừa từ cha. Fields, tabs và structure được merge tự động.

**Component `.content.xml`** phải reference cha:

```xml
<jcr:root
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="cq:Component"
    jcr:title="My Text"
    sling:resourceSuperType="core/wcm/components/text/v2/text"
    componentGroup="My Project"/>
```

**Dialog** — chỉ thêm tab mới, kế thừa toàn bộ tabs từ cha:

```xml
<!-- Thêm tab Analytics vào dialog kế thừa từ core text -->
<analytics
    jcr:primaryType="nt:unstructured"
    jcr:title="Analytics"
    sling:resourceType="granite/ui/components/coral/foundation/container"
    margin="{Boolean}true">
  <items jcr:primaryType="nt:unstructured">
    <trackingId
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
        fieldLabel="Tracking ID"
        name="./trackingId"/>
  </items>
</analytics>
```

### Ẩn tabs kế thừa với `sling:hideChildren`

```xml
<!-- Ẩn các tabs cụ thể theo tên -->
<items jcr:primaryType="nt:unstructured" sling:hideChildren="[layoutTab,stylesTab]">
  <!-- tabs của riêng bạn -->
</items>

<!-- Ẩn tất cả tabs kế thừa -->
<items jcr:primaryType="nt:unstructured" sling:hideChildren="[*]">
  <!-- chỉ tabs của bạn xuất hiện -->
</items>
```

### Ẩn một field với `granite:hide`

```xml
<unwantedField jcr:primaryType="nt:unstructured" granite:hide="{Boolean}true"/>
```

---

## cq:editConfig — Inline Editing, Listeners, Drop Targets

`_cq_editConfig.xml` nằm cạnh `_cq_dialog` và kiểm soát behavior của component trong edit mode: inline editors, drop zones, và client-side events sau khi save.

```text
components/mycomponent/
├── _cq_dialog/.content.xml      # dialog mở khi click "configure"
├── _cq_editConfig.xml           # inline editing + drop targets
└── mycomponent.html
```

### Drop Target cho Assets

Cho phép author drag image từ asset finder thẳng lên component.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:EditConfig">
  <cq:dropTargets jcr:primaryType="nt:unstructured">
    <image
        jcr:primaryType="cq:DropTargetConfig"
        accept="[image/.*]"
        groups="[media]"
        propertyName="./fileReference">
      <parameters
          jcr:primaryType="nt:unstructured"
          sling:resourceType="myproject/components/mycomponent"/>
    </image>
  </cq:dropTargets>
</jcr:root>
```

`propertyName` là nơi path của asset được drag lưu lại trên resource của component.

### Inline Editor

Cho phép edit text trực tiếp mà không cần mở dialog.

```xml
<cq:editConfig jcr:primaryType="cq:EditConfig">
  <cq:inplaceEditing
      jcr:primaryType="cq:InplaceEditingConfig"
      active="{Boolean}true"
      editorType="text">
    <config
        jcr:primaryType="nt:unstructured"
        editElementQuery=".cmp-mycomponent__title"
        propertyName="./title"
        textPropertyName="./title"/>
  </cq:inplaceEditing>
</cq:editConfig>
```

| `editorType` | Mô tả |
|---|---|
| `text` | Plain textfield inline editor |
| `plaintext` | Giống `text`, strip HTML khi save |
| `title` | Single line, Enter để save |

### Listeners (Refresh Behavior)

Mặc định AEM chỉ refresh component được edit. Nếu HTML của component phụ thuộc vào siblings (carousel, v.v.), dùng:

```xml
<cq:listeners
    jcr:primaryType="cq:EditListenersConfig"
    afteredit="REFRESH_PAGE"
    afterinsert="REFRESH_PAGE"
    afterdelete="REFRESH_PAGE"
    afterchildinsert="REFRESH_SELF"/>
```

::: warning REFRESH_PAGE là "búa tạ"
Mỗi thay đổi buộc full page reload — chậm và mất unsaved edits ở components khác. Ưu tiên `REFRESH_SELF` hoặc `REFRESH_PARENT`; chỉ dùng `REFRESH_PAGE` khi siblings thực sự phụ thuộc lẫn nhau.
:::

### Vô hiệu hóa Default Actions

Xóa nút "Copy" hoặc "Delete" khỏi component toolbar:

```xml
<cq:editConfig
    jcr:primaryType="cq:EditConfig"
    cq:actions="[edit,insert]"/>
```

Bỏ `copymove` và `delete` ẩn các nút đó. Default list là `[edit,copymove,delete,insert]`.

---

## Design Dialog (Template Policies)

`_cq_design_dialog` định nghĩa fields xuất hiện trong template editor (Edit Template > Policy). Values lưu trên template policy, không phải component instance — áp dụng cho tất cả instances dùng template đó.

```text
components/mycomponent/
├── _cq_dialog/.content.xml         # instance dialog (per component)
├── _cq_design_dialog/.content.xml  # design dialog (per template policy)
└── mycomponent.html
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="My Component - Policy"
    sling:resourceType="cq/gui/components/authoring/dialog">
  <content
      jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/container">
    <items jcr:primaryType="nt:unstructured">
      <tabs
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/tabs"
          maximized="{Boolean}true">
        <items jcr:primaryType="nt:unstructured">
          <properties
              jcr:primaryType="nt:unstructured"
              jcr:title="Settings"
              sling:resourceType="granite/ui/components/coral/foundation/container"
              margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
              <columns
                  jcr:primaryType="nt:unstructured"
                  sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                  margin="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                  <column
                      jcr:primaryType="nt:unstructured"
                      sling:resourceType="granite/ui/components/coral/foundation/container">
                    <items jcr:primaryType="nt:unstructured">
                      <headingLevel
                          jcr:primaryType="nt:unstructured"
                          sling:resourceType="granite/ui/components/coral/foundation/form/select"
                          fieldLabel="Default Heading Level"
                          name="./headingLevel">
                        <items jcr:primaryType="nt:unstructured">
                          <h2 jcr:primaryType="nt:unstructured" text="H2" value="h2" selected="{Boolean}true"/>
                          <h3 jcr:primaryType="nt:unstructured" text="H3" value="h3"/>
                          <h4 jcr:primaryType="nt:unstructured" text="H4" value="h4"/>
                        </items>
                      </headingLevel>
                      <maxItems
                          jcr:primaryType="nt:unstructured"
                          sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
                          fieldLabel="Max visible items"
                          fieldDescription="Limits the number of items an author can add"
                          name="./maxItems"
                          min="{Long}1"
                          max="{Long}20"
                          value="{Long}5"/>
                    </items>
                  </column>
                </items>
              </columns>
            </items>
          </properties>
        </items>
      </tabs>
    </items>
  </content>
</jcr:root>
```

---

## Layout & Read Only

Các components này không lưu data — dùng để trình bày thông tin hỗ trợ cho author trong dialog.

### Alert

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/alert/index.html)

```xml
<alert
    granite:class="cmp-editor-alert"
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/alert"
    size="S"
    jcr:title="Some-Title"
    text="Alert text"
    variant="warning"/>
```

- `variant`: `error`, `warning`, `success`, `help`, `info` (default).
- `size`: `S` (default) hoặc `L`.

![Alert trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/alert.png)

### Hyperlink

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/hyperlink/index.html)

```xml
<hyperlink
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/hyperlink"
    target="_blank"
    rel="noopener noreferrer"
    text="Granite Hyperlink Documentation"
    icon="link"
    href="https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/hyperlink/index.html"/>
```

![Hyperlink trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/hyperlink.png)

### Text

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/text/index.html)

Thêm text readonly — hữu ích cho "notes" hoặc declarative text giải thích cho author.

```xml
<text
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/text"
    text="Some help text :)"/>
```

![Text trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/text.png)

### Heading

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/heading/index.html)

```xml
<heading
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/heading"
    level="{Long}2"
    text="Some Heading"/>
```

![Heading trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/heading.png)

### Well

[Docs](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/well/index.html)

Group items lại với nhau theo visual, thêm background color và margin nhỏ. Khác `fieldset` ở chỗ không tạo subnode.

```xml
<wellGroup
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/well">
  <items jcr:primaryType="nt:unstructured">
    <textvalue1
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
        fieldLabel="Text Value"
        name="./textvalue"/>
    <somenumber
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
        fieldLabel="Number Value"
        name="./numbervalue2"/>
  </items>
</wellGroup>
```

![Well trong AEM Dialog](https://lucanerlich.com/images/aem/dialogfields/well.png)

### Collapsible Container

Dùng `accordion` với `maximized="{Boolean}false"` để tạo một section ẩn/hiện — hữu ích cho advanced settings.

```xml
<section
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/accordion"
    variant="default">
  <items jcr:primaryType="nt:unstructured">
    <group
        jcr:primaryType="nt:unstructured"
        jcr:title="Advanced"
        sling:resourceType="granite/ui/components/coral/foundation/container"
        maximized="{Boolean}false">
      <items jcr:primaryType="nt:unstructured">
        <!-- fields -->
      </items>
    </group>
  </items>
</section>
```

---

## MSM / Live Copy Considerations

MSM kế thừa blueprint page xuống Live Copy pages. Dùng `cq-msm-lockable` để cho Live Copy author kiểm soát per-field: unlock để break inheritance trên property đó, edit local, rồi lock lại để tiếp tục nhận updates từ blueprint.

```xml
<ctaText
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="CTA Text"
    name="./ctaText"
    cq-msm-lockable="ctaText"/>
```

**Quy tắc:**
- Giá trị của `cq-msm-lockable` là tên property cần lockable — dùng cùng tên với `./propertyName`, không có prefix `./`.
- Trong edit mode, Live Copy author thấy icon padlock. Click sẽ break inheritance cho property đó.
- Broken inheritance được lưu như mixin `cq:LiveSyncCancelled` — blueprint rollouts bỏ qua property bị mark cancelled.

**Multifield với MSM:**

```xml
<links
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    composite="{Boolean}true"
    cq-msm-lockable="links">
  <field
      jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/container"
      name="./links">
    <items jcr:primaryType="nt:unstructured">
      <label
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="Label"
          name="./label"
          cq-msm-lockable="label"/>
      <url
          jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
          fieldLabel="URL"
          name="./url"
          cq-msm-lockable="url"/>
    </items>
  </field>
</links>
```

::: warning Common Pitfall với MSM
Đặt `cq-msm-lockable` trên **mỗi field bên trong** multifield items, không phải trên multifield node. MSM chỉ lock được những gì nó biết là lockable.
:::

---

## Persisted Values & Defaults

- Dùng `./propertyName` để persist values trên component node.
- Khi đổi tên field, thêm migration logic hoặc fallback trong model.
- **Ưu tiên xử lý defaults trong Sling Model** thay vì dựa vào dialog defaults.

```java
@ValueMapValue
private String variant;

public String getVariant() {
    return StringUtils.defaultIfBlank(variant, "simple");
}
```

### Field Naming Conventions

- Luôn có prefix `./` để lưu values trên component node hiện tại.
- Dùng prefixes nhất quán cho related fields (ví dụ: `ctaText`, `ctaLink`).
- Tránh đổi tên field có sẵn trừ khi có migration content.

### Rich Text Editor

```xml
<text
    jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/richtext"
    name="./text"
    useFixedInlineToolbar="{Boolean}true">
  <uiSettings jcr:primaryType="nt:unstructured">
    <cui jcr:primaryType="nt:unstructured">
      <inline
          jcr:primaryType="nt:unstructured"
          toolbar="[format#bold,format#italic,links#modifylink,links#unlink,#paraformat]"/>
    </cui>
  </uiSettings>
</text>
```

- Giữ toolbar tối thiểu để giảm authoring noise.
- Dùng Styles plugin cho semantic markup thay vì inline formatting.

---

## Authoring UX Tips

- Đặt required fields sớm ở tab đầu tiên.
- Dùng `fieldDescription` cho hướng dẫn và ví dụ cụ thể.
- Ưu tiên nhiều tabs nhỏ tập trung thay vì một list dài.
- Giữ `name` ổn định — đổi tên properties ảnh hưởng tới existing content.
- Dùng `granite:class` tiết kiệm để cải thiện spacing hoặc emphasis.

---

## Tham khảo

- [Granite UI API — AEM 6.5](https://developer.adobe.com/experience-manager/reference-materials/6-5/granite-ui/api/jcr_root/libs/granite/ui/components/coral/foundation/server.html)
- [Dialog Validation deep-dive](https://lucanerlich.com/aem/components/dialog-validation/)
- [Custom Dialog Widgets — Dynamic PathField](https://lucanerlich.com/aem/ui/custom-dialog-widgets/)
