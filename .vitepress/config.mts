import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'vitepress-carbon'
import baseConfig from 'vitepress-carbon/config'
import { withMermaid } from 'vitepress-plugin-mermaid'

declare const process: { env?: Record<string, string | undefined> } | undefined

export default withMermaid(defineConfigWithTheme<ThemeConfig>({
  extends: baseConfig,
  title: 'AEM Developer Notes',
  description: 'AEM 6.5 On-Premise — Technical notes for backend developers',
  lang: 'vi',

  // GitHub Pages (project page) serves under "/<repo>/".
  // We let the workflow inject it (so it works even if repo is renamed/forked).
  base: process?.env?.VITEPRESS_BASE ?? '/',

  lastUpdated: true,

  ignoreDeadLinks: [
    // localhost AEM links trong các file note
    /^http:\/\/localhost/,
  ],

  themeConfig: {
    logo: '/aem-logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Fundamental', link: '/contents/foundation/introduction-to-aem' },
      { text: 'Articles', link: '/contents/articles/aem-architecture' },
      { text: 'Backend', link: '/contents/backend/osgi-configuration' },
      { text: 'Content & Data', link: '/contents/content-and-data/1.aem-query-builder' },
      { text: 'UI', link: '/contents/ui/coral-ui' },
      { text: 'Guide', link: '/guide' },
    ],

    sidebar: [
      {
        text: 'Fundamental',
        collapsed: false,
        items: [
          { text: 'Introduction to AEM', link: '/contents/foundation/introduction-to-aem' },
          { text: 'JCR & Sling', link: '/contents/foundation/jcr-and-sling' },
          { text: 'OSGi Fundamentals', link: '/contents/foundation/osgi-fundamentals' },
          { text: 'Your First Component', link: '/contents/foundation/your-first-component' },
          { text: 'HTL Templates', link: '/contents/foundation/htl-templates' },
          { text: 'Component Dialogs', link: '/contents/foundation/component-dialogs' },
          { text: 'Sling Model', link: '/contents/foundation/sling-model' },
          { text: 'Templates & Policies', link: '/contents/foundation/templates-and-policies' },
          { text: 'Client Libraries', link: '/contents/foundation/client-libraries' },
          { text: 'Building Pages', link: '/contents/foundation/building-pages' },
          { text: 'Content Fragment & GraphQL', link: '/contents/foundation/content-fragments-and-graphql' },
        ],
      },
      {
        text: 'Articles',
        collapsed: true,
        items: [
          { text: 'AEM Architecture', link: '/contents/articles/aem-architecture' },
          { text: 'Touch UI Component Dialogs', link: '/contents/articles/component-dialogs' },
          { text: 'HTL Templates (Sightly)', link: '/contents/articles/htl-templates' },
          { text: 'Client Libraries', link: '/contents/articles/client-libraries' },
          { text: 'Groovy Console', link: '/contents/articles/groovy-console' },
        ],
      },

      {
        text: 'Content & Data',
        collapsed: false,
        items: [
          { text: 'AEM Query Builder', link: '/contents/content-and-data/1.aem-query-builder' },
          { text: 'Node Operations', link: '/contents/content-and-data/node-operation' },
          { text: 'Query Builder Notes', link: '/contents/content-and-data/2.query-builder-note' },
          { text: 'Content Fragments', link: '/contents/content-and-data/content-fragment' },
          { text: 'Content Fragments & GraphQL', link: '/contents/content-and-data/content-fragments-and-graphql' },
          { text: 'Headless GraphQL', link: '/contents/content-and-data/graphql' },
          { text: 'Replication & Activation', link: '/contents/content-and-data/replication-activation' },
          { text: 'Multi-Site Manager (MSM)', link: '/contents/content-and-data/multi-site-manager-msm' },
          { text: 'Modify & Query JCR', link: '/contents/content-and-data/modify-and-query-the-jcr' },
          { text: 'Tags & Taxonomies', link: '/contents/content-and-data/tags-taxonomies' },
          { text: 'i18n & Translation', link: '/contents/content-and-data/i18n-translation' },
          { text: 'Experience Fragments', link: '/contents/content-and-data/experience-fragment' },
        ],
      },
      {
        text: 'Backend',
        collapsed: false,
        items: [
          { text: 'OSGi Configuration', link: '/contents/backend/osgi-configuration' },
          { text: 'Servlets', link: '/contents/backend/servlets' },
          { text: 'Workflows', link: '/contents/backend/workflows' },
        ],
      },

      {
        text: 'UI',
        collapsed: false,
        items: [
          { text: 'Touch UI', link: '/contents/ui/touch-ui' },
          { text: 'Touch UI (v2)', link: '/contents/ui/touch-ui-2' },
          { text: 'Coral UI', link: '/contents/ui/coral-ui' },
          { text: 'Overlays', link: '/contents/ui/overlays' },
          { text: 'Render Conditions', link: '/contents/ui/render-conditions' },
          { text: 'Custom Dialog Widgets', link: '/contents/ui/custom-dialog-widgets' },
          { text: 'Multi-Tenancy UI Frontend', link: '/contents/ui/multi-tenancy-ui-frontend' },
          { text: 'Extending Responsive Grid', link: '/contents/ui/extending-responsive-grid' },
          { text: 'SPA Editor', link: '/contents/ui/spa-editor' },
        ],
      },
      {
        text: 'Infrastructure',
        collapsed: false,
        items: [
          { text: 'ACLs and Permissions', link: '/contents/infrastructure/acl-permissions' },
        ],
      },
      {
        text: 'Tools',
        collapsed: false,
        items: [
          { text: 'Groovy Console', link: '/contents/tools/groovy-console' },
        ],
      },
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Hướng dẫn thêm note', link: '/guide' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/thnhan1' },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Bluesky</title><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>'
        }, link: 'https://bsky.app/profile/huunhan.bsky.social'
      },
    ],

    editLink: {
      pattern: 'https://github.com/thnhan1/aem-docs/edit/main/:path',
      text: 'Chỉnh sửa trang này trên GitHub',
    },

    footer: {
      message: 'AEM 6.5 On-Premise Developer Notes',
      copyright: '© 2026',
    },

    outline: {
      level: [2, 3],
      label: 'Mục lục',
    },

    docFooter: {
      prev: 'Bài trước',
      next: 'Tiếp theo',
    },

  },

  markdown: {
    theme: {
      light: 'catppuccin-latte',
      dark: 'dracula',
    },
    lineNumbers: true,
  },

  mermaid: {
    theme: 'neutral',
    flowchart: {
      htmlLabels: true,
    },
  },

  vite: {
    optimizeDeps: {
      include: ['dayjs', 'dayjs/plugin/relativeTime'],
    },
  },
}))
