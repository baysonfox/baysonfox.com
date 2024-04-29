const postcssLightningcss = require("postcss-lightningcss")
const purgecss = require('@fullhuman/postcss-purgecss')({
	content: ['./hugo_stats.json'],
	defaultExtractor: content => {
	  const els = JSON.parse(content).htmlElements;
	  return [
		...(els.tags || []),
		...(els.classes || []),
		...(els.ids || []),
	  ];
	},
	variables: true,
	safelist: {
		standard: ['data-scheme', 'copyCodeButton', 'show-menu', 'is-active', 'show']
	}
  });
  
process.env.HUGO_ENVIRONMENT === 'production'
  ? optimize_enable = true // <-- default for `minify`
  : optimize_enable = false


  module.exports = {
	plugins: [
		// activate purgecss and postcssLightningcss when optimize_enable is true
		optimize_enable && purgecss,
		optimize_enable && postcssLightningcss({
			browsers: ">= 2%",
			lightningcssOptions: {
				minify: optimize_enable,
				cssModules: false,
				drafts: {
					nesting: true,
				}
			}
		})
	]
  };