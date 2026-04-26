import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'AEM Developer Notes',
  description: 'AEM 6.5 On-Premise — Technical notes for backend developers translated from Luca Nerlich Blog',
  lang: 'vi',

  // GitHub Pages (project page) serves under "/<repo>/".
  // Keep "/" for local dev, switch when building in GitHub Actions.
  base: process.env.GITHUB_ACTIONS ? '/aem-note/' : '/',

  lastUpdated: true,

  ignoreDeadLinks: [
    // localhost AEM links trong các file note
    /^http:\/\/localhost/,
  ],

  themeConfig: {
    logo: '/aem-logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      {text: 'Foundation', link: '/contents/foundation/introduction-to-aem'},
      { text: 'Content & Data', link: '/contents/content-and-data/1.aem-query-builder' },
      { text: 'Backend', link: '/contents/backend/osgi-configuration' },
      { text: 'Groovy Console', link: '/contents/tools/groovy-console' },
      { text: 'UI', link: '/contents/ui/coral-ui' },
      { text: 'Guide', link: '/guide' },
    ],

    sidebar: [
      {
        text: 'Foundation',
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
        text: 'Content & Data',
        collapsed: false,
        items: [
          { text: 'AEM Query Builder', link: '/contents/content-and-data/1.aem-query-builder' },
          { text: 'Node Operations', link: '/contents/content-and-data/node-operation' },
          { text: 'Query Builder Notes', link: '/contents/content-and-data/2.query-builder-note' },
          { text: 'Content Fragments', link: '/contents/content-and-data/content-fragment' },
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
          { text: 'Coral UI', link: '/contents/ui/coral-ui' },
          { text: 'Extending Responsive Grid', link: '/contents/ui/extending-responsive-grid' },
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
      { icon: 'bsky', link: 'https://bsky.app/profile/thnhan1.bsky.social' },
    ],

    editLink: {
      pattern: 'https://github.com/thnhan1/aem-note/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'AEM 6.5 On-Premise Developer Notes',
      copyright: '© 2026',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },

  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  mermaid: {
    theme: 'neutral',
    flowchart: {
      htmlLabels: true,
    },
  },
}))
