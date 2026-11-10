import { defineClientConfig } from 'vuepress/client'
import Tabs from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/Tabs.vue'
import CodeTabs from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/CodeTabs.vue'
import PDFViewer from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/PDFViewer.vue'
import VPVideoEmbed from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/VPVideoEmbed.vue'
import Plot from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/Plot.vue'
import FileTreeNode from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/components/FileTreeNode.vue'
import { setupMarkHighlight } from '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/composables/mark.js'

import '/Users/lishutong/Documents/lishutong1024.github.io/node_modules/.pnpm/vuepress-plugin-md-power@1.0.0-rc.174_esbuild@0.25.11_markdown-it@14.1.0_typescript@5.9.3_vue_zkm5jqyzqqqj7jjst2aalfmzgq/node_modules/vuepress-plugin-md-power/lib/client/styles/index.css'

export default defineClientConfig({
  enhance({ router, app }) {
    app.component('Tabs', Tabs)
    app.component('CodeTabs', CodeTabs)
    app.component('PDFViewer', PDFViewer)
    app.component('VPVideoEmbed', VPVideoEmbed)
    app.component('Plot', Plot)
    app.component('FileTreeNode', FileTreeNode)
  },
  setup() {
        setupMarkHighlight("eager")

  }
})
